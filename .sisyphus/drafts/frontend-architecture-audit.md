# Draft: Frontend Architecture Audit & Module-Based Refactor with PROPER Clean Architecture

## Analysis Summary

### Current State

- **Architecture Pattern**: Clean Architecture attempt (Domain → Data → Presentation)
- **Import Usage**: Using `@/` alias ✅
- **Feature Organization**: Feature-based in presentation layer
- **PROBLEM**: Components in presentation layer instead of infrastructure ❌

---

## THE REAL PROBLEM: Components Should Be in Infrastructure

### Clean Architecture Principle (Hexagonal Architecture)

```
Domain Layer (CORE - Business Logic)
    ↓
Application Layer (Use Cases, Services)
    ↓
Infrastructure Layer (External Frameworks)
    ├── UI Framework (React, Vue, Svelte)
    ├── HTTP Client (Axios, Fetch)
    ├── Storage (LocalStorage, Cookies)
    └── Database Drivers
```

### Why Components = Infrastructure?

**React/Vue/Svelte are FRAMEWORKS** (external dependencies).

Just like:

- Axios is external → goes in infrastructure/http
- Prisma is external → goes in infrastructure/database
- **React is external** → should go in infrastructure/ui

If tomorrow you switch React → Vue:

- You only change `infrastructure/ui/` components
- Domain, Application layers are **untouched**
- Business logic remains framework-agnostic

---

## Current Frontend Structure (WRONG APPROACH)

```
src/
├── domain/                    ← Business logic ✅
├── data/                      ← Infrastructure (partially)
│   ├── Provider/              ← HTTP client ✅
│   ├── Repository/            ← Repository implementations ✅
│   └── Schema/                ← Validation ✅
├── presentation/              ← ❌ WRONG PLACE FOR UI
│   ├── components/            ← React components (should be infra!)
│   ├── features/              ← React pages (should be infra!)
│   └── config/
└── shared/
```

**Problem**: React components mixed with feature organization.

---

## CORRECT Frontend Architecture (Module-Based + Clean)

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   └── user.entity.ts         ← Business entity
│   │   │   └── repository/
│   │   │       └── auth.repository.ts     ← Repository interface (contract)
│   │   │
│   │   ├── application/
│   │   │   ├── use-case/
│   │   │   │   ├── login.usecase.ts
│   │   │   │   ├── register.usecase.ts
│   │   │   │   ├── logout.usecase.ts
│   │   │   │   └── get-profile.usecase.ts
│   │   │   └── service/
│   │   │       └── auth.service.ts        ← Orchestrates use cases
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── http/
│   │   │   │   └── auth.routes.ts         ← API endpoints (contracts)
│   │   │   ├── repository/
│   │   │   │   └── auth.repository-impl.ts ← Implementation (uses Axios)
│   │   │   ├── schema/
│   │   │   │   └── auth.schema.ts         ← Zod validation (external lib)
│   │   │   └── ui/                        ← ✨ NEW: React components here
│   │   │       ├── pages/
│   │   │       │   ├── login.page.tsx
│   │   │       │   └── register.page.tsx
│   │   │       ├── components/
│   │   │       │   ├── require-auth.tsx
│   │   │       │   └── require-admin.tsx
│   │   │       ├── hooks/
│   │   │       │   └── use-auth-form.hook.ts
│   │   │       └── stores/
│   │   │           └── use-auth.store.ts   ← Zustand store
│   │   │
│   │   └── __tests__/
│   │       └── unit/
│   │
│   ├── books/
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   │   └── book.entity.ts
│   │   │   └── repository/
│   │   │       └── book.repository.ts
│   │   ├── application/
│   │   │   ├── use-case/
│   │   │   │   ├── get-books.usecase.ts
│   │   │   │   ├── get-book.usecase.ts
│   │   │   │   ├── create-book.usecase.ts
│   │   │   │   ├── update-book.usecase.ts
│   │   │   │   └── delete-book.usecase.ts
│   │   │   └── service/
│   │   │       └── book.service.ts
│   │   ├── infrastructure/
│   │   │   ├── http/
│   │   │   │   └── book.routes.ts
│   │   │   ├── repository/
│   │   │   │   └── book.repository-impl.ts
│   │   │   ├── schema/
│   │   │   │   └── book.schema.ts
│   │   │   └── ui/                        ← React components
│   │   │       ├── pages/
│   │   │       │   └── books.page.tsx
│   │   │       ├── components/
│   │   │       │   ├── book-card.tsx
│   │   │       │   └── book-details-modal.tsx
│   │   │       ├── hooks/
│   │   │       │   └── use-book-filter.hook.ts
│   │   │       └── stores/
│   │   │           └── use-book.store.ts
│   │   │
│   │   └── __tests__/
│   │
│   ├── cart/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   │   ├── http/
│   │   │   ├── repository/
│   │   │   ├── schema/
│   │   │   └── ui/                        ← React components
│   │   └── __tests__/
│   │
│   ├── loans/
│   ├── user/
│   └── dashboard/
│
└── shared/                    ← TRULY shared (no module-specific)
    ├── config/
    │   ├── constants.ts
    │   ├── container.ts
    │   └── index.ts
    ├── types/
    │   ├── api.types.ts
    │   ├── auth.types.ts
    │   └── index.ts
    ├── helpers/
    │   ├── async.helper.ts
    │   ├── date.helper.ts
    │   └── index.ts
    ├── hooks/
    │   ├── use-container.hook.tsx        ← Global hook (not module-specific)
    │   ├── use-toast.hook.ts
    │   └── index.ts
    ├── stores/
    │   ├── use-toast.store.ts            ← Global UI state (Toast)
    │   └── index.ts
    ├── infrastructure/                   ← Shared infrastructure
    │   ├── ui/
    │   │   ├── components/
    │   │   │   ├── Layout.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Toast.tsx
    │   │   └── index.ts
    │   ├── provider/
    │   │   ├── axios-private.provider.ts
    │   │   ├── axios-public.provider.ts
    │   │   ├── token-manager.provider.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── assets/
    │   └── images/
    └── App.tsx                            ← Router setup (entry point for UI)
```

---

## Key Insight: Infrastructure Layer

### What Goes in Infrastructure?

**Anything EXTERNAL to business logic**:

| Category        | Examples                                  | Location                       |
| --------------- | ----------------------------------------- | ------------------------------ |
| **UI Framework**    | React, Vue, Svelte components, hooks, stores | `infrastructure/ui/`          |
| **HTTP Client**     | Axios, Fetch instances                    | `infrastructure/provider/`    |
| **Validation**      | Zod, Yup                                  | `infrastructure/schema/`      |
| **Persistence**     | LocalStorage, IndexedDB                   | `infrastructure/storage/`     |
| **API Routes**      | Endpoint definitions                      | `infrastructure/http/`        |
| **Repository Impl** | Database/API calls                        | `infrastructure/repository/`  |

### What Goes in Domain/Application?

**Pure business logic** (framework-independent):

| Category        | Examples                      | Location              |
| --------------- | ----------------------------- | --------------------- |
| **Entities**        | User, Book, Cart, Loan        | `domain/entity/`      |
| **Interfaces**      | Repository contracts          | `domain/repository/`  |
| **Use Cases**       | Login, GetBooks, AddToCart    | `application/use-case/` |
| **Services**        | Business logic orchestration  | `application/service/` |

---

## Migration Path: Current → Correct

### Step 1: Restructure to Modules with Infrastructure/UI Split

```
Before:
src/presentation/features/auth/components/login.page.tsx

After:
src/modules/auth/infrastructure/ui/pages/login.page.tsx
```

### Step 2: Move All Components to Infrastructure/UI

```
Before:
src/presentation/components/Layout.tsx
src/presentation/features/books/components/book-card.tsx

After:
src/shared/infrastructure/ui/components/Layout.tsx
src/modules/books/infrastructure/ui/components/book-card.tsx
```

### Step 3: Move Hooks/Stores to Infrastructure/UI (if module-specific)

```
Before:
src/shared/hooks/use-auth-guard.hook.ts
src/shared/stores/use-auth.store.ts

After:
src/modules/auth/infrastructure/ui/hooks/use-auth-form.hook.ts
src/modules/auth/infrastructure/ui/stores/use-auth.store.ts

(Global hooks/stores stay in shared/)
```

### Step 4: Framework Independence

If switching React → Vue.js:

```
src/modules/auth/infrastructure/ui/      ← DELETE (React-specific)
src/modules/auth/infrastructure/vue-ui/  ← ADD (Vue-specific)

// domain/, application/ unchanged ✅
// Just different UI framework
```

---

## Benefits of This Approach

### 1. ✅ True Framework Independence

```typescript
// Domain layer (works with ANY framework)
export class LoginUseCase {
  constructor(private authRepo: IAuthRepository) {}
  async execute(email: string, password: string): Promise<User> {
    // No React imports here!
    return this.authRepo.login(email, password)
  }
}

// UI is ONLY in infrastructure
// src/modules/auth/infrastructure/ui/pages/login.page.tsx ← React-specific
// src/modules/auth/infrastructure/vue-ui/pages/login.vue   ← Vue-specific (future)
```

### 2. ✅ Easy Framework Migration

Switching React → Vue tomorrow:

- Delete `infrastructure/ui/` (React components)
- Create `infrastructure/vue-ui/` (Vue components)
- Domain, Application, Repository layers **untouched**
- Business logic **never changes**

### 3. ✅ Clear Dependency Direction

```
Domain (knows nothing about external world)
    ↓
Application (orchestrates use cases)
    ↓
Infrastructure (calls into domain/application via interfaces)
```

### 4. ✅ Screaming Architecture + Clean

```
📁 modules/
├── auth/         ← Auth feature
├── books/        ← Books feature
├── cart/         ← Cart feature
└── loans/        ← Loans feature

Each module:
├── domain/       ← What? (business rules)
├── application/  ← How? (use cases)
└── infrastructure/ ← With what? (React, Axios, etc)
```

---

## Summary: Why This Matters

| Aspect              | Current (Wrong)                | Proposed (Correct)                         |
| ------------------- | ------------------------------ | ------------------------------------------ |
| **Coupling**            | React tightly coupled to logic | React only in infrastructure/ui/          |
| **Framework Switch**    | Would require massive refactor | Just swap infrastructure/ui/ folder       |
| **Module Structure**    | Feature-based (scattered)      | Module-based (self-contained)             |
| **Entity Duplication**  | Possible (no clear ownership)  | Impossible (each entity has a module)      |
| **Dependency Flow**     | Messy                          | Clear (domain ← app ← infra)              |
| **Business Logic**      | Contaminated with React        | Pure, testable, framework-agnostic        |

---

## Work Scope: Module-Based + Infrastructure Separation

### Phase 1: Create Module Structure with Infrastructure/UI

- Create `modules/{feature}/infrastructure/ui/` folders
- Move components from `presentation/features/` → `modules/{feature}/infrastructure/ui/`
- Move global components to `shared/infrastructure/ui/`

### Phase 2: Consolidate Domain & Application

- Move entities to `modules/{feature}/domain/entity/`
- Move use cases to `modules/{feature}/application/use-case/`
- Move repositories/schemas to `modules/{feature}/infrastructure/`

### Phase 3: Fix Entity Duplication

- Consolidate book.entity.ts (remove duplicate)
- Update all imports

### Phase 4: Update All Imports

- Verify `@/modules/` paths work
- Add barrel exports for clean imports
- Fix bugs (apiClient reference)

### Phase 5: Verification

- Type checking passes
- Linting passes
- App runs without errors

---

## Decision Questions

1. **Proceed with Module-Based + Infrastructure/UI Split?**
   - YES ✅ (Proper clean architecture)
   - NO ❌ (Keep current, minimal changes)

2. **Include Barrel Exports?** (index.ts for clean imports)
   - YES ✅ (cleaner: `import { LoginUseCase } from '@/modules/auth'`)
   - NO ❌ (verbose: `import { LoginUseCase } from '@/modules/auth/application/use-case'`)

3. **Test Setup?**
   - YES ✅ (Add Vitest + `__tests__/` to modules)
   - NO ❌ (Focus on structure only)

4. **One Commit or Per-Module?**
   - One big commit (all modules at once)
   - Per-module commits (cleaner history, easier to revert)
