import { ComponentType, lazy } from 'react'
import { LoginPage } from '@/modules/auth/infrastructure/ui/pages/login.page'
import { RegisterPage } from '@/modules/auth/infrastructure/ui/pages/register.page'
// Lazy-loaded pages for code splitting
const DashboardPage = lazy(
  () => import('@/modules/dashboard/infrastructure/ui/pages/dashboard.page')
)
const CartPage = lazy(() => import('@/modules/cart/infrastructure/ui/pages/cart.page'))
const LoansPage = lazy(() => import('@/modules/loans/infrastructure/ui/pages/loans.page'))
const AccountPage = lazy(() => import('@/modules/user/infrastructure/ui/pages/account.page'))
const AdminPage = lazy(() => import('@/modules/dashboard/infrastructure/ui/pages/admin.page'))
const HelpPage = lazy(() => import('@/modules/dashboard/infrastructure/ui/pages/help.page'))

export interface RouteConfig {
  path: string
  titleKey: string
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
    titleKey: 'auth.login',
    element: LoginPage,
    showInNav: false,
  },
  {
    path: '/register',
    titleKey: 'auth.register',
    element: RegisterPage,
    showInNav: false,
  },

  // Protected routes
  {
    path: '/',
    titleKey: 'nav.home',
    element: DashboardPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'home',
  },
  {
    path: '/search',
    titleKey: 'nav.search',
    element: DashboardPage, // Dashboard handles both home and search views
    requiresAuth: true,
    showInNav: true,
    icon: 'search',
  },
  {
    path: '/rentable',
    titleKey: 'nav.rentable',
    element: DashboardPage, // Dashboard handles rentable mode
    requiresAuth: true,
    showInNav: false, // Handled via tabs in Dashboard
  },
  {
    path: '/cart',
    titleKey: 'nav.cart',
    element: CartPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'cart',
  },
  {
    path: '/loans',
    titleKey: 'nav.loans',
    element: LoansPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'book-open',
  },
  {
    path: '/account',
    titleKey: 'nav.account',
    element: AccountPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'user',
  },
  {
    path: '/help',
    titleKey: 'nav.help',
    element: HelpPage,
    requiresAuth: true,
    showInNav: true,
    icon: 'help',
  },

  // Admin routes
  {
    path: '/admin',
    titleKey: 'nav.admin',
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
