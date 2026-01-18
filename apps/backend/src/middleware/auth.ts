import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index';
import prisma from '../config/database';

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = Number(req.headers['x-user-id']);

  if (!Number.isFinite(userId)) {
    res.status(401).json({ ok: false, error: 'Not authenticated' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      res.status(401).json({ ok: false, error: 'Not authenticated' });
      return;
    }

    req.auth = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      isAdmin: user.role.name === 'ADMIN'
    };

    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: 'Not authenticated' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await requireAuth(req, res, () => {});

  if (res.headersSent) return;

  if (!req.auth?.isAdmin) {
    res.status(403).json({ ok: false, error: 'Admin access required' });
    return;
  }

  next();
};
