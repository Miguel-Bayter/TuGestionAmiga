import { Response, NextFunction } from 'express';
import type { AwilixContainer } from 'awilix';
import { AuthRequest } from '../types/index';

/**
 * Create authentication middleware factory
 * Returns middleware functions that use the container's validateTokenUseCase
 */
export const createAuthMiddleware = (container: AwilixContainer) => {
  const { validateTokenUseCase } = container.cradle;

  const requireAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ ok: false, error: 'Not authenticated' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    try {
      const authUser = await validateTokenUseCase.execute(token);

      req.auth = authUser;

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ ok: false, error: 'Not authenticated' });
    }
  };

  const requireAdmin = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Wrap requireAuth in a Promise to properly wait for completion
    await new Promise<void>((resolve) => {
      requireAuth(req, res, () => {
        resolve();
      });
    });

    if (res.headersSent) return;

    if (!req.auth?.isAdmin) {
      res.status(403).json({ ok: false, error: 'Admin access required' });
      return;
    }

    next();
  };

  return { requireAuth, requireAdmin };
};

// Export factory function as default for easy access
export default createAuthMiddleware;
