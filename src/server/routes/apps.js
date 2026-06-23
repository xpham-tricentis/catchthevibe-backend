import express from 'express';
import { buildRepoName, createRepoFromTemplate, getRepo, getRepoZip, isRepoAdoptable, waitForRepoReady, writeManifest, writeTranscript } from '../services/github.js';
import { deleteSession, getSessionMessages } from './scope.js';
import prisma from '../prisma.js';

const router = express.Router();

const INITIAL_USER_MESSAGE = "Hi, I'd like to start a new app.";

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return String(content ?? '');
  return content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n\n');
}

function formatTranscript(messages, sessionId) {
  const trimmed = messages[0]?.content === INITIAL_USER_MESSAGE ? messages.slice(1) : messages;
  const today = new Date().toISOString().slice(0, 10);

  const blocks = trimmed.map(msg => {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    return `## ${role}\n\n${extractText(msg.content)}\n`;
  });

  return [
    '# App Scoping Session Transcript',
    '',
    `Generated: ${today}`,
    `Session ID: ${sessionId}`,
    '',
    '---',
    '',
    blocks.join('\n---\n\n'),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// POST /api/apps
//
// Body: { projectName: string }
//
// Creates a new GitHub repo from the template, waits for it to be ready,
// and returns the repo URL + clone instructions to the UI.
// No zip download — the user clones the repo and vibe-codes locally.
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  const { projectName, manifest, sessionId } = req.body;

  // --- 1. Validate input ---
  if (!projectName || typeof projectName !== 'string') {
    return res.status(400).json({ error: 'projectName is required' });
  }

  const trimmed = projectName.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'projectName cannot be empty' });
  }

  let repoName;
  try {
    ({ repoName } = buildRepoName(trimmed));
  } catch {
    return res.status(400).json({ error: 'projectName produced an empty repo name after sanitization' });
  }

  if (repoName.length < 10 || repoName.length > 100) {
    return res.status(400).json({
      error: `Resulting repo name "${repoName}" must be between 10 and 100 characters`,
    });
  }

  try {
    // --- 2. Reject if a COMPLETED app already owns this name ---
    // A finished app always has a DB row, so this is what protects real apps
    // from ever being touched by the adopt path below.
    const existing = await prisma.app.findUnique({ where: { name: repoName } });
    if (existing) {
      return res.status(422).json({ error: 'A project with that name already exists. Choose a different name.' });
    }

    // --- 3. Create the GitHub repo FIRST — nothing is persisted to the DB yet,
    // so any failure here leaves no orphan row and the next attempt is clean. ---
    const targetOwner = process.env.GITHUB_TARGET_OWNER;
    let repoOwner, repoUrl, cloneUrl;
    try {
      console.log(`[create] Creating repo: ${repoName}`);
      ({ repoOwner, repoUrl, cloneUrl } = await createRepoFromTemplate(trimmed));
      console.log(`[create] Repo created: ${repoUrl}`);
    } catch (err) {
      if (err.status !== 422) throw err;
      // Repo exists on GitHub but (per step 2) has no DB row — almost certainly
      // an orphan from a prior failed attempt. Adopt it so the flow self-heals,
      // but only if it's an untouched template clone — never clobber real work.
      console.warn(`[create] Repo ${repoName} already exists on GitHub — checking if adoptable`);
      if (!(await isRepoAdoptable(targetOwner, repoName))) {
        return res.status(422).json({ error: 'A repo with that name already exists. Choose a different name.' });
      }
      ({ repoOwner, repoUrl, cloneUrl } = await getRepo(targetOwner, repoName));
      console.log(`[create] Adopting existing repo: ${repoUrl}`);
    }

    // --- 4. Wait for the Actions bot commit ---
    console.log(`[create] Waiting for repo to be ready: ${repoOwner}/${repoName}`);
    await waitForRepoReady(repoOwner, repoName);

    // --- 5. Commit manifest.yaml if provided (idempotent) ---
    if (manifest && typeof manifest === 'string' && manifest.trim()) {
      console.log(`[create] Writing manifest.yaml to ${repoOwner}/${repoName}`);
      await writeManifest(repoOwner, repoName, manifest.trim());
    }

    // --- 5a. Commit scoping transcript (beta — gated by env var) ---
    if (process.env.CAPTURE_SCOPING_TRANSCRIPT === 'true' && sessionId) {
      const messages = getSessionMessages(sessionId);
      if (messages?.length) {
        try {
          console.log(`[create] Writing scoping transcript to ${repoOwner}/${repoName}`);
          await writeTranscript(repoOwner, repoName, formatTranscript(messages, sessionId));
        } catch (err) {
          // Non-fatal — don't fail the request if the transcript commit fails.
          console.error(`[create] Transcript commit failed: ${err.message}`);
        }
      } else {
        console.warn(`[create] Transcript capture skipped — no session found for ${sessionId}`);
      }
    }

    // --- 6. Persist user + App atomically, only after the repo is ready ---
    let app;
    try {
      const [, createdApp] = await prisma.$transaction([
        prisma.user.upsert({
          where:  { id: req.user.email },
          update: { lastLogin: new Date() },
          create: { id: req.user.email, name: req.user.name, email: req.user.email, team: req.user.team },
        }),
        prisma.app.create({
          data: {
            name:      repoName,
            team:      req.user.team,
            status:    'provisioning',
            repoUrl,
            ownerId:   req.user.email,
            creatorId: req.user.email,
          },
        }),
      ]);
      app = createdApp;
    } catch (err) {
      // Unique-name race (double-submit / concurrent request) — benign.
      if (err.code === 'P2002') {
        return res.status(422).json({ error: 'A project with that name already exists. Choose a different name.' });
      }
      throw err;
    }

    // --- 7. End the scoping session — its purpose is done (best-effort) ---
    if (sessionId) deleteSession(sessionId);

    console.log(`[create] Done — ${repoUrl}`);

    return res.status(201).json({
      appId:    app.id,
      repoName,
      repoUrl,
      cloneUrl,
      instructions: [
        'Your repo is ready. Clone it and start vibe coding with Claude:',
        `  git clone ${cloneUrl}`,
        "When you're done, zip your project folder and upload it through the portal to deploy.",
      ].join('\n'),
    });

  } catch (err) {
    console.error('[create] Error:', err.message);

    if (err.status === 404) {
      const hint = process.env.NODE_ENV !== 'production'
        ? ' Check GITHUB_TEMPLATE_OWNER and GITHUB_TEMPLATE_REPO in .env'
        : '';
      return res.status(404).json({ error: `Template repo not found.${hint}` });
    }

    res.status(500).json({ error: 'Failed to create project. Please try again.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/apps/download
//
// Body: { projectName: string }
//
// Flow:
//   1. Validate projectName
//   2. Create a new repo on GitHub from the template
//   3. Wait briefly for GitHub to finish initialising the repo
//   4. Fetch the repo as a zip archive
//   5. Stream the zip back to the client as a download
// ---------------------------------------------------------------------------
router.post('/download', async (req, res) => {
  const { projectName } = req.body;

  // --- 1. Validate input ---
  if (!projectName || typeof projectName !== 'string') {
    return res.status(400).json({ error: 'projectName is required' });
  }

  const trimmed = projectName.trim();

  if (!trimmed) {
    return res.status(400).json({ error: 'projectName cannot be empty' });
  }

  // Compute and validate the full repo name before hitting GitHub.
  let repoName;
  try {
    ({ repoName } = buildRepoName(trimmed));
  } catch {
    return res.status(400).json({ error: 'projectName produced an empty repo name after sanitization' });
  }

  if (repoName.length < 10 || repoName.length > 100) {
    return res.status(400).json({
      error: `Resulting repo name "${repoName}" must be between 10 and 100 characters`,
    });
  }

  try {
    // --- 2. Create repo from template ---
    console.log(`[download] Creating repo for project: "${trimmed}"`);
    const { repoName, repoOwner, repoUrl } = await createRepoFromTemplate(trimmed);
    console.log(`[download] Repo created: ${repoUrl}`);

    // --- 3. Wait for the Actions bot to finish initialising the repo ---
    // The template triggers a GitHub Actions workflow that pushes a second commit.
    // We poll until >= 2 commits exist before fetching the zip.
    console.log(`[download] Waiting for repo to be ready: ${repoOwner}/${repoName}`);
    await waitForRepoReady(repoOwner, repoName);

    // --- 4. Fetch the zip ---
    console.log(`[download] Fetching zip for ${repoOwner}/${repoName}`);
    const zipData = await getRepoZip(repoOwner, repoName);

    // --- 5. Stream zip to client ---
    const filename = `${repoName}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(zipData);

    console.log(`[download] Sent ${filename} to client`);

  } catch (err) {
    console.error('[download] Error:', err.message);

    // Surface GitHub API errors clearly
    if (err.status === 422) {
      return res.status(422).json({
        error: 'A repo with that name already exists. Choose a different project name.',
      });
    }

    if (err.status === 404) {
      const hint = process.env.NODE_ENV !== 'production'
        ? ' Check GITHUB_TEMPLATE_OWNER and GITHUB_TEMPLATE_REPO in .env'
        : '';
      return res.status(404).json({ error: `Template repo not found.${hint}` });
    }

    res.status(500).json({ error: 'Failed to create project. Please try again.' });
  }
});

export default router;
