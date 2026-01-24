import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '@/shared/middleware/error';

export function createAuthRoutes(container: AwilixContainer) {
  const router = Router();
  const { authService } = container.cradle;

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const { email, name, password } = req.body;
      const result = await authService.register(email, name, password);
      res.status(201).json(result);
    })
  );

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    })
  );

  router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ ok: false, error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    })
  );

  return router;
}

export default createAuthRoutes;
