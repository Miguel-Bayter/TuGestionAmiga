/**
 * useAuthGuard Hook
 * Guard hook for checking authentication and admin status
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/infrastructure/stores'
import { ROUTES } from '@/shared/application/config'
import type { User } from '@/shared/domain/types'

interface UseAuthGuardOptions {
  adminOnly?: boolean
  redirectTo?: string
}

interface UseAuthGuardReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Hook to guard routes and check authentication/authorization
 *
 * @param options - Configuration options
 * @param options.adminOnly - If true, requires admin role (id_rol === 1)
 * @param options.redirectTo - Custom redirect path (defaults to /login or /)
 * @returns Authentication state
 *
 * @example
 * // Basic auth guard
 * const { user, isAuthenticated } = useAuthGuard()
 *
 * @example
 * // Admin-only guard
 * const { user } = useAuthGuard({ adminOnly: true })
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}): UseAuthGuardReturn {
  const { adminOnly = false, redirectTo } = options
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      navigate(redirectTo || ROUTES.LOGIN, { replace: true })
      return
    }

    // Admin check
    if (adminOnly && user.id_rol !== 1) {
      // Not an admin - redirect to home
      navigate(redirectTo || ROUTES.HOME, { replace: true })
      return
    }
  }, [isAuthenticated, user, isLoading, adminOnly, redirectTo, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}
