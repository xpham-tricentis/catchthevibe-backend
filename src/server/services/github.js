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
// Build the repo name from a project name.
// Convention: vibe-{team}-{app}
// GitHub rules: letters, numbers, hyphens, underscores, periods. Max 100 chars.
// Returns { repoName, appSegment, team } — throws if appSegment is empty.
// ---------------------------------------------------------------------------
export function buildRepoName(projectName) {
  const team       = process.env.GITHUB_TEAM_NAME || 'dev';
  const appSegment = projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^[._-]+|[._-]+$/g, '');

  if (!appSegment) throw new Error('projectName produced an empty repo name after sanitization');

  return { repoName: `vibe-${team}-${appSegment}`, appSegment, team };
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

  const { repoName } = buildRepoName(projectName);

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
    try {
      const { data: commits } = await octokit.repos.listCommits({ owner, repo, per_page: 2 });
      if (commits.length >= 2) return;
    } catch (err) {
      // 409 = repo exists but git is not yet initialised — keep waiting
      if (err.status !== 409) throw err;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Repo ${owner}/${repo} was not ready within ${timeout} ms`);
}

// ---------------------------------------------------------------------------
// Fetch basic repo info. Used by the adopt path when the repo already exists.
// ---------------------------------------------------------------------------
export async function getRepo(owner, repo) {
  const octokit = getOctokit();
  const { data } = await octokit.repos.get({ owner, repo });
  return {
    repoName:  data.name,
    repoOwner: data.owner.login,
    repoUrl:   data.html_url,
    cloneUrl:  data.clone_url,
  };
}

// ---------------------------------------------------------------------------
// Decide whether an existing repo is safe to adopt.
//
// On retry after a failed provisioning attempt, the repo may already exist on
// GitHub with no DB row. Adopting it lets the flow self-heal — but ONLY if it
// looks like an untouched template clone (recent, and at most the template +
// Actions bot commits). Anything with real history is refused so we never
// commit into a repo that already holds someone's work.
// ---------------------------------------------------------------------------
export async function isRepoAdoptable(owner, repo) {
  const octokit = getOctokit();
  const MAX_ADOPTABLE_COMMITS = 3;        // template commit + Actions bot commit, with margin
  const MAX_ADOPTABLE_AGE_MS  = 24 * 60 * 60 * 1000;

  const { data: commits } = await octokit.repos.listCommits({
    owner, repo, per_page: MAX_ADOPTABLE_COMMITS + 1,
  });
  if (commits.length > MAX_ADOPTABLE_COMMITS) return false;

  const { data: meta } = await octokit.repos.get({ owner, repo });
  const ageMs = Date.now() - new Date(meta.created_at).getTime();
  return ageMs <= MAX_ADOPTABLE_AGE_MS;
}

// ---------------------------------------------------------------------------
// Commit manifest.yaml to a repo. Idempotent: if the file already exists
// (e.g. on an adopted repo) it is updated rather than failing.
// ---------------------------------------------------------------------------
export async function writeManifest(owner, repo, content) {
  const octokit = getOctokit();

  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: 'manifest.yaml' });
    if (!Array.isArray(data)) sha = data.sha;
  } catch (err) {
    if (err.status !== 404) throw err; // 404 = file doesn't exist yet, which is fine
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: 'manifest.yaml',
    message: 'chore: add app manifest',
    content: Buffer.from(content, 'utf8').toString('base64'),
    ...(sha ? { sha } : {}),
  });
}

// ---------------------------------------------------------------------------
// Commit the scoping session transcript to a repo (beta only)
// ---------------------------------------------------------------------------
export async function writeTranscript(owner, repo, content) {
  const octokit = getOctokit();
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: '.catchthevibe/scoping-transcript.md',
    message: 'chore: capture scoping session transcript',
    content: Buffer.from(content, 'utf8').toString('base64'),
  });
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
