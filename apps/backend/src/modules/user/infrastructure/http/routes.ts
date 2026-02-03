import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';
import { requireAuth } from '@/shared/middleware/jwt';

export function createUserRoutes(container: AwilixContainer) {
  const router = Router();
  const { userService } = container.cradle;

  // GET /api/admin/users - Get all users (admin only)
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      // Verify admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ ok: false, error: 'Admin access required' });
        return;
      }

      const users = await userService.getAll();
      res.json({ ok: true, data: users });
    })
  );

  return router;
}

export default createUserRoutes;
