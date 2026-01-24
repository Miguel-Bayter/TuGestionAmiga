# Backend Clean Architecture Improvements

## Context

### Original Request

Improve backend architecture to properly follow Clean Architecture and Screaming Architecture patterns. Standardize all code to English (no Spanish nomenclature like `id_usuario`, all comments in English).

### Interview Summary

**Key Discussions**:

- Scope: Backend-only refactoring (frontend will be handled separately)
- Bug fix: Include fix for `requireAdmin` middleware bug
- Tests: No unit tests for new use cases (to keep scope focused)
- Nomenclature: Change `id_usuario` to `id` in backend, but maintain backward compatibility in API responses

**Research Findings**:

- Frontend expects `id_usuario`, `nombre`, `correo`, `id_rol` in API responses
- Backend must maintain these field names in API responses for backward compatibility
- Internally, backend should use English names (`id`, `name`, `email`, `roleId`)
- Existing test pattern at `modules/book/__tests__/unit/` (not used for this task)

### Metis Review

**Identified Gaps** (addressed):

- API contract with frontend: Resolved by maintaining backward compatibility
- Bug in requireAdmin: Added to scope per user decision
- Missing use cases for refresh/validate token: Added to plan

---

## Work Objectives

### Core Objective

Refactor backend to follow Clean Architecture patterns correctly, standardize internal nomenclature to English while maintaining API backward compatibility with frontend.

### Concrete Deliverables

1. `RefreshTokenUseCase` - Extract refresh logic from routes to use case
2. `ValidateTokenUseCase` - Extract token validation from middleware to use case
3. Updated `IAuthRepository` interface with new methods
4. Updated `AuthRepository` implementation
5. Fixed `requireAdmin` middleware bug
6. Moved `BookPayload` type to book module domain
7. All comments in English

### Definition of Done

- [ ] `pnpm --filter @tu-gestion-amiga/backend lint` passes with no errors
- [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` passes with no errors
- [ ] `pnpm dev:backend` starts successfully
- [ ] Login endpoint works: `curl -X POST http://localhost:3001/api/auth/login`
- [ ] Refresh endpoint works: `curl -X POST http://localhost:3001/api/auth/refresh`
- [ ] No direct Prisma imports in routes or middleware

### Must Have

- Clean Architecture: Routes → Service → UseCase → Repository
- All internal code uses English nomenclature
- API responses maintain backward compatibility (`id_usuario`, etc.)
- DI container properly configured for new use cases

### Must NOT Have (Guardrails)

- MUST NOT change API response shape (frontend depends on it)
- MUST NOT modify `prisma/schema.prisma`
- MUST NOT refactor other modules (cart, loan, purchase, user)
- MUST NOT add new npm dependencies
- MUST NOT change error message text (could break frontend)
- MUST NOT create JWT/Token service (scope creep)
- MUST NOT touch frontend code

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: YES (bun test / vitest at modules/book/**tests**)
- **User wants tests**: NO (per user decision)
- **Framework**: Not applicable

### Manual QA Verification

Each TODO includes detailed verification procedures using curl/httpie for API endpoints.

---

## Task Flow

```
Task 0 (Type cleanup) 
    ↓
Task 1 (Auth Domain Interface) 
    ↓
Task 2 (Auth Repository Impl) 
    ↓
Task 3 (RefreshTokenUseCase)
    ↓
Task 4 (ValidateTokenUseCase)
    ↓
Task 5 (AuthService update)
    ↓
Task 6 (Container registration)
    ↓
Task 7 (Routes refactor)
    ↓
Task 8 (Middleware refactor + bug fix)
    ↓
Task 9 (BookPayload move)
    ↓
Task 10 (Final verification)
```

## Parallelization

| Group | Tasks | Reason |
|-------|-------|--------|
| None | All sequential | Each task depends on previous |

| Task | Depends On | Reason |
|------|------------|--------|
| 1 | 0 | Needs clean types first |
| 2 | 1 | Implements interface from 1 |
| 3 | 2 | Uses repository from 2 |
| 4 | 2 | Uses repository from 2 |
| 5 | 3, 4 | Orchestrates use cases |
| 6 | 3, 4, 5 | Registers all new classes |
| 7 | 6 | Uses container |
| 8 | 4, 6 | Uses ValidateTokenUseCase |
| 9 | None | Independent but last |
| 10 | All | Final verification |

---

## TODOs

- [ ] 0. Create AuthResponse type for API backward compatibility

  **What to do**:
  - Create a new type `AuthUserResponse` in `modules/auth/domain/entity/auth.entity.ts`
  - This type uses Spanish field names for API response compatibility
  - Internal `AuthUser` type remains with English names

  **Must NOT do**:
  - Do not modify existing `AuthUser` type structure
  - Do not add Spanish names to internal types

  **Parallelizable**: NO (foundation for all other tasks)

  **References**:

  **Pattern References**:
  - `modules/auth/domain/entity/auth.entity.ts` - Current AuthUser type definition

  **API/Type References**:
  - `apps/frontend/src/shared/types/auth.types.ts:5-13` - Frontend User interface showing expected API shape

  **WHY Each Reference Matters**:
  - `auth.entity.ts` - Add new type here following same pattern
  - Frontend types - Shows exact field names API must return (`id_usuario`, not `id`)

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] New type `AuthUserResponse` exists with `id_usuario`, `email`, `name`, `roleId` fields
  - [ ] Internal `AuthUser` type unchanged (uses `userId`, `roleId`, `roleName`, `isAdmin`)

  **Commit**: YES
  - Message: `refactor(auth): add AuthUserResponse type for API compatibility`
  - Files: `apps/backend/src/modules/auth/domain/entity/auth.entity.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 1. Update IAuthRepository interface with new methods and English nomenclature

  **What to do**:
  - Add `refreshToken(refreshToken: string)` method signature
  - Add `validateToken(token: string)` method signature
  - Change `id_usuario` to `id` in internal types
  - Keep `id_usuario` in return types that go to API (use `AuthUserResponse`)
  - Add English comments for all methods

  **Must NOT do**:
  - Do not change the return shape that frontend expects
  - Do not remove existing methods

  **Parallelizable**: NO (depends on Task 0)

  **References**:

  **Pattern References**:
  - `modules/auth/domain/interface/auth.repository.ts` - Current interface to modify
  - `modules/book/domain/interface/book.repository.ts` - Example of well-structured interface

  **API/Type References**:
  - `modules/auth/domain/entity/auth.entity.ts` - AuthUser and new AuthUserResponse types

  **WHY Each Reference Matters**:
  - Current interface shows structure to follow
  - Book repository shows naming conventions and JSDoc style

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors (will fail until Task 2 completes implementation)
  - [ ] Interface has 4 methods: `register`, `login`, `refreshToken`, `validateToken`
  - [ ] No `id_usuario` in internal parameter types
  - [ ] Return types use `AuthUserResponse` for API responses
  - [ ] All comments are in English

  **Commit**: NO (groups with Task 2)

---

- [ ] 2. Update AuthRepository implementation with new methods

  **What to do**:
  - Implement `refreshToken(refreshToken: string)` method
  - Implement `validateToken(token: string)` method
  - Move JWT logic from `auth.routes.ts:39-66` to `refreshToken` method
  - Move user lookup from `middleware/auth.ts:25-28` to `validateToken` method
  - Use `AuthUserResponse` type for API response mapping
  - Change internal `id_usuario` references to `id`
  - All comments in English

  **Must NOT do**:
  - Do not change the API response shape
  - Do not duplicate JWT secret handling (keep using `process.env.JWT_SECRET`)

  **Parallelizable**: NO (depends on Task 1)

  **References**:

  **Pattern References**:
  - `modules/auth/infrastructure/repository/auth.repository-impl.ts:62-104` - Current login method as pattern for new methods
  - `routes/auth.routes.ts:39-66` - Current refresh logic to extract

  **API/Type References**:
  - `modules/auth/domain/interface/auth.repository.ts` - Interface to implement
  - `middleware/auth.ts:25-39` - Current validateToken logic to extract

  **Documentation References**:
  - JWT verify usage: `jwt.verify(token, secret)` returns decoded payload

  **WHY Each Reference Matters**:
  - `auth.repository-impl.ts:62-104` - Shows pattern for JWT generation, Prisma usage, error handling
  - `auth.routes.ts:39-66` - Contains exact logic to move for refreshToken
  - `middleware/auth.ts:25-39` - Contains exact logic to move for validateToken

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] `refreshToken` method exists and handles: invalid token, expired token, user not found
  - [ ] `validateToken` method exists and returns `AuthUser` (internal type with English names)
  - [ ] Both methods throw `ApiError` on failure
  - [ ] Response uses `id_usuario` (Spanish) in user object for API compatibility
  - [ ] All comments in English

  **Commit**: YES
  - Message: `refactor(auth): add refreshToken and validateToken to repository`
  - Files: `apps/backend/src/modules/auth/domain/interface/auth.repository.ts`, `apps/backend/src/modules/auth/infrastructure/repository/auth.repository-impl.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 3. Create RefreshTokenUseCase

  **What to do**:
  - Create new file `modules/auth/application/use-case/refresh-token.usecase.ts`
  - Class `RefreshTokenUseCase` with constructor injection of `IAuthRepository`
  - Method `execute(refreshToken: string)` that delegates to repository
  - English comments and naming

  **Must NOT do**:
  - Do not add business logic beyond delegation (keep use case thin)
  - Do not import Prisma or JWT directly

  **Parallelizable**: NO (depends on Task 2)

  **References**:

  **Pattern References**:
  - `modules/auth/application/use-case/login.usecase.ts` - Exact pattern to follow for new use case

  **API/Type References**:
  - `modules/auth/domain/interface/auth.repository.ts` - IAuthRepository interface

  **WHY Each Reference Matters**:
  - `login.usecase.ts` - Shows exact structure: constructor with repository, execute method delegating to repository

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File exists at `modules/auth/application/use-case/refresh-token.usecase.ts`
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] Class has constructor accepting `IAuthRepository`
  - [ ] Method `execute(refreshToken: string)` exists
  - [ ] No direct Prisma or JWT imports

  **Commit**: NO (groups with Task 4)

---

- [ ] 4. Create ValidateTokenUseCase

  **What to do**:
  - Create new file `modules/auth/application/use-case/validate-token.usecase.ts`
  - Class `ValidateTokenUseCase` with constructor injection of `IAuthRepository`
  - Method `execute(token: string)` that delegates to repository
  - Returns `AuthUser` (internal type with English names for middleware use)
  - English comments and naming

  **Must NOT do**:
  - Do not add business logic beyond delegation
  - Do not import Prisma or JWT directly

  **Parallelizable**: NO (depends on Task 2)

  **References**:

  **Pattern References**:
  - `modules/auth/application/use-case/login.usecase.ts` - Exact pattern to follow

  **API/Type References**:
  - `modules/auth/domain/interface/auth.repository.ts` - IAuthRepository interface
  - `modules/auth/domain/entity/auth.entity.ts` - AuthUser type for return

  **WHY Each Reference Matters**:
  - `login.usecase.ts` - Shows exact structure
  - `auth.entity.ts` - Return type definition

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] File exists at `modules/auth/application/use-case/validate-token.usecase.ts`
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] Class has constructor accepting `IAuthRepository`
  - [ ] Method `execute(token: string)` returns `Promise<AuthUser>`
  - [ ] No direct Prisma or JWT imports

  **Commit**: YES
  - Message: `refactor(auth): add RefreshTokenUseCase and ValidateTokenUseCase`
  - Files: `apps/backend/src/modules/auth/application/use-case/refresh-token.usecase.ts`, `apps/backend/src/modules/auth/application/use-case/validate-token.usecase.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 5. Update AuthService with new use cases

  **What to do**:
  - Add `RefreshTokenUseCase` to constructor
  - Add `ValidateTokenUseCase` to constructor  
  - Add `refreshToken(token: string)` method
  - Add `validateToken(token: string)` method
  - English comments

  **Must NOT do**:
  - Do not add business logic (delegate to use cases)

  **Parallelizable**: NO (depends on Tasks 3, 4)

  **References**:

  **Pattern References**:
  - `modules/auth/application/service/auth.service.ts` - Current service to modify
  - `modules/book/application/service/book.service.ts` - Shows pattern with multiple use cases

  **WHY Each Reference Matters**:
  - Current service shows constructor pattern with multiple use cases
  - Book service shows how to add new methods

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] Constructor has 4 use cases: `loginUseCase`, `registerUseCase`, `refreshTokenUseCase`, `validateTokenUseCase`
  - [ ] Methods `refreshToken()` and `validateToken()` exist
  - [ ] All comments in English

  **Commit**: NO (groups with Task 6)

---

- [ ] 6. Register new use cases in DI container

  **What to do**:
  - Import `RefreshTokenUseCase` and `ValidateTokenUseCase`
  - Register `refreshTokenUseCase` with `asClass().singleton()`
  - Register `validateTokenUseCase` with `asClass().singleton()`
  - Update `AuthService` registration to include new dependencies

  **Must NOT do**:
  - Do not change scoping strategy (keep singleton for use cases)

  **Parallelizable**: NO (depends on Tasks 3, 4, 5)

  **References**:

  **Pattern References**:
  - `config/container.ts:40-45` - Current use case registration pattern

  **WHY Each Reference Matters**:
  - Shows exact registration pattern: `asClass(UseCase).singleton()`

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] `refreshTokenUseCase` registered in container
  - [ ] `validateTokenUseCase` registered in container
  - [ ] Server starts without DI resolution errors: `pnpm dev:backend` → "Server running"

  **Commit**: YES
  - Message: `refactor(auth): register new use cases in DI container`
  - Files: `apps/backend/src/config/container.ts`, `apps/backend/src/modules/auth/application/service/auth.service.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 7. Refactor auth.routes.ts to use AuthService

  **What to do**:
  - Remove direct `prisma` import
  - Remove direct `jwt` import (only for refresh endpoint)
  - Update `/refresh` endpoint to use `authService.refreshToken()`
  - Remove all JWT generation logic from routes
  - All comments in English

  **Must NOT do**:
  - Do not change endpoint URLs or HTTP methods
  - Do not change response format

  **Parallelizable**: NO (depends on Task 6)

  **References**:

  **Pattern References**:
  - `routes/books.routes.ts` - Clean example using only service (no direct DB access)
  - `routes/auth.routes.ts:11-27` - Current login/register endpoints (already clean) as pattern

  **API/Type References**:
  - `modules/auth/application/service/auth.service.ts` - Service methods available

  **WHY Each Reference Matters**:
  - `books.routes.ts` - Shows clean route pattern: only `bookService` used
  - Current login endpoint - Shows error handling pattern to maintain

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] No `import prisma` in auth.routes.ts
  - [ ] No `import jwt` in auth.routes.ts
  - [ ] `/refresh` endpoint uses `authService.refreshToken()`
  - [ ] API test with curl:

    ```bash
    # First login to get tokens
    curl -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@tugestionamiga.com","password":"admin123"}'
    # Response contains accessToken and refreshToken
    
    # Then test refresh
    curl -X POST http://localhost:3001/api/auth/refresh \
      -H "Content-Type: application/json" \
      -d '{"refreshToken":"<token_from_login>"}'
    # Response: { "accessToken": "..." }
    ```

  **Commit**: YES
  - Message: `refactor(auth): remove direct Prisma/JWT from routes, use service`
  - Files: `apps/backend/src/routes/auth.routes.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 8. Refactor middleware/auth.ts and fix requireAdmin bug

  **What to do**:
  - Remove direct `prisma` import
  - Update `requireAuth` to use `validateTokenUseCase` via container
  - Fix `requireAdmin` bug: properly chain `requireAuth` using Promise
  - All comments in English

  **Must NOT do**:
  - Do not change authentication logic behavior
  - Do not change error response format

  **Parallelizable**: NO (depends on Task 6)

  **References**:

  **Pattern References**:
  - `middleware/auth.ts` - Current middleware to refactor
  - `middleware/error.ts` - Shows middleware pattern

  **Bug Details**:
  - Line 54: `await requireAuth(req, res, () => {})` - Empty callback doesn't properly wait
  - Fix: Use Promise wrapper or refactor to reuse validation logic

  **WHY Each Reference Matters**:
  - Current middleware shows structure to maintain
  - Need to fix bug where requireAdmin doesn't properly wait for requireAuth

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] No `import prisma` in middleware/auth.ts
  - [ ] `requireAuth` uses use case from container (or service)
  - [ ] `requireAdmin` properly chains with `requireAuth` (no empty callback bug)
  - [ ] Protected route test:

    ```bash
    # Without token - should fail
    curl http://localhost:3001/api/books
    # Response: 401 or data (depending on if books route is protected)
    
    # With valid token - should succeed
    curl http://localhost:3001/api/books \
      -H "Authorization: Bearer <valid_token>"
    ```

  **Commit**: YES
  - Message: `refactor(auth): use service in middleware, fix requireAdmin bug`
  - Files: `apps/backend/src/middleware/auth.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 9. Move BookPayload type to book module domain

  **What to do**:
  - Move `BookPayload` type from `src/types/index.ts` to `modules/book/domain/entity/book.entity.ts`
  - Update imports in `modules/book/domain/interface/book.repository.ts`
  - Update imports in `modules/book/infrastructure/repository/book.repository-impl.ts`
  - Remove `BookPayload` export from `src/types/index.ts` if it exists there

  **Must NOT do**:
  - Do not change the type definition itself
  - Do not modify other types in `src/types/index.ts`

  **Parallelizable**: YES (independent of auth tasks, but do last for clean flow)

  **References**:

  **Pattern References**:
  - `modules/book/domain/entity/book.entity.ts` - Target location (already has BookEntity)
  - `modules/auth/domain/entity/auth.entity.ts` - Shows pattern of domain types location

  **Current Locations**:
  - `src/types/index.ts` - May have BookPayload (check if exists)
  - `modules/book/domain/entity/book.entity.ts:15-24` - Already has BookPayload here!

  **WHY Each Reference Matters**:
  - BookPayload already exists in book entity file, just need to fix imports

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] `BookPayload` exported from `modules/book/domain/entity/book.entity.ts`
  - [ ] No `BookPayload` import from `@/types` in book module files
  - [ ] Book repository uses import from domain entity

  **Commit**: YES
  - Message: `refactor(book): fix BookPayload import to use domain entity`
  - Files: `apps/backend/src/modules/book/domain/interface/book.repository.ts`, `apps/backend/src/modules/book/infrastructure/repository/book.repository-impl.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 10. Final verification and cleanup

  **What to do**:
  - Run full lint check
  - Run type check
  - Start server and verify all endpoints
  - Verify no Spanish comments remain in modified files
  - Verify no `id_usuario` in internal types (only in API response types)

  **Must NOT do**:
  - Do not commit any new changes (verification only)

  **Parallelizable**: NO (must be last)

  **References**:

  **Commands to run**:
  - `pnpm --filter @tu-gestion-amiga/backend lint`
  - `pnpm --filter @tu-gestion-amiga/backend type-check`
  - `pnpm dev:backend`

  **Acceptance Criteria**:

  **Manual Execution Verification:**
  - [ ] `pnpm --filter @tu-gestion-amiga/backend lint` → 0 errors, 0 warnings
  - [ ] `pnpm --filter @tu-gestion-amiga/backend type-check` → No errors
  - [ ] `pnpm dev:backend` → Server starts on port 3001
  - [ ] Login test:

    ```bash
    curl -X POST http://localhost:3001/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@tugestionamiga.com","password":"admin123"}'
    # Verify response has: user.id_usuario, accessToken, refreshToken
    ```

  - [ ] Refresh test:

    ```bash
    curl -X POST http://localhost:3001/api/auth/refresh \
      -H "Content-Type: application/json" \
      -d '{"refreshToken":"<token>"}'
    # Verify response has: accessToken
    ```

  - [ ] Books test:

    ```bash
    curl http://localhost:3001/api/books
    # Verify response has: ok: true, data: [...]
    ```

  - [ ] Grep for Spanish in modified files:

    ```bash
    grep -r "id_usuario" apps/backend/src/modules --include="*.ts" | grep -v "Response"
    # Should return no matches (id_usuario only in Response types)
    ```

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 0 | `refactor(auth): add AuthUserResponse type for API compatibility` | auth.entity.ts | type-check |
| 2 | `refactor(auth): add refreshToken and validateToken to repository` | auth.repository.ts, auth.repository-impl.ts | type-check |
| 4 | `refactor(auth): add RefreshTokenUseCase and ValidateTokenUseCase` | 2 use case files | type-check |
| 6 | `refactor(auth): register new use cases in DI container` | container.ts, auth.service.ts | type-check |
| 7 | `refactor(auth): remove direct Prisma/JWT from routes, use service` | auth.routes.ts | type-check |
| 8 | `refactor(auth): use service in middleware, fix requireAdmin bug` | middleware/auth.ts | type-check |
| 9 | `refactor(book): fix BookPayload import to use domain entity` | 2 book files | type-check |

---

## Success Criteria

### Verification Commands

```bash
pnpm --filter @tu-gestion-amiga/backend lint      # Expected: 0 errors
pnpm --filter @tu-gestion-amiga/backend type-check # Expected: 0 errors
pnpm dev:backend                                   # Expected: Server running on 3001
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] No direct Prisma imports in routes or middleware
- [ ] All comments in English
- [ ] API backward compatibility maintained (id_usuario in responses)
- [ ] requireAdmin bug fixed
