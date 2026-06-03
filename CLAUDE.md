# CLAUDE.md — catchthevibe-backend

This repo is the **CatchTheVibe provisioning backend**. It receives requests from the CatchTheVibe portal and provisions new app repositories for Tricentis employees who want to build internal tools.

## What lives here

- **Express API** — handles app registration and repo provisioning requests from the portal
- **Prisma schema** — the App, Deployment, and AccessGroup models that track every provisioned app
- **`.claude/`** — the Claude Code pipeline for the `/app-scoping` skill

## The `/app-scoping` skill

The primary Claude Code entry point for this repo is `/app-scoping`.

When a Tricentis employee clicks "Start a new app" in the CatchTheVibe portal, the portal opens a Claude session and invokes `/app-scoping`. The skill interviews the user in plain language to determine two things:

1. **Zone** — the governance tier: `green`, `yellow`, or `red`
2. **Pattern** — the architecture shape, which determines `stack` and `hosting`

At the end of the interview, the skill writes a `manifest.yaml` file. The portal reads this manifest to pre-populate the app registration form and select the correct GitHub template repo for provisioning.

### Portal-injected session context

The portal passes the following values into the Claude session at launch. The skill uses these as-is — it does not ask the user for them:

| Field | Placeholder | Where it comes from |
|---|---|---|
| App name | `{{APP_NAME}}` | User enters in the portal registration form |
| Owner email | `{{USER_EMAIL}}` | Authenticated user's Entra ID email |
| Team | `{{USER_TEAM}}` | User's team from Entra ID profile |
| Cost center | `{{COST_CENTER}}` | User's cost center from HR system |

Until the portal injects real values, these appear as placeholder strings in the manifest output.

### Manifest schema

The `manifest.yaml` produced by `/app-scoping` maps directly to the `App` table in Prisma:

```yaml
name: "{{APP_NAME}}"          # → App.name
owner: "{{USER_EMAIL}}"       # → App.ownerId
team: "{{USER_TEAM}}"         # → App.team
cost-center: "{{COST_CENTER}}"# → App.costCenter
zone: green|yellow|red        # → App.zone
hosting: webapp|aks           # → App.hosting
stack:                        # → App.stack (comma-joined for DB storage)
  - react-spa
pattern: interactive-dashboard # human-readable label for portal UI
created: YYYY-MM-DD
```

**Note on `stack`:** The Prisma `App.stack` field is a single nullable string. When the manifest has multiple stack entries (paired patterns), the portal join them as a comma-separated string (e.g., `react-spa,node-api`) on write, and split on read.

## Reference docs

- `.claude/docs/business-app-classification.md` — the Green / Yellow / Red classification rules
- `.claude/docs/patterns/` — the 7 approved architecture patterns
