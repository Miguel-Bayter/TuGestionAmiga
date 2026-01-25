# Frontend Architecture Refactor: Module-Based + Infrastructure/UI Separation

## Context

### Original Request

Validar si la arquitectura frontend es "screaming" viable. Si no, crear un plan para corregirla.

### Interview Summary

- User discovered that React components should be in **infrastructure layer** (external framework)
- Current structure mixes React in presentation layer
- Backend uses module-based architecture successfully
- Goal: Apply same pattern to frontend for consistency + framework independence

### Key Decision

Components = Infrastructure (not Presentation). This allows:

- React → Vue.js migration without touching business logic
- Framework independence
- True clean architecture

---

## Work Objectives

### Core Objective

Refactor frontend from feature-based presentation layer to module-based architecture with proper Clean Architecture separation. React components will be properly placed in infrastructure/ui layer, making the codebase framework-agnostic and maintainable for 5+ years.

### Concrete Deliverables

- ✅ Module-based directory structure (matching backend)
- ✅ Infrastructure/UI separation (React components in infrastructure/)
- ✅ No entity duplication (one book.entity.ts)
- ✅ Barrel exports for clean imports
- ✅ All imports updated to @/modules/ paths
- ✅ Verified @/ alias working correctly
- ✅ Zero import errors
- ✅ Type checking passes

### Definition of Done

```bash
pnpm type-check     # No TypeScript errors
pnpm lint           # No ESLint errors
pnpm dev            # App runs without errors
```

### Must Have

- Module-based structure: `src/modules/{feature}/`
- Infrastructure/UI separation: `modules/{feature}/infrastructure/ui/`
- Barrel exports: `modules/{feature}/index.ts`
- All components moved to infrastructure/ui/
- Entity consolidation (no duplicates)
- All imports use @/modules/ paths
- Proper dependency direction: domain ← app ← infrastructure

### Must NOT Have (Guardrails)

- ❌ React imports in domain/ layer
- ❌ Business logic in components (stay in use cases/services)
- ❌ Duplicate entities
- ❌ Relative imports instead of @/ aliases
- ❌ Presentation/ folder (replaced with infrastructure/ui)
- ❌ Feature-scattered imports (@/domain, @/data, @/presentation)
- ❌ Importing from infrastructure/ui/ into domain/application

---

## Architecture Diagram

### Current (Wrong)

```
src/
├── domain/         ← Entities scattered here
├── data/           ← Repositories scattered here
├── presentation/   ← React components here (WRONG)
└── shared/
```

### Target (Correct)

```
src/modules/
├── auth/
│   ├── domain/           ← Entity: User
│   ├── application/       ← Use Cases: Login, Register, etc
│   ├── infrastructure/
│   │   ├── http/         ← API route constants
│   │   ├── repository/   ← Auth repository implementation (uses Axios)
│   │   ├── schema/       ← Zod validation
│   │   └── ui/           ← React components (infrastructure!)
│   │       ├── pages/login.page.tsx
│   │       ├── components/require-auth.tsx
│   │       ├── hooks/use-auth-form.hook.ts
│   │       └── stores/use-auth.store.ts
│   └── __tests__/
│
├── books/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   │   ├── http/
│   │   ├── repository/
│   │   ├── schema/
│   │   └── ui/
│   │       ├── pages/books.page.tsx
│   │       ├── components/book-card.tsx, book-details-modal.tsx
│   │       ├── hooks/use-book-filter.hook.ts
│   │       └── stores/use-book.store.ts
│   └── __tests__/
│
├── cart/, loans/, user/, dashboard/  ← Same structure
│
└── shared/
    ├── config/
    ├── types/
    ├── helpers/
    ├── hooks/ (global: use-toast, use-container)
    ├── stores/ (global: use-toast)
    └── infrastructure/
        ├── ui/ (Layout, Navbar, Sidebar, Toast)
        ├── provider/ (Axios, TokenManager)
        └── index.ts
```

---

## Task Flow & Dependencies

### Dependency Graph

```
Phase 1: Create Module Structure
    ↓
Phase 2: Move Domain + Application layers
    ↓
Phase 3: Move Infrastructure (HTTP, Repository, Schema)
    ↓
Phase 4: Move Infrastructure/UI (React components)
    ↓
Phase 5: Update All Imports + Add Barrel Exports
    ↓
Phase 6: Verification (Type Check, Lint, Run)
```

### Parallelization Groups

| Group | Modules | Notes |
|-------|---------|-------|
| Phase 1 | Create all module folders | Can run once |
| Phase 2 | auth, books, cart, loans, user, dashboard | Independent |
| Phase 3 | auth, books, cart, loans, user, dashboard | Independent |
| Phase 4 | auth, books, cart, loans, user, dashboard | Independent |
| Phase 5 | All modules together | Must be sequential (global imports) |
| Phase 6 | One verification | Final check |

---

## TODOs

### Phase 1: Create Module Directory Structure

- [ ] 1.0 Create base module folders
  
  **What to do**:
  - Create `src/modules/` directory (parent)
  - Create subdirectories for each feature:
    - `src/modules/auth/`
    - `src/modules/books/`
    - `src/modules/cart/`
    - `src/modules/loans/`
    - `src/modules/user/`
    - `src/modules/dashboard/`
  
  **Must NOT do**:
  - Don't move files yet, only create folders
  - Don't delete old directories
  
  **References**:
  - Backend pattern: `apps/backend/src/modules/auth/` structure
  - Each module will have: domain/, application/, infrastructure/, **tests**/

  **Acceptance Criteria**:
  - [ ] Folder structure created: `ls -R src/modules/` shows all 6 module folders
  - [ ] Each module has placeholder folders visible

  **Commit**: YES
  - Message: `refactor(frontend): create module directory structure`
  - Files: (no actual .ts files yet)

---

- [ ] 1.1 Create domain layer folders in each module
  
  **What to do**:

  ```
  modules/auth/domain/entity/
  modules/auth/domain/repository/
  modules/books/domain/entity/
  modules/books/domain/repository/
  (... repeat for all modules)
  ```

  **Must NOT do**:
  - Don't move files yet
  - Don't create index.ts files

  **References**:
  - Backend pattern: `apps/backend/src/modules/book/domain/entity/book.entity.ts`
  - Pattern: `domain/entity/` contains TypeScript types/entities
  - Pattern: `domain/repository/` contains only interfaces (no implementations)

  **Acceptance Criteria**:
  - [ ] All modules have domain/entity/ folder
  - [ ] All modules have domain/repository/ folder
  - [ ] `find src/modules -type d -name domain` shows 6 directories

  **Commit**: YES (group with 1.2)

---

- [ ] 1.2 Create application + infrastructure layer folders in each module
  
  **What to do**:

  ```
  modules/auth/application/use-case/
  modules/auth/application/service/
  modules/auth/infrastructure/http/
  modules/auth/infrastructure/repository/
  modules/auth/infrastructure/schema/
  modules/auth/infrastructure/ui/
  modules/auth/infrastructure/ui/pages/
  modules/auth/infrastructure/ui/components/
  modules/auth/infrastructure/ui/hooks/
  modules/auth/infrastructure/ui/stores/
  (... repeat for all modules)
  ```

  **Must NOT do**:
  - Don't create index.ts yet

  **References**:
  - Backend pattern: `apps/backend/src/modules/auth/application/use-case/login.usecase.ts`
  - `ui/` is where React components go (not presentation/)
  - Keep folder structure flat: no `ui/src/` or extra nesting

  **Acceptance Criteria**:
  - [ ] All modules have application/ folder
  - [ ] All modules have infrastructure/ folder with http/, repository/, schema/, ui/
  - [ ] All modules have infrastructure/ui/ with pages/, components/, hooks/, stores/
  - [ ] `find src/modules -type d -name "ui"` shows 6 directories

  **Commit**: YES
  - Message: `refactor(frontend): create application and infrastructure folders`
  - Files: (no .ts files)

---

- [ ] 1.3 Create test infrastructure folders
  
  **What to do**:

  ```
  modules/auth/__tests__/unit/
  modules/books/__tests__/unit/
  (... repeat for all modules)
  ```

  **Must NOT do**:
  - Don't create test files yet

  **References**:
  - Backend pattern: `apps/backend/src/modules/book/__tests__/unit/get-all-books.usecase.test.ts`
  - Folder structure: **tests**/unit/ (we can add e2e/ later)

  **Acceptance Criteria**:
  - [ ] All modules have **tests**/unit/ folder
  - [ ] `find src/modules -type d -name "__tests__"` shows 6 directories

  **Commit**: NO (combine with next phase)

---

### Phase 2: Move Domain Layer Files

- [ ] 2.0 Move entity files to module domain/entity/
  
  **What to do**:
  - Move `src/domain/Entity/user.entity.ts` → `src/modules/auth/domain/entity/user.entity.ts`
  - Move `src/domain/Entity/book.entity.ts` → `src/modules/books/domain/entity/book.entity.ts` (DELETE the nested `domain/Entity/Book/` folder entirely)
  - Move `src/domain/Entity/cart.entity.ts` → `src/modules/cart/domain/entity/cart.entity.ts`
  - Move `src/domain/Entity/loan.entity.ts` → `src/modules/loans/domain/entity/loan.entity.ts`
  
  **Must NOT do**:
  - Don't keep old domain/Entity/ files (DELETE after moving)
  - Don't modify entity content, only move
  - Ensure only ONE book.entity.ts exists (consolidate if duplicates)

  **References**:
  - Entity format: `export type UserEntity = { id: number; ... }`
  - Backend pattern: `apps/backend/src/modules/auth/domain/entity/auth.entity.ts`
  - Check: Are there any book entities with different content? If yes, merge into one.

  **Acceptance Criteria**:
  - [ ] `modules/auth/domain/entity/user.entity.ts` exists
  - [ ] `modules/books/domain/entity/book.entity.ts` exists (ONLY ONE)
  - [ ] `modules/cart/domain/entity/cart.entity.ts` exists
  - [ ] `modules/loans/domain/entity/loan.entity.ts` exists
  - [ ] Old `src/domain/Entity/` folder is DELETED
  - [ ] Old `src/domain/Entity/Book/` folder is DELETED
  - [ ] No duplicate entities remain

  **Parallelizable**: YES (with 2.1, 2.2)

  **Commit**: YES (per module = 4 commits for auth, books, cart, loans)
  - Message: `refactor(auth): move user entity to module domain layer`
  - Message: `refactor(books): move book entity to module domain layer`
  - etc.

---

- [ ] 2.1 Move repository interfaces to module domain/repository/
  
  **What to do**:
  - Move `src/domain/Repository/auth.repository.ts` → `src/modules/auth/domain/repository/auth.repository.ts`
  - Move `src/domain/Repository/book.repository.ts` → `src/modules/books/domain/repository/book.repository.ts`
  - Move `src/domain/Repository/cart.repository.ts` → `src/modules/cart/domain/repository/cart.repository.ts`
  - Move `src/domain/Repository/loan.repository.ts` → `src/modules/loans/domain/repository/loan.repository.ts`
  
  **Must NOT do**:
  - Don't move repository IMPLEMENTATIONS (they go to infrastructure/)
  - Only move INTERFACES (IAuthRepository, IBookRepository, etc)
  - Don't modify interface content

  **References**:
  - Interface format: `export interface IAuthRepository { login(...): Promise<...> }`
  - Backend pattern: `apps/backend/src/modules/auth/domain/interface/auth.repository.ts`
  - Note: Backend uses `interface/` folder name, we can use `repository/` (preference)

  **Acceptance Criteria**:
  - [ ] `modules/auth/domain/repository/auth.repository.ts` contains IAuthRepository interface
  - [ ] `modules/books/domain/repository/book.repository.ts` contains IBookRepository interface
  - [ ] Old `src/domain/Repository/` folder is DELETED
  - [ ] All interfaces are export interface (not classes)

  **Parallelizable**: YES (with 2.0, 2.2)

  **Commit**: YES (per module)
  - Message: `refactor(auth): move repository interface to module domain layer`
  - Message: `refactor(books): move repository interface to module domain layer`

---

- [ ] 2.2 Create index.ts barrel export in each domain folder
  
  **What to do**:

  ```typescript
  // src/modules/auth/domain/index.ts
  export type { UserEntity } from './entity/user.entity'
  export type { IAuthRepository } from './repository/auth.repository'
  
  // src/modules/books/domain/index.ts
  export type { BookEntity } from './entity/book.entity'
  export type { IBookRepository } from './repository/book.repository'
  ```

  **Must NOT do**:
  - Don't export implementations (only types/interfaces)
  - Don't export index.ts itself

  **References**:
  - Pattern: `export type { ... }` not `export { ... }` (type-only exports)
  - Enables: `import type { UserEntity } from '@/modules/auth/domain'`

  **Acceptance Criteria**:
  - [ ] `modules/auth/domain/index.ts` exports UserEntity and IAuthRepository
  - [ ] `modules/books/domain/index.ts` exports BookEntity and IBookRepository
  - [ ] All domain index files use `export type`
  - [ ] No circular imports

  **Parallelizable**: YES (with 2.0, 2.1)

  **Commit**: NO (combine with 2.1)

---

### Phase 3: Move Application Layer Files

- [ ] 3.0 Move use case files to module application/use-case/
  
  **What to do**:
  - Move all files from `src/domain/UseCase/auth/` → `src/modules/auth/application/use-case/`
    - login.usecase.ts
    - register.usecase.ts
    - logout.usecase.ts
    - get-profile.usecase.ts
  - Move all files from `src/domain/UseCase/book/` → `src/modules/books/application/use-case/`
  - Move all files from `src/domain/UseCase/cart/` → `src/modules/cart/application/use-case/`
  - Move all files from `src/domain/UseCase/loan/` → `src/modules/loans/application/use-case/`
  - Move all files from `src/domain/UseCase/user/` → `src/modules/user/application/use-case/`
  
  **Must NOT do**:
  - Don't modify use case content
  - Don't delete old files until after import updates
  - Don't create implementations here (use cases are contracts, not implementations)

  **References**:
  - Use case format: `export class LoginUseCase { constructor(repo: IAuthRepository) { ... } }`
  - Backend pattern: `apps/backend/src/modules/auth/application/use-case/login.usecase.ts`
  - Each use case takes repository as constructor dependency

  **Acceptance Criteria**:
  - [ ] `modules/auth/application/use-case/login.usecase.ts` exists
  - [ ] `modules/books/application/use-case/get-books.usecase.ts` exists
  - [ ] All use cases are classes with constructor dependency injection
  - [ ] Old `src/domain/UseCase/` folder is DELETED

  **Parallelizable**: YES (with 3.1, 3.2)

  **Commit**: YES (per module = 5 commits for auth, books, cart, loans, user)
  - Message: `refactor(auth): move use cases to module application layer`

---

- [ ] 3.1 Create index.ts barrel export in each application/use-case folder
  
  **What to do**:

  ```typescript
  // src/modules/auth/application/use-case/index.ts
  export { LoginUseCase } from './login.usecase'
  export { RegisterUseCase } from './register.usecase'
  export { LogoutUseCase } from './logout.usecase'
  export { GetProfileUseCase } from './get-profile.usecase'
  
  // src/modules/books/application/use-case/index.ts
  export { GetBooksUseCase } from './get-books.usecase'
  export { GetBookUseCase } from './get-book.usecase'
  // ... etc
  ```

  **Must NOT do**:
  - Don't use `export type` (these are classes, not types)

  **References**:
  - Enables clean imports: `import { LoginUseCase } from '@/modules/auth/application/use-case'`

  **Acceptance Criteria**:
  - [ ] All use-case index files export their use case classes
  - [ ] Can import: `import { LoginUseCase } from '@/modules/auth/application/use-case'`

  **Parallelizable**: YES (with 3.0, 3.2)

  **Commit**: NO (combine with 3.2)

---

- [ ] 3.2 Create application/index.ts barrel export (optional but recommended)
  
  **What to do**:

  ```typescript
  // src/modules/auth/application/index.ts
  export * from './use-case'
  // Can also export service if exists:
  export { AuthService } from './service/auth.service'
  ```

  **References**:
  - Enables: `import { LoginUseCase } from '@/modules/auth/application'`

  **Acceptance Criteria**:
  - [ ] application/index.ts re-exports use-case

  **Parallelizable**: YES (with 3.0, 3.1)

  **Commit**: NO (combine with 3.1)

---

### Phase 4: Move Infrastructure Layer (HTTP, Repository, Schema)

- [ ] 4.0 Move repository implementation files to infrastructure/repository/
  
  **What to do**:
  - Move `src/data/Repository/auth.repository-impl.ts` → `src/modules/auth/infrastructure/repository/auth.repository-impl.ts`
  - Move `src/data/Repository/book.repository-impl.ts` → `src/modules/books/infrastructure/repository/book.repository-impl.ts`
  - Move `src/data/Repository/cart.repository-impl.ts` → `src/modules/cart/infrastructure/repository/cart.repository-impl.ts`
  - Move `src/data/Repository/loan.repository-impl.ts` → `src/modules/loans/infrastructure/repository/loan.repository-impl.ts`
  
  **Must NOT do**:
  - Don't modify implementation content (only move)
  - Don't delete old files yet

  **References**:
  - Implementation format: `export class AuthRepository implements IAuthRepository { ... }`
  - Backend pattern: `apps/backend/src/modules/auth/infrastructure/repository/auth.repository-impl.ts`
  - Implementation uses concrete dependencies (axPrivate, TokenManager, etc)

  **Acceptance Criteria**:
  - [ ] `modules/auth/infrastructure/repository/auth.repository-impl.ts` exists and implements IAuthRepository
  - [ ] All repository implementations follow pattern: `class XRepository implements IXRepository`
  - [ ] Old `src/data/Repository/` folder is DELETED

  **Parallelizable**: YES (with 4.1, 4.2)

  **Commit**: YES (per module = 4 commits)
  - Message: `refactor(auth): move repository implementation to infrastructure layer`

---

- [ ] 4.1 Move schema files to infrastructure/schema/
  
  **What to do**:
  - Move `src/data/Schema/auth.schema.ts` → `src/modules/auth/infrastructure/schema/auth.schema.ts`
  - Move `src/data/Schema/book.schema.ts` → `src/modules/books/infrastructure/schema/book.schema.ts`
  - Move `src/data/Schema/cart.schema.ts` → `src/modules/cart/infrastructure/schema/cart.schema.ts`
  - Move `src/data/Schema/loan.schema.ts` → `src/modules/loans/infrastructure/schema/loan.schema.ts`
  - Move `src/data/Schema/user.schema.ts` → `src/modules/user/infrastructure/schema/user.schema.ts`
  
  **Must NOT do**:
  - Don't modify schema content
  - Don't move shared validation utilities to module-specific (they belong in shared/)

  **References**:
  - Schema format: `export const authSchema = z.object({ email: z.string(), ... })`
  - Zod is an external validation library = infrastructure

  **Acceptance Criteria**:
  - [ ] All schemas moved to their respective module/infrastructure/schema/
  - [ ] Old `src/data/Schema/` folder is DELETED

  **Parallelizable**: YES (with 4.0, 4.2)

  **Commit**: NO (combine with 4.2)

---

- [ ] 4.2 Create infrastructure/index.ts barrel exports
  
  **What to do**:

  ```typescript
  // src/modules/auth/infrastructure/index.ts
  export * from './repository'
  export * from './schema'
  // Optional:
  export * from './http'
  export * from './ui'
  ```

  **References**:
  - Enables: `import { AuthRepository } from '@/modules/auth/infrastructure'`

  **Acceptance Criteria**:
  - [ ] infrastructure/index.ts exports all sub-folders

  **Parallelizable**: YES (with 4.0, 4.1)

  **Commit**: YES
  - Message: `refactor(auth,books,cart,loans,user): move infrastructure layer and add barrel exports`

---

### Phase 5: Move Infrastructure/UI Layer (React Components)

- [ ] 5.0 Move auth UI components
  
  **What to do**:
  - Move `src/presentation/features/auth/pages/login.page.tsx` → `src/modules/auth/infrastructure/ui/pages/login.page.tsx`
  - Move `src/presentation/features/auth/pages/register.page.tsx` → `src/modules/auth/infrastructure/ui/pages/register.page.tsx`
  - Move `src/presentation/features/auth/components/require-auth.tsx` → `src/modules/auth/infrastructure/ui/components/require-auth.tsx`
  - Move `src/presentation/features/auth/components/require-admin.tsx` → `src/modules/auth/infrastructure/ui/components/require-admin.tsx`
  
  **Must NOT do**:
  - Don't modify component logic yet (only move)
  - Don't delete old files yet
  - React imports stay in components (that's correct)

  **References**:
  - Components are React (external framework) = infrastructure
  - Pattern: `export function LoginPage() { ... }`
  - Backend analogy: Controllers are infrastructure (Axios is infrastructure)

  **Acceptance Criteria**:
  - [ ] `modules/auth/infrastructure/ui/pages/login.page.tsx` exists
  - [ ] `modules/auth/infrastructure/ui/components/require-auth.tsx` exists
  - [ ] All React imports are present (@react, react-router-dom, etc)

  **Parallelizable**: YES (but wait until imports are updated)

  **Commit**: YES (per module UI = 6 commits for auth, books, cart, loans, user, dashboard)
  - Message: `refactor(auth): move UI components to infrastructure layer`

---

- [ ] 5.1 Move books UI components
  
  **What to do**:
  - Move `src/presentation/features/books/pages/*.tsx` → `src/modules/books/infrastructure/ui/pages/`
  - Move `src/presentation/features/books/components/*.tsx` → `src/modules/books/infrastructure/ui/components/`
  
  **Acceptance Criteria**:
  - [ ] `modules/books/infrastructure/ui/components/book-card.tsx` exists
  - [ ] `modules/books/infrastructure/ui/components/book-details-modal.tsx` exists

  **Parallelizable**: YES (with other modules)

  **Commit**: YES (per module)
  - Message: `refactor(books): move UI components to infrastructure layer`

---

- [ ] 5.2 Move cart UI components
  
  **What to do**:
  - Move `src/presentation/features/cart/pages/cart.page.tsx` → `src/modules/cart/infrastructure/ui/pages/`
  
  **Acceptance Criteria**:
  - [ ] `modules/cart/infrastructure/ui/pages/cart.page.tsx` exists

  **Parallelizable**: YES

  **Commit**: YES
  - Message: `refactor(cart): move UI components to infrastructure layer`

---

- [ ] 5.3 Move loans UI components
  
  **What to do**:
  - Move `src/presentation/features/loans/pages/loans.page.tsx` → `src/modules/loans/infrastructure/ui/pages/`
  
  **Acceptance Criteria**:
  - [ ] `modules/loans/infrastructure/ui/pages/loans.page.tsx` exists

  **Parallelizable**: YES

  **Commit**: YES
  - Message: `refactor(loans): move UI components to infrastructure layer`

---

- [ ] 5.4 Move user UI components
  
  **What to do**:
  - Move `src/presentation/features/account/pages/account.page.tsx` → `src/modules/user/infrastructure/ui/pages/`
  
  **Acceptance Criteria**:
  - [ ] `modules/user/infrastructure/ui/pages/account.page.tsx` exists

  **Parallelizable**: YES

  **Commit**: YES
  - Message: `refactor(user): move UI components to infrastructure layer`

---

- [ ] 5.5 Move dashboard UI components
  
  **What to do**:
  - Move `src/presentation/features/dashboard/pages/dashboard.page.tsx` → `src/modules/dashboard/infrastructure/ui/pages/`
  - Move `src/presentation/features/admin/pages/admin.page.tsx` → `src/modules/dashboard/infrastructure/ui/pages/admin.page.tsx`
  - Move `src/presentation/features/help/pages/help.page.tsx` → `src/modules/dashboard/infrastructure/ui/pages/help.page.tsx`
  
  **Must NOT do**:
  - Don't mix admin/dashboard/help if they're separate features. If yes, create separate modules or clarify ownership

  **Acceptance Criteria**:
  - [ ] Dashboard pages moved to infrastructure/ui/pages/

  **Parallelizable**: YES

  **Commit**: YES
  - Message: `refactor(dashboard): move UI components to infrastructure layer`

---

- [ ] 5.6 Move global UI components to shared/infrastructure/ui/
  
  **What to do**:
  - Move `src/presentation/components/Layout.tsx` → `src/shared/infrastructure/ui/components/Layout.tsx`
  - Move `src/presentation/components/Navbar.tsx` → `src/shared/infrastructure/ui/components/Navbar.tsx`
  - Move `src/presentation/components/Sidebar.tsx` → `src/shared/infrastructure/ui/components/Sidebar.tsx`
  - Move `src/presentation/components/Toast.tsx` → `src/shared/infrastructure/ui/components/Toast.tsx`
  
  **Must NOT do**:
  - These are GLOBAL, not module-specific
  - Keep them in shared/, not modules/

  **References**:
  - Global components = used across multiple modules
  - Still infrastructure (React external framework)

  **Acceptance Criteria**:
  - [ ] `shared/infrastructure/ui/components/Layout.tsx` exists
  - [ ] All global UI components moved
  - [ ] Old `src/presentation/components/` folder is DELETED

  **Commit**: YES
  - Message: `refactor(shared): move global UI components to infrastructure layer`

---

- [ ] 5.7 Move module-specific hooks to infrastructure/ui/hooks/
  
  **What to do**:

  ```
  Find hooks in src/shared/hooks/ that are module-specific:
  - If hook is used only by auth module → src/modules/auth/infrastructure/ui/hooks/
  - If hook is used by multiple modules → stays in shared/hooks/
  - If hook is global (use-toast, use-container) → stays in shared/hooks/
  ```

  **Must NOT do**:
  - Don't move global hooks (use-toast, use-container) to modules
  - Only move if truly module-specific

  **References**:
  - Example: use-auth-form.hook.ts is auth-specific → move to auth module
  - Global hooks: use-toast.hook.ts (used everywhere) → stays in shared

  **Acceptance Criteria**:
  - [ ] Module-specific hooks moved
  - [ ] Global hooks remain in shared/hooks/
  - [ ] All hook imports still work

  **Parallelizable**: NO (depends on import updates)

  **Commit**: YES
  - Message: `refactor(modules): move module-specific hooks to infrastructure/ui`

---

- [ ] 5.8 Move module-specific stores to infrastructure/ui/stores/
  
  **What to do**:

  ```
  Find stores in src/shared/stores/ that are module-specific:
  - use-auth.store.ts → src/modules/auth/infrastructure/ui/stores/
  - use-book.store.ts → src/modules/books/infrastructure/ui/stores/
  - use-cart.store.ts → src/modules/cart/infrastructure/ui/stores/
  - use-loan.store.ts → src/modules/loans/infrastructure/ui/stores/
  - use-ui.store.ts → STAYS in shared (global UI state)
  - use-toast.store.ts → STAYS in shared (global UI state)
  ```

  **Must NOT do**:
  - Don't move global stores (use-toast, use-ui) to modules
  - These are cross-cutting concerns

  **References**:
  - Zustand stores in infrastructure/ui because React state management
  - Global stores = shared/ (UI state)
  - Module stores = module/infrastructure/ui/ (feature state)

  **Acceptance Criteria**:
  - [ ] use-auth.store.ts → modules/auth/infrastructure/ui/stores/
  - [ ] use-book.store.ts → modules/books/infrastructure/ui/stores/
  - [ ] Global stores (use-toast, use-ui) stay in shared/

  **Parallelizable**: NO (depends on import updates)

  **Commit**: YES
  - Message: `refactor(modules): move module-specific stores to infrastructure/ui`

---

- [ ] 5.9 Create infrastructure/ui/index.ts barrel exports for components
  
  **What to do**:

  ```typescript
  // src/modules/auth/infrastructure/ui/index.ts
  export { LoginPage } from './pages/login.page'
  export { RegisterPage } from './pages/register.page'
  export { RequireAuth } from './components/require-auth'
  export { RequireAdmin } from './components/require-admin'
  
  // src/shared/infrastructure/ui/index.ts
  export { Layout } from './components/Layout'
  export { Navbar } from './components/Navbar'
  export { Sidebar } from './components/Sidebar'
  export { Toast } from './components/Toast'
  ```

  **References**:
  - Enables clean imports: `import { LoginPage } from '@/modules/auth/infrastructure/ui'`

  **Acceptance Criteria**:
  - [ ] All module UI index files export components and pages
  - [ ] Global UI components exported from shared/infrastructure/ui/

  **Commit**: NO (combine with final import update)

---

### Phase 6: Update All Imports

- [ ] 6.0 Update imports in moved domain files
  
  **What to do**:
  Update any imports in entity/repository files:

  ```typescript
  // Before
  import { someType } from '@/domain/types'
  
  // After (if it's in shared types)
  import type { someType } from '@/shared/types'
  
  // Or (if it's now in same module)
  import type { SomeInterface } from '../repository/some.repository'
  ```

  **Must NOT do**:
  - Don't import from presentation (no longer exists)
  - Don't create circular imports (domain shouldn't know about infrastructure)

  **References**:
  - Domain layer should only import: types, other domain types, nothing from app/infra
  - Keep it pure

  **Acceptance Criteria**:
  - [ ] No imports from presentation/
  - [ ] No imports from infrastructure
  - [ ] All domain files use @/ paths

  **Parallelizable**: NO (sequential, one module at a time)

  **Commit**: NO (combine with next phase)

---

- [ ] 6.1 Update imports in use cases
  
  **What to do**:

  ```typescript
  // Before
  import type { IAuthRepository } from '@/domain/Repository/auth.repository'
  import type { LoginRequest } from '@/shared/types'
  
  // After
  import type { IAuthRepository } from '../domain/repository/auth.repository'
  // Or with barrel:
  import type { IAuthRepository } from '@/modules/auth/domain'
  ```

  **Must NOT do**:
  - Use cases should import: domain interfaces, types
  - Never import from infrastructure (dependencies flow IN, not out)

  **References**:
  - Use case takes repository as dependency (dependency injection)
  - Import interface from domain layer

  **Acceptance Criteria**:
  - [ ] Use cases import repository interfaces from domain
  - [ ] No infrastructure imports
  - [ ] TypeScript finds all types

  **Parallelizable**: NO

  **Commit**: NO (combine with 6.2)

---

- [ ] 6.2 Update imports in repository implementations
  
  **What to do**:

  ```typescript
  // Before
  import { API_ENDPOINTS } from '@/shared/config'
  import type { IAuthRepository } from '@/domain/Repository/auth.repository'
  import { axPrivate, axPublic, TokenManager } from '@/data/Provider'
  import { loginResponseSchema } from '@/data/Schema/auth.schema'
  
  // After
  import { API_ENDPOINTS } from '@/shared/config'
  import type { IAuthRepository } from '../domain'  // or full path
  import { axPrivate, axPublic, TokenManager } from '@/shared/infrastructure/provider'
  import { loginResponseSchema } from './auth.schema'  // same folder
  ```

  **Must NOT do**:
  - Don't import from domain entity directly (only interfaces)
  - Don't create circular imports

  **References**:
  - Repository implementation depends on: domain interface, shared utilities
  - Local imports for same module files

  **Acceptance Criteria**:
  - [ ] No imports from old paths (@/domain, @/data)
  - [ ] All imports updated to @/modules/ or @/shared/

  **Parallelizable**: NO

  **Commit**: NO (combine with 6.3)

---

- [ ] 6.3 Update imports in UI components (React)
  
  **What to do**:

  ```typescript
  // Before (login.page.tsx)
  import { useAuthStore } from '@/shared/stores'
  import { ROUTES } from '@/shared/config'
  import { useToast } from '@/shared/hooks/use-toast.hook'
  import { authRepository } from '@/data/Repository/auth.repository-impl'
  
  // After
  import { useAuthStore } from '@/modules/auth/infrastructure/ui/stores'
  // Or with barrel:
  import { useAuthStore } from '@/modules/auth/infrastructure'
  
  import { ROUTES } from '@/shared/config'
  import { useToast } from '@/shared/hooks'
  import { authRepository } from '@/modules/auth/infrastructure/repository'
  ```

  **Must NOT do**:
  - Don't import from domain directly in UI (only via use cases)
  - Don't create business logic in components
  - Components should use stores (which use use cases)

  **References**:
  - Components use stores or hooks to access logic
  - Stores/hooks orchestrate use cases
  - Component never directly calls repository

  **Acceptance Criteria**:
  - [ ] No imports from @/domain in components
  - [ ] No imports from @/data in components
  - [ ] All imports use @/modules/ or @/shared/

  **Parallelizable**: NO (sequential per module)

  **Commit**: NO (combine with final verification)

---

- [ ] 6.4 Update App.tsx router configuration
  
  **What to do**:

  ```typescript
  // Before (App.tsx)
  import { routes } from '@/data/routes'
  import { RequireAuth } from '@/presentation/features/auth/components/require-auth'
  
  // After
  import { routes } from '@/shared/config/routes'  // or new location
  import { RequireAuth, RequireAdmin } from '@/shared/infrastructure/ui'
  // Or:
  import { RequireAuth } from '@/modules/auth/infrastructure/ui'
  import { RequireAdmin } from '@/modules/auth/infrastructure/ui'
  ```

  **Must NOT do**:
  - Don't break router structure
  - Keep route definitions centralized (in shared/config or at least one place)

  **References**:
  - App.tsx is router setup (UI entry point)
  - Should import from infrastructure (UI components, not domain)

  **Acceptance Criteria**:
  - [ ] App.tsx runs without import errors
  - [ ] Routes load correctly

  **Commit**: NO (combine with verification)

---

- [ ] 6.5 Move/Create data/routes.ts to shared location
  
  **What to do**:

  ```
  Option 1: Move to shared/config/
  src/data/routes/index.ts → src/shared/config/routes.ts
  
  Option 2: Create new barrel
  Create src/shared/config/router.ts with route definitions
  ```

  **Must NOT do**:
  - Don't leave routes scattered

  **References**:
  - Routes are configuration (shared across app)
  - Goes in shared/config

  **Acceptance Criteria**:
  - [ ] routes configuration in one place
  - [ ] App.tsx can import it

  **Commit**: NO (combine with 6.6)

---

- [ ] 6.6 Move data/Provider to shared/infrastructure/provider
  
  **What to do**:
  - Move `src/data/Provider/axios-private.provider.ts` → `src/shared/infrastructure/provider/`
  - Move `src/data/Provider/axios-public.provider.ts` → `src/shared/infrastructure/provider/`
  - Move `src/data/Provider/token-manager.provider.ts` → `src/shared/infrastructure/provider/`
  - Keep/move `src/data/Provider/index.ts` to `src/shared/infrastructure/provider/index.ts`
  
  **Must NOT do**:
  - These are GLOBAL infrastructure utilities, not module-specific

  **References**:
  - Axios providers are shared infrastructure (HTTP client)
  - TokenManager is shared infrastructure (auth utilities)

  **Acceptance Criteria**:
  - [ ] shared/infrastructure/provider/ contains all providers
  - [ ] Old src/data/Provider/ DELETED
  - [ ] All imports updated

  **Commit**: NO (combine with 6.7)

---

- [ ] 6.7 Create root module index.ts barrel exports
  
  **What to do**:

  ```typescript
  // src/modules/auth/index.ts
  export * from './domain'
  export * from './application'
  export * from './infrastructure'
  
  // src/modules/books/index.ts
  export * from './domain'
  export * from './application'
  export * from './infrastructure'
  // ... repeat for all modules
  ```

  **References**:
  - Enables: `import { LoginPage, LoginUseCase } from '@/modules/auth'`
  - Barrel exports for maximum cleanliness

  **Acceptance Criteria**:
  - [ ] All module index.ts files re-export subdirectories
  - [ ] Can import: `import { LoginUseCase, LoginPage } from '@/modules/auth'`

  **Commit**: YES
  - Message: `refactor(imports): add barrel exports and update all import paths`
  - Files: All affected modules + shared

---

### Phase 7: Delete Old Directories

- [ ] 7.0 Delete old src/domain folder
  
  **What to do**:

  ```bash
  rm -rf src/domain
  ```

  **Must NOT do**:
  - Make sure ALL files have been moved first
  - Double-check imports don't reference it

  **Acceptance Criteria**:
  - [ ] src/domain/ deleted
  - [ ] No more references to @/domain in codebase

  **Commit**: YES
  - Message: `refactor: remove old domain layer directory`

---

- [ ] 7.1 Delete old src/data folder
  
  **What to do**:

  ```bash
  rm -rf src/data
  ```

  **Must NOT do**:
  - Verify all Repository, Provider, Schema files moved

  **Acceptance Criteria**:
  - [ ] src/data/ deleted
  - [ ] No references to @/data

  **Commit**: YES
  - Message: `refactor: remove old data layer directory`

---

- [ ] 7.2 Delete old src/presentation folder
  
  **What to do**:

  ```bash
  rm -rf src/presentation
  ```

  **Must NOT do**:
  - Verify all features/components moved to infrastructure/ui

  **Acceptance Criteria**:
  - [ ] src/presentation/ deleted
  - [ ] No references to @/presentation

  **Commit**: YES
  - Message: `refactor: remove old presentation layer directory`

---

- [ ] 7.3 Delete old src/shared/hooks and src/shared/stores (if all moved)
  
  **What to do**:
  - If all hooks/stores moved to modules or renamed, clean up
  - If global hooks remain, don't delete

  **Must NOT do**:
  - Only delete if verified nothing references them

  **Acceptance Criteria**:
  - [ ] Old locations cleaned up
  - [ ] Global utilities remain in shared/

  **Commit**: YES
  - Message: `refactor(shared): clean up old hooks and stores directories`

---

### Phase 8: Verification & Cleanup

- [ ] 8.0 Verify TypeScript compilation
  
  **What to do**:

  ```bash
  cd apps/frontend
  pnpm type-check
  ```

  **Expected output**:

  ```
  ✓ No TypeScript errors
  ```

  **Acceptance Criteria**:
  - [ ] `pnpm type-check` passes
  - [ ] No "Cannot find module" errors
  - [ ] No "is not assignable to" type errors

  **Commit**: NO

---

- [ ] 8.1 Verify ESLint linting
  
  **What to do**:

  ```bash
  pnpm lint
  ```

  **Expected output**:

  ```
  ✓ ESLint found no problems
  ```

  **Acceptance Criteria**:
  - [ ] `pnpm lint` passes
  - [ ] No import order issues
  - [ ] No unused variable warnings

  **Commit**: NO

---

- [ ] 8.2 Verify app runs without errors
  
  **What to do**:

  ```bash
  pnpm dev:frontend
  ```

  Then navigate browser to `http://localhost:5173` and verify:
  - App loads without console errors
  - Login page renders
  - Navigation works
  - No 404 import errors in console

  **Acceptance Criteria**:
  - [ ] App starts successfully
  - [ ] Browser console has no errors
  - [ ] Pages load and render
  - [ ] Routes work

  **Commit**: NO

---

- [ ] 8.3 Fix any remaining import issues
  
  **What to do**:
  If any imports still broken:
  - Find the file with broken import
  - Check if it's referencing old @/domain, @/data, @/presentation paths
  - Update to new @/modules/ path
  - Verify path exists

  **Acceptance Criteria**:
  - [ ] All imports resolve
  - [ ] App runs without errors

  **Commit**: YES (if any fixes needed)
  - Message: `fix(imports): update remaining broken imports`

---

- [ ] 8.4 Final comprehensive verification
  
  **What to do**:
  Run all checks together:

  ```bash
  pnpm type-check && pnpm lint && pnpm dev:frontend
  ```

  Then manually test:
  1. Login page loads
  2. Books page loads
  3. Cart page loads
  4. Navigation between pages works
  5. No console errors

  **Acceptance Criteria**:
  - [ ] Type checking passes
  - [ ] Linting passes
  - [ ] App starts
  - [ ] All pages load
  - [ ] No console errors
  - [ ] Navigation works

  **Commit**: NO (final state)

---

## Verification Commands

### Before Starting

```bash
cd apps/frontend
pnpm type-check    # Baseline: should pass
pnpm lint           # Baseline: should pass
```

### After Each Phase

```bash
pnpm type-check    # Check for type errors
pnpm lint           # Check for linting errors
```

### Final Comprehensive Check

```bash
pnpm type-check && pnpm lint && pnpm dev:frontend
# Manual: Navigate browser, verify pages load, check console for errors
```

---

## Architecture Guarantees After Refactor

### Dependency Flow (Enforced)

```
Domain (knows nothing)
    ↓
Application (uses domain)
    ↓
Infrastructure/UI (uses application)
```

**Never allowed**:

- Domain importing from application/infrastructure
- Infrastructure importing from application (only using it)
- Circular dependencies

### Framework Independence

```
If switching React → Vue.js tomorrow:
- Delete src/modules/*/infrastructure/ui/ (React-specific)
- Create src/modules/*/infrastructure/vue-ui/ (Vue-specific)
- Domain + Application layers: UNTOUCHED
- No business logic changes needed
```

### Module Self-Containment

Each module is independently deployable:

```
modules/auth/       ← Can be tested/reviewed/deployed alone
modules/books/      ← Can be tested/reviewed/deployed alone
modules/cart/       ← Can be tested/reviewed/deployed alone
```

---

## Success Criteria Summary

✅ **Structure**

- [ ] All modules created: auth, books, cart, loans, user, dashboard
- [ ] Each module has: domain/, application/, infrastructure/
- [ ] Infrastructure includes: http/, repository/, schema/, ui/

✅ **Consolidation**

- [ ] No duplicate entities (book.entity.ts exists only once)
- [ ] Old domain/, data/, presentation/ folders deleted

✅ **Imports**

- [ ] All imports use @/modules/ paths
- [ ] No imports from old @/domain, @/data, @/presentation
- [ ] Type checking: `pnpm type-check` passes
- [ ] Linting: `pnpm lint` passes

✅ **Functionality**

- [ ] App runs: `pnpm dev:frontend` starts without errors
- [ ] Browser loads without console errors
- [ ] All pages accessible and render correctly

---

## Commit Strategy

One commit per module (6 commits):

1. `refactor(auth): restructure to module-based architecture`
2. `refactor(books): restructure to module-based architecture`
3. `refactor(cart): restructure to module-based architecture`
4. `refactor(loans): restructure to module-based architecture`
5. `refactor(user): restructure to module-based architecture`
6. `refactor(dashboard): restructure to module-based architecture`

Plus cleanup commits:
7. `refactor(shared): move infrastructure providers and utilities`
8. `refactor(imports): add barrel exports and update all import paths`
9. `refactor: remove old domain, data, presentation directories`
10. `refactor(shared): clean up old utilities directories` (if needed)

Total: 9-10 focused commits, easy to review and revert if needed.

---

## Timeline Estimate

- Creating folders: 5 min
- Moving files: 30 min (per module, can parallelize conceptually)
- Updating imports: 45 min (sequential per module)
- Fixing errors: 15 min
- Verification: 10 min
- **Total: ~3-4 hours of systematic work**
