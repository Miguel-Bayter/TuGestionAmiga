import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '@/middleware/error';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password';
import type { IAuthRepository } from '@/modules/auth/domain/interface/auth.repository';
import type { AuthUser } from '@/modules/auth/domain/entity/auth.entity';

export class AuthRepository implements IAuthRepository {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, name: string, password: string) {
    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
      throw new ApiError(400, validation.errors.join('; '));
    }

    // Verify if the email already exists
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash and create user
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
        id: user.id,
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
     const user = await this.prisma.user.findUnique({
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
         id: user.id,
         email: user.email,
         name: user.name,
         roleId: user.roleId,
       },
       accessToken,
       refreshToken,
     };
   }

   async refreshToken(refreshToken: string) {
     try {
       // Verify and decode refresh token
       const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as {
         userId: number;
       };

       // Find user by decoded userId
       const user = await this.prisma.user.findUnique({
         where: { id: decoded.userId },
         include: { role: true },
       });

       if (!user) {
         throw new ApiError(401, 'Invalid refresh token');
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

       return { accessToken };
     } catch (error) {
       // Handle JWT verification errors (invalid, expired, etc.)
       if (error instanceof jwt.JsonWebTokenError) {
         throw new ApiError(401, 'Invalid refresh token');
       }
       if (error instanceof jwt.TokenExpiredError) {
         throw new ApiError(401, 'Refresh token expired');
       }
       throw error;
     }
   }

   async validateToken(token: string): Promise<AuthUser> {
     try {
       // Verify and decode access token
       const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
         userId: number;
       };

       // Find user by decoded userId
       const user = await this.prisma.user.findUnique({
         where: { id: decoded.userId },
         include: { role: true },
       });

       if (!user) {
         throw new ApiError(401, 'User not found');
       }

       // Return internal AuthUser type with English field names
       return {
         userId: user.id,
         roleId: user.roleId,
         roleName: user.role.name,
         isAdmin: user.role.name === 'ADMIN',
       };
     } catch (error) {
       // Handle JWT verification errors (invalid, expired, etc.)
       if (error instanceof jwt.JsonWebTokenError) {
         throw new ApiError(401, 'Invalid token');
       }
       if (error instanceof jwt.TokenExpiredError) {
         throw new ApiError(401, 'Token expired');
       }
       throw error;
     }
   }
}
