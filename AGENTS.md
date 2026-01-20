# AGENTS.md - Tu Gestion Amiga

> Guidelines for AI coding agents operating in this monorepo.

## Project Overview

Library management system monorepo with:
- **Frontend**: React 19 + Vite + Zustand + Tailwind CSS v4 + Clean Architecture
- **Backend**: Express + Prisma + MySQL + TypeScript
- **Package Manager**: pnpm (v9.0.0)

---

## Commands

### Root (Monorepo)

```bash
pnpm dev                 # Run both frontend and backend
pnpm dev:frontend        # Run frontend only
pnpm dev:backend         # Run backend only
pnpm build               # Build all packages
pnpm lint                # Lint all packages
pnpm format              # Format all packages
pnpm type-check          # Type-check all packages
pnpm check-all           # Lint + format:check + type-check
```

### Frontend (`apps/frontend`)

```bash
pnpm --filter @tu-gestion-amiga/frontend dev          # Dev server
pnpm --filter @tu-gestion-amiga/frontend build        # Production build
pnpm --filter @tu-gestion-amiga/frontend lint         # ESLint
pnpm --filter @tu-gestion-amiga/frontend lint:fix     # ESLint autofix
pnpm --filter @tu-gestion-amiga/frontend type-check   # TypeScript check
pnpm --filter @tu-gestion-amiga/frontend format       # Prettier format
```

### Backend (`apps/backend`)

```bash
pnpm --filter @tu-gestion-amiga/backend dev           # Dev server (nodemon)
pnpm --filter @tu-gestion-amiga/backend build         # Compile TypeScript
pnpm --filter @tu-gestion-amiga/backend lint          # ESLint
pnpm --filter @tu-gestion-amiga/backend type-check    # TypeScript check
pnpm --filter @tu-gestion-amiga/backend db:generate   # Prisma generate
pnpm --filter @tu-gestion-amiga/backend db:migrate    # Prisma migrate dev
pnpm --filter @tu-gestion-amiga/backend db:push       # Prisma db push
pnpm --filter @tu-gestion-amiga/backend db:seed       # Run seed script
```

---

## Code Style

### TypeScript (Both Apps)

- **Strict mode enabled** - no implicit any, unused vars/params are errors
- **No type suppression**: NEVER use `as any`, `@ts-ignore`, `@ts-expect-error`
- **Unused variables**: Prefix with underscore `_` to ignore (e.g., `_unused`)
- **Explicit `any` forbidden**: `@typescript-eslint/no-explicit-any: error`

### Formatting (Prettier)

| Setting | Frontend | Backend |
|---------|----------|---------|
| Semi | `false` | `true` |
| Single Quote | `true` | `true` |
| JSX Single Quote | `true` | N/A |
| Print Width | 100 | 100 |
| Tab Width | 2 | 2 |
| Trailing Comma | `es5` | `es5` |

### Import Organization

```typescript
// 1. External dependencies
import { Router } from 'express'
import { create } from 'zustand'

// 2. Absolute imports (@/ alias)
import { API_ENDPOINTS } from '@/shared/config'
import type { User } from '@/domain/Entity/user.entity'

// 3. Relative imports
import { authService } from '../services/auth.service'
```

- Use `@/*` path alias for `src/*` in both apps
- Prefer `import type` for type-only imports
- Group imports: external -> absolute -> relative

---

## Frontend Architecture (Clean Architecture)

### Directory Structure

```
src/
  domain/           # Business logic (framework-agnostic)
    Entity/         # Domain entities
    Repository/     # Repository interfaces (contracts)
    UseCase/        # Use case classes
  data/             # Infrastructure layer
    Provider/       # Axios instances, token manager
    Repository/     # Repository implementations
    Schema/         # Zod validation schemas
  presentation/     # UI layer
    components/     # Shared UI components
    features/       # Feature modules (auth, books, cart, etc.)
      {feature}/
        components/ # Feature-specific components
        pages/      # Page components
  shared/           # Cross-cutting concerns
    config/         # Constants, API endpoints
    helpers/        # Utility functions
    hooks/          # Custom React hooks
    stores/         # Zustand stores
    types/          # Shared TypeScript types
```

### Patterns

**Use Cases**: Class-based with dependency injection
```typescript
export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}
  async execute(request: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(request)
  }
}
```

**Repositories**: Interface in domain, implementation in data
```typescript
// domain/Repository/auth.repository.ts
export interface IAuthRepository {
  login(request: LoginRequest): Promise<LoginResponse>
}

// data/Repository/auth.repository-impl.ts
export class AuthRepository implements IAuthRepository { ... }
export const authRepository = new AuthRepository() // Singleton
```

**Zustand Stores**: Typed state with use cases
```typescript
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  login: async (credentials) => { ... }
}))
```

**Components**: Functional with typed props
```typescript
interface BookCardProps {
  book: Book
  onAddToCart: (bookId: number) => void
}
export function BookCard({ book, onAddToCart }: BookCardProps) { ... }
```

---

## Backend Architecture

### Directory Structure

```
src/
  config/           # Database, CORS, environment config
  controllers/      # (Currently empty - logic in routes)
  middleware/       # Auth, error handling
  routes/           # Express route definitions
  services/         # Business logic classes
  types/            # TypeScript interfaces
  utils/            # Helper functions
```

### Patterns

**Services**: Class-based with Prisma
```typescript
export class AuthService {
  async register(email: string, name: string, password: string) {
    // Validation, Prisma operations, JWT generation
  }
}
export const authService = new AuthService() // Singleton
```

**Routes**: Express Router with asyncHandler
```typescript
router.post('/login', asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password)
  res.json(result)
}))
```

**Error Handling**: Custom ApiError class
```typescript
throw new ApiError(404, 'Book not found')
throw new ApiError(409, 'Email already registered')
```

**Response Format**:
```typescript
// Success
{ ok: true, data: { ... } }
// or direct data for auth endpoints
{ user: {...}, accessToken: "...", refreshToken: "..." }

// Error
{ ok: false, error: "Error message" }
```

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Files (components) | `kebab-case.tsx` | `book-card.tsx` |
| Files (pages) | `kebab-case.page.tsx` | `login.page.tsx` |
| Files (hooks) | `use-*.hook.ts` | `use-toast.hook.ts` |
| Files (stores) | `use-*.store.ts` | `use-auth.store.ts` |
| Files (use cases) | `kebab-case.usecase.ts` | `login.usecase.ts` |
| Files (repositories) | `*.repository.ts` / `*.repository-impl.ts` | `auth.repository.ts` |
| Components | `PascalCase` | `BookCard`, `LoginPage` |
| Interfaces | `I` prefix for repos | `IAuthRepository` |
| Types | `PascalCase` | `LoginRequest`, `User` |

---

## Database (Prisma)

- Schema: `apps/backend/prisma/schema.prisma`
- Provider: MySQL
- Column naming: `snake_case` with `@map()` decorators
- Table naming: `snake_case` with `@@map()` decorators
- Relations: Defined with `@relation` and cascading deletes

---

## Environment Variables

- Frontend: `apps/frontend/.env` (see `.env.example`)
- Backend: `apps/backend/.env` (see `.env.example`)
  - `DATABASE_URL`: MySQL connection string
  - `JWT_SECRET`: JWT signing key
  - `PORT`: Server port (default 3001)

---

## Pre-commit Checklist

1. `pnpm lint` - No ESLint errors
2. `pnpm format:check` - Formatting correct
3. `pnpm type-check` - No TypeScript errors
4. Test manually if no automated tests exist
