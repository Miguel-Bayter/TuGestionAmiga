/**
 * Auth Schemas
 * Zod validation schemas for authentication endpoints
 */

import { z } from 'zod'

/**
 * Login request validation schema
 */
export const loginRequestSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginRequestType = z.infer<typeof loginRequestSchema>

/**
 * Register request validation schema
 */
export const registerRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisterRequestType = z.infer<typeof registerRequestSchema>

/**
 * User validation schema
 */
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional(),
  roleId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type UserType = z.infer<typeof userSchema>

/**
 * Login response validation schema
 */
export const loginResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type LoginResponseType = z.infer<typeof loginResponseSchema>

/**
 * Register response validation schema (same as login response)
 */
export const registerResponseSchema = loginResponseSchema

export type RegisterResponseType = z.infer<typeof registerResponseSchema>

/**
 * Refresh token request validation schema
 */
export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
})

export type RefreshTokenRequestType = z.infer<typeof refreshTokenRequestSchema>

/**
 * Refresh token response validation schema
 */
export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
})

export type RefreshTokenResponseType = z.infer<typeof refreshTokenResponseSchema>
