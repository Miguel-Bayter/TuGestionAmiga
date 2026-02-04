/**
 * User Schemas
 * Zod validation schemas for user endpoints
 */

import { z } from 'zod'

/**
 * User profile validation schema
 */
export const userProfileSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  roleId: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type UserProfileType = z.infer<typeof userProfileSchema>

/**
 * Update user profile request validation schema
 */
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
})

export type UpdateUserProfileType = z.infer<typeof updateUserProfileSchema>

/**
 * Change password request validation schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type ChangePasswordType = z.infer<typeof changePasswordSchema>
