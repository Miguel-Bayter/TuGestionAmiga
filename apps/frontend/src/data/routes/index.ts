import { ComponentType, lazy } from 'react'
import { LoginPage } from '@/presentation/features/auth/pages/login.page'
import { RegisterPage } from '@/presentation/features/auth/pages/register.page'
// Lazy-loaded pages for code splitting
const DashboardPage = lazy(() => import('@/presentation/features/dashboard/pages/dashboard.page'))
const CartPage = lazy(() => import('@/presentation/features/cart/pages/cart.page'))
const LoansPage = lazy(() => import('@/presentation/features/loans/pages/loans.page'))
const AccountPage = lazy(() => import('@/presentation/features/account/pages/account.page'))
const AdminPage = lazy(() => import('@/presentation/features/admin/pages/admin.page'))
const HelpPage = lazy(() => import('@/presentation/features/help/pages/help.page'))

export interface RouteConfig {
  path: string
  title: string
  element: ComponentType
  requiresAuth?: boolean
  requiresAdmin?: boolean
  showInNav?: boolean
  icon?: string
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    title: 'Iniciar Sesión',
    element: LoginPage,
    showInNav: false,
  },
  {
    path: '/registro',
    title: 'Registro',
    element: RegisterPage,
    showInNav: false,
  },

  // Protected routes
  {
    path: '/',
    title: 'Inicio',
    element: DashboardPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'home',
  },
  {
    path: '/buscar',
    title: 'Buscar',
    element: DashboardPage, // Dashboard handles both home and search views
    requiresAuth: true,
    showInNav: true,
    icon: 'search',
  },
  {
    path: '/rentable',
    title: 'Rentable',
    element: DashboardPage, // Dashboard handles rentable mode
    requiresAuth: true,
    showInNav: false, // Handled via tabs in Dashboard
  },
  {
    path: '/carrito',
    title: 'Carrito',
    element: CartPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'cart',
  },
  {
    path: '/prestamos',
    title: 'Mis Préstamos',
    element: LoansPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'book-open',
  },
  {
    path: '/cuenta',
    title: 'Mi Cuenta',
    element: AccountPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'user',
  },
  {
    path: '/ayuda',
    title: 'Ayuda',
    element: HelpPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'help',
  },

  // Admin routes
  {
    path: '/admin',
    title: 'Administración',
    element: AdminPage,
    requiresAuth: true,
    requiresAdmin: true,
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
