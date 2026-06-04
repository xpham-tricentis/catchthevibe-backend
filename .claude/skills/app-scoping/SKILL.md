---
name: app-scoping
description: Guides a non-technical Tricentis employee through a plain-language interview to determine their app's governance tier (Green, Yellow, or Red) and architecture pattern. Produces a manifest.yaml file that the CatchTheVibe portal uses to pre-populate app registration and select the correct GitHub template repo. Invoked automatically when the portal opens a new Claude session for app registration. Trigger on /app-scoping or phrases like "start a new app", "I want to build something", "scope my app", "what kind of app do I need".
---

# App Scoping Skill

This skill conducts a short, plain-language interview and produces a `manifest.yaml` file containing two decisions the CatchTheVibe portal needs before it can provision a repo:

1. **Zone** — governance tier: `green`, `yellow`, or `red`
2. **Pattern** — architecture shape, which determines `stack` and `hosting`

Reference docs used by this skill:
- `.claude/docs/business-app-classification.md` — the authoritative Green / Yellow / Red rules
- `.claude/docs/patterns/` — descriptions of all 7 approved architecture patterns

---

## Portal-injected context

When invoked from the CatchTheVibe portal, the following values are passed into the session. Do NOT ask the user for these — use whatever the portal provides, or substitute the placeholder tokens below if running outside the portal.

| Field | Placeholder | Source |
|---|---|---|
| App name | `{{APP_NAME}}` | Portal registration form |
| Owner email | `{{USER_EMAIL}}` | Entra ID — authenticated user |
| Team | `{{USER_TEAM}}` | Entra ID profile |
| Cost center | `{{COST_CENTER}}` | HR system |

---

## Interview procedure

Conduct the interview **one question at a time**. Show the options as a numbered list. Wait for the user's answer before moving on. Do not display all questions at once.

**Keep the interview concise — never ask a question whose answer is already implied by an earlier answer.** Several questions below have explicit skip rules; honor them, and use judgement to skip or fold any further question whose answer is unambiguous from prior context.

Begin with this introduction (or something close to it):

> "Before I set up your new app, I'm going to ask you a handful of short questions. The goal is to figure out what kind of app this is and what shape it should take. No technical knowledge needed — just answer in plain language. Let's go."

---

### Gate check — ask this first, before anything else

**Q0:** "Quick check before we start: will this app ever be used by customers, partners, or anyone outside of Tricentis?"

1. No — this is for internal Tricentis use only
2. Possibly, or I'm not sure

**If the user selects 2 or expresses any uncertainty:** Stop the interview immediately. Tell the user:

> "CatchTheVibe is designed for internal Tricentis apps only. Apps that could be seen by customers or partners go through a different approval process. Please reach out to your IT Solution Team contact or the Enterprise Architecture team for next steps."

Do not continue. Do not produce a manifest.

**If the user selects 1:** Continue.

---

### Section 1 — Scope and criticality (determines zone)

**Q1:** "Who will use this app?"

1. Just my team — a small group of people who work closely together
2. Multiple teams within my department
3. Multiple departments, or most of the organization
4. Practically anyone at the company

Record internally as:
- 1 → `scope: team`
- 2 → `scope: department`
- 3 → `scope: organization`
- 4 → `scope: company`

---

**Q2:** "When someone uses this app, will it *change* anything outside the browser — like saving a record, sending a message, creating a ticket, or updating a spreadsheet? Or will it mostly just show information?"

1. It will just show or display information — nothing gets changed
2. It will save, update, or send things
3. Both — people can look things up AND make changes

Record internally as:
- 1 → `writes: false`
- 2 or 3 → `writes: true`

---

**Q3:** "What kind of information will it work with? Select all that apply:"

1. Public info — things you'd find on the internet (docs, announcements, public reports)
2. Internal business data — deals, projects, metrics, team info
3. Personal info about employees — names, emails, HR data, org charts
4. Financial or regulated data — budgets, invoices, payment info, compliance records

Record internally using the highest sensitivity level selected:
- Only 1 or 2 → `data_sensitivity: internal`
- 3 selected → `data_sensitivity: pii`
- 4 selected → `data_sensitivity: regulated`

---

**Q4:** "If this app went down for a full business day, what would happen?"

1. People would work around it — low impact, the team manages
2. A team would be slowed down, but could get by
3. It would cause a real business problem — missed deadlines, compliance issues, or lost money

Record internally as:
- 1 → `downtime_impact: low`
- 2 → `downtime_impact: medium`
- 3 → `downtime_impact: high`

---

**Q5:** "How long do you expect to rely on this?"

1. Just to try an idea — this is exploratory, might throw it away
2. For the next few months
3. Long-term — this will become part of how we work, possibly for years

Record internally as:
- 1 → `longevity: disposable`
- 2 → `longevity: months`
- 3 → `longevity: durable`

---

**Q6:** "Will people expect this to be available 24/7 — like a critical business system that pages someone if it goes down?"

1. Yes — people will expect it to always be available
2. No — some downtime is acceptable

**Skip this question and infer the answer from Q4:**
- Q4 was `downtime_impact: high` → record `sla_expected: true` automatically
- Q4 was `downtime_impact: low` → record `sla_expected: false` automatically
- Only ask Q6 when Q4 was `downtime_impact: medium`.

Record internally as:
- 1 → `sla_expected: true`
- 2 → `sla_expected: false`

---

### Section 2 — Shape and technology (determines pattern, stack, hosting)

**Q7:** "What kicks off the work in this app?"

1. A person visits the app or clicks a button
2. Another system sends it a signal automatically — a webhook, an API call, or a data event
3. A schedule — it runs at a set time, like every morning or every hour
4. Something happening upstream — like an order being placed, a file being dropped, or an event in another system

Record internally as:
- 1 → `trigger: human`
- 2 → `trigger: system`
- 3 → `trigger: schedule`
- 4 → `trigger: event`

---

**Q8:** "When a person uses this, what are they doing? Pick the closest match:"

1. Reading information on a page — no login needed, nothing interactive
2. Logging in and doing things — clicking, filtering, filling forms, editing
3. There's no person using it directly — it's driven by another system or a schedule

Skip this question and record `ui_type: none` automatically if Q7 was answered as `trigger: schedule`, `trigger: event`, or `trigger: system` — none of those involve a person directly using the app.

Record internally as:
- 1 → `ui_type: read_only`
- 2 → `ui_type: interactive`
- 3 → `ui_type: none`

---

**Q9:** "Does the app need to *remember* things between sessions — like keeping a record history, storing user settings, or maintaining data over time?"

1. Yes — it needs to save things durably (a database, records that persist)
2. Browser only is fine — temporary storage that clears when you close the window
3. No — each request is independent, nothing needs to be saved

Record internally as:
- 1 → `persistence: durable`
- 2 → `persistence: browser`
- 3 → `persistence: none`

---

**Q10:** "Does it need to do slow or heavy work in the background while someone keeps going — like processing a large file, sending emails to many people, or running a long calculation?"

1. Yes — some tasks take a long time and should run in the background
2. No — everything finishes fast enough that the user can wait

Record internally as:
- 1 → `background_work: true`
- 2 → `background_work: false`

---

**Q11:** "What kind of work is this, mostly?"

1. Connecting systems — moving data between tools, syncing records, handling webhooks
2. Analyzing or transforming data — reports, calculations, data pipelines, ML, automation
3. Displaying content or information — publishing guides, docs, or announcements
4. Building something people click around in — a tool, a dashboard, an interactive interface
5. A mix of these

Record internally as:
- 1 → `work_type: integration`
- 2 → `work_type: data`
- 3 → `work_type: content`
- 4 → `work_type: interactive`
- 5 → `work_type: mixed`

---

**Q12 — only ask if `trigger: system` OR `work_type: data`:**

"Will an AI assistant — like Claude or an internal copilot — be calling this, or is it humans and other software systems?"

1. An AI agent will be calling it
2. Humans and regular software systems
3. Both

Record internally as:
- 1 → `consumer: ai`
- 2 → `consumer: human_software`
- 3 → `consumer: both`

If this question is skipped, default to `consumer: human_software`.

---

## Classification logic

After all questions are answered, compute zone and pattern. Do this silently — show the user the result, not the calculation.

### Zone (apply in order — first match wins)

**RED** if any of the following are true:
- `sla_expected: true`
- `scope: company`
- `scope: organization` AND `writes: true`
- `data_sensitivity: regulated` AND `writes: true`
- `downtime_impact: high`

**YELLOW** if any of the following are true (and RED was not triggered):
- `writes: true`
- `scope: department` OR `scope: organization`
- `persistence: durable`
- `data_sensitivity: pii`
- `longevity: durable`

**GREEN** if none of the above apply.

---

### Pattern (apply in order — first match wins)

| Condition | Pattern | `stack` | `hosting` | `pattern` value |
|---|---|---|---|---|
| `trigger: schedule` | Scheduled Job Service | `[python-api]` | `aks` | `scheduled-job` |
| `trigger: event` | Event-Driven Service | `[python-api]` | `aks` | `event-driven` |
| `trigger: human` AND `background_work: true` AND `persistence: durable` | Multi-Container Service | `[react-spa, python-api]` | `aks` | `multi-container` |
| `ui_type: read_only` AND `work_type: content` | Content Website | `[static-site]` | `webapp` | `content-website` |
| `ui_type: interactive` AND `work_type: data` | Interactive Dashboard + Data & Automation Service | `[react-spa, python-api]` | `webapp` | `interactive-dashboard` |
| `ui_type: interactive` AND (`work_type: integration` OR `consumer: ai` OR `consumer: both`) | Interactive Dashboard + Integration Service | `[react-spa, node-api]` | `webapp` | `interactive-dashboard` |
| `ui_type: interactive` | Interactive Dashboard App | `[react-spa]` | `webapp` | `interactive-dashboard` |
| `trigger: system` AND `work_type: data` | Data & Automation Service | `[python-api]` | `webapp` | `data-automation` |
| `trigger: system` AND `work_type: integration` | Integration Service | `[node-api]` | `webapp` | `integration-service` |
| fallback | Interactive Dashboard App | `[react-spa]` | `webapp` | `interactive-dashboard` |

**Fallback:** If no condition matches cleanly, default to Interactive Dashboard App and flag the ambiguity to the user at the review gate.

---

### Extras (compute after zone and pattern — silently)

Extras are additional Azure resources the platform will provision beyond what the standard pattern provides. Compute from interview answers. If none apply, `extras` is an empty list.

| Add this extra | When |
|---|---|
| `database` | `persistence: durable` |
| `background_queue` | `background_work: true` AND `work_type` is `data`, `integration`, or `mixed` |
| `storage_account` | `persistence: durable` AND `work_type: data` |
| `key_vault_policy` | `data_sensitivity: regulated` |

Note: `storage_account` and `database` can both be present. `key_vault_policy` can appear alongside any other extra.

---

### Next steps (compute after zone and extras — silently)

`next_steps` is the routing signal the CatchTheVibe portal reads to determine what to show the user after the manifest is confirmed.

| Condition | `next_steps` value |
|---|---|
| `zone: red` | `red-escalate` |
| `zone: yellow` | `yellow-ea-review` |
| `zone: green` AND extras list is not empty | `green-with-extras` |
| `zone: green` AND extras list is empty | `green-ready` |

---

## Review gate

After computing zone and pattern, present a plain-language summary. Do not show the raw field values — translate them for the user.

Use this structure (adapt the wording naturally):

```
Here's what I've figured out based on your answers:

**[Zone label] app**
[One-sentence plain-language explanation — e.g., "This is a Yellow app because it
saves data and will be used by multiple teams."]

**[Pattern display name]**
[One-sentence description of what this means in plain language — e.g., "An
Interactive Dashboard — a web app your team logs into to view and manage
information."]

**What this means for you:**
• [One implication of the zone — see zone-specific bullets below.]
• [One implication of the pattern — e.g., "The tech stack will be React for
  the UI with a Python backend for the data work."]
• [One bullet per extra, if any — see extras bullets below. Omit this line if
  extras is empty.]

**What happens next:**
[One sentence derived from next_steps — see next_steps wording below.]

Does this sound right? If something seems off, tell me what's wrong and I'll adjust.
```

**Zone-specific implication bullets:**
- `green` → "This is a lightweight app — it goes straight through automated checks with no manual review."
- `yellow` → "Because [reason derived from the Yellow trigger — e.g., 'it saves data' / 'it'll be used across multiple teams'], it will go through an Enterprise Architecture review before going live."
- `red` → "Because [reason derived from the Red trigger — e.g., 'it needs to be available 24/7' / 'it handles regulated data with writes'], this app requires Senior and SecOps sign-off. CatchTheVibe will route it to the Enterprise Architecture team."

**Zone labels for the summary:**
- `green` → "A Green-tier"
- `yellow` → "A Yellow-tier"
- `red` → "A Red-tier"

**Extras implication bullets (include one per extra, in plain language):**
- `database` → "Your app will need a dedicated database — the platform will provision one automatically when you deploy."
- `background_queue` → "It does background processing, so it will need a message queue — the platform handles that at deploy time."
- `storage_account` → "It stores files or data blobs, so a storage account will be provisioned when you deploy."
- `key_vault_policy` → "It handles regulated data, so a custom Key Vault access policy will be configured when you deploy."

**next_steps wording:**
- `green-ready` → "Once you confirm, your repo will be created and you can start building straight away."
- `green-with-extras` → "Once you confirm, your repo will be created. The extra resources listed above will be provisioned automatically when you deploy."
- `yellow-ea-review` → "Once you confirm, the portal will open an EA review ticket. You can start building while the review runs — deployment won't be available until it's approved."
- `red-escalate` → "Once you confirm, the portal will route this to the Enterprise Architecture team. They'll reach out to walk you through the Red-tier approval process."

**If the user pushes back:** Ask which part seems wrong, revisit the relevant question(s), recompute, and show a revised summary. Repeat until the user confirms.

---

## Manifest output

Once the user confirms, write `manifest.yaml` to the current working directory.

```yaml
# Generated by /app-scoping — {{DATE}}
# Fields marked {{PLACEHOLDER}} will be replaced by the CatchTheVibe portal at provisioning time.

name: "{{APP_NAME}}"
owner: "{{USER_EMAIL}}"
team: "{{USER_TEAM}}"
cost-center: "{{COST_CENTER}}"

zone: <green|yellow|red>
hosting: <webapp|aks>
stack:
  - <react-spa|node-api|python-api|static-site>
  # additional entries if paired pattern
pattern: <pattern-value>
created: <YYYY-MM-DD>

extras:
  - <database|background_queue|storage_account|key_vault_policy>
  # additional entries if multiple extras apply
  # omit this section entirely if extras is empty

next_steps: <green-ready|green-with-extras|yellow-ea-review|red-escalate>
```

Rules:
- `stack` is always written as a YAML list, even if only one entry.
- `{{DATE}}` in the comment is today's date in `YYYY-MM-DD` format.
- `created` is also today's date.
- Do not include the `# additional entries if paired pattern` or `# additional entries if multiple extras apply` comments in the output — those are instruction text only.
- `extras` is a YAML list. Omit the `extras` field entirely if no extras apply — do not write an empty list.
- `next_steps` is always a single string value.

After writing the file, tell the user the next step based on `next_steps`:

- `green-ready` → "Your manifest has been saved. Head back to the CatchTheVibe portal — your repo will be created and you can start building."
- `green-with-extras` → "Your manifest has been saved. Head back to the CatchTheVibe portal — your repo will be created, and the extra resources (listed above) will be provisioned automatically when you deploy."
- `yellow-ea-review` → "Your manifest has been saved. Head back to the CatchTheVibe portal — it will open an EA review ticket for your app. You can start building in your repo while the review is in progress."
- `red-escalate` → "Your manifest has been saved. Head back to the CatchTheVibe portal — it will route your app to the Enterprise Architecture team for Red-tier approval."

---

## Pattern reference (quick lookup)

The full pattern descriptions are in `.claude/docs/patterns/`. Key manifest values by pattern:

| Pattern | `pattern` field | `stack` | `hosting` |
|---|---|---|---|
| Interactive Dashboard App | `interactive-dashboard` | `react-spa` (+ `node-api` or `python-api` if paired) | `webapp` |
| Content Website | `content-website` | `static-site` | `webapp` |
| Integration Service | `integration-service` | `node-api` | `webapp` |
| Data & Automation Service | `data-automation` | `python-api` | `webapp` |
| Event-Driven Service | `event-driven` | `python-api` | `aks` |
| Multi-Container Service | `multi-container` | `react-spa`, `python-api` | `aks` |
| Scheduled Job Service | `scheduled-job` | `python-api` | `aks` |
