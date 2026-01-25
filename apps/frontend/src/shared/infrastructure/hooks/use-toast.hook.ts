/**
 * useToast Hook
 * Convenient hook for toast notifications
 * Uses ToastStateService instead of Zustand
 */

import { useState, useEffect } from 'react'
import { useService } from './use-container.hook'
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
  const toastService = useService('toastStateService')
  const [toasts, setToasts] = useState<ToastMessage[]>(() => toastService.getState().toasts)

  useEffect(() => {
    const unsubscribe = toastService.subscribe((state: any) => {
      setToasts(state.toasts)
    })
    return unsubscribe
  }, [toastService])

  return {
    success: (message: string, duration?: number) => toastService.success(message, duration),
    error: (message: string, duration?: number) => toastService.error(message, duration),
    warning: (message: string, duration?: number) => toastService.warning(message, duration),
    info: (message: string, duration?: number) => toastService.info(message, duration),
    remove: (id: string) => toastService.removeToast(id),
    clearAll: () => toastService.clearAllToasts(),
    toasts,
  }
}
