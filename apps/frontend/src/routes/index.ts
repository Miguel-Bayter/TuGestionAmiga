import { lazy } from 'react'

// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'))
const LoansPage = lazy(() => import('@/features/loans/pages/LoansPage'))
const AccountPage = lazy(() => import('@/features/account/pages/AccountPage'))
const AdminPage = lazy(() => import('@/features/admin/pages/AdminPage'))
const HelpPage = lazy(() => import('@/features/help/pages/HelpPage'))

// Auth pages (not lazy loaded as they're typically small and frequently accessed)
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'

export interface RouteConfig {
  path: string
  element: React.ComponentType<{}>
  requiresAuth?: boolean
  requiresAdmin?: boolean
  title: string
  showInNav?: boolean
  icon?: string
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    element: LoginPage,
    title: 'Iniciar Sesión',
    showInNav: false,
  },
  {
    path: '/registro',
    element: RegisterPage,
    title: 'Registro',
    showInNav: false,
  },

  // Protected routes
  {
    path: '/',
    element: DashboardPage,
    requiresAuth: true,
    title: 'Inicio',
    showInNav: true,
    icon: 'home',
  },
  {
    path: '/buscar',
    element: DashboardPage, // Dashboard handles both home and search views
    requiresAuth: true,
    title: 'Buscar',
    showInNav: true,
    icon: 'search',
  },
  {
    path: '/rentable',
    element: DashboardPage, // Dashboard handles rentable mode
    requiresAuth: true,
    title: 'Rentable',
    showInNav: false, // Handled via tabs in Dashboard
  },
  {
    path: '/carrito',
    element: CartPage,
    requiresAuth: true,
    title: 'Carrito',
    showInNav: true,
    icon: 'cart',
  },
  {
    path: '/prestamos',
    element: LoansPage,
    requiresAuth: true,
    title: 'Mis Préstamos',
    showInNav: true,
    icon: 'book-open',
  },
  {
    path: '/cuenta',
    element: AccountPage,
    requiresAuth: true,
    title: 'Mi Cuenta',
    showInNav: true,
    icon: 'user',
  },
  {
    path: '/ayuda',
    element: HelpPage,
    requiresAuth: true,
    title: 'Ayuda',
    showInNav: true,
    icon: 'help',
  },

  // Admin routes
  {
    path: '/admin',
    element: AdminPage,
    requiresAuth: true,
    requiresAdmin: true,
    title: 'Administración',
    showInNav: false, // Only shown to admins
    icon: 'settings',
  },
]

export const navigationRoutes = routes.filter((route) => route.showInNav)

export const publicRoutes = routes.filter((route) => !route.requiresAuth)

export const protectedRoutes = routes.filter((route) => route.requiresAuth && !route.requiresAdmin)

export const adminRoutes = routes.filter((route) => route.requiresAdmin)

// Helper function to get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find((route) => route.path === path)
}

// Helper function to check if route requires auth
export const requiresAuth = (path: string): boolean => {
  const route = getRouteByPath(path)
  return route?.requiresAuth || false
}

// Helper function to check if route requires admin
export const requiresAdmin = (path: string): boolean => {
  const route = getRouteByPath(path)
  return route?.requiresAdmin || false
}
