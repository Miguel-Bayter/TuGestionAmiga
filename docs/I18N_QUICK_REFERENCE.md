# i18n Quick Reference Guide

**Language**: English only in code ✅
**Purpose**: Quick guide to using internationalization in your components

---

## 🚀 Quick Start

### Import the Hook
```typescript
import { useTranslation } from 'react-i18next';
```

### Use in Component
```typescript
const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

---

## 📝 Common Translation Keys

### Navigation
```typescript
t('nav.home')         // "Home" / "Inicio"
t('nav.search')       // "Search" / "Buscar"
t('nav.cart')         // "Cart" / "Carrito"
t('nav.loans')        // "My Loans" / "Mis Préstamos"
t('nav.account')      // "My Account" / "Mi Cuenta"
t('nav.admin')        // "Administration" / "Administración"
t('nav.help')         // "Help" / "Ayuda"
```

### Common UI Elements
```typescript
t('common.loading')   // "Loading..." / "Cargando..."
t('common.error')     // "Error" / "Error"
t('common.success')   // "Success" / "Éxito"
t('common.save')      // "Save" / "Guardar"
t('common.cancel')    // "Cancel" / "Cancelar"
t('common.delete')    // "Delete" / "Eliminar"
t('common.edit')      // "Edit" / "Editar"
t('common.search')    // "Search" / "Buscar"
t('common.submit')    // "Submit" / "Enviar"
t('common.confirm')   // "Confirm" / "Confirmar"
```

### Authentication
```typescript
t('auth.login')           // "Login" / "Iniciar Sesión"
t('auth.register')        // "Register" / "Registrarse"
t('auth.logout')          // "Logout" / "Cerrar Sesión"
t('auth.email')           // "Email" / "Correo Electrónico"
t('auth.password')        // "Password" / "Contraseña"
t('auth.loginButton')     // "Sign In" / "Entrar"
t('auth.registerButton')  // "Create Account" / "Crear Cuenta"
```

### Books
```typescript
t('books.title')          // "Books" / "Libros"
t('books.catalog')        // "Book Catalog" / "Catálogo de Libros"
t('books.available')      // "Available" / "Disponible"
t('books.addToCart')      // "Add to Cart" / "Agregar al Carrito"
t('books.rentBook')       // "Rent Book" / "Rentar Libro"
t('books.viewDetails')    // "View Details" / "Ver Detalles"
```

### Cart
```typescript
t('cart.title')           // "Shopping Cart" / "Carrito de Compras"
t('cart.empty')           // "Your cart is empty" / "Tu carrito está vacío"
t('cart.total')           // "Total" / "Total"
t('cart.checkout')        // "Checkout" / "Finalizar Compra"
t('cart.remove')          // "Remove" / "Eliminar"
```

### Loans
```typescript
t('loans.title')          // "My Loans" / "Mis Préstamos"
t('loans.loanDate')       // "Loan Date" / "Fecha de Préstamo"
t('loans.dueDate')        // "Due Date" / "Fecha de Vencimiento"
t('loans.status')         // "Status" / "Estado"
t('loans.extend')         // "Extend Loan" / "Extender Préstamo"
t('loans.returnBook')     // "Return Book" / "Devolver Libro"
```

### Errors
```typescript
t('errors.unauthorized')      // "Unauthorized access"
t('errors.forbidden')         // "You don't have permission..."
t('errors.notFound')          // "Resource not found"
t('errors.serverError')       // "Server error occurred"
t('errors.invalidCredentials') // "Invalid email or password"
```

---

## 🔢 Using Variables in Translations

### Translation File:
```json
{
  "cart": {
    "itemCount": "You have {{count}} items",
    "insufficientStock": "Insufficient stock for {{item}}"
  }
}
```

### Component Usage:
```typescript
t('cart.itemCount', { count: 5 })
// Result: "You have 5 items" / "Tienes 5 artículos"

t('cart.insufficientStock', { item: bookTitle })
// Result: "Insufficient stock for [book title]"
```

---

## 🎨 Change Language Programmatically

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { i18n } = useTranslation();

  const switchToSpanish = () => {
    i18n.changeLanguage('es');
  };

  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };

  // Get current language
  const currentLang = i18n.language; // 'en' or 'es'

  return (
    <div>
      <button onClick={switchToEnglish}>English</button>
      <button onClick={switchToSpanish}>Español</button>
      <p>Current: {currentLang}</p>
    </div>
  );
};
```

---

## ➕ Adding New Translation Keys

### 1. Add to English File
**File**: `apps/frontend/public/locales/en/translation.json`

```json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "This is a new feature",
    "button": "Click Me"
  }
}
```

### 2. Add to Spanish File
**File**: `apps/frontend/public/locales/es/translation.json`

```json
{
  "myNewFeature": {
    "title": "Mi Nueva Funcionalidad",
    "description": "Esta es una nueva funcionalidad",
    "button": "Haz Clic Aquí"
  }
}
```

### 3. Use in Component
```typescript
const MyNewComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myNewFeature.title')}</h1>
      <p>{t('myNewFeature.description')}</p>
      <button>{t('myNewFeature.button')}</button>
    </div>
  );
};
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T: Hardcode Text
```typescript
// BAD - No Spanish in code!
<h1>Mi Cuenta</h1>
<button>Guardar</button>
```

### ✅ DO: Use Translation Keys
```typescript
// GOOD - English keys only!
<h1>{t('account.title')}</h1>
<button>{t('common.save')}</button>
```

### ❌ DON'T: Spanish Variable Names
```typescript
// BAD
const nombreUsuario = 'John';
const carrito = getCart();
```

### ✅ DO: English Variable Names
```typescript
// GOOD
const userName = 'John';
const cart = getCart();
```

---

## 🔍 Finding Translation Keys

### Search in Translation Files:
```bash
# Search for existing keys
grep -r "cart" apps/frontend/public/locales/en/
grep -r "login" apps/frontend/public/locales/en/
```

### View All Keys:
**English**: `apps/frontend/public/locales/en/translation.json`
**Spanish**: `apps/frontend/public/locales/es/translation.json`

---

## 📂 Translation Key Structure

```
common.*         → General UI (buttons, labels, etc.)
auth.*           → Authentication & authorization
nav.*            → Navigation menu
books.*          → Book catalog & management
cart.*           → Shopping cart
loans.*          → Loan management
account.*        → User account
admin.*          → Admin panel
help.*           → Help & support
errors.*         → Error messages
messages.*       → Success messages
dashboard.*      → Dashboard content
purchase.*       → Purchase history
categories.*     → Categories
user.*           → User management
```

---

## 🧪 Testing Translations

### 1. Check English
```typescript
i18n.changeLanguage('en');
// Verify all text appears in English
```

### 2. Check Spanish
```typescript
i18n.changeLanguage('es');
// Verify all text appears in Spanish
```

### 3. Check Missing Keys
If a key is missing, you'll see the key itself:
```
Result: "myFeature.missingKey" (not translated)
```

---

## 🎯 Best Practices

1. **Always use English keys**: `t('nav.home')` NOT `t('nav.inicio')`
2. **Group related keys**: Use `auth.*`, `cart.*`, etc.
3. **Keep keys descriptive**: `loginButton` is better than `btn1`
4. **Add missing keys to BOTH files**: English and Spanish
5. **Test in both languages**: Always verify both EN and ES
6. **Use variables for dynamic content**: `{{count}}`, `{{name}}`, etc.
7. **Don't nest too deep**: Max 3 levels (e.g., `category.subcategory.key`)

---

## 📖 Examples from Codebase

### Navbar Example:
```typescript
// apps/frontend/src/shared/infrastructure/ui/react/components/Navbar.tsx

const { t } = useTranslation();

const roleLabel = isAdmin ? t('user.roleAdmin') : t('user.roleUser');

<button>{t('auth.logout')}</button>
```

### Sidebar Example:
```typescript
// apps/frontend/src/shared/infrastructure/ui/react/components/Sidebar.tsx

const { t } = useTranslation();

<NavLink to={ROUTES.HOME} title={t('nav.home')}>
  <span>{t('nav.home')}</span>
</NavLink>
```

### Loading Spinner Example:
```typescript
// apps/frontend/src/shared/infrastructure/ui/react/components/LoadingSpinner.tsx

const { t } = useTranslation();

<p>{t('common.loading')}</p>
```

---

## 🚦 Migration Checklist

When updating a page to use i18n:

- [ ] Import `useTranslation` hook
- [ ] Call `const { t } = useTranslation()`
- [ ] Replace ALL hardcoded text with `t()` calls
- [ ] Add missing keys to both translation files
- [ ] Test in English
- [ ] Test in Spanish
- [ ] Verify variables work correctly
- [ ] Check error messages
- [ ] Verify form labels
- [ ] Test button text

---

## 💡 Pro Tips

1. **Use the existing keys**: Before creating new keys, check if one exists
2. **Be consistent**: Use the same key for the same text across pages
3. **Pluralization**: Use `{{count}}` for numbers that need plural forms
4. **Context**: Add context in key names (e.g., `loginButton` vs just `login`)
5. **Validation**: Error messages should be in `errors.*` section

---

## 🔗 Resources

- **Translation Files**: `apps/frontend/public/locales/{en|es}/translation.json`
- **i18n Config**: `apps/frontend/src/shared/infrastructure/config/i18n.ts`
- **Language Switcher**: `apps/frontend/src/shared/infrastructure/ui/react/components/LanguageSwitcher.tsx`
- **Documentation**: https://react.i18next.com/

---

**Remember**:
- ✅ ALL code in English
- ✅ ALL translation keys in English
- ✅ Spanish ONLY in translation file content
- ✅ NO Spanglish mixing
