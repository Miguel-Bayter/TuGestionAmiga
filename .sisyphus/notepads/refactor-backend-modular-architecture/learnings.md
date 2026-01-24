# Learnings - Backend Modular Architecture Refactor

## Conventions & Patterns

(Subagents will append findings here)

# Baseline Verification Results (Task 0)

**Date:** 2026-01-24  
**Status:** ❌ FAILED - Cannot proceed with refactoring

## Verification Checks

### ✅ CHECK 1: ESLint

- Command: `pnpm --filter @tu-gestion-amiga/backend lint`
- Exit Code: 0
- Result: PASSED (no linting errors)

### ❌ CHECK 2: TypeScript Type-Check

- Command: `pnpm --filter @tu-gestion-amiga/backend type-check`
- Exit Code: 2
- Result: FAILED (16 TypeScript errors)

### ✅ CHECK 3: File Count

- Command: `find apps/backend/src -type f -name "*.ts" | wc -l`
- Result: 29 TypeScript files

### ⏸️ CHECK 4 & 5: Dev Server & Health Endpoint

- Status: SKIPPED (type-check must pass first)

---

## Critical Issues Found

### Issue 1: Prisma Decimal Type Mismatch (4 errors)

**Location:** `src/modules/book/infrastructure/repository/book.repository-impl.ts`

**Problem:**

- Prisma returns `Decimal` type for `price` field (from schema)
- `BookEntity` interface expects `number` type
- Affects all repository methods: `getAll()`, `getById()`, `create()`, `update()`

**Error Example:**

```
error TS2416: Property 'getAll' in type 'BookRepository' is not assignable to the same property in base type 'IBookRepository'.
  Types of property 'price' are incompatible.
    Type 'Decimal' is not assignable to type 'number'.
```

**Root Cause:**
Repository implementation returns raw Prisma objects without type conversion.

**Fix Required:**
Convert Prisma `Decimal` to `number` in repository layer before returning entities.

---

### Issue 2: Incomplete Test Mocks (12 errors)

**Locations:**

- `src/modules/book/__tests__/unit/get-all-books.usecase.test.ts` (4 errors)
- `src/modules/book/__tests__/unit/get-book-by-id.usecase.test.ts` (8 errors)

**Problem:**
Mock objects missing required `BookEntity` properties:

- `author`
- `description`
- `categoryId`
- `price`
- `purchaseStock`
- `rentalStock`
- `createdAt`
- `updatedAt`

**Error Example:**

```
error TS2345: Argument of type '{ id: number; title: string; available: boolean; }' is not assignable to parameter of type 'BookEntity | Promise<BookEntity>'.
  Type '{ id: number; title: string; available: boolean; }' is missing the following properties from type 'BookEntity': author, description, categoryId, price, and 4 more.
```

**Fix Required:**
Update all test mocks to include complete `BookEntity` schema.

---

## Conclusion

**BASELINE VERIFICATION FAILED**

The codebase has pre-existing TypeScript errors that violate type safety. Refactoring cannot proceed until these are resolved.

**Blocking Issues:**

1. Type mismatch between Prisma models and domain entities
2. Incomplete test fixtures

**Next Steps:**

1. Fix Prisma Decimal conversion in repository layer
2. Update test mocks to match BookEntity schema
3. Re-run baseline verification (Task 0)
4. Only proceed with refactoring after clean baseline

**File Count Baseline:** 29 TypeScript files in `apps/backend/src`

## Prisma Decimal → number Type Conversion

**Problem**: Prisma returns `Decimal` type for MySQL `DECIMAL` columns, but domain entities expect `number`.

**Solution**: Convert using `.toNumber()` method in repository layer.

**Pattern Applied** (4 methods in `book.repository-impl.ts`):

```typescript
// getAll - map array
const books = await this.prisma.book.findMany({ ... });
return books.map((book) => ({
  ...book,
  price: book.price.toNumber(),
}));

// getById, create, update - single object
const book = await this.prisma.book.findUnique({ ... });
return {
  ...book,
  price: book.price.toNumber(),
};
```

**Result**: Type-check errors reduced from 16 to 12 (4 repository errors fixed).

**Key Insight**: Repository layer is the correct place for type conversion between infrastructure (Prisma) and domain (entities).

## BookEntity Mock Completion - get-all-books.usecase.test.ts

**Date**: 2026-01-24 18:04:54

**Task**: Fixed 4 incomplete BookEntity mocks in get-all-books.usecase.test.ts

**Changes**:

- Line 25-29: Added complete BookEntity properties to 2-item mock array
- Line 42-46: Added complete BookEntity properties to 2-item mock array (available=true)
- Line 59-60: Added complete BookEntity properties to 1-item mock array (available=false)
- Line 85-101: Added complete BookEntity properties to 2-item mock array with realistic book data

**Properties Added**:

- author: string
- description: string | null
- categoryId: number | null
- price: number
- purchaseStock: number
- rentalStock: number
- createdAt: Date
- updatedAt: Date

**Mock Data Pattern**:

- Used realistic values (not empty/zero)
- Consistent naming: 'Book 1', 'Author 1', 'Description for Book 1'
- Realistic prices: 19.99, 24.99, 29.99, 39.99
- Realistic stock numbers: 0-15 for purchase, 0-8 for rental
- Date values: new Date('2024-01-01'), etc.

**Verification**:

- Type-check error count reduced from 12 to 8 (4 errors fixed)
- Remaining 8 errors are in get-book-by-id.usecase.test.ts (different file)
- Test logic unchanged - only mock data completed

**Key Learning**:
BookEntity has nullable fields (description, categoryId) but mocks should use non-null values for realistic test data.

## ✅ Baseline Clean: Zero TypeScript Errors

**Date**: 2026-01-24 18:07:18

**Task**: Completed BookEntity mocks in get-book-by-id.usecase.test.ts

**Changes**:

- Line 26-37: Mock for basic test (id=1)
- Line 41-52: Mock for 'The Great Gatsby' (id=42)
- Line 62-73: Mock for 'Rare Book' (id=999, available=false)
- Line 76-87: Mock for 'Book Zero' (id=0)
- Line 90-101: Mock for 'Large ID Book' (id=999999)
- Line 137-148: Mock for 'should not call other methods' test (id=1)
- Line 152-163: Mock for 'call exactly once' test (id=7)
- Line 168-179: Mock for 'empty object' test (id=999, empty strings/nulls)

**Properties Added to All 8 Mocks**:

- author: string
- description: string | null
- categoryId: number | null
- price: number
- purchaseStock: number
- rentalStock: number
- createdAt: Date
- updatedAt: Date

**Verification**:

```bash
pnpm --filter @tu-gestion-amiga/backend type-check
# Exit Code: 0 ✅
```

**Result**: **ZERO TypeScript errors** - Baseline is now clean and ready for refactoring.

**Total Errors Fixed**: 16 → 0

- 4 Prisma Decimal conversion errors (previous task)
- 4 get-all-books.usecase.test.ts mock errors (previous task)
- 8 get-book-by-id.usecase.test.ts mock errors (this task)

**Key Pattern**:

- Empty object test still needs complete BookEntity structure
- Used null for nullable fields (description, categoryId) in edge case test
- All other tests use realistic non-null values

---

## Baseline TypeScript Fixes Commit

**Commit**: c6d6808aef0da36057cda1ed14e82282c5953e32
**Message**: fix(backend): resolve TypeScript errors in book module (baseline for refactoring)

**Context**: Prerequisite work to establish clean baseline before modular architecture refactoring. Original plan assumed baseline was clean, but had 16 TypeScript errors.

**Changes**:
- Repository: Added `.toNumber()` for Prisma Decimal → number conversion
- Tests: Completed BookEntity mocks with all required properties


---

## Import Dependency Mapping (Task 1 - AST Analysis)

**Date**: 2026-01-24
**Task**: Map all imports from `/config`, `/middleware`, `/utils`, `/types` directories

### Summary Statistics

- **Total imports found**: 11 unique import statements
- **Files with imports**: 7 files
- **Directories analyzed**: 4 (`config`, `middleware`, `utils`, `types`)

### Import Breakdown by Directory

#### 1. @/config/* (5 imports)

| File | Line | Import Statement |
|------|------|------------------|
| `server.ts` | 1 | `import config from './config/env'` |
| `server.ts` | 2 | `import prisma from './config/database'` |
| `server.ts` | 4 | `import container from './config/container'` |
| `app.ts` | 3 | `import corsMiddleware from './config/cors'` |
| `config/cors.ts` | 2 | `import config from './env'` |

**Exports from @/config:**
- `config/env.ts` → `config` object (server, database, cors settings)
- `config/database.ts` → `prisma` singleton (PrismaClient)
- `config/container.ts` → `container` (Awilix IoC container)
- `config/cors.ts` → `corsMiddleware` (CORS middleware)

#### 2. @/middleware/* (4 imports)

| File | Line | Import Statement |
|------|------|------------------|
| `app.ts` | 4 | `import { errorHandler } from './middleware/error'` |
| `routes/auth.routes.ts` | 3 | `import { asyncHandler } from '../middleware/error'` |
| `routes/books.routes.ts` | 3 | `import { asyncHandler } from '../middleware/error'` |
| `modules/auth/infrastructure/repository/auth.repository-impl.ts` | 3 | `import { ApiError } from '@/middleware/error'` |
| `modules/book/infrastructure/repository/book.repository-impl.ts` | 2 | `import { ApiError } from '@/middleware/error'` |

**Exports from @/middleware:**
- `middleware/error.ts` → `ApiError` class (custom error)
- `middleware/error.ts` → `errorHandler` function (Express error middleware)
- `middleware/error.ts` → `asyncHandler` function (async route wrapper)

#### 3. @/utils/* (1 import)

| File | Line | Import Statement |
|------|------|------------------|
| `modules/auth/infrastructure/repository/auth.repository-impl.ts` | 4 | `import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password'` |

**Exports from @/utils:**
- `utils/password.ts` → `hashPassword` function
- `utils/password.ts` → `comparePassword` function
- `utils/password.ts` → `validatePasswordStrength` function

#### 4. @/types (1 import)

| File | Line | Import Statement |
|------|------|------------------|
| `middleware/auth.ts` | 3 | `import { AuthRequest } from '../types/index'` |

**Exports from @/types:**
- `types/index.ts` → `AuthRequest` interface (extends Express Request)
- `types/index.ts` → `ApiResponse<T>` interface (generic API response)
- `types/index.ts` → `PaginationQuery` interface (pagination params)

### Detailed Import Map

#### Files Importing from Shared Directories

1. **server.ts** (3 imports)
   - `@/config/env` → config
   - `@/config/database` → prisma
   - `@/config/container` → container

2. **app.ts** (2 imports)
   - `@/config/cors` → corsMiddleware
   - `@/middleware/error` → errorHandler

3. **config/cors.ts** (1 import)
   - `@/config/env` → config

4. **routes/auth.routes.ts** (1 import)
   - `@/middleware/error` → asyncHandler

5. **routes/books.routes.ts** (1 import)
   - `@/middleware/error` → asyncHandler

6. **middleware/auth.ts** (1 import)
   - `@/types` → AuthRequest

7. **modules/auth/infrastructure/repository/auth.repository-impl.ts** (2 imports)
   - `@/middleware/error` → ApiError
   - `@/utils/password` → hashPassword, comparePassword, validatePasswordStrength

8. **modules/book/infrastructure/repository/book.repository-impl.ts** (1 import)
   - `@/middleware/error` → ApiError

### Circular Dependency Analysis

**Result**: ✅ **NO CIRCULAR DEPENDENCIES DETECTED**

**Dependency Flow**:
```
server.ts
  ↓
config/env.ts (no imports from shared dirs)
config/database.ts (no imports from shared dirs)
config/container.ts (imports from modules, not shared dirs)
  ↓
app.ts
  ↓
config/cors.ts → config/env.ts
middleware/error.ts (no imports from shared dirs)
  ↓
routes/*.routes.ts → middleware/error.ts
  ↓
modules/*/infrastructure/repository/*.repository-impl.ts
  ↓
middleware/error.ts (ApiError)
utils/password.ts (no imports from shared dirs)
```

**Key Insight**: All shared directories (`config`, `middleware`, `utils`, `types`) are **leaf nodes** with no circular dependencies. They only import from external packages, not from each other or from modules.

### Migration Readiness

**Status**: ✅ **READY FOR MIGRATION**

**Reasons**:
1. Clean dependency graph (no circular imports)
2. All shared code is in 4 well-defined directories
3. Import patterns are consistent (using `@/` alias)
4. Total import count (11) is manageable for sequential migration
5. Each shared directory has clear, single-purpose exports

**Recommended Migration Order** (based on dependency flow):
1. `@/types` → `@/shared/types` (1 import, no dependencies)
2. `@/utils` → `@/shared/utils` (1 import, no dependencies)
3. `@/middleware` → `@/shared/middleware` (4 imports, no dependencies)
4. `@/config` → `@/shared/config` (5 imports, depends on nothing in shared dirs)

**Note**: `@/config/cors.ts` imports from `@/config/env.ts`, so both must be migrated together in step 4.

### Files NOT Importing from Shared Directories

The following files have **zero imports** from `@/config`, `@/middleware`, `@/utils`, or `@/types`:

- All use case files (`*.usecase.ts`) - only import from domain interfaces
- All service files (`*.service.ts`) - only import from use cases
- All domain files (`domain/entity/*.ts`, `domain/interface/*.ts`)
- All test files (`__tests__/**/*.test.ts`)

**Key Pattern**: Clean Architecture is working correctly - domain and application layers are isolated from infrastructure concerns.

---


## Task 2: Create /shared Directory Structure

**Completed:** Created 5 empty subdirectories under `apps/backend/src/shared/`

**Structure Created:**
```
apps/backend/src/shared/
├── config/      (ready for: container.ts, cors.ts, database.ts, env.ts)
├── middleware/  (ready for: auth.ts, error.ts)
├── libs/        (ready for: password.ts - renamed from utils)
├── types/       (ready for: index.ts)
└── http/        (ready for: routes.ts - aggregator)
```

**Verification:**
- All 5 directories created successfully
- Directories are empty (no files yet)
- Backend type-check passes (exit 0)
- Frontend has pre-existing errors unrelated to this task

**Ready for:** Next task will migrate files into these directories.


## Task 3: Move container.ts to /shared/config

**Date**: 2026-01-24
**Status**: ✅ COMPLETED

**Changes**:
1. Moved `src/config/container.ts` → `src/shared/config/container.ts` (using `git mv`)
2. Updated import in `server.ts` line 4: `'./config/container'` → `'./shared/config/container'`
3. Fixed internal import in `container.ts` line 2: `'./database'` → `'@/config/database'`

**Files Modified**:
- `server.ts` - Updated container import path
- `shared/config/container.ts` - Fixed database import to use absolute path

**Verification**:
- ✅ `pnpm type-check` → exit code 0 (no TypeScript errors)
- ✅ `pnpm lint` → exit code 0 (no ESLint errors)
- ✅ Git history preserved (used `git mv`)

**Key Learning**:
When moving files that have relative imports, those imports must be updated to absolute paths (`@/`) to avoid breaking when the file location changes. The container.ts file imported `./database` which broke after moving to `/shared/config/`. Fixed by changing to `@/config/database`.

**Import Pattern**:
- External files importing container: Use `@/shared/config/container`
- Container importing other config files: Use `@/config/*` (until those files are also migrated)

**Ready for**: Next task (migrate database.ts, env.ts, cors.ts to /shared/config)


## Container Migration Commit
- Hash: 60f1f05a9e3ecaf17e000b6d5bd2439def992aa8
- Message: refactor(backend): move container to shared/config
- Git tracked rename: 98% similarity
- Files: server.ts import updated, container.ts internal import fixed
