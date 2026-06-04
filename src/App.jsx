import { useState, useRef, useEffect } from "react";
import { Search, BookOpen, Shield, Rocket, Terminal, FileText, ExternalLink, ChevronRight, CheckCircle, AlertTriangle, Zap, Users, GitBranch, Cloud, Lock, Eye, ArrowRight, Star, Clock, TrendingUp, Lightbulb, Wrench, GraduationCap, LayoutGrid, List, Copy, ChevronDown, ChevronUp, Code, MessageSquare, Brain, Send, X, Square, LogOut, User as UserIcon } from "lucide-react";

// ─── Aura Design Tokens ───────────────────────────────────────────────────
const T = {
  // Backgrounds
  bgPage: "#F4F4F5",
  bgPaper: "#FFFFFF",
  bgHover: "#FAFAFA",
  bgSelected: "hsla(210,100%,95%,1)",
  bgSubtle: "#F8FAFC",
  // Borders
  divider: "#D4D4D8",
  dividerLight: "#E4E4E7",
  inputStroke: "#D4D4D8",
  // Text
  textPrimary: "#18181B",
  textSecondary: "#71717A",
  textDisabled: "#A1A1AA",
  textOnPrimary: "#FFFFFF",
  // Primary
  primary: "#3078C0",
  primaryDark: "#245E9A",
  primaryLight: "#D5E8F6",
  primarySubtle: "hsla(210,100%,95%,1)",
  // Accents
  purple: "#6941C6",
  purpleLight: "#F3EEFB",
  pink: "#C11574",
  // Status
  success: "#2D8630",
  successLight: "#ECFDF3",
  successBorder: "#ABEFC6",
  warning: "hsla(23,80%,45%,1)",
  warningLight: "#FFFAEB",
  warningBorder: "#FEDF89",
  error: "#D32F2F",
  errorLight: "#FEF3F2",
  errorBorder: "#FECDCA",
  // Typography
  font: "'Inter', sans-serif",
  monoFont: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  // Radii
  radiusXs: 4,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 10,
  radiusCircular: 9999,
  // Shadows
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.12)",
};

const SECTIONS = {
  home: "Home",
  launchpad: "Launchpad",
  governance: "Governance",
  skills: "Skills & Learning",
  tools: "Toolbox",
  showcase: "Showcase",
  myapps: "My Apps",
  admin: "Admin",
};

const zoneData = [
  { zone: "Green", color: T.success, bg: T.successLight, border: T.successBorder, desc: "UI, dashboards, prototypes, internal tools", review: "Automated scan + light review", examples: ["React dashboards", "CSS/styling", "CRUD interfaces", "Documentation generators"] },
  { zone: "Yellow", color: T.warning, bg: T.warningLight, border: T.warningBorder, desc: "Business logic, APIs, data transforms", review: "Automated scan + peer review required", examples: ["API integrations", "Data pipelines", "Webhook handlers", "Database queries"] },
  { zone: "Red", color: T.error, bg: T.errorLight, border: T.errorBorder, desc: "Auth, crypto, payments, PII handling", review: "AI suggests only — senior + SecOps verify", examples: ["Auth/authorization", "Payment processing", "Encryption logic", "PII data handling"] }
];

const checklistItems = [
  { id: 1, category: "Source Control", text: "Repo created via vibe-* naming convention", icon: GitBranch },
  { id: 2, category: "Source Control", text: "manifest.yaml complete in repo root", icon: FileText },
  { id: 3, category: "Source Control", text: "AGENTS.md included from Tricentis standard template", icon: Code },
  { id: 4, category: "Design", text: "Solution Design doc peer-reviewed and in Confluence", icon: BookOpen },
  { id: 5, category: "Design", text: "Architecture pattern selected from approved list", icon: LayoutGrid },
  { id: 6, category: "Design", text: "Approved by ITOps, SecOps, PlatSec, CPE", icon: Shield },
  { id: 7, category: "Platform", text: "Deployed to CPE-managed AWS/Azure account via IaC only", icon: Cloud },
  { id: 8, category: "Platform", text: "Sandbox deployment completed first", icon: Rocket },
  { id: 9, category: "Security", text: "All endpoints behind Tricentis SSO", icon: Lock },
  { id: 10, category: "Security", text: "No hardcoded secrets — using Secrets Manager / Key Vault", icon: Lock },
  { id: 11, category: "Security", text: "SAST, SCA, and secret scanning passing in CI", icon: Shield },
  { id: 12, category: "Security", text: "No critical/high CVEs in dependencies", icon: AlertTriangle },
  { id: 13, category: "Language", text: "Using approved language and LTS runtime version", icon: Terminal },
  { id: 14, category: "Compliance", text: "Encryption at rest + HTTPS enforced", icon: Lock },
  { id: 15, category: "Compliance", text: "No public buckets/containers", icon: Eye },
  { id: 16, category: "Compliance", text: "PII review completed (if applicable)", icon: FileText },
  { id: 17, category: "Operations", text: "Named owner assigned", icon: Users },
  { id: 18, category: "Operations", text: "Logging routed to central store with alerting", icon: Eye },
  { id: 19, category: "Operations", text: "Cost estimate and cost center approved", icon: TrendingUp },
];

const learningPaths = [
  { title: "Prompt Engineering for Secure Code", level: "Beginner", duration: "45 min", desc: "Write prompts that produce secure-by-default code. Includes the org prompt library.", tags: ["Security", "Prompting"], icon: "🛡️" },
  { title: "OWASP Top 10 for Vibe Coders", level: "Beginner", duration: "1 hr", desc: "The vulnerabilities AI introduces most often, and how to spot them in generated code.", tags: ["Security", "OWASP"], icon: "🔒" },
  { title: "Working with AGENTS.md & Rules Files", level: "Beginner", duration: "30 min", desc: "How AI rules files work, why they matter, and how to use the Tricentis standard template effectively.", tags: ["Tooling", "Rules"], icon: "📋" },
  { title: "IaC Patterns & Templates", level: "Intermediate", duration: "30 min", desc: "How to use our pre-approved OpenTofu/Bicep modules to deploy your app.", tags: ["Platform", "IaC"], icon: "☁️" },
  { title: "Reviewing AI-Generated Code", level: "Intermediate", duration: "1 hr", desc: "How to critically review code you didn't write. Focus on auth, input validation, and data flows.", tags: ["Code Review", "Security"], icon: "🔍" },
  { title: "From Prototype to Production", level: "Advanced", duration: "2 hrs", desc: "End-to-end walkthrough: Solution Design → repo request → build → scan → deploy → monitor.", tags: ["SDLC", "Deployment"], icon: "🚀" },
  { title: "Threat Modeling Lite", level: "Advanced", duration: "1 hr", desc: "Lightweight threat modeling for Yellow/Red zone apps. Required for apps handling real data.", tags: ["Security", "Compliance"], icon: "⚔️" },
];

const tools = [
  { name: "Repo Request", desc: "Provision a new governed vibe-* repo with all guardrails pre-wired, including the standard AGENTS.md and CI/CD pipeline.", action: "Request Repo", icon: GitBranch, category: "Getting Started" },
  { name: "Architecture Picker", desc: "Choose from approved patterns: SPA+Lambda, Container, Event-Driven, Scheduled Job. Each includes IaC templates.", action: "Browse Patterns", icon: LayoutGrid, category: "Getting Started" },
  { name: "AI Rules & AGENTS.md", desc: "The Tricentis standard AGENTS.md template — bakes security requirements, approved languages, and coding standards directly into AI tool context so every prompt starts with the right guardrails.", action: "View Template", icon: Code, category: "AI Rules & Context", featured: true },
  { name: "Prompt Library", desc: "Security-aware prompt templates for common patterns (auth flows, APIs, data access layers, input validation).", action: "Browse Prompts", icon: Lightbulb, category: "AI Rules & Context" },
  { name: "Vibe Coding Playbook", desc: "Practical techniques: spec-first workflow, iterative prompting, checkpoint strategy, persona prompts, and the ask-before-coding pattern.", action: "Read Playbook", icon: Brain, category: "AI Rules & Context" },
  { name: "Zone Classifier", desc: "Not sure if your app is Green, Yellow, or Red? Answer 5 questions to find out.", action: "Classify My App", icon: Shield, category: "Building" },
  { name: "Dependency Checker", desc: "Paste your package.json or requirements.txt to pre-check for CVEs, license issues, and hallucinated packages.", action: "Check Deps", icon: Search, category: "Building" },
  { name: "Cost Estimator", desc: "Estimate monthly AWS/Azure costs for your chosen architecture pattern.", action: "Estimate Cost", icon: TrendingUp, category: "Planning" },
  { name: "Solution Design Template", desc: "Pre-filled template with all required sections for your Confluence doc.", action: "Download Template", icon: FileText, category: "Planning" },
  { name: "Deployment Readiness Check", desc: "Automated pre-flight check against all deployment requirements.", action: "Run Check", icon: CheckCircle, category: "Deploying" },
];

const showcaseApps = [
  { name: "QA Test Dashboard", team: "Quality Engineering", zone: "Green", lang: "TypeScript", pattern: "SPA + Lambda", status: "Live", desc: "Real-time test execution dashboard pulling from CI pipelines" },
  { name: "Sales Demo Scheduler", team: "Sales Ops", zone: "Yellow", lang: "Python", pattern: "Container (ECS)", status: "Live", desc: "Internal tool for coordinating demo environments with calendar integration" },
  { name: "Incident Response Bot", team: "SRE", zone: "Yellow", lang: "Python", pattern: "Event-Driven", status: "In Review", desc: "Slack bot that triages alerts and creates tickets automatically" },
];

const agentsMdContent = `# AGENTS.md — Tricentis Vibe Coding Standard
# This file is read by AI coding assistants (Cursor, Claude Code,
# Copilot, Codex, Windsurf) at the start of every session.
# It ensures all generated code follows Tricentis standards.

## Project Overview
# [EDIT] Describe your app in 1-2 sentences.
# Example: Internal dashboard for QA test results, built with
# React + TypeScript frontend and Python Lambda API.

## Approved Tech Stack
- Frontend: React 18+ with TypeScript (strict mode)
- Backend: Python 3.12+ or Node.js 22+ (LTS only)
- Infrastructure: AWS (Lambda, API Gateway, ECS) or Azure
  (Functions, Static Web Apps, AKS)
- IaC: OpenTofu or Bicep only — no manual console changes
- Testing: Vitest/Jest for unit, Playwright for E2E

## Security Requirements — MANDATORY
- NEVER hardcode secrets, API keys, tokens, or credentials
- NEVER use eval(), exec(), or dynamic code execution
- ALWAYS use parameterized queries — no string concatenation
  for SQL
- ALWAYS validate and sanitize all user inputs
- ALWAYS use established libraries for auth — never roll custom
  authentication or session management
- ALWAYS encode output to prevent XSS
- NEVER log PII, secrets, or sensitive data
- NEVER use pickle or insecure deserialization
- Use HTTPS for all external calls
- Apply principle of least privilege for all IAM/permissions
- If unsure about a security pattern, flag it with a
  "// SECURITY-REVIEW" comment rather than guessing

## Coding Standards
- Use TypeScript strict mode; no \`any\` types
- Prefer named exports over default exports
- Use async/await over raw Promises
- Use const over let; never use var
- Write concise, meaningful comments for complex logic only
- Keep functions small and single-purpose
- Use early returns to reduce nesting
- Define strings as constants, not inline literals
- Robust error handling with specific error types
- No unnecessary try/catch blocks

## Dependencies
- Only use packages available in the Tricentis private registry
- Pin all dependency versions — no floating ranges (^, ~)
- Check for known CVEs before adding any new package
- Prefer well-maintained packages with active communities
- If you are unsure a package exists, say so — do not guess
  or hallucinate package names

## Architecture Boundaries
- Follow the project's declared architecture pattern
- Do not introduce new frameworks or major dependencies
  without explicit approval
- Keep frontend and backend concerns separated
- Database access only through approved ORM/query layers
- No direct public internet access from backend services

## Testing Requirements
- All new functions must include unit tests
- All API endpoints must include integration tests
- Test both success and failure/edge cases
- No tests that depend on external services without mocking

## Git & Workflow
- One logical change per commit
- Commit messages: type(scope): description
  (e.g., feat(auth): add SSO middleware)
- Never commit directly to main — all changes via PR
- Never commit .env files, secrets, or credentials

## What NOT To Do
- Do not make sweeping changes across multiple files unless
  explicitly asked
- Do not refactor unrelated code while implementing a feature
- Do not remove or weaken existing security controls
- Do not change infrastructure configuration without flagging it
- Do not assume — ask for clarification when requirements
  are ambiguous`;

const playbookTechniques = [
  { title: "Spec Before You Vibe", icon: "📝", desc: "Define what you're building before you start prompting. Create a brief spec or README with goals, constraints, and milestones. AI works dramatically better with structured intent.", example: "\"Write a README for a test results dashboard with 3 milestones. Milestone 1: display test runs in a table. Milestone 2: add filtering by status. Milestone 3: add trend charts.\"", why: "Without a spec, the AI makes assumptions about architecture, scope, and requirements. Those assumptions compound into technical debt fast." },
  { title: "Ask Before Coding", icon: "🤔", desc: "Before any complex feature, ask the AI to propose options — starting with the simplest. Don't let it jump straight to implementation.", example: "\"I need to add search to this list. Give me 3 options, starting with the simplest. Don't write any code yet.\"", why: "9 out of 10 times the AI suggests something overcomplicated. Getting options first lets you choose the right level of complexity." },
  { title: "One Task at a Time", icon: "🎯", desc: "Break work into small, testable tasks. Prompt for one at a time, test it, then move to the next. Never ask for multiple features in a single prompt.", example: "\"Implement task 1.1 from the plan. Stop after this task — I'll test before we continue.\"", why: "Large prompts produce large diffs that are impossible to review. Small changes are reviewable, revertable, and debuggable." },
  { title: "Assign a Persona", icon: "🎭", desc: "Tell the AI who it is. This shapes the quality and focus of the output significantly.", example: "\"Act as a Senior Backend Engineer focused on security. Review this auth middleware and identify any vulnerabilities.\"", why: "Personas activate different patterns in the model. A 'security-focused engineer' persona will flag issues that a generic prompt misses." },
  { title: "Use Checkpoints Aggressively", icon: "💾", desc: "Commit to Git after every working milestone. Use your IDE's checkpoint/revert feature when the AI makes a mess. Don't try to fix broken AI output — revert and re-prompt.", example: "\"Before we start: git add -A && git commit -m 'checkpoint: working auth flow'\"", why: "AI changes can silently break things that were working. Without checkpoints, you lose the ability to get back to a known-good state." },
  { title: "Prompt with Constraints", icon: "🚧", desc: "Always include what the AI must NOT do alongside what it should do. Security constraints, file boundaries, and scope limits prevent runaway changes.", example: "\"Add input validation to the /api/search endpoint. Constraints: only modify api/search.ts. Do not change any other files. Use zod for schema validation. Do not add new dependencies.\"", why: "Without constraints, AI tools make 'helpful' changes to unrelated files, introduce new dependencies, or refactor things you didn't ask about." },
  { title: "Review the Diff, Not the Chat", icon: "👀", desc: "The AI's explanation of what it did may not match what it actually did. Always review the actual code diff before accepting changes.", example: "After every AI change: review the git diff line-by-line. If you see changes you didn't ask for, revert them.", why: "AI-generated code can be syntactically perfect but semantically wrong — auth that defaults to 'true' on error, queries that skip validation, permissions that are too broad." },
  { title: "Clean Up Regularly", icon: "🧹", desc: "AI accumulates cruft. Periodically ask it to audit its own output for dead code, duplications, and inconsistencies.", example: "\"Scan this codebase for: duplicate functions, unused imports, inconsistent naming, dead code. List them but don't fix anything yet.\"", why: "AI doesn't track what it's generated across prompts. Without periodic cleanup, vibe-coded apps become unmaintainable faster than traditional apps." }
];

// ─── AI Chat Layer: Stub Responses ────────────────────────────────────────
const STUB_RESPONSES = {
  hello: "Hey there! I'm the Catch The Vibe assistant. I can help you with zone classification for your project, walk you through the deployment checklist, explain governance policies, share vibe coding tips from the Playbook, or guide you through submitting code to the portal. What are you working on?",
  zone: "The zone model classifies every project by risk level. Green zone is for UI, dashboards, and prototypes — these auto-deploy after scans pass. Yellow zone covers APIs, business logic, and data pipelines — these need peer review before deployment. Red zone is for auth, encryption, PII, and payments — these require senior engineer and SecOps sign-off. To classify your project, tell me: what does your app do, and does it handle any authentication, personal data, or payments?",
  green: "Green zone is the lowest-friction path. It covers UI components, dashboards, prototypes, CRUD interfaces, and documentation generators. AI can generate code freely, and once your automated SAST and SCA scans pass in CI, your app deploys automatically. No manual review gate required. Most internal tools start here.",
  yellow: "Yellow zone applies when your app involves business logic, API integrations, data pipelines, webhook handlers, or database queries. AI still helps you build, but a peer review by a qualified engineer is mandatory before deployment. The Launchpad checklist will guide you through everything you need to prepare for that review.",
  red: "Red zone is for anything involving authentication, authorisation, payment processing, encryption logic, or PII data handling. In this zone, AI can suggest approaches, but all generated code must be flagged with SECURITY-REVIEW comments and reviewed by both a senior engineer and SecOps. No code deploys without their sign-off — no exceptions. If your project touches any of these areas, I'd recommend connecting with SecOps early.",
  deploy: "The Launchpad page has your complete deployment checklist. It covers six categories: Source Control (repo naming, manifest.yaml, AGENTS.md), Design (solution design doc, architecture pattern, approvals), Platform (IaC deployment, sandbox first), Security (SSO, secrets management, scans, CVEs), Compliance (encryption, no public buckets, PII review), and Operations (named owner, logging, cost estimate). Head to the Launchpad tab to track your progress.",
  agents: "AGENTS.md is a rules file that AI coding tools (Cursor, Claude Code, Copilot, Codex, Windsurf) read automatically at the start of every session. It bakes in Tricentis security requirements, approved languages, coding standards, and dependency policies so the AI follows them without you needing to remember. You can find the Tricentis standard template in the Toolbox — look for the AI Rules & AGENTS.md card.",
  prompt: "The Vibe Coding Playbook has eight key techniques: Spec Before You Vibe (define goals before prompting), Ask Before Coding (get options first), One Task at a Time (small testable changes), Assign a Persona (shape AI output quality), Use Checkpoints (commit after every milestone), Prompt with Constraints (say what NOT to do), Review the Diff (not the chat), and Clean Up Regularly (audit for dead code). You can find all of these with examples in the Toolbox under Vibe Coding Playbook.",
  security: "The core security requirements from AGENTS.md: never hardcode secrets, API keys, or credentials. Always validate and sanitise user inputs. Always encode output to prevent XSS. Never use eval(), exec(), or dynamic code execution. Never log PII or sensitive data. Use parameterised queries — no SQL string concatenation. Use established auth libraries — never roll custom authentication. If you're unsure about a security pattern, flag it with a SECURITY-REVIEW comment.",
  repo: "All vibe-coded projects follow the naming convention vibe-{team}-{app} (like vibe-salesops-demo-scheduler). Every repo must include a manifest.yaml in the root and the Tricentis standard AGENTS.md template. You can request a new repo through the Toolbox — the Repo Request tool provisions everything with CI/CD pipelines and guardrails pre-wired.",
  checklist: "The deployment checklist on the Launchpad page tracks 19 requirements across six categories. You check items off as you complete them, and the progress bar shows your overall readiness. Once you hit 100%, you're clear to submit your deployment request to CPE. Go to the Launchpad tab to get started — it's interactive and saves your progress for the session.",
  submit: "To submit your code, go to the Submit Code page on the Catch The Vibe portal. Drag and drop the files you downloaded from Claude Desktop. The portal will validate the provenance headers in your files, create a branch under your SSO identity, open a pull request, and run all the CI/CD scans automatically. You'll see a progress indicator and either a deploy URL on success, or a plain-language report if anything needs fixing. No Git knowledge required.",
  provenance: "A provenance header is a comment block at the top of each file that proves it was generated under approved Tricentis project instructions. It contains the project ID, zone classification, a hash of the instructions file, and a timestamp. When you upload files to the portal, these headers are validated. If a header is missing, the hash doesn't match, or the zone has changed since generation, the upload is rejected. The fix is usually to re-import the latest instructions in Claude Desktop and regenerate your files.",
  claude: "To set up Claude Desktop for your project: first, go to Catch The Vibe and complete your zone classification. The portal will generate a project instructions file for you. Then open Claude Desktop, create a new project, and import that instructions file. This is a one-time setup — after that, every conversation in the project automatically follows Tricentis security rules, your zone's constraints, and the Vibe Coding Playbook techniques. Your whole team imports the same file.",
  default: "I'm running in stub mode right now, so my responses are pre-written. In production, I'll be connected to Claude through Amazon Bedrock and can have real conversations. Even in stub mode, I can point you to the right section of the portal. I can help with: zone classification, the deployment checklist, AGENTS.md and rules files, the Vibe Coding Playbook, security requirements, repo setup, the non-technical user workflow, and provenance headers. What would you like to know about?"
};

const getStubResponse = (input) => {
  const lower = input.toLowerCase();
  const keywords = [
    { keys: ["hello", "hi", "hey", "help", "what can you"], response: "hello" },
    { keys: ["zone", "classify", "classification"], response: "zone" },
    { keys: ["green"], response: "green" },
    { keys: ["yellow"], response: "yellow" },
    { keys: ["red"], response: "red" },
    { keys: ["deploy", "deployment", "launch"], response: "deploy" },
    { keys: ["agents", "agents.md", "rules file"], response: "agents" },
    { keys: ["prompt", "prompting", "playbook", "technique"], response: "prompt" },
    { keys: ["security", "secure", "vulnerability", "owasp"], response: "security" },
    { keys: ["repo", "repository", "naming"], response: "repo" },
    { keys: ["checklist", "readiness", "launchpad"], response: "checklist" },
    { keys: ["submit", "upload", "how do i submit", "drag and drop"], response: "submit" },
    { keys: ["provenance", "header", "rejected", "hash"], response: "provenance" },
    { keys: ["claude desktop", "instructions file", "setup claude"], response: "claude" },
  ];
  for (const { keys, response } of keywords) {
    if (keys.some(k => lower.includes(k))) return STUB_RESPONSES[response];
  }
  return STUB_RESPONSES.default;
};

// ─── AI Chat Components ───────────────────────────────────────────────────

function VibeCodeLogo({ size = 24 }) {
  const scale = size / 24;
  return (
    <svg width={size} height={size} viewBox="-80 -60 170 110" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="-52" y="-34" width="104" height="62" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="-52" y1="-26" x2="52" y2="-26" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="-44" y="-18" width="42" height="12" rx="3" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3"/>
      <rect x="-4" y="-2" width="48" height="18" rx="3" fill={T.primary} opacity="0.15" stroke={T.primary} strokeWidth="1"/>
      <circle cx="-66" cy="-12" r="7" fill="none" stroke="currentColor" strokeWidth="2.5"/>
      <circle cx="66" cy="-6" r="10" fill="none" stroke={T.primary} strokeWidth="1.8" opacity="0.4"/>
      <circle cx="66" cy="-6" r="5" fill="none" stroke={T.primary} strokeWidth="1.8" opacity="0.6"/>
      <circle cx="66" cy="-6" r="2" fill={T.primary}/>
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: T.primary,
          animation: "vibePulse 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`, opacity: 0.4,
        }} />
      ))}
      <style>{`@keyframes vibePulse { 0%, 80%, 100% { opacity: 0.4; transform: scale(1); } 40% { opacity: 1; transform: scale(1.2); } }`}</style>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", padding: "4px 16px", marginBottom: 4 }}>
      <div style={{
        maxWidth: "85%", padding: "10px 14px", borderRadius: T.radiusMd,
        background: isUser ? T.primarySubtle : T.bgPage,
        border: `1px solid ${isUser ? T.primaryLight : T.dividerLight}`,
        color: T.textPrimary, fontSize: 13, lineHeight: 1.55,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
        borderBottomRightRadius: isUser ? 2 : T.radiusMd,
        borderBottomLeftRadius: isUser ? T.radiusMd : 2,
      }}>
        {message.content}
      </div>
    </div>
  );
}

function MessageList({ messages, isStreaming }) {
  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, messages.length > 0 ? messages[messages.length - 1].content : ""]);

  const showTyping = isStreaming && messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content === "";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
      {messages.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: 24, textAlign: "center" }}>
          <MessageSquare size={32} color={T.divider} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>Catch The Vibe Assistant</div>
          <div style={{ fontSize: 12, color: T.textDisabled, lineHeight: 1.5 }}>Ask about zones, deployment, AGENTS.md, or anything vibe coding.</div>
        </div>
      )}
      {messages.map(m => <MessageBubble key={m.id} message={m} />)}
      {showTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

function ChatInput({ inputValue, setInputValue, onSend, onStop, isStreaming }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!isStreaming && inputValue.trim()) onSend(); }
  };
  return (
    <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.dividerLight}`, background: T.bgPaper }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Ask about zones, deploy, security..." rows={2}
          style={{ flex: 1, resize: "none", border: `1px solid ${T.inputStroke}`, borderRadius: T.radiusXs, background: T.bgPaper, color: T.textPrimary, padding: "8px 12px", fontSize: 13, lineHeight: 1.5, outline: "none", fontFamily: T.font }}
        />
        {isStreaming ? (
          <button onClick={onStop} style={{ width: 36, height: 36, borderRadius: T.radiusXs, border: `1px solid ${T.errorBorder}`, background: T.errorLight, color: T.error, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Square size={14} />
          </button>
        ) : (
          <button onClick={onSend} disabled={!inputValue.trim()} style={{ width: 36, height: 36, borderRadius: T.radiusXs, border: "none", background: inputValue.trim() ? T.primary : T.dividerLight, color: inputValue.trim() ? T.textOnPrimary : T.textDisabled, cursor: inputValue.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ChatWindow({ messages, isStreaming, inputValue, setInputValue, onSend, onStop, onClose }) {
  return (
    <div style={{
      position: "fixed", right: 0, top: "50%", transform: "translateY(-50%)",
      width: 360, height: 520, zIndex: 1000,
      background: T.bgPaper, border: `1px solid ${T.divider}`, borderRight: "none",
      borderRadius: `${T.radiusLg}px 0 0 ${T.radiusLg}px`,
      boxShadow: T.shadowLg, display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: T.primary, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} color={T.textOnPrimary} />
          <span style={{ fontSize: 14, fontWeight: 600, color: T.textOnPrimary }}>Catch The Vibe Assistant</span>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: T.radiusXs, border: "none", background: "rgba(255,255,255,0.18)", color: T.textOnPrimary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={14} />
        </button>
      </div>
      <MessageList messages={messages} isStreaming={isStreaming} />
      <ChatInput inputValue={inputValue} setInputValue={setInputValue} onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
    </div>
  );
}

function ChatToggleButton({ onClick, hasUnread }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: "fixed", right: 16, top: "50%", transform: `translateY(-50%) scale(${hover ? 1.08 : 1})`,
        width: 48, height: 48, borderRadius: "50%", border: "none", background: T.primary,
        boxShadow: hover ? `0 4px 20px ${T.primary}66, 0 0 0 3px ${T.primary}22` : T.shadowMd,
        color: T.textOnPrimary, cursor: "pointer", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
      }}>
      <MessageSquare size={20} />
      {hasUnread && <div style={{ position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: T.error, border: `2px solid ${T.bgPaper}` }} />}
    </button>
  );
}

// ─── Chat Hook (SSE streaming) ────────────────────────────────────────────

function useChat(currentSection) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text, timestamp: Date.now() };
    const assistantMsg = { id: crypto.randomUUID(), role: "assistant", content: "", timestamp: Date.now() };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      // Build conversation history for the API (strip client-only fields)
      const apiMessages = [...messages, userMsg]
        .filter(m => m.content && m.content.trim().length > 0)
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, currentSection }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Chat request failed" }));
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: `Sorry, something went wrong: ${err.error || "unknown error"}` }
            : m
        ));
        setIsStreaming(false);
        return;
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        let eventType = null;
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ") && eventType) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);

              if (eventType === "content_block_delta" && data.delta?.text) {
                const token = data.delta.text;
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsg.id
                    ? { ...m, content: m.content + token }
                    : m
                ));
              } else if (eventType === "error") {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsg.id
                    ? { ...m, content: `Sorry, an error occurred: ${data.error?.message || "unknown"}` }
                    : m
                ));
              }
            } catch {
              // Skip malformed JSON
            }
            eventType = null;
          } else if (line === "") {
            eventType = null;
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // User stopped — keep partial content
      } else {
        setMessages(prev => prev.map(m =>
          m.id === assistantMsg.id && !m.content
            ? { ...m, content: "Sorry, I couldn't connect to the chat service. Please try again." }
            : m
        ));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  };

  return { messages, isStreaming, sendMessage, stopStreaming };
}

function AIChatPanel({ currentSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat(currentSection);
  const prevMsgCountRef = useRef(0);

  // Track unread messages when panel is closed
  useEffect(() => {
    if (!isOpen && messages.length > prevMsgCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.content) {
        setHasUnread(true);
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages, isOpen]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;
    setInputValue("");
    sendMessage(text);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  if (!isOpen) return <ChatToggleButton onClick={handleOpen} hasUnread={hasUnread} />;

  return (
    <ChatWindow
      messages={messages}
      isStreaming={isStreaming}
      inputValue={inputValue}
      setInputValue={setInputValue}
      onSend={handleSend}
      onStop={stopStreaming}
      onClose={() => setIsOpen(false)}
    />
  );
}

// ─── Auth Hook ───────────────────────────────────────────────────────────

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, isAuthenticated: !!user };
}

function ProfileModal({ user, onClose }) {
  const [team, setTeam] = useState(user.team || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = team !== (user.team || "");

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team: team.trim() || null }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silent — non-blocking
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user.firstLogin
    ? new Date(user.firstLogin).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const fieldStyle = {
    fontSize: 13, color: T.textPrimary,
    padding: "7px 10px",
    background: T.bgPage,
    borderRadius: T.radiusXs,
    border: `1px solid ${T.dividerLight}`,
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: T.textSecondary,
    marginBottom: 4, display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.bgPaper, borderRadius: T.radiusLg, padding: 32, width: 480, maxWidth: "90vw", boxShadow: T.shadowLg, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: T.radiusCircular,
              background: T.primaryLight, color: T.primary,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700,
            }}>
              {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{user.name}</div>
              <div style={{ fontSize: 13, color: T.textSecondary }}>{user.email}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: T.textDisabled, padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <Badge color={T.primary}>Tricentis Employee</Badge>
          {user.isAdmin && <Badge color={T.error}>Admin</Badge>}
        </div>

        {/* Read-only fields from Graph */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[
            { label: "Job Title", value: user.jobTitle },
            { label: "Department", value: user.department },
          ].map(({ label, value }) => (
            <div key={label}>
              <span style={labelStyle}>{label}</span>
              <div style={fieldStyle}>{value || <span style={{ color: T.textDisabled }}>—</span>}</div>
            </div>
          ))}
        </div>

        {user.managerName && (
          <div style={{ marginBottom: 14 }}>
            <span style={labelStyle}>Manager</span>
            <div style={fieldStyle}>
              {user.managerName}
              {user.managerEmail && <span style={{ color: T.textSecondary, marginLeft: 8, fontSize: 12 }}>{user.managerEmail}</span>}
            </div>
          </div>
        )}

        {/* Editable team field */}
        <div style={{ marginBottom: 20 }}>
          <span style={labelStyle}>Team</span>
          <input
            type="text"
            value={team}
            onChange={e => setTeam(e.target.value)}
            placeholder="e.g. Quality Engineering"
            style={{
              ...fieldStyle,
              background: T.bgPaper,
              border: `1px solid ${T.inputStroke}`,
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              fontFamily: T.font,
            }}
          />
          <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 4 }}>Self-reported — updated automatically if Graph API is available.</div>
        </div>

        {/* Meta info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {memberSince && (
            <div>
              <span style={labelStyle}>Member Since</span>
              <div style={fieldStyle}>{memberSince}</div>
            </div>
          )}
          <div>
            <span style={labelStyle}>Apps Owned</span>
            <div style={fieldStyle}>{user.apps?.length ?? 0}</div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px", borderRadius: T.radiusSm,
              border: `1px solid ${T.dividerLight}`, background: "transparent",
              fontSize: 13, color: T.textSecondary, cursor: "pointer",
            }}
          >
            Close
          </button>
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "8px 18px", borderRadius: T.radiusSm,
                border: "none", background: saving ? T.textDisabled : T.primary,
                fontSize: 13, fontWeight: 600, color: T.textOnPrimary,
                cursor: saving ? "default" : "pointer",
              }}
            >
              {saving ? "Saving…" : saved ? "Saved!" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user, onOpenProfile }) {
  const [open, setOpen] = useState(false);
  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const menuItemStyle = {
    padding: "8px 14px", fontSize: 13, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 8,
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: T.radiusXs,
          border: `1px solid ${T.dividerLight}`, background: T.bgPaper,
          cursor: "pointer", fontSize: 13, color: T.textPrimary,
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: T.radiusCircular,
          background: T.primaryLight, color: T.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700,
        }}>
          {initials}
        </div>
        <span style={{ fontWeight: 500 }}>{user.name}</span>
        <ChevronDown size={12} color={T.textDisabled} />
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: "absolute", top: "100%", right: 0, marginTop: 4,
            width: 220, background: T.bgPaper, border: `1px solid ${T.dividerLight}`,
            borderRadius: T.radiusSm, boxShadow: T.shadowMd, zIndex: 100,
            padding: "8px 0",
          }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.dividerLight}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{user.name}</div>
              <div style={{ fontSize: 12, color: T.textDisabled }}>{user.email}</div>
              {user.team && (
                <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{user.team}</div>
              )}
            </div>
            <div style={{ padding: "4px 0" }}>
              <div
                onClick={() => { setOpen(false); onOpenProfile(); }}
                style={{ ...menuItemStyle, color: T.textPrimary }}
                onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <UserIcon size={14} /> Profile
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.dividerLight}`, padding: "4px 0" }}>
              <div
                onClick={() => { window.location.href = `/oauth2/sign_out?rd=${encodeURIComponent('https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=' + encodeURIComponent('https://catchthevibe.build.tricentis.com'))}`; }}
                style={{ ...menuItemStyle, color: T.error }}
                onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogOut size={14} /> Sign Out
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shared UI Components (Aura-themed) ───────────────────────────────────

function Badge({ children, color = T.primary }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: T.radiusCircular, fontSize: 11, fontWeight: 600, background: color + "18", color, border: `1px solid ${color}33`, marginRight: 6 }}>{children}</span>;
}

function Card({ children, onClick, hover = true, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: T.bgPaper, border: `1px solid ${T.dividerLight}`, borderRadius: T.radiusMd, padding: 20, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", transform: h && hover && onClick ? "translateY(-2px)" : "none", boxShadow: h && hover ? T.shadowSm : "none", ...style }}>
      {children}
    </div>
  );
}

function Expandable({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${T.dividerLight}`, borderRadius: T.radiusSm, marginBottom: 8, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: open ? T.bgHover : "transparent", transition: "background 0.15s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} color={T.textDisabled} /> : <ChevronDown size={16} color={T.textDisabled} />}
      </div>
      {open && <div style={{ padding: "0 18px 18px" }}>{children}</div>}
    </div>
  );
}

// ─── Page Components (Aura-themed) ────────────────────────────────────────

async function* parseSSE(reader) {
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop();
    for (const block of events) {
      if (!block.trim()) continue;
      const lines = block.split('\n');
      let eventType = 'message';
      let data = null;
      for (const line of lines) {
        if (line.startsWith('event: ')) eventType = line.slice(7).trim();
        else if (line.startsWith('data: ')) { try { data = JSON.parse(line.slice(6)); } catch {} }
      }
      if (data !== null) yield { type: eventType, data };
    }
  }
}

function extractManifest(text) {
  const m = text.match(/```yaml\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

function BuildPage({ setSection }) {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'chatting' | 'complete'
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [repo, setRepo] = useState(null);
  const [createError, setCreateError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText]);

  async function consumeStream(response, currentSessionId) {
    const reader = response.body.getReader();
    let acc = '';
    for await (const { type, data } of parseSSE(reader)) {
      if (type === 'text') {
        acc += data.text;
        setStreamText(acc);
      } else if (type === 'session') {
        setSessionId(data.sessionId);
      } else if (type === 'error') {
        setError(data.message);
        setStreaming(false);
        setStreamText('');
        return;
      } else if (type === 'done') {
        const yaml = extractManifest(acc);
        setMessages(prev => [...prev, { role: 'assistant', text: acc }]);
        setStreamText('');
        setStreaming(false);
        if (yaml) {
          setManifest(yaml);
          setPhase('complete');
        }
      }
    }
  }

  const startInterview = async () => {
    setError(null);
    setStreaming(true);
    setPhase('chatting');
    try {
      const res = await fetch('/api/apps/scope', { method: 'POST' });
      if (!res.ok) throw new Error('start failed');
      await consumeStream(res, null);
    } catch {
      setError('Failed to start the interview. Please try again.');
      setStreaming(false);
      setPhase('intro');
    }
  };

  const createRepo = async () => {
    const name = projectName.trim();
    if (!name || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: name, manifest, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create repo. Please try again.');
        setCreating(false);
        return;
      }
      setRepo(data);
    } catch {
      setCreateError('Failed to create repo. Please try again.');
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming || !sessionId) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setStreaming(true);
    setError(null);
    try {
      const res = await fetch(`/api/apps/scope/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('send failed');
      await consumeStream(res, sessionId);
    } catch {
      setError('Failed to send your message. Please try again.');
      setStreaming(false);
    }
  };

  if (phase === 'intro') {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>Build an App</h1>
        <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 32 }}>
          Answer a few questions and we'll figure out what you need — governance zone, architecture pattern, and the right template to get you started.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { icon: MessageSquare, title: "1. Tell us your idea", desc: "Describe what you want to build in plain language — no technical detail needed." },
            { icon: Shield, title: "2. We classify it", desc: "Claude determines your governance zone (Green, Yellow, or Red) based on what your app touches." },
            { icon: Rocket, title: "3. Get your repo", desc: "We generate a manifest.yaml and provision a pre-configured GitHub repo for your team." },
          ].map(step => (
            <Card key={step.title} hover={false} style={{ borderTop: `3px solid ${T.warning}` }}>
              <step.icon size={22} color={T.warning} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>{step.desc}</div>
            </Card>
          ))}
        </div>
        <Card hover={false} style={{ background: T.warningLight, border: `1px solid ${T.warningBorder}`, padding: 32, textAlign: "center" }}>
          <Lightbulb size={36} color={T.warning} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 8 }}>Ready to start?</div>
          <div style={{ fontSize: 14, color: T.textSecondary, marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
            Claude will walk you through a short interview to scope your app. It takes about 5 minutes.
          </div>
          <button
            onClick={startInterview}
            style={{
              background: T.warning, color: "#fff", border: "none",
              borderRadius: T.radiusSm, padding: "12px 32px",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: T.font,
            }}
          >
            <Lightbulb size={18} />
            Start the interview
          </button>
        </Card>
      </div>
    );
  }

  if (phase === 'complete') {
    if (repo) {
      return (
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>Repo Created</h1>
          <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 32 }}>Your repo is ready. Clone it and start building.</p>
          <Card hover={false} style={{ background: T.successLight, border: `1px solid ${T.successBorder}`, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <CheckCircle size={20} color={T.success} />
              <span style={{ fontWeight: 700, color: T.textPrimary, fontSize: 15 }}>{repo.repoName}</span>
            </div>
            <a href={repo.repoUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: T.primary, display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <ExternalLink size={13} />
              {repo.repoUrl}
            </a>
            <pre style={{
              background: T.bgPage, border: `1px solid ${T.divider}`,
              borderRadius: T.radiusMd, padding: "10px 14px", margin: 0,
              fontFamily: T.monoFont, fontSize: 13, color: T.textPrimary,
              overflowX: "auto",
            }}>git clone {repo.cloneUrl}</pre>
          </Card>
          <button
            onClick={() => setSection("myapps")}
            style={{
              background: T.primary, color: "#fff", border: "none",
              borderRadius: T.radiusSm, padding: "10px 24px",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: T.font,
            }}
          >
            <Rocket size={16} />
            View My Apps
          </button>
        </div>
      );
    }

    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>Name Your Project</h1>
        <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 32 }}>
          Almost there. Give your project a name and we'll provision your GitHub repo.
        </p>
        <Card hover={false} style={{ background: T.successLight, border: `1px solid ${T.successBorder}`, marginBottom: 32, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <CheckCircle size={20} color={T.success} />
            <span style={{ fontWeight: 700, color: T.textPrimary, fontSize: 15 }}>Manifest generated</span>
          </div>
          <pre style={{
            background: T.bgPage, border: `1px solid ${T.divider}`,
            borderRadius: T.radiusMd, padding: 16,
            fontFamily: T.monoFont, fontSize: 12,
            color: T.textPrimary, overflowX: "auto", margin: 0,
            whiteSpace: "pre", lineHeight: 1.6,
          }}>{manifest}</pre>
        </Card>
        <Card hover={false} style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>What would you like to name your project?</div>
          <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>
            This becomes the repo name: <span style={{ fontFamily: T.monoFont }}>vibe-{"{team}"}-{"{your-name}"}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createRepo(); } }}
              disabled={creating}
              placeholder="e.g. deal-tracker"
              style={{
                flex: 1, padding: "10px 14px",
                border: `1px solid ${T.inputStroke}`, borderRadius: T.radiusSm,
                fontSize: 14, outline: "none", fontFamily: T.font,
                background: creating ? T.bgHover : T.bgPaper,
                color: T.textPrimary,
              }}
            />
            <button
              onClick={createRepo}
              disabled={creating || !projectName.trim()}
              style={{
                padding: "10px 20px", border: "none", borderRadius: T.radiusSm,
                background: creating || !projectName.trim() ? T.textDisabled : T.primary,
                color: "#fff",
                cursor: creating || !projectName.trim() ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                fontWeight: 600, fontSize: 14, fontFamily: T.font,
                whiteSpace: "nowrap",
              }}
            >
              <Rocket size={15} />
              {creating ? "Creating…" : "Create my repo"}
            </button>
          </div>
          {createError && (
            <div style={{ marginTop: 12, fontSize: 13, color: T.error, padding: "8px 12px", background: T.errorLight, border: `1px solid ${T.errorBorder}`, borderRadius: T.radiusSm }}>
              {createError}
            </div>
          )}
        </Card>
        <button
          onClick={() => { setPhase('intro'); setMessages([]); setManifest(null); setSessionId(null); setError(null); setProjectName(''); setRepo(null); setCreateError(null); }}
          style={{
            background: "transparent", color: T.textSecondary,
            border: "none", padding: 0,
            fontWeight: 500, fontSize: 13, cursor: "pointer", fontFamily: T.font,
          }}
        >
          Start over
        </button>
      </div>
    );
  }

  // chatting phase
  const visibleMessages = [
    ...messages,
    ...(streamText ? [{ role: 'assistant', text: streamText, live: true }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 520 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, margin: 0 }}>Build an App</h1>
        <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 4 }}>Claude is interviewing you to scope your app — answer one question at a time.</p>
      </div>

      <div style={{
        flex: 1, overflowY: "auto",
        border: `1px solid ${T.divider}`, borderRadius: T.radiusMd,
        background: T.bgSubtle, padding: 16,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {visibleMessages.length === 0 && streaming && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px" }}>
            <div style={{
              width: 28, height: 28, borderRadius: T.radiusCircular,
              background: T.primaryLight, display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Brain size={14} color={T.primary} />
            </div>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>Starting your interview…</span>
          </div>
        )}
        {visibleMessages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{
                width: 28, height: 28, borderRadius: T.radiusCircular,
                background: T.primaryLight, display: "flex",
                alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginRight: 8, marginTop: 2,
              }}>
                <Brain size={14} color={T.primary} />
              </div>
            )}
            <div style={{
              maxWidth: "72%",
              background: msg.role === "user" ? T.primary : T.bgPaper,
              color: msg.role === "user" ? "#fff" : T.textPrimary,
              border: msg.role === "user" ? "none" : `1px solid ${T.divider}`,
              borderRadius: msg.role === "user"
                ? `${T.radiusMd}px ${T.radiusMd}px 4px ${T.radiusMd}px`
                : `${T.radiusMd}px ${T.radiusMd}px ${T.radiusMd}px 4px`,
              padding: "10px 14px", fontSize: 14, lineHeight: 1.6,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              fontFamily: T.font,
            }}>
              {msg.text}
              {msg.live && <span style={{ color: T.primary, marginLeft: 1 }}>▌</span>}
            </div>
          </div>
        ))}
        {error && (
          <div style={{
            fontSize: 13, color: T.error, padding: "8px 12px",
            background: T.errorLight, border: `1px solid ${T.errorBorder}`,
            borderRadius: T.radiusSm,
          }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
          disabled={streaming}
          placeholder={streaming ? "Claude is thinking…" : "Type your answer and press Enter"}
          style={{
            flex: 1, padding: "10px 14px",
            border: `1px solid ${T.inputStroke}`, borderRadius: T.radiusSm,
            fontSize: 14, outline: "none", fontFamily: T.font,
            background: streaming ? T.bgHover : T.bgPaper,
            color: T.textPrimary,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          style={{
            padding: "10px 18px", border: "none", borderRadius: T.radiusSm,
            background: streaming || !input.trim() ? T.textDisabled : T.primary,
            color: "#fff", cursor: streaming || !input.trim() ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontWeight: 600, fontSize: 14, fontFamily: T.font,
          }}
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}

function HomePage({ setSection }) {
  const stats = [
    { label: "Active Vibe Apps", value: "23", icon: Rocket, color: T.primary },
    { label: "Avg Deploy Time", value: "2.4 hrs", icon: Clock, color: T.success },
    { label: "Security Pass Rate", value: "94%", icon: Shield, color: T.success },
    { label: "Teams Vibing", value: "8", icon: Users, color: T.purple },
  ];
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 48, paddingTop: 20 }}>
        <div style={{ marginBottom: 12 }}><VibeCodeLogo size={112} /></div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: T.primary }}>Catch The Vibe</h1>
        <p style={{ color: T.textSecondary, fontSize: 16, marginTop: 8, maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>Build fast. Build safe. Your hub for vibe coding at Tricentis — governance, tools, and skills in one place.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {stats.map(s => (
          <Card key={s.label} hover={false} style={{ textAlign: "center", padding: 16 }}>
            <s.icon size={20} color={s.color} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 16 }}>Quick Start</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { icon: Lightbulb, title: "Build an App", desc: "Have an idea to improve your business processes? Let us guide you through it.", color: T.warning, section: "build" },
          { icon: Rocket, title: "Launch an App", desc: "Request a repo, pick a pattern, and start building in minutes", color: T.primary, section: "launchpad" },
          { icon: GraduationCap, title: "Learn the Ropes", desc: "Courses on secure prompting, code review, and deployment", color: T.success, section: "skills" },
          { icon: Shield, title: "Know the Rules", desc: "Deployment requirements, approved languages, and zone classification", color: T.purple, section: "governance" },
        ].map(q => (
          <Card key={q.title} onClick={() => setSection(q.section)}>
            <q.icon size={28} color={q.color} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>{q.title}</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>{q.desc}</div>
            <div style={{ marginTop: 12, fontSize: 13, color: q.color, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>Get started <ChevronRight size={14} /></div>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 16 }}>The Zone Model — Know Before You Code</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {zoneData.map(z => (
          <Card key={z.zone} hover={false} style={{ borderLeft: `3px solid ${z.color}`, background: z.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: z.color }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: z.color }}>{z.zone} Zone</span>
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 8 }}>{z.desc}</div>
            <div style={{ fontSize: 12, color: T.textDisabled, fontStyle: "italic", marginBottom: 10 }}>{z.review}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {z.examples.map(e => <span key={e} style={{ fontSize: 11, padding: "2px 8px", background: z.color + "15", color: z.color, borderRadius: T.radiusSm }}>{e}</span>)}
            </div>
          </Card>
        ))}
      </div>
      <Card hover={false} style={{ background: T.primarySubtle, border: `1px solid ${T.primaryLight}`, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Ready to ship something?</div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>The Launchpad walks you through every step — from idea to deployed app.</div>
          </div>
          <button onClick={() => setSection("launchpad")} style={{ background: T.primary, color: T.textOnPrimary, border: "none", borderRadius: T.radiusXs, padding: "10px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            Go to Launchpad <ArrowRight size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function LaunchpadPage() {
  const [checked, setChecked] = useState({});
  const toggle = id => setChecked(p => ({ ...p, [id]: !p[id] }));
  const total = checklistItems.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  const categories = [...new Set(checklistItems.map(i => i.category))];
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>🚀 Deployment Launchpad</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 24 }}>Track your app's readiness against all deployment requirements. Check items off as you complete them.</p>
      <Card hover={false} style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>Deployment Readiness</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: pct === 100 ? T.success : T.primary }}>{done}/{total} complete ({pct}%)</span>
        </div>
        <div style={{ width: "100%", height: 8, background: T.dividerLight, borderRadius: T.radiusXs, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? T.success : T.primary, borderRadius: T.radiusXs, transition: "width 0.3s" }} />
        </div>
      </Card>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{cat}</h3>
          {checklistItems.filter(i => i.category === cat).map(item => (
            <div key={item.id} onClick={() => toggle(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: T.radiusSm, cursor: "pointer", marginBottom: 4, background: checked[item.id] ? T.successLight : "transparent", border: `1px solid ${checked[item.id] ? T.successBorder : "transparent"}`, transition: "all 0.15s" }}>
              <div style={{ width: 20, height: 20, borderRadius: T.radiusXs, border: `2px solid ${checked[item.id] ? T.success : T.divider}`, background: checked[item.id] ? T.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", flexShrink: 0 }}>
                {checked[item.id] && <CheckCircle size={14} color={T.textOnPrimary} />}
              </div>
              <item.icon size={16} color={checked[item.id] ? T.success : T.textDisabled} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: checked[item.id] ? T.success : T.textPrimary, textDecoration: checked[item.id] ? "line-through" : "none", transition: "all 0.15s" }}>{item.text}</span>
            </div>
          ))}
        </div>
      ))}
      {pct === 100 && (
        <Card hover={false} style={{ background: T.successLight, border: `1px solid ${T.successBorder}`, textAlign: "center", padding: 24, marginTop: 16 }}>
          <CheckCircle size={32} color={T.success} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: T.success }}>All Clear for Deployment!</div>
          <div style={{ fontSize: 13, color: T.success, marginTop: 4 }}>All requirements met. Submit your deployment request to CPE.</div>
        </Card>
      )}
    </div>
  );
}

function GovernancePage() {
  const [expandedDoc, setExpandedDoc] = useState(null);
  const docs = [
    {
      title: "Deployment Requirements Checklist",
      desc: "Complete list of requirements your app must meet before deployment to any environment beyond sandbox.",
      icon: CheckCircle, status: "Required",
      content: [
        { heading: null, text: "Every app must pass all requirements before deploying beyond sandbox. The Launchpad page tracks these interactively across six categories." },
        { heading: "Source Control", text: "Repo follows the vibe-{team}-{app} naming convention. manifest.yaml is complete in the repo root. AGENTS.md is included from the Tricentis standard template." },
        { heading: "Design", text: "Solution Design doc has been peer-reviewed and posted in Confluence. Architecture pattern is selected from the approved catalog. Approval obtained from ITOps, SecOps, PlatSec, and CPE." },
        { heading: "Platform", text: "Deployed to a CPE-managed Azure account via Infrastructure as Code only — no manual console changes. Sandbox deployment completed before any other environment." },
        { heading: "Security", text: "All endpoints behind Tricentis SSO. No hardcoded secrets — all credentials in Key Vault. SAST, SCA, and secret scanning passing in CI. No critical or high CVEs in dependencies." },
        { heading: "Compliance", text: "Encryption at rest and HTTPS enforced. No public storage containers or buckets. PII review completed if applicable." },
        { heading: "Operations", text: "Named owner assigned and reachable. Logging routed to central store with alerting configured. Cost estimate and cost center approved." },
        { heading: null, text: "Green zone apps auto-deploy once all automated checks pass. Yellow zone apps additionally require a peer review. Red zone apps require senior engineer and SecOps sign-off." },
      ],
    },
    {
      title: "Zone Classification Guide",
      desc: "How to determine if your application falls in the Green, Yellow, or Red zone and what that means for review.",
      icon: Shield, status: "Required",
      content: [
        { heading: null, text: "Every project is classified into one of three zones based on what it does — not how it's built." },
        { heading: "Green Zone", text: "UI components, dashboards, prototypes, CRUD interfaces, documentation generators. AI generates code freely. Automated SAST/SCA scans run in CI. Apps auto-deploy on passing scans — no manual gate required." },
        { heading: "Yellow Zone", text: "Business logic, API integrations, data pipelines, webhook handlers, database queries. AI still helps build, but a peer review by a qualified engineer is mandatory before deployment." },
        { heading: "Red Zone", text: "Authentication, authorization, payment processing, encryption logic, PII data handling. AI can suggest approaches, but all generated code must be flagged with SECURITY-REVIEW comments. Reviewed by both a senior engineer and SecOps. No code deploys without their sign-off — no exceptions." },
        { heading: "Key Rule", text: "Zones can escalate (Green → Yellow, Yellow → Red) but never de-escalate. If you're unsure, use the Zone Classifier tool in the Toolbox. When in doubt, classify higher." },
      ],
    },
    {
      title: "Approved Languages & Runtimes",
      desc: "Approved languages, minimum LTS versions, and prohibited runtime configurations.",
      icon: Terminal, status: "Required",
      content: [
        { heading: null, text: "All vibe-coded applications must use an approved language at a Long-Term Support (LTS) version." },
        { heading: "Approved Languages", text: "TypeScript/JavaScript on Node.js 22+ LTS. Python 3.12+. Frontend: React 18+ with TypeScript strict mode preferred." },
        { heading: "Infrastructure as Code", text: "OpenTofu or Bicep only. No manual console changes, no CloudFormation, no Terraform OSS." },
        { heading: "Container Base Images", text: "Use official slim or alpine variants — node:22-alpine, python:3.12-slim. All containers must serve HTTP on port 80 only. TLS is offloaded at the Application Gateway." },
        { heading: "Prohibited", text: "Non-LTS runtime versions. Languages without SAST tooling coverage (Semgrep or CodeQL must support it). Runtime configurations that bypass the security scanning pipeline." },
      ],
    },
    {
      title: "Architecture Pattern Catalog",
      desc: "Pre-approved infrastructure patterns with IaC templates: SPA+Lambda, Container, Event-Driven, Scheduled Job.",
      icon: LayoutGrid, status: "Reference",
      content: [
        { heading: null, text: "Four pre-approved patterns are available, each with a repo template, Dockerfile, CI/CD pipeline, and hosting configuration." },
        { heading: "React SPA", text: "Vite + React served by nginx. Ideal for dashboards and admin panels. Deploys to Web App for Containers. Estimated cost ~$5–15/month." },
        { heading: "Node.js API", text: "Express on Node.js 22 with multi-stage Dockerfile and health check endpoint. Deploys to Web App or AKS. Estimated cost ~$5–50/month." },
        { heading: "Python API", text: "FastAPI/Uvicorn on Python 3.12 with multi-stage Dockerfile. Deploys to Web App or AKS. Estimated cost ~$5–50/month." },
        { heading: "Static Site", text: "Plain HTML/CSS/JS served by nginx with zero build step required. Estimated cost ~$5–10/month." },
        { heading: null, text: "Two additional patterns (Multi-Container and Event-Driven) are planned for a future phase. All patterns include multi-stage Docker builds, port 80 only, and pre-configured CI pipelines with GitGuardian secret scanning, Semgrep SAST, and SCA dependency scanning." },
      ],
    },
    {
      title: "Repository & Naming Standards",
      desc: "How to request a repo, naming conventions (vibe-{team}-{app}), and manifest.yaml specification.",
      icon: GitBranch, status: "Required",
      content: [
        { heading: null, text: "All vibe-coded repos follow the naming convention vibe-{team}-{app} (example: vibe-salesops-demo-scheduler)." },
        { heading: "Every Repo Must Contain", text: "manifest.yaml in the root with app metadata (name, team, zone, owner, cost center, hosting model, tech stack, created date). AGENTS.md from the Tricentis standard template. A Dockerfile matching the chosen architecture pattern. A CI workflow file referencing the platform's composable reusable workflows." },
        { heading: "Repo Creation", text: "Repos are created automatically by the provisioning engine when you register an app through the portal. Never create vibe repos manually — the provisioning engine configures branch protection, CI pipeline references, secrets and variables, and the platform registry entry." },
        { heading: "Branch Protection", text: "All zones require pull requests (no direct commits to main) and require scan status checks to pass. Yellow zone additionally requires at least one approved review. Red zone requires SecOps approval." },
      ],
    },
    {
      title: "AI Rules File Standard (AGENTS.md)",
      desc: "The Tricentis standard AGENTS.md template and how it integrates with Cursor, Claude Code, Copilot, and other AI tools.",
      icon: Code, status: "Required",
      content: [
        { heading: null, text: "AGENTS.md is a rules file that AI coding assistants (Cursor, Claude Code, Copilot, Codex, Windsurf) read automatically at the start of every session. It injects Tricentis security requirements, approved languages, coding standards, and dependency policies into the AI's context so generated code follows them by default." },
        { heading: "Template", text: "The Tricentis standard template is available in the Toolbox. Every repo ships with the generic template — teams must customize the Project Overview and Approved Tech Stack sections for their specific app." },
        { heading: "Mandatory Security Rules", text: "Never hardcode secrets. Always validate and sanitize inputs. Always encode output to prevent XSS. Never use eval() or exec(). Use parameterized queries only — no SQL string concatenation. Use established auth libraries — never roll custom authentication. Never log PII or sensitive data. If unsure about a security pattern, flag it with a SECURITY-REVIEW comment." },
        { heading: "Important", text: "The security requirements section of AGENTS.md is mandatory and must never be weakened or removed." },
      ],
    },
    {
      title: "Data Classification & PII Policy",
      desc: "When a privacy review is required, how to handle sensitive data, and what cannot be stored.",
      icon: Eye, status: "Required",
      content: [
        { heading: null, text: "A privacy review is required for any app that collects, stores, processes, or displays personal data — including names, email addresses, employee IDs, IP addresses, and location data." },
        { heading: "Data Classifications", text: "Public (non-sensitive, no restrictions). Internal (Tricentis employees only — default for all vibe apps). Confidential (PII, business-sensitive — requires encryption at rest and in transit, access logging, and retention policies). Restricted (regulated, financial, or health data — requires SecOps review, may be out of scope for vibe apps)." },
        { heading: "Prohibited", text: "No PII in client-side storage (localStorage, cookies, IndexedDB). No PII in application logs. No PII in AI prompts or tool context. No customer data in any vibe app without explicit Privacy team approval." },
        { heading: "Zone Impact", text: "Green zone apps typically do not handle PII. If yours does, it should be reclassified to Yellow or Red. Contact the Privacy team before development begins if your app needs to handle personal data." },
      ],
    },
    {
      title: "Dependency & Supply Chain Policy",
      desc: "Private registry requirements, license compliance, and handling AI-hallucinated packages.",
      icon: AlertTriangle, status: "Required",
      content: [
        { heading: null, text: "All packages must be available in the Tricentis private registry. Pin all dependency versions — no floating ranges (^ or ~)." },
        { heading: "CVE Policy", text: "The CI pipeline runs npm audit or pip-audit automatically. Critical or high CVEs block deployment. Check for known vulnerabilities before adding any new package." },
        { heading: "License Compliance", text: "Approved licenses: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC. Copyleft licenses (GPL, AGPL, LGPL) require legal review before use." },
        { heading: "AI-Specific Risk", text: "AI tools frequently hallucinate package names that do not exist. Never install a package you cannot find documentation for. Verify package names in the registry before installing. The CI pipeline catches known-vulnerable dependencies but cannot detect hallucinated packages that happen to exist with malicious content (typosquatting)." },
      ],
    },
    {
      title: "Cost Management Guidelines",
      desc: "Budget alerts, cost ceilings, quarterly review process, and what happens when spend exceeds estimates.",
      icon: TrendingUp, status: "Reference",
      content: [
        { heading: null, text: "Every app must have an approved cost estimate and an assigned cost center before deployment." },
        { heading: "Cost Tracking", text: "Costs are tracked via Azure resource tags (vibe-app, vibe-team, vibe-zone, cost-center) and monitored through Vantage. Budget alerts are configured at the cost center level." },
        { heading: "Estimated Costs", text: "Green zone apps ~$5–15/month. Yellow zone apps ~$20–50/month. Platform baseline (shared infrastructure) ~$750–1,100/month." },
        { heading: "Overspend Policy", text: "If actual spend exceeds the estimate by more than 25%, the platform team will reach out. Quarterly cost reviews are conducted with team leads. Apps with no traffic for 90+ days are flagged for decommissioning." },
        { heading: "Custom Resources", text: "Custom domains and additional infrastructure (databases, message queues) increase costs — include these in your estimate. Use the Cost Estimator tool in the Toolbox." },
      ],
    },
    {
      title: "Incident Response for Vibe Apps",
      desc: "What to do when a vulnerability is found, who to contact, and the patching SLA.",
      icon: Zap, status: "Required",
      content: [
        { heading: null, text: "When a vulnerability is discovered in a deployed vibe app, the owning team is responsible for remediation." },
        { heading: "Response Timelines", text: "Critical CVEs — patched or mitigated within 24 hours. High CVEs — within 72 hours. Medium — within 30 days. Low — at next scheduled maintenance." },
        { heading: "Escalation", text: "If the owning team cannot remediate within the SLA, escalate to the platform team. The platform team can force-deploy a patched version, roll back to a previous image, or take the app offline if necessary." },
        { heading: "Security Incidents", text: "Immediately notify SecOps if you suspect a breach, data exposure, or unauthorized access. Do not modify logs or evidence. Document the timeline in the incident channel." },
        { heading: "Owner Responsibility", text: "The named owner on every app (visible in the portal and manifest.yaml) is the first contact point. If the owner is unreachable, the team lead is the fallback. Apps without a reachable owner may be taken offline." },
      ],
    },
    {
      title: "Acceptable Use Policy",
      desc: "Who can use AI coding tools, what data can be in prompts, and prohibited practices.",
      icon: Lock, status: "Required",
      content: [
        { heading: null, text: "AI coding tools (Cursor, Claude Code, GitHub Copilot, Codex, Windsurf, Claude Desktop) are approved for use by all Tricentis employees on internal projects." },
        { heading: "Who Can Use Them", text: "Any employee with a Tricentis-managed device and access to approved tool licenses." },
        { heading: "Allowed in Prompts", text: "Source code from Tricentis repos, internal documentation, architecture descriptions, error messages, stack traces." },
        { heading: "Never Allowed in Prompts", text: "Customer data, PII, credentials or secrets, proprietary algorithms marked as trade secrets, data covered by NDA or regulatory restriction." },
        { heading: "Developer Responsibility", text: "AI-generated code is treated the same as human-written code. It must pass all scans, reviews, and compliance checks. The developer who submits AI-generated code is responsible for its correctness and security." },
        { heading: "Prohibited Practices", text: "Using AI to bypass security controls. Feeding AI tools credentials to \"help with auth.\" Asking AI to generate code that intentionally weakens security posture. Using personal (non-Tricentis) AI accounts for work projects." },
      ],
    },
  ];
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>📋 Governance & Policies</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 24 }}>Everything you need to know to stay compliant. Required reading is marked — the rest is there when you need it.</p>
      <div style={{ display: "grid", gap: 12 }}>
        {docs.map(d => (
          <Card key={d.title} onClick={() => setExpandedDoc(expandedDoc === d.title ? null : d.title)}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <d.icon size={20} color={T.primary} style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{d.title}</span>
                  <Badge color={d.status === "Required" ? T.error : T.textDisabled}>{d.status}</Badge>
                </div>
                <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>{d.desc}</div>
              </div>
              {expandedDoc === d.title
                ? <ChevronUp size={16} color={T.primary} style={{ flexShrink: 0, marginTop: 4 }} />
                : <ChevronDown size={16} color={T.textDisabled} style={{ flexShrink: 0, marginTop: 4 }} />}
            </div>
            {expandedDoc === d.title && d.content && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.dividerLight}` }}>
                {d.content.map((section, idx) => (
                  <div key={idx} style={{ marginBottom: 14 }}>
                    {section.heading && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>
                        {section.heading}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
                      {section.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function SkillsPage() {
  const [filter, setFilter] = useState("All");
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];
  const filtered = filter === "All" ? learningPaths : learningPaths.filter(l => l.level === filter);
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>🎓 Skills & Learning</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 20 }}>Level up your vibe coding skills. Complete the Beginner track before deploying your first app.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {levels.map(l => (
          <button key={l} onClick={() => setFilter(l)} style={{ padding: "6px 16px", borderRadius: T.radiusCircular, border: `1px solid ${filter === l ? T.primary : T.dividerLight}`, background: filter === l ? T.primarySubtle : "transparent", color: filter === l ? T.primary : T.textDisabled, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filtered.map(l => (
          <Card key={l.title}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{l.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 6 }}>{l.title}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <Badge color={l.level === "Beginner" ? T.success : l.level === "Intermediate" ? T.warning : T.error}>{l.level}</Badge>
              <Badge color={T.textDisabled}>{l.duration}</Badge>
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5, marginBottom: 12 }}>{l.desc}</div>
            <div style={{ display: "flex", gap: 4 }}>
              {l.tags.map(t => <span key={t} style={{ fontSize: 11, padding: "2px 8px", background: T.primarySubtle, color: T.primary, borderRadius: T.radiusSm }}>{t}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Architecture Picker Panel (Toolbox) ────────────────────────────────────

function ArchitecturePickerPanel({ onSelectPattern }) {
  const [expandedPattern, setExpandedPattern] = useState(null);

  return (
    <div>
      <div style={{
        padding: "16px 18px", marginBottom: 20, borderRadius: T.radiusMd,
        background: T.primarySubtle || T.primaryLight, border: `1px solid ${T.primaryLight}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <LayoutGrid size={16} color={T.primary} />
          <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>How It Works</span>
        </div>
        <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, margin: 0 }}>
          Each pattern includes a pre-configured repo template, Dockerfile, CI/CD pipeline, and hosting setup.
          Pick the one that matches your use case, then register your app — the platform handles the rest.
        </p>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {ARCHITECTURE_PATTERNS.map(pat => {
          const expanded = expandedPattern === pat.value;
          const disabled = !pat.available;

          return (
            <div
              key={pat.value}
              style={{
                borderRadius: T.radiusMd,
                border: `1px solid ${disabled ? T.dividerLight : expanded ? T.primary : T.dividerLight}`,
                background: disabled ? T.bgPage : T.bgPaper,
                overflow: "hidden",
                opacity: disabled ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {/* Card Header — always visible */}
              <div
                onClick={() => !disabled && setExpandedPattern(expanded ? null : pat.value)}
                style={{
                  padding: "18px 20px",
                  cursor: disabled ? "default" : "pointer",
                  display: "flex", alignItems: "flex-start", gap: 16,
                }}
              >
                <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{pat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: disabled ? T.textDisabled : T.textPrimary }}>
                      {pat.label}
                    </span>
                    {disabled && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 10px",
                        borderRadius: T.radiusCircular,
                        background: T.dividerLight, color: T.textDisabled,
                      }}>
                        Coming Soon
                      </span>
                    )}
                    {!disabled && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 10px",
                        borderRadius: T.radiusCircular,
                        background: pat.hosting === "aks" ? (T.purpleLight || "#F3EEFB") : T.successLight,
                        color: pat.hosting === "aks" ? T.purple : T.success,
                      }}>
                        {pat.hosting === "aks" ? "AKS" : "Web App"}
                      </span>
                    )}
                    {!disabled && (
                      <span style={{ fontSize: 12, color: T.textDisabled, marginLeft: "auto" }}>
                        ~{pat.estimatedCost}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: disabled ? T.textDisabled : T.textSecondary, lineHeight: 1.5 }}>
                    {pat.desc}
                  </div>
                  {!disabled && (
                    <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 6 }}>
                      <strong style={{ color: T.textSecondary }}>Best for:</strong> {pat.bestFor}
                    </div>
                  )}
                </div>
                {!disabled && (
                  <div style={{ flexShrink: 0, marginTop: 4 }}>
                    {expanded
                      ? <ChevronUp size={18} color={T.primary} />
                      : <ChevronDown size={18} color={T.textDisabled} />}
                  </div>
                )}
              </div>

              {/* Expanded Detail — shown when clicked */}
              {expanded && !disabled && (
                <div style={{
                  padding: "0 20px 20px",
                  borderTop: `1px solid ${T.dividerLight}`,
                  paddingTop: 16,
                }}>
                  {/* What's Included */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 10 }}>
                      What's Included
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {pat.includes.map(item => (
                        <span key={item} style={{
                          fontSize: 12, padding: "5px 12px",
                          borderRadius: T.radiusCircular,
                          background: T.primaryLight + "66",
                          color: T.primary,
                          display: "flex", alignItems: "center", gap: 5,
                        }}>
                          <CheckCircle size={11} /> {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hosting Options */}
                  {pat.hostingOptions && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 10 }}>
                        Hosting Options
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{
                          flex: 1, padding: "12px 14px", borderRadius: T.radiusSm,
                          border: `1px solid ${T.successBorder}`, background: T.successLight,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.success, marginBottom: 4 }}>
                            Web App for Containers
                          </div>
                          <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.4 }}>
                            Simple, managed hosting. Best for single-container apps with low to moderate traffic.
                          </div>
                        </div>
                        <div style={{
                          flex: 1, padding: "12px 14px", borderRadius: T.radiusSm,
                          border: `1px solid ${T.purple}33`, background: T.purpleLight || "#F3EEFB",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.purple, marginBottom: 4 }}>
                            AKS (Kubernetes)
                          </div>
                          <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.4 }}>
                            Kubernetes hosting. Required for multi-container, high-traffic, or complex deployments.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specs Table */}
                  <div style={{
                    background: T.bgPage, borderRadius: T.radiusSm,
                    border: `1px solid ${T.dividerLight}`, padding: 14, marginBottom: 16,
                  }}>
                    {[
                      { label: "Default Zone", value: pat.defaultZone.charAt(0).toUpperCase() + pat.defaultZone.slice(1) },
                      { label: "Default Hosting", value: pat.hosting === "aks" ? "AKS" : "Web App for Containers" },
                      { label: "Estimated Cost", value: pat.estimatedCost },
                      { label: "Container Port", value: "80 (HTTP only — TLS offloaded at gateway)" },
                    ].map(row => (
                      <div key={row.label} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "5px 0", borderBottom: `1px solid ${T.dividerLight}`,
                      }}>
                        <span style={{ fontSize: 12, color: T.textDisabled }}>{row.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: T.textPrimary }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Register Button */}
                  <button
                    onClick={() => onSelectPattern(pat.value, pat.hosting, pat.defaultZone)}
                    style={{
                      width: "100%", padding: "10px 20px",
                      background: T.primary, color: T.textOnPrimary || "#fff",
                      border: "none", borderRadius: T.radiusXs,
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Rocket size={15} /> Register App with {pat.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolboxPage() {
  const [showAgentsMd, setShowAgentsMd] = useState(false);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [showArchPicker, setShowArchPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const categories = [...new Set(tools.map(t => t.category))];

  const copyAgentsMd = () => {
    navigator.clipboard.writeText(agentsMdContent).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>🧰 Toolbox</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 24 }}>Self-service tools to help you build and deploy faster — with guardrails built in.</p>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{cat}</h3>

          {cat === "AI Rules & Context" && (
            <Card hover={false} style={{ marginBottom: 16, background: T.primarySubtle, border: `1px solid ${T.primaryLight}`, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Brain size={18} color={T.purple} />
                <span style={{ fontSize: 14, fontWeight: 700, color: T.purple }}>Why This Section Matters</span>
              </div>
              <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6, margin: 0 }}>
                AI coding tools have no memory between sessions. Without instructions, every prompt starts from zero — no knowledge of your security requirements, coding standards, or approved patterns. <strong style={{ color: T.textPrimary }}>Rules files</strong> (like AGENTS.md) inject your standards directly into the AI's context so it follows them automatically. <strong style={{ color: T.textPrimary }}>Prompting techniques</strong> help you communicate effectively with AI to get secure, maintainable output. Together, these are the difference between AI that helps and AI that creates tech debt.
              </p>
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {tools.filter(t => t.category === cat).map(t => (
              <Card key={t.name} onClick={t.name === "AI Rules & AGENTS.md" ? () => setShowAgentsMd(!showAgentsMd) : t.name === "Vibe Coding Playbook" ? () => setShowPlaybook(!showPlaybook) : t.name === "Architecture Picker" ? () => setShowArchPicker(!showArchPicker) : undefined}
                style={t.featured ? { border: `1px solid ${T.primaryLight}`, background: T.primarySubtle } : {}}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: T.radiusMd, background: t.featured ? T.primaryLight : T.bgPage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <t.icon size={20} color={t.featured ? T.primary : T.primary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{t.name}</span>
                      {t.featured && <Badge color={T.purple}>Key</Badge>}
                    </div>
                    <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{t.desc}</div>
                    <button style={{ background: t.featured ? T.primary : T.bgPage, color: t.featured ? T.textOnPrimary : T.primary, border: `1px solid ${t.featured ? T.primary : T.dividerLight}`, borderRadius: T.radiusXs, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      {t.action} <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {cat === "Getting Started" && showArchPicker && (
            <div style={{ marginTop: 16 }}>
              <Card hover={false} style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LayoutGrid size={18} color={T.primary} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>Architecture Patterns</span>
                  </div>
                  <button
                    onClick={() => setShowArchPicker(false)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: T.textDisabled, fontSize: 18, padding: 4,
                    }}
                  >✕</button>
                </div>
                <ArchitecturePickerPanel
                  onSelectPattern={(stack, hosting, zone) => {
                    setShowArchPicker(false);
                    if (window.__catchTheVibe_registerApp) {
                      window.__catchTheVibe_registerApp(stack, hosting, zone);
                    }
                  }}
                />
              </Card>
            </div>
          )}

          {cat === "AI Rules & Context" && showAgentsMd && (
            <div style={{ marginTop: 16 }}>
              <Card hover={false} style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: `1px solid ${T.dividerLight}`, background: T.bgPage }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Code size={16} color={T.primary} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>AGENTS.md — Tricentis Standard Template</span>
                  </div>
                  <button onClick={copyAgentsMd} style={{ background: copied ? T.successLight : T.bgPaper, color: copied ? T.success : T.primary, border: `1px solid ${copied ? T.successBorder : T.dividerLight}`, borderRadius: T.radiusXs, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
                    {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
                  </button>
                </div>
                <div style={{ padding: "4px 0" }}>
                  <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.dividerLight}`, background: T.warningLight }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Lightbulb size={14} color={T.warning} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.warning }}>How to use this file</span>
                    </div>
                    <p style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5, margin: 0 }}>
                      This is the <strong style={{ color: T.textPrimary }}>generic Tricentis starting template</strong> that ships with every vibe-* repo. Copy it into your repo root and tailor the "Project Overview" and "Approved Tech Stack" sections for your specific app — add your language, framework, design system, and architecture decisions. The security requirements section is mandatory and must not be weakened. AI coding tools (Cursor, Claude Code, Copilot, Codex, Windsurf) read this file automatically at the start of every session.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 12px", background: T.primarySubtle, borderRadius: T.radiusXs, border: `1px solid ${T.primaryLight}` }}>
                      <AlertTriangle size={13} color={T.primary} />
                      <span style={{ fontSize: 11, color: T.primary, lineHeight: 1.4 }}>This template is a starting point. Your repo's AGENTS.md should be project-specific — include your actual tech stack, architecture, and workspace layout so AI tools generate code that matches your project, not generic defaults.</span>
                    </div>
                  </div>
                  <pre style={{ margin: 0, padding: "16px 18px", fontSize: 12, lineHeight: 1.6, color: T.textSecondary, background: T.bgPage, overflow: "auto", maxHeight: 500, fontFamily: T.monoFont, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {agentsMdContent}
                  </pre>
                </div>
              </Card>
            </div>
          )}

          {cat === "AI Rules & Context" && showPlaybook && (
            <div style={{ marginTop: 16 }}>
              <Card hover={false} style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Brain size={18} color={T.primary} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>Vibe Coding Playbook</span>
                </div>
                <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5, marginBottom: 16, marginTop: 4 }}>
                  Practical techniques that make AI-assisted coding more predictable and secure. These aren't just nice-to-haves — they directly reduce the bugs, vulnerabilities, and tech debt that vibe coding can introduce.
                </p>
                {playbookTechniques.map(t => (
                  <Expandable key={t.title} title={t.title} icon={t.icon}>
                    <p style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.6, marginTop: 8, marginBottom: 12 }}>{t.desc}</p>
                    <div style={{ background: T.bgPage, border: `1px solid ${T.dividerLight}`, borderRadius: T.radiusMd, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textDisabled, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Example Prompt</div>
                      <div style={{ fontSize: 13, color: T.primary, fontFamily: T.monoFont, lineHeight: 1.5 }}>{t.example}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <AlertTriangle size={14} color={T.warning} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}><strong style={{ color: T.warning }}>Why it matters:</strong> {t.why}</div>
                    </div>
                  </Expandable>
                ))}
              </Card>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShowcasePage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>✨ Showcase</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 24 }}>Apps built by Tricentis teams using vibe coding — proving you can move fast and stay safe.</p>
      <div style={{ display: "grid", gap: 16 }}>
        {showcaseApps.map(a => {
          const zc = a.zone === "Green" ? T.success : a.zone === "Yellow" ? T.warning : T.error;
          return (
            <Card key={a.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{a.name}</span>
                    <Badge color={zc}>{a.zone}</Badge>
                    <Badge color={a.status === "Live" ? T.success : T.warning}>{a.status}</Badge>
                  </div>
                  <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 10, lineHeight: 1.5 }}>{a.desc}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textDisabled }}>
                    <span><Users size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{a.team}</span>
                    <span><Terminal size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{a.lang}</span>
                    <span><Cloud size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{a.pattern}</span>
                  </div>
                </div>
                <Star size={20} color={T.divider} />
              </div>
            </Card>
          );
        })}
      </div>
      <Card hover={false} style={{ marginTop: 24, textAlign: "center", padding: 24, border: `1px dashed ${T.divider}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.primary, marginBottom: 4 }}>Built something cool?</div>
        <div style={{ fontSize: 13, color: T.textSecondary }}>Submit your app to the showcase and help other teams learn from your approach.</div>
      </Card>
    </div>
  );
}

// ─── App Registration Form ──────────────────────────────────────────────────

const ARCHITECTURE_PATTERNS = [
  {
    value: "react-spa",
    label: "React SPA",
    icon: "⚛️",
    available: true,
    hosting: "webapp",
    desc: "Single-page React app built with Vite, served by nginx in a container.",
    includes: ["Vite + React template", "nginx.conf for SPA routing", "Multi-stage Dockerfile", "CI pipeline with SAST/SCA scans"],
    defaultZone: "green",
    estimatedCost: "$5–15/mo",
    bestFor: "Dashboards, admin panels, internal tools, prototypes",
  },
  {
    value: "node-api",
    label: "Node.js API",
    icon: "🟢",
    available: true,
    hosting: "webapp",
    hostingOptions: ["webapp", "aks"],
    desc: "Express backend API running on Node.js 22 LTS.",
    includes: ["Express project scaffold", "Multi-stage Dockerfile", "Health check endpoint", "CI pipeline with SAST/SCA scans"],
    defaultZone: "yellow",
    estimatedCost: "$5–50/mo",
    bestFor: "REST APIs, webhook handlers, BFF layers, integrations",
  },
  {
    value: "python-api",
    label: "Python API",
    icon: "🐍",
    available: true,
    hosting: "webapp",
    hostingOptions: ["webapp", "aks"],
    desc: "FastAPI/Uvicorn backend running on Python 3.12.",
    includes: ["FastAPI project scaffold", "Multi-stage Dockerfile", "Health check endpoint", "CI pipeline with SAST/SCA scans"],
    defaultZone: "yellow",
    estimatedCost: "$5–50/mo",
    bestFor: "Data APIs, ML endpoints, automation services, scripts-as-a-service",
  },
  {
    value: "static-site",
    label: "Static Site",
    icon: "📄",
    available: true,
    hosting: "webapp",
    desc: "Plain HTML/CSS/JS served by nginx. No build step required.",
    includes: ["nginx container with static serving", "Optional build step for generators", "CI pipeline with scans", "Zero-config deployment"],
    defaultZone: "green",
    estimatedCost: "$5–10/mo",
    bestFor: "Documentation sites, landing pages, simple tools, design prototypes",
  },
  {
    value: "multi-container",
    label: "Multi-Container",
    icon: "🐳",
    available: false,
    hosting: "aks",
    desc: "API + Worker + shared database. Runs on AKS with multiple pods.",
    includes: ["API container + Worker container", "Shared PostgreSQL module", "ArgoCD multi-service manifests", "Inter-service networking"],
    defaultZone: "yellow",
    estimatedCost: "$30–80/mo",
    bestFor: "Background processing, queue-based workloads, complex backends",
  },
  {
    value: "event-driven",
    label: "Event-Driven",
    icon: "⚡",
    available: false,
    hosting: "aks",
    desc: "Message queue + processor pattern. Runs on AKS with auto-scaling consumers.",
    includes: ["Producer API container", "Consumer worker container", "Azure Service Bus integration", "KEDA auto-scaling"],
    defaultZone: "yellow",
    estimatedCost: "$40–100/mo",
    bestFor: "Event processing, async workflows, high-throughput data pipelines",
  },
];

const ZONE_OPTIONS = [
  { value: "green", label: "Green", color: T.success, desc: "UI, dashboards, prototypes, internal tools. Automated scan + light review." },
  { value: "yellow", label: "Yellow", color: T.warning, desc: "Business logic, APIs, data transforms. Automated scan + peer review required." },
  { value: "red", label: "Red", color: T.error, desc: "Auth, crypto, payments, PII handling. Senior + SecOps verify." },
];

function RegistrationForm({ user, onComplete, onCancel, initialData }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    team: user?.team || "",
    stack: initialData?.stack || "",
    zone: initialData?.zone || "green",
    hosting: initialData?.hosting || "webapp",
    costCenter: "",
  });

  const totalSteps = 3;

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const slugify = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

  const ZONE_LEVELS = { green: 0, yellow: 1, red: 2 };

  const getPatternDefaultZone = () => {
    const pattern = ARCHITECTURE_PATTERNS.find(p => p.value === form.stack);
    return pattern ? pattern.defaultZone : "green";
  };

  const handleZoneChange = (newZone) => {
    update("zone", newZone);
  };

  const isZoneBelowRecommended = (zone) => {
    const patternZone = getPatternDefaultZone();
    return ZONE_LEVELS[zone] < ZONE_LEVELS[patternZone];
  };

  const handleDisplayNameChange = (value) => {
    update("displayName", value);
    if (!form.name || form.name === slugify(form.displayName)) {
      update("name", slugify(value));
    }
  };

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        if (!form.displayName.trim()) return "Display name is required";
        if (!form.name.trim()) return "App name is required";
        if (form.name.length < 3) return "App name must be at least 3 characters";
        if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(form.name)) return "App name must be lowercase, alphanumeric with hyphens, cannot start/end with hyphen";
        if (!form.team.trim()) return "Team is required";
        return null;
      case 2:
        if (!form.stack) return "Select an architecture pattern";
        if (!ARCHITECTURE_PATTERNS.find(p => p.value === form.stack)?.available) return "That pattern is not available yet";
        return null;
      case 3:
        if (!form.costCenter.trim()) return "Cost center is required";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setSubmitting(false);
        return;
      }

      onComplete(data);
    } catch (e) {
      setError("Network error — please try again");
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: T.radiusXs,
    border: `1px solid ${T.dividerLight}`,
    background: T.bgPaper,
    color: T.textPrimary,
    fontSize: 14,
    fontFamily: T.font,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: T.textSecondary,
    marginBottom: 6,
  };

  const fieldGap = { marginBottom: 20 };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }}>
      <div style={{
        background: T.bgPaper, borderRadius: T.radiusLg,
        boxShadow: T.shadowLg, width: 560, maxHeight: "90vh",
        overflow: "auto", padding: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${T.dividerLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.textPrimary }}>
              Register New App
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textDisabled }}>
              Step {step} of {totalSteps}
            </p>
          </div>
          <button onClick={onCancel} style={{
            background: "none", border: "none", cursor: "pointer",
            color: T.textDisabled, fontSize: 20, padding: 4,
          }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: T.dividerLight }}>
          <div style={{
            height: "100%", width: `${(step / totalSteps) * 100}%`,
            background: T.primary, transition: "width 0.3s",
          }} />
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>

          {/* Step 1: Basics */}
          {step === 1 && (
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                App Identity
              </h3>
              <div style={fieldGap}>
                <label style={labelStyle}>Display Name</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="QA Test Dashboard"
                  value={form.displayName}
                  onChange={e => handleDisplayNameChange(e.target.value)}
                />
                <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 4 }}>
                  Human-readable name shown in the portal and nav bar.
                </div>
              </div>
              <div style={fieldGap}>
                <label style={labelStyle}>App Name (slug)</label>
                <input
                  type="text"
                  style={{ ...inputStyle, fontFamily: T.monoFont }}
                  placeholder="qtest-dashboard"
                  value={form.name}
                  onChange={e => update("name", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
                <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 4 }}>
                  Used in repo name, hostname, and URLs: <span style={{ fontFamily: T.monoFont }}>{form.name || "your-app"}.build.tricentis.com</span>
                </div>
              </div>
              <div style={fieldGap}>
                <label style={labelStyle}>Team</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="quality-engineering"
                  value={form.team}
                  onChange={e => update("team", e.target.value)}
                />
                <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 4 }}>
                  Your Tricentis team. Used for repo naming and default access group.
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Architecture Pattern & Zone */}
          {step === 2 && (
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                Architecture Pattern
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: T.textSecondary }}>
                Each pattern includes a repo template, Dockerfile, CI/CD pipeline, and hosting configuration.
              </p>

              <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
                {ARCHITECTURE_PATTERNS.map(pat => {
                  const selected = form.stack === pat.value;
                  const disabled = !pat.available;
                  return (
                    <div
                      key={pat.value}
                      onClick={() => {
                        if (disabled) return;
                        update("stack", pat.value);
                        update("hosting", pat.hosting);
                      }}
                      style={{
                        padding: "16px 18px", borderRadius: T.radiusMd,
                        border: `2px solid ${selected ? T.primary : disabled ? T.dividerLight : T.dividerLight}`,
                        background: disabled ? T.bgPage : selected ? (T.primarySubtle || T.primaryLight) : T.bgPaper,
                        cursor: disabled ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        opacity: disabled ? 0.55 : 1,
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{pat.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: disabled ? T.textDisabled : T.textPrimary }}>
                              {pat.label}
                            </span>
                            {disabled && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 8px",
                                borderRadius: T.radiusCircular,
                                background: T.dividerLight, color: T.textDisabled,
                              }}>
                                Coming Soon
                              </span>
                            )}
                            {!disabled && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 8px",
                                borderRadius: T.radiusCircular,
                                background: pat.hosting === "aks" ? T.purpleLight || "#F3EEFB" : T.successLight,
                                color: pat.hosting === "aks" ? T.purple : T.success,
                              }}>
                                {pat.hosting === "aks" ? "AKS" : "Web App"}
                              </span>
                            )}
                            {!disabled && (
                              <span style={{
                                fontSize: 11, color: T.textDisabled, marginLeft: "auto",
                              }}>
                                ~{pat.estimatedCost}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: 13, color: disabled ? T.textDisabled : T.textSecondary,
                            lineHeight: 1.5, marginBottom: 8,
                          }}>
                            {pat.desc}
                          </div>
                          {!disabled && (
                            <div style={{ fontSize: 12, color: T.textDisabled, marginBottom: 8 }}>
                              <strong style={{ color: disabled ? T.textDisabled : T.textSecondary }}>Best for:</strong> {pat.bestFor}
                            </div>
                          )}
                          {!disabled && selected && (
                            <div style={{
                              display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4,
                            }}>
                              {pat.includes.map(item => (
                                <span key={item} style={{
                                  fontSize: 11, padding: "3px 10px",
                                  borderRadius: T.radiusCircular,
                                  background: T.primaryLight + "66",
                                  color: T.primary,
                                  display: "flex", alignItems: "center", gap: 4,
                                }}>
                                  <CheckCircle size={10} /> {item}
                                </span>
                              ))}
                            </div>
                          )}
                          {!disabled && pat.hostingOptions && selected && (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>
                                Hosting Model
                              </div>
                              <div style={{ display: "flex", gap: 8 }}>
                                {pat.hostingOptions.map(opt => {
                                  const hostSelected = form.hosting === opt;
                                  return (
                                    <button
                                      key={opt}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        update("hosting", opt);
                                      }}
                                      style={{
                                        padding: "6px 14px", borderRadius: T.radiusXs,
                                        border: `1px solid ${hostSelected ? T.primary : T.dividerLight}`,
                                        background: hostSelected ? (T.primarySubtle || T.primaryLight) : T.bgPaper,
                                        color: hostSelected ? T.primary : T.textSecondary,
                                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                                      }}
                                    >
                                      {opt === "webapp" ? "Web App for Containers" : "AKS (Kubernetes)"}
                                    </button>
                                  );
                                })}
                              </div>
                              <div style={{ fontSize: 11, color: T.textDisabled, marginTop: 4 }}>
                                {form.hosting === "webapp"
                                  ? "Simple, managed hosting. Best for single-container apps with low to moderate traffic."
                                  : "Kubernetes hosting. Required for multi-container, high-traffic, or complex deployments."}
                              </div>
                            </div>
                          )}
                        </div>
                        {selected && !disabled && (
                          <CheckCircle size={20} color={T.primary} style={{ flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                Zone Classification
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: T.textSecondary }}>
                Determines review requirements and default access controls.
                {form.stack && (
                  <span> Pre-set to <strong>{getPatternDefaultZone().charAt(0).toUpperCase() + getPatternDefaultZone().slice(1)}</strong> based on your architecture pattern.</span>
                )}
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {ZONE_OPTIONS.map(opt => {
                  const selected = form.zone === opt.value;
                  const belowRecommended = form.stack && isZoneBelowRecommended(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleZoneChange(opt.value)}
                      style={{
                        padding: "14px 16px", borderRadius: T.radiusMd,
                        border: `2px solid ${selected ? opt.color : T.dividerLight}`,
                        background: selected ? opt.color + "10" : T.bgPaper,
                        cursor: "pointer", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      <div style={{
                        width: 12, height: 12, borderRadius: "50%",
                        background: opt.color, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{opt.label} Zone</span>
                          {form.stack && opt.value === getPatternDefaultZone() && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "1px 8px",
                              borderRadius: T.radiusCircular,
                              background: T.primaryLight, color: T.primary,
                            }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{opt.desc}</div>
                      </div>
                      {selected && <CheckCircle size={18} color={opt.color} />}
                    </div>
                  );
                })}
              </div>

              {/* Warning when selecting below recommended zone */}
              {form.stack && isZoneBelowRecommended(form.zone) && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: T.radiusSm,
                  background: T.errorLight || "#FEE2E2", border: `1px solid ${T.error}33`,
                  fontSize: 12, color: T.textSecondary, display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <AlertTriangle size={14} color={T.error} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    <strong style={{ color: T.error }}>Zone below recommendation.</strong>{" "}
                    The <strong>{ARCHITECTURE_PATTERNS.find(p => p.value === form.stack)?.label}</strong> pattern
                    is typically <strong>{getPatternDefaultZone().charAt(0).toUpperCase() + getPatternDefaultZone().slice(1)} zone</strong>.
                    Selecting a lower zone means fewer review gates — make sure your app doesn't handle business logic, APIs, auth, or sensitive data.
                  </span>
                </div>
              )}

              {/* Standard hint */}
              {!(form.stack && isZoneBelowRecommended(form.zone)) && (
                <div style={{
                  marginTop: 12, padding: "10px 14px", borderRadius: T.radiusSm,
                  background: "#FEF3C7", border: `1px solid ${T.warning}33`,
                  fontSize: 12, color: T.textSecondary, display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <AlertTriangle size={14} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Not sure? Use the <strong>Zone Classifier</strong> in the Toolbox. Zones can escalate later but never de-escalate.</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
                Finalize & Submit
              </h3>
              <div style={fieldGap}>
                <label style={labelStyle}>Cost Center</label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="CC-4521"
                  value={form.costCenter}
                  onChange={e => update("costCenter", e.target.value)}
                />
                <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 4 }}>
                  Finance cost center for resource billing. Check with your manager if unsure.
                </div>
              </div>

              {/* Review summary */}
              <div style={{
                background: T.bgPage, borderRadius: T.radiusMd,
                border: `1px solid ${T.dividerLight}`, padding: 16, marginTop: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 12 }}>
                  Review
                </div>
                {[
                  { label: "App Name", value: form.name, mono: true },
                  { label: "Display Name", value: form.displayName },
                  { label: "Team", value: form.team },
                  { label: "Architecture", value: ARCHITECTURE_PATTERNS.find(p => p.value === form.stack)?.label || form.stack },
                  { label: "Hosting", value: form.hosting === "aks" ? "AKS (Kubernetes)" : "Web App for Containers" },
                  { label: "Zone", value: form.zone.charAt(0).toUpperCase() + form.zone.slice(1) },
                  { label: "Hostname", value: `${form.name || "your-app"}.build.tricentis.com`, mono: true },
                  { label: "Est. Cost", value: ARCHITECTURE_PATTERNS.find(p => p.value === form.stack)?.estimatedCost || "—" },
                  { label: "Cost Center", value: form.costCenter },
                  { label: "Owner", value: user?.name || "You" },
                ].map(row => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0", borderBottom: `1px solid ${T.dividerLight}`,
                  }}>
                    <span style={{ fontSize: 13, color: T.textSecondary }}>{row.label}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: T.textPrimary,
                      fontFamily: row.mono ? T.monoFont : T.font,
                    }}>
                      {row.value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: T.radiusSm,
                background: T.primaryLight + "44", border: `1px solid ${T.primary}22`,
                fontSize: 12, color: T.textSecondary, lineHeight: 1.5,
              }}>
                Submitting will create a database record for your app. Repo provisioning,
                CI/CD pipeline setup, and infrastructure deployment will be available
                once the provisioning engine is connected.
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px", borderRadius: T.radiusSm,
              background: T.errorBg || "#FEE2E2", border: `1px solid ${T.error}33`,
              fontSize: 13, color: T.error,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${T.dividerLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            {step > 1 && (
              <button onClick={handleBack} style={{
                background: "none", border: `1px solid ${T.dividerLight}`,
                borderRadius: T.radiusXs, padding: "8px 16px",
                fontSize: 13, fontWeight: 500, color: T.textSecondary,
                cursor: "pointer",
              }}>
                Back
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} style={{
              background: "none", border: `1px solid ${T.dividerLight}`,
              borderRadius: T.radiusXs, padding: "8px 16px",
              fontSize: 13, fontWeight: 500, color: T.textSecondary,
              cursor: "pointer",
            }}>
              Cancel
            </button>
            {step < totalSteps ? (
              <button onClick={handleNext} style={{
                background: T.primary, color: T.textOnPrimary || "#fff",
                border: "none", borderRadius: T.radiusXs, padding: "8px 20px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} style={{
                background: submitting ? T.textDisabled : T.primary,
                color: T.textOnPrimary || "#fff",
                border: "none", borderRadius: T.radiusXs, padding: "8px 20px",
                fontSize: 13, fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {submitting ? "Registering..." : "Register App"}
                {!submitting && <Rocket size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupSearchInput({ onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  const search = (q) => {
    if (q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    fetch(`/api/groups/search?q=${encodeURIComponent(q.trim())}`)
      .then(r => r.json())
      .then(data => {
        setResults(Array.isArray(data) ? data : []);
        setShowDropdown(true);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (group) => {
    onSelect(group);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder={placeholder || "Search for a security group…"}
        style={{
          width: "100%", padding: "10px 12px",
          borderRadius: T.radiusXs, border: `1px solid ${T.inputStroke}`,
          background: T.bgPaper, color: T.textPrimary,
          fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box",
        }}
      />
      {loading && (
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: T.textDisabled }}>
          Searching…
        </div>
      )}
      {showDropdown && !loading && (
        <>
          <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
            background: T.bgPaper, border: `1px solid ${T.dividerLight}`,
            borderRadius: T.radiusSm, boxShadow: T.shadowMd, zIndex: 100,
            maxHeight: 240, overflowY: "auto",
          }}>
            {results.length === 0 ? (
              <div style={{ padding: "12px 14px", fontSize: 13, color: T.textDisabled }}>No groups found</div>
            ) : results.map(group => (
              <div
                key={group.id}
                onClick={() => handleSelect(group)}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${T.dividerLight}` }}
                onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{group.displayName}</div>
                {group.description && (
                  <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{group.description}</div>
                )}
                <div style={{ fontSize: 11, color: T.textDisabled, marginTop: 2, fontFamily: T.monoFont }}>{group.id}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AppDetailModal({ appId, user, onClose }) {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  const loadApp = () => {
    fetch(`/api/apps/${appId}`)
      .then(r => r.json())
      .then(data => { setApp(data); setLoading(false); })
      .catch(() => { setLoading(false); setError("Failed to load app details"); });
  };

  useEffect(() => { loadApp(); }, [appId]);

  const refreshAccess = () => {
    fetch(`/api/apps/${appId}`)
      .then(r => r.json())
      .then(data => setApp(data))
      .catch(() => {});
  };

  const handleGroupSelect = async (group) => {
    setError(null);
    try {
      const res = await fetch(`/api/apps/${appId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: group.id, groupName: group.displayName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add group");
        return;
      }
      refreshAccess();
    } catch {
      setError("Network error");
    }
  };

  const handleRemoveGroup = async (groupId) => {
    setRemoving(groupId);
    setError(null);
    try {
      const res = await fetch(`/api/apps/${appId}/access/${groupId}`, { method: "DELETE" });
      if (!res.ok) setError("Failed to remove group");
      else refreshAccess();
    } catch {
      setError("Network error");
    } finally {
      setRemoving(null);
    }
  };

  const isOwner = app && user && app.ownerId === user.id;
  const zc = app ? (app.zone === "green" ? T.success : app.zone === "yellow" ? T.warning : T.error) : T.textDisabled;
  const sc = app ? (app.status === "active" ? T.success : app.status === "provisioning" ? T.warning : T.textDisabled) : T.textDisabled;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.bgPaper, borderRadius: T.radiusLg, width: 560, maxWidth: "90vw", maxHeight: "88vh", overflowY: "auto", boxShadow: T.shadowLg }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${T.dividerLight}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {loading ? (
            <div style={{ fontSize: 14, color: T.textDisabled }}>Loading…</div>
          ) : app ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>{app.displayName}</span>
                <Badge color={zc}>{app.zone}</Badge>
                <Badge color={sc}>{app.status}</Badge>
              </div>
              <div style={{ fontSize: 12, color: T.textDisabled, fontFamily: T.monoFont }}>{app.name}</div>
            </div>
          ) : <div style={{ fontSize: 14, color: T.error }}>{error}</div>}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textDisabled, padding: 4, marginLeft: 12 }}>
            <X size={18} />
          </button>
        </div>

        {app && (
          <div style={{ padding: 24 }}>
            {/* App details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Hostname", value: app.hostname, mono: true },
                { label: "Stack", value: app.stack },
                { label: "Team", value: app.team },
                { label: "Cost Center", value: app.costCenter },
                { label: "Owner", value: app.owner?.name },
                { label: "Created", value: timeAgo(app.createdAt) },
              ].map(({ label, value, mono }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: T.textPrimary, fontFamily: mono ? T.monoFont : T.font }}>{value || "—"}</div>
                </div>
              ))}
            </div>

            {/* Access Management */}
            <div style={{ borderTop: `1px solid ${T.dividerLight}`, paddingTop: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 14 }}>Access Groups</div>

              {app.accessGroups?.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  {app.accessGroups.map(ag => (
                    <div key={ag.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.bgPage, borderRadius: T.radiusXs, marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{ag.groupName}</div>
                        <div style={{ fontSize: 11, color: T.textDisabled, fontFamily: T.monoFont }}>{ag.groupId}</div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveGroup(ag.groupId)}
                          disabled={removing === ag.groupId}
                          style={{
                            background: "none", border: `1px solid ${T.dividerLight}`,
                            borderRadius: T.radiusXs, padding: "4px 10px",
                            fontSize: 12, color: removing === ag.groupId ? T.textDisabled : T.error,
                            cursor: removing === ag.groupId ? "default" : "pointer",
                          }}
                        >
                          {removing === ag.groupId ? "Removing…" : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: T.textDisabled, marginBottom: 16 }}>No access groups configured.</div>
              )}

              {isOwner && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Add Group</div>
                  <GroupSearchInput onSelect={handleGroupSelect} placeholder="Search for a security group…" />
                  <div style={{ fontSize: 12, color: T.textDisabled, marginTop: 6 }}>
                    Search by group name. Select a group to grant access to your app.
                  </div>
                </div>
              )}

              {error && (
                <div style={{ marginTop: 10, fontSize: 13, color: T.error }}>{error}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MyAppsPage({ user, pendingRegistration, onRegistrationConsumed }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const loadApps = () => {
    setLoading(true);
    fetch("/api/apps")
      .then(res => res.json())
      .then(data => {
        setApps(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadApps(); }, []);

  useEffect(() => {
    if (pendingRegistration) setShowRegistration(true);
  }, [pendingRegistration]);

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    if (onRegistrationConsumed) onRegistrationConsumed();
    loadApps();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: T.textDisabled }}>
        Loading your apps...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>📱 My Apps</h1>
          <p style={{ color: T.textSecondary, fontSize: 14 }}>
            Apps you own or created. Click any app to view details and manage access.
          </p>
        </div>
        <button
          onClick={() => setShowRegistration(true)}
          style={{
            background: T.primary, color: T.textOnPrimary || "#fff", border: "none",
            borderRadius: T.radiusXs, padding: "10px 20px", fontWeight: 600,
            fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Rocket size={16} /> Register App
        </button>
      </div>

      {apps.length === 0 ? (
        <Card hover={false} style={{ textAlign: "center", padding: 48 }}>
          <Rocket size={32} color={T.divider} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>No apps yet</div>
          <div style={{ fontSize: 13, color: T.textDisabled, maxWidth: 400, margin: "0 auto", lineHeight: 1.5, marginBottom: 16 }}>
            Register your first app to get a governed repo, CI/CD pipeline, and hosting — all pre-wired with Tricentis security standards.
          </div>
          <button
            onClick={() => setShowRegistration(true)}
            style={{
              background: T.primary, color: T.textOnPrimary || "#fff", border: "none",
              borderRadius: T.radiusXs, padding: "10px 20px", fontWeight: 600,
              fontSize: 14, cursor: "pointer",
            }}
          >
            Register Your First App
          </button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {apps.map(app => {
            const zc = app.zone === "green" ? T.success : app.zone === "yellow" ? T.warning : T.error;
            const sc = app.status === "active" ? T.success : app.status === "provisioning" ? T.warning : T.textDisabled;
            return (
              <Card key={app.id} onClick={() => setSelectedAppId(app.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{app.displayName}</span>
                      <Badge color={zc}>{app.zone}</Badge>
                      <Badge color={sc}>{app.status}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 6, fontFamily: T.monoFont }}>{app.hostname}</div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textDisabled }}>
                      <span><Users size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{app.team}</span>
                      <span><Terminal size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />{app.stack}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} color={T.divider} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showRegistration && (
        <RegistrationForm
          user={user}
          initialData={pendingRegistration}
          onComplete={handleRegistrationComplete}
          onCancel={() => {
            setShowRegistration(false);
            if (onRegistrationConsumed) onRegistrationConsumed();
          }}
        />
      )}

      {selectedAppId && (
        <AppDetailModal
          appId={selectedAppId}
          user={user}
          onClose={() => setSelectedAppId(null)}
        />
      )}
    </div>
  );
}

// ─── Admin Page ──────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

function ChatConfigSection({ section, onEdit }) {
  const preview = section.content.split('\n').slice(0, 2).join(' ').slice(0, 150) + '...';
  return (
    <Card hover={false} style={{
      marginBottom: 12,
      borderLeft: section.locked ? `3px solid ${T.warning}` : `3px solid ${T.primary}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {section.locked && <Lock size={14} color={T.warning} />}
            <span style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{section.title}</span>
            <Badge color={section.locked ? T.warning : T.primary}>{section.locked ? "Locked" : section.section}</Badge>
          </div>
          <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5, marginBottom: 6 }}>{preview}</div>
          {section.updatedBy && (
            <div style={{ fontSize: 12, color: T.textDisabled }}>
              Last edited by {section.updatedBy}, {timeAgo(section.updatedAt)}
            </div>
          )}
        </div>
        <button
          onClick={() => onEdit(section)}
          style={{
            padding: "6px 14px", borderRadius: T.radiusXs,
            border: `1px solid ${T.dividerLight}`, background: T.bgPaper,
            color: T.primary, fontSize: 12, fontWeight: 600, cursor: "pointer",
            flexShrink: 0, marginLeft: 16,
          }}
        >
          Edit
        </button>
      </div>
    </Card>
  );
}

function ChatConfigEditor({ section, onSave, onCancel }) {
  const [content, setContent] = useState(section.content);
  const [title, setTitle] = useState(section.title);
  const [confirmLocked, setConfirmLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat-config/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, ...(section.locked && { confirmLocked }) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save');
        setSaving(false);
        return;
      }
      onSave(data);
    } catch {
      setError('Network error');
      setSaving(false);
    }
  };

  const canSave = !saving && (!section.locked || confirmLocked);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: T.bgPaper, borderRadius: T.radiusMd, boxShadow: T.shadowLg,
        width: '100%', maxWidth: 720, maxHeight: '90vh', overflow: 'auto', padding: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0 }}>Edit: {section.title}</h2>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textSecondary, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {section.locked && (
          <div style={{
            background: T.warningLight, border: `1px solid ${T.warningBorder}`,
            borderRadius: T.radiusSm, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Lock size={14} color={T.warning} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.warning }}>Locked Section</div>
              <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>
                This section contains security constraints. Edits require confirmation below.
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6 }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={section.locked}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: T.radiusSm,
              border: `1px solid ${T.inputStroke}`, fontFamily: T.font, fontSize: 13,
              color: T.textPrimary, background: section.locked ? T.bgPage : T.bgPaper,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: 'block', marginBottom: 6 }}>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={16}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: T.radiusSm,
              border: `1px solid ${T.inputStroke}`, fontFamily: T.monoFont,
              fontSize: 12, color: T.textPrimary, background: T.bgPaper,
              resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: 11, color: T.textDisabled, textAlign: 'right', marginTop: 4 }}>
            {content.length} characters
          </div>
        </div>

        {section.locked && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: T.textSecondary }}>
              <input type="checkbox" checked={confirmLocked} onChange={e => setConfirmLocked(e.target.checked)} />
              I understand this section contains security constraints and I intend to modify it
            </label>
          </div>
        )}

        {error && (
          <div style={{
            background: T.errorLight, border: `1px solid ${T.errorBorder}`,
            borderRadius: T.radiusSm, padding: '8px 12px', marginBottom: 12,
            fontSize: 13, color: T.error,
          }}>
            {error}
          </div>
        )}

        {section.updatedBy && (
          <div style={{ fontSize: 12, color: T.textDisabled, marginBottom: 16 }}>
            Last edited by {section.updatedBy}, {timeAgo(section.updatedAt)}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: T.radiusXs,
              border: `1px solid ${T.dividerLight}`, background: T.bgPaper,
              color: T.textSecondary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: '8px 16px', borderRadius: T.radiusXs,
              border: 'none', background: canSave ? T.primary : T.textDisabled,
              color: T.textOnPrimary, fontSize: 13, fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatConfigPanel() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    fetch('/api/admin/chat-config')
      .then(r => r.json())
      .then(data => { setSections(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSeedDefaults = () => {
    fetch('/api/admin/chat-config/seed', { method: 'POST' })
      .then(r => r.json())
      .then(() => fetch('/api/admin/chat-config').then(r => r.json()))
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleSectionSaved = (updated) => {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingSection(null);
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>Chat Configuration</h2>
        <p style={{ fontSize: 13, color: T.textSecondary }}>
          These sections make up the AI assistant's system prompt. Changes take effect within 5 minutes.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: T.textSecondary, padding: '16px 0' }}>Loading chat configuration…</div>
      ) : sections.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>No prompt sections found.</p>
            <button
              onClick={handleSeedDefaults}
              style={{
                padding: '8px 16px', borderRadius: T.radiusXs, border: 'none',
                background: T.primary, color: T.textOnPrimary, fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Seed Defaults
            </button>
          </div>
        </Card>
      ) : (
        sections.map(s => (
          <ChatConfigSection key={s.id} section={s} onEdit={setEditingSection} />
        ))
      )}

      {editingSection && (
        <ChatConfigEditor
          section={editingSection}
          onSave={handleSectionSaved}
          onCancel={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}

function AdminPage({ user }) {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ zone: "all", team: "all", status: "all", stack: "all" });
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/apps').then(r => r.json()),
    ])
      .then(([statsData, appsData]) => {
        setStats(statsData);
        setApps(Array.isArray(appsData) ? appsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const teams = [...new Set(apps.map(a => a.team).filter(Boolean))].sort();
  const statuses = [...new Set(apps.map(a => a.status).filter(Boolean))].sort();
  const stacks = [...new Set(apps.map(a => a.stack).filter(Boolean))].sort();

  const filteredApps = apps
    .filter(app => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = app.displayName?.toLowerCase().includes(q) || app.name?.toLowerCase().includes(q);
        const matchOwner = app.owner?.name?.toLowerCase().includes(q);
        if (!matchName && !matchOwner) return false;
      }
      if (filters.zone !== "all" && app.zone !== filters.zone) return false;
      if (filters.team !== "all" && app.team !== filters.team) return false;
      if (filters.status !== "all" && app.status !== filters.status) return false;
      if (filters.stack !== "all" && app.stack !== filters.stack) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const zoneColor = (zone) => {
    if (!zone) return T.textDisabled;
    const z = zone.toLowerCase();
    if (z === "green") return T.success;
    if (z === "yellow") return T.warning;
    if (z === "red") return T.error;
    return T.textDisabled;
  };

  const zoneBg = (zone) => {
    if (!zone) return T.bgPage;
    const z = zone.toLowerCase();
    if (z === "green") return T.successLight;
    if (z === "yellow") return T.warningLight;
    if (z === "red") return T.errorLight;
    return T.bgPage;
  };

  const statusColor = (status) => {
    if (!status) return T.textDisabled;
    if (status === "active") return T.success;
    if (status === "provisioning") return T.warning;
    if (status === "failed") return T.error;
    return T.textDisabled;
  };

  const selectStyle = {
    padding: "6px 12px",
    borderRadius: T.radiusXs,
    border: `1px solid ${T.dividerLight}`,
    background: T.bgPaper,
    color: T.textPrimary,
    fontSize: 13,
    fontFamily: T.font,
    outline: "none",
    cursor: "pointer",
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <span style={{ color: T.textDisabled, marginLeft: 4 }}>↕</span>;
    return <span style={{ color: T.primary, marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: T.textSecondary, fontSize: 14 }}>
        Loading admin dashboard…
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, marginBottom: 4 }}>🛡️ Platform Admin</h1>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 24 }}>Overview of all vibe-coded applications across Tricentis.</p>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Apps", value: stats?.totalApps ?? 0, color: T.primary },
          { label: "Active", value: stats?.activeApps ?? 0, color: T.success },
          { label: "Provisioning", value: stats?.provisioningApps ?? 0, color: T.warning },
          { label: "Total Users", value: stats?.totalUsers ?? 0, color: T.purple },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 13, color: T.textSecondary, marginTop: 4 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Breakdown cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {/* By team */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 12 }}>Apps by Team</div>
          {stats?.teamCounts?.length ? stats.teamCounts.map(({ team, count }) => (
            <div key={team} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{team || "—"}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, flexShrink: 0 }}>{count}</span>
            </div>
          )) : <div style={{ fontSize: 13, color: T.textDisabled }}>No data</div>}
        </Card>

        {/* By zone */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 12 }}>Apps by Zone</div>
          {stats?.zoneCounts?.length ? stats.zoneCounts.map(({ zone, count }) => (
            <div key={zone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: zoneColor(zone), flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 13, color: T.textSecondary, textTransform: "capitalize" }}>{zone || "Unknown"}</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{count}</span>
            </div>
          )) : <div style={{ fontSize: 13, color: T.textDisabled }}>No data</div>}
        </Card>

        {/* By stack */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 12 }}>Apps by Stack</div>
          {stats?.stackCounts?.length ? stats.stackCounts.map(({ stack, count }) => (
            <div key={stack} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{stack || "—"}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, flexShrink: 0 }}>{count}</span>
            </div>
          )) : <div style={{ fontSize: 13, color: T.textDisabled }}>No data</div>}
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search apps or owners…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ ...selectStyle, padding: "6px 12px", minWidth: 220 }}
        />
        <select value={filters.zone} onChange={e => setFilters(f => ({ ...f, zone: e.target.value }))} style={selectStyle}>
          <option value="all">All Zones</option>
          {["Green", "Yellow", "Red"].map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        <select value={filters.team} onChange={e => setFilters(f => ({ ...f, team: e.target.value }))} style={selectStyle}>
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={selectStyle}>
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.stack} onChange={e => setFilters(f => ({ ...f, stack: e.target.value }))} style={selectStyle}>
          <option value="all">All Stacks</option>
          {stacks.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 13, color: T.textSecondary, marginLeft: "auto" }}>
          {filteredApps.length} {filteredApps.length === 1 ? "app" : "apps"}
        </span>
      </div>

      {/* Apps table */}
      <Card>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 90px 110px 1fr 90px", gap: 8, padding: "8px 0 10px", borderBottom: `1px solid ${T.divider}`, marginBottom: 4 }}>
          {[
            { label: "App", field: "displayName" },
            { label: "Team", field: "team" },
            { label: "Zone", field: "zone" },
            { label: "Status", field: "status" },
            { label: "Stack", field: "stack" },
            { label: "Owner", field: null },
            { label: "Created", field: "createdAt" },
          ].map(({ label, field }) => (
            <div
              key={label}
              onClick={field ? () => handleSort(field) : undefined}
              style={{ fontSize: 12, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em", cursor: field ? "pointer" : "default", userSelect: "none" }}
            >
              {label}{field && <SortIndicator field={field} />}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {filteredApps.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: T.textDisabled }}>
            No apps match the current filters.
          </div>
        ) : filteredApps.map((app, idx) => (
          <div
            key={app.id}
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr 90px 90px 110px 1fr 90px", gap: 8, padding: "10px 0", borderBottom: idx < filteredApps.length - 1 ? `1px solid ${T.dividerLight}` : "none", alignItems: "center" }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>{app.displayName || app.name}</div>
              <div style={{ fontSize: 11, color: T.textDisabled, fontFamily: T.monoFont }}>{app.name}</div>
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.team || "—"}</div>
            <div>
              {app.zone ? (
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: T.radiusCircular, background: zoneBg(app.zone), color: zoneColor(app.zone), textTransform: "capitalize" }}>
                  {app.zone}
                </span>
              ) : <span style={{ color: T.textDisabled, fontSize: 13 }}>—</span>}
            </div>
            <div>
              {app.status ? (
                <Badge color={statusColor(app.status)}>{app.status}</Badge>
              ) : <span style={{ color: T.textDisabled, fontSize: 13 }}>—</span>}
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.stack || "—"}</div>
            <div>
              {app.owner ? (
                <div>
                  <div style={{ fontSize: 13, color: T.textPrimary }}>{app.owner.name}</div>
                  <div style={{ fontSize: 11, color: T.textDisabled }}>{app.owner.email}</div>
                </div>
              ) : <span style={{ color: T.textDisabled, fontSize: 13 }}>—</span>}
            </div>
            <div style={{ fontSize: 12, color: T.textDisabled }}>{app.createdAt ? timeAgo(app.createdAt) : "—"}</div>
          </div>
        ))}
      </Card>

      <ChatConfigPanel />
    </div>
  );
}

// ─── App Shell (Aura-themed) ──────────────────────────────────────────────

export default function App() {
  const [section, setSection] = useState("home");
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    window.__catchTheVibe_registerApp = (stack, hosting, zone) => {
      setPendingRegistration({ stack, hosting, zone });
      setSection("myapps");
    };
    return () => { delete window.__catchTheVibe_registerApp; };
  }, []);

  const icons = {
    home: Zap, launchpad: Rocket, governance: Shield,
    skills: GraduationCap, tools: Wrench, showcase: Star,
    myapps: LayoutGrid, admin: Shield,
  };

  const navItems = Object.entries(SECTIONS).filter(
    ([key]) => {
      if (key === 'myapps') return isAuthenticated;
      if (key === 'admin') return isAuthenticated && user?.isAdmin;
      return true;
    }
  );

  if (section === 'myapps' && !isAuthenticated && !loading) {
    setSection('home');
  }

  if (section === 'admin' && (!isAuthenticated || !user?.isAdmin) && !loading) {
    setSection('home');
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bgPage, color: T.textPrimary, fontFamily: T.font }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 32px", borderBottom: `1px solid ${T.divider}`,
        background: T.bgPaper, position: "sticky", top: 0, zIndex: 10,
        boxShadow: T.shadowSm,
      }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => setSection("home")}
        >
          <VibeCodeLogo size={48} />
          <span style={{ fontSize: 18, fontWeight: 800, color: T.primary }}>Catch The Vibe</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map(([key, label]) => {
            const Icon = icons[key];
            const active = section === key;
            return (
              <button
                key={key}
                onClick={() => setSection(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: T.radiusXs, border: "none",
                  background: active ? T.primarySubtle : "transparent",
                  color: active ? T.primary : T.textSecondary,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <Icon size={14} />{label}
              </button>
            );
          })}
          {isAuthenticated && user && (
            <div style={{ marginLeft: 8 }}>
              <UserMenu user={user} onOpenProfile={() => setShowProfile(true)} />
            </div>
          )}
        </div>
      </nav>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {section === "home" && <HomePage setSection={setSection} />}
        {section === "build" && <BuildPage setSection={setSection} />}
        {section === "launchpad" && <LaunchpadPage />}
        {section === "governance" && <GovernancePage />}
        {section === "skills" && <SkillsPage />}
        {section === "tools" && <ToolboxPage />}
        {section === "showcase" && <ShowcasePage />}
        {section === "myapps" && isAuthenticated && (
          <MyAppsPage
            user={user}
            pendingRegistration={pendingRegistration}
            onRegistrationConsumed={() => setPendingRegistration(null)}
          />
        )}
        {section === "admin" && isAuthenticated && user?.isAdmin && (
          <AdminPage user={user} />
        )}
      </main>
      <AIChatPanel currentSection={section} />
      {showProfile && isAuthenticated && user && (
        <ProfileModal user={user} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
