import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { ApiError } from '../middleware/error';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';

export class AuthService {
  async register(email: string, name: string, password: string) {
    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      throw new ApiError(400, validation.errors.join('; '));
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password and create user
    const hash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hash,
        roleId: 2, // USER role
      },
      include: { role: true },
    });

    // Generate JWT tokens for new user
    const payload = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return {
      user: {
        id_usuario: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Verify password
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT tokens
    const payload = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    return {
      user: {
        id_usuario: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
      },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
