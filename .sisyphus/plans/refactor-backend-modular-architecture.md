# Refactor Backend: Modular Architecture (Complete Structure)

## Context

### Original Request

Complete the modular architecture refactoring for TuGestionAmiga backend to achieve Screaming Architecture by:

1. Creating `/shared` directory for cross-cutting concerns (config, middleware, libs, types)
2. Ensuring routes are located in `/modules/{domain}/infrastructure/http/routes.ts`
3. Standardizing utils/libs naming to `/shared/libs/`
4. Centralizing all global types in `/shared/types/index.ts`
5. Deleting legacy `/routes` directory

### Current State Analysis

- ✅ Backend already has partial modular structure (`/modules/auth`, `/modules/book`)
- ✅ Infrastructure layer has `/infrastructure/http/` subdirectories (but empty of routes)
- ✅ Has separate `/config`, `/middleware`, `/utils`, `/types` at root level
- ❌ Old `/routes` directory still present (legacy, contains auth.routes.ts, books.routes.ts)
- ✅ Uses Awilix for DI container
- ✅ Uses Express for HTTP framework
- ✅ Uses Prisma 6 as ORM
- ✅ Book module has `__tests__/unit/` testing infrastructure
- ✅ TypeScript strict mode enabled with path alias `@/*`

### Interview Summary

**Key Decisions Confirmed**:

- **Naming Standard**: `/shared/libs/` (not /utils or /helpers) - matches industry standards
- **Route Strategy**: One `routes.ts` per module at `/modules/{domain}/infrastructure/http/routes.ts`
- **Route Aggregation**: Create centralized `/shared/http/routes.ts` aggregator (cleaner separation)
- **Types Scope**: Only HTTP/shared types in `/shared/types/index.ts` (not domain entities)
- **Config Consolidation**: ALL config files move to `/shared/config/` (4 files: container, cors, database, env)
- **Middleware Consolidation**: Both middleware files move to `/shared/middleware/` (auth.ts, error.ts)
- **Testing**: Create `/modules/auth/__tests__/unit/` for consistency with book module

**Architecture Decision**:
Following **Screaming Architecture + Clean Architecture** pattern:

- **Domain Layer**: Business logic, entities, interfaces (framework-agnostic)
- **Application Layer**: Use cases, services, business rules orchestration
- **Infrastructure Layer**: Framework-specific code (HTTP routes, database access, external services)

### Metis Review Findings (Gap Analysis)

**Critical Insights**:

1. **Import Dependency Mapping**: 50+ import statements will break and need updating
2. **Sequential Execution**: MUST execute migration in specific order to avoid breaking dependencies
3. **Verification Strategy**: MUST run `pnpm type-check` after EACH file move
4. **Route Aggregation Pattern**: Creating `/shared/http/routes.ts` requires understanding current `/routes/index.ts` aggregation logic
5. **DI Container First**: Must update container imports FIRST (it's the dependency hub)

**Key Risks Identified**:

- **CRITICAL**: Circular dependencies between modules and shared code
- **CRITICAL**: Import path breakage across 50+ statements
- **CRITICAL**: DI container registration points changing
- **MEDIUM**: Nodemon hot-reload not picking up `/shared` changes
- **MEDIUM**: ESLint/TypeScript path resolution after migration

---

## Work Objectives

### Core Objective

Reorganize backend structure to achieve **Screaming Architecture + Clean Architecture** by consolidating all cross-cutting concerns into `/shared` directory and ensuring routes are co-located with their domain modules in `/modules/{domain}/infrastructure/http/`.

Result: A structure that "screams" what the application does (Auth, Books, Users, etc.) with clear separation of concerns.

### Concrete Deliverables

1. ✅ `/shared/config/` directory with 4 files
2. ✅ `/shared/middleware/` directory with 2 files
3. ✅ `/shared/libs/` directory with 1 file (password.ts)
4. ✅ `/shared/types/` directory with 1 file (index.ts with all global types)
5. ✅ `/shared/http/` directory with routes aggregator
6. ✅ `/modules/auth/infrastructure/http/routes.ts` with all auth routes
7. ✅ `/modules/book/infrastructure/http/routes.ts` with all book routes
8. ✅ `/modules/auth/__tests__/` directory for consistency
9. ✅ Updated import statements in 50+ files
10. ✅ Deleted `/routes` directory

### Definition of Done

- [ ] No TypeScript errors: `pnpm type-check` exits with 0
- [ ] No ESLint errors: `pnpm lint` exits with 0
- [ ] All imports use new paths (@/shared/*, @/modules/*)
- [ ] All endpoints respond: `curl http://localhost:3001/api/health` returns `{"ok":true,"message":"Server is running"}`
- [ ] Auth endpoints work: POST `/api/auth/register`, POST `/api/auth/login`, POST `/api/auth/refresh`
- [ ] Book endpoints work: GET `/api/books`, GET `/api/books/:id`
- [ ] No console errors during startup: `pnpm dev` starts cleanly
- [ ] Existing tests pass (if any): `pnpm test` exits with 0

### Must Have (Guardrails from Metis Review)

1. ✅ Sequential execution (DO NOT move multiple concerns at once)
2. ✅ Type-check after EACH file move (prevents cascading errors)
3. ✅ Never skip verification steps (lint → format → type-check)
4. ✅ Use AST-based tools for import updates (not manual find/replace)
5. ✅ Test all endpoints after route migration
6. ✅ No circular dependencies introduced

### Must NOT Have (Explicit Exclusions)

1. ❌ NEVER change business logic while refactoring
2. ❌ NEVER modify route handlers (only move them)
3. ❌ NEVER use `@ts-ignore` or `@ts-expect-error` to bypass errors
4. ❌ NEVER move multiple concerns simultaneously (config + middleware in same step)
5. ❌ NEVER delete `/routes` until new module routes verified working
6. ❌ NEVER move domain entities to `/shared/types/` (only HTTP/shared types)

---

## Verification Strategy

### Test Infrastructure Assessment

**Status**: ✅ Testing infrastructure EXISTS

- Framework: **Bun test** (configured in package.json)
- Existing tests: Book module has `__tests__/unit/` directory
- Current coverage: Partial (book service unit tests)

### QA Approach: Manual Verification + Manual Testing

**Reasoning**: This is a structural refactoring (not a feature). Existing tests verify business logic; manual endpoint verification ensures integration points work after reorganization.

**Manual Verification Procedures**:

**For each file move**:

1. Move file to new location
2. Update all imports in affected files
3. Run `pnpm type-check` → **MUST PASS**
4. Run `pnpm lint` → **MUST PASS**
5. Verify no compilation errors in IDE

**For routes migration**:

1. Copy route logic to module `/infrastructure/http/routes.ts`
2. Update container registration in `/shared/config/container.ts`
3. Update route aggregation in `/shared/http/routes.ts`
4. Run `pnpm dev` → server starts cleanly
5. Test endpoint with curl/Postman

**Final verification**:

```bash
# Full health check
pnpm check-all          # lint + format:check + type-check
pnpm dev               # start server, verify no errors
# Then test all endpoints via curl
```

---

## Task Flow

```
Prepare & Verify
     ↓
Create /shared structure
     ↓
Move /config → /shared/config
     ↓
Move /middleware → /shared/middleware
     ↓
Move /utils → /shared/libs
     ↓
Move /types → /shared/types
     ↓
Create module routes (/modules/{auth,book}/infrastructure/http/routes.ts)
     ↓
Create /shared/http/routes.ts aggregator
     ↓
Update app.ts to use aggregator
     ↓
Delete /routes directory
     ↓
Final verification & testing
```

### Parallelization Strategy

**Not applicable** - This refactoring requires sequential execution. Each step depends on previous step's import updates. No parallel tasks.

---

## TODOs

### Phase 1: Preparation & Verification (Pre-Migration)

- [ ] 0. Baseline Verification
  
  **What to do**:
  - Run `pnpm type-check` and capture baseline (must pass with 0 errors)
  - Run `pnpm lint` and capture baseline (must pass with 0 errors)
  - Run `pnpm dev` and verify server starts on port 3001
  - Document current directory structure with: `find apps/backend/src -type f -name "*.ts" | wc -l` (should be ~30 files)

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` → exit code 0 (no TypeScript errors)
  - [ ] `pnpm lint` → exit code 0 (no ESLint errors)
  - [ ] `pnpm dev` → server starts, listens on port 3001
  - [ ] Endpoint test: `curl http://localhost:3001/api/health` → `{"ok":true,"message":"Server is running"}`
  - [ ] All 3 checks pass with current structure (baseline established)

  **Commit**: NO

---

- [x] 1. Map Import Dependencies (AST Analysis)

  **What to do**:
  - Use `ast_grep_search` to find all imports from `/config`, `/middleware`, `/utils`, `/types`
  - Document each import pattern and affected files
  - Verify no circular dependencies between modules and shared code
  - Create import mapping reference (which files import what)

  **References**:
  - Pattern Reference: Current import style in `apps/backend/src/modules/auth/infrastructure/repository/auth.repository-impl.ts:3-4`:

    ```typescript
    import { ApiError } from '@/middleware/error'
    import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password'
    ```

  - Document found patterns in local file or notes

  **Acceptance Criteria**:
  - [ ] `ast_grep_search(pattern="import.*from.*['\"]@/(config|middleware|utils|types)", lang="typescript")` run and results documented
  - [ ] No circular dependency warnings
  - [ ] Import mapping shows: config (X files), middleware (Y files), utils (Z files), types (W files)
  - [ ] At least 50 import statements identified

  **Commit**: NO

---

### Phase 2: Directory Structure Creation

- [x] 2. Create /shared Directory Structure

  **What to do**:
  - Create directories:
    - `apps/backend/src/shared/config/`
    - `apps/backend/src/shared/middleware/`
    - `apps/backend/src/shared/libs/`
    - `apps/backend/src/shared/types/`
    - `apps/backend/src/shared/http/`
  - Verify each directory created
  - Verify no files in directories yet (empty structure)

  **Acceptance Criteria**:
  - [ ] All 5 directories exist
  - [ ] `find apps/backend/src/shared -type d` shows all 5 subdirectories
  - [ ] No TypeScript errors introduced: `pnpm type-check` still passes

  **Commit**: NO

---

### Phase 3: File Migrations (Sequential)

#### Step A: Migrate /config → /shared/config

- [x] 3. Move config/container.ts to shared/config/

  **What to do**:
  - Move `apps/backend/src/config/container.ts` → `apps/backend/src/shared/config/container.ts`
  - Find all files importing from `@/config/container`
  - Update imports to `@/shared/config/container`
  - Verify no import failures

  **Must NOT do**:
  - Don't change container registration logic
  - Don't modify Awilix configuration
  - Don't rename the file or change exports

  **Parallelizable**: NO (depends on 2)

  **References**:
  - Import Reference: `apps/backend/src/app.ts:2` imports `createApp` from container
  - Import Reference: `apps/backend/src/server.ts` imports container
  - Pattern: Search for `import.*container` to find all usages

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/config/container.ts`
  - [ ] All import statements updated: `ast_grep_replace(pattern="@/config/container", rewrite="@/shared/config/container", lang="typescript")` with dryRun=false
  - [ ] `pnpm type-check` → exit code 0 (all imports resolved)
  - [ ] `pnpm lint` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move container to shared/config`
  - Files: `src/shared/config/container.ts`, all affected imports
  - Pre-commit: `pnpm type-check`

---

- [ ] 4. Move config/cors.ts to shared/config/

  **What to do**:
  - Move `apps/backend/src/config/cors.ts` → `apps/backend/src/shared/config/cors.ts`
  - Find all files importing from `@/config/cors`
  - Update imports to `@/shared/config/cors`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/config/cors.ts`
  - [ ] All imports updated: `ast_grep_replace(pattern="@/config/cors", rewrite="@/shared/config/cors", lang="typescript")`
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move cors to shared/config`
  - Files: `src/shared/config/cors.ts`, `src/app.ts`
  - Pre-commit: `pnpm type-check`

---

- [ ] 5. Move config/database.ts to shared/config/

  **What to do**:
  - Move `apps/backend/src/config/database.ts` → `apps/backend/src/shared/config/database.ts`
  - Find all files importing from `@/config/database`
  - Update imports to `@/shared/config/database`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/config/database.ts`
  - [ ] All imports updated
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move database to shared/config`
  - Pre-commit: `pnpm type-check`

---

- [ ] 6. Move config/env.ts to shared/config/

  **What to do**:
  - Move `apps/backend/src/config/env.ts` → `apps/backend/src/shared/config/env.ts`
  - Find all files importing from `@/config/env`
  - Update imports to `@/shared/config/env`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/config/env.ts`
  - [ ] All imports updated
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move env to shared/config`
  - Pre-commit: `pnpm type-check`

---

#### Step B: Migrate /middleware → /shared/middleware

- [ ] 7. Move middleware/error.ts to shared/middleware/

  **What to do**:
  - Move `apps/backend/src/middleware/error.ts` → `apps/backend/src/shared/middleware/error.ts`
  - Find all imports: `@/middleware/error` (exports: ApiError, errorHandler, asyncHandler)
  - Update to: `@/shared/middleware/error`
  - This file is heavily used (critical step)

  **Must NOT do**:
  - Don't modify error handling logic
  - Don't change ApiError class definition
  - Don't change asyncHandler function

  **Parallelizable**: NO (config must finish first)

  **References**:
  - Usage Pattern: `apps/backend/src/modules/auth/infrastructure/repository/auth.repository-impl.ts:3` imports ApiError
  - Usage Pattern: `apps/backend/src/routes/auth.routes.ts:3` imports asyncHandler
  - Find all: `ast_grep_search(pattern="from.*['\"]@/middleware/error", lang="typescript")`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/middleware/error.ts`
  - [ ] All imports updated: `ast_grep_replace(pattern="@/middleware/error", rewrite="@/shared/middleware/error", lang="typescript")`
  - [ ] `pnpm type-check` → exit code 0 (likely 50+ import fixes)
  - [ ] `pnpm lint` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move error middleware to shared/middleware`
  - Pre-commit: `pnpm type-check && pnpm lint`

---

- [ ] 8. Move middleware/auth.ts to shared/middleware/

  **What to do**:
  - Move `apps/backend/src/middleware/auth.ts` → `apps/backend/src/shared/middleware/auth.ts`
  - Find all imports from `@/middleware/auth`
  - Update to `@/shared/middleware/auth`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/middleware/auth.ts`
  - [ ] All imports updated
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move auth middleware to shared/middleware`
  - Pre-commit: `pnpm type-check`

---

#### Step C: Migrate /utils → /shared/libs

- [ ] 9. Move utils/password.ts to shared/libs/ (Rename to libs)

  **What to do**:
  - Move `apps/backend/src/utils/password.ts` → `apps/backend/src/shared/libs/password.ts`
  - Find all imports from `@/utils/password`
  - Update to `@/shared/libs/password`
  - NOTE: Path changes from `/utils` to `/libs` AND `/utils/` to `/libs/`

  **Must NOT do**:
  - Don't change password hashing logic
  - Don't modify function signatures
  - Don't change password validation rules

  **Parallelizable**: NO (middleware must finish first)

  **References**:
  - Usage Reference: `apps/backend/src/modules/auth/infrastructure/repository/auth.repository-impl.ts:4` imports password functions
  - Find all: `ast_grep_search(pattern="from.*['\"]@/utils", lang="typescript")`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/libs/password.ts`
  - [ ] All imports updated: `ast_grep_replace(pattern="@/utils/password", rewrite="@/shared/libs/password", lang="typescript")`
  - [ ] `pnpm type-check` → exit code 0
  - [ ] `pnpm lint` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move password utils to shared/libs`
  - Pre-commit: `pnpm type-check && pnpm lint`

---

#### Step D: Migrate /types → /shared/types

- [ ] 10. Move types/index.ts to shared/types/

  **What to do**:
  - Move `apps/backend/src/types/index.ts` → `apps/backend/src/shared/types/index.ts`
  - Current exports: `AuthRequest`, `ApiResponse`, `PaginationQuery`
  - Find all imports from `@/types` or `@/types/index`
  - Update to `@/shared/types` or `@/shared/types/index`
  - Ensure relative path imports `../types` become `@/shared/types`

  **Must NOT do**:
  - Don't add domain entities to shared types (only HTTP/shared types)
  - Don't change interface definitions
  - Don't remove any exported types

  **Parallelizable**: NO (libs must finish first)

  **References**:
  - Type Reference: `AuthRequest` extends Express Request with optional `auth` property
  - Type Reference: `ApiResponse<T>` is generic response wrapper
  - Type Reference: `PaginationQuery` defines page/limit parameters
  - Find all: `ast_grep_search(pattern="from.*['\"]@/types", lang="typescript")`

  **Acceptance Criteria**:
  - [ ] File moved to `/shared/types/index.ts`
  - [ ] All imports updated: `ast_grep_replace(pattern="@/types", rewrite="@/shared/types", lang="typescript")`
  - [ ] Also update relative imports: `ast_grep_replace(pattern="['\"]../types['\"]", rewrite="['\"]@/shared/types['\"]", lang="typescript")`
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): move types to shared/types`
  - Pre-commit: `pnpm type-check`

---

### Phase 4: Route Migration (Critical)

- [ ] 11. Create /modules/auth/infrastructure/http/routes.ts

  **What to do**:
  - Review current `apps/backend/src/routes/auth.routes.ts` (contains auth register/login/refresh endpoints)
  - Copy route logic to `apps/backend/src/modules/auth/infrastructure/http/routes.ts`
  - Ensure all imports are updated to use `/shared/*` paths
  - Export function: `export function createAuthRoutes(container: AwilixContainer)`
  - Do NOT delete old file yet (verify new route works first)

  **Must NOT do**:
  - Don't modify route handlers (only move them)
  - Don't change endpoint paths (/register, /login, /refresh)
  - Don't change HTTP methods or status codes

  **Parallelizable**: NO (types migration must finish first)

  **References**:
  - Source Route Pattern: `apps/backend/src/routes/auth.routes.ts` (complete file with 45 lines)
  - Import Pattern: Uses `asyncHandler` from error middleware, `authService` from container
  - Endpoint Pattern: POST /register, POST /login, POST /refresh

  **Acceptance Criteria**:
  - [ ] File created: `/modules/auth/infrastructure/http/routes.ts`
  - [ ] File exports: `createAuthRoutes` function
  - [ ] File imports updated: `@/shared/*` paths
  - [ ] Route handlers unchanged (same logic, just moved)
  - [ ] `pnpm type-check` → exit code 0
  - [ ] `pnpm lint` → exit code 0

  **Commit**: YES
  - Message: `refactor(modules/auth): add infrastructure http routes`
  - Files: `src/modules/auth/infrastructure/http/routes.ts`
  - Pre-commit: `pnpm type-check && pnpm lint`

---

- [ ] 12. Create /modules/book/infrastructure/http/routes.ts

  **What to do**:
  - Review current `apps/backend/src/routes/books.routes.ts` (contains book get all/get by id endpoints)
  - Copy route logic to `apps/backend/src/modules/book/infrastructure/http/routes.ts`
  - Ensure all imports updated to `/shared/*` paths
  - Export function: `export function createBooksRoutes(container: AwilixContainer)`
  - Do NOT delete old file yet

  **Must NOT do**:
  - Don't modify route handlers
  - Don't change endpoint paths (/all, /:id)
  - Don't change HTTP methods

  **Parallelizable**: YES (with task 11 - both can be done together)

  **References**:
  - Source Route Pattern: `apps/backend/src/routes/books.routes.ts`
  - Endpoint Pattern: GET /all, GET /:id

  **Acceptance Criteria**:
  - [ ] File created: `/modules/book/infrastructure/http/routes.ts`
  - [ ] File exports: `createBooksRoutes` function
  - [ ] All imports updated to `@/shared/*`
  - [ ] `pnpm type-check` → exit code 0

  **Commit**: YES
  - Message: `refactor(modules/book): add infrastructure http routes`
  - Pre-commit: `pnpm type-check`

---

- [ ] 13. Create /shared/http/routes.ts (Routes Aggregator)

  **What to do**:
  - Create new file: `apps/backend/src/shared/http/routes.ts`
  - Copy logic from old `apps/backend/src/routes/index.ts` (aggregator function)
  - Update imports:

    ```typescript
    // OLD
    import { createAuthRoutes } from './auth.routes'
    import { createBooksRoutes } from './books.routes'
    
    // NEW
    import { createAuthRoutes } from '@/modules/auth/infrastructure/http/routes'
    import { createBooksRoutes } from '@/modules/book/infrastructure/http/routes'
    ```

  - Keep same export: `export function createApiRoutes(container: AwilixContainer)`
  - This becomes the single aggregation point for all routes

  **Must NOT do**:
  - Don't modify health check endpoint logic
  - Don't change 404 handler
  - Don't change route mounting paths (/auth, /books)

  **Parallelizable**: NO (must wait for modules routes to be created first)

  **References**:
  - Aggregator Pattern: `apps/backend/src/routes/index.ts:6-24` shows current aggregation logic
  - Import Example: `createAuthRoutes(container)` returns Router instance
  - Export Pattern: `export function createApiRoutes(container: AwilixContainer)`

  **Acceptance Criteria**:
  - [ ] File created: `/shared/http/routes.ts`
  - [ ] Imports point to module routes: `@/modules/auth/infrastructure/http/routes`
  - [ ] Function aggregates: auth routes, book routes, health check, 404 handler
  - [ ] `pnpm type-check` → exit code 0
  - [ ] `pnpm lint` → exit code 0

  **Commit**: YES
  - Message: `refactor(shared): add centralized http routes aggregator`
  - Files: `src/shared/http/routes.ts`
  - Pre-commit: `pnpm type-check && pnpm lint`

---

- [ ] 14. Update app.ts to use new routes aggregator

  **What to do**:
  - Edit `apps/backend/src/app.ts`
  - Change import: `import { createApiRoutes } from '@/routes/index'` → `import { createApiRoutes } from '@/shared/http/routes'`
  - Rest of logic stays same (middleware setup, error handler placement)
  - Verify no other changes needed

  **Must NOT do**:
  - Don't modify middleware order
  - Don't change error handler placement
  - Don't change express.json() config

  **Parallelizable**: NO (depends on routes aggregator creation)

  **References**:
  - Current Pattern: `apps/backend/src/app.ts:2-3` shows route import
  - Context: App setup in app.ts, line 16 uses `createApiRoutes(container)`

  **Acceptance Criteria**:
  - [ ] Import updated in app.ts: `from '@/shared/http/routes'`
  - [ ] No other app.ts changes (middleware, error handler stay same)
  - [ ] `pnpm type-check` → exit code 0
  - [ ] `pnpm dev` starts successfully
  - [ ] Endpoints still respond: `curl http://localhost:3001/api/health`

  **Commit**: YES
  - Message: `refactor(app): import routes from shared/http`
  - Files: `src/app.ts`
  - Pre-commit: `pnpm type-check`

---

### Phase 5: Testing & Cleanup

- [ ] 15. Test All Endpoints (Manual Integration Test)

  **What to do**:
  - Start dev server: `pnpm dev` (in separate terminal)
  - Wait for server to start (should listen on port 3001)
  - Test health endpoint
  - Test auth endpoints (register, login, refresh)
  - Test book endpoints (get all, get by id)
  - All endpoints should respond with correct status codes and data

  **Acceptance Criteria**:
  - [ ] Health check: `curl http://localhost:3001/api/health` → `{"ok":true,"message":"Server is running"}` (200 OK)
  - [ ] Register: `curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","name":"Test","password":"Secure123!"}'` → 201 Created with user data
  - [ ] Login: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@tugestionamiga.com","password":"admin123"}'` → 200 OK with tokens
  - [ ] Refresh: `curl -X POST http://localhost:3001/api/auth/refresh -H "Content-Type: application/json" -d '{"refreshToken":"<token>"}'` → 200 OK with new tokens
  - [ ] Books List: `curl http://localhost:3001/api/books` → 200 OK with books array
  - [ ] Book Detail: `curl http://localhost:3001/api/books/1` → 200 OK with book data
  - [ ] 404 handler: `curl http://localhost:3001/api/invalid` → 404 with error message

  **Commit**: NO (testing only)

---

- [ ] 16. Run Full Quality Checks

  **What to do**:
  - Run `pnpm check-all` (lint + format:check + type-check combined)
  - Verify no errors or warnings
  - Run `pnpm lint` separately to capture ESLint results
  - Run `pnpm type-check` separately to capture TypeScript results
  - Document any issues found and resolve

  **Acceptance Criteria**:
  - [ ] `pnpm check-all` → exit code 0 (all checks pass)
  - [ ] `pnpm lint` → exit code 0 (no ESLint errors)
  - [ ] `pnpm type-check` → exit code 0 (no TypeScript errors)
  - [ ] No warnings about unused imports or variables
  - [ ] All import paths use `@/shared/*` or `@/modules/*` convention

  **Commit**: NO

---

- [ ] 17. Delete Legacy /routes Directory

  **What to do**:
  - Only proceed if all endpoints tested and working in task 15
  - Delete directory: `apps/backend/src/routes/`
  - This removes: auth.routes.ts, books.routes.ts, index.ts (old aggregator)
  - Verify no imports reference /routes anymore: `ast_grep_search(pattern="from.*['\"]@/routes", lang="typescript")`
  - Should return 0 matches (no old routes imports)

  **Must NOT do**:
  - Don't delete until endpoints verified working
  - Don't delete if any other files still import from /routes

  **Parallelizable**: NO (depends on all testing)

  **Acceptance Criteria**:
  - [ ] All endpoints still work after deletion
  - [ ] `ast_grep_search(pattern="from.*['\"]@/routes", lang="typescript")` → 0 results
  - [ ] No broken imports: `pnpm type-check` → exit code 0
  - [ ] Directory `/routes` does not exist: `ls apps/backend/src/routes` → file not found

  **Commit**: YES
  - Message: `refactor(backend): remove legacy routes directory`
  - Pre-commit: `pnpm type-check`

---

- [ ] 18. Delete Legacy /config, /middleware, /utils, /types Directories

  **What to do**:
  - Delete `apps/backend/src/config/` directory (all files moved to /shared/config)
  - Delete `apps/backend/src/middleware/` directory (all files moved to /shared/middleware)
  - Delete `apps/backend/src/utils/` directory (all files moved to /shared/libs)
  - Delete `apps/backend/src/types/` directory (file moved to /shared/types)
  - Verify no imports reference old paths

  **Must NOT do**:
  - Don't delete if any files still import from old paths

  **Parallelizable**: NO (depends on task 17)

  **Acceptance Criteria**:
  - [ ] Directories deleted: /config, /middleware, /utils, /types
  - [ ] `find apps/backend/src -type d -name "config" -o -name "middleware" -o -name "utils" -o -name "types"` → only matches under /shared/ and /modules/
  - [ ] No broken imports: `pnpm type-check` → exit code 0
  - [ ] `pnpm check-all` → exit code 0

  **Commit**: YES
  - Message: `refactor(backend): remove legacy shared directories`
  - Pre-commit: `pnpm type-check && pnpm check-all`

---

### Phase 6: Final Verification

- [ ] 19. Create /modules/auth/**tests**/ Structure (Optional, for consistency)

  **What to do**:
  - Create directory: `apps/backend/src/modules/auth/__tests__/unit/`
  - Create empty placeholder test file: `auth.service.spec.ts` (or similar)
  - Matches book module's testing structure
  - Not required for refactoring success, but good for consistency

  **Must NOT do**:
  - Don't write actual tests (only create structure)

  **Parallelizable**: YES (can be done anytime after route migration)

  **Acceptance Criteria**:
  - [ ] Directory created: `/modules/auth/__tests__/unit/`
  - [ ] File exists: `/modules/auth/__tests__/unit/auth.service.spec.ts` (placeholder)
  - [ ] No TypeScript errors

  **Commit**: YES (optional)
  - Message: `chore(modules/auth): add test directory structure`
  - Pre-commit: `pnpm type-check`

---

- [ ] 20. Final Structural Verification

  **What to do**:
  - Verify final directory structure matches target
  - Ensure all files in correct locations
  - Verify no files left in old locations
  - Generate tree view and compare with expected structure

  **Acceptance Criteria**:
  - [ ] Directory structure matches target:

    ```
    src/
    ├── shared/
    │   ├── config/ (4 files)
    │   ├── middleware/ (2 files)
    │   ├── libs/ (1 file)
    │   ├── types/ (1 file)
    │   └── http/ (1 file)
    ├── modules/
    │   ├── auth/
    │   │   ├── domain/
    │   │   ├── application/
    │   │   ├── infrastructure/
    │   │   │   ├── http/
    │   │   │   │   └── routes.ts ✓
    │   │   │   └── repository/
    │   │   ├── __tests__/ (optional)
    │   │   └── index.ts
    │   └── book/
    │       ├── domain/
    │       ├── application/
    │       ├── infrastructure/
    │       │   ├── http/
    │       │   │   └── routes.ts ✓
    │       │   └── repository/
    │       ├── __tests__/
    │       └── index.ts
    ├── app.ts
    ├── server.ts
    └── main.ts
    ```

  - [ ] No files in: /config, /middleware, /utils, /types, /routes (all removed)
  - [ ] All TypeScript files compile: `pnpm type-check` → 0 errors
  - [ ] All endpoints still work: manual curl tests pass

  **Commit**: NO (verification only)

---

- [ ] 21. Documentation Update (Optional)

  **What to do**:
  - Update `apps/backend/README.md` if it documents directory structure
  - Update architecture documentation to reflect new structure
  - Add `/shared` explanation in README

  **Acceptance Criteria**:
  - [ ] README updated with new directory structure
  - [ ] Architecture diagram (if exists) reflects `/shared` and modules
  - [ ] Examples in README use new import paths: `@/shared/*`, `@/modules/*`

  **Commit**: YES
  - Message: `docs(backend): update architecture documentation`
  - Pre-commit: NO

---

## Commit Strategy

| Task | Group | Message | Files | Verification |
|------|-------|---------|-------|--------------|
| 3 | Config | `refactor(backend): move container to shared/config` | container.ts, imports | `pnpm type-check` |
| 4 | Config | `refactor(backend): move cors to shared/config` | cors.ts, app.ts | `pnpm type-check` |
| 5 | Config | `refactor(backend): move database to shared/config` | database.ts, imports | `pnpm type-check` |
| 6 | Config | `refactor(backend): move env to shared/config` | env.ts, imports | `pnpm type-check` |
| 7 | Middleware | `refactor(backend): move error middleware to shared` | error.ts, 50+ files | `pnpm type-check && pnpm lint` |
| 8 | Middleware | `refactor(backend): move auth middleware to shared` | auth.ts, imports | `pnpm type-check` |
| 9 | Libs | `refactor(backend): move password utils to shared/libs` | password.ts, auth imports | `pnpm type-check && pnpm lint` |
| 10 | Types | `refactor(backend): move types to shared/types` | types.ts, imports | `pnpm type-check` |
| 11 | Routes | `refactor(modules/auth): add infrastructure http routes` | auth/routes.ts | `pnpm type-check && pnpm lint` |
| 12 | Routes | `refactor(modules/book): add infrastructure http routes` | book/routes.ts | `pnpm type-check` |
| 13 | Routes | `refactor(shared): add centralized http routes aggregator` | shared/http/routes.ts | `pnpm type-check && pnpm lint` |
| 14 | Routes | `refactor(app): import routes from shared/http` | app.ts | `pnpm type-check` |
| 17 | Cleanup | `refactor(backend): remove legacy routes directory` | (deletion) | `pnpm type-check` |
| 18 | Cleanup | `refactor(backend): remove legacy shared directories` | (deletion) | `pnpm type-check && pnpm check-all` |
| 19 | Optional | `chore(modules/auth): add test directory structure` | auth/**tests**/ | `pnpm type-check` |
| 21 | Docs | `docs(backend): update architecture documentation` | README.md | NO |

---

## Success Criteria

### Verification Commands

```bash
# Type safety
pnpm type-check          # Exit code 0, no TypeScript errors

# Code quality
pnpm lint                # Exit code 0, no ESLint errors
pnpm format:check        # Exit code 0, properly formatted

# Combined check
pnpm check-all           # All of the above

# Server startup
pnpm dev                 # Server starts on port 3001 with no errors

# Endpoint testing
curl http://localhost:3001/api/health
curl http://localhost:3001/api/books
curl -X POST http://localhost:3001/api/auth/login -d '...'
```

### Final Checklist

- [ ] **Structure**: `/shared` created with all 5 subdirectories
- [ ] **Moved Files**: All config, middleware, libs, types in `/shared/`
- [ ] **Module Routes**: Auth and book routes in `/modules/{domain}/infrastructure/http/`
- [ ] **Route Aggregator**: `/shared/http/routes.ts` aggregates all routes
- [ ] **Imports**: All 50+ import statements updated to new paths
- [ ] **Deleted**: `/config`, `/middleware`, `/utils`, `/types`, `/routes` removed
- [ ] **TypeScript**: `pnpm type-check` passes with 0 errors
- [ ] **ESLint**: `pnpm lint` passes with 0 errors
- [ ] **Formatting**: `pnpm format:check` passes
- [ ] **Endpoints**: All API endpoints respond correctly
- [ ] **Health**: Health check endpoint works
- [ ] **Auth**: Register, login, refresh tokens work
- [ ] **Books**: Get all books, get book by ID work
- [ ] **Error Handling**: 404 handler works, errors return proper format
- [ ] **Server**: Dev server starts cleanly with `pnpm dev`
- [ ] **Tests**: Any existing tests still pass (if applicable)
- [ ] **Documentation**: README updated with new structure
- [ ] **Commits**: All work tracked with semantic commits

---

## Notes

### Why This Approach?

1. **Sequential Execution**: Each step depends on previous steps' import updates. No parallelization possible without breaking dependencies.

2. **Type-Check After Each Step**: TypeScript will catch import errors immediately, preventing cascading failures.

3. **Routes Last**: Routes depend on everything else being in place (shared code, modules accessible).

4. **Testing After Routes**: Only after routes are in `/modules/{domain}/infrastructure/http/` can we test endpoints.

5. **Lazy Cleanup**: Delete old directories only after new structure is verified working.

### Key Principles (Metis Review)

- **Never skip verification steps** - Each step must pass type-check before proceeding
- **AST-based tools only** - Use `ast_grep_replace` for safe import updates
- **Manual endpoint testing** - Verify each endpoint works after route migration
- **No circular dependencies** - Shared code should not import from modules
- **No business logic changes** - Only move and reorganize, don't modify code

### Estimated Timeline

- **Phase 1 (Prep)**: 15 minutes
- **Phase 2 (Directories)**: 5 minutes
- **Phase 3 (Files)**: 45 minutes (10 files moved, imports updated sequentially)
- **Phase 4 (Routes)**: 30 minutes (3 route files, 1 aggregator, app.ts update)
- **Phase 5 (Testing)**: 20 minutes (manual endpoint testing)
- **Phase 6 (Cleanup & Docs)**: 15 minutes

**Total Estimated Time**: 2-2.5 hours

### Risk Mitigation Checklist

- ✅ Map dependencies before moving any files
- ✅ Use AST tools for import updates (not manual)
- ✅ Type-check after each file move
- ✅ Test all endpoints after route migration
- ✅ Don't skip documentation updates
- ✅ Keep old directories until new structure verified
- ✅ Use semantic commit messages
- ✅ Follow sequential execution order strictly
