/**
 * Sidebar Component
 * Navigation sidebar with collapsible functionality
 */

import { NavLink } from 'react-router-dom'
import { useContainer } from '@/shared/infrastructure/hooks/use-container.hook'
import { useServiceState } from '@/shared/infrastructure/hooks/use-service-state.hook'
import { ROUTES } from '@/shared/application/config'
import { cn } from '@/shared/application/helpers'

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export function Sidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: SidebarProps) {
  const container = useContainer()
  const { authStateService, cartStateService } = container.cradle
  const { user } = useServiceState(authStateService)
  const { cart } = useServiceState(cartStateService)

  const isAdmin = user?.roleId === 1

  // Calculate cart count
  const cartCount = cart?.items.reduce((acc, item) => acc + (item.quantity || 0), 0) ?? 0

  const linkClass = ({ isActive }: { isActive: boolean }) => {
    const base = isActive
      ? 'flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-150 bg-blue-600 text-white font-semibold shadow-sm'
      : 'flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-150'
    return isCollapsed
      ? `${base} md:justify-center md:h-11 md:w-11 md:mx-auto md:px-0 md:gap-0`
      : base
  }

  return (
    <aside
      id='sidebar'
      className={cn(
        'relative z-50 bg-white w-64 p-4 inset-y-0 left-0 transform shadow-lg',
        'md:fixed md:top-24 md:left-4 md:inset-y-auto md:transform-none md:rounded-2xl md:ring-1 md:ring-gray-200/60 md:shadow-sm',
        'transition duration-200 ease-in-out',
        {
          'translate-x-0': isOpen,
          '-translate-x-full': !isOpen,
          'md:w-20 md:p-3': isCollapsed,
        }
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn('mb-4 flex items-center border-b border-gray-200/60 pb-4', {
          'justify-center': isCollapsed,
          'gap-3': !isCollapsed,
        })}
      >
        <div className='h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold select-none'>
          T
        </div>
        {!isCollapsed && (
          <div className='min-w-0'>
            <div className='text-sm font-semibold text-gray-900 leading-5 truncate'>
              Tu Gestión Amiga
            </div>
            <div className='text-xs text-gray-500 truncate'>Menú</div>
          </div>
        )}
      </div>

      {/* Collapse/Expand button (desktop only) */}
      <button
        type='button'
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        className='hidden md:inline-flex absolute -right-3 top-8 h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 ring-1 ring-gray-200 shadow-sm hover:bg-gray-50'
        onClick={onToggleCollapse}
      >
        {isCollapsed ? (
          <svg
            className='h-4 w-4'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        ) : (
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
              d='M15 19l-7-7 7-7'
            />
          </svg>
        )}
      </button>

      {/* Navigation */}
      <nav onClick={onClose}>
        <ul className='flex flex-col'>
          {/* Home */}
          <li className='mt-1'>
            <NavLink to={ROUTES.HOME} className={linkClass} end title='Inicio'>
              <svg
                className='w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 10.5l9-7 9 7V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V10.5z'
                />
              </svg>
              <span className={cn({ 'md:hidden': isCollapsed })}>Inicio</span>
            </NavLink>
          </li>

          {/* Search */}
          <li className='mt-1'>
            <NavLink to={ROUTES.BOOKS} className={linkClass} title='Buscar'>
              <svg
                className='w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
              <span className={cn({ 'md:hidden': isCollapsed })}>Buscar</span>
            </NavLink>
          </li>

          {/* Loans */}
          <li className='mt-1'>
            <NavLink to={ROUTES.LOANS} className={linkClass} title='Préstamos'>
              <svg
                className='w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5h6a2 2 0 012 2v1m-10-3a2 2 0 00-2 2v1m12 0H7m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m3 4h4m-4 4h4'
                />
              </svg>
              <span className={cn({ 'md:hidden': isCollapsed })}>Préstamos</span>
            </NavLink>
          </li>

          {/* Cart */}
          <li className='mt-1'>
            <NavLink to={ROUTES.CART} className={linkClass} title='Carrito'>
              <span className='relative inline-flex'>
                <svg
                  className='w-6 h-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M2.25 3h1.5l1.06 4.25m0 0h15.24l-1.35 6.75H6.3m-1.49-6.75L6.3 19.5h12.9'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z'
                  />
                </svg>
                {cartCount > 0 && (
                  <span
                    className='absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[11px] font-bold leading-[18px] text-center ring-2 ring-white'
                    aria-label={`Carrito con ${cartCount} items`}
                    title={`Carrito: ${cartCount}`}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className={cn({ 'md:hidden': isCollapsed })}>Carrito</span>
            </NavLink>
          </li>

          {/* Account */}
          <li className='mt-1'>
            <NavLink to={ROUTES.ACCOUNT} className={linkClass} title='Mi Cuenta'>
              <svg
                className='w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4.5 20.25a7.5 7.5 0 0115 0'
                />
              </svg>
              <span className={cn({ 'md:hidden': isCollapsed })}>Mi Cuenta</span>
            </NavLink>
          </li>

          {/* Admin (only for admins) */}
          {isAdmin && (
            <li className='mt-1'>
              <NavLink to={ROUTES.ADMIN} className={linkClass} title='Administrador'>
                <svg
                  className='w-6 h-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 3l7 4v5c0 5-3 9-7 9s-7-4-7-9V7l7-4z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9.5 12.5l1.5 1.5 3.5-3.5'
                  />
                </svg>
                <span className={cn({ 'md:hidden': isCollapsed })}>Administrador</span>
              </NavLink>
            </li>
          )}

          {/* Help */}
          <li className='mt-4 border-t border-gray-200/60 pt-4'>
            <NavLink to={ROUTES.HELP} className={linkClass} title='Ayuda'>
              <svg
                className='w-6 h-6'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 2a10 10 0 100 20 10 10 0 000-20z'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.75 9a2.25 2.25 0 014.5 0c0 1.5-2.25 1.875-2.25 3.75'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 17.25h.01'
                />
              </svg>
              <span className={cn({ 'md:hidden': isCollapsed })}>Ayuda</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
