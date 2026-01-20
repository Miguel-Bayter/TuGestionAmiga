/**
 * Toast Store
 * Manages toast notifications
 */

import { create } from 'zustand'
import { generateId } from '@/shared/helpers'
import { TOAST_DURATION } from '@/shared/config'
import type { ToastMessage } from '@/shared/types'

interface ToastState {
  // State
  toasts: ToastMessage[]

  // Actions
  showToast: (message: string, type?: ToastMessage['type'], duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  // Initial state
  toasts: [],

  // Generic toast
  showToast: (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    const id = generateId()
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: duration || TOAST_DURATION.MEDIUM,
    }

    set({ toasts: [...get().toasts, toast] })

    // Auto-remove after duration
    if (toast.duration) {
      setTimeout(() => {
        get().removeToast(id)
      }, toast.duration)
    }
  },

  // Success toast
  success: (message: string, duration?: number) => {
    get().showToast(message, 'success', duration)
  },

  // Error toast
  error: (message: string, duration?: number) => {
    get().showToast(message, 'error', duration || TOAST_DURATION.LONG)
  },

  // Warning toast
  warning: (message: string, duration?: number) => {
    get().showToast(message, 'warning', duration)
  },

  // Info toast
  info: (message: string, duration?: number) => {
    get().showToast(message, 'info', duration)
  },

  // Remove specific toast
  removeToast: (id: string) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },

  // Clear all toasts
  clearAllToasts: () => {
    set({ toasts: [] })
  },
}))
