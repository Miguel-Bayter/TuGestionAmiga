/**
 * Authentication Types
 */

export interface User {
  id: number
  name: string
  email?: string
  roleId: number
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface JWTPayload {
  userId: number
  email: string
  roleId: number
  iat?: number
  exp?: number
}
