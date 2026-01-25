# Frontend Structure Analysis for DI Refactoring

**Date**: 2025-01-25  
**Project**: Tu Gestion Amiga - Library Management System  
**Frontend Path**: `apps/frontend/src`

---

## 1. MODULE STRUCTURE

The frontend is organized into **7 modules** following Clean Architecture:

```
src/
├── modules/
│   ├── auth/              # Authentication & User Management
│   ├── books/             # Book Catalog Management
│   ├── cart/              # Shopping Cart
│   ├── loans/             # Book Loans Management
│   ├── user/              # User Profile (INCOMPLETE)
│   ├── dashboard/         # Admin Dashboard (UI ONLY)
│   └── shared/            # Cross-cutting Concerns
└── shared/                # Global Shared Resources
```

Each module (except dashboard) follows this structure:
```
module/
├── application/           # Use Cases
│   └── use-case/
├── domain/                # Business Logic & Interfaces
│   ├── entity/
│   └── repository/
├── infrastructure/        # Implementation & UI
│   ├── repository/        # Repository Implementations
│   ├── schema/            # Zod Validation Schemas
│   └── ui/
│       ├── components/
│       └── pages/
└── index.ts              # Barrel Export
```

---

## 2. USE CASES FOUND

### 2.1 AUTH Module (`modules/auth/application/use-case/`)

| Use Case | File | Dependencies | Status |
|----------|------|--------------|--------|
| **LoginUseCase** | `login.usecase.ts` | `IAuthRepository` | ✅ Complete |
| **RegisterUseCase** | `register.usecase.ts` | `IAuthRepository` | ✅ Complete |
| **LogoutUseCase** | `logout.usecase.ts` | `IAuthRepository` | ✅ Complete |
| **GetProfileUseCase** | `get-profile.usecase.ts` | `IAuthRepository` | ✅ Complete |

**Missing Use Cases:**
- ❌ ResetPasswordUseCase
- ❌ ChangePasswordUseCase
- ❌ RefreshTokenUseCase

### 2.2 BOOKS Module (`modules/books/application/use-case/`)

| Use Case | File | Dependencies | Status |
|----------|------|--------------|--------|
| **GetBooksUseCase** | `get-books.usecase.ts` | `IBookRepository` | ✅ Complete |
| **GetBookUseCase** | `get-book.usecase.ts` | `IBookRepository` | ✅ Complete |
| **GetAvailableBooksUseCase** | `get-available-books.usecase.ts` | `IBookRepository` | ✅ Complete |
| **CreateBookUseCase** | `create-book.usecase.ts` | `IBookRepository` | ✅ Complete |
| **UpdateBookUseCase** | `update-book.usecase.ts` | `IBookRepository` | ✅ Complete |
| **DeleteBookUseCase** | `delete-book.usecase.ts` | `IBookRepository` | ✅ Complete |

**Missing Use Cases:**
- ❌ SearchBooksUseCase
- ❌ GetBooksByCategoryUseCase (method exists in repo but no use case)

### 2.3 CART Module (`modules/cart/application/use-case/`)

| Use Case | File | Dependencies | Status |
|----------|------|--------------|--------|
| **GetCartUseCase** | `get-cart.usecase.ts` | `ICartRepository` | ✅ Complete |
| **AddToCartUseCase** | `add-to-cart.usecase.ts` | `ICartRepository` | ✅ Complete |
| **RemoveFromCartUseCase** | `remove-from-cart.usecase.ts` | `ICartRepository` | ✅ Complete |
| **CheckoutUseCase** | `checkout.usecase.ts` | `ICartRepository` | ✅ Complete |

**Missing Use Cases:**
- ❌ UpdateCartItemUseCase
- ❌ ClearCartUseCase

### 2.4 LOANS Module (`modules/loans/application/use-case/`)

| Use Case | File | Dependencies | Status |
|----------|------|--------------|--------|
| **GetLoansUseCase** | `get-loans.usecase.ts` | `ILoanRepository` | ✅ Complete |
| **CreateLoanUseCase** | `create-loan.usecase.ts` | `ILoanRepository` | ✅ Complete |
| **ReturnLoanUseCase** | `return-loan.usecase.ts` | `ILoanRepository` | ✅ Complete |
| **GetOverdueLoansUseCase** | `get-overdue-loans.usecase.ts` | `ILoanRepository` | ✅ Complete |

**Missing Use Cases:**
- ❌ GetActiveLoanUseCase (method exists in repo but no use case)
- ❌ RenewLoanUseCase

### 2.5 USER Module (`modules/user/application/use-case/`)

| Use Case | File | Dependencies | Status |
|----------|------|--------------|--------|
| **GetUserProfileUseCase** | `get-user-profile.usecase.ts` | `IAuthRepository` | ⚠️ Uses Auth Repo |
| **UpdateProfileUseCase** | `update-profile.usecase.ts` | `IAuthRepository` | ⚠️ Uses Auth Repo |

**Issues:**
- ⚠️ User module uses `IAuthRepository` instead of having its own `IUserRepository`
- ❌ No dedicated user repository interface/implementation
- ❌ User module is incomplete (no domain/repository layer)

---

## 3. REPOSITORIES FOUND

### 3.1 Repository Interfaces (Domain Layer)

| Module | Interface | File | Methods |
|--------|-----------|------|---------|
| **auth** | `IAuthRepository` | `modules/auth/domain/repository/auth.repository.ts` | login, register, getProfile, updateProfile, logout |
| **books** | `IBookRepository` | `modules/books/domain/repository/book.repository.ts` | getBooks, getBook, createBook, updateBook, deleteBook, getAvailableBooks, getBooksByCategory |
| **cart** | `ICartRepository` | `modules/cart/domain/repository/cart.repository.ts` | getCart, getCartItems, addItem, removeItem, updateItem, clearCart, checkout |
| **loans** | `ILoanRepository` | `modules/loans/domain/repository/loan.repository.ts` | getLoans, getLoan, createLoan, returnLoan, getActiveLoans, getOverdueLoans |
| **user** | ❌ MISSING | N/A | N/A |

### 3.2 Repository Implementations (Infrastructure Layer)

| Module | Implementation | File | Singleton |
|--------|-----------------|------|-----------|
| **auth** | `AuthRepository` | `modules/auth/infrastructure/repository/auth.repository-impl.ts` | `authRepository` |
| **books** | `BookRepository` | `modules/books/infrastructure/repository/book.repository-impl.ts` | `bookRepository` |
| **cart** | `CartRepository` | `modules/cart/infrastructure/repository/cart.repository-impl.ts` | `cartRepository` |
| **loans** | `LoanRepository` | `modules/loans/infrastructure/repository/loan.repository-impl.ts` | `loanRepository` |
| **user** | ❌ MISSING | N/A | N/A |

### 3.3 Repository Dependency Injection Pattern

**Current Pattern (Manual DI in Stores):**

```typescript
// In use-auth.store.ts
const loginUseCase = new LoginUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
const logoutUseCase = new LogoutUseCase(authRepository)
const getProfileUseCase = new GetProfileUseCase(authRepository)

export const useAuthStore = create<AuthState>((set) => ({
  // ... store implementation
}))
```

**Issues:**
- ❌ Manual instantiation in each store
- ❌ No centralized DI container
- ❌ Hard to test (can't easily mock repositories)
- ❌ Tight coupling between stores and repositories
- ❌ No dependency inversion

---

## 4. ZUSTAND STORES FOUND

### 4.1 Store Locations & Exports

All stores are in `shared/infrastructure/stores/`:

| Store | File | State Properties | Actions |
|-------|------|------------------|---------|
| **useAuthStore** | `use-auth.store.ts` | user, isAuthenticated, isLoading, error | login, register, logout, checkAuth, getProfile, clearError |
| **useBookStore** | `use-book.store.ts` | books, selectedBook, isLoading, error, pagination | getBooks, getBook, getAvailableBooks, clearError |
| **useCartStore** | `use-cart.store.ts` | cart, isLoading, error | getCart, addToCart, removeFromCart, checkout, clearError |
| **useLoanStore** | `use-loan.store.ts` | loans, overdueLoans, isLoading, error, pagination | getLoans, createLoan, returnLoan, getOverdueLoans, clearError |
| **useUIStore** | `use-ui.store.ts` | isSidebarOpen, isSearchOpen, isMobileMenuOpen, activeModal, theme | toggleSidebar, closeSidebar, openSidebar, toggleSearch, closeSearch, openSearch, toggleMobileMenu, closeMobileMenu, openMobileMenu, openModal, closeModal, setTheme |
| **useToastStore** | `use-toast.store.ts` | toasts | showToast, success, error, warning, info, removeToast, clearAllToasts |

### 4.2 Store Initialization Pattern

**Current Pattern:**

```typescript
// In each store file
const loginUseCase = new LoginUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
// ... more use cases

export const useAuthStore = create<AuthState>((set) => ({
  // ... state and actions
}))
```

**Issues:**
- ❌ Use cases instantiated at module load time
- ❌ No lazy initialization
- ❌ No way to swap implementations for testing
- ❌ Stores tightly coupled to specific repository implementations

### 4.3 Store Usage Pattern

Stores are used directly in components:

```typescript
// In components
const { user, login, isLoading } = useAuthStore()
const { books, getBooks } = useBookStore()
```

---

## 5. AXIOS/API CLIENT USAGE

### 5.1 Axios Instances

**Location:** `shared/infrastructure/provider/`

| Instance | File | Purpose | Auth |
|----------|------|---------|------|
| **axPublic** | `axios-public.provider.ts` | Public endpoints (login, register, book list) | ❌ No |
| **axPrivate** | `axios-private.provider.ts` | Protected endpoints (cart, loans, profile) | ✅ Bearer Token |

### 5.2 Axios Configuration

**axPublic:**
- Base URL: `API_BASE_URL` from config
- Headers: `Content-Type: application/json`
- No authentication
- No interceptors

**axPrivate:**
- Base URL: `API_BASE_URL` from config
- Headers: `Content-Type: application/json`
- **Request Interceptor:** Adds `Authorization: Bearer {token}` header
- **Response Interceptor:** 
  - Handles 401 Unauthorized
  - Attempts token refresh via `TokenManager.refreshAccessToken()`
  - Retries original request with new token
  - Redirects to `/login` on refresh failure

### 5.3 Token Management

**Location:** `shared/infrastructure/provider/token-manager.provider.ts`

Methods:
- `getAccessToken()` - Retrieves from localStorage
- `setAccessToken(token)` - Stores in localStorage
- `getRefreshToken()` - Retrieves from localStorage
- `setRefreshToken(token)` - Stores in localStorage
- `clearTokens()` - Removes both tokens
- `refreshAccessToken()` - Calls backend refresh endpoint

### 5.4 API Endpoints

**Location:** `shared/application/config/constants.ts`

Endpoints are centralized as constants:
- `API_ENDPOINTS.LOGIN`
- `API_ENDPOINTS.REGISTER`
- `API_ENDPOINTS.USER_PROFILE`
- `API_ENDPOINTS.USER_UPDATE`
- `API_ENDPOINTS.LOGOUT`
- `API_ENDPOINTS.BOOKS`
- `API_ENDPOINTS.BOOK_BY_ID(id)`
- `API_ENDPOINTS.CART`
- `API_ENDPOINTS.CART_ITEM(id)`
- `API_ENDPOINTS.CART_CHECKOUT`
- `API_ENDPOINTS.LOANS`
- `API_ENDPOINTS.LOAN_BY_ID(id)`
- `API_ENDPOINTS.LOAN_RETURN(id)`

### 5.5 Direct Axios Usage in Repositories

All repositories use `axPublic` or `axPrivate` directly:

```typescript
// In auth.repository-impl.ts
async login(request: LoginRequest): Promise<LoginResponse> {
  const response = await axPublic.post(API_ENDPOINTS.LOGIN, request)
  const validated = loginResponseSchema.parse(response.data)
  return validated
}

// In book.repository-impl.ts
async getBooks(page?: number, pageSize?: number): Promise<Book[] | PaginatedResponse<Book>> {
  const response = await axPublic.get(API_ENDPOINTS.BOOKS, {
    params: Object.fromEntries(params),
  })
  return booksArraySchema.parse(response.data)
}
```

---

## 6. VALIDATION SCHEMAS

**Location:** `modules/{module}/infrastructure/schema/`

Each module has Zod schemas for validation:

| Module | Schemas | File |
|--------|---------|------|
| **auth** | loginResponseSchema, registerResponseSchema | `auth.schema.ts` |
| **books** | bookSchema, booksArraySchema | `book.schema.ts` |
| **cart** | cartItemSchema, cartItemsArraySchema | `cart.schema.ts` |
| **loans** | loanSchema, loansArraySchema | `loan.schema.ts` |
| **user** | userSchema | `user.schema.ts` |

---

## 7. ENTITY DEFINITIONS

**Location:** `modules/{module}/domain/entity/`

| Module | Entity | File |
|--------|--------|------|
| **auth** | User | `user.entity.ts` |
| **books** | Book | `book.entity.ts` |
| **cart** | Cart, CartItem | `cart.entity.ts` |
| **loans** | Loan | `loan.entity.ts` |

---

## 8. UI COMPONENTS & PAGES

### 8.1 Auth Module UI

**Pages:**
- `modules/auth/infrastructure/ui/pages/login.page.tsx`
- `modules/auth/infrastructure/ui/pages/register.page.tsx`

**Components:**
- `modules/auth/infrastructure/ui/components/require-auth.tsx` - Route guard
- `modules/auth/infrastructure/ui/components/require-admin.tsx` - Admin route guard

### 8.2 Books Module UI

**Components:**
- `modules/books/infrastructure/ui/components/book-card.tsx`
- `modules/books/infrastructure/ui/components/book-details-modal.tsx`

### 8.3 Cart Module UI

**Pages:**
- `modules/cart/infrastructure/ui/pages/cart.page.tsx`

### 8.4 Loans Module UI

**Pages:**
- `modules/loans/infrastructure/ui/pages/loans.page.tsx`

### 8.5 Dashboard Module UI

**Pages:**
- `modules/dashboard/infrastructure/ui/pages/dashboard.page.tsx`
- `modules/dashboard/infrastructure/ui/pages/admin.page.tsx`
- `modules/dashboard/infrastructure/ui/pages/help.page.tsx`

**Note:** Dashboard module has NO application or domain layer (UI only)

### 8.6 User Module UI

**Pages:**
- `modules/user/infrastructure/ui/pages/account.page.tsx`

### 8.7 Shared UI Components

**Location:** `shared/infrastructure/ui/react/components/`

- `Layout.tsx` - Main layout wrapper
- `Navbar.tsx` - Navigation bar
- `Sidebar.tsx` - Sidebar navigation
- `Toast.tsx` - Toast notification display

---

## 9. CURRENT DEPENDENCY INJECTION ISSUES

### 9.1 Problem: Manual DI in Stores

**Current Code Pattern:**
```typescript
// In use-auth.store.ts
const loginUseCase = new LoginUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
const logoutUseCase = new LogoutUseCase(authRepository)
const getProfileUseCase = new GetProfileUseCase(authRepository)

export const useAuthStore = create<AuthState>((set) => ({
  login: async (credentials) => {
    const response = await loginUseCase.execute(credentials)
    // ...
  },
  // ...
}))
```

**Issues:**
1. ❌ **No DI Container** - No centralized place to manage dependencies
2. ❌ **Hard to Test** - Can't easily mock repositories for unit tests
3. ❌ **Tight Coupling** - Stores directly depend on specific repository implementations
4. ❌ **No Lazy Loading** - All use cases instantiated at module load
5. ❌ **Duplicate Code** - Same pattern repeated in every store
6. ❌ **No Dependency Inversion** - Stores depend on concrete implementations, not abstractions

### 9.2 Problem: Missing User Repository

**Current State:**
- User module uses `IAuthRepository` for profile operations
- No dedicated `IUserRepository` interface
- User module incomplete (no domain/repository layer)

**Impact:**
- User operations mixed with auth operations
- Can't separate concerns
- Hard to extend user functionality

### 9.3 Problem: Incomplete Dashboard Module

**Current State:**
- Dashboard module has ONLY UI pages
- No application layer (use cases)
- No domain layer (entities, repositories)

**Impact:**
- Can't reuse dashboard logic
- Hard to test dashboard functionality
- Tight coupling to UI

---

## 10. MISSING PIECES FOR DI REFACTORING

### 10.1 Missing Infrastructure

- ❌ **DI Container** - No centralized dependency injection system
- ❌ **Service Locator** - No way to resolve dependencies at runtime
- ❌ **Factory Pattern** - No factories for creating use cases
- ❌ **Dependency Registry** - No place to register dependencies

### 10.2 Missing Modules/Repositories

- ❌ **IUserRepository** - User module should have its own repository
- ❌ **UserRepository** - Implementation of user repository
- ❌ **Dashboard Use Cases** - Dashboard module needs application layer
- ❌ **Dashboard Repository** - Dashboard module needs domain layer

### 10.3 Missing Use Cases

**Auth Module:**
- ❌ ResetPasswordUseCase
- ❌ ChangePasswordUseCase
- ❌ RefreshTokenUseCase

**Books Module:**
- ❌ SearchBooksUseCase
- ❌ GetBooksByCategoryUseCase (method exists, needs use case)

**Cart Module:**
- ❌ UpdateCartItemUseCase
- ❌ ClearCartUseCase

**Loans Module:**
- ❌ GetActiveLoanUseCase (method exists, needs use case)
- ❌ RenewLoanUseCase

### 10.4 Missing Testing Infrastructure

- ❌ **Mock Repositories** - No mock implementations for testing
- ❌ **Test Utilities** - No helpers for creating test instances
- ❌ **Fixture Factories** - No factories for test data

---

## 11. IMPORT PATH ALIASES

**Configured in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage in Code:**
- `@/domain/Repository/auth.repository` → `src/modules/auth/domain/repository/auth.repository.ts`
- `@/data/Repository/auth.repository-impl` → `src/modules/auth/infrastructure/repository/auth.repository-impl.ts`
- `@/domain/UseCase/auth` → `src/modules/auth/application/use-case/index.ts`
- `@/shared/infrastructure/provider` → `src/shared/infrastructure/provider/index.ts`

**Note:** Paths use inconsistent naming:
- `@/domain/` for domain layer
- `@/data/` for infrastructure layer
- `@/domain/UseCase/` for use cases
- `@/domain/Entity/` for entities
- `@/domain/Repository/` for repository interfaces

---

## 12. SUMMARY TABLE

| Aspect | Status | Notes |
|--------|--------|-------|
| **Module Structure** | ✅ Complete | 7 modules, clean architecture |
| **Use Cases** | ⚠️ Partial | 20 use cases, 9 missing |
| **Repositories** | ⚠️ Partial | 4 complete, 1 missing (user) |
| **Zustand Stores** | ✅ Complete | 6 stores, all functional |
| **Axios Setup** | ✅ Complete | Public/Private instances, token refresh |
| **Validation** | ✅ Complete | Zod schemas for all modules |
| **DI System** | ❌ Missing | Manual DI in stores, no container |
| **Testing Support** | ❌ Missing | No mock repositories, no test utilities |
| **Documentation** | ⚠️ Partial | JSDoc comments present, no architecture docs |

---

## 13. RECOMMENDATIONS FOR DI REFACTORING

### Phase 1: Create DI Container
1. Create `shared/infrastructure/di/container.ts`
2. Implement dependency registration system
3. Add factory functions for creating use cases
4. Support lazy initialization

### Phase 2: Refactor Stores
1. Update stores to use DI container
2. Remove manual use case instantiation
3. Add support for dependency injection in store creation
4. Maintain backward compatibility

### Phase 3: Complete Missing Pieces
1. Create `IUserRepository` and `UserRepository`
2. Add missing use cases (password reset, search, etc.)
3. Complete dashboard module with application/domain layers
4. Add mock repositories for testing

### Phase 4: Testing Infrastructure
1. Create mock repository implementations
2. Add test utilities and fixtures
3. Update stores to support dependency injection for testing
4. Add unit tests for use cases and repositories

---

## 14. FILE INVENTORY

### Total Files by Type

| Type | Count | Location |
|------|-------|----------|
| Use Cases | 20 | `modules/*/application/use-case/` |
| Repository Interfaces | 4 | `modules/*/domain/repository/` |
| Repository Implementations | 4 | `modules/*/infrastructure/repository/` |
| Entities | 4 | `modules/*/domain/entity/` |
| Schemas | 5 | `modules/*/infrastructure/schema/` |
| Zustand Stores | 6 | `shared/infrastructure/stores/` |
| Pages | 8 | `modules/*/infrastructure/ui/pages/` |
| Components | 7 | `modules/*/infrastructure/ui/components/` |
| Shared Components | 4 | `shared/infrastructure/ui/react/components/` |
| Providers | 3 | `shared/infrastructure/provider/` |
| Config/Helpers | 10+ | `shared/application/` |

**Total TypeScript Files:** ~120+

---

## 15. NEXT STEPS

1. **Review this document** with the team
2. **Identify DI container approach** (manual, tsyringe, awilix, etc.)
3. **Create DI implementation plan** with timeline
4. **Start with Phase 1** (DI Container)
5. **Gradually refactor stores** (Phase 2)
6. **Complete missing pieces** (Phase 3)
7. **Add testing infrastructure** (Phase 4)

---

**Document Generated:** 2025-01-25  
**Analysis Scope:** Complete frontend structure mapping  
**Status:** Ready for DI refactoring planning
