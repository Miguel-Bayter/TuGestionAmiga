/**
 * Common Types
 * Shared types used across the application
 */

/**
 * Status types for async operations
 */
export type StatusType = 'idle' | 'loading' | 'success' | 'error'

/**
 * Toast notification message
 */
export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

/**
 * User role types
 */
export type UserRole = 'admin' | 'user'

/**
 * Generic async state
 */
export interface AsyncState<T = unknown> {
  data: T | null
  status: StatusType
  error: string | null
}

/**
 * Form field validation error
 */
export interface FieldError {
  field: string
  message: string
}

/**
 * Generic form state
 */
export interface FormState {
  isSubmitting: boolean
  errors: FieldError[]
}
