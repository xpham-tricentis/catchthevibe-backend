import 'dotenv/config';
import express from 'express';
import appsRouter from './routes/apps.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/ping', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api/apps', appsRouter);

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
