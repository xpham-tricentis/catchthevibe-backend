# catchthevibe-backend

Express API powering the CatchTheVibe portal backend. Currently handles repo provisioning from a GitHub template and serving the result as a zip download.

## Setup

```bash
npm install
cp .env.example .env
# Fill in .env with your GitHub token and repo details
```

## Run locally

```bash
npm run dev
```

API runs on `http://localhost:3001`.

## Environment variables

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Personal Access Token with `repo` scope |
| `GITHUB_TEMPLATE_OWNER` | GitHub username/org that owns the template repo |
| `GITHUB_TEMPLATE_REPO` | Name of the template repo |
| `GITHUB_TARGET_OWNER` | GitHub username/org where new repos are created |
| `PORT` | Port to run on (default: 3001) |

## API

### `POST /api/apps/download`

Creates a new GitHub repo from the template and returns it as a zip file download.

**Body:**
```json
{ "projectName": "my-cool-app" }
```

**Response:** `application/zip` file download named `my-cool-app.zip`

**Errors:**
- `400` — missing or invalid projectName
- `422` — repo with that name already exists on GitHub
- `404` — template repo not found (check your .env)
- `500` — unexpected error

### `GET /ping`

Health check. Returns `{ "ok": true }`.

## Testing with curl

```bash
curl -X POST http://localhost:3001/api/apps/download \
  -H "Content-Type: application/json" \
  -d '{"projectName": "test-project"}' \
  --output test-project.zip
```

## What changes when moving to Tricentis

1. `GITHUB_TOKEN` → swap for GitHub App private key + Key Vault retrieval in `services/github.js`
2. `GITHUB_TARGET_OWNER` → set to the Tricentis org name
3. Add auth middleware to routes (oauth2-proxy sidecar will inject `X-Forwarded-User` header)
4. Wire in Prisma to record app registrations to the database
