/**
 * useToast Hook
 * Convenient hook for toast notifications
 */

import { useToastStore } from '@/shared/infrastructure/stores'
import type { ToastMessage } from '@/shared/domain/types'

interface UseToastReturn {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  remove: (id: string) => void
  clearAll: () => void
  toasts: ToastMessage[]
}

/**
 * Hook for displaying toast notifications
 *
 * @returns Toast utility functions
 *
 * @example
 * const toast = useToast()
 *
 * // Show success message
 * toast.success('Book added to cart!')
 *
 * // Show error with custom duration
 * toast.error('Failed to load books', 5000)
 *
 * // Clear all toasts
 * toast.clearAll()
 */
export function useToast(): UseToastReturn {
  const { toasts, success, error, warning, info, removeToast, clearAllToasts } = useToastStore()

  return {
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clearAll: clearAllToasts,
    toasts,
  }
}
