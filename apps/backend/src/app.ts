import express from 'express';
import corsMiddleware from './config/cors';
import { errorHandler } from './middleware/error';
import apiRoutes from './routes/index';

export const app = express();

// Middlewares
app.disable('x-powered-by');
app.use(corsMiddleware);
app.use(express.json({ limit: '8mb' }));

// API Routes
app.use('/api', apiRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
