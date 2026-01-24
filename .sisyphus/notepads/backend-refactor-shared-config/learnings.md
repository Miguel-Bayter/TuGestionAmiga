## Task 6: Move env.ts to shared/config

### What Was Done
- Moved `apps/backend/src/config/env.ts` → `apps/backend/src/shared/config/env.ts` using `git mv`
- Updated imports in:
  - `server.ts`: `./config/env` → `./shared/config/env`
  - `config/cors.ts`: `./env` → `../shared/config/env`

### Key Learnings
- `git mv` preserves file history correctly
- Relative imports from `config/cors.ts` needed `../shared/config/env` (not `@/shared/config/env`)
- Type-check caught the missing import update in cors.ts immediately

### Verification
- `pnpm type-check` passed with exit code 0
- Git commit created: `refactor(backend): move env to shared/config`

