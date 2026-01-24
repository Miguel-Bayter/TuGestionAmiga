import { Router, type Request, type Response } from 'express';
import type { AwilixContainer } from 'awilix';
import { createAuthRoutes } from '@/modules/auth/infrastructure/http/routes';
import { createBooksRoutes } from '@/modules/book/infrastructure/http/routes';

export function createApiRoutes(container: AwilixContainer) {
  const router = Router();

  // Health check
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, message: 'Server is running' });
  });

  // Routes
  router.use('/auth', createAuthRoutes(container));
  router.use('/books', createBooksRoutes(container));

  // 404 handler for API routes
  router.use('*', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'Endpoint not found' });
  });

  return router;
}

export default createApiRoutes;
