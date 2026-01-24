# Issues & Gotchas

(Subagents will append problems encountered here)

# Blocking Issues (Discovered in Task 0)

## Issue #1: Prisma Decimal Type Incompatibility

**Severity:** CRITICAL  
**Status:** BLOCKING REFACTORING  
**File:** `src/modules/book/infrastructure/repository/book.repository-impl.ts`

### Description

Repository methods return Prisma objects with `Decimal` type for `price` field, but `BookEntity` interface expects `number`. This causes 4 TypeScript errors across all CRUD methods.

### Affected Methods

- `getAll(available?: boolean)`
- `getById(id: number)`
- `create(data: BookPayload)`
- `update(id: number, data: BookPayload)`

### Solution Required

Add type conversion layer in repository to transform Prisma `Decimal` → `number`:

```typescript
// Example fix pattern
async getById(id: number): Promise<BookEntity> {
  const book = await prisma.book.findUnique({ ... });
  return {
    ...book,
    price: book.price.toNumber(), // Convert Decimal to number
  };
}
```

---

## Issue #2: Incomplete Test Mocks

**Severity:** HIGH  
**Status:** BLOCKING REFACTORING  
**Files:**

- `src/modules/book/__tests__/unit/get-all-books.usecase.test.ts`
- `src/modules/book/__tests__/unit/get-book-by-id.usecase.test.ts`

### Description

Test mocks only include partial `BookEntity` properties (id, title, available), missing 8 required fields. This causes 12 TypeScript errors.

### Missing Properties

- `author: string`
- `description: string`
- `categoryId: number`
- `price: number`
- `purchaseStock: number`
- `rentalStock: number`
- `createdAt: Date`
- `updatedAt: Date`

### Solution Required

Create complete mock factory:

```typescript
const createMockBook = (overrides?: Partial<BookEntity>): BookEntity => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test Description',
  categoryId: 1,
  price: 29.99,
  purchaseStock: 10,
  rentalStock: 5,
  available: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

---

## Impact on Refactoring Plan

**CANNOT PROCEED** until both issues are resolved.

Attempting to refactor with existing type errors would:

- Mask new errors introduced by refactoring
- Make it impossible to verify correctness
- Violate baseline verification requirement

**Recommendation:** Add Task 0.1 to fix these issues before continuing with modular architecture refactoring.
