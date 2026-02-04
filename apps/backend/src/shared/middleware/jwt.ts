import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '@/shared/config/database';
import { asyncHandler } from './error';
import type { AuthUser } from '@/modules/auth/domain/entity/auth.entity';

/**
 * Extend Express Request to include optional user property
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/**
 * JWT Authentication Middleware
 * Validates Bearer token from Authorization header and attaches user data to req.user
 *
 * Expected Authorization header format: "Bearer {token}"
 * Returns 401 Unauthorized for:
 * - Missing Authorization header
 * - Invalid Bearer prefix
 * - Invalid/expired JWT token
 * - User not found in database
 */
export const requireAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Extract Authorization header
  const authHeader = req.headers.authorization;

  // Validate Authorization header exists
  if (!authHeader || !authHeader.trim()) {
    res.status(401).json({
      ok: false,
      error: 'Authorization header required',
    });
    return;
  }

  // Parse Bearer token (case-insensitive)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    res.status(401).json({
      ok: false,
      error: 'Invalid Authorization header format. Expected: Bearer {token}',
    });
    return;
  }

  const token = parts[1].trim();
  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Token is required',
    });
    return;
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      roleId: number;
      roleName: string;
    };

    // Fetch user from database to verify existence and get current role info
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user) {
      res.status(401).json({
        ok: false,
        error: 'User not found',
      });
      return;
    }

    // Attach user data to request
    req.user = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      isAdmin: user.role.name === 'ADMIN',
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle JWT verification errors
    // Note: TokenExpiredError is a subclass of JsonWebTokenError, so check it first
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        ok: false,
        error: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        ok: false,
        error: 'Invalid token',
      });
      return;
    }

    // Re-throw other errors (database errors, etc.)
    throw error;
  }
});

export default requireAuth;
