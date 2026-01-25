/**
 * API Base Configuration
 * Centralized constants for API endpoints and configuration
 */

/**
 * API Base URL
 * Uses environment variable or defaults to localhost
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  PASSWORD_FORGOT: '/api/password/forgot',
  PASSWORD_RESET: '/api/password/reset',

  // Books
  BOOKS: '/api/books',
  BOOK_BY_ID: (id: number) => `/api/books/${id}`,

  // Cart
  CART: '/api/cart',
  CART_ITEM: (id: number) => `/api/cart/${id}`,
  CART_CHECKOUT: '/api/cart/checkout',

  // Loans
  LOANS: '/api/loans',
  LOAN_BY_ID: (id: number) => `/api/loans/${id}`,
  LOAN_RETURN: (id: number) => `/api/loans/${id}/return`,

  // User
  USER_PROFILE: '/api/user/profile',
  USER_UPDATE: '/api/user/update',
} as const

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Toast Duration (milliseconds)
 */
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

/**
 * Form Validation
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 100,
} as const

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  BOOKS: '/books',
  BOOK_DETAIL: (id: number) => `/books/${id}`,
  CART: '/cart',
  LOANS: '/loans',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  HELP: '/help',
} as const
