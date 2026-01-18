# ✅ CHECKLIST DE IMPLEMENTACIÓN DETALLADO

## FASE 1: SETUP ⚙️

### 1.1: Dependencias

- [ ] `pnpm add react@19 react-dom@19 zustand@5 jwt-decode@4 react-router-dom@6`
- [ ] `pnpm add -D typescript@5 @types/react@19 @types/react-dom@19 @types/node@20`
- [ ] `pnpm add -D vite@7 @vitejs/plugin-react@4 tailwindcss@4`
- [ ] `pnpm remove postcss autoprefixer`
- [ ] `pnpm install` (instalar todas las dependencias)
- [ ] Verificar `pnpm-lock.yaml` actualizado

### 1.2: TypeScript Config

- [ ] Crear `tsconfig.json`
  - [ ] Configurar `strict: true`
  - [ ] Configurar path aliases (@/*, @components/*, etc)
  - [ ] JSX configuration

### 1.3: Vite Config

- [ ] Crear `vite.config.ts` (reemplazar .js)
  - [ ] Definir path aliases
  - [ ] SIN proxy (ya que CORS habilitado)
  - [ ] Configurar optimizeDeps
  - [ ] Build config

### 1.4: Tailwind Config

- [ ] Crear `tailwind.config.ts` (reemplazar .js)
  - [ ] Configurar content paths
  - [ ] Removre plugins (si hay)
- [ ] ❌ ELIMINAR `postcss.config.js`

### 1.5: HTML y Package.json

- [ ] Actualizar `index.html`
  - [ ] Script src: `/src/app/main.tsx`
- [ ] Actualizar `package.json` scripts
  - [ ] `dev`: `"vite"`
  - [ ] `build`: `"tsc && vite build"`
  - [ ] `preview`: `"vite preview"`
  - [ ] `type-check`: `"tsc --noEmit"`

**Estado Fase 1:** ⏳ Pendiente

---

## FASE 2: ESTRUCTURA 📁

### 2.1: Crear directorios base

- [ ] `mkdir -p src/{app,features,components,hooks,stores,lib,types,styles,config}`

### 2.2: Crear features

- [ ] `mkdir -p src/features/auth/{components,pages,stores,hooks,types}`
- [ ] `mkdir -p src/features/dashboard/{components,pages,stores,hooks,types}`
- [ ] `mkdir -p src/features/cart/{components,pages,stores,hooks,types}`
- [ ] `mkdir -p src/features/books/{components,pages,stores,hooks,types}`
- [ ] `mkdir -p src/features/admin/{components,pages,stores,hooks,types}`
- [ ] `mkdir -p src/features/account/{pages,types}`
- [ ] `mkdir -p src/features/loans/{pages,types}`
- [ ] `mkdir -p src/features/help/{pages,types}`

### 2.3: Crear directorios compartidos

- [ ] `mkdir -p src/components/modals`
- [ ] Directorio hooks creado en 2.1
- [ ] Directorio stores creado en 2.1
- [ ] Directorio lib creado en 2.1
- [ ] Directorio types creado en 2.1

**Estado Fase 2:** ⏳ Pendiente

---

## FASE 3: TIPOS TYPESCRIPT 📝

### 3.1: src/types/auth.types.ts

- [ ] Crear archivo
- [ ] `interface User`
- [ ] `interface LoginRequest`
- [ ] `interface LoginResponse`
- [ ] `interface RegisterRequest`
- [ ] `interface RegisterResponse`
- [ ] `interface JWTPayload`
- [ ] `interface AuthTokens`

### 3.2: src/types/api.types.ts

- [ ] Crear archivo
- [ ] `interface Book`
- [ ] `interface CartItem`
- [ ] `interface Loan`
- [ ] `interface ApiError`
- [ ] `interface ApiResponse`

### 3.3: src/types/common.types.ts

- [ ] Crear archivo
- [ ] `type StatusType`
- [ ] `interface PaginationParams`
- [ ] `interface PaginatedResponse`
- [ ] `interface ToastMessage`
- [ ] `interface ModalState`

### 3.4: src/types/index.ts

- [ ] Re-exportar todos los tipos

  ```typescript
  export * from './auth.types'
  export * from './api.types'
  export * from './common.types'
  ```

**Estado Fase 3:** ⏳ Pendiente

---

## FASE 4: CAPA API 🔐

### 4.1: src/lib/api.ts

- [ ] Crear clase `ApiClient`
- [ ] Constructor con token handling
- [ ] Método privado `request<T>()`
- [ ] Manejo de token expirado (401)
- [ ] Método `refreshAccessToken()`
- [ ] Métodos públicos:
  - [ ] `login(email, password)`
  - [ ] `register(data)`
  - [ ] `logout()`
  - [ ] `getToken()`
  - [ ] `isTokenExpired()`
  - [ ] `getBooks()`
  - [ ] `getBook(id)`
  - [ ] `getCart(userId)`
  - [ ] `addToCart(userId, bookId, quantity)`
  - [ ] `updateCartItem(id, quantity)`
  - [ ] `removeFromCart(id)`
  - [ ] `getLoans(userId)`
- [ ] Exportar `apiClient` singleton

### 4.2: src/lib/constants.ts

- [ ] `API_BASE_URL`
- [ ] `TOKEN_EXPIRY_TIME`
- [ ] `REFRESH_TOKEN_EXPIRY_TIME`
- [ ] `API_ENDPOINTS` objeto

### 4.3: src/lib/utils.ts

- [ ] `formatDate()`
- [ ] `formatCurrency()`
- [ ] `clsx()`

**Estado Fase 4:** ⏳ Pendiente

---

## FASE 5: ZUSTAND STORES 🗂️

### 5.1: src/stores/useAuthStore.ts

- [ ] Crear store con tipos
- [ ] State properties:
  - [ ] `user: User | null`
  - [ ] `token: string | null`
  - [ ] `refreshToken: string | null`
  - [ ] `isLoading: boolean`
  - [ ] `error: string | null`
  - [ ] `isInitialized: boolean`
- [ ] Actions:
  - [ ] `login(email, password)`
  - [ ] `register(data)`
  - [ ] `logout()`
  - [ ] `setUser(user)`
  - [ ] `clearError()`
  - [ ] `setInitialized(value)`
- [ ] Middleware: `persist`

### 5.2: src/stores/useCartStore.ts

- [ ] Crear store con tipos
- [ ] State properties:
  - [ ] `items: CartItem[]`
  - [ ] `isLoading: boolean`
  - [ ] `error: string | null`
- [ ] Actions:
  - [ ] `fetchCart(userId)`
  - [ ] `addItem(userId, bookId, quantity)`
  - [ ] `updateItem(cartId, quantity)`
  - [ ] `removeItem(cartId)`
  - [ ] `clearCart()`
  - [ ] `getTotalItems()`
  - [ ] `getTotalPrice()`

### 5.3: src/stores/useToastStore.ts

- [ ] Crear store
- [ ] State: `toasts: ToastMessage[]`
- [ ] Actions:
  - [ ] `addToast(message, type, duration)`
  - [ ] `removeToast(id)`
  - [ ] `clearToasts()`
- [ ] Auto-remove con timeout

### 5.4: src/stores/useUIStore.ts

- [ ] Crear store
- [ ] State:
  - [ ] `sidebarOpen: boolean`
  - [ ] `sidebarCollapsed: boolean`
- [ ] Actions:
  - [ ] `setSidebarOpen()`
  - [ ] `setSidebarCollapsed()`
  - [ ] `toggleSidebar()`
  - [ ] `toggleSidebarCollapse()`

**Estado Fase 5:** ⏳ Pendiente

---

## FASE 6: CUSTOM HOOKS 🎣

### 6.1: src/hooks/useAuthGuard.ts

- [ ] Crear hook
- [ ] Verificar autenticación
- [ ] Redirigir a login si no autenticado
- [ ] Verificar admin si adminOnly=true
- [ ] Retornar user

### 6.2: src/hooks/useApi.ts

- [ ] Crear hook genérico
- [ ] State: `data, status, error`
- [ ] Función `execute(apiCall)`
- [ ] Integrarse con `useToastStore`
- [ ] Manejo de errores

### 6.3: src/hooks/useToast.ts

- [ ] Crear hook
- [ ] Métodos:
  - [ ] `success(message)`
  - [ ] `error(message)`
  - [ ] `warning(message)`
  - [ ] `info(message)`

**Estado Fase 6:** ⏳ Pendiente

---

## FASE 7: COMPONENTES COMPARTIDOS 🧩

### 7.1: src/components/Layout.tsx

- [ ] Convertir Layout.jsx → .tsx
- [ ] Usar useUIStore para sidebar
- [ ] Usar useAuthStore para user
- [ ] Props tipos definidas
- [ ] Renderizar Navbar, Sidebar, Toast
- [ ] Estructura layout completa

### 7.2: src/components/Navbar.tsx

- [ ] Convertir Navbar.jsx → .tsx
- [ ] Props: `onToggleSidebar`
- [ ] Tipos bien definidas

### 7.3: src/components/Sidebar.tsx

- [ ] Extraer de Layout.jsx
- [ ] Usar useUIStore
- [ ] Usar useAuthStore
- [ ] NavLinks con rutas
- [ ] Admin check con user.id_rol

### 7.4: src/features/books/components/BookCard.tsx

- [ ] Convertir BookCard.jsx → .tsx
- [ ] Props: `book: Book`
- [ ] Acciones: comprar, rentar
- [ ] Uso de useToast

### 7.5: src/features/books/components/BookDetailsModal.tsx

- [ ] Convertir BookDetailsModal.jsx → .tsx
- [ ] Props: `book: Book, isOpen, onClose`

### 7.6: src/components/Toast.tsx

- [ ] Crear componente
- [ ] Usar useToastStore
- [ ] Renderizar múltiples toasts
- [ ] Auto-dismiss

**Estado Fase 7:** ⏳ Pendiente

---

## FASE 8: GUARDS DE AUTENTICACIÓN 🔒

### 8.1: src/features/auth/components/RequireAuth.tsx

- [ ] Convertir RequireAuth.jsx → .tsx
- [ ] Usar useAuthStore
- [ ] Verificar user y isInitialized
- [ ] Redirect a /login si no autenticado
- [ ] Children si autenticado

### 8.2: src/features/auth/components/RequireAdmin.tsx

- [ ] Convertir RequireAdmin.jsx → .tsx
- [ ] Usar useAuthGuard(adminOnly=true)
- [ ] Verificar id_rol === 1
- [ ] Redirect a / si no admin

**Estado Fase 8:** ⏳ Pendiente

---

## FASE 9: FEATURE AUTH 🔐

### 9.1: src/features/auth/pages/LoginPage.tsx

- [ ] Container component
- [ ] State: email, password
- [ ] Handle login con useAuthStore
- [ ] Navigate a / después de login
- [ ] Render LoginPresentation

### 9.1.1: src/features/auth/pages/LoginPresentation.tsx

- [ ] UI pura
- [ ] Props: onLogin, isLoading, error
- [ ] Formulario con inputs

### 9.2: src/features/auth/pages/RegisterPage.tsx

- [ ] Container component
- [ ] State: nombre, email, password, confirm
- [ ] Handle register
- [ ] Navigate a / después
- [ ] Render RegisterPresentation

### 9.2.1: src/features/auth/pages/RegisterPresentation.tsx

- [ ] UI pura
- [ ] Form fields

### 9.3: src/features/auth/components/LoginForm.tsx

- [ ] Componente reutilizable
- [ ] Validación básica

### 9.3.1: src/features/auth/components/RegisterForm.tsx

- [ ] Componente reutilizable
- [ ] Validación

**Estado Fase 9:** ⏳ Pendiente

---

## FASE 10: PÁGINAS CON CONTAINER/PRESENTATION 📄

### 10.1: Dashboard

- [ ] src/features/dashboard/pages/DashboardContainer.tsx
  - [ ] useApi hook
  - [ ] Fetch libros
  - [ ] Render Presentation
- [ ] src/features/dashboard/pages/DashboardPresentation.tsx
  - [ ] UI pura
  - [ ] Grid de BookCards

### 10.2: Carrito

- [ ] src/features/cart/pages/CartContainer.tsx
  - [ ] useCartStore
  - [ ] Fetch cart
  - [ ] Actions: update, remove
- [ ] src/features/cart/pages/CartPresentation.tsx
  - [ ] Lista de items
  - [ ] Total y acciones

### 10.3: Admin

- [ ] src/features/admin/pages/AdminContainer.tsx
  - [ ] Datos de admin
- [ ] src/features/admin/pages/AdminPresentation.tsx

### 10.4: Otras páginas

- [ ] src/features/account/pages/AccountPage.tsx
- [ ] src/features/loans/pages/LoansPage.tsx
- [ ] src/features/help/pages/HelpPage.tsx

**Estado Fase 10:** ⏳ Pendiente

---

## FASE 11: APP ROOT Y ROUTING 🛣️

### 11.1: src/app/routes.ts

- [ ] Array de RouteObject[]
- [ ] Lazy load todas las pages
- [ ] Rutas públicas: /login, /register
- [ ] Rutas protegidas: con RequireAuth
- [ ] Rutas admin: con RequireAdmin
- [ ] Catch-all: Navigate a /

### 11.2: src/app/App.tsx

- [ ] BrowserRouter
- [ ] Suspense boundary
- [ ] Routes mapping
- [ ] useAuthStore initialization
- [ ] useEffect setInitialized

### 11.3: src/app/main.tsx

- [ ] ReactDOM.createRoot
- [ ] React.StrictMode
- [ ] Import styles
- [ ] Render App

**Estado Fase 11:** ⏳ Pendiente

---

## FASE 12: ESTILOS Y CONFIG 🎨

### 12.1: src/styles/index.css

- [ ] `@import "tailwindcss"`
- [ ] @layer components
  - [ ] `.sidebar-link`
  - [ ] `.sidebar-link-active`
  - [ ] `.btn-primary`
  - [ ] `.btn-secondary`
  - [ ] `.input-base`

### 12.2: src/config/constants.ts

- [ ] `APP_CONFIG`
- [ ] `API_CONFIG`
- [ ] `AUTH_CONFIG`

### 12.3: .env.local

- [ ] `VITE_API_URL=http://localhost:3000`
- [ ] `VITE_ENV=development`

**Estado Fase 12:** ⏳ Pendiente

---

## FASE 13: VALIDACIÓN Y TESTING ✅

### 13.1: Type checking

- [ ] `pnpm type-check`
- [ ] Verificar 0 errores
- [ ] Revisar warnings

### 13.2: Build

- [ ] `pnpm build`
- [ ] Verificar dist/ generado
- [ ] Revisar output size
- [ ] Sin warnings

### 13.3: Dev

- [ ] `pnpm dev`
- [ ] Verificar servidor inicia
- [ ] Hot reload funciona
- [ ] Sin errores en consola

### 13.4: Funcionalidades core

- [ ] Login funciona
- [ ] JWT obtenido y almacenado
- [ ] Guard de ruta redirect a /login
- [ ] Register funciona
- [ ] Refresh token automático

### 13.5: Funcionalidades secundarias

- [ ] Carrito carga y actualiza
- [ ] Toast notificaciones
- [ ] Sidebar collapse/expand
- [ ] Admin guard funciona
- [ ] Logout limpia tokens

### 13.6: Performance

- [ ] Vite HMR sin lag
- [ ] No memory leaks
- [ ] Build < 5 segundos

### 13.7: Browser testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile (responsive)

**Estado Fase 13:** ⏳ Pendiente

---

## 📊 PROGRESO GENERAL

```
FASES COMPLETADAS: 0 / 13
COMPONENTES MIGRADOS: 0 / 20
STORES CREADOS: 0 / 4
HOOKS CREADOS: 0 / 3
TIPOS DEFINIDOS: 0 / 15

Porcentaje: 0% ▯▯▯▯▯▯▯▯▯▯
```

---

## 📝 NOTAS DURANTE IMPLEMENTACIÓN

### Problemas encontrados

- (vacío hasta ahora)

### Decisiones tomadas

- (vacío hasta ahora)

### Cambios del plan original

- (vacío hasta ahora)

---

## 🎯 ESTADO FINAL

**Última actualización:** Enero 18, 2026
**Status:** 🔴 NO INICIADO
**Esperando:** Confirmación para comenzar

---

## ⚠️ ADVERTENCIAS IMPORTANTES

1. **BACKUP**: Hacer backup de `/src` antes de iniciar
2. **GIT**: Commit antes de refactor: `git commit -m "Pre-refactor backup"`
3. **BRANCHES**: Usar rama separada: `git checkout -b refactor/react19-ts`
4. **NODE**: Verificar Node 20.9.0+: `node -v`
5. **PNPM**: pnpm 10.28.0 ya instalado (no reinstalar)
6. **API**: Verificar backend con CORS habilitado antes de testear

---
