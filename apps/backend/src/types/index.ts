import { Request } from 'express';

export interface AuthUser {
  userId: number;
  roleId: number;
  roleName: string;
  isAdmin: boolean;
}

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

export interface BookPayload {
  title: string;
  author: string;
  description: string;
  categoryId: number;
  price: number;
  purchaseStock?: number;
  rentalStock?: number;
  available?: boolean;
}
