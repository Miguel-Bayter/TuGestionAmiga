import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';
import { requireAuth } from '@/shared/middleware/jwt';

export function createLoanRoutes(container: AwilixContainer) {
  const router = Router();
  const { loanService } = container.cradle;

  // GET /api/admin/loans - Get all loans (admin only) with optional search
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      // Verify admin role
      if (!req.user?.isAdmin) {
        res.status(403).json({ ok: false, error: 'Admin access required' });
        return;
      }

      // Get optional search query parameter
      const searchQuery = req.query.q ? String(req.query.q) : undefined;

      const loans = await loanService.getAll(searchQuery);
      res.json({ ok: true, data: loans });
    })
  );

  return router;
}

export default createLoanRoutes;
