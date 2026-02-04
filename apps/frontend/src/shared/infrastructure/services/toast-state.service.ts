/**
 * Toast State Service
 * Manages toast notifications state
 * Replaces Zustand useToastStore with service-based state management
 */

import type { ToastMessage } from '@/shared/domain/types'

interface ToastStateData {
  toasts: ToastMessage[]
}

export class ToastStateService {
  private state: ToastStateData = {
    toasts: [],
  }

  private subscribers: Set<(state: ToastStateData) => void> = new Set()
  private toastTimeouts: Map<string, NodeJS.Timeout> = new Map()

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private addToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration?: number
  ): void {
    const id = this.generateId()
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: duration ?? 3000,
    }

    this.state.toasts.push(toast)
    this.notifySubscribers()

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        this.removeToast(id)
      }, toast.duration)
      this.toastTimeouts.set(id, timeout)
    }
  }

  success(message: string, duration?: number): void {
    this.addToast(message, 'success', duration)
  }

  error(message: string, duration?: number): void {
    this.addToast(message, 'error', duration)
  }

  warning(message: string, duration?: number): void {
    this.addToast(message, 'warning', duration)
  }

  info(message: string, duration?: number): void {
    this.addToast(message, 'info', duration)
  }

  removeToast(id: string): void {
    // Clear timeout if exists
    const timeout = this.toastTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      this.toastTimeouts.delete(id)
    }

    // Remove from toasts array
    this.state.toasts = this.state.toasts.filter((toast) => toast.id !== id)
    this.notifySubscribers()
  }

  clearAllToasts(): void {
    // Clear all timeouts
    this.toastTimeouts.forEach((timeout) => {
      clearTimeout(timeout)
    })
    this.toastTimeouts.clear()

    // Clear all toasts
    this.state.toasts = []
    this.notifySubscribers()
  }

  // State management
  getState(): ToastStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: ToastStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
