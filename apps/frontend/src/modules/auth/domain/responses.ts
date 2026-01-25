/**
 * Auth Response Types
 * Output types for authentication endpoints
 */

import type { User } from './entities'

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterResponse extends LoginResponse {}

export interface ForgotPasswordResponse {
  message: string
}

export interface RefreshTokenResponse {
  accessToken: string
}
