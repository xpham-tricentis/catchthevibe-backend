# CLAUDE.md — CatchTheVibe

This repo is the CatchTheVibe platform — Tricentis's internal portal for governed vibe coding. It is a full-stack application that also serves as the provisioning engine for new app repositories.

## What lives here

- **React SPA** (`src/App.jsx`) — the portal UI: governance docs, app registration, My Apps dashboard
- **Express API** (`src/server/`) — app registration, repo provisioning, auth middleware
- **Prisma schema** (`prisma/schema.prisma`) — User, App, Deployment, AccessGroup models
- **GitHub provisioning** (`src/server/services/github.js`) — Octokit wrapper for repo creation
- **`.claude/`** — the Claude Code pipeline including the `/app-scoping` skill
- **`local/`** — supporting specs and planning docs (not shipped)
- **`infra/`** — Terraform / IaC for Azure resources

---

## Repo Layout

```
catchthevibe/
├── CLAUDE.md                ← You are here
├── README.md
├── index.html               ← Vite entry point
├── vite.config.js           ← Vite config with /api proxy for dev
├── package.json
├── .env.example
├── Dockerfile               ← Multi-stage: Vite build → Express runtime
├── src/
│   ├── App.jsx              ← React frontend (single-file architecture)
│   ├── main.jsx             ← Entry point
│   ├── index.css            ← Minimal reset
│   └── server/              ← Express backend
│       ├── index.js         ← Express app entry (port 3001 dev / PORT env)
│       ├── prisma.js        ← Prisma client singleton (Azure MI in prod)
│       ├── middleware/
│       │   ├── auth.js      ← Reads X-Forwarded-Email, dev fallback
│       │   └── admin.js     ← Checks group membership for admin routes
│       ├── routes/
│       │   └── apps.js      ← POST /api/apps, POST /api/apps/download
│       └── services/
│           └── github.js    ← buildRepoName, createRepoFromTemplate, waitForRepoReady, getRepoZip
├── prisma/
│   └── schema.prisma
├── infra/
│   └── main.tf              ← Azure: ACR, Web App, identity, sidecar
├── local/                   ← Planning docs, specs (not shipped)
└── public/
```

---

## Tech Stack

### Frontend (`src/App.jsx`)
- **Language:** JavaScript (.jsx) — no TypeScript yet
- **Framework:** React 18 (functional components, hooks only)
- **Icons:** lucide-react — no other icon libraries
- **Styling:** Inline styles only — no CSS files, no Tailwind, no styled-components
- **Design system:** Aura tokens — see the `T` object at the top of App.jsx
- **State:** React useState/useReducer only — no external state management
- **Build:** Vite 6
- **Do not** use localStorage or sessionStorage
- **Do not** create new component files — everything stays in App.jsx

### Backend (`src/server/`)
- **Language:** JavaScript (.js) — no TypeScript yet
- **Framework:** Express 4
- **ORM:** Prisma 6 (PostgreSQL)
- **Auth:** Reads `X-Forwarded-Email` header from oauth2-proxy sidecar
- **Port:** `process.env.PORT`, defaults to 3001 locally
- **Do not** implement login/logout logic — the sidecar handles auth
- **Do not** write raw SQL — use Prisma
- **Do not** use eval(), exec(), or dynamic code execution

---

## Authentication Model

The portal does NOT implement auth. An oauth2-proxy sidecar handles OIDC with Entra ID.

**Headers used by auth middleware:**
- `X-Forwarded-Email` → user email (used as ID and display name)
- `X-Forwarded-User` → **DO NOT USE** — contains encoded YubiKey/sub value
- `X-Forwarded-Groups` → currently empty (groups claim removed to avoid 431 cookie errors; re-enable once Redis session storage is in place)

**Local development:** When `NODE_ENV=development` and no headers are present, auth middleware falls back to a dev user using `GITHUB_TEAM_NAME` from `.env`.

---

## The `/app-scoping` Skill

When a Tricentis employee clicks "Start a new app" in the portal, Claude Code invokes `/app-scoping`. The skill interviews the user to determine:

1. **Zone** — governance tier: `green`, `yellow`, or `red`
2. **Pattern** — architecture shape, which determines `stack` and `hosting`

At the end, it writes a `manifest.yaml`. The portal reads this to pre-populate the registration form and select the correct GitHub template.

**Portal-injected context** (passed into the Claude session at launch):

| Field | Placeholder | Source |
|---|---|---|
| App name | `{{APP_NAME}}` | Portal registration form |
| Owner email | `{{USER_EMAIL}}` | Entra ID email |
| Team | `{{USER_TEAM}}` | Entra ID profile |
| Cost center | `{{COST_CENTER}}` | HR system |

**Manifest schema** (maps to `App` table):
```yaml
name: "{{APP_NAME}}"
owner: "{{USER_EMAIL}}"
team: "{{USER_TEAM}}"
cost-center: "{{COST_CENTER}}"
zone: green|yellow|red
hosting: webapp|aks
stack:
  - react-spa
pattern: interactive-dashboard
created: YYYY-MM-DD
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ping` | None | Health check |
| POST | `/api/apps` | User | Register app — creates GitHub repo, returns URL |
| POST | `/api/apps/download` | User | Creates GitHub repo, returns zip download |

---

## Database Schema (`prisma/schema.prisma`)

- **User** — id (email), name, email, team, firstLogin, lastLogin
- **App** — name, displayName, team, zone, hosting, stack, status, hostname, costCenter, owner, repoUrl
- **Deployment** — appId, imageTag, status, triggeredBy, pipelineUrl, argoStatus, env0Status
- **AccessGroup** — appId, groupId, groupName, addedBy

`zone`, `stack`, `hosting`, `hostname`, `displayName` are nullable at creation — filled in at upload when the Team Agent analyzes the code.

---

## Repo Naming Convention

All provisioned repos follow `vibe-{team}-{app}`.

- In dev: team comes from `GITHUB_TEAM_NAME` env var (default: `dev`)
- In prod: team derived from SSO group membership once groups claim is restored
- GitHub constraints: letters, numbers, hyphens, underscores, periods. 10–100 chars total.

---

## Commands

```bash
npm install              # Install all dependencies
npm run dev              # Vite (port 5173) + Express (port 3001) concurrently
npm run dev:server       # Express only
npm run dev:client       # Vite only
npm run build            # Vite production build → dist/

npx prisma generate      # Regenerate Prisma client after schema changes
npx prisma db push       # Push schema to local database
npx prisma studio        # Visual database browser
```

---

## Design System (Aura Tokens)

All values in the `T` object at the top of `App.jsx`:

- **Backgrounds:** bgPage `#F4F4F5`, bgPaper `#FFFFFF`, bgHover `#FAFAFA`
- **Text:** textPrimary `#18181B`, textSecondary `#71717A`, textDisabled `#A1A1AA`
- **Primary:** primary `#3078C0`, primaryDark `#245E9A`, primaryLight `#D5E8F6`
- **Status:** success `#2D8630`, warning `hsla(23,80%,45%)`, error `#D32F2F`
- **Font:** `'Inter', sans-serif` / `'SF Mono', 'Fira Code', monospace`
- **Radii:** radiusXs 4, radiusSm 6, radiusMd 8, radiusLg 10

---

## Security Rules — Mandatory

- NEVER hardcode secrets, API keys, tokens, or credentials
- NEVER use eval(), exec(), or dynamic code execution
- ALWAYS validate and sanitise all inputs (frontend AND backend)
- ALWAYS encode output to prevent XSS
- NEVER log PII, secrets, or sensitive data
- All `/api/*` routes must use the auth middleware
- Use Prisma for all database access — no raw SQL
- If unsure, add a `// SECURITY-REVIEW` comment

---

## What NOT To Do

- Do not introduce new dependencies without being asked
- Do not change the styling system (inline styles + Aura tokens only)
- Do not refactor unrelated code while implementing a feature
- Do not remove or weaken existing security controls
- Do not implement login/logout logic — the sidecar handles it
- Do not write raw SQL — use Prisma
- Do not access the database from the frontend — always go through `/api/*`
- Do not use localStorage or sessionStorage
- Do not use `X-Forwarded-User` for display name — use email only

---

## Reference Docs (`local/`)

- `PORTAL_TECHNICAL_SPEC.md` — full portal spec (schema, routes, components)
- `PLATFORM_ARCHITECTURE.md` — 7-layer platform architecture
- `GITHUB_AUTOMATION.md` — GitHub App auth, provisioning steps, template specs
- `DECISIONS.md` — ADR log (ADR-001 through ADR-029)
- `DEPLOYMENT.md` — Azure resource inventory and operations
- `IMPLEMENTATION_PLAN.md` — download + upload workflow implementation plan
- `.claude/docs/` — app classification rules, architecture patterns, Claude project instructions
