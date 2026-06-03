# CatchTheVibe

Tricentis's internal portal for governed vibe coding. Full-stack app: React SPA (Vite) + Express API.

## Local setup

```bash
npm install
cp env.example .env
# Fill in .env — see Environment variables below
```

## Running locally

### Both frontend and backend (recommended)

```bash
npm run dev
```

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:3001`
- The Vite dev server proxies `/api/*` requests to Express automatically — no CORS config needed.

### Backend only

```bash
npm run dev:server
```

API available at `http://localhost:3001`.

### Frontend only

```bash
npm run dev:client
```

UI available at `http://localhost:5173`. API calls will fail without the backend running.

## Production build

```bash
npm run build   # outputs to dist/
npm start       # serves Express (which also serves the dist/ build)
```

## Environment variables

Copy `env.example` to `.env` and fill in the values.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Express port (default: `3001`) |
| `DATABASE_URL` | Dev only | PostgreSQL connection string for local dev |
| `GITHUB_TOKEN` | Yes | Personal Access Token with `repo` scope |
| `GITHUB_TEMPLATE_OWNER` | Yes | GitHub org/user that owns the template repo |
| `GITHUB_TEMPLATE_REPO` | Yes | Name of the template repo |
| `GITHUB_TARGET_OWNER` | Yes | GitHub org/user where new repos are created |
| `GITHUB_TEAM_NAME` | No | Team slug used in repo names (default: `dev`) |
| `GITHUB_PROVIDER` | No | `dev` (PAT auth) or `prod` (GitHub App) — default: `dev` |
| `GITHUB_REPO_PRIVATE` | No | `true` or `false` — default: `false` |
| `GITHUB_READY_TIMEOUT_MS` | No | Max ms to wait for repo to be ready (default: `60000`) |
| `GITHUB_POLL_INTERVAL_MS` | No | Polling interval in ms (default: `2000`) |

**Production-only (Azure):**

| Variable | Description |
|---|---|
| `AZURE_MANAGED_IDENTITY` | Set to `true` to use Managed Identity for DB auth |
| `AZURE_MI_CLIENT_ID` | Client ID of the user-assigned managed identity |
| `DB_HOST` | PostgreSQL server hostname |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user (Entra ID principal) |

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/ping` | None | Health check |
| `POST` | `/api/apps` | User | Register app — creates GitHub repo, returns URL |
| `POST` | `/api/apps/download` | User | Creates GitHub repo, returns zip download |

### `POST /api/apps`

Creates a GitHub repo from the template and returns the URL.

```bash
curl -X POST http://localhost:3001/api/apps \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-Email: you@example.com" \
  -d '{"projectName": "my-cool-app"}'
```

Response:
```json
{
  "appId": "clxyz...",
  "repoName": "vibe-dev-my-cool-app",
  "repoUrl": "https://github.com/org/vibe-dev-my-cool-app",
  "cloneUrl": "https://github.com/org/vibe-dev-my-cool-app.git",
  "instructions": "..."
}
```

### `POST /api/apps/download`

Creates a GitHub repo from the template and streams it as a zip file.

```bash
curl -X POST http://localhost:3001/api/apps/download \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-Email: you@example.com" \
  -d '{"projectName": "my-cool-app"}' \
  --output my-cool-app.zip
```

**Errors (both endpoints):**
- `400` — missing or invalid `projectName`
- `409` — repo with that name already exists
- `404` — template repo not found (check `.env`)
- `500` — unexpected error

## Database

```bash
npx prisma generate      # regenerate client after schema changes
npx prisma db push       # push schema to local database
npx prisma studio        # visual database browser
```
