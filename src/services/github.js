import { Octokit } from '@octokit/rest';

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
// Currently: Personal Access Token from .env (dev)
// Later (Tricentis): swap to GitHub App JWT + installation token (prod).
// ---------------------------------------------------------------------------
function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set in environment');
  return new Octokit({ auth: token });
}

// ---------------------------------------------------------------------------
// Create a new repo from the template repo
// ---------------------------------------------------------------------------
export async function createRepoFromTemplate(projectName) {
  const octokit = getOctokit();

  const templateOwner = process.env.GITHUB_TEMPLATE_OWNER;
  const templateRepo  = process.env.GITHUB_TEMPLATE_REPO;
  const targetOwner   = process.env.GITHUB_TARGET_OWNER;

  if (!templateOwner || !templateRepo || !targetOwner) {
    throw new Error('GITHUB_TEMPLATE_OWNER, GITHUB_TEMPLATE_REPO, and GITHUB_TARGET_OWNER must be set');
  }

  // Sanitize: lowercase, replace spaces/underscores with hyphens, strip anything else
  const repoName = projectName
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 100);

  if (!repoName) throw new Error('Project name produced an empty repo name after sanitization');

  const { data } = await octokit.repos.createUsingTemplate({
    template_owner: templateOwner,
    template_repo:  templateRepo,
    owner:          targetOwner,
    name:           repoName,
    private:        process.env.GITHUB_REPO_PRIVATE === 'true',
    include_all_branches: false,
  });

  return {
    repoName:  data.name,
    repoOwner: data.owner.login,
    repoUrl:   data.html_url,
    cloneUrl:  data.clone_url,
  };
}

// ---------------------------------------------------------------------------
// Poll until the repo has >= 2 commits (template commit + Actions bot commit)
// ---------------------------------------------------------------------------
export async function waitForRepoReady(owner, repo) {
  const octokit  = getOctokit();
  const timeout  = parseInt(process.env.GITHUB_READY_TIMEOUT_MS  ?? '60000', 10);
  const interval = parseInt(process.env.GITHUB_POLL_INTERVAL_MS  ?? '2000',  10);
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const { data: commits } = await octokit.repos.listCommits({ owner, repo, per_page: 2 });
    if (commits.length >= 2) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Repo ${owner}/${repo} was not ready within ${timeout} ms`);
}

// ---------------------------------------------------------------------------
// Fetch the repo zip — DEV path (Octokit + PAT)
// ---------------------------------------------------------------------------
// Uses Octokit's raw request with parseSuccessResponseBody: false.
// Node 18+ returns a Web ReadableStream; this drains it into a Buffer.
// ---------------------------------------------------------------------------
async function getRepoZipDev(owner, repo) {
  const octokit = getOctokit();

  const response = await octokit.request('GET /repos/{owner}/{repo}/zipball', {
    owner,
    repo,
    request: {
      parseSuccessResponseBody: false,
    },
  });

  const data = response.data;

  if (data && typeof data.getReader === 'function') {
    const reader = data.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks.map(c => Buffer.from(c)));
  }

  if (data instanceof ArrayBuffer) return Buffer.from(data);
  return data;
}

// ---------------------------------------------------------------------------
// Fetch the repo zip — PROD path (placeholder for OktoKit / GitHub App auth)
// ---------------------------------------------------------------------------
// TODO: implement with GitHub App JWT + installation token
// ---------------------------------------------------------------------------
async function getRepoZipProd(owner, repo) {
  throw new Error('getRepoZipProd is not yet implemented');
}

// ---------------------------------------------------------------------------
// Public entry point — routed by GITHUB_PROVIDER env var
// ---------------------------------------------------------------------------
export async function getRepoZip(owner, repo) {
  const provider = process.env.GITHUB_PROVIDER ?? 'dev';

  if (provider === 'prod') return getRepoZipProd(owner, repo);
  return getRepoZipDev(owner, repo);
}
