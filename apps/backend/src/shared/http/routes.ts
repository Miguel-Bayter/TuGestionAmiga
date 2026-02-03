import { Router, type Request, type Response } from 'express';
import type { AwilixContainer } from 'awilix';
import { createAuthRoutes } from '@/modules/auth/infrastructure/http/routes';
import { createBooksRoutes } from '@/modules/book/infrastructure/http/routes';
import { createAdminBooksRoutes } from '@/modules/book/infrastructure/http/admin-routes';
import { createCategoryRoutes } from '@/modules/category/infrastructure/http/routes';
import { createUserRoutes } from '@/modules/user/infrastructure/http/routes';
import { createPurchaseRoutes } from '@/modules/purchase/infrastructure/http/routes';
import { createLoanRoutes } from '@/modules/loan/infrastructure/http/routes';
import { createCartRoutes } from '@/modules/cart/infrastructure/http/routes';
import { requireAuth } from '@/shared/middleware/jwt';
import { listAvailableCovers } from '@/shared/utils/covers';

export function createApiRoutes(container: AwilixContainer) {
  const router = Router();

  // Health check
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, message: 'Server is running' });
  });

  // Test endpoint for JWT middleware verification
  router.get(
    '/test-auth',
    requireAuth,
    (_req: Request, res: Response) => {
      res.json({ ok: true, user: _req.user });
    }
  );

  // Public utility endpoint - list available book covers
  router.get('/covers', async (_req: Request, res: Response) => {
    const covers = await listAvailableCovers();
    res.json({ ok: true, data: covers });
  });

  // Routes
  router.use('/auth', createAuthRoutes(container));
  router.use('/books', createBooksRoutes(container));
  router.use('/admin/books', createAdminBooksRoutes(container));
  router.use('/admin/categories', createCategoryRoutes(container));
  router.use('/admin/users', createUserRoutes(container));
  router.use('/admin/loans', createLoanRoutes(container));
  router.use('/purchases', createPurchaseRoutes(container));
  router.use('/cart', createCartRoutes(container));

  // 404 handler for API routes
  router.use('*', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: 'Endpoint not found' });
  });

  return router;
}

export default createApiRoutes;
