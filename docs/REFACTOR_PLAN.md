# 🚀 PLAN DE REFACTORIZACIÓN FRONTEND - TU GESTIÓN AMIGA

**Objetivo:** Refactorizar completamente el frontend desde una arquitectura legacy a una arquitectura moderna y escalable.

**Stack Objetivo:**

- ✅ React 19 (con compilador automático)
- ✅ TypeScript 5.7+ (strict mode)
- ✅ Vite 7 (sin proxy innecesario)
- ✅ Zustand 5 (state management minimalista)
- ✅ Tailwind CSS v4 (sin PostCSS)
- ✅ Node 20.9.0+
- ✅ pnpm 10.28.0 (ya instalado)

---

## 📊 ESTADO ACTUAL vs OBJETIVO

### Estado Actual

```
React 18.3.1 (legacy)
├── Sin TypeScript
├── Vite 5.4.0 (con proxy innecesario)
├── Tailwind v3 + PostCSS (obsoleto)
├── Estructura flat
├── Auth con localStorage (inseguro)
├── Sin state management global
└── Componentes con lógica + UI mezclados
```

### Estado Objetivo

```
React 19 (moderno)
├── TypeScript 5.7+ (strict)
├── Vite 7 (sin proxy, optimizado)
├── Tailwind v4 (rápido, sin PostCSS)
├── Feature-based structure
├── JWT + Zustand stores
├── State management centralizado
└── Container/Presentation pattern
```

---

## 🎯 PLAN EJECUTIVO (13 FASES)

### FASE 1: HERRAMIENTAS BASE Y DEPENDENCIAS ⚙️

#### 1.1: Actualizar package.json

```bash
pnpm add react@19 react-dom@19 zustand@5 jwt-decode@4 react-router-dom@6
pnpm add -D typescript@5 @types/react@19 @types/react-dom@19 @types/node@20 vite@7 tailwindcss@4
pnpm remove postcss autoprefixer  # ❌ No necesarios en Tailwind v4
```

**Cambios a package.json:**

```json
{
  "name": "@tu-gestion-amiga/frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.28.0",
    "zustand": "^5.0.0",
    "jwt-decode": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^20.10.0",
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0"
  }
}
```

#### 1.2: Crear tsconfig.json

**Archivo:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Strict Type-Checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "alwaysStrict": true,

    /* Module Resolution */
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@types/*": ["src/types/*"],
      "@lib/*": ["src/lib/*"]
    },

    /* JSX */
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

#### 1.3: Crear vite.config.ts (SIN PROXY)

**Archivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
      '@lib': path.resolve(__dirname, './src/lib')
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
    // ✅ SIN PROXY - CORS habilitado en backend
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand']
  }
})
```

#### 1.4: Crear tailwind.config.ts (v4)

**Archivo:** `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
```

**❌ ELIMINAR:** `postcss.config.js` (no necesario en v4)

#### 1.5: Actualizar index.html

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tu Gestión Amiga</title>
  </head>
  <body class="bg-gray-100 overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

---

### FASE 2: ESTRUCTURA DE DIRECTORIOS 📁

#### 2.1-2.3: Crear nueva estructura

```bash
# Crear directorios base
mkdir -p src/{app,features,components,hooks,stores,lib,types,styles,config}

# Crear features
mkdir -p src/features/{auth,dashboard,cart,books,admin,account,loans,help}/{components,pages,stores,hooks,types}
```

**Estructura final:**

```
src/
├── app/                      # Root app
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.ts
├── features/                 # Feature-based
│   ├── auth/
│   │   ├── components/
│   │   │   ├── RequireAuth.tsx
│   │   │   ├── RequireAdmin.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── types/
│   │       └── auth.types.ts
│   ├── dashboard/
│   ├── cart/
│   ├── books/
│   ├── admin/
│   ├── account/
│   ├── loans/
│   └── help/
├── components/              # Shared UI (sin lógica)
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Toast.tsx
│   └── modals/
├── hooks/                   # Custom hooks
│   ├── useAuthGuard.ts
│   ├── useApi.ts
│   └── useToast.ts
├── stores/                  # Zustand stores
│   ├── useAuthStore.ts
│   ├── useCartStore.ts
│   ├── useToastStore.ts
│   └── useUIStore.ts
├── lib/                     # Utilities
│   ├── api.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── types.ts (deprecated - usa /types)
├── types/                   # TypeScript types
│   ├── auth.types.ts
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
├── styles/
│   └── index.css
├── config/
│   └── constants.ts
└── .env.local
```

---

### FASE 3: TIPOS TYPESCRIPT 📝

#### 3.1: src/types/auth.types.ts

```typescript
export interface User {
  id_usuario: number
  nombre: string
  email: string
  id_rol: number
  createdAt?: string
  updatedAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RegisterRequest extends LoginRequest {
  nombre: string
}

export interface RegisterResponse extends LoginResponse {}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
}

export interface JWTPayload {
  id_usuario: number
  email: string
  id_rol: number
  iat?: number
  exp?: number
}
```

#### 3.2: src/types/api.types.ts

```typescript
export interface Book {
  id_libro: number
  titulo: string
  autor: string
  descripcion?: string
  precio: number
  disponible: boolean
  portada_url?: string
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  id_carrito: number
  id_usuario: number
  id_libro: number
  cantidad: number
  precio_unitario: number
  createdAt?: string
  updatedAt?: string
  libro?: Book
}

export interface Loan {
  id_prestamo: number
  id_usuario: number
  id_libro: number
  fecha_prestamo: string
  fecha_vencimiento: string
  devuelto: boolean
  createdAt?: string
  updatedAt?: string
  libro?: Book
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, any>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

#### 3.3: src/types/common.types.ts

```typescript
export type StatusType = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface ModalState {
  isOpen: boolean
  data?: any
}
```

---

### FASE 4: CAPA API Y JWT 🔐

#### 4.1: src/lib/api.ts (API Client Typed)

```typescript
import { jwtDecode } from 'jwt-decode'
import type { 
  User, 
  LoginRequest, 
  LoginResponse,
  RefreshTokenRequest,
  JWTPayload,
  ApiError,
  Book,
  CartItem,
  Loan
} from '@types/api.types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

class ApiClient {
  private baseUrl = API_BASE
  private token: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    this.token = localStorage.getItem(TOKEN_KEY)
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  private saveTokensToStorage() {
    if (this.token) {
      localStorage.setItem(TOKEN_KEY, this.token)
    }
    if (this.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken)
    }
  }

  private clearTokens() {
    this.token = null
    this.refreshToken = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    })

    // Manejo de token expirado
    if (response.status === 401) {
      if (this.refreshToken) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Reintentar request
          return this.request<T>(endpoint, options)
        }
      }
      this.clearTokens()
      throw new Error('Unauthorized - tokens cleared')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error: ApiError = {
        status: response.status,
        message: errorData.error || `HTTP ${response.status}`,
        code: errorData.code,
        details: errorData.details
      }
      throw error
    }

    return response.json() as Promise<T>
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false

      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      if (!response.ok) {
        this.clearTokens()
        return false
      }

      const data = await response.json()
      this.token = data.accessToken
      this.saveTokensToStorage()
      return true
    } catch {
      this.clearTokens()
      return false
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    this.token = response.accessToken
    this.refreshToken = response.refreshToken
    this.saveTokensToStorage()

    return response
  }

  async register(data: any): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    this.token = response.accessToken
    this.refreshToken = response.refreshToken
    this.saveTokensToStorage()

    return response
  }

  async logout(): Promise<void> {
    this.clearTokens()
  }

  getToken(): string | null {
    return this.token
  }

  isTokenExpired(): boolean {
    if (!this.token) return true

    try {
      const decoded = jwtDecode<JWTPayload>(this.token)
      if (!decoded.exp) return false

      const expirationTime = decoded.exp * 1000
      return Date.now() >= expirationTime
    } catch {
      return true
    }
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return this.request<Book[]>('/api/libros')
  }

  async getBook(id: number): Promise<Book> {
    return this.request<Book>(`/api/libros/${id}`)
  }

  // Cart
  async getCart(userId: number): Promise<CartItem[]> {
    return this.request<CartItem[]>(`/api/carrito?id_usuario=${userId}`)
  }

  async addToCart(userId: number, bookId: number, quantity: number): Promise<CartItem> {
    return this.request<CartItem>('/api/carrito', {
      method: 'POST',
      body: JSON.stringify({ id_usuario: userId, id_libro: bookId, cantidad: quantity })
    })
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    return this.request<CartItem>(`/api/carrito/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad: quantity })
    })
  }

  async removeFromCart(id: number): Promise<void> {
    return this.request<void>(`/api/carrito/${id}`, {
      method: 'DELETE'
    })
  }

  // Loans
  async getLoans(userId: number): Promise<Loan[]> {
    return this.request<Loan[]>(`/api/prestamos?id_usuario=${userId}`)
  }
}

export const apiClient = new ApiClient()
```

#### 4.2-4.3: Utilidades

**src/lib/constants.ts:**

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const TOKEN_EXPIRY_TIME = 15 * 60 * 1000 // 15 minutos
export const REFRESH_TOKEN_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000 // 7 días

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },
  BOOKS: {
    LIST: '/api/libros',
    GET: (id: number) => `/api/libros/${id}`
  },
  CART: {
    LIST: '/api/carrito',
    ADD: '/api/carrito',
    UPDATE: (id: number) => `/api/carrito/${id}`,
    DELETE: (id: number) => `/api/carrito/${id}`
  },
  LOANS: {
    LIST: '/api/prestamos'
  }
}
```

**src/lib/utils.ts:**

```typescript
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('es-ES')
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'COP'
  }).format(amount)
}

export const clsx = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
```

---

### FASE 5: ZUSTAND STORES 🗂️

#### 5.1: src/stores/useAuthStore.ts

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@lib/api'
import type { User, LoginResponse } from '@types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  clearError: () => void
  setInitialized: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.login(email, password)
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error desconocido'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.register(data)
          set({
            user: response.user,
            token: response.accessToken,
            refreshToken: response.refreshToken,
            isLoading: false
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error desconocido'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: () => {
        apiClient.logout()
        set({
          user: null,
          token: null,
          refreshToken: null,
          error: null
        })
      },

      setUser: (user: User | null) => set({ user }),

      clearError: () => set({ error: null }),

      setInitialized: (value: boolean) => set({ isInitialized: value })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken
      })
    }
  )
)
```

#### 5.2: src/stores/useCartStore.ts

```typescript
import { create } from 'zustand'
import { apiClient } from '@lib/api'
import type { CartItem } from '@types/api.types'

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null

  fetchCart: (userId: number) => Promise<void>
  addItem: (userId: number, bookId: number, quantity: number) => Promise<void>
  updateItem: (cartId: number, quantity: number) => Promise<void>
  removeItem: (cartId: number) => Promise<void>
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async (userId: number) => {
    set({ isLoading: true, error: null })
    try {
      const items = await apiClient.getCart(userId)
      set({ items, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      set({ error: message, isLoading: false })
    }
  },

  addItem: async (userId: number, bookId: number, quantity: number) => {
    try {
      await apiClient.addToCart(userId, bookId, quantity)
      await get().fetchCart(userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      set({ error: message })
    }
  },

  updateItem: async (cartId: number, quantity: number) => {
    try {
      await apiClient.updateCartItem(cartId, quantity)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      set({ error: message })
    }
  },

  removeItem: async (cartId: number) => {
    try {
      await apiClient.removeFromCart(cartId)
      set((state) => ({
        items: state.items.filter((item) => item.id_carrito !== cartId)
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error'
      set({ error: message })
    }
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.cantidad, 0)
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0)
  }
}))
```

#### 5.3: src/stores/useToastStore.ts

```typescript
import { create } from 'zustand'
import type { ToastMessage } from '@types/common.types'

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastMessage['type'], duration?: number) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message: string, type: ToastMessage['type'], duration = 3000) => {
    const id = Date.now().toString()
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id, message, type, duration }
      ]
    }))

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, duration)
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },

  clearToasts: () => set({ toasts: [] })
}))
```

#### 5.4: src/stores/useUIStore.ts

```typescript
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (value: boolean) => void
  setSidebarCollapsed: (value: boolean) => void
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
}

export const useUIStore = create<UIState>(
  (set) => ({
    sidebarOpen: false,
    sidebarCollapsed: false,

    setSidebarOpen: (value: boolean) => set({ sidebarOpen: value }),

    setSidebarCollapsed: (value: boolean) => set({ sidebarCollapsed: value }),

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  })
)
```

---

### FASE 6: CUSTOM HOOKS 🎣

#### 6.1: src/hooks/useAuthGuard.ts

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'

export const useAuthGuard = (adminOnly: boolean = false) => {
  const navigate = useNavigate()
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return

    if (!user) {
      navigate('/login', { replace: true })
      return
    }

    if (adminOnly && user.id_rol !== 1) {
      navigate('/', { replace: true })
      return
    }
  }, [user, adminOnly, isInitialized, navigate])

  return user
}
```

#### 6.2: src/hooks/useApi.ts

```typescript
import { useState, useCallback } from 'react'
import { useToastStore } from '@stores/useToastStore'
import type { StatusType } from '@types/common.types'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<StatusType>('idle')
  const [error, setError] = useState<Error | null>(null)
  const { addToast } = useToastStore()

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setStatus('loading')
      setError(null)

      try {
        const result = await apiCall()
        setData(result)
        setStatus('success')
        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setStatus('error')
        addToast(error.message, 'error')
        options.onError?.(error)
        throw error
      }
    },
    [options, addToast]
  )

  return { data, status, error, execute, isLoading: status === 'loading' }
}
```

#### 6.3: src/hooks/useToast.ts

```typescript
import { useToastStore } from '@stores/useToastStore'

export const useToast = () => {
  const { addToast } = useToastStore()

  return {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    warning: (message: string) => addToast(message, 'warning'),
    info: (message: string) => addToast(message, 'info')
  }
}
```

---

### FASE 7-11: COMPONENTES Y PÁGINAS

#### 7.1: src/components/Layout.tsx (Presentación Pura)

```typescript
import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Toast from './Toast'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <Navbar />
      
      <div className="flex-1 md:flex md:items-start">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 min-h-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <Toast />
    </div>
  )
}

export default Layout
```

#### 8.1: src/features/auth/components/RequireAuth.tsx

```typescript
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'

interface RequireAuthProps {
  children: React.ReactNode
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, isInitialized } = useAuthStore()

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default RequireAuth
```

#### 9.1: src/features/auth/pages/LoginPage.tsx (Container Pattern)

```typescript
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import LoginPresentation from './LoginPresentation'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleLogin = async (email: string, password: string) => {
    try {
      clearError()
      await login(email, password)
      navigate('/')
    } catch (err) {
      // Error manejado por el store
    }
  }

  return (
    <LoginPresentation
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  )
}

export default LoginPage
```

#### 10.1: src/features/dashboard/pages/DashboardContainer.tsx (Container Pattern)

```typescript
import React, { useEffect } from 'react'
import { useApi } from '@hooks/useApi'
import { apiClient } from '@lib/api'
import type { Book } from '@types/api.types'
import DashboardPresentation from './DashboardPresentation'

export const DashboardContainer: React.FC = () => {
  const { data: books, isLoading, error, execute } = useApi<Book[]>()

  useEffect(() => {
    execute(() => apiClient.getBooks())
  }, [execute])

  return (
    <DashboardPresentation
      books={books || []}
      loading={isLoading}
      error={error?.message || null}
    />
  )
}

export default DashboardContainer
```

#### 11.1: src/app/routes.ts

```typescript
import React, { lazy } from 'react'
import { RouteObject, Navigate } from 'react-router-dom'
import RequireAuth from '@features/auth/components/RequireAuth'
import RequireAdmin from '@features/auth/components/RequireAdmin'

const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'))
const CartPage = lazy(() => import('@features/cart/pages/CartPage'))
const AccountPage = lazy(() => import('@features/account/pages/AccountPage'))
const AdminPage = lazy(() => import('@features/admin/pages/AdminPage'))
const HelpPage = lazy(() => import('@features/help/pages/HelpPage'))
const LoansPage = lazy(() => import('@features/loans/pages/LoansPage'))

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    )
  },
  {
    path: '/carrito',
    element: (
      <RequireAuth>
        <CartPage />
      </RequireAuth>
    )
  },
  {
    path: '/cuenta',
    element: (
      <RequireAuth>
        <AccountPage />
      </RequireAuth>
    )
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminPage />
      </RequireAdmin>
    )
  },
  {
    path: '/ayuda',
    element: (
      <RequireAuth>
        <HelpPage />
      </RequireAuth>
    )
  },
  {
    path: '/prestamos',
    element: (
      <RequireAuth>
        <LoansPage />
      </RequireAuth>
    )
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]
```

#### 11.2: src/app/App.tsx

```typescript
import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@stores/useAuthStore'
import { routes } from './routes'

export const App: React.FC = () => {
  const { setInitialized } = useAuthStore()

  useEffect(() => {
    // Inicializar state cuando monta el app
    setInitialized(true)
  }, [setInitialized])

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
```

#### 11.3: src/app/main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

### FASE 12: ESTILOS Y CONFIG 🎨

#### 12.1: src/styles/index.css (Tailwind v4)

```css
@import "tailwindcss";

@layer components {
  .sidebar-link {
    @apply px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-3 text-gray-600 hover:bg-gray-100;
  }

  .sidebar-link-active {
    @apply bg-blue-50 text-blue-600;
  }

  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors;
  }

  .input-base {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

#### 12.2: src/config/constants.ts

```typescript
export const APP_CONFIG = {
  name: 'Tu Gestión Amiga',
  description: 'Plataforma de gestión de libros',
  version: '2.0.0'
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000
}

export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiryBuffer: 60000 // 1 minuto
}
```

#### 12.3: .env.local (Template)

```bash
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

### FASE 13: VALIDACIÓN Y TESTING ✅

#### 13.1: Verificar tipos

```bash
pnpm type-check
```

#### 13.2: Build

```bash
pnpm build
```

#### 13.3: Dev

```bash
pnpm dev
```

#### 13.4-13.5: Checklist de Funcionalidades

- ✅ Login y registro funcionan
- ✅ JWT se obtiene y se persiste
- ✅ Token refresh automático
- ✅ Guards de ruta (RequireAuth, RequireAdmin)
- ✅ Carrito se carga y actualiza
- ✅ Toast notificaciones
- ✅ Sidebar collapse/expand
- ✅ Hot reload sin errores
- ✅ Sin errores de tipo en consola
- ✅ Build genera dist sin warnings

---

## 📊 RESUMEN DE CAMBIOS

| Aspecto | Antes | Después |
|---------|-------|---------|
| **React** | 18.3.1 | 19.0.0+ |
| **TypeScript** | ❌ | ✅ 5.7+ |
| **Vite** | 5.4.0 (con proxy) | 7.0.0+ (sin proxy) |
| **Tailwind** | v3 + PostCSS | v4 (native) |
| **State** | localStorage | Zustand + localStorage |
| **Auth** | Inseguro (localStorage) | JWT + refresh tokens |
| **Estructura** | Flat | Feature-based |
| **Patrones** | Mezcla lógica+UI | Container/Presentation |
| **Seguridad** | Baja | Alta (JWT, tipos, strict) |

---

## 🚦 ORDEN DE EJECUCIÓN

### Crítico (Haz primero)

1. FASE 1: Dependencias y configuración
2. FASE 2: Estructura de directorios
3. FASE 3: Tipos TypeScript
4. FASE 4: API Client con JWT

### Importante

5. FASE 5: Zustand stores
2. FASE 6: Hooks
3. FASE 7-11: Componentes y páginas

### Finalización

12. FASE 12: Estilos
2. FASE 13: Validación

---

## 🎯 MÉTRICAS DE ÉXITO

- ✅ 0 errores de tipo (TypeScript strict)
- ✅ Build exitoso sin warnings
- ✅ Todas las funcionalidades preservadas
- ✅ Mejor performance (Vite 7 + React 19)
- ✅ Código más mantenible y escalable
- ✅ Seguridad mejorada (JWT + tokens)

---

## 📚 RECURSOS

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [JWT Best Practices](https://jwt.io/)

---

**Creado:** Enero 18, 2026
**Estado:** PLAN LISTO PARA EJECUTAR
**Modo:** READ-ONLY (Plan phase) - Esperando confirmación para implementar
