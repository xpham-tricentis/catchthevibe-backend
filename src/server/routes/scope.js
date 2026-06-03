import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const router = express.Router();
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '../../..'); // src/server/routes → project root

function buildSystemPrompt() {
  const skill = readFileSync(join(ROOT, '.claude/skills/app-scoping/SKILL.md'), 'utf8');
  const classification = readFileSync(join(ROOT, '.claude/docs/business-app-classification.md'), 'utf8');

  const patternFiles = [
    'content-website.md',
    'data-and-automation-service.md',
    'event-driven-service.md',
    'integration-service.md',
    'interactive-dashboard-app.md',
    'multi-container-service.md',
    'scheduled-job-service.md',
  ];
  const patterns = patternFiles
    .map(f => readFileSync(join(ROOT, '.claude/docs/patterns', f), 'utf8'))
    .join('\n\n---\n\n');

  return [
    '# CatchTheVibe App Scoping Interview',
    '',
    'You are the CatchTheVibe app scoping assistant embedded in the Tricentis internal developer portal.',
    'Your job is to conduct the app scoping interview below and output a manifest YAML at the end.',
    '',
    '## Important instructions for this session',
    '- You are running in a web chat interface — keep responses concise and conversational.',
    '- Conduct the interview strictly one question at a time.',
    '- When you have computed zone and pattern and the user confirms, output the manifest in a fenced ```yaml code block.',
    '- Begin the interview immediately with the introduction and Q0 — do not wait for the user to prompt you.',
    '',
    '## App Scoping Skill',
    '',
    skill,
    '',
    '## Business App Classification Rules',
    '',
    classification,
    '',
    '## Architecture Pattern Descriptions',
    '',
    patterns,
  ].join('\n');
}

let SYSTEM_PROMPT;
try {
  SYSTEM_PROMPT = buildSystemPrompt();
} catch (err) {
  console.error('[scope] Failed to build system prompt — check .claude/skills and .claude/docs exist:', err.message);
  SYSTEM_PROMPT = 'You are the CatchTheVibe app scoping assistant. The skill documentation could not be loaded — please inform the user.';
}

const sessions = new Map();

function sseWrite(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function runStream(res, messages) {
  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages,
  });

  stream.on('text', text => sseWrite(res, 'text', { text }));

  return await stream.finalMessage();
}

// POST /api/apps/scope — start a new session
router.post('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sessionId = randomUUID();
  const messages = [
    { role: 'user', content: "Hi, I'd like to start a new app." },
  ];

  try {
    const finalMsg = await runStream(res, messages);

    sessions.set(sessionId, {
      messages: [
        ...messages,
        { role: 'assistant', content: finalMsg.content },
      ],
    });

    sseWrite(res, 'session', { sessionId });
    sseWrite(res, 'done', {});
    res.end();
  } catch (err) {
    console.error('[scope] Stream error:', err.message);
    sseWrite(res, 'error', { message: 'Something went wrong starting the interview. Please try again.' });
    res.end();
  }
});

// POST /api/apps/scope/:sessionId/message — continue conversation
router.post('/:sessionId/message', async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const updatedMessages = [
    ...session.messages,
    { role: 'user', content: message.trim() },
  ];

  try {
    const finalMsg = await runStream(res, updatedMessages);

    session.messages = [
      ...updatedMessages,
      { role: 'assistant', content: finalMsg.content },
    ];

    sseWrite(res, 'done', {});
    res.end();
  } catch (err) {
    console.error('[scope] Stream error:', err.message);
    sseWrite(res, 'error', { message: 'Something went wrong. Please try again.' });
    res.end();
  }
});

export default router;
