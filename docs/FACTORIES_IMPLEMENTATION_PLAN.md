# 🏭 Plan de Implementación: Factories (Sin Services, Sin Hooks)

## 🎯 Objetivo Final

```
Backend:  Repository → Factory → Route (sin Services)
          Factory agrupa lógica y repositorios

Frontend: Factory agrupa use cases
          Acceso directo: container.cradle.factory
          Sin useUseCase() hook
```

---

## 📊 Arquitectura Nueva

### Backend (Antes)

```
Routes → Services → Repositories → Database

Problemas:
- Services son un nivel más de indirección
- Lógica dispersa entre Services y Repositories
```

### Backend (Después - CON FACTORIES)

```
Routes → Factories → Repositories → Database
                  └─ Agrupa lógica

Ventajas:
- Factories contienen toda la lógica de negocio
- Repositories solo manejan acceso a datos
- Routes usan factories directamente
- Sin Services innecesarios
```

### Frontend (Antes)

```
Components → Hook (useUseCase) → Container.cradle

Problema:
- Necesita hook adicional
```

### Frontend (Después - CON FACTORIES)

```
Components → container.cradle.factory
            └─ Acceso directo, sin hook

Ventaja:
- Acceso simple y directo
- Factories agrupan use cases relacionados
- Sin abstracción de hook
```

---

## 🔧 Estructura de Carpetas Nueva

### Backend

```
src/
├── config/
│   └── container.ts                 (Actualizado - registra factories)
├── domain/
│   ├── Repository/                  (Sin cambios - interfaces)
│   └── UseCase/                     (ELIMINADO - no lo usamos)
├── data/
│   └── Repository/                  (Sin cambios - solo datos)
├── factories/                        🔴 NUEVO
│   ├── auth.factory.ts
│   ├── book.factory.ts
│   └── index.ts
├── routes/                          (Actualizado - usan factories)
├── services/                        🔴 ELIMINADO
└── ...
```

### Frontend

```
src/
├── presentation/
│   └── config/
│       └── container.ts             (Actualizado)
├── domain/
│   ├── Repository/                  (Sin cambios)
│   └── UseCase/                     (Sin cambios)
├── factories/                        🔴 NUEVO
│   ├── auth.factory.ts
│   ├── book.factory.ts
│   ├── cart.factory.ts
│   ├── loan.factory.ts
│   └── index.ts
├── shared/
│   └── hooks/                       (ELIMINADO - use-container.hook.tsx)
└── App.tsx                          (Actualizado - sin ContainerProvider)
```

---

## 📝 Plan Detallado

### FASE 1: BACKEND - Crear Factories

#### Paso 1: Crear AuthFactory

**Archivo: `src/factories/auth.factory.ts`**

```typescript
import { IAuthRepository } from '../domain/Repository/auth.repository'

export class AuthFactory {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Registrar nuevo usuario
   */
  async register(email: string, name: string, password: string) {
    return this.authRepository.register(email, name, password)
  }

  /**
   * Login de usuario
   */
  async login(email: string, password: string) {
    return this.authRepository.login(email, password)
  }

  /**
   * Validar email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validar contraseña
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain number')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
```

#### Paso 2: Crear BookFactory

**Archivo: `src/factories/book.factory.ts`**

```typescript
import { IBookRepository } from '../domain/Repository/book.repository'
import type { BookPayload } from '@/types'

export class BookFactory {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Obtener todos los libros
   */
  async getAll(available?: boolean) {
    return this.bookRepository.getAll(available)
  }

  /**
   * Obtener libro por ID
   */
  async getById(id: number) {
    return this.bookRepository.getById(id)
  }

  /**
   * Crear nuevo libro
   */
  async create(data: BookPayload) {
    // Validar datos
    if (!data.title || !data.author) {
      throw new Error('Title and author are required')
    }

    return this.bookRepository.create(data)
  }

  /**
   * Actualizar libro
   */
  async update(id: number, data: BookPayload) {
    return this.bookRepository.update(id, data)
  }

  /**
   * Eliminar libro
   */
  async delete(id: number) {
    return this.bookRepository.delete(id)
  }

  /**
   * Obtener libros disponibles y ordenados por rating
   */
  async getTopAvailableBooks(limit: number = 10) {
    const books = await this.bookRepository.getAll(true)
    return books
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
  }

  /**
   * Buscar libros por autor
   */
  async searchByAuthor(author: string) {
    const books = await this.bookRepository.getAll()
    return books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()))
  }

  /**
   * Validar disponibilidad de stock
   */
  async validateStock(bookId: number, quantity: number): Promise<boolean> {
    const book = await this.bookRepository.getById(bookId)

    if (!book.available) {
      throw new Error(`Book "${book.title}" is not available`)
    }

    if (book.stock < quantity) {
      throw new Error(
        `Only ${book.stock} copies of "${book.title}" available. Requested: ${quantity}`
      )
    }

    return true
  }
}
```

#### Paso 3: Crear archivo index.ts de factories

**Archivo: `src/factories/index.ts`**

```typescript
export { AuthFactory } from './auth.factory'
export { BookFactory } from './book.factory'
```

---

### FASE 2: BACKEND - Actualizar Container

**Archivo: `src/config/container.ts` (ACTUALIZADO)**

```typescript
import { createContainer, InjectionMode, asClass, asValue } from 'awilix'
import type { AwilixContainer } from 'awilix'
import prisma from './database'

// Repositorios
import { AuthRepository } from '../data/Repository/auth.repository-impl'
import { BookRepository } from '../data/Repository/book.repository-impl'

// 🔴 NUEVO: Factories (reemplazan services)
import { AuthFactory } from '../factories/auth.factory'
import { BookFactory } from '../factories/book.factory'

export const container: AwilixContainer = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
})

// ============================================
// VALORES PRIMITIVOS
// ============================================
container.register({
  prisma: asValue(prisma),
})

// ============================================
// REPOSITORIOS
// ============================================
container.register({
  authRepository: asClass(AuthRepository).scoped(),
  bookRepository: asClass(BookRepository).scoped(),
})

// ============================================
// FACTORIES (REEMPLAZAN SERVICES)
// ============================================
container.register({
  authFactory: asClass(AuthFactory).singleton(),
  bookFactory: asClass(BookFactory).singleton(),
})

export default container
```

---

### FASE 3: BACKEND - Actualizar Routes

#### Route: `src/routes/auth.routes.ts` (ACTUALIZADO)

```typescript
import { Router } from 'express'
import type { AwilixContainer } from 'awilix'
import { asyncHandler } from '../middleware/error'

export function createAuthRoutes(container: AwilixContainer) {
  const router = Router()
  const { authFactory } = container.cradle  // ← Usa factory directamente

  router.post(
    '/register',
    asyncHandler(async (req, res) => {
      const { email, name, password } = req.body

      // Validaciones
      if (!authFactory.validateEmail(email)) {
        return res.status(400).json({ ok: false, error: 'Invalid email format' })
      }

      const passwordValidation = authFactory.validatePassword(password)
      if (!passwordValidation.valid) {
        return res
          .status(400)
          .json({ ok: false, error: passwordValidation.errors.join('; ') })
      }

      // Ejecutar lógica del factory
      const result = await authFactory.register(email, name, password)
      res.status(201).json(result)
    })
  )

  router.post(
    '/login',
    asyncHandler(async (req, res) => {
      const { email, password } = req.body

      const result = await authFactory.login(email, password)
      res.json(result)
    })
  )

  return router
}

export default createAuthRoutes
```

#### Route: `src/routes/books.routes.ts` (ACTUALIZADO)

```typescript
import { Router } from 'express'
import type { AwilixContainer } from 'awilix'
import { asyncHandler } from '../middleware/error'

export function createBooksRoutes(container: AwilixContainer) {
  const router = Router()
  const { bookFactory } = container.cradle  // ← Usa factory directamente

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const available = req.query.available === 'true'
      const books = await bookFactory.getAll(available)
      res.json({ ok: true, data: books })
    })
  )

  router.get(
    '/top',
    asyncHandler(async (req, res) => {
      const books = await bookFactory.getTopAvailableBooks(10)
      res.json({ ok: true, data: books })
    })
  )

  router.get(
    '/search',
    asyncHandler(async (req, res) => {
      const author = req.query.author as string

      if (!author) {
        return res.status(400).json({ ok: false, error: 'Author parameter required' })
      }

      const books = await bookFactory.searchByAuthor(author)
      res.json({ ok: true, data: books })
    })
  )

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const book = await bookFactory.getById(Number(req.params.id))
      res.json({ ok: true, data: book })
    })
  )

  return router
}

export default createBooksRoutes
```

---

### FASE 4: BACKEND - Eliminar Services

**Eliminar carpeta: `src/services/`** (completa)

---

### FASE 5: FRONTEND - Crear Factories

#### AuthFactory: `src/factories/auth.factory.ts`

```typescript
import type { IAuthRepository } from '@/domain/Repository/auth.repository'
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetProfileUseCase,
} from '@/domain/UseCase/auth'

export class AuthFactory {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private logoutUseCase: LogoutUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private authRepository: IAuthRepository
  ) {}

  /**
   * Agrupar todas las operaciones de autenticación
   */
  getAuthOperations() {
    return {
      login: (email: string, password: string) =>
        this.loginUseCase.execute({ email, password }),
      register: (email: string, name: string, password: string) =>
        this.registerUseCase.execute({ email, name, password }),
      logout: () => this.logoutUseCase.execute(),
      getProfile: () => this.getProfileUseCase.execute(),
    }
  }

  /**
   * Validar email
   */
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  /**
   * Validar contraseña
   */
  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain lowercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain number' }
    }

    return { valid: true, message: 'Password is strong' }
  }

  /**
   * Obtener token guardado
   */
  getStoredToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  /**
   * Verificar si usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  }
}
```

#### BookFactory: `src/factories/book.factory.ts`

```typescript
import type { IBookRepository } from '@/domain/Repository/book.repository'
import {
  GetBooksUseCase,
  GetBookUseCase,
  GetAvailableBooksUseCase,
  CreateBookUseCase,
  UpdateBookUseCase,
  DeleteBookUseCase,
} from '@/domain/UseCase/book'

export class BookFactory {
  constructor(
    private getBooksUseCase: GetBooksUseCase,
    private getBookUseCase: GetBookUseCase,
    private getAvailableBooksUseCase: GetAvailableBooksUseCase,
    private createBookUseCase: CreateBookUseCase,
    private updateBookUseCase: UpdateBookUseCase,
    private deleteBookUseCase: DeleteBookUseCase,
    private bookRepository: IBookRepository
  ) {}

  /**
   * Agrupar operaciones de lectura
   */
  getReadOperations() {
    return {
      getAll: () => this.getBooksUseCase.execute(),
      getById: (id: number) => this.getBookUseCase.execute(id),
      getAvailable: () => this.getAvailableBooksUseCase.execute(),
    }
  }

  /**
   * Agrupar operaciones de escritura
   */
  getWriteOperations() {
    return {
      create: (data: any) => this.createBookUseCase.execute(data),
      update: (id: number, data: any) => this.updateBookUseCase.execute(id, data),
      delete: (id: number) => this.deleteBookUseCase.execute(id),
    }
  }

  /**
   * Obtener libros ordenados por rating
   */
  async getTopRatedBooks(limit: number = 10) {
    const books = await this.getBooksUseCase.execute()
    return books
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit)
  }

  /**
   * Buscar libros por autor
   */
  async searchByAuthor(author: string) {
    const books = await this.getBooksUseCase.execute()
    return books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()))
  }

  /**
   * Buscar libros por título
   */
  async searchByTitle(title: string) {
    const books = await this.getBooksUseCase.execute()
    return books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()))
  }
}
```

#### CartFactory: `src/factories/cart.factory.ts`

```typescript
import {
  GetCartUseCase,
  AddToCartUseCase,
  RemoveFromCartUseCase,
  CheckoutUseCase,
} from '@/domain/UseCase/cart'

export class CartFactory {
  constructor(
    private getCartUseCase: GetCartUseCase,
    private addToCartUseCase: AddToCartUseCase,
    private removeFromCartUseCase: RemoveFromCartUseCase,
    private checkoutUseCase: CheckoutUseCase
  ) {}

  /**
   * Agrupar todas las operaciones del carrito
   */
  getCartOperations() {
    return {
      fetch: () => this.getCartUseCase.execute(),
      add: (bookId: number, quantity: number) =>
        this.addToCartUseCase.execute(bookId, quantity),
      remove: (itemId: number) => this.removeFromCartUseCase.execute(itemId),
      checkout: () => this.checkoutUseCase.execute(),
    }
  }

  /**
   * Calcular total del carrito
   */
  async calculateTotal() {
    const cart = await this.getCartUseCase.execute()

    const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    return {
      subtotal,
      tax,
      total,
      itemCount: cart.items.length,
    }
  }

  /**
   * Validar carrito antes de checkout
   */
  async validateBeforeCheckout(): Promise<boolean> {
    const cart = await this.getCartUseCase.execute()

    if (cart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    return true
  }
}
```

#### LoanFactory: `src/factories/loan.factory.ts`

```typescript
import {
  GetLoansUseCase,
  CreateLoanUseCase,
  ReturnLoanUseCase,
  GetOverdueLoansUseCase,
} from '@/domain/UseCase/loan'

export class LoanFactory {
  constructor(
    private getLoansUseCase: GetLoansUseCase,
    private createLoanUseCase: CreateLoanUseCase,
    private returnLoanUseCase: ReturnLoanUseCase,
    private getOverdueLoansUseCase: GetOverdueLoansUseCase
  ) {}

  /**
   * Agrupar todas las operaciones de préstamo
   */
  getLoanOperations() {
    return {
      getAll: () => this.getLoansUseCase.execute(),
      create: (bookId: number, dueDate: string) =>
        this.createLoanUseCase.execute(bookId, dueDate),
      return: (loanId: number) => this.returnLoanUseCase.execute(loanId),
      getOverdue: () => this.getOverdueLoansUseCase.execute(),
    }
  }

  /**
   * Obtener todos los datos de préstamos
   */
  async getAllLoanData() {
    const [loans, overdueLoans] = await Promise.all([
      this.getLoansUseCase.execute(),
      this.getOverdueLoansUseCase.execute(),
    ])

    return {
      activeLoans: loans.filter(l => !l.devuelto),
      completedLoans: loans.filter(l => l.devuelto),
      overdueLoans: overdueLoans,
      totalActive: loans.filter(l => !l.devuelto).length,
      totalOverdue: overdueLoans.length,
    }
  }

  /**
   * Calcular días restantes para devolución
   */
  calculateDaysRemaining(dueDate: string): number {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  /**
   * Obtener préstamos con días restantes calculados
   */
  async getLoansWithDaysRemaining() {
    const loans = await this.getLoansUseCase.execute()

    return loans.map(loan => ({
      ...loan,
      daysRemaining: this.calculateDaysRemaining(loan.fecha_vencimiento),
      isOverdue: new Date(loan.fecha_vencimiento) < new Date(),
    }))
  }
}
```

#### Index: `src/factories/index.ts`

```typescript
export { AuthFactory } from './auth.factory'
export { BookFactory } from './book.factory'
export { CartFactory } from './cart.factory'
export { LoanFactory } from './loan.factory'
```

---

### FASE 6: FRONTEND - Actualizar Container

**Archivo: `src/presentation/config/container.ts` (ACTUALIZADO)**

```typescript
import { createContainer, InjectionMode, asClass, asValue } from 'awilix'
import type { AwilixContainer } from 'awilix'

// Providers
import { axPublic, axPrivate, TokenManager } from '@/data/Provider'

// Repositorios
import { AuthRepository } from '@/data/Repository/auth.repository-impl'
import { BookRepository } from '@/data/Repository/book.repository-impl'
import { CartRepository } from '@/data/Repository/cart.repository-impl'
import { LoanRepository } from '@/data/Repository/loan.repository-impl'

// Use Cases
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetProfileUseCase,
} from '@/domain/UseCase/auth'
import {
  GetBooksUseCase,
  GetBookUseCase,
  GetAvailableBooksUseCase,
  CreateBookUseCase,
  UpdateBookUseCase,
  DeleteBookUseCase,
} from '@/domain/UseCase/book'
import {
  GetCartUseCase,
  AddToCartUseCase,
  RemoveFromCartUseCase,
  CheckoutUseCase,
} from '@/domain/UseCase/cart'
import {
  GetLoansUseCase,
  CreateLoanUseCase,
  ReturnLoanUseCase,
  GetOverdueLoansUseCase,
} from '@/domain/UseCase/loan'

// 🔴 NUEVO: Factories
import {
  AuthFactory,
  BookFactory,
  CartFactory,
  LoanFactory,
} from '@/factories'

export const container: AwilixContainer = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
})

// ============================================
// VALORES PRIMITIVOS
// ============================================
container.register({
  axPublic: asValue(axPublic),
  axPrivate: asValue(axPrivate),
  tokenManager: asValue(TokenManager),
})

// ============================================
// REPOSITORIOS
// ============================================
container.register({
  authRepository: asClass(AuthRepository).singleton(),
  bookRepository: asClass(BookRepository).singleton(),
  cartRepository: asClass(CartRepository).singleton(),
  loanRepository: asClass(LoanRepository).singleton(),
})

// ============================================
// USE CASES
// ============================================
container.register({
  // Auth
  loginUseCase: asClass(LoginUseCase).singleton(),
  registerUseCase: asClass(RegisterUseCase).singleton(),
  logoutUseCase: asClass(LogoutUseCase).singleton(),
  getProfileUseCase: asClass(GetProfileUseCase).singleton(),

  // Book
  getBooksUseCase: asClass(GetBooksUseCase).singleton(),
  getBookUseCase: asClass(GetBookUseCase).singleton(),
  getAvailableBooksUseCase: asClass(GetAvailableBooksUseCase).singleton(),
  createBookUseCase: asClass(CreateBookUseCase).singleton(),
  updateBookUseCase: asClass(UpdateBookUseCase).singleton(),
  deleteBookUseCase: asClass(DeleteBookUseCase).singleton(),

  // Cart
  getCartUseCase: asClass(GetCartUseCase).singleton(),
  addToCartUseCase: asClass(AddToCartUseCase).singleton(),
  removeFromCartUseCase: asClass(RemoveFromCartUseCase).singleton(),
  checkoutUseCase: asClass(CheckoutUseCase).singleton(),

  // Loan
  getLoansUseCase: asClass(GetLoansUseCase).singleton(),
  createLoanUseCase: asClass(CreateLoanUseCase).singleton(),
  returnLoanUseCase: asClass(ReturnLoanUseCase).singleton(),
  getOverdueLoansUseCase: asClass(GetOverdueLoansUseCase).singleton(),
})

// ============================================
// FACTORIES (NUEVAS)
// ============================================
container.register({
  authFactory: asClass(AuthFactory).singleton(),
  bookFactory: asClass(BookFactory).singleton(),
  cartFactory: asClass(CartFactory).singleton(),
  loanFactory: asClass(LoanFactory).singleton(),
})

export default container
```

---

### FASE 7: FRONTEND - Usar container.cradle Directo

#### Componente: `src/presentation/features/auth/pages/login.page.tsx` (ACTUALIZADO)

```typescript
import container from '@/presentation/config/container'

function LoginPage() {
  // ✅ Acceso directo al container.cradle (SIN HOOK)
  const { authFactory } = container.cradle

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      // Validar email
      if (!authFactory.validateEmail(email)) {
        setError('Invalid email format')
        return
      }

      // Validar contraseña
      const passwordValidation = authFactory.validatePassword(password)
      if (!passwordValidation.valid) {
        setError(passwordValidation.message)
        return
      }

      // Ejecutar login
      const authOps = authFactory.getAuthOperations()
      const result = await authOps.login(email, password)

      // Guardar tokens
      localStorage.setItem('accessToken', result.accessToken)

      // Guardar usuario
      useAuthStore.setState({ user: result.user })

      // Redirigir
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
      />

      <input
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  )
}

export default LoginPage
```

#### Componente: `src/presentation/features/books/pages/books.page.tsx` (ACTUALIZADO)

```typescript
import container from '@/presentation/config/container'

function BooksPage() {
  // ✅ Acceso directo al container.cradle (SIN HOOK)
  const { bookFactory } = container.cradle

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchAuthor, setSearchAuthor] = useState('')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const bookOps = bookFactory.getReadOperations()
      const data = await bookOps.getAll()
      setBooks(data)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchAuthor.trim()) {
      loadBooks()
      return
    }

    setLoading(true)
    try {
      const results = await bookFactory.searchByAuthor(searchAuthor)
      setBooks(results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading books...</div>

  return (
    <div>
      <h1>Books</h1>

      <div>
        <input
          value={searchAuthor}
          onChange={e => setSearchAuthor(e.target.value)}
          placeholder="Search by author..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        {books.map(book => (
          <div key={book.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Price: ${book.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BooksPage
```

#### Componente: `src/presentation/features/cart/pages/cart.page.tsx` (ACTUALIZADO)

```typescript
import container from '@/presentation/config/container'

function CartPage() {
  // ✅ Acceso directo al container.cradle (SIN HOOK)
  const { cartFactory } = container.cradle

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(null)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    setLoading(true)
    try {
      const cartOps = cartFactory.getCartOperations()
      const cartData = await cartOps.fetch()
      setCart(cartData)

      const totalData = await cartFactory.calculateTotal()
      setTotal(totalData)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      await cartFactory.validateBeforeCheckout()

      const cartOps = cartFactory.getCartOperations()
      const result = await cartOps.checkout()

      console.log('Checkout successful!', result)
      setCart(null)
      setTotal(null)
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading cart...</div>
  if (!cart || cart.items.length === 0) return <div>Cart is empty</div>

  return (
    <div>
      <h1>Shopping Cart</h1>

      {cart.items.map(item => (
        <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
          <div>{item.title}</div>
          <div>Price: ${item.price}</div>
          <div>Quantity: {item.quantity}</div>
        </div>
      ))}

      {total && (
        <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
          <div>Subtotal: ${total.subtotal.toFixed(2)}</div>
          <div>Tax: ${total.tax.toFixed(2)}</div>
          <div>Total: ${total.total.toFixed(2)}</div>
        </div>
      )}

      <button onClick={handleCheckout} disabled={loading} style={{ marginTop: '20px' }}>
        {loading ? 'Processing...' : 'Checkout'}
      </button>
    </div>
  )
}

export default CartPage
```

---

### FASE 8: FRONTEND - Eliminar Hook y Provider

**Eliminar archivo: `src/shared/hooks/use-container.hook.tsx`**

**Actualizar archivo: `src/shared/hooks/index.ts`**

```typescript
export { useAuthGuard } from './use-auth-guard.hook'
export { useToast } from './use-toast.hook'
// ❌ useUseCase hook eliminado
```

**Actualizar archivo: `src/App.tsx`**

```typescript
import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from '@/presentation/features/auth/components/require-auth'
import { RequireAdmin } from '@/presentation/features/auth/components/require-admin'
import { Layout } from '@/presentation/components/Layout'
import { Toast } from '@/presentation/components/Toast'
import { routes } from '@/data/routes'

// ❌ ContainerProvider eliminado

function App() {
  return (
    // ❌ Sin <ContainerProvider>
    <Router>
      <div className='App'>
        <Routes>
          {routes.map((route) => {
            // ... resto del código igual ...
          })}

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>

        <Toast />
      </div>
    </Router>
  )
}

export default App
```

---

## ✅ Checklist de Implementación

### Backend

- [ ] Crear `src/factories/auth.factory.ts`
- [ ] Crear `src/factories/book.factory.ts`
- [ ] Crear `src/factories/index.ts`
- [ ] Actualizar `src/config/container.ts` (registrar factories)
- [ ] Actualizar `src/routes/auth.routes.ts`
- [ ] Actualizar `src/routes/books.routes.ts`
- [ ] Eliminar `src/services/` (carpeta completa)
- [ ] Eliminar `src/domain/UseCase/` (ya no lo usamos)
- [ ] `pnpm lint` ✓
- [ ] `pnpm type-check` ✓
- [ ] `pnpm format` ✓

### Frontend

- [ ] Crear `src/factories/auth.factory.ts`
- [ ] Crear `src/factories/book.factory.ts`
- [ ] Crear `src/factories/cart.factory.ts`
- [ ] Crear `src/factories/loan.factory.ts`
- [ ] Crear `src/factories/index.ts`
- [ ] Actualizar `src/presentation/config/container.ts`
- [ ] Actualizar componentes (LoginPage, BooksPage, CartPage, etc.)
- [ ] Eliminar `src/shared/hooks/use-container.hook.tsx`
- [ ] Actualizar `src/shared/hooks/index.ts`
- [ ] Actualizar `src/App.tsx` (remover ContainerProvider)
- [ ] `pnpm lint` ✓
- [ ] `pnpm type-check` ✓
- [ ] `pnpm format` ✓

---

## 🎯 Beneficios de Esta Arquitectura

| Aspecto | Beneficio |
|---------|-----------|
| **Backend** | Repositories manejan datos, Factories manejan lógica, Routes son simples |
| **Backend** | Sin Services innecesarios (nivel de indirección eliminado) |
| **Frontend** | Acceso directo: `container.cradle.factory` (no hay hooks) |
| **Frontend** | Factories agrupan use cases relacionados |
| **Ambos** | Fácil de testear (mockear factories) |
| **Ambos** | Lógica centralizada y reutilizable |

---

## 📚 Estructura Final

```
BACKEND:
  Routes → Factories → Repositories → Database
              ↓
           Lógica de negocio

FRONTEND:
  Components → container.cradle.factory
                           ↓
                    Agrupa use cases
```

**Sin services, sin hooks. Solo lo necesario.** 🎯
