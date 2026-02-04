/**
 * RequireAdmin Component
 * Route guard that requires admin role (roleId === 1)
 */

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useContainer } from '@/shared/infrastructure/hooks'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { ROUTES } from '@/shared/application/config'

interface RequireAdminProps {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation()
  const container = useContainer()
  const { authStateService } = container.cradle
  const state = useServiceState(authStateService)
  const { user, isAuthenticated, isLoading } = state

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user?.id) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  // Redirect to home if not admin
  if (user.roleId !== 1) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}
