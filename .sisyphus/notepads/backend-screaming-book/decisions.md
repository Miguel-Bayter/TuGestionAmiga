# Decisions - Backend Screaming Book

## Architecture Decisions
- Move to pure Screaming Architecture: routes inside modules
- Keep BookService as facade pattern
- Centralized DI with Awilix
- Jest with ts-jest for TypeScript testing

## Scope Management
- Only refactor existing Use Cases (GetAll, GetById)
- Create/Update/Delete Use Cases deferred to future phase

## File Organization
- Legacy structure: flat src/domain, src/data, src/services, src/routes
- New structure: modular under src/modules/book/