# GET Routes Migration: server.js → Clean Architecture
**Objective**: Migrate all 10 GET routes from monolithic server.js to modular clean architecture with Prisma  
**Scope**: Database operations only (GET endpoints, no POST/PATCH/DELETE in this plan)  
**Tech Stack**: TypeScript + Express + Prisma 6 + MySQL + Awilix (DI)  
**Language**: English (all code, comments, naming)  

---

## TL;DR

> **Quick Summary**: Migrate 10 GET routes from `server.js` (raw MySQL) to 8 new TypeScript modules (Prisma ORM) following clean architecture pattern. 2 routes already exist, 8 need implementation. Prioritize: Categories → Users → Purchases → Loans → Covers.
>
> **Deliverables**:
> - 8 new modules with full clean architecture (entity, repository, use case, service, routes)
> - JWT auth middleware (replaces x-user-id header)
> - Category, User, Purchase, Loan, Covers modules complete
> - Admin filter for existing Books module
> - All responses wrapped: `{ ok: true, data: [...] }`
> - No pagination (return all results)
> - Server-side search for admin endpoints
>
> **Estimated Effort**: Large (70-80 implementation tasks)  
> **Parallel Execution**: YES - 5 independent waves possible  
> **Critical Path**: Auth Middleware → Categories → Users → Purchases → Loans

---

## Context

### Original Request
Migrate GET routes from `apps/backend/server.js` (monolithic, 1700+ lines) to new backend architecture (modular clean architecture with Prisma).

### Interview Summary
- **Architecture**: Confirmed clean architecture pattern (entity → repository → use case → service → routes)
- **ORM**: Confirmed Prisma 6 (agnóstic DB, currently MySQL)
- **Response Format**: Wrap all responses in `{ ok: true, data: X }`
- **Pagination**: Return all results (no limit/offset)
- **Search**: Server-side search with Prisma ILIKE
- **Auth**: Switch from x-user-id header to JWT Bearer tokens
- **Priority**: Categories → Users → Purchases → Loans (admin features first)

### Codebase Analysis
**Existing Structure**:
- ✅ Book module (GET /api/books, GET /api/books/:id) - fully implemented
- ✅ Auth module (GET /api/auth/validate) - JWT setup ready
- ✅ Prisma schema (all models defined)
- ✅ Awilix DI container (infrastructure ready)

**Missing**:
- ❌ 8 new GET endpoint modules
- ❌ JWT auth middleware (context: auth exists but not in middleware)
- ❌ Admin-specific filtering

---

## Work Objectives

### Core Objective
Implement 8 new GET endpoint modules with full clean architecture (entity, repository, use case, service, routes), JWT auth middleware, and standardized response wrapping.

### Concrete Deliverables
1. **JWT Auth Middleware** - Replace x-user-id header auth
2. **Category Module** - GET /api/admin/categories
3. **User Module** - GET /api/admin/users
4. **Purchase Module** - GET /api/purchases
5. **Loan Module** - GET /api/admin/loans (with search)
6. **Covers Utility** - GET /api/covers (file listing)
7. **Cart Module** - GET /api/cart (for completion)
8. **Book Module Enhancement** - Add admin filter

### Definition of Done
- ✅ All routes respond with `{ ok: true, data: [...] }` format
- ✅ All endpoints use Prisma (no raw SQL)
- ✅ Full TypeScript typing (zero `any` types)
- ✅ JWT middleware working on protected routes
- ✅ Role-based access control (ADMIN vs USER)
- ✅ Search working server-side (ILIKE query)
- ✅ Error responses consistent: `{ ok: false, error: "..." }`
- ✅ All code in English (variables, comments, messages)
- ✅ Integration tests passing

### Must Have
- All 10 GET routes migrated and functional
- No raw SQL queries (Prisma only)
- JWT authentication on protected routes
- Response format consistency
- TypeScript strict mode compliance
- Error handling with ApiError class
- Proper HTTP status codes (200, 400, 401, 403, 404, 500)

### Must NOT Have (Guardrails)
- ❌ No `any` types in TypeScript
- ❌ No hardcoded credentials or secrets
- ❌ No x-user-id header auth (only JWT)
- ❌ No pagination (keep routes simple)
- ❌ No raw SQL (Prisma only)
- ❌ No console.log debugging (remove before commit)
- ❌ No Spanish variable names (English only)
- ❌ No role-less endpoints in admin paths
- ❌ No direct pool.query usage

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "User opens Postman..."
> - "User visually confirms..." 
> - "User interacts with..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using curl, interactive_bash (tmux), or API calls. No exceptions.

### Test Infrastructure
- **Existing**: Jest (configured in `jest.config.ts`)
- **Framework**: Jest with ts-jest
- **Approach**: TDD (RED-GREEN-REFACTOR)

### Test Decision
- **Infrastructure exists**: YES (Jest configured)
- **Automated tests**: YES (TDD with RED-GREEN-REFACTOR)
- **Framework**: Jest + ts-jest

### If TDD Enabled

Each task follows RED-GREEN-REFACTOR:

**Task Structure**:
1. **RED**: Write failing test first
   - Test file: `src/modules/{module}/application/use-case/{feature}.usecase.test.ts`
   - Test command: `pnpm --filter @tu-gestion-amiga/backend test {file}`
   - Expected: FAIL (test exists, implementation doesn't)

2. **GREEN**: Implement minimum code to pass
   - Command: `pnpm --filter @tu-gestion-amiga/backend test {file}`
   - Expected: PASS (all tests)

3. **REFACTOR**: Clean up while keeping green
   - Command: `pnpm --filter @tu-gestion-amiga/backend test {file}`
   - Expected: PASS (still)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Whether TDD is enabled or not, EVERY task MUST include Agent-Executed QA Scenarios.
> These describe how the executing agent DIRECTLY verifies the deliverable
> by running it — starting the server, making API requests.

**Scenario Format**:

```
Scenario: [What is being tested - e.g., "Get all categories returns wrapped response"]
  Tool: Bash (curl / httpie)
  Preconditions: Dev server running on localhost:3000, database connected
  Steps:
    1. curl -s -X GET http://localhost:3000/api/admin/categories \
        -H "Authorization: Bearer {valid_jwt_token}"
    2. Parse JSON response
    3. Assert response.ok === true
    4. Assert response.data is Array
    5. Assert response.data[0] has fields: id, name
    6. Save response to .sisyphus/evidence/task-{N}-scenario-name.json
  Expected Result: { ok: true, data: [{id, name}, ...] }
  Failure Indicators: Missing ok field, data is not array, HTTP status not 200
  Evidence: .sisyphus/evidence/task-{N}-scenario-name.json

Scenario: [Unauthorized request returns 401]
  Tool: Bash (curl)
  Preconditions: Dev server running
  Steps:
    1. curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/admin/categories
    2. Assert HTTP status is 401
    3. Assert response.ok === false
    4. Assert response.error contains "unauthorized" or "token"
  Expected Result: 401 status with { ok: false, error: "..." }
  Evidence: Command output capture
```

---

## Execution Strategy

### Parallel Execution Waves

**Wave 1** (Auth Foundation):
- Setup JWT middleware
- Update container registrations
- All other waves depend on this

**Wave 2** (Admin Features - Independent):
- Parallel: Category Module + User Module
  - Both have ZERO dependencies
  - Can be implemented simultaneously

**Wave 3** (User Features - Depend on Wave 2):
- Sequential after Wave 2
- Purchase Module (depends: Book, User from Wave 2)
- Loan Module (depends: Book, User from Wave 2)

**Wave 4** (Utilities):
- Covers Module (filesystem utility, no DB)
- Can run in parallel with Wave 3

**Wave 5** (Cart & Enhancements):
- Cart Module (if time permits)
- Book module admin filter (low priority)

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize |
|------|-----------|--------|-----------------|
| JWT Middleware | None | ALL | - |
| Category Module | JWT | Purchase, Loan | User |
| User Module | JWT | Purchase, Loan | Category |
| Purchase Module | Book, User | - | Loan |
| Loan Module | Book, User | - | Purchase |
| Covers Utility | None | - | Category, User |
| Cart Module | Book, User | - | Purchase, Loan |
| Book Admin Filter | Book | - | All |

### Recommended Agent Dispatch

**Wave 1**: Sequential
- Task 1: Setup JWT Middleware (quick)

**Wave 2**: Parallel (2 agents simultaneously)
- Task 2: Category Module (sisyphus with category skills)
- Task 3: User Module (sisyphus with admin skills)

**Wave 3**: Sequential after Wave 2
- Task 4: Purchase Module
- Task 5: Loan Module

**Wave 4**: Parallel with Wave 3
- Task 6: Covers Utility

**Wave 5**: Optional
- Task 7: Cart Module
- Task 8: Book Admin Filter

---

## TODOs

### WAVE 1: JWT Auth Middleware Setup

- [ ] 1. Implement JWT Auth Middleware

  **What to do**:
  - Create `src/shared/middleware/jwt.ts`
  - Import jsonwebtoken library
  - Extract Bearer token from Authorization header
  - Decode JWT → attach user data to req.user
  - Handle expired/invalid tokens → 401 response
  - Middleware must work with Awilix container
  - Update `createApp()` to use middleware on protected routes

  **Must NOT do**:
  - Don't keep x-user-id header auth
  - Don't allow unsigned tokens
  - Don't expose JWT secret in code

  **Recommended Agent Profile**:
  > Specialized security/middleware work.
  - **Category**: `unspecified-high`
    - Reason: Middleware is foundational for all protected routes; affects entire auth system
  - **Skills**: [`git-master`]
    - `git-master`: Commit changes for baseline JWT setup
  
  **Parallelization**:
  - **Can Run In Parallel**: NO (blocks all other work)
  - **Blocks**: Tasks 2-8 (all protected routes)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `src/modules/auth/application/use-case/validate-token.usecase.ts:1-30` - JWT validation pattern (show how tokens are verified)
  - `src/shared/middleware/error.ts:1-50` - Error middleware pattern (how to structure middleware response)

  **API/Type References** (contracts to implement against):
  - `src/modules/auth/domain/entity/auth.entity.ts` - User type structure (what fields req.user should have)

  **Framework References**:
  - JWT library: `jsonwebtoken` npm package docs
  - Express middleware pattern: standard Express (req, res, next) signature

  **External References**:
  - Official docs: `https://github.com/auth0/node-jsonwebtoken` - JWT signing/verification
  - Error handling: Existing ApiError pattern in `src/shared/middleware/error.ts`

  **WHY Each Reference Matters**:
  - validate-token.usecase.ts shows JWT verification logic already in system (reuse pattern)
  - error.ts shows how middleware formats responses consistently
  - auth.entity.ts defines User type structure for req.user attachment
  - Express middleware pattern is standard (req, res, next)

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  **If TDD (tests enabled):**
  - [ ] Test file created: src/shared/middleware/jwt.test.ts
  - [ ] Test covers: valid token decoding, invalid token rejection, missing token handling
  - [ ] pnpm --filter @tu-gestion-amiga/backend test src/shared/middleware/jwt.test.ts → PASS

  **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed):**

  ```
  Scenario: Valid JWT token is decoded and attached to req.user
    Tool: Bash (curl with custom middleware test endpoint)
    Preconditions: Dev server running, test JWT token generated
    Steps:
      1. Create test endpoint: GET /api/test-auth (protected)
      2. Generate valid JWT: payload = { id: 1, roleId: 2, role: "USER" }
      3. curl -s -X GET http://localhost:3000/api/test-auth \
         -H "Authorization: Bearer {test_jwt_token}"
      4. Assert response.ok === true
      5. Assert response.user.id === 1
      6. Assert response.user.roleId === 2
    Expected Result: { ok: true, user: { id: 1, roleId: 2, role: "USER" } }
    Evidence: .sisyphus/evidence/task-1-valid-jwt.json

  Scenario: Invalid token returns 401 Unauthorized
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/test-auth \
         -H "Authorization: Bearer invalid.token.here"
      2. Parse response and status code
      3. Assert HTTP status is 401
      4. Assert response.ok === false
      5. Assert response.error contains "unauthorized" or "invalid"
    Expected Result: 401 status with { ok: false, error: "..." }
    Evidence: Command output

  Scenario: Missing Authorization header returns 401
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/test-auth
      2. Assert HTTP status is 401
      3. Assert response.error contains "token" or "authorization"
    Expected Result: 401 status with error message
    Evidence: Command output
  ```

  **Evidence to Capture**:
  - [ ] JWT test responses in .sisyphus/evidence/
  - [ ] Test file execution output
  - [ ] Each scenario result documented

  **Commit**: YES
  - Message: `feat(auth): implement JWT middleware for protected routes`
  - Files: `src/shared/middleware/jwt.ts`, `src/shared/middleware/jwt.test.ts`, `src/app.ts` (updated)
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend test src/shared/middleware/jwt.test.ts && pnpm --filter @tu-gestion-amiga/backend lint`

---

### WAVE 2: Category & User Modules (Parallel)

- [ ] 2. Implement Category Module (GET /api/admin/categories)

  **What to do**:
  - Create directory: `src/modules/category/`
  - Create entity: `src/modules/category/domain/entity/category.entity.ts`
    - Type: `CategoryEntity = { id, name, createdAt, updatedAt }`
  - Create interface: `src/modules/category/domain/interface/category.repository.ts`
    - Methods: `getAll(): Promise<CategoryEntity[]>`
  - Create repository impl: `src/modules/category/infrastructure/repository/category.repository-impl.ts`
    - Use Prisma: `this.prisma.category.findMany({ orderBy: { name: 'asc' } })`
  - Create use case: `src/modules/category/application/use-case/get-all-categories.usecase.ts`
  - Create service: `src/modules/category/application/service/category.service.ts`
  - Create routes: `src/modules/category/infrastructure/http/routes.ts`
    - Route: `GET /` (relative to /api/admin/categories)
    - Response: `{ ok: true, data: [...] }`
    - Auth: requireAuth + requireAdmin
  - Update container: `src/shared/config/container.ts`
    - Register repository, use case, service
  - Update routes: `src/shared/http/routes.ts`
    - Add: `router.use('/admin/categories', createCategoryRoutes(container))`

  **Must NOT do**:
  - Don't use raw SQL
  - Don't return unwrapped array
  - Don't allow unauthorized access

  **Recommended Agent Profile**:
  > Straightforward CRUD module implementation with clear patterns (Book module as example).
  - **Category**: `quick`
    - Reason: Clear pattern exists (Book module), straightforward GET-all implementation
  - **Skills**: [`git-master`]
    - `git-master`: Commit new module following project conventions
  
  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3: User Module)
  - **Parallel Group**: Wave 2 (with Task 3)
  - **Blocks**: None (independent)
  - **Blocked By**: Task 1 (JWT middleware) - CRITICAL

  **References**:
  - Book module pattern: `src/modules/book/` (complete reference architecture)
  - Prisma Category model: `apps/backend/prisma/schema.prisma:42-50`
  - Container registration: `src/shared/config/container.ts:37-40` (BookRepository example)

  **Acceptance Criteria**:
  - [ ] Repository test: `pnpm --filter @tu-gestion-amiga/backend test category.repository.test.ts → PASS`
  - [ ] Use case test: `pnpm --filter @tu-gestion-amiga/backend test get-all-categories.usecase.test.ts → PASS`
  - [ ] curl -X GET http://localhost:3000/api/admin/categories -H "Authorization: Bearer {admin_jwt}" → 200 with `{ ok: true, data: [{id, name}, ...] }`
  - [ ] curl without Authorization header → 401
  - [ ] All TypeScript: zero `any` types, full typing on entity/service

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Admin gets all categories in sorted order
    Tool: Bash (curl)
    Steps:
      1. Start dev server
      2. Create admin JWT token (roleId: 1)
      3. curl -s -X GET http://localhost:3000/api/admin/categories \
         -H "Authorization: Bearer {admin_token}"
      4. Assert response.ok === true
      5. Assert response.data is Array with length > 0
      6. Assert response.data[0] has { id, name, createdAt, updatedAt }
      7. Verify categories are sorted by name ascending
    Expected Result: { ok: true, data: [...] }
    Evidence: .sisyphus/evidence/task-2-categories.json

  Scenario: Non-admin user gets 403 Forbidden
    Tool: Bash (curl)
    Steps:
      1. Create user JWT token (roleId: 2, not admin)
      2. curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/admin/categories \
         -H "Authorization: Bearer {user_token}"
      3. Assert HTTP status is 403
      4. Assert response.error contains "admin" or "forbidden"
    Expected Result: 403 status with error
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(category): add category module with GET /api/admin/categories endpoint`
  - Files: `src/modules/category/**`, `src/shared/config/container.ts`, `src/shared/http/routes.ts`
  - Pre-commit: `pnpm --filter @tu-gestion-amiga/backend lint && pnpm --filter @tu-gestion-amiga/backend type-check`

---

- [ ] 3. Implement User Module (GET /api/admin/users)

  **What to do**:
  - Create directory: `src/modules/user/`
  - Create entity: `src/modules/user/domain/entity/user.entity.ts`
    - Type: `UserEntity = { id, email, name, roleId, role: { id, name }, createdAt, updatedAt }`
  - Create interface: `src/modules/user/domain/interface/user.repository.ts`
    - Methods: `getAll(): Promise<UserEntity[]>`
  - Create repository impl: `src/modules/user/infrastructure/repository/user.repository-impl.ts`
    - Use Prisma: `this.prisma.user.findMany({ include: { role: true }, orderBy: { id: 'desc' } })`
  - Create use case: `src/modules/user/application/use-case/get-all-users.usecase.ts`
  - Create service: `src/modules/user/application/service/user.service.ts`
  - Create routes: `src/modules/user/infrastructure/http/routes.ts`
    - Route: `GET /` (relative to /api/admin/users)
    - Response: `{ ok: true, data: [...] }`
    - Auth: requireAuth + requireAdmin
  - Update container: `src/shared/config/container.ts`
  - Update routes: `src/shared/http/routes.ts`
    - Add: `router.use('/admin/users', createUserRoutes(container))`

  **Must NOT do**:
  - Don't expose password field
  - Don't use raw SQL
  - Don't allow unauthorized access

  **Recommended Agent Profile**:
  > Similar to Category module - simple GET-all with role relation.
  - **Category**: `quick`
    - Reason: Follows exact same pattern as Category module
  - **Skills**: [`git-master`]
  
  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 2: Category Module)
  - **Parallel Group**: Wave 2 (with Task 2)
  - **Blocks**: Tasks 4-5 (Purchase and Loan depend on User)
  - **Blocked By**: Task 1 (JWT middleware)

  **References**:
  - Book module pattern: `src/modules/book/`
  - Prisma User model: `apps/backend/prisma/schema.prisma:25-39`
  - Role relation: `schema.prisma:14-22`

  **Acceptance Criteria**:
  - [ ] Tests pass: `pnpm --filter @tu-gestion-amiga/backend test user.repository.test.ts → PASS`
  - [ ] curl -X GET http://localhost:3000/api/admin/users -H "Authorization: Bearer {admin_jwt}" → 200 with users
  - [ ] Response includes role.name, NOT password field
  - [ ] Users sorted by id DESC
  - [ ] Non-admin gets 403

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Admin lists all users with roles
    Steps:
      1. curl -s -X GET http://localhost:3000/api/admin/users \
         -H "Authorization: Bearer {admin_jwt}"
      2. Assert response.ok === true
      3. Assert response.data[0] has { id, email, name, roleId }
      4. Assert response.data[0].role has { id, name }
      5. Assert no password field in response
    Expected Result: { ok: true, data: [users with roles] }
    Evidence: .sisyphus/evidence/task-3-users.json

  Scenario: Verify users are sorted by id DESC
    Steps:
      1. Get all users response
      2. Extract ids: [id1, id2, id3, ...]
      3. Assert ids are in descending order
    Expected Result: Latest users first
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(user): add user module with GET /api/admin/users endpoint`

---

### WAVE 3: Purchase & Loan Modules (Sequential)

- [ ] 4. Implement Purchase Module (GET /api/purchases)

  **What to do**:
  - Create directory: `src/modules/purchase/`
  - Create entity: `src/modules/purchase/domain/entity/purchase.entity.ts`
    - Type: `PurchaseEntity = { id, userId, bookId, price, date, createdAt, updatedAt }`
    - Include relations: user?, book? (with price as number, not Decimal)
  - Create interface: `src/modules/purchase/domain/interface/purchase.repository.ts`
    - Methods: `getByUserId(userId: number): Promise<PurchaseEntity[]>`
  - Create repository impl: `src/modules/purchase/infrastructure/repository/purchase.repository-impl.ts`
    - Use Prisma: `this.prisma.purchase.findMany({ where: { userId }, include: { book: true, user: true }, orderBy: { date: 'desc' } })`
    - Convert price Decimal to number
  - Create use case: `src/modules/purchase/application/use-case/get-purchases-by-user.usecase.ts`
  - Create service: `src/modules/purchase/application/service/purchase.service.ts`
  - Create routes: `src/modules/purchase/infrastructure/http/routes.ts`
    - Route: `GET /` (relative to /api/purchases)
    - Query param: `userId` (required)
    - Auth: requireAuth, verify self OR admin
    - Response: `{ ok: true, data: [...] }`
  - Update container & routes

  **Must NOT do**:
  - Don't allow user to see other users' purchases
  - Don't expose sensitive data
  - Don't use raw SQL

  **Recommended Agent Profile**:
  > Standard CRUD with user authorization checks.
  - **Category**: `quick`
    - Reason: Follows Book module pattern + simple query
  - **Skills**: [`git-master`]
  
  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential in Wave 3)
  - **Blocks**: None (independent after Wave 2)
  - **Blocked By**: Tasks 1 (JWT), 2-3 (User module for auth checks)

  **References**:
  - Book module: `src/modules/book/infrastructure/repository/book.repository-impl.ts` (Decimal handling)
  - Prisma Purchase model: `schema.prisma:92-105`

  **Acceptance Criteria**:
  - [ ] curl -X GET http://localhost:3000/api/purchases?userId=1 -H "Authorization: Bearer {user1_jwt}" → 200, returns purchases
  - [ ] User 1 cannot access User 2's purchases (403 or 401)
  - [ ] Admin can access any user's purchases
  - [ ] Price field is number (not Decimal)
  - [ ] Response includes book.title, book.author

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: User views own purchases
    Steps:
      1. Create test JWT for user with id=1
      2. curl -s -X GET "http://localhost:3000/api/purchases?userId=1" \
         -H "Authorization: Bearer {jwt_1}"
      3. Assert response.ok === true
      4. Assert all items have bookId, price, date
      5. Assert response.data[0].book has { title, author }
    Expected Result: { ok: true, data: [purchases] }
    Evidence: .sisyphus/evidence/task-4-purchases-own.json

  Scenario: User cannot access other user's purchases
    Steps:
      1. Create JWT for user 1
      2. curl -s -w "\n%{http_code}" "http://localhost:3000/api/purchases?userId=2" \
         -H "Authorization: Bearer {jwt_1}"
      3. Assert HTTP status is 403
      4. Assert response.error contains "authorized"
    Expected Result: 403 Forbidden
    Evidence: Command output

  Scenario: Admin views any user's purchases
    Steps:
      1. Create JWT for admin
      2. curl -s "http://localhost:3000/api/purchases?userId=1" \
         -H "Authorization: Bearer {admin_jwt}"
      3. Assert response.ok === true
      4. Assert purchases returned
    Expected Result: 200 with data
    Evidence: .sisyphus/evidence/task-4-purchases-admin.json
  ```

  **Commit**: YES
  - Message: `feat(purchase): add purchase module with GET /api/purchases endpoint`

---

- [ ] 5. Implement Loan Module (GET /api/admin/loans with search)

  **What to do**:
  - Create directory: `src/modules/loan/`
  - Create entity: `src/modules/loan/domain/entity/loan.entity.ts`
    - Type: `LoanEntity = { id, userId, bookId, loanDate, dueDate, returnedDate, status, extensions, createdAt, updatedAt }`
    - Include relations: user?, book?
  - Create interface: `src/modules/loan/domain/interface/loan.repository.ts`
    - Methods: `getAll(searchQuery?: string): Promise<LoanEntity[]>`
  - Create repository impl: `src/modules/loan/infrastructure/repository/loan.repository-impl.ts`
    - Use Prisma with search: If searchQuery, filter by user name or email (ILIKE)
    - Query: `{ where: { OR: [{ user: { name: { search: ... } } }, { user: { email: { search: ... } } }] } }`
    - Fallback: `{ where: { OR: [{ user: { name: { contains: query, mode: 'insensitive' } } }, { user: { email: { contains: query, mode: 'insensitive' } } }] } }`
  - Create use case: `src/modules/loan/application/use-case/get-all-loans.usecase.ts`
  - Create service: `src/modules/loan/application/service/loan.service.ts`
  - Create routes: `src/modules/loan/infrastructure/http/routes.ts`
    - Route: `GET /` (relative to /api/admin/loans)
    - Query param: `q` (optional, for search)
    - Auth: requireAuth + requireAdmin
    - Response: `{ ok: true, data: [...] }`
  - Update container & routes

  **Must NOT do**:
  - Don't allow non-admin access
  - Don't use raw SQL
  - Don't return passwords or sensitive data

  **Recommended Agent Profile**:
  > Requires search/filter logic with Prisma advanced queries.
  - **Category**: `ultrabrain`
    - Reason: Complex Prisma search with ILIKE/contains, need to handle search properly
  - **Skills**: [`git-master`]
  
  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential)
  - **Blocks**: None
  - **Blocked By**: Tasks 1-3 (JWT + User for auth)

  **References**:
  - Prisma advanced queries: `https://www.prisma.io/docs/orm/reference/prisma-client-reference#filter-conditions-and-operators`
  - Loan model: `schema.prisma:74-89`

  **Acceptance Criteria**:
  - [ ] curl -X GET http://localhost:3000/api/admin/loans -H "Authorization: Bearer {admin_jwt}" → 200, all loans
  - [ ] curl -X GET "http://localhost:3000/api/admin/loans?q=john" → searches by user name/email
  - [ ] Search is case-insensitive
  - [ ] Loans include user { id, name, email } and book { id, title, author }
  - [ ] Non-admin gets 403
  - [ ] Response sorted by id DESC

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Admin views all loans without search
    Steps:
      1. curl -s -X GET http://localhost:3000/api/admin/loans \
         -H "Authorization: Bearer {admin_jwt}"
      2. Assert response.ok === true
      3. Assert response.data is Array
      4. Verify first item has { id, status, loanDate, dueDate, user {...}, book {...} }
    Expected Result: { ok: true, data: [loans] }
    Evidence: .sisyphus/evidence/task-5-loans-all.json

  Scenario: Search loans by user name (case-insensitive)
    Steps:
      1. Insert test user with name="John Doe" into database
      2. Insert test loan for that user
      3. curl -s -X GET "http://localhost:3000/api/admin/loans?q=john" \
         -H "Authorization: Bearer {admin_jwt}"
      4. Assert response.data includes loan for John Doe
      5. Assert response.data does NOT include loans from other users
    Expected Result: Filtered loans containing user "john"
    Evidence: .sisyphus/evidence/task-5-loans-search.json

  Scenario: Search loans by user email
    Steps:
      1. curl -s -X GET "http://localhost:3000/api/admin/loans?q=john@example.com" \
         -H "Authorization: Bearer {admin_jwt}"
      2. Assert matching loans returned
    Expected Result: Loans for user with that email
    Evidence: .sisyphus/evidence/task-5-loans-email-search.json

  Scenario: Non-admin cannot access loans
    Steps:
      1. Create user JWT
      2. curl -s -w "\n%{http_code}" -X GET http://localhost:3000/api/admin/loans \
         -H "Authorization: Bearer {user_jwt}"
      3. Assert HTTP status is 403
    Expected Result: 403 Forbidden
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(loan): add loan module with GET /api/admin/loans endpoint (search supported)`

---

### WAVE 4: Covers Utility (Can parallel with Wave 3)

- [ ] 6. Implement Covers Utility (GET /api/covers)

  **What to do**:
  - Create shared utility: `src/shared/utils/covers.ts`
    - Function: `listAvailableCovers(): Promise<string[]>`
    - Logic: Read files from `frontend/public/src/assets/images`
    - Filter: .jpg, .jpeg, .png, .webp, .gif only
    - Sort alphabetically
    - Handle missing directory gracefully → return empty array
  - Create route handler: `src/shared/http/routes.ts` (update createApiRoutes)
    - Route: `GET /api/covers`
    - Auth: NOT required (public endpoint)
    - Response: `{ ok: true, data: ["file1.jpg", "file2.png", ...] }`

  **Must NOT do**:
  - Don't return hidden files
  - Don't list directories
  - Don't allow directory traversal attacks
  - Don't serve actual image files (just list filenames)

  **Recommended Agent Profile**:
  > Simple filesystem utility, no database involved.
  - **Category**: `quick`
    - Reason: Pure file listing utility, straightforward logic
  - **Skills**: [`git-master`]
  
  **Parallelization**:
  - **Can Run In Parallel**: YES (independent utility)
  - **Parallel Group**: Can run during Wave 3
  - **Blocks**: None
  - **Blocked By**: None (no auth required)

  **References**:
  - Old implementation: `server.js:906-931` (logic reference)
  - File handling: `fs.readdir` in Node.js

  **Acceptance Criteria**:
  - [ ] curl -X GET http://localhost:3000/api/covers → 200 with `{ ok: true, data: [...] }`
  - [ ] Only image files returned (jpg, jpeg, png, webp, gif)
  - [ ] Filenames sorted alphabetically
  - [ ] Empty array if directory doesn't exist
  - [ ] No authentication required

  **Agent-Executed QA Scenarios**:
  ```
  Scenario: Get list of available covers (public endpoint)
    Steps:
      1. curl -s -X GET http://localhost:3000/api/covers
      2. Assert response.ok === true
      3. Assert response.data is Array
      4. If array not empty:
         - Assert all items end with .jpg, .jpeg, .png, .webp, or .gif
         - Verify alphabetical sort (file1.jpg < file2.jpg)
    Expected Result: { ok: true, data: ["cover1.jpg", "cover2.png", ...] }
    Evidence: .sisyphus/evidence/task-6-covers.json

  Scenario: Missing covers directory returns empty array
    Steps:
      1. Temporarily rename covers directory (if needed for test)
      2. curl -s -X GET http://localhost:3000/api/covers
      3. Assert response.ok === true
      4. Assert response.data === []
    Expected Result: { ok: true, data: [] }
    Evidence: Command output
  ```

  **Commit**: YES
  - Message: `feat(covers): add GET /api/covers endpoint for book cover listing`

---

### WAVE 5: Enhanced & Optional Features

- [ ] 7. Implement Cart Module (GET /api/cart)

  **What to do**:
  - Create directory: `src/modules/cart/`
  - Create entity: `src/modules/cart/domain/entity/cart-item.entity.ts`
    - Type: `CartItemEntity = { userId, bookId, quantity, book: BookEntity, createdAt, updatedAt }`
  - Create interface: `src/modules/cart/domain/interface/cart.repository.ts`
    - Methods: `getByUserId(userId: number): Promise<CartItemEntity[]>`
  - Create repository impl: Uses Prisma `cartItems` query with book relation
  - Create use case & service
  - Create routes: `GET /` with `userId` query param
    - Auth: verify self OR admin
  - Similar pattern to Purchase module

  **Acceptance Criteria**:
  - [ ] User can get own cart items
  - [ ] Admin can get any user's cart
  - [ ] Response includes book { title, price, purchaseStock }
  - [ ] Cart items sorted by createdAt DESC

  **Commit**: YES (if completed)

---

- [ ] 8. Enhance Book Module (Admin filter)

  **What to do**:
  - Update existing `GET /api/admin/books` route
  - Currently uses same query as public endpoint
  - Should return ALL books (including unavailable ones)
  - Verify admin-only access
  - Response format: `{ ok: true, data: [...] }`

  **Current vs New**:
  ```javascript
  // Old: no admin route, only public list
  // New: separate /admin/books that shows ALL books
  ```

  **Acceptance Criteria**:
  - [ ] Admin gets ALL books
  - [ ] Public endpoint still filters to available only
  - [ ] Admin-only access enforced

  **Commit**: YES (if completed)

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `feat(auth): implement JWT middleware for protected routes` | `src/shared/middleware/jwt.ts` | `pnpm test && pnpm lint` |
| 2 | `feat(category): add category module with GET /api/admin/categories` | `src/modules/category/**` | `pnpm test && pnpm lint` |
| 3 | `feat(user): add user module with GET /api/admin/users` | `src/modules/user/**` | `pnpm test && pnpm lint` |
| 4 | `feat(purchase): add purchase module with GET /api/purchases` | `src/modules/purchase/**` | `pnpm test && pnpm lint` |
| 5 | `feat(loan): add loan module with GET /api/admin/loans (search)` | `src/modules/loan/**` | `pnpm test && pnpm lint` |
| 6 | `feat(covers): add GET /api/covers endpoint for cover listing` | `src/shared/utils/covers.ts` | `pnpm test && pnpm lint` |
| 7 | `feat(cart): add cart module with GET /api/cart` | `src/modules/cart/**` | `pnpm test && pnpm lint` |
| 8 | `refactor(book): add admin filter to GET /api/admin/books` | `src/modules/book/**` | `pnpm test && pnpm lint` |

---

## Success Criteria

### Verification Commands
```bash
# Type checking (CRITICAL)
pnpm --filter @tu-gestion-amiga/backend type-check

# Linting (code quality)
pnpm --filter @tu-gestion-amiga/backend lint

# Tests (TDD verification)
pnpm --filter @tu-gestion-amiga/backend test

# Build (catch any issues)
pnpm --filter @tu-gestion-amiga/backend build

# Run dev server (integration test)
pnpm --filter @tu-gestion-amiga/backend dev
# Then manually verify endpoints with curl/Postman
```

### Final Checklist
- ✅ All 10 GET routes functional
- ✅ All 8 new modules created with clean architecture
- ✅ JWT middleware protecting admin routes
- ✅ Role-based access control working
- ✅ All responses wrapped: `{ ok: true, data: X }`
- ✅ Zero `any` types in TypeScript
- ✅ No raw SQL (Prisma only)
- ✅ All code in English
- ✅ Error handling with ApiError class
- ✅ HTTP status codes correct
- ✅ Tests passing (TDD)
- ✅ Linting passing
- ✅ Type checking passing
- ✅ Build successful

---

## Timeline

**Estimated Effort**:
- Task 1 (JWT): 30-45 min
- Task 2 (Category): 20-30 min
- Task 3 (User): 20-30 min
- Task 4 (Purchase): 25-35 min
- Task 5 (Loan): 35-45 min (search complexity)
- Task 6 (Covers): 15-20 min
- Task 7 (Cart): 25-35 min (optional)
- Task 8 (Book): 10-15 min

**Total**: 180-245 minutes (~3-4 hours) with parallel execution

**Parallelization Benefit**: ~40% speedup by running Tasks 2-3 and 6 in parallel

