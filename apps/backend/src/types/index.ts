import { Request } from 'express';
import { AuthUser } from '@/modules/auth/domain/entity/auth.entity';

export interface AuthRequest extends Request {
  auth?: AuthUser;
}

export interface ApiResponse<T extends object> {
  ok: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
