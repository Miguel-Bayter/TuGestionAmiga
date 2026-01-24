import express from 'express';
import type { AwilixContainer } from 'awilix';
import corsMiddleware from './shared/config/cors';
import { errorHandler } from './middleware/error';
import { createApiRoutes } from './routes/index';

export const createApp = (container: AwilixContainer) => {
  const app = express();

  // Middlewares
  app.disable('x-powered-by');
  app.use(corsMiddleware);
  app.use(express.json({ limit: '8mb' }));

  // API Routes
  app.use('/api', createApiRoutes(container));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
