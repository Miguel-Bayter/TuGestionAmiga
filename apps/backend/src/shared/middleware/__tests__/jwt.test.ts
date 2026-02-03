import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../jwt';

// Mock Prisma
jest.mock('@/shared/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '@/shared/config/database';

describe('JWT Middleware - requireAuth', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<void>;
  const JWT_SECRET = 'test-secret-key';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Valid JWT Token', () => {
    it('should decode valid token and attach user data to req.user', async () => {
      // Arrange
      const userId = 1;
      const roleId = 1;
      const roleName = 'ADMIN';
      const token = jwt.sign({ userId, roleId, roleName }, JWT_SECRET);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId,
        role: { name: roleName },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(userId);
      expect(req.user?.roleId).toBe(roleId);
      expect(req.user?.roleName).toBe(roleName);
      expect(req.user?.isAdmin).toBe(true);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should set isAdmin=false for non-ADMIN roles', async () => {
      // Arrange
      const userId = 2;
      const roleId = 2;
      const roleName = 'USER';
      const token = jwt.sign({ userId, roleId, roleName }, JWT_SECRET);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId,
        role: { name: roleName },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(req.user?.isAdmin).toBe(false);
      expect(next).toHaveBeenCalled();
    });

    it('should call findUnique with correct userId', async () => {
      // Arrange
      const userId = 5;
      const roleId = 1;
      const roleName = 'ADMIN';
      const token = jwt.sign({ userId, roleId, roleName }, JWT_SECRET);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId,
        role: { name: roleName },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { role: true },
      });
    });
  });

  describe('Missing Authorization Header', () => {
    it('should return 401 when Authorization header is missing', async () => {
      // Arrange
      req.headers = {};

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('Authorization'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is empty', async () => {
      // Arrange
      req.headers = {
        authorization: '',
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Malformed Authorization Header', () => {
    it('should return 401 when Authorization header has no Bearer prefix', async () => {
      // Arrange
      const token = jwt.sign({ userId: 1 }, JWT_SECRET);
      req.headers = {
        authorization: `Token ${token}`,
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header has Bearer but no token', async () => {
      // Arrange
      req.headers = {
        authorization: 'Bearer ',
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header has Bearer but only whitespace', async () => {
      // Arrange
      req.headers = {
        authorization: 'Bearer   ',
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Invalid JWT Token', () => {
    it('should return 401 for invalid token signature', async () => {
      // Arrange
      const malformedToken = 'invalid.token.signature';
      req.headers = {
        authorization: `Bearer ${malformedToken}`,
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('Invalid'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for token signed with different secret', async () => {
      // Arrange
      const token = jwt.sign({ userId: 1, roleId: 1, roleName: 'ADMIN' }, 'wrong-secret');
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('Invalid'),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for malformed JWT', async () => {
      // Arrange
      req.headers = {
        authorization: 'Bearer abc123',
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Expired JWT Token', () => {
    it('should return 401 with "Token expired" message for expired token', async () => {
      // Arrange
      const token = jwt.sign({ userId: 1, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET, {
        expiresIn: '-1h', // Expired 1 hour ago
      });
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('expired'),
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('User Not Found in Database', () => {
    it('should return 401 when user does not exist in database', async () => {
      // Arrange
      const userId = 999;
      const token = jwt.sign({ userId, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET);
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('not found'),
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Case Sensitivity', () => {
    it('should accept "bearer" in lowercase', async () => {
      // Arrange
      const userId = 1;
      const token = jwt.sign({ userId, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET);
      req.headers = {
        authorization: `bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId: 1,
        role: { name: 'ADMIN' },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should accept "Bearer" in mixed case', async () => {
      // Arrange
      const userId = 1;
      const token = jwt.sign({ userId, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET);
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId: 1,
        role: { name: 'ADMIN' },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Request User Typing', () => {
    it('should have correct TypeScript typing for req.user', async () => {
      // Arrange
      const userId = 1;
      const token = jwt.sign({ userId, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET);
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        roleId: 1,
        role: { name: 'ADMIN' },
      });

      // Act
      await requireAuth(req as Request, res as Response, next);

      // Assert - TypeScript compilation proves typing is correct
      if (req.user) {
        const userId_: number = req.user.userId;
        const roleId: number = req.user.roleId;
        const roleName: string = req.user.roleName;
        const isAdmin: boolean = req.user.isAdmin;
        expect(userId_).toBe(userId);
        expect(roleId).toBe(1);
        expect(roleName).toBe('ADMIN');
        expect(isAdmin).toBe(true);
      }
    });
  });

  describe('Database Errors', () => {
    it('should pass database errors to next() via asyncHandler', (done) => {
      // Arrange
      const userId = 1;
      const token = jwt.sign({ userId, roleId: 1, roleName: 'ADMIN' }, JWT_SECRET);
      req.headers = {
        authorization: `Bearer ${token}`,
      };

      const dbError = new Error('Database connection failed');
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Create a next function that tracks if it was called with the error
      const nextWithTracking = (err?: Error | string) => {
        // Assert
        expect(err).toBe(dbError);
        expect(res.status).not.toHaveBeenCalled();
        done();
      };

      // Act
      requireAuth(req as Request, res as Response, nextWithTracking as NextFunction);
    });
  });
});
