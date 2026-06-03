import 'dotenv/config';
import express from 'express';
import auth from './middleware/auth.js';
import scopeRouter from './routes/scope.js';
import appsRouter from './routes/apps.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/ping', (_req, res) => res.json({ ok: true }));

// Routes (all require auth)
// scope must be mounted before /api/apps to avoid prefix-match ambiguity
app.use('/api/apps/scope', auth, scopeRouter);
app.use('/api/apps', auth, appsRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CatchTheVibe backend running on http://localhost:${PORT}`);
});
