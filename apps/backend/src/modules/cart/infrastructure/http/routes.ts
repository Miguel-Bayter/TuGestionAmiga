import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';
import { requireAuth } from '@/shared/middleware/jwt';

export function createCartRoutes(container: AwilixContainer) {
  const router = Router();
  const { cartService } = container.cradle;

  // GET /api/cart - Get cart items for a user
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.query.userId;

      if (!userId) {
        res.status(400).json({ ok: false, error: 'userId is required' });
        return;
      }

      const uid = Number(userId);
      if (isNaN(uid)) {
        res.status(400).json({ ok: false, error: 'Invalid userId' });
        return;
      }

      // Authorization: user can only see own cart OR admin can see any
      if (!req.user?.isAdmin && req.user?.userId !== uid) {
        res.status(403).json({ ok: false, error: 'Not authorized' });
        return;
      }

      const cartItems = await cartService.getByUserId(uid);
      res.json({ ok: true, data: cartItems });
    })
  );

  return router;
}

export default createCartRoutes;
