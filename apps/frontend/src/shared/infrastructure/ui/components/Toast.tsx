/**
 * Toast Component
 * Displays toast notifications using the toast store
 */

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useToast } from '@/shared/hooks/use-toast.hook'
import { cn } from '@/shared/helpers/classnames.helper'

export function Toast() {
  const { toasts, remove } = useToast()

  // Auto-remove toasts (handled by store, but we can add escape key here)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        toasts.forEach((toast) => remove(toast.id))
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [toasts, remove])

  if (toasts.length === 0) return null

  const portalTarget = typeof document !== 'undefined' ? document.body : null
  if (!portalTarget) return null

  const toastNode = (
    <div className='fixed top-4 right-4 z-[90] flex flex-col gap-2 max-w-sm'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl ring-1 animate-in slide-in-from-top-2',
            {
              'bg-gray-900/95 text-white ring-white/10': toast.type === 'info',
              'bg-green-600/95 text-white ring-white/10': toast.type === 'success',
              'bg-red-600/95 text-white ring-white/10': toast.type === 'error',
              'bg-amber-600/95 text-white ring-white/10': toast.type === 'warning',
            }
          )}
          role='alert'
          aria-live='polite'
        >
          <div className='flex items-start gap-3'>
            <div className='flex-1'>{toast.message}</div>
            <button
              type='button'
              onClick={() => remove(toast.id)}
              className='flex-shrink-0 text-white/70 hover:text-white'
              aria-label='Cerrar notificación'
            >
              <svg
                className='h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  return createPortal(toastNode, portalTarget)
}
