import jwt from 'jsonwebtoken';
import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '../middleware/error';
import prisma from '../config/database';

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

      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as {
          userId: number;
        };

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { role: true },
        });

        if (!user) {
          res.status(401).json({ ok: false, error: 'Invalid refresh token' });
          return;
        }

        // Generate new access token
        const payload = {
          userId: user.id,
          roleId: user.roleId,
          roleName: user.role.name,
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
          expiresIn: '15m',
        });

        res.json({ accessToken });
      } catch (error) {
        console.error(error);
        res.status(401).json({ ok: false, error: 'Invalid refresh token' });
      }
    })
  );

  return router;
}

export default createAuthRoutes;
