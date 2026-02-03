# GET Routes Migration Analysis
## server.js → Clean Architecture with Prisma

**Date**: Feb 3, 2025  
**Status**: Analysis & Planning Phase  
**Target**: Migrate all GET routes to new backend architecture  

---

## CURRENT STATE

### Technology Stack (Old)
- **File**: `apps/backend/server.js`
- **Driver**: `mysql2/promise` (raw MySQL queries)
- **Auth**: Simple header-based (`x-user-id` header)
- **Pattern**: Monolithic (all routes in single file)
- **Language**: JavaScript (ESM)

### Technology Stack (New)
- **Architecture**: Clean Architecture (Domain → Application → Infrastructure)
- **ORM**: Prisma 6 (agnóstic de BD, currently MySQL)
- **Auth**: JWT + Bearer tokens (to be implemented)
- **Pattern**: Module-based (one module per feature)
- **Language**: TypeScript + Express
- **DI**: Awilix (IoC container)

---

## GET ROUTES IDENTIFIED IN server.js

### Route 1: `GET /api/health`
**Line**: 894-896  
**Current Implementation**:
```javascript
app.get('/api/health', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT 1 AS ok');
  res.json({ ok: true, db: rows?.[0]?.ok === 1 });
}));
```
**Purpose**: Health check - verify server and database connection  
**Response Format**: `{ ok: boolean, db: boolean }`  
**Auth Required**: NO  
**Prisma Equivalent**: Already implemented in `createApiRoutes` → responds with `{ ok: true, message: "..." }`

---

### Route 2: `GET /api/libros`
**Line**: 1007-1029  
**Current Implementation**:
```javascript
app.get('/api/libros', asyncHandler(async (req, res) => {
  const disponible = typeof req.query.disponible === 'string' ? req.query.disponible : undefined;
  const onlyDisponible = disponible === '1' || disponible === 'true';
  const where = onlyDisponible ? 'WHERE l.disponibilidad = 1' : '';
  // ... SELECT with dynamic column checking (stock, valor, stock_compra, stock_renta)
  res.json(rows);
}));
```
**Purpose**: List all books (or only available)  
**Query Parameters**:
- `disponible=true|1` → Only available books (where `disponibilidad = 1`)

**Response Format**: Array of book objects
```javascript
{
  id_libro, titulo, autor, descripcion, disponibilidad,
  stock?, valor?, stock_compra?, stock_renta?,
  id_categoria, nombre_categoria
}
```
**Auth Required**: NO  
**Status**: ✅ Already implemented in new arch (`GET /api/books`)

---

### Route 3: `GET /api/libros/:id`
**Line**: 1432-1467  
**Current Implementation**:
```javascript
app.get('/api/libros/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });
  // ... SELECT with LEFT JOIN category
  res.json(rows[0]);
}));
```
**Purpose**: Get single book by ID  
**Path Parameters**: `id` (book ID)  
**Response Format**: Single book object  
**Auth Required**: NO  
**Status**: ✅ Already implemented in new arch (`GET /api/books/:id`)

---

### Route 4: `GET /api/compras`
**Line**: 544-568  
**Current Implementation**:
```javascript
app.get('/api/compras', asyncHandler(async (req, res) => {
  await requireAuth(req, res, () => {});
  if (res.headersSent) return;
  
  const uid = Number(req.query.id_usuario);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'id_usuario es obligatorio' });
  
  if (!assertSelfOrAdmin(req, res, uid)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  // ... SELECT FROM compra LEFT JOIN libro
  res.json(rows);
}));
```
**Purpose**: List purchases by user  
**Query Parameters**:
- `id_usuario` (required) → User ID

**Response Format**: Array of purchase objects
```javascript
{
  id_compra, fecha_compra, precio,
  id_libro, titulo, autor
}
```
**Auth Required**: YES (user can only see own purchases, or admin)  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION**

---

### Route 5: `GET /api/carrito`
**Line**: 574-602  
**Current Implementation**:
```javascript
app.get('/api/carrito', asyncHandler(async (req, res) => {
  await requireAuth(req, res, () => {});
  if (res.headersSent) return;
  
  const uid = Number(req.query.id_usuario);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'id_usuario es obligatorio' });
  
  if (!assertSelfOrAdmin(req, res, uid)) {
    return res.status(403).json({ error: 'No autorizado' });
  }
  
  // ... SELECT FROM carrito_item LEFT JOIN libro
  res.json(rows);
}));
```
**Purpose**: Get cart items for user  
**Query Parameters**:
- `id_usuario` (required) → User ID

**Response Format**: Array of cart items
```javascript
{
  id_libro, cantidad,
  titulo, autor, valor?, stock_compra?
}
```
**Auth Required**: YES (user can only see own cart, or admin)  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION**

---

### Route 6: `GET /api/covers`
**Line**: 906-931  
**Current Implementation**:
```javascript
app.get('/api/covers', asyncHandler(async (req, res) => {
  const candidates = [
    path.join(REPO_ROOT, 'frontend', 'public', 'src', 'assets', 'images'),
    path.join(PROJECT_ROOT, 'public', 'src', 'assets', 'images'),
    path.join(PROJECT_ROOT, 'src', 'assets', 'images')
  ];
  
  const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  
  for (const dir of candidates) {
    try {
      const files = await fs.readdir(dir);
      const out = (files || [])
        .filter((f) => allowed.has(path.extname(f).toLowerCase()))
        .sort();
      return res.json(out);
    } catch {
      // Try next candidate
    }
  }
  
  res.json([]);
}));
```
**Purpose**: List available book cover images  
**Response Format**: Array of filenames `["book1.jpg", "book2.png", ...]`  
**Auth Required**: NO  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION** (utility/shared)

---

### Route 7: `GET /api/admin/categorias`
**Line**: 1036-1039  
**Current Implementation**:
```javascript
app.get('/api/admin/categorias', requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id_categoria, nombre_categoria FROM categoria ORDER BY nombre_categoria ASC');
  res.json(rows);
}));
```
**Purpose**: List all categories (admin only)  
**Response Format**: Array of categories
```javascript
{
  id_categoria, nombre_categoria
}
```
**Auth Required**: YES (ADMIN only)  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION**

---

### Route 8: `GET /api/admin/libros`
**Line**: 1043-1058  
**Current Implementation**:
```javascript
app.get('/api/admin/libros', requireAdmin, asyncHandler(async (req, res) => {
  // Same as GET /api/libros but WITHOUT disponibilidad filter
  // Shows all books for admin (even unavailable ones)
  res.json(rows);
}));
```
**Purpose**: Admin: List ALL books (including unavailable)  
**Response Format**: Same as `GET /api/libros`  
**Auth Required**: YES (ADMIN only)  
**Status**: ⚠️ Partially implemented (books endpoint lacks admin filter)

---

### Route 9: `GET /api/admin/usuarios`
**Line**: 1241-1249  
**Current Implementation**:
```javascript
app.get('/api/admin/usuarios', requireAdmin, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT u.id_usuario, u.nombre, u.correo, u.id_rol, r.nombre_rol
    FROM usuario u
    LEFT JOIN rol r ON r.id_rol = u.id_rol
    ORDER BY u.id_usuario DESC
  `);
  res.json(rows);
}));
```
**Purpose**: Admin: List all users with their roles  
**Response Format**: Array of user objects
```javascript
{
  id_usuario, nombre, correo, id_rol, nombre_rol
}
```
**Auth Required**: YES (ADMIN only)  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION**

---

### Route 10: `GET /api/admin/prestamos`
**Line**: 1404-1426  
**Current Implementation**:
```javascript
app.get('/api/admin/prestamos', requireAdmin, asyncHandler(async (req, res) => {
  const qRaw = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const hasQ = qRaw.length > 0;
  const where = hasQ ? 'WHERE (LOWER(u.nombre) LIKE :q OR LOWER(u.correo) LIKE :q)' : '';
  
  // ... SELECT FROM prestamo with search
  res.json(rows);
}));
```
**Purpose**: Admin: List all loans (with optional search by user name/email)  
**Query Parameters**:
- `q` (optional) → Search by username or email

**Response Format**: Array of loan objects
```javascript
{
  id_prestamo, fecha_prestamo, fecha_devolucion, fecha_devolucion_real?,
  estado, extensiones,
  id_usuario, nombre, correo,
  id_libro, titulo, autor
}
```
**Auth Required**: YES (ADMIN only)  
**Status**: ❌ NOT implemented yet → **NEEDS CREATION**

---

## SCHEMA MAPPING

### Prisma Models ↔ Old MySQL Tables

| Old Table | New Model | Notes |
|-----------|-----------|-------|
| `usuario` | `User` | Includes roles as relation |
| `libro` | `Book` | consolidates stock columns |
| `compra` | `Purchase` | - |
| `prestamo` | `Loan` | called "prestamo" → renamed "Loan" |
| `carrito_item` | `CartItem` | - |
| `categoria` | `Category` | - |
| `rol` | `Role` | - |

### Important Field Name Changes

| Context | Old Name | New Name | Type | Prisma Map |
|---------|----------|----------|------|-----------|
| Book | `id_libro` | `id` | INT | - |
| Book | `titulo` | `title` | VARCHAR | - |
| Book | `autor` | `author` | VARCHAR | - |
| Book | `descripcion` | `description` | TEXT | - |
| Book | `disponibilidad` | `available` | BOOLEAN | - |
| Book | `stock_compra` | `purchaseStock` | INT | `purchase_stock` |
| Book | `stock_renta` | `rentalStock` | INT | `rental_stock` |
| Book | `valor` | `price` | DECIMAL | - |
| Book | `id_categoria` | `categoryId` | INT FK | `category_id` |
| User | `id_usuario` | `id` | INT | - |
| User | `correo` | `email` | VARCHAR | - |
| User | `contraseña` / `password` | `password` | VARCHAR | - |
| User | `id_rol` | `roleId` | INT FK | `role_id` |
| Purchase | `id_compra` | `id` | INT | - |
| Purchase | `fecha_compra` | `date` | DATETIME | - |
| Purchase | `id_usuario` | `userId` | INT FK | `user_id` |
| Purchase | `id_libro` | `bookId` | INT FK | `book_id` |
| Loan | `id_prestamo` | `id` | INT | - |
| Loan | `fecha_prestamo` | `loanDate` | DATETIME | `loan_date` |
| Loan | `fecha_devolucion` | `dueDate` | DATETIME | `due_date` |
| Loan | `fecha_devolucion_real` | `returnedDate` | DATETIME | `returned_date` |
| Loan | `estado` | `status` | VARCHAR | - |
| Loan | `extensiones` | `extensions` | INT | - |
| CartItem | `id_usuario` | `userId` | INT FK | `user_id` |
| CartItem | `id_libro` | `bookId` | INT FK | `book_id` |
| CartItem | `cantidad` | `quantity` | INT | - |
| Category | `id_categoria` | `id` | INT | - |
| Category | `nombre_categoria` | `name` | VARCHAR | - |
| Role | `id_rol` | `id` | INT | - |
| Role | `nombre_rol` | `name` | VARCHAR | - |

---

## MIGRATION PLAN

### Phase 1: CREATE MISSING MODULES (8 new routes)
✅ Already exists:
- `books` module (GET /api/books, GET /api/books/:id)

❌ Need to create:
1. **Category Module** → GET /api/admin/categories
2. **Purchase Module** → GET /api/purchases  
3. **Cart Module** → GET /api/cart
4. **Loan Module** → GET /api/admin/loans (search included)
5. **User Module** → GET /api/admin/users
6. **Covers Utility** → GET /api/covers (static files)

### Phase 2: ARCHITECTURE FOR EACH MODULE

Each module follows this structure:
```
src/modules/{module-name}/
├── domain/
│   ├── entity/          # Type definitions
│   └── interface/       # Repository interface
├── application/
│   ├── service/         # Business logic coordinator
│   └── use-case/        # Individual use cases
└── infrastructure/
    ├── http/
    │   └── routes.ts    # Express routes
    └── repository/      # Prisma implementation
```

### Phase 3: RESPONSE FORMAT STANDARDIZATION

**Old format** (server.js):
```javascript
res.json(rows)  // Direct array or object
```

**New format** (clean architecture):
```javascript
res.json({ ok: true, data: result })  // Always wrapped
```

### Phase 4: AUTHENTICATION MIGRATION

**Old system**:
```javascript
const getAuthUserId = (req) => req.headers['x-user-id']  // Simple header
```

**New system** (to implement):
```
Authorization: Bearer {JWT_TOKEN}  // JWT in header
Decoded by middleware → req.user = { id, roleId, role }
```

---

## DECISIONS CONFIRMED ✅

1. **Response Wrapping**: ✅ Wrap all responses
   - Format: `{ ok: true, data: X }`
   - Consistent with error responses: `{ ok: false, error: "message" }`

2. **Pagination**: ✅ Return all results
   - No pagination implementation (matches old system)
   - Keep responses simple and straightforward

3. **Search/Filters**: ✅ Server-side search
   - `/api/admin/loans?q=...` uses Prisma ILIKE for search
   - Filter on user name or email (admin feature)

4. **Auth Method**: ✅ Switch to JWT immediately
   - Remove `x-user-id` header auth
   - Implement Bearer token in Authorization header
   - Decode JWT → `req.user = { id, roleId, role }`
   - Update auth middleware for new system

5. **Execution Order**: ✅ Categories → Users → Purchases → Loans (Cart deferred)
   1. **Category Module** (no dependencies)
   2. **User Module** (no dependencies)
   3. **Purchase Module** (depends on Book, User)
   4. **Loan Module** (depends on Book, User)
   5. **Covers Utility** (pure filesystem utility)
   6. **Cart Module** (depends on Book, User - lower priority)
   7. **Admin Books Filter** (add to existing Book module)

---

## TECHNICAL REQUIREMENTS

### Repositories to Create
- CategoryRepository (with IBookRepository interface)
- PurchaseRepository (with IPurchaseRepository interface)
- CartRepository (with ICartRepository interface)
- LoanRepository (with ILoanRepository interface)
- UserRepository (with IUserRepository interface)

### Use Cases to Create
- GetCategories → GET /api/admin/categories
- GetPurchasesByUser → GET /api/purchases?userId=...
- GetCartByUser → GET /api/cart?userId=...
- GetLoansByUser / GetAllLoans → GET /api/loans, GET /api/admin/loans
- GetUsers → GET /api/admin/users
- GetCovers → GET /api/covers

### Services to Create
- CategoryService
- PurchaseService
- CartService
- LoanService
- UserService

### Middleware to Update
- Authorization (if switching to JWT)
- Role-based access control

---

## ACCEPTANCE CRITERIA

For each route migration:

✅ **Functionality**:
- [ ] Route returns same data as old endpoint
- [ ] Query parameters work identically
- [ ] Auth logic preserved (self/admin checks)

✅ **Code Quality**:
- [ ] Uses Prisma for all database access (no raw SQL)
- [ ] Follows Clean Architecture pattern
- [ ] Full TypeScript typing (no `any` types)
- [ ] Error handling with ApiError class
- [ ] All tests passing

✅ **API Contract**:
- [ ] Response structure matches expected format
- [ ] HTTP status codes correct (200, 400, 401, 403, 404, etc.)
- [ ] All required fields present

✅ **Performance**:
- [ ] No N+1 queries (use Prisma `include`)
- [ ] Pagination implemented if needed

---

## NEXT STEPS

1. **Confirm decisions** on questions above
2. **Create detailed task list** (per-module implementation)
3. **Set up DI container** registrations
4. **Implement modules** in priority order
5. **Run integration tests** to verify compatibility
6. **Migrate frontend** to use new endpoints

---

## SUMMARY TABLE

| GET Route | Status | Module | Priority | Dependencies |
|-----------|--------|--------|----------|--------------|
| `/api/health` | ✅ Done | shared | - | none |
| `/api/books` | ✅ Done | book | - | none |
| `/api/books/:id` | ✅ Done | book | - | none |
| `/api/purchases` | ❌ TODO | purchase | HIGH | user, book |
| `/api/cart` | ❌ TODO | cart | HIGH | user, book |
| `/api/covers` | ❌ TODO | covers | MEDIUM | filesystem |
| `/api/admin/categories` | ❌ TODO | category | HIGH | none |
| `/api/admin/books` | ⚠️ PARTIAL | book | MEDIUM | admin filter |
| `/api/admin/users` | ❌ TODO | user | HIGH | none |
| `/api/admin/loans` | ❌ TODO | loan | HIGH | user, book |

