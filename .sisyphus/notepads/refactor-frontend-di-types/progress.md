# Refactor Frontend DI Types - Progress Tracker

## Completed Tasks

### ✅ Task 1: Create src/presentation/config/container.ts
- **Status**: DONE
- **File**: `apps/frontend/src/presentation/config/container.ts`
- **Details**:
  - Awilix container created with `InjectionMode.CLASSIC` and `strict: true`
  - 4 repositories registered as singletons
  - 22 use cases registered as singletons (Auth: 6, Books: 6, Cart: 4, Loans: 4, User: 2)
  - 4 state services registered as singletons
  - Default export configured

### ✅ Task 2: Create State Services to Replace Zustand
- **Status**: DONE
- **Files Created**:
  - `apps/frontend/src/shared/infrastructure/services/auth-state.service.ts`
  - `apps/frontend/src/shared/infrastructure/services/book-state.service.ts`
  - `apps/frontend/src/shared/infrastructure/services/cart-state.service.ts`
  - `apps/frontend/src/shared/infrastructure/services/loan-state.service.ts`
- **Details**: All services implement subscriber pattern for state management

### ✅ Task 3: Register Services in Container & Initialize in main.tsx
- **Status**: DONE
- **Files Modified**:
  - `apps/frontend/src/presentation/config/container.ts` - Services registered
  - `apps/frontend/src/main.tsx` - ContainerProvider wraps App
- **Details**: Container initialized before React render, ContainerProvider is outermost provider

## Current Work

### 🔄 Task 4: Find All Zustand Imports & Direct axios Calls
- **Status**: IN PROGRESS
- **Objective**: Search for all Zustand store imports and direct axios calls
- **Next**: Document findings and create migration list

## Pending Tasks

- Task 5: Create missing use cases
- Task 6: Replace Zustand hooks with container services
- Task 7: Replace direct axios calls with use case calls
- Task 8: Create type definitions based on Prisma models
- Task 9: Verify end-to-end flows work
- Task 10: Remove all Zustand store files

## Git Status

- **Staged Changes**: 7 files
  - New use cases: forgot-password, verify-password-code
  - Modified: container.ts, auth.repository, auth.repository-impl, login.page.tsx, constants.ts
- **Commits Ahead**: 13 commits

## Key Decisions

1. **State Management**: Using Awilix services with subscriber pattern (no Zustand)
2. **Type Generation**: Manual types + Zod validation (NOT OpenAPI)
3. **Execution Order**: Container → Services → Find Zustand/axios → Replace → Verify
4. **Architecture**: Module-based domain types (not shared folder)
