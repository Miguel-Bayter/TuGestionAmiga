# 📚 Ejemplos Prácticos: Backend vs Frontend

Ejemplos reales lado a lado para entender mejor las diferencias.

---

## 📖 Caso 1: Obtener Lista de Libros

### ❌ Sin Patrón (Acoplado)

**Backend - Malo:**

```typescript
// ❌ Servicio acoplado a Prisma
router.get('/books', async (req, res) => {
  const books = await prisma.book.findMany({
    include: { category: true },
  })
  res.json({ ok: true, data: books })
})
```

**Frontend - Malo:**

```typescript
// ❌ Componente acoplado a HTTP
function BookList() {
  const [books, setBooks] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/books')
      .then(r => r.json())
      .then(data => setBooks(data.data))
  }, [])

  return <div>{books.map(b => <div>{b.title}</div>)}</div>
}
```

### ✅ Con Awilix (Desacoplado)

**Backend - Bueno:**

```typescript
// ✅ Usa container.cradle - patrón backend
export function createBooksRoutes(container: AwilixContainer) {
  const router = Router()
  const { bookService } = container.cradle
  // ↑ Resuelve del container, directo y sincrónico

  router.get('/', asyncHandler(async (req, res) => {
    const available = req.query.available === 'true'
    const books = await bookService.getAll(available)
    res.json({ ok: true, data: books })
  }))

  return router
}
```

**Frontend - Bueno:**

```typescript
// ✅ Usa useUseCase() hook - patrón frontend
function BookList() {
  const getBooksUseCase = useUseCase('getBooksUseCase')
  // ↑ Resuelve del container a través del hook (reactivo)

  const [books, setBooks] = useState([])

  useEffect(() => {
    getBooksUseCase.execute().then(setBooks)
  }, [])

  return <div>{books.map(b => <div>{b.title}</div>)}</div>
}
```

**Diferencias:**

- Backend: `container.cradle.bookService` → Sincrónico, global
- Frontend: `useUseCase('getBooksUseCase')` → Hook, reactivo

---

## 🔐 Caso 2: Login de Usuario

### Backend: `container.cradle`

```typescript
// src/routes/auth.routes.ts
export function createAuthRoutes(container: AwilixContainer) {
  const router = Router()
  
  // ✅ Acceso DIRECTO al container
  const { authService } = container.cradle
  
  router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body
    
    // ✅ Usa el servicio directamente
    const result = await authService.login(email, password)
    
    res.json(result)
  }))

  router.post('/register', asyncHandler(async (req, res) => {
    const { email, name, password } = req.body
    
    // ✅ El mismo authService está disponible
    const result = await authService.register(email, name, password)
    
    res.status(201).json(result)
  }))

  return router
}
```

**¿Por qué `container.cradle`?**

- Express routes se ejecutan una sola vez al startup
- El container existe durante toda la vida del servidor
- No necesita React Context o hooks
- Es sincrónico y directo

### Frontend: `useUseCase()` Hook

```typescript
// src/presentation/features/auth/pages/login.page.tsx
function LoginPage() {
  // ✅ Acceso A TRAVÉS DEL HOOK
  const loginUseCase = useUseCase('loginUseCase')
  const registerUseCase = useUseCase('registerUseCase')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // ✅ Usa el use case obtenido del hook
      const result = await loginUseCase.execute(email, password)
      
      // Guardar token
      localStorage.setItem('accessToken', result.accessToken)
      
      // Guardar usuario en Zustand store
      useAuthStore.setState({ user: result.user })
      
      // Redirigir
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setLoading(true)
    try {
      // ✅ El mismo patrón para register
      const result = await registerUseCase.execute(email, name, password)
      
      // Guardar tokens
      localStorage.setItem('accessToken', result.accessToken)
      useAuthStore.setState({ user: result.user })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Register failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <input 
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
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
      <button onClick={handleRegister} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </div>
  )
}
```

**¿Por qué `useUseCase()`?**

- React componentes se renderizan múltiples veces
- useUseCase() integra con React Context
- Permite mockear en tests
- Sigue el patrón de hooks de React (como useState, useContext)

---

## 🛒 Caso 3: Carrito de Compras

### Backend: Validación al Agregar

```typescript
// src/routes/cart.routes.ts
export function createCartRoutes(container: AwilixContainer) {
  const router = Router()
  const { cartService, bookService } = container.cradle
  // ↑ Acceso DIRECTO a ambos servicios

  // Agregar libro al carrito
  router.post('/add', asyncHandler(async (req, res) => {
    const { bookId, quantity } = req.body
    
    // Validar que el libro existe
    const book = await bookService.getById(bookId)
    
    if (!book.available) {
      return res.status(400).json({ ok: false, error: 'Book not available' })
    }
    
    // Agregar al carrito
    const cart = await cartService.addItem(bookId, quantity)
    
    res.json({ ok: true, data: cart })
  }))

  // Obtener carrito
  router.get('/', asyncHandler(async (req, res) => {
    const userId = req.headers['user-id'] as string
    const cart = await cartService.getCart(userId)
    
    res.json({ ok: true, data: cart })
  }))

  // Checkout
  router.post('/checkout', asyncHandler(async (req, res) => {
    const userId = req.headers['user-id'] as string
    const result = await cartService.checkout(userId)
    
    res.json({ ok: true, data: result })
  }))

  return router
}
```

**Patrón: `container.cradle` - Sincrónico y directo**

### Frontend: Gestión de Estado + Use Cases

```typescript
// src/presentation/features/cart/pages/cart.page.tsx
function CartPage() {
  // ✅ Obtener use cases del hook
  const getCartUseCase = useUseCase('getCartUseCase')
  const addToCartUseCase = useUseCase('addToCartUseCase')
  const removeFromCartUseCase = useUseCase('removeFromCartUseCase')
  const checkoutUseCase = useUseCase('checkoutUseCase')
  
  // Estado local
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar carrito al montar el componente
  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    setLoading(true)
    try {
      // ✅ Usa el hook para obtener carrito
      const result = await getCartUseCase.execute()
      setCart(result)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (bookId: number, quantity: number) => {
    try {
      // ✅ Usa el hook para agregar
      const result = await addToCartUseCase.execute(bookId, quantity)
      setCart(result)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleRemoveFromCart = async (itemId: number) => {
    try {
      // ✅ Usa el hook para remover
      const result = await removeFromCartUseCase.execute(itemId)
      setCart(result)
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // ✅ Usa el hook para checkout
      const result = await checkoutUseCase.execute()
      
      // Limpiar carrito
      setCart(null)
      
      // Mostrar éxito
      console.log('Checkout successful:', result)
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
        <div key={item.id}>
          <div>{item.title}</div>
          <div>Quantity: {item.quantity}</div>
          <button onClick={() => handleRemoveFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}

      <div>
        <strong>Total: ${cart.total}</strong>
      </div>

      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Checking out...' : 'Checkout'}
      </button>
    </div>
  )
}
```

**Patrón: `useUseCase()` - Reactivo con React State**

---

## 🏥 Caso 4: Préstamos de Libros

### Backend: Validar Préstamos Vencidos

```typescript
// src/routes/loan.routes.ts
export function createLoanRoutes(container: AwilixContainer) {
  const router = Router()
  const { loanService, bookService } = container.cradle
  // ↑ Acceso DIRECTO y sincrónico

  // Crear préstamo
  router.post('/create', asyncHandler(async (req, res) => {
    const { bookId, dueDate } = req.body
    const userId = req.headers['user-id'] as string

    // Validar libro existe
    const book = await bookService.getById(bookId)
    if (!book.available) {
      return res.status(400).json({ error: 'Book not available' })
    }

    // Crear préstamo
    const loan = await loanService.createLoan(userId, bookId, dueDate)
    res.json({ ok: true, data: loan })
  }))

  // Listar préstamos del usuario
  router.get('/my-loans', asyncHandler(async (req, res) => {
    const userId = req.headers['user-id'] as string
    const loans = await loanService.getUserLoans(userId)
    res.json({ ok: true, data: loans })
  }))

  // Devolver libro
  router.post('/return', asyncHandler(async (req, res) => {
    const { loanId } = req.body
    const result = await loanService.returnBook(loanId)
    res.json({ ok: true, data: result })
  }))

  return router
}
```

### Frontend: Mostrar Préstamos con Días Restantes

```typescript
// src/presentation/features/loans/pages/loans.page.tsx
function LoansPage() {
  // ✅ Obtener use cases del hook
  const getLoansUseCase = useUseCase('getLoansUseCase')
  const getOverdueLoansUseCase = useUseCase('getOverdueLoansUseCase')
  const createLoanUseCase = useUseCase('createLoanUseCase')
  const returnLoanUseCase = useUseCase('returnLoanUseCase')

  const [loans, setLoans] = useState([])
  const [overdueLoans, setOverdueLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLoans()
  }, [])

  const loadLoans = async () => {
    setLoading(true)
    try {
      // ✅ Usar los hooks para cargar datos en paralelo
      const [loansData, overdueData] = await Promise.all([
        getLoansUseCase.execute(),
        getOverdueLoansUseCase.execute(),
      ])

      setLoans(loansData)
      setOverdueLoans(overdueData)
    } catch (error) {
      console.error('Failed to load loans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (loanId: number) => {
    try {
      // ✅ Usar el hook para devolver
      await returnLoanUseCase.execute(loanId)
      
      // Recargar préstamos
      await loadLoans()
    } catch (error) {
      console.error('Failed to return book:', error)
    }
  }

  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  if (loading) return <div>Loading loans...</div>

  return (
    <div>
      <h1>My Loans</h1>

      {overdueLoans.length > 0 && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>⚠️ Overdue Loans: {overdueLoans.length}</h3>
          {overdueLoans.map(loan => (
            <div key={loan.id} style={{ padding: '10px', backgroundColor: '#ffe0e0' }}>
              <div>{loan.titulo}</div>
              <div>Due: {loan.fecha_vencimiento}</div>
              <button onClick={() => handleReturnBook(loan.id)}>
                Return Now
              </button>
            </div>
          ))}
        </div>
      )}

      <h3>Active Loans</h3>
      {loans
        .filter(l => !l.devuelto)
        .map(loan => (
          <div key={loan.id} style={{ padding: '10px', border: '1px solid #ccc' }}>
            <div>{loan.titulo}</div>
            <div>Due: {loan.fecha_vencimiento}</div>
            <div>
              Days Remaining: <strong>{calculateDaysRemaining(loan.fecha_vencimiento)}</strong>
            </div>
            <button onClick={() => handleReturnBook(loan.id)}>
              Return
            </button>
          </div>
        ))}
    </div>
  )
}
```

---

## 🎯 Tabla de Referencia Rápida

| Operación | Backend | Frontend |
|-----------|---------|----------|
| **Acceder al container** | `container.cradle.service` | `useUseCase('service')` |
| **Ciclo de vida** | Request → Response | Component → Re-renders |
| **Sincrónico?** | ✅ Sí | ❌ No (async/await) |
| **Se puede usar sin hooks?** | ✅ Sí | ❌ No |
| **Acceso global?** | ✅ Sí (una instancia) | ⚠️ Sí (pero a través de Context) |
| **Fácil de mockear?** | ✅ Sí | ✅ Sí (mockear Context) |

---

## 🚀 Resumen

**Backend → `container.cradle`**

- Express route handlers
- Acceso directo y sincrónico
- Una instancia global del container
- Compartido por todas las rutas

**Frontend → `useUseCase()` hook**

- React componentes
- Acceso a través de React Context
- Integrado con hooks de React
- Reactivo y compatible con re-renders

**Cada uno es el patrón correcto para su contexto.** 🎯
