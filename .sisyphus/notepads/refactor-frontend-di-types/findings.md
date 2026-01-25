# Task 4 Findings: Zustand Imports & Direct Axios Calls

## Summary

- **Zustand Store Imports Found**: 2 locations
- **Direct Axios Calls in Components**: 0 (all already using repositories)
- **Status**: CLEAN - Most migration already done in previous sessions

## Zustand Usage Locations

### 1. Layout Component
- **File**: `src/shared/infrastructure/ui/react/components/Layout.tsx`
- **Usage**: `useUIStore()` hook
- **State Used**: `isSidebarOpen`, `closeSidebar`, `toggleSidebar`
- **Action Required**: Create UIStateService to replace this

### 2. Toast Hook
- **File**: `src/shared/infrastructure/hooks/use-toast.hook.ts`
- **Usage**: `useToastStore()` hook
- **State Used**: `toasts`, `success`, `error`, `warning`, `info`, `removeToast`, `clearAllToasts`
- **Issue**: `useToastStore` is imported but the store file doesn't exist!
- **Action Required**: Create ToastStateService and fix the hook

## Zustand Store Files Remaining

### Existing Files
1. `src/shared/infrastructure/stores/use-ui.store.ts` - UI state (sidebar, search, modal, theme)
2. `src/shared/infrastructure/stores/index.ts` - Exports useUIStore

### Missing Files Referenced
- `use-toast.store.ts` - Referenced in use-toast.hook.ts but doesn't exist

## Direct Axios Calls in Components

**Result**: NONE FOUND

All components are already using repositories and use cases. The migration from direct axios calls has already been completed.

## Migration Plan

### Phase 1: Create Missing State Services
1. Create `UIStateService` to replace `useUIStore`
2. Create `ToastStateService` to replace missing `useToastStore`
3. Register both in container.ts

### Phase 2: Create Custom Hooks
1. Create `useUIState()` hook to access UIStateService
2. Create `useToast()` hook to access ToastStateService (update existing)

### Phase 3: Replace in Components
1. Update `Layout.tsx` to use `useUIState()` instead of `useUIStore()`
2. Update `use-toast.hook.ts` to use `useToast()` service

### Phase 4: Cleanup
1. Delete `src/shared/infrastructure/stores/use-ui.store.ts`
2. Delete `src/shared/infrastructure/stores/index.ts`
3. Remove zustand from package.json

## Key Insights

1. **Most work already done**: Only 2 Zustand usages remain (UI and Toast)
2. **No axios issues**: All components already use repositories
3. **Toast store missing**: The hook references a store that doesn't exist - needs to be created
4. **Clean architecture**: The codebase is already mostly migrated to use cases
