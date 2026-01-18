import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index';
import prisma from '../config/database';

export const requireAuth = async (
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      res.status(401).json({ ok: false, error: 'Not authenticated' });
      return;
    }

    req.auth = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      isAdmin: user.role.name === 'ADMIN',
    };

    next();
  } catch (error) {
    console.error(error);
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
