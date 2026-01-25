# Refactor Frontend: Awilix DI Container + Tipos desde Backend

## Context

### Original Request

"Crear los types en el frontend basados en los endpoints del backend, eliminar el apiClient que tiene en el frontend para llamar al caso de uso correspondiente usando Awilix como DIC"

### Interview Summary

**Key Decisions Made:**

- Use **Awilix DI** for dependency injection (backend pattern applied to frontend)
- **State Management: AWILIX ONLY** - Deprecate Zustand entirely
- Inject **Use Cases + State Services** into React components
- **Type Generation Strategy**: Manual types + Zod validation (NOT OpenAPI)
- **Execution Order**: Phase 1 (Container) → Phase 2 (Fix axios) → Phase 3 (Remove Zustand)

### Metis Review Findings

**Critical Gaps Identified:**

1. Frontend has `useContainer.hook.tsx` but NO `container.ts` file
2. Components call `apiClient` directly (login.page.tsx lines 79, 116) bypassing repositories
3. Zustand stores instantiate use cases directly (duplication with container)
4. OpenAPI generation adds 50MB+ deps and complexity

**Recommendations Applied:**

- ✅ Create container.ts with all registrations
- ✅ Fix direct axios calls before using container
- ✅ Use Zod + manual types instead of OpenAPI generation
- ✅ Initialize container properly in main.tsx
- ✅ **UPDATED: Remove Zustand stores entirely - use Awilix services for state**

---

## Work Objectives

### Core Objective

Establish proper dependency injection architecture in frontend by:

1. Creating and registering Awilix DI container with all use cases
2. Creating state services to replace Zustand stores
3. Replacing direct axios calls with use case invocations
4. Ensuring types match backend endpoints exactly
5. Remove all Zustand dependencies

### Concrete Deliverables

- `src/presentation/config/container.ts` - DI container with all registrations
- `src/shared/infrastructure/services/auth.service.ts` - Auth state management service
- `src/shared/infrastructure/services/book.service.ts` - Book state management service
- `src/shared/infrastructure/services/cart.service.ts` - Cart state management service
- `src/shared/infrastructure/services/loan.service.ts` - Loan state management service
- Updated `main.tsx` - Container initialization before React render
- Updated `login.page.tsx` - Replace direct apiClient calls with use case calls
- Updated all components - Replace Zustand hooks with container services
- Updated type definitions - Ensure all endpoint types are properly typed

### Definition of Done

- [ ] `pnpm dev:frontend` runs without errors related to container
- [ ] Login flow works end-to-end (register → login → tokens stored → profile loaded)
- [ ] `useUseCase('loginUseCase')` resolves correctly from container
- [ ] State management via injected services (no Zustand)
- [ ] All Zustand imports removed from codebase
- [ ] All direct `apiClient` calls replaced with use case calls
- [ ] `pnpm check-all` passes (lint + format + type-check)
- [ ] No console errors or warnings related to DI

### Must Have

- Container initialization BEFORE ContainerProvider wraps App
- All use cases registered as singletons
- All repositories registered as singletons
- All state services registered as singletons
- Container accessible via `useUseCase()` and `useService()` hooks
- Login/Register flows work via use cases (no direct axios)
- State persisted and synchronized across components

### Must NOT Have (Guardrails)

- ❌ NO OpenAPI generation or schema exposure (adds 50MB+ deps)
- ❌ NO Zustand stores anywhere (completely removed)
- ❌ NO modification of existing repository logic (only register, don't change)
- ❌ NO removal of axios providers (repositories still need them)
- ❌ NO changes to use case logic (only inject via container)
- ❌ NO direct axios imports in components (all via use cases)
- ❌ NO Awilix imports outside of container.ts and hooks
- ❌ NO global state outside of container services

---

## Verification Strategy

### Manual QA (No automated tests - existing project doesn't have them)

Each task includes manual verification procedures.

**By Deliverable Type:**

| Deliverable | Verification Tool | Procedure |
|-------------|------------------|-----------|
| **Container Registration** | Browser console + code inspection | Verify `console.log(container.cradle)` shows all registrations |
| **State Service** | React DevTools + manual inspection | Check if service state updates on component interaction |
| **Use Case Injection** | React DevTools + manual execution | Click login button, verify useUseCase is called |
| **API Integration** | Network tab (browser DevTools) | Verify POST /api/auth/login is called with correct payload |
| **End-to-End Flow** | Manual browser flow | Register → Login → Check tokens → Check user profile |

---

## Task Flow

```
Task 1: Create container.ts
    ↓
Task 2: Create state services to replace Zustand
    ↓
Task 3: Initialize container in main.tsx
    ↓
Task 4: Fix direct axios calls in components
    ↓
Task 5: Create missing use cases (if any)
    ↓
Task 6: Replace all Zustand hooks with container services
    ↓
Task 7: Update type definitions (if needed)
    ↓
Task 8: Verify all flows work end-to-end
```

All tasks are **sequential** (each depends on previous).

---

## TODOs

### Task 1: Create `src/presentation/config/container.ts`

**What to do:**

- Create new file: `src/presentation/config/container.ts`
- Set up Awilix container with `InjectionMode.CLASSIC` and `strict: true` (match backend)
- Register ALL repositories from data layer as singletons
- Register ALL use cases from application layer as singletons
- Export default container instance

**Must NOT do:**

- ❌ Don't register components or React hooks
- ❌ Don't import from presentation layer (only domain/data/application)
- ❌ Don't modify existing use case constructors
- ❌ Don't change repository implementations

**Parallelizable:** NO (first task, unblocks others)

**References (CRITICAL):**

**Backend Pattern Reference:**

- `apps/backend/src/shared/config/container.ts:1-63` - Complete container setup example

**Frontend Use Cases to Register:**

- All auth, books, cart, loans, user use cases (see full list in original plan)

**Frontend Repositories to Register:**

- AuthRepository, BookRepository, CartRepository, LoanRepository, UserRepository

**Awilix Documentation:**

- <https://github.com/talyssonoc/awilix> - Main library

**Acceptance Criteria:**

- [ ] File created: `src/presentation/config/container.ts`
- [ ] Awilix imported and container created with correct config
- [ ] All use cases registered as singletons
- [ ] All repositories registered as singletons
- [ ] Default export: `export default container`
- [ ] No import errors (`pnpm type-check`)

**Manual Verification:**

- [ ] Create temporary debug file `src/debug-container.ts`
- [ ] Import in `main.tsx` temporarily to verify logs
- [ ] Expected console output includes all use cases and repositories
- [ ] Delete debug file after verification

**Commit:** YES

- Message: `feat(frontend): add Awilix DI container with use cases and repositories`
- Files: `src/presentation/config/container.ts`
- Verification: `pnpm type-check` passes

---

### Task 2: Create State Services to Replace Zustand

**What to do:**

- Create new files in `src/shared/infrastructure/services/`:
  - `auth-state.service.ts` - Auth state management (replaces useAuthStore)
  - `book-state.service.ts` - Book state management (replaces useBookStore)
  - `cart-state.service.ts` - Cart state management (replaces useCartStore)
  - `loan-state.service.ts` - Loan state management (replaces useLoanStore)
- Each service manages observable state (using RxJS Subject or simple state object)
- Services receive use cases via constructor injection
- Services handle state mutations and subscriptions

**Must NOT do:**

- ❌ Don't use Zustand or any external state management library
- ❌ Don't directly call repositories (only use cases)
- ❌ Don't expose internal state (only via methods)

**Parallelizable:** NO (depends on Task 1)

**References:**

**Current Zustand Stores to Replace:**

- `src/shared/infrastructure/stores/use-auth.store.ts` - Copy logic, convert to service
- `src/shared/infrastructure/stores/use-book.store.ts` - Copy logic, convert to service
- `src/shared/infrastructure/stores/use-cart.store.ts` - Copy logic, convert to service
- `src/shared/infrastructure/stores/use-loan.store.ts` - Copy logic, convert to service

**Service Pattern (to implement):**

```typescript
// Simple state service pattern (no RxJS needed initially)
export class AuthStateService {
  private state = {
    user: null as User | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    isLoading: false,
    error: null as string | null,
  }

  constructor(private loginUseCase: LoginUseCase, ...) {}

  async login(request: LoginRequest) {
    this.state.isLoading = true
    try {
      const response = await this.loginUseCase.execute(request)
      this.state.user = response.user
      this.state.accessToken = response.accessToken
      this.state.refreshToken = response.refreshToken
    } catch (error) {
      this.state.error = error.message
    } finally {
      this.state.isLoading = false
    }
  }

  getState() {
    return { ...this.state }
  }

  subscribe(listener: (state: typeof this.state) => void) {
    // Basic subscription pattern
    listener(this.state)
  }
}
```

**Acceptance Criteria:**

- [ ] All 4 state services created
- [ ] Each service manages state internally
- [ ] Services receive use cases via constructor
- [ ] Services provide getState() method for reading state
- [ ] Services provide subscribe() method for listening to changes
- [ ] No Zustand usage in any service
- [ ] No TypeScript errors

**Manual Verification:**

- [ ] Import each service: no errors
- [ ] Call service methods: state updates correctly
- [ ] Subscribe to changes: listener called with updated state

**Commit:** YES

- Message: `feat(frontend): add state services to replace Zustand stores`
- Files: `src/shared/infrastructure/services/*.ts`
- Verification: `pnpm type-check` passes

---

### Task 3: Register Services in Container & Initialize in main.tsx

**What to do:**

- Add service registrations to `container.ts`
- Register each state service with constructor injection of use cases
- Import container at TOP of `main.tsx` (before React imports)
- Wrap App component with `<ContainerProvider>` in ReactDOM.createRoot
- Verify ContainerProvider is the outermost provider

**Must NOT do:**

- ❌ Don't initialize container inside React component lifecycle
- ❌ Don't initialize container after ReactDOM.createRoot
- ❌ Don't wrap only part of the app

**Parallelizable:** NO (depends on Task 2)

**References:**

**Service Registration Pattern:**

```typescript
// In container.ts
container.register({
  authStateService: asClass(AuthStateService).singleton(),
  bookStateService: asClass(BookStateService).singleton(),
  cartStateService: asClass(CartStateService).singleton(),
  loanStateService: asClass(LoanStateService).singleton(),
})
```

**main.tsx Setup Pattern:**

```typescript
import container from '@/presentation/config/container'
import { ContainerProvider } from '@/shared/infrastructure/hooks/use-container.hook'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContainerProvider>
      <App />
    </ContainerProvider>
  </React.StrictMode>,
)
```

**Acceptance Criteria:**

- [ ] Services registered in container.ts
- [ ] Container imported at top of main.tsx
- [ ] ContainerProvider wraps App
- [ ] No TypeScript errors
- [ ] `pnpm dev:frontend` runs without errors

**Manual Verification:**

- [ ] Run `pnpm dev:frontend`
- [ ] Open browser console
- [ ] No errors about "useContainer must be used within ContainerProvider"
- [ ] App loads normally

**Commit:** YES

- Message: `feat(frontend): register state services in container and initialize in main.tsx`
- Files: `src/presentation/config/container.ts`, `src/main.tsx`
- Verification: `pnpm dev:frontend` runs without errors

---

### Task 4: Find All Zustand Imports & Direct axios Calls

**What to do:**

- Search for all `useAuthStore`, `useBookStore`, `useCartStore`, `useLoanStore` imports
- Search for all direct `apiClient`, `axPublic`, `axios` calls in components
- Document all locations
- Create migration list mapping old store hooks to new services

**Must NOT do:**

- ❌ Don't modify code yet (only search and document)
- ❌ Don't change repositories

**Parallelizable:** YES (after Task 3)

**Search Commands:**

```bash
# Find all Zustand store imports
grep -r "useAuthStore\|useBookStore\|useCartStore\|useLoanStore\|useTouastStore\|useUIStore" src/modules --include="*.ts*"

# Find all direct axios calls in UI layer
grep -r "apiClient\|axPublic\|axPrivate" src/modules/*/infrastructure/ui --include="*.ts*"
```

**Acceptance Criteria:**

- [ ] Create file: `.sisyphus/findings/zustand-and-axios-locations.md`
- [ ] Document each Zustand hook usage (file, line, what it does)
- [ ] Document each direct axios call (file, line, what endpoint)
- [ ] List in order of dependency (which to migrate first)

**Commit:** NO (findings only)

---

### Task 5: Create Missing Use Cases

**What to do:**

- Review findings from Task 4
- Identify which use cases don't exist yet
- Create missing use cases (password reset, password verify, etc.)
- Follow same pattern as existing use cases

**Must NOT do:**

- ❌ Don't modify existing use case logic
- ❌ Don't create unnecessary use cases

**Parallelizable:** NO (depends on Task 4)

**References:**

**Use Case Pattern:**

```typescript
export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}
  async execute(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.authRepository.forgotPassword(request)
  }
}
```

**Acceptance Criteria:**

- [ ] All missing use cases created
- [ ] Each has constructor with repository dependency
- [ ] Each has execute() method
- [ ] Repository interfaces extended with required methods
- [ ] `pnpm type-check` passes

**Commit:** YES

- Message: `feat(frontend): add missing use cases`
- Files: `src/modules/*/application/use-case/*.ts`

---

### Task 6: Replace Zustand Hooks with Container Services in Components

**What to do:**

- For each component using Zustand stores:
  1. Remove Zustand hook import
  2. Add: `const authService = useService('authStateService')`
  3. Replace store state reads: `store.user` → `authService.getState().user`
  4. Replace store method calls: `store.login()` → `authService.login()`
  5. Subscribe to state changes for re-renders (use useEffect + custom hook)

**Must NOT do:**

- ❌ Don't leave any Zustand imports
- ❌ Don't modify use case logic
- ❌ Don't remove error handling

**Parallelizable:** NO (depends on Task 5)

**References:**

**Custom Hook for Service State (to create):**

```typescript
// src/shared/infrastructure/hooks/use-service-state.hook.ts
export function useServiceState<T>(service: any) {
  const [state, setState] = useState(() => service.getState())

  useEffect(() => {
    service.subscribe((newState: T) => {
      setState(newState)
    })
  }, [service])

  return state
}
```

**Component Migration Pattern:**

```typescript
// Before (Zustand)
const { user, isLoading } = useAuthStore()
const { login } = useAuthStore()

// After (Awilix)
const authService = useService('authStateService')
const { user, isLoading } = useServiceState(authService)

const handleLogin = async (credentials) => {
  await authService.login(credentials)
}
```

**Acceptance Criteria:**

- [ ] All Zustand imports removed from codebase
- [ ] All components using services from container
- [ ] State updates trigger re-renders
- [ ] `pnpm type-check` passes
- [ ] `grep -r "useAuthStore\|useBookStore" src/` returns empty

**Manual Verification:**

- [ ] Click login button → Login flow works
- [ ] Check browser console → No "useAuthStore is not defined" errors
- [ ] User state updates in UI after login
- [ ] Navigation works (user is logged in)

**Commit:** YES

- Message: `refactor(frontend): replace Zustand stores with Awilix services`
- Files: Multiple UI component files
- Verification: `pnpm dev:frontend` works, login flow successful

---

### Task 7: Replace Direct Axios Calls with Use Case Calls

**What to do:**

- In each component with direct axios call:
  1. Remove axios import
  2. Add: `const useCase = useUseCase('forgotPasswordUseCase')`
  3. Replace: `apiClient.post(...)` → `await useCase.execute(...)`
  4. Handle response (update service state)
- Start with login.page.tsx (lines 79, 116)

**Must NOT do:**

- ❌ Don't change use case implementations
- ❌ Don't modify services
- ❌ Don't remove error handling

**Parallelizable:** NO (depends on Task 6)

**References:**

**UseCase Hook Usage:**

```typescript
const forgotPasswordUseCase = useUseCase('forgotPasswordUseCase')

const handleForgotPassword = async (email: string) => {
  try {
    const result = await forgotPasswordUseCase.execute({ email })
    authService.updateState(result) // Update service state
  } catch (error) {
    // Handle error
  }
}
```

**Acceptance Criteria:**

- [ ] All axios imports removed from components
- [ ] All direct axios calls replaced with use cases
- [ ] Use case execute() methods called with correct params
- [ ] Results update service state
- [ ] Error handling preserved
- [ ] `pnpm type-check` passes

**Manual Verification:**

- [ ] Run `pnpm dev:frontend`
- [ ] Click "Forgot Password" on login page
- [ ] Network tab shows POST /api/password/forgot
- [ ] No axios-related errors in console
- [ ] Success message shown

**Commit:** YES

- Message: `refactor(frontend): replace direct axios calls with use case invocations`
- Files: UI component files with HTTP calls
- Verification: Manual testing passes

---

### Task 8: Update Type Definitions

**What to do:**

- Review backend endpoints
- Verify all request/response types defined in frontend
- Add any missing types to `src/shared/domain/types/`
- Use Zod schemas for runtime validation (existing pattern)

**Must NOT do:**

- ❌ Don't implement OpenAPI generation
- ❌ Don't change existing type definitions (only add missing)

**Parallelizable:** YES (can do after Task 3)

**References:**

**Type Definition Pattern:**

```typescript
export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}
```

**Acceptance Criteria:**

- [ ] All backend endpoint types defined
- [ ] Types exported from `src/shared/domain/types/index.ts`
- [ ] Password reset types added
- [ ] All types match backend contracts
- [ ] `pnpm type-check` passes

**Commit:** YES

- Message: `feat(frontend): add missing type definitions`
- Files: `src/shared/domain/types/*.ts`

---

### Task 9: Verify End-to-End Flows Work

**What to do:**

- Test complete authentication flow manually
- Verify container initialized properly
- Verify state services work
- Verify use cases called correctly
- Check tokens stored and persisted
- Verify error handling

**Must NOT do:**

- ❌ Don't modify code (only test)

**Parallelizable:** NO (final verification)

**Manual Testing Checklist:**

- [ ] Start fresh: `pnpm dev:frontend`
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] **Test Registration**: Form → Submit → Tokens stored → Redirected
- [ ] **Test Login**: Form → Submit → User data loaded → Can access dashboard
- [ ] **Test Password Reset**: Click forgot password → Enter email → Success message
- [ ] **Test Protected Routes**: Navigate to protected page → Works without errors
- [ ] **Browser Console**: No Zustand errors, no axios errors, no DI errors
- [ ] **`pnpm check-all`**: All checks pass (lint, format, type-check)

**Acceptance Criteria:**

- [ ] Registration flow works end-to-end
- [ ] Login flow works end-to-end
- [ ] Password reset works
- [ ] Protected routes accessible
- [ ] No console errors or warnings
- [ ] `pnpm check-all` passes with zero errors

**Commit:** NO (testing only)

---

### Task 10: Remove All Zustand Store Files

**What to do:**

- Delete all Zustand store files from `src/shared/infrastructure/stores/`
- Remove Zustand from package.json dependencies
- Verify no remaining references to Zustand in codebase

**Must NOT do:**

- ❌ Don't accidentally delete service files
- ❌ Don't break imports (Task 6 should have already done this)

**Parallelizable:** NO (final cleanup, after Task 9)

**Files to Delete:**

- `src/shared/infrastructure/stores/use-auth.store.ts`
- `src/shared/infrastructure/stores/use-book.store.ts`
- `src/shared/infrastructure/stores/use-cart.store.ts`
- `src/shared/infrastructure/stores/use-loan.store.ts`
- `src/shared/infrastructure/stores/use-ui.store.ts`
- `src/shared/infrastructure/stores/use-toast.store.ts`
- `src/shared/infrastructure/stores/index.ts`

**Dependencies to Remove:**

```bash
pnpm remove zustand
```

**Verification:**

```bash
# Check no remaining Zustand imports
grep -r "zustand" src/
# Should return empty
```

**Acceptance Criteria:**

- [ ] All Zustand store files deleted
- [ ] Zustand removed from package.json
- [ ] No remaining Zustand imports in codebase
- [ ] `pnpm type-check` still passes

**Commit:** YES

- Message: `refactor(frontend): remove Zustand stores and dependency`
- Files: package.json (Zustand removed)
- Deletions: All Zustand store files
- Verification: `pnpm type-check` passes, no Zustand refs

---

## Success Criteria Summary

### Pre-Commit Verification (for each commit)

```bash
pnpm type-check    # No TypeScript errors
pnpm lint          # No ESLint errors
pnpm format:check  # Formatting correct
pnpm dev:frontend  # App starts without errors
```

### Post-Implementation Verification

- [ ] Container properly initialized (no import errors)
- [ ] All services registered and accessible
- [ ] All use cases injected correctly
- [ ] Direct axios calls removed from components
- [ ] Zustand completely removed from codebase
- [ ] End-to-end flows work (register → login → profile)
- [ ] Tokens properly stored and managed
- [ ] State persists and syncs across components
- [ ] No console errors or warnings
- [ ] All commands pass: `pnpm check-all`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|-----------|---------|-------|--------------|
| 1 | `feat(frontend): add Awilix DI container` | `src/presentation/config/container.ts` | `pnpm type-check` |
| 2 | `feat(frontend): add state services` | `src/shared/infrastructure/services/*.ts` | `pnpm type-check` |
| 3 | `feat(frontend): register services in container` | `src/presentation/config/container.ts`, `src/main.tsx` | `pnpm dev:frontend` |
| 5 | `feat(frontend): add missing use cases` | `src/modules/*/application/use-case/*.ts` | `pnpm type-check` |
| 6 | `refactor(frontend): replace Zustand with services` | Multiple UI files | `pnpm dev:frontend` |
| 7 | `refactor(frontend): replace axios with use cases` | UI component files | Manual testing |
| 8 | `feat(frontend): add missing type definitions` | `src/shared/domain/types/*.ts` | `pnpm type-check` |
| 10 | `refactor(frontend): remove Zustand completely` | package.json | `pnpm type-check` |

---

## Future Work (Out of Scope)

- ❌ **OpenAPI Schema Generation** - Not needed (manual types work)
- ❌ **Add Automated Tests** - Out of scope
- ❌ **Migrate Backend** - Already done
- ❌ **Performance Optimization** - Not needed yet

---

## Rollback Plan

If something breaks:

1. **After Task 1-3 (Container setup)**:
   - Remove ContainerProvider from main.tsx
   - Delete `src/presentation/config/container.ts`
   - Delete service files
   - Git revert

2. **After Task 6 (Zustand replacement)**:
   - Restore Zustand imports in components
   - Git revert
   - Reinstall Zustand

3. **After Task 7 (Axios replacement)**:
   - Restore axios imports and calls
   - Git revert

---

## Architecture Change Summary

### BEFORE (Current)

```
Components
  ├─ useAuthStore (Zustand) ─> directly instantiate LoginUseCase
  ├─ useBookStore (Zustand)
  ├─ useCartStore (Zustand)
  └─ Direct axios calls (apiClient.post)
```

### AFTER (New)

```
Components
  ├─ useService('authStateService') ─> Awilix container
  ├─ useUseCase('loginUseCase') ─> Awilix container
  ├─ State services (no Zustand)
  └─ All HTTP via use cases (no direct axios)

Container (Awilix)
  ├─ Services
  ├─ Use Cases
  ├─ Repositories
  └─ Infrastructure
```

**Benefits:**

- ✅ Single source of truth for DI (container)
- ✅ No duplication (no Zustand + container)
- ✅ Type-safe everywhere
- ✅ Testable (easy to mock)
- ✅ Consistent with backend architecture
