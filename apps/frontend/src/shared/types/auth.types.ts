/**
 * Authentication Types
 */

export interface User {
  id_usuario: number
  nombre: string
  email?: string
  correo?: string
  id_rol: number
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
  nombre: string
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface JWTPayload {
  id_usuario: number
  email: string
  id_rol: number
  iat?: number
  exp?: number
}
