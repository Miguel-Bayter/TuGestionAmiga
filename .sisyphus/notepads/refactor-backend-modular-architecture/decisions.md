# Architectural Decisions

## Key Decisions from Planning

- **Naming Standard**: `/shared/libs/` (not /utils or /helpers)
- **Route Strategy**: One `routes.ts` per module at `/modules/{domain}/infrastructure/http/routes.ts`
- **Route Aggregation**: Centralized `/shared/http/routes.ts` aggregator
- **Types Scope**: Only HTTP/shared types (not domain entities)

(Subagents will append additional decisions here)
