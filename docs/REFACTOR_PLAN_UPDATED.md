# 🚀 PLAN DE REFACTORIZACIÓN FRONTEND - VERSIÓN ACTUALIZADA

**Objetivo:** Refactorizar completamente el frontend desde una arquitectura legacy a una arquitectura moderna y escalable.

**Stack Objetivo:**

- ✅ React 19 (con compilador automático)
- ✅ TypeScript 5.7+ (strict mode)
- ✅ Vite 7 (sin proxy innecesario)
- ✅ Zustand 5 (state management minimalista)
- ✅ Tailwind CSS v4 (CSS-first, SIN config file)
- ✅ Node 20.9.0+
- ✅ pnpm 10.28.0 (ya instalado)

---

## 📋 CAMBIOS PRINCIPALES RESPECTO AL PLAN ANTERIOR

### ✅ CORRECCIÓN 1: ALIAS SIMPLIFICADO

**Antes:** Múltiples alias (`@components/*`, `@features/*`, etc.)
**Ahora:** Un único alias `@/*` que cubre todo

### ✅ CORRECCIÓN 2: TAILWIND V4 CSS-FIRST

**Antes:** `tailwind.config.ts` + `postcss.config.js`
**Ahora:** SIN archivos de config, todo en `src/styles/index.css` con `@import "tailwindcss"`

---

## 🎯 FASE 1: HERRAMIENTAS BASE Y DEPENDENCIAS ⚙️

### 1.1: Actualizar package.json

```bash
pnpm add react@19 react-dom@19 zustand@5 jwt-decode@4 react-router-dom@6
pnpm add -D typescript@5 @types/react@19 @types/react-dom@19 @types/node@20 vite@7 tailwindcss@4
pnpm remove postcss autoprefixer  # ❌ No necesarios en Tailwind v4
```

**Cambios a package.json:**

```json
{
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

---

### 1.2: Crear tsconfig.json (ALIAS ÚNICO)

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

    /* ALIAS ÚNICO - Cubre todo src/ */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* JSX */
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Ejemplo de imports con alias:**

```typescript
import Layout from '@/components/Layout'
import { useAuthStore } from '@/stores/useAuthStore'
import { Book } from '@/types/api.types'
import { apiClient } from '@/lib/api'
import { useAuthGuard } from '@/hooks/useAuthGuard'
```

---

### 1.3: Crear vite.config.ts (ALIAS ÚNICO)

**Archivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
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

---

### 1.4: Tailwind CSS v4 - CSS-FIRST (SIN CONFIG FILES)

#### ❌ ELIMINAR ESTOS ARCHIVOS

```bash
# Archivos que NO necesitas crear/mantener:
❌ tailwind.config.js
❌ tailwind.config.ts
❌ postcss.config.js
❌ postcss.config.mjs
```

#### ✅ ACTUALIZAR `src/styles/index.css`

**Archivo:** `src/styles/index.css`

```css
/* Tailwind CSS v4 - CSS-FIRST Configuration */
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

**Beneficios de Tailwind v4 CSS-First:**

- ✅ Sin `tailwind.config.js` (menos archivos)
- ✅ Sin `postcss.config.js` (menos archivos)
- ✅ Sin `autoprefixer` (menos dependencias)
- ✅ Configuración nativa en CSS (más intuitivo)
- ✅ Motor Rust (3.5x más rápido que v3)
- ✅ Mejor soporte para CSS variables

---

### 1.5: Actualizar index.html y package.json

**Archivo:** `index.html`

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

**Scripts en `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 🎯 FASE 2: ESTRUCTURA DE DIRECTORIOS MODERNA 📁

```bash
# Crear directorios base
mkdir -p src/{app,features,components,hooks,stores,lib,types,styles,config}

# Crear features
mkdir -p src/features/{auth,dashboard,cart,books,admin,account,loans,help}/{components,pages,stores,hooks,types}
```

**Estructura final:**

```
src/
├── app/
│   ├── App.tsx
│   ├── main.tsx
│   └── routes.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── hooks/
│   │   └── types/
│   ├── dashboard/
│   ├── cart/
│   ├── books/
│   ├── admin/
│   ├── account/
│   ├── loans/
│   └── help/
├── components/              # Shared UI (sin lógica)
├── hooks/                   # Custom hooks
├── stores/                  # Zustand stores
├── lib/                     # API + utilities
├── types/                   # TypeScript types
├── styles/
│   └── index.css            # Tailwind v4
└── config/
    └── constants.ts
```

---

## 🎯 FASE 3: TIPOS TYPESCRIPT 📝

### 3.1: src/types/auth.types.ts

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

export interface JWTPayload {
  id_usuario: number
  email: string
  id_rol: number
  iat?: number
  exp?: number
}
```

### 3.2: src/types/api.types.ts

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
```

### 3.3: src/types/common.types.ts

```typescript
export type StatusType = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  limit: number
  offset: number
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

## 🎯 FASE 4-6: ZUSTAND STORES, HOOKS Y API

[Referencia al REFACTOR_PLAN.md original para estos detalles]

---

## 📊 RESUMEN DE CAMBIOS

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Aliases** | Múltiples (`@components/*`, `@features/*`, etc.) | ✅ Uno único: `@/*` |
| **Tailwind Config** | `tailwind.config.ts` + `postcss.config.js` | ✅ SIN archivos, todo en CSS |
| **Tailwind Syntax** | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| **PostCSS** | Requerido | ✅ No necesario |
| **Autoprefixer** | Requerido | ✅ No necesario |
| **Config Files** | 3 (vite, tailwind, postcss) | ✅ 2 (vite, tsconfig) |
| **Dependencias** | Más | ✅ Menos |

---

## ✅ CHECKLIST ACTUALIZADO - FASE 1

### 1.1: Dependencias

- [ ] `pnpm add react@19 react-dom@19 zustand@5 jwt-decode@4 react-router-dom@6`
- [ ] `pnpm add -D typescript@5 @types/react@19 @types/react-dom@19 @types/node@20`
- [ ] `pnpm add -D vite@7 @vitejs/plugin-react@4 tailwindcss@4`
- [ ] `pnpm remove postcss autoprefixer`
- [ ] `pnpm install`

### 1.2: TypeScript Config (ACTUALIZADO)

- [ ] Crear `tsconfig.json`
- [ ] ✅ ÚNICO ALIAS: `"@/*": ["src/*"]`
- [ ] Configurar `strict: true`
- [ ] JSX configuration

### 1.3: Vite Config (ACTUALIZADO)

- [ ] Crear `vite.config.ts`
- [ ] ✅ ÚNICO ALIAS: `'@': path.resolve(__dirname, './src')`
- [ ] SIN proxy
- [ ] Build config

### 1.4: Tailwind Config (ELIMINADO)

- [ ] ❌ NO crear `tailwind.config.ts`
- [ ] ❌ NO crear `tailwind.config.js`
- [ ] ✅ Actualizar `src/styles/index.css` con `@import "tailwindcss"`
- [ ] ✅ ELIMINAR `postcss.config.js` si existe
- [ ] ✅ ELIMINAR `postcss.config.mjs` si existe

### 1.5: HTML y Package.json

- [ ] Actualizar `index.html` con script correcto
- [ ] Actualizar `package.json` scripts

---

## 📚 REFERENCIAS

**Información validada con Context7:**

- ✅ Tailwind CSS Official Docs (tailwindlabs/tailwindcss.com)
- ✅ Tailwind v4 Upgrade Guide
- ✅ Tailwind v4 Blog Release

**Documentación útil:**

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vite.dev/guide/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

---

**Versión:** 2.1 (Actualizada con correcciones)
**Fecha:** Enero 18, 2026
**Estado:** ✅ LISTO PARA EJECUTAR
