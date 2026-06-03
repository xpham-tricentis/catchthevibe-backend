import express from 'express';
import { buildRepoName, createRepoFromTemplate, getRepoZip, waitForRepoReady } from '../services/github.js';
import prisma from '../prisma.js';

const router = express.Router();

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
  const { projectName } = req.body;

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

  // --- 2. Check for name conflict in the database ---
  const existing = await prisma.app.findUnique({ where: { name: repoName } });
  if (existing) {
    return res.status(422).json({ error: 'A project with that name already exists. Choose a different name.' });
  }

  try {
    // --- 3. Upsert user record ---
    await prisma.user.upsert({
      where:  { id: req.user.email },
      update: { lastLogin: new Date() },
      create: { id: req.user.email, name: req.user.name, email: req.user.email, team: req.user.team },
    });

    // --- 4. Create App record (status: provisioning) ---
    const app = await prisma.app.create({
      data: {
        name:      repoName,
        team:      req.user.team,
        status:    'provisioning',
        ownerId:   req.user.email,
        creatorId: req.user.email,
      },
    });

    // --- 5. Create GitHub repo from template ---
    console.log(`[create] Creating repo: ${repoName}`);
    const { repoOwner, repoUrl, cloneUrl } = await createRepoFromTemplate(trimmed);
    console.log(`[create] Repo created: ${repoUrl}`);

    // --- 6. Wait for the Actions bot commit ---
    console.log(`[create] Waiting for repo to be ready: ${repoOwner}/${repoName}`);
    await waitForRepoReady(repoOwner, repoName);

    // --- 7. Update App record with repo URL ---
    await prisma.app.update({
      where: { id: app.id },
      data:  { repoUrl },
    });

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

    if (err.status === 422) {
      return res.status(422).json({ error: 'A repo with that name already exists on GitHub. Choose a different name.' });
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
