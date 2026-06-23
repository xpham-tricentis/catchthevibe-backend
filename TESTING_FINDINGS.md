# CatchTheVibe — E2E Testing Findings

**Tester:** Michael Pham
**Date:** 2026-06-23
**Build under test:** `main`
**Environment:** Local dev — `npm run dev`, PostgreSQL via Docker, dev auth fallback. A local-only "Skip interview" bypass was used to exercise the post-intake flow without spending LLM credits (dev-gated, not in production builds).

## Scope of this session

End-to-end of the "Build an App" flow:
- Business intake agent conversation
- Manifest generation → project naming → GitHub repo creation (happy path ✓)
- Error / edge behavior around naming and repo creation
- UI rendering and interaction polish

> Note: zip-upload was **not** tested — that capability was removed on `main` (commit `68dd0e1`).

## Summary

| # | Finding | Area | Severity | Fix complexity |
|---|---------|------|----------|----------------|
| 1 | Chat input not auto-focused after agent reply | Intake UX | Low | Small |
| 2 | Page refresh wipes all intake progress | State / persistence (UX) | Low-Med | **Decision needed** |
| 3 | `/api/chat` assistant widget returns 404 | Assistant widget | Low | Small |
| 4 | No client-side repo-name validation or final-name preview | Naming UX | Low | Small |
| 5 | GitHub failure leaves an orphaned DB row that blocks retry | Data integrity | **High** | Medium |
| 6 | Agent markdown (`**bold**`, lists) renders as raw text | Intake rendering | Low | Small |

---

## 1. Chat input not auto-focused after agent reply

- **Severity:** Low (UX)
- **Observed:** After the agent finishes a message, the user must click into the input field before typing. Standard chat UIs let you type immediately.
- **Root cause:** The intake input (`src/App.jsx`, chatting phase) is `disabled` while streaming and focus is never restored when streaming ends.
- **Recommended fix:** Add `autoFocus` and a ref + effect that refocuses the input when `streaming` becomes `false`.

## 2. Page refresh wipes all intake progress

- **Severity:** Medium
- **Observed:** Refreshing mid-interview — or after manifest generation but before submitting the project name — loses all progress and returns to the intro screen.
- **Root cause:** `BuildPage` keeps conversation, manifest, and session entirely in React `useState`; nothing is persisted.
- **⚠️ Decision needed (not a straightforward fix):** The obvious fix (localStorage) is **explicitly prohibited** by `CLAUDE.md` ("Do not use localStorage or sessionStorage") and by the portal's own governance copy ("No PII in client-side storage") — and the manifest contains the owner's email and team. Options to discuss with Nicole:
  - **(a)** Accept as a known limitation for now (cheapest).
  - **(b)** Server-side session resume (the backend already holds the session messages keyed by `sessionId`; would require persisting the `sessionId` and a resume path — note current sessions are in-memory only).
  - **(c)** Revisit once SSO/browser-session is in place, if that changes the storage policy.

## 3. `/api/chat` assistant widget returns 404

- **Severity:** Low
- **Observed:** The "Catch the Vibe assistant" widget posts to `/api/chat`, which isn't implemented; the widget shows "Sorry, something went wrong: Not found."
- **Root cause:** The backend mounts only `/api/apps/scope` and `/api/apps` (`src/server/index.js`); `/api/chat` falls through to the 404 handler. A `STUB_RESPONSES` table exists in the frontend but is not wired into the live send path.
- **Recommended fix:** Add a minimal dummy `/api/chat` endpoint that returns a canned response over the existing SSE contract (preferred — keeps the streaming shape honest). Alternatively, fall back to the existing frontend stubs when the endpoint is unavailable.

## 4. No client-side repo-name validation or final-name preview

- **Severity:** Low (UX)
- **Observed:** The naming step accepts any input with no length feedback, and it's unclear what the final repo name will be. The final name is `vibe-{team}-{name}` and the 10–100 char rule is only enforced server-side (`src/server/routes/apps.js`), so the user only learns of a problem after submitting.
- **Recommended fix:**
  - Add a client-side minimum-length check before submit (note `vibe-dev-` is already 9 chars).
  - Show a live preview of the final repo name as the user types.
  - **Decision needed:** the frontend doesn't currently know the team (derived server-side from `GITHUB_TEAM_NAME`), so an exact preview needs the backend to expose the team, or we show `vibe-{team}-your-name` with `{team}` as a literal placeholder.

## 5. GitHub failure leaves an orphaned DB row that blocks retry

- **Severity:** High (data integrity)
- **Observed:** If repo creation fails downstream (e.g. GitHub error), the request returns an error but the database keeps a half-created record. Retrying the same name then fails with "already exists," permanently blocking that name.
- **Root cause:** In `src/server/routes/apps.js`, the user upsert and `app.create` (status `provisioning`) happen **before** the GitHub calls. On failure the catch returns 500 without removing the row, and the unique-name constraint then rejects retries. Post-creation failures (`waitForRepoReady` timeout, `writeManifest` throw) are the likely culprits — they also leave an orphan repo on GitHub.
- **⚠️ Nuance:** A `$transaction` alone won't fix this — GitHub repo creation is an external side effect that can't be rolled back inside a DB transaction. You can't make Postgres + GitHub atomic; the fix has to be recovery-based.

**Chosen fix — Approach A (reorder + adopt):**
1. **GitHub first, DB last** — persist the user + `App` row (with `repoUrl`) only after the repo is ready, wrapped in `$transaction`. If GitHub fails, nothing was written → retry is clean.
2. **Idempotent adopt** — if `createRepoFromTemplate` returns 422 "already exists" *and* the DB precheck found no completed row, adopt the existing repo (finish manifest + write DB row) instead of erroring. This is the recovery path that makes a half-finished attempt self-heal on retry.
3. **Adopt guard** — only adopt a repo that is template-derived and untouched (recent, commit count ≤ template+bot). If it has real content, refuse and ask for a different name — never clobber.

> **Safety invariant:** adopt only fires when there is **no** DB row, so a completed/owned app (which always has a row) is caught by the precheck → 422 and is *never* adopted. Worst case adopt touches an empty orphaned template clone.

> **Considered & rejected — Approach B (compensating delete):** keep current order, delete the row in `catch`. Equivalent only for *pre-creation* failures; for post-creation failures it deletes the row but leaves the orphan repo (no adopt = name stays blocked via GitHub 422, loops forever). Also depends on the catch actually running and on a cleanup that hits the same DB that may be failing. Less robust.

> **Related:** repo names are currently **not** namespaced by team — both `buildRepoName` and `auth.js` use a single `GITHUB_TEAM_NAME` env (per-team segment is a `// TODO` pending SSO groups). So different teams collide on the same app slug today; the adopt invariant above keeps that safe, but the namespace collision itself is worth flagging.

## 6. Agent markdown renders as raw text

- **Severity:** Low
- **Observed:** Agent messages contain markdown (e.g. `**Quick check before we start:**`, numbered/bulleted options) that displays with literal `**` and unformatted lists.
- **Root cause:** Messages are rendered as plain text (`src/App.jsx`, chatting phase — `{msg.text}` with `white-space: pre-wrap`); no markdown parsing.
- **Recommended fix:** A lightweight inline formatter for `**bold**` and simple lists, or strip the markers before display. No new dependency required (per `CLAUDE.md`).

---

## Out of scope / not yet covered (for a future session)

- Agent classification correctness across Green / Yellow / **Red** tiers, and manifest fidelity vs. answers.
- Conversational robustness (off-topic, contradictory answers) and tier-evasion prompt injection.
- Session lifecycle: expiry, invalid `sessionId`, and the in-memory session store's behavior across server restarts / multiple replicas.
- No automated test harness exists in the repo — all checks above were manual.
