import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';
import { requireAuth } from '@/shared/middleware/jwt';

export function createAdminBooksRoutes(container: AwilixContainer) {
  const router = Router();
  const { bookService } = container.cradle;

  // GET /api/admin/books - Get all books (admin only, includes unavailable)
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      // Verify admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ ok: false, error: 'Admin access required' });
        return;
      }

      // Get all books without filtering (available and unavailable)
      const books = await bookService.getAll();
      res.json({ ok: true, data: books });
    })
  );

  return router;
}

export default createAdminBooksRoutes;
