import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tasksRouter from './routes/tasks.js';
import boardsRouter from './routes/boards.js';
import { createLogger } from './lib/logger.js';
import { attachErrorHandler } from './middleware/error-handler.js';

const log = createLogger('server');
const app = express();

const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json());

// Response envelope middleware
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson(data);
    }
    return originalJson({ success: true, data });
  };
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/boards', boardsRouter);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// Error handler
app.use(attachErrorHandler);

// Start server
app.listen(PORT, () => {
  log.info(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log.info('Shutting down gracefully...');
  process.exit(0);
});

export default app;
