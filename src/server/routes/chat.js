import express from 'express';

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/chat
//
// Placeholder for the Catch the Vibe assistant. The real Claude-backed
// assistant is not implemented yet; this returns a canned message over the
// same SSE contract the frontend expects (event: content_block_delta with
// { delta: { text } }, then the stream closes) so the widget degrades
// gracefully instead of surfacing a 404.
// ---------------------------------------------------------------------------
router.post('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const message =
    "Hi! The Catch the Vibe assistant isn't available yet — it's coming soon. " +
    'In the meantime, head to "Build an App" to scope and provision a new repo.';

  for (const word of message.split(' ')) {
    res.write('event: content_block_delta\n');
    res.write(`data: ${JSON.stringify({ delta: { text: word + ' ' } })}\n\n`);
  }

  res.write('event: message_stop\n');
  res.write('data: {}\n\n');
  res.end();
});

export default router;
