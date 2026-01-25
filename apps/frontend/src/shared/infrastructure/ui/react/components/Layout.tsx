/**
 * Layout Component
 * Main application layout with sidebar, navbar, and content area
 */

import { ReactNode, useEffect, useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Toast } from './Toast'
import { useContainer } from '@/shared/infrastructure/hooks/use-container.hook'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { useUIStore } from '@/shared/infrastructure/stores'
import { cn } from '@/shared/application/helpers/classnames.helper'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const container = useContainer()
  const authService = container.cradle.authStateService as any
  const { user } = useServiceState(authService) as any
  const cartService = container.cradle.cartStateService as any
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useUIStore()

  // Local sidebar collapsed state (persisted in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Persist sidebar collapsed state
  useEffect(() => {
    try {
      window.localStorage.setItem('sidebarCollapsed', sidebarCollapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  // Check auth on mount
  useEffect(() => {
    authService.checkAuth()
  }, [authService])

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (user?.id_usuario) {
      cartService.getCart()
    }
  }, [user?.id_usuario, cartService])

  // Listen for cart updates from events (for backward compatibility)
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?.id_usuario) {
        cartService.getCart()
      }
    }

    window.addEventListener('tga_cart_updated', handleCartUpdate)
    return () => window.removeEventListener('tga_cart_updated', handleCartUpdate)
  }, [user?.id_usuario, cartService])

  return (
    <div className='relative min-h-screen flex flex-col overflow-x-hidden'>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type='button'
          aria-label='Cerrar menú'
          className='fixed inset-0 z-40 bg-black/30 md:hidden'
          onClick={closeSidebar}
        />
      )}

      {/* Mobile header */}
      <div className='md:hidden sticky top-0 z-40 bg-white shadow'>
        <div className='max-w-7xl mx-auto py-4 px-4'>
          <div className='flex items-center justify-between'>
            <span className='text-2xl font-bold text-blue-600'>Tu Gestión Amiga</span>
            <button
              id='mobile-menu-button'
              aria-label='Abrir menú'
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-400'
              type='button'
              onClick={toggleSidebar}
            >
              <svg
                className='h-6 w-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <circle cx='6' cy='7' r='1.5' fill='currentColor' stroke='none' />
                <circle cx='6' cy='12' r='1.5' fill='currentColor' stroke='none' />
                <circle cx='6' cy='17' r='1.5' fill='currentColor' stroke='none' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 7h10' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 12h10' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 17h10' />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop navbar */}
      <div className='hidden md:block sticky top-0 z-40 bg-white'>
        <Navbar
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
        />
      </div>

      <div className='flex-1 md:flex md:items-start'>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={closeSidebar}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main content */}
        <main
          className={cn('flex-1 p-4 sm:p-6 min-h-0', {
            'md:ml-28': sidebarCollapsed,
            'md:ml-72': !sidebarCollapsed,
          })}
        >
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />
    </div>
  )
}
