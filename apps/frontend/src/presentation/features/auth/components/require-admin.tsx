/**
 * RequireAdmin Component
 * Route guard that requires admin role (id_rol === 1)
 */

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores'
import { ROUTES } from '@/shared/config'

interface RequireAdminProps {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user?.id_usuario) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  // Redirect to home if not admin
  if (user.id_rol !== 1) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <>{children}</>
}
