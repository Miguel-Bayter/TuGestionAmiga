# 🔄 Container Patterns - Backend vs Frontend

## ❓ La Gran Pregunta

**¿Por qué en Backend usamos `container.cradle` y en Frontend usamos `useUseCase('')?`**

### TL;DR (La Respuesta Corta)

- **Backend**: Usa `container.cradle` porque es **código síncrono, imperativo y de servidor**
- **Frontend**: Usa `useUseCase()` hook porque es **código asíncrono, reactivo y en el navegador**

---

## 📊 Diferencias Fundamentales

| Aspecto | Backend | Frontend |
|---------|---------|----------|
| **Contexto** | Node.js + Express | React + Navegador |
| **Ciclo de vida** | Una instancia por servidor | Múltiples instancias por sesión |
| **Re-renders** | N/A | Re-renderiza componentes |
| **Acceso a deps** | Directo (sincrónico) | A través de React Context |
| **Patrón de acceso** | `container.cradle.service` | `useUseCase('nombre')` hook |
| **Tipo de llamadas** | HTTP request → resolver → responder | React render → hook → dep |
| **Estado compartido** | Una instancia global | Aislado por Context Provider |

---

## 🏗️ BACKEND: `container.cradle`

### Cómo Funciona

```typescript
// Backend: Express Route Handler

router.post('/login', asyncHandler(async (req, res) => {
  // 1. Cada request accede al MISMO container
  const { authService } = container.cradle
  
  // 2. authService ya está inyectado con todas sus dependencias
  const result = await authService.login(req.body.email, req.body.password)
  
  // 3. Responder al cliente
  res.json(result)
}))
```

### Razones de este Patrón

#### ✅ 1. El container es GLOBAL (una sola instancia)

```typescript
// src/config/container.ts
export const container = createContainer({...})

// Usado en: src/routes/auth.routes.ts
// Usado en: src/routes/books.routes.ts
// Usado en: src/routes/loans.routes.ts
// ...el mismo container en todas partes
```

**Diagrama:**

```
┌─────────────────────────────────────────┐
│           Node.js Process                │
│  ┌─────────────────────────────────────┐ │
│  │     Awilix Container (SINGLETON)    │ │
│  │  ┌──────────────────────────────┐   │ │
│  │  │ authService                   │   │ │
│  │  │ bookService                   │   │ │
│  │  │ loanService                   │   │ │
│  │  └──────────────────────────────┘   │ │
│  └─────────────────────────────────────┘ │
│           ↑                               │
│      Compartido por                       │
│   todas las rutas                         │
└─────────────────────────────────────────┘

Request 1 → [Route] → container.cradle.authService
Request 2 → [Route] → container.cradle.authService (MISMO)
Request 3 → [Route] → container.cradle.bookService (MISMO)
```

#### ✅ 2. Es Sincrónico y Simple

```typescript
// Backend: Acceso directo, sincrónico
const authService = container.cradle.authService

// Sin necesidad de contextos, hooks, o async
// Es solo "dame la instancia"
```

#### ✅ 3. El Request-Response define el ciclo de vida

```typescript
router.post('/login', async (req, res) => {
  // 1. Request llega
  
  // 2. Resolver dependencias
  const { authService } = container.cradle
  
  // 3. Usar el servicio
  const result = await authService.login(...)
  
  // 4. Responder
  res.json(result)
  
  // 5. Request termina, limpiar si es necesario
})
```

---

## 🎨 FRONTEND: `useUseCase()` Hook

### Cómo Funciona

```typescript
// Frontend: React Component

function LoginPage() {
  // 1. Hook obtiene la dependencia del Context
  const loginUseCase = useUseCase('loginUseCase')
  
  // 2. Use case está disponible durante el render
  const handleLogin = async (email: string, password: string) => {
    const result = await loginUseCase.execute(email, password)
    console.log(result)
  }
  
  return (
    <button onClick={() => handleLogin('user@test.com', 'pass')}>
      Login
    </button>
  )
}
```

### Razones de este Patrón

#### ✅ 1. React Context = Múltiples Instancias (por sesión)

```typescript
// src/shared/hooks/use-container.hook.tsx
const ContainerContext = createContext<AwilixContainer | null>(null)

export function ContainerProvider({ children }: { children: ReactNode }) {
  // Cada sesión de usuario tiene su propio provider
  // Pero comparten el container global
  return (
    <ContainerContext.Provider value={container}>
      {children}
    </ContainerContext.Provider>
  )
}

export function useContainer() {
  const ctx = useContext(ContainerContext)
  // Acceder al container a través de React Context
  return ctx
}

export function useUseCase<T extends string>(useCaseName: T) {
  const container = useContext(ContainerContext)
  // Resolver use case desde el container
  return container.cradle[useCaseName as never]
}
```

**Diagrama:**

```
┌──────────────────────────────────────────┐
│         React Application                 │
│  ┌──────────────────────────────────────┐ │
│  │   <ContainerProvider>                │ │
│  │   ┌────────────────────────────────┐ │ │
│  │   │   LoginPage Component          │ │ │
│  │   │   useUseCase('loginUseCase')   │ │ │
│  │   │            ↓                    │ │ │
│  │   │   Awilix Container             │ │ │
│  │   │   (compartido, global)         │ │ │
│  │   │   ┌──────────────────────────┐ │ │ │
│  │   │   │ loginUseCase             │ │ │ │
│  │   │   │ bookUseCase              │ │ │ │
│  │   │   │ cartUseCase              │ │ │ │
│  │   │   └──────────────────────────┘ │ │ │
│  │   └────────────────────────────────┘ │ │
│  │   ┌────────────────────────────────┐ │ │
│  │   │   BookList Component           │ │ │
│  │   │   useUseCase('bookUseCase')    │ │ │
│  │   │            ↓                    │ │ │
│  │   │   Awilix Container (MISMO)    │ │ │
│  │   └────────────────────────────────┘ │ │
│  └──────────────────────────────────────┘ │
│  ┌──────────────────────────────────────┐ │
│  │   <ContainerProvider> (otra sesión)  │ │
│  │   ... (podría tener otro container)   │ │
│  └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### ✅ 2. React Hooks = Integración Natural

```typescript
// Hook es el patrón de React para acceder a recursos compartidos
// Como useState, useEffect, useContext, etc.

function MyComponent() {
  // Todos estos son hooks
  const state = useState(0)
  const container = useContext(ContainerContext)
  const useCase = useUseCase('bookUseCase')
  
  // Es natural y consistente con React
}
```

#### ✅ 3. Context API = Manejo de Estado Global

```typescript
// Si en el futuro necesitas cambiar el container por sesión:

function App() {
  const [sessionContainer, setSessionContainer] = useState(container)
  
  return (
    <ContainerContext.Provider value={sessionContainer}>
      {/* Todos los componentes usan sessionContainer */}
    </ContainerContext.Provider>
  )
}

// Versus en backend, el container es siempre el mismo
const container = createContainer() // Global, única instancia
```

---

## 🔄 Flujo Completo: Request Backend vs Component Frontend

### Backend: Request → Route → Service

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP REQUEST                          │
│              POST /api/auth/login {email, pass}             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Express Route Handler (asyncHandler)            │
│  router.post('/login', asyncHandler(async (req, res) => {   │
│    const { authService } = container.cradle                 │
│                          ↓                                   │
│         Acceso DIRECTO, sincrónico al container             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                              │
│  await authService.login(email, password)                   │
│                          ↓                                   │
│         Inyecta automáticamente LoginUseCase                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    LoginUseCase                             │
│  return this.authRepository.login(email, password)          │
│                          ↓                                   │
│         Inyecta automáticamente AuthRepository              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  AuthRepository                             │
│  - Validar email/password                                   │
│  - Generar JWT tokens                                       │
│  - Retornar resultado                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Route Handler (continuación)                    │
│  res.json(result)  // Responder al cliente                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    HTTP RESPONSE                             │
│          {user: {...}, accessToken: "..."}                  │
└─────────────────────────────────────────────────────────────┘
```

### Frontend: Component Render → Hook → Service

```
┌─────────────────────────────────────────────────────────────┐
│                React Component Renders                      │
│  function LoginPage() { return <LoginForm /> }              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│           useUseCase() Hook es llamado                       │
│  const loginUseCase = useUseCase('loginUseCase')            │
│                          ↓                                   │
│  useContext(ContainerContext) se ejecuta                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│        React Context retorna el Container                    │
│  container.cradle.loginUseCase es resuelto                  │
│                          ↓                                   │
│      Se inyecta AuthRepository automáticamente              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│          Handler de Click: handleLogin(email, pass)         │
│  const result = await loginUseCase.execute(email, pass)    │
│                          ↓                                   │
│    Se ejecuta la lógica de login                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│           Result es procesado y guardado                     │
│  - Token guardado en localStorage                            │
│  - User guardado en Zustand store                            │
│  - Redirigir a dashboard                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│        Component re-renderiza con nuevo estado              │
│          showSuccessMessage = true                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Por Qué Cada Uno es Mejor para su Contexto

### Backend: `container.cradle` es mejor porque

1. **Sincrónico** - Express route handlers son sincrónico al inicio
2. **Servidor estacionario** - El container se crea UNA VEZ al startup
3. **Sin UI** - No hay re-renders o ciclos de vida complejos
4. **Acceso global** - Todos los routes acceden al mismo container

```typescript
// ✅ Natural y simple en backend
router.post('/api/books', async (req, res) => {
  const { bookService } = container.cradle
  const result = await bookService.getAll()
  res.json(result)
})
```

### Frontend: `useUseCase()` hook es mejor porque

1. **Reactivo** - Se integra con el ciclo de vida de React
2. **Aislamiento** - Cada sesión/usuario puede tener su contexto
3. **Testeable** - Puedes mockear el ContainerProvider
4. **Consistente** - Es como usar useState, useContext, etc.

```typescript
// ✅ Natural y reactivo en frontend
function BookList() {
  const bookUseCase = useUseCase('bookUseCase')
  const [books, setBooks] = useState([])

  useEffect(() => {
    bookUseCase.execute().then(setBooks)
  }, [])

  return <div>{books.map(b => <div key={b.id}>{b.title}</div>)}</div>
}
```

---

## 🎯 Comparación Lado a Lado

### Ejemplo Real: Login

#### Backend

```typescript
// src/routes/auth.routes.ts
export function createAuthRoutes(container: AwilixContainer) {
  const router = Router()
  const { authService } = container.cradle  // ← Acceso directo

  router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const result = await authService.login(email, password)  // ← USA SERVICIO DIRECTO
    res.status(200).json(result)
  }))

  return router
}

// Razón: El container es global, existe durante todo el servidor
```

#### Frontend

```typescript
// src/presentation/features/auth/pages/login.page.tsx
function LoginPage() {
  const loginUseCase = useUseCase('loginUseCase')  // ← A través de hook
  const [loading, setLoading] = useState(false)

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await loginUseCase.execute(email, password)  // ← USA USE CASE DESDE HOOK
      localStorage.setItem('accessToken', result.accessToken)
      // Redirigir, etc.
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleLogin(email, password)
    }}>
      {/* Form JSX */}
    </form>
  )
}

// Razón: React componentes necesitan hooks para acceder a contextos
```

---

## 🔐 Ventajas de Cada Patrón

### Backend `container.cradle`

✅ **Simple** - Una línea para acceder a cualquier servicio  
✅ **Performance** - Sin overhead de Context API  
✅ **Directo** - No necesita abstracciones adicionales  
✅ **Global** - Compartido por todas las rutas  

### Frontend `useUseCase()`

✅ **Reactivo** - Se integra con React lifecycle  
✅ **Testeable** - Puedes mockear el Context  
✅ **Flexible** - Puedes cambiar el container por sesión si necesitas  
✅ **Consistente** - Patrón estándar de React hooks  

---

## ⚖️ Podrías Usarlos al Revés?

### ¿Podrías usar `useUseCase()` en Backend?

**Tecnicamente sí, pero sería incorrecto:**

```typescript
// ❌ NO HAGAS ESTO en Backend
// Los hooks de React no funcionan en Node.js

router.post('/login', asyncHandler(async (req, res) => {
  // ❌ Error: useUseCase is not defined (Node.js no tiene React)
  const loginUseCase = useUseCase('loginUseCase')
  res.json(await loginUseCase.execute(...))
}))
```

### ¿Podrías usar `container.cradle` en Frontend?

**Tecnicamente sí, pero sería problemático:**

```typescript
// ⚠️ Podrías, pero es antipatrón en React

import container from '@/presentation/config/container'

function LoginPage() {
  // ⚠️ Funciona, pero:
  // - No reactivo
  // - Difícil de testear
  // - No sigue convenciones de React
  // - Puede causar issues con re-renders
  const loginUseCase = container.cradle.loginUseCase

  return <form onSubmit={...} />
}

// Es mejor usar el hook useUseCase()
```

---

## 📝 Resumen Visual

```
                    BACKEND                          FRONTEND
                   ┌─────────┐                      ┌─────────┐
                   │ Express │                      │  React  │
                   └────┬────┘                      └────┬────┘
                        │                               │
            ┌───────────────────────┐      ┌───────────────────────┐
            │  container.cradle     │      │   useUseCase() hook   │
            ├───────────────────────┤      ├───────────────────────┤
            │ ✓ Global              │      │ ✓ Integrado con React │
            │ ✓ Sincrónico          │      │ ✓ Context-based       │
            │ ✓ Simple              │      │ ✓ Testeable           │
            │ ✓ Una instancia       │      │ ✓ Reactivo            │
            │ ✓ Sin overhead        │      │ ✓ Hooks pattern       │
            └───────────────────────┘      └───────────────────────┘
                        │                               │
              ┌─────────────────────┐      ┌─────────────────────┐
              │ GET/POST request    │      │ Component.render()  │
              │ → Route handler     │      │ → Hook called       │
              │ → container.cradle  │      │ → useUseCase()      │
              │ → Get service       │      │ → useContext()      │
              │ → Execute           │      │ → Get use case      │
              │ → Response          │      │ → Execute           │
              │ → Done              │      │ → Update state      │
              └─────────────────────┘      └─────────────────────┘
```

---

## 🎓 Conclusión

**La diferencia es ARQUITECTURAL, no técnica:**

- **Backend** es **estacionario y síncrono** → `container.cradle` es apropiado
- **Frontend** es **dinámico y reactivo** → `useUseCase()` hook es apropiado

Cada patrón está optimizado para su contexto de ejecución.

No es que uno sea "mejor" que el otro. Es que cada uno es mejor para su propósito específico. 🎯
