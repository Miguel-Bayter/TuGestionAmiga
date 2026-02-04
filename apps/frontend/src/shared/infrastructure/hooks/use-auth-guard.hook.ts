/**
 * useAuthGuard Hook
 * Guard hook for checking authentication and admin status
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContainer } from '@/shared/infrastructure/hooks/use-container.hook'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
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
 * @param options.adminOnly - If true, requires admin role (roleId === 1)
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
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user, isAuthenticated, isLoading } = useServiceState(authService) as any

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      navigate(redirectTo || ROUTES.LOGIN, { replace: true })
      return
    }

    // Admin check
    if (adminOnly && user.roleId !== 1) {
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
