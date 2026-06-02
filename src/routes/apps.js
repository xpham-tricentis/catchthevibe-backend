import express from 'express';
import { createRepoFromTemplate, getRepoZip, waitForRepoReady } from '../services/github.js';

const router = express.Router();

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

  if (trimmed.length < 2) {
    return res.status(400).json({ error: 'projectName must be at least 2 characters' });
  }

  if (trimmed.length > 100) {
    return res.status(400).json({ error: 'projectName must be 100 characters or fewer' });
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
