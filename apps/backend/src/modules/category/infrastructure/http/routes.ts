import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';
import { requireAuth } from '@/shared/middleware/jwt';

export function createCategoryRoutes(container: AwilixContainer) {
  const router = Router();
  const { categoryService } = container.cradle;

  // GET /api/admin/categories - Get all categories (admin only)
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      // Verify admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ ok: false, error: 'Admin access required' });
        return;
      }

      const categories = await categoryService.getAll();
      res.json({ ok: true, data: categories });
    })
  );

  return router;
}

export default createCategoryRoutes;
