# Complete List of Errors Found

## Compilation Errors (Vite)

### Error 1: use-book.store.ts - Invalid Import
**File**: `apps/frontend/src/shared/infrastructure/stores/use-book.store.ts:7`
**Error**: `[plugin:vite:import-analysis] Failed to resolve import "@/domain/UseCase/book"`
**Code**:
```typescript
import { GetBooksUseCase, GetBookUseCase, GetAvailableBooksUseCase } from '@/domain/UseCase/book'
```
**Issue**: Path `@/domain/UseCase/` doesn't exist. Use cases are in `@/modules/books/application/use-case/`

---

## LSP Diagnostics Errors

### Error 2: auth.repository.ts - Invalid Entity Import
**File**: `apps/frontend/src/modules/auth/domain/repository/auth.repository.ts:7`
**Error**: `Cannot find module '@/domain/Entity/user.entity'`
**Code**:
```typescript
import type { User } from '@/domain/Entity/user.entity'
```
**Issue**: Path `@/domain/Entity/` doesn't exist. Entity is in `@/modules/auth/domain/entity/user.entity`

---

### Error 3: register.usecase.ts - Invalid Repository Import
**File**: `apps/frontend/src/modules/auth/application/use-case/register.usecase.ts:6`
**Error**: `Cannot find module '@/domain/Repository/auth.repository'`
**Code**:
```typescript
import type { IAuthRepository } from '@/domain/Repository/auth.repository'
```
**Issue**: Path `@/domain/Repository/` doesn't exist. Repository is in `@/modules/auth/domain/repository/auth.repository`

---

### Error 4: login.usecase.ts - Invalid Repository Import
**File**: `apps/frontend/src/modules/auth/application/use-case/login.usecase.ts:6`
**Error**: `Cannot find module '@/domain/Repository/auth.repository'`
**Code**:
```typescript
import type { IAuthRepository } from '@/domain/Repository/auth.repository'
```
**Issue**: Path `@/domain/Repository/` doesn't exist. Repository is in `@/modules/auth/domain/repository/auth.repository`

---

### Error 5: login.page.tsx - Undefined apiClient (Line 79)
**File**: `apps/frontend/src/modules/auth/infrastructure/ui/pages/login.page.tsx:79`
**Error**: `Cannot find name 'apiClient'`
**Code**:
```typescript
const response = await apiClient.post('/auth/login', {
```
**Issue**: `apiClient` is not defined. Should use injected `LoginUseCase` from DI container

---

### Error 6: login.page.tsx - Undefined apiClient (Line 116)
**File**: `apps/frontend/src/modules/auth/infrastructure/ui/pages/login.page.tsx:116`
**Error**: `Cannot find name 'apiClient'`
**Code**:
```typescript
const response = await apiClient.post('/auth/register', {
```
**Issue**: `apiClient` is not defined. Should use injected `RegisterUseCase` from DI container

---

### Error 7: use-auth.store.ts - Invalid UseCase Import
**File**: `apps/frontend/src/shared/infrastructure/stores/use-auth.store.ts:12`
**Error**: `Cannot find module '@/domain/UseCase/auth'`
**Code**:
```typescript
import { LoginUseCase, RegisterUseCase, LogoutUseCase, GetProfileUseCase } from '@/domain/UseCase/auth'
```
**Issue**: Path `@/domain/UseCase/` doesn't exist. Use cases are in `@/modules/auth/application/use-case/`

---

### Error 8: use-auth.store.ts - Invalid Repository Import
**File**: `apps/frontend/src/shared/infrastructure/stores/use-auth.store.ts:13`
**Error**: `Cannot find module '@/data/Repository/auth.repository-impl'`
**Code**:
```typescript
import { authRepository } from '@/data/Repository/auth.repository-impl'
```
**Issue**: Path `@/data/Repository/` doesn't exist. Repository is in `@/modules/auth/infrastructure/repository/auth.repository-impl`

---

### Error 9: use-auth.store.ts - Invalid Provider Import
**File**: `apps/frontend/src/shared/infrastructure/stores/use-auth.store.ts:14`
**Error**: `Cannot find module '@/data/Provider'`
**Code**:
```typescript
import { tokenManager } from '@/data/Provider'
```
**Issue**: Path `@/data/Provider` doesn't exist. Token manager location unknown in new structure

---

## Summary of Error Patterns

### Pattern 1: Old Path References
Multiple files reference old paths that no longer exist:
- `@/domain/UseCase/` → Should be `@/modules/*/application/use-case/`
- `@/domain/Repository/` → Should be `@/modules/*/domain/repository/`
- `@/domain/Entity/` → Should be `@/modules/*/domain/entity/`
- `@/data/Repository/` → Should be `@/modules/*/infrastructure/repository/`
- `@/data/Provider` → Location unknown

### Pattern 2: Direct API Calls
Components are making direct API calls instead of using injected use cases:
- `login.page.tsx` uses `apiClient.post()` directly
- Should use `LoginUseCase` and `RegisterUseCase` from DI container

### Pattern 3: Legacy Zustand Stores
Old Zustand stores still exist and are being imported:
- `use-auth.store.ts` - 3 broken imports
- `use-book.store.ts` - 1 broken import
- `use-cart.store.ts` - Likely broken
- `use-loan.store.ts` - Likely broken

---

## Total Error Count

| Category | Count |
|----------|-------|
| Vite Compilation Errors | 1 |
| LSP Diagnostics Errors | 8 |
| **Total** | **9** |

---

## Files with Errors

1. `use-book.store.ts` - 1 error
2. `auth.repository.ts` - 1 error
3. `register.usecase.ts` - 1 error
4. `login.usecase.ts` - 1 error
5. `login.page.tsx` - 2 errors
6. `use-auth.store.ts` - 3 errors

**Total Files Affected**: 6

---

## Blocking Status

🔴 **BLOCKING**: Application cannot compile until these errors are fixed.

No end-to-end testing can proceed until:
1. All import paths are corrected
2. Direct API calls are replaced with DI-injected use cases
3. Old Zustand stores are removed or fixed
4. Application successfully compiles and starts
