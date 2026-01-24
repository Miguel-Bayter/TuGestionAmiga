## Task 7: Move error middleware to shared/middleware

**Date**: 2026-01-24

**What was done**:

- Moved `apps/backend/src/middleware/error.ts` → `apps/backend/src/shared/middleware/error.ts`
- Updated 5 import statements across the codebase:
  - app.ts (errorHandler)
  - routes/auth.routes.ts (asyncHandler)
  - routes/books.routes.ts (asyncHandler)
  - modules/auth/infrastructure/repository/auth.repository-impl.ts (ApiError)
  - modules/book/infrastructure/repository/book.repository-impl.ts (ApiError)

**Approach**:

1. Used `git mv` to preserve file history
2. Used `ast_grep_replace` for initial bulk replacement (caught 2/5 imports)
3. Used manual `mcp_edit` for remaining imports (different import patterns)
4. Verified with `pnpm type-check` and `pnpm lint`

**Key learnings**:

- `ast_grep_replace` pattern `import { $$$ } from '@/middleware/error'` worked but didn't catch all variations
- Relative imports (`../middleware/error`, `./middleware/error`) required separate updates
- Always verify with grep after ast_grep to ensure all imports were updated
- Type-check caught missing imports immediately

**Success metrics**:

- ✅ Type-check: exit 0
- ✅ Lint: exit 0
- ✅ Git commit created: f3b9518
- ✅ File moved with history preserved
