/**
 * Auth Request Types
 * Input types for authentication endpoints
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface VerifyPasswordCodeRequest {
  email: string
  code: string
  newPassword: string
}
