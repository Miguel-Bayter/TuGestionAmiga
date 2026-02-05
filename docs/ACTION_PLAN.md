# TuGestionAmiga - Action Plan for English Compliance & i18n Implementation

**Date**: 2026-02-04
**Priority**: Critical
**Objective**: Align codebase with functional requirements - English-only code + internationalization support

---

## Phase 1: Internationalization Implementation (CRITICAL - Days 1-3)

### Task 1.1: Install i18n Dependencies

**Frontend**:
```bash
cd apps/frontend
pnpm add react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Estimated Time**: 5 minutes

---

### Task 1.2: Create Translation Files Structure

**Directory Structure**:
```
apps/frontend/public/
└── locales/
    ├── en/
    │   └── translation.json
    └── es/
        └── translation.json
```

**English Translation File** (`en/translation.json`):
```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "confirmPassword": "Confirm Password",
    "forgotPassword": "Forgot Password?",
    "alreadyHaveAccount": "Already have an account?",
    "dontHaveAccount": "Don't have an account?",
    "loginButton": "Sign In",
    "registerButton": "Create Account"
  },
  "nav": {
    "home": "Home",
    "search": "Search",
    "rentable": "Rentable Books",
    "cart": "Cart",
    "loans": "My Loans",
    "account": "My Account",
    "help": "Help",
    "admin": "Administration"
  },
  "books": {
    "title": "Books",
    "catalog": "Book Catalog",
    "available": "Available",
    "unavailable": "Unavailable",
    "purchaseStock": "Purchase Stock",
    "rentalStock": "Rental Stock",
    "price": "Price",
    "author": "Author",
    "description": "Description",
    "category": "Category",
    "addToCart": "Add to Cart",
    "rentBook": "Rent Book",
    "viewDetails": "View Details"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "total": "Total",
    "quantity": "Quantity",
    "remove": "Remove",
    "checkout": "Checkout",
    "itemAdded": "Item added to cart",
    "itemRemoved": "Item removed from cart",
    "checkoutSuccess": "Purchase completed successfully",
    "insufficientStock": "Insufficient stock for {{item}}"
  },
  "loans": {
    "title": "My Loans",
    "myLoans": "My Loans",
    "loanDate": "Loan Date",
    "dueDate": "Due Date",
    "returnedDate": "Returned Date",
    "status": "Status",
    "statusActive": "Active",
    "statusReturned": "Returned",
    "statusOverdue": "Overdue",
    "extend": "Extend Loan",
    "extensionsRemaining": "Extensions Remaining: {{count}}",
    "extensionSuccess": "Loan extended successfully",
    "extensionLimit": "Extension limit reached",
    "returnSuccess": "Book returned successfully"
  },
  "account": {
    "title": "My Account",
    "profile": "Profile",
    "purchaseHistory": "Purchase History",
    "loanHistory": "Loan History",
    "changePassword": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmNewPassword": "Confirm New Password",
    "updateProfile": "Update Profile",
    "updateSuccess": "Profile updated successfully"
  },
  "admin": {
    "title": "Administration",
    "dashboard": "Admin Dashboard",
    "manageBooks": "Manage Books",
    "manageUsers": "Manage Users",
    "manageLoans": "Manage Loans",
    "inventory": "Inventory Management",
    "addBook": "Add Book",
    "editBook": "Edit Book",
    "deleteBook": "Delete Book",
    "viewAllLoans": "View All Loans",
    "processReturn": "Process Return",
    "userManagement": "User Management"
  },
  "errors": {
    "unauthorized": "Unauthorized access",
    "forbidden": "You don't have permission to access this resource",
    "notFound": "Resource not found",
    "serverError": "Server error occurred",
    "networkError": "Network error, please check your connection",
    "validationError": "Validation error",
    "invalidCredentials": "Invalid email or password"
  }
}
```

**Spanish Translation File** (`es/translation.json`):
```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito",
    "cancel": "Cancelar",
    "save": "Guardar",
    "delete": "Eliminar",
    "edit": "Editar",
    "search": "Buscar",
    "filter": "Filtrar"
  },
  "auth": {
    "login": "Iniciar Sesión",
    "register": "Registro",
    "logout": "Cerrar Sesión",
    "email": "Correo Electrónico",
    "password": "Contraseña",
    "name": "Nombre",
    "confirmPassword": "Confirmar Contraseña",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "alreadyHaveAccount": "¿Ya tienes una cuenta?",
    "dontHaveAccount": "¿No tienes una cuenta?",
    "loginButton": "Entrar",
    "registerButton": "Crear Cuenta"
  },
  "nav": {
    "home": "Inicio",
    "search": "Buscar",
    "rentable": "Libros Rentables",
    "cart": "Carrito",
    "loans": "Mis Préstamos",
    "account": "Mi Cuenta",
    "help": "Ayuda",
    "admin": "Administración"
  }
  // ... (continue with Spanish translations)
}
```

**Estimated Time**: 2 hours

---

### Task 1.3: Configure i18next in Frontend

**File**: `apps/frontend/src/shared/infrastructure/config/i18n.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
```

**Estimated Time**: 30 minutes

---

### Task 1.4: Initialize i18n in main.tsx

**File**: `apps/frontend/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import i18n configuration
import './shared/infrastructure/config/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Estimated Time**: 5 minutes

---

### Task 1.5: Create Language Switcher Component

**File**: `apps/frontend/src/shared/infrastructure/ui/react/components/LanguageSwitcher.tsx`

```typescript
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded ${
          currentLanguage === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded ${
          currentLanguage === 'es'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        ES
      </button>
    </div>
  );
};
```

**Estimated Time**: 20 minutes

---

### Task 1.6: Add Language Switcher to Navbar

**File**: `apps/frontend/src/shared/infrastructure/ui/react/components/Navbar.tsx`

```typescript
// Add import
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav>
      {/* ... existing navbar code ... */}

      {/* Add language switcher */}
      <LanguageSwitcher />

      {/* Update navigation links with t() */}
      <Link to="/">{t('nav.home')}</Link>
      <Link to="/search">{t('nav.search')}</Link>
      {/* ... etc ... */}
    </nav>
  );
};
```

**Estimated Time**: 30 minutes

---

### Task 1.7: Replace Hardcoded Strings with t() Calls

**Pattern to Follow**:
```typescript
// Before
<h1>Carrito de Compras</h1>
<button>Agregar al Carrito</button>

// After
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('cart.title')}</h1>
      <button>{t('books.addToCart')}</button>
    </>
  );
};
```

**Files to Update** (estimate ~50 components):
- All page components (`*.page.tsx`)
- All modal components
- All form components
- Navbar, Sidebar, Layout components
- Toast notifications

**Estimated Time**: 8-10 hours (comprehensive)

---

## Phase 2: Route Path Migration to English (Days 4-5)

### Task 2.1: Update Route Configuration

**File**: `apps/frontend/src/shared/infrastructure/ui/react/routes/index.ts`

**Before**:
```typescript
export const routes: RouteConfig[] = [
  { path: '/', element: DashboardPage, title: 'Inicio' },
  { path: '/buscar', element: DashboardPage, title: 'Buscar' },
  { path: '/rentable', element: DashboardPage, title: 'Rentable' },
  { path: '/carrito', element: CartPage, title: 'Carrito', requiresAuth: true },
  { path: '/prestamos', element: LoansPage, title: 'Mis Préstamos', requiresAuth: true },
  { path: '/cuenta', element: AccountPage, title: 'Mi Cuenta', requiresAuth: true },
  { path: '/ayuda', element: HelpPage, title: 'Ayuda' },
  { path: '/admin', element: AdminPage, title: 'Administración', requiresAdmin: true },
];
```

**After**:
```typescript
export const routes: RouteConfig[] = [
  { path: '/', element: DashboardPage, titleKey: 'nav.home' },
  { path: '/search', element: DashboardPage, titleKey: 'nav.search' },
  { path: '/rentable', element: DashboardPage, titleKey: 'nav.rentable' },
  { path: '/cart', element: CartPage, titleKey: 'nav.cart', requiresAuth: true },
  { path: '/loans', element: LoansPage, titleKey: 'nav.loans', requiresAuth: true },
  { path: '/account', element: AccountPage, titleKey: 'nav.account', requiresAuth: true },
  { path: '/help', element: HelpPage, titleKey: 'nav.help' },
  { path: '/admin', element: AdminPage, titleKey: 'nav.admin', requiresAdmin: true },
];
```

**Note**: Change `title` to `titleKey` and use translation keys.

**Estimated Time**: 30 minutes

---

### Task 2.2: Add Backward Compatibility Redirects (Optional)

**File**: `apps/frontend/src/App.tsx`

```typescript
import { Navigate } from 'react-router-dom';

// Add redirects for old Spanish routes
<Route path="/carrito" element={<Navigate to="/cart" replace />} />
<Route path="/prestamos" element={<Navigate to="/loans" replace />} />
<Route path="/cuenta" element={<Navigate to="/account" replace />} />
<Route path="/ayuda" element={<Navigate to="/help" replace />} />
<Route path="/buscar" element={<Navigate to="/search" replace />} />
```

**Estimated Time**: 15 minutes

---

### Task 2.3: Update Navigation Links Throughout App

**Files to Update**:
- `Navbar.tsx`
- `Sidebar.tsx`
- Any component with `<Link to="/carrito">` → `<Link to="/cart">`

**Search Pattern**:
```bash
# Find all hardcoded route paths
grep -r "to=\"/" apps/frontend/src/ --include="*.tsx" --include="*.ts"
```

**Estimated Time**: 1 hour

---

## Phase 3: Remove Spanish Comments and Text (Day 6)

### Task 3.1: Replace Spanish Comments with English

**Search and Replace**:
```bash
# Find Spanish comments
grep -r "// " apps/frontend/src/ --include="*.tsx" --include="*.ts" | grep -i "para\|que\|con\|el\|la\|los\|las"
grep -r "/\* " apps/backend/src/ --include="*.ts"
```

**Examples**:
```typescript
// Before
// Context para el contenedor de dependencias
// Provider que envuelve la aplicación

// After
// Context for the dependency container
// Provider that wraps the application
```

**Estimated Time**: 2 hours

---

### Task 3.2: Update "Cargando..." to Use i18n

**File**: `apps/frontend/src/App.tsx`

```typescript
// Before
{isLoading && <div>Cargando...</div>}

// After
import { useTranslation } from 'react-i18next';

const App = () => {
  const { t } = useTranslation();

  return (
    <>
      {isLoading && <div>{t('common.loading')}</div>}
    </>
  );
};
```

**Estimated Time**: 10 minutes

---

## Phase 4: Verify Business Logic (Days 7-8)

### Task 4.1: Review Loan Creation Logic

**File to Check**: `apps/backend/src/modules/loan/application/service/loan.service.ts`

**Verify**:
- ✅ Default loan duration is 15 days
- ✅ `loanDate` is set to current date
- ✅ `dueDate` is calculated as `loanDate + 15 days`

**Code Example**:
```typescript
const createLoan = async (userId: string, bookId: string) => {
  const loanDate = new Date();
  const dueDate = new Date(loanDate);
  dueDate.setDate(dueDate.getDate() + 15); // 15 days default

  return prisma.loan.create({
    data: {
      userId,
      bookId,
      loanDate,
      dueDate,
      status: 'Active',
      extensions: 0,
    },
  });
};
```

**Estimated Time**: 1 hour

---

### Task 4.2: Review Loan Extension Logic

**File to Check**: `apps/backend/src/modules/loan/application/service/loan.service.ts`

**Verify**:
- ✅ Extension adds exactly 5 days to `dueDate`
- ✅ Maximum 2 extensions allowed (check `extensions < 2`)
- ✅ Only allows extension if `status === 'Active'`

**Code Example**:
```typescript
const extendLoan = async (loanId: string) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });

  if (!loan) throw new Error('Loan not found');
  if (loan.status !== 'Active') throw new Error('Can only extend active loans');
  if (loan.extensions >= 2) throw new Error('Maximum extensions reached');

  const newDueDate = new Date(loan.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 5); // +5 days

  return prisma.loan.update({
    where: { id: loanId },
    data: {
      dueDate: newDueDate,
      extensions: loan.extensions + 1,
    },
  });
};
```

**Estimated Time**: 1 hour

---

### Task 4.3: Verify Checkout Transaction Atomicity

**File to Check**: `apps/backend/src/modules/cart/application/use-case/checkout.usecase.ts`

**Verify**:
- ✅ Uses Prisma transaction (`prisma.$transaction`)
- ✅ Validates stock before purchase
- ✅ Creates purchase records
- ✅ Decrements `purchaseStock`
- ✅ Clears cart items
- ✅ Rolls back on any error

**Code Pattern**:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Get cart items
  const cartItems = await tx.cartItem.findMany({ where: { userId } });

  // 2. Validate stock for all items
  for (const item of cartItems) {
    const book = await tx.book.findUnique({ where: { id: item.bookId } });
    if (!book || book.purchaseStock < item.quantity) {
      throw new Error(`Insufficient stock for ${book?.title}`);
    }
  }

  // 3. Create purchases and update stock
  for (const item of cartItems) {
    await tx.purchase.create({
      data: {
        userId,
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.book.price,
      },
    });

    await tx.book.update({
      where: { id: item.bookId },
      data: { purchaseStock: { decrement: item.quantity } },
    });
  }

  // 4. Clear cart
  await tx.cartItem.deleteMany({ where: { userId } });
});
```

**Estimated Time**: 2 hours

---

## Phase 5: Testing (Days 9-10)

### Task 5.1: Manual Testing Checklist

**Language Switching**:
- [ ] Toggle between EN/ES in navbar
- [ ] Verify all UI text changes
- [ ] Check browser reload persists language choice
- [ ] Verify localStorage stores language preference

**Route Migration**:
- [ ] Navigate to `/cart` → cart page loads
- [ ] Navigate to `/loans` → loans page loads
- [ ] Navigate to `/account` → account page loads
- [ ] Old routes (`/carrito`) redirect to new routes (if implemented)

**Loan Business Logic**:
- [ ] Create loan → verify 15-day due date
- [ ] Extend loan → verify +5 days added
- [ ] Attempt 3rd extension → verify rejection
- [ ] Attempt extension on returned loan → verify rejection

**Checkout Transaction**:
- [ ] Add items to cart
- [ ] Checkout with sufficient stock → success
- [ ] Checkout with insufficient stock → rollback (cart not cleared)

**Estimated Time**: 4 hours

---

### Task 5.2: Write Automated Tests (Optional but Recommended)

**Backend Unit Tests**:
```typescript
// apps/backend/src/modules/loan/__tests__/loan.service.test.ts
describe('LoanService', () => {
  it('should create loan with 15-day due date', async () => {
    // Test implementation
  });

  it('should allow max 2 extensions', async () => {
    // Test implementation
  });

  it('should add 5 days per extension', async () => {
    // Test implementation
  });
});
```

**Estimated Time**: 6-8 hours (if implementing)

---

## Phase 6: Documentation Update (Day 11)

### Task 6.1: Update README Files

**Files to Update**:
- `apps/frontend/README.md` - Add i18n usage instructions
- `apps/backend/README.md` - Document loan business rules
- Root `README.md` - Update route table with English paths

**Estimated Time**: 1 hour

---

### Task 6.2: Update .md Functional Requirements Document

**File**: `TuGestionAmigafuncionamiento.md`

**Updates Needed**:
- ✅ Mark i18n as "IMPLEMENTED" (once complete)
- ✅ Update route examples to use English paths
- ✅ Add note about translation key structure

**Estimated Time**: 30 minutes

---

## Summary Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|----------------|----------|
| **Phase 1** | i18n Implementation | 2-3 days | 🔴 CRITICAL |
| **Phase 2** | Route Migration | 1 day | 🔴 CRITICAL |
| **Phase 3** | Remove Spanish Text | 0.5 day | 🟡 HIGH |
| **Phase 4** | Verify Business Logic | 1 day | 🟡 HIGH |
| **Phase 5** | Testing | 1-2 days | 🟡 HIGH |
| **Phase 6** | Documentation | 0.5 day | 🟢 MEDIUM |

**Total Estimated Time**: 6-8 working days

---

## Critical Files Checklist

### Frontend Files to Modify

**Configuration**:
- [ ] `src/shared/infrastructure/config/i18n.ts` (CREATE)
- [ ] `src/main.tsx` (UPDATE - import i18n)
- [ ] `package.json` (UPDATE - add dependencies)

**Translation Files**:
- [ ] `public/locales/en/translation.json` (CREATE)
- [ ] `public/locales/es/translation.json` (CREATE)

**Components**:
- [ ] `src/shared/infrastructure/ui/react/components/LanguageSwitcher.tsx` (CREATE)
- [ ] `src/shared/infrastructure/ui/react/components/Navbar.tsx` (UPDATE)
- [ ] `src/shared/infrastructure/ui/react/components/Sidebar.tsx` (UPDATE)
- [ ] `src/shared/infrastructure/ui/react/components/Layout.tsx` (UPDATE)

**Routes**:
- [ ] `src/shared/infrastructure/ui/react/routes/index.ts` (UPDATE)
- [ ] `src/App.tsx` (UPDATE - redirects, loading text)

**Pages** (Add `useTranslation()` and replace text):
- [ ] `src/modules/auth/infrastructure/ui/pages/login.page.tsx`
- [ ] `src/modules/auth/infrastructure/ui/pages/register.page.tsx`
- [ ] `src/modules/dashboard/infrastructure/ui/pages/dashboard.page.tsx`
- [ ] `src/modules/cart/infrastructure/ui/pages/cart.page.tsx`
- [ ] `src/modules/loans/infrastructure/ui/pages/loans.page.tsx`
- [ ] `src/modules/user/infrastructure/ui/pages/account.page.tsx`
- [ ] `src/modules/dashboard/infrastructure/ui/pages/admin.page.tsx`
- [ ] `src/modules/dashboard/infrastructure/ui/pages/help.page.tsx`

**Book Components**:
- [ ] `src/modules/books/infrastructure/ui/components/book-card.tsx`
- [ ] `src/modules/books/infrastructure/ui/components/book-details-modal.tsx`

### Backend Files to Verify

**Loan Business Logic**:
- [ ] `src/modules/loan/application/service/loan.service.ts`
- [ ] `src/modules/loan/application/use-case/create-loan.usecase.ts`
- [ ] `src/modules/loan/application/use-case/extend-loan.usecase.ts`

**Checkout Transaction**:
- [ ] `src/modules/cart/application/use-case/checkout.usecase.ts`

**Return Transaction**:
- [ ] `src/modules/loan/application/use-case/return-loan.usecase.ts`

---

## Testing Checklist

### i18n Testing
- [ ] Language persists after page reload
- [ ] All navigation links show translated text
- [ ] All form labels are translated
- [ ] All button text is translated
- [ ] All error messages are translated
- [ ] Switching language updates entire UI
- [ ] Missing translation keys show gracefully (not error)

### Route Testing
- [ ] All new English routes work (`/cart`, `/loans`, etc.)
- [ ] Old Spanish routes redirect (if implemented)
- [ ] Navigation links use new routes
- [ ] Protected routes still require auth
- [ ] Admin routes still require admin role

### Business Logic Testing
- [ ] Loan created with 15-day due date
- [ ] Extension adds exactly 5 days
- [ ] Cannot extend more than 2 times
- [ ] Cannot extend non-active loans
- [ ] Checkout is atomic (all or nothing)
- [ ] Stock validation prevents overselling

---

## Quick Start Command Sequence

```bash
# Step 1: Install i18n dependencies
cd apps/frontend
pnpm add react-i18next i18next i18next-browser-languagedetector i18next-http-backend

# Step 2: Create translation directories
mkdir -p public/locales/en public/locales/es

# Step 3: Create translation files (copy from this document)
# Create public/locales/en/translation.json
# Create public/locales/es/translation.json

# Step 4: Create i18n config file
# Create src/shared/infrastructure/config/i18n.ts

# Step 5: Create language switcher component
# Create src/shared/infrastructure/ui/react/components/LanguageSwitcher.tsx

# Step 6: Start development and test
pnpm dev
```

---

## Completion Criteria

✅ **Phase 1 Complete When**:
- i18n library installed and configured
- Translation files created for EN and ES
- Language switcher in navbar
- At least 80% of UI text uses t() function
- Language preference persists across sessions

✅ **Phase 2 Complete When**:
- All route paths use English (`/cart`, `/loans`, etc.)
- Navigation links updated throughout app
- Optional: Old routes redirect to new routes
- No broken links in application

✅ **Phase 3 Complete When**:
- No Spanish comments in codebase
- "Cargando..." replaced with t('common.loading')
- All hardcoded Spanish text removed

✅ **Phase 4 Complete When**:
- Loan creation verified to use 15-day default
- Extension logic verified (+5 days, max 2, active only)
- Checkout transaction verified as atomic
- Return transaction verified as atomic

✅ **Phase 5 Complete When**:
- Manual testing checklist 100% passed
- Critical user flows tested in both languages
- No console errors or warnings

✅ **Phase 6 Complete When**:
- README files updated
- Documentation reflects current implementation
- IMPLEMENTATION_ANALYSIS.md marked complete

---

**End of Action Plan**
