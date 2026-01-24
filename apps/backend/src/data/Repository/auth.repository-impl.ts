import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../middleware/error';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';
import type { IAuthRepository } from '../../domain/Repository/auth.repository';

export class AuthRepository implements IAuthRepository {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, name: string, password: string) {
    // Validar fortaleza de contraseña
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      throw new ApiError(400, validation.errors.join('; '));
    }

    // Verificar si el email ya existe
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash y crear usuario
    const hash = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hash,
        roleId: 2, // USER role
      },
      include: { role: true },
    });

    // Generar tokens JWT
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
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Verificar contraseña
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generar JWT tokens
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
