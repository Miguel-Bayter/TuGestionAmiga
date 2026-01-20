# 📋 Plan de Implementación: Convención de Nomenclatura

**Fecha:** Enero 2026
**Estado:** Planificación Completa
**Prioridad:** Alta

## 🎯 Objetivo

Implementar una convención de nomenclatura consistente para archivos TypeScript/React siguiendo estándares del ecosistema JavaScript moderno.

## 📏 Convención de Nomenclatura

### Reglas Generales

- **Archivos simples**: `kebab-case.ts/tsx` (ej: `book-loan.ts`)
- **Archivos agrupados**: `[name].[group].[ext]` (ej: `book.schema.ts`, `login.usecase.ts`)
- **Grupos identificados**: `.entity`, `.repository`, `.usecase`, `.page`, `.hook`, `.store`, `.helper`, `.provider`, `.schema`
- **Componentes**: Sin grupo, solo `kebab-case.tsx` (ej: `book-card.tsx`)
- **Pattern Container/Presentation**: Carpeta con estructura `ComponentName/{component-name.tsx, component-name.container.tsx, index.ts}`

### Estructura Simplificada

Con esta convención, eliminamos la necesidad de carpetas `structure/` y `models/` en `domain/Entity/`, ya que la separación se hace por nomenclatura.

### 📂 Patrón Container/Presentation para Componentes

Cuando un componente necesite separación Container/Presentation:

```-
presentation/features/books/components/
├── BooksTable/
│   ├── books-table.tsx          # Presentación (Component)
│   ├── books-table.container.tsx # Lógica (Container)
│   └── index.ts                 # Barrel export
├── BookCard/
│   ├── book-card.tsx
│   └── index.ts
└── BookDetailsModal/
    ├── book-details-modal.tsx
    ├── book-details-modal.container.tsx
    └── index.ts
```

**Archivo index.ts (Barrel):**

```typescript
export { default as BooksTable } from './books-table.container';
export { default as BookCard } from './book-card';
```

## 📁 Mapeo Completo de Cambios

### 1. Domain/Entity/

```-
Antes: domain/Entity/Book/structure/Book.ts
Después: domain/Entity/book.entity.ts

Cambios:
- Book.ts      → book.entity.ts
- Cart.ts      → cart.entity.ts
- Loan.ts      → loan.entity.ts
- User.ts      → user.entity.ts
```

### 2. Domain/Repository/ (Interfaces)

```-
Antes: domain/Repository/Auth/IAuthRepository.ts
Después: domain/Repository/auth.repository.ts

Cambios:
- IAuthRepository.ts    → auth.repository.ts
- IBookRepository.ts    → book.repository.ts
- ICartRepository.ts    → cart.repository.ts
- ILoanRepository.ts    → loan.repository.ts
```

### 3. Data/Repository/ (Implementaciones)

```-
Antes: data/Repository/Auth/AuthRepository.ts
Después: data/Repository/auth.repository-impl.ts

Cambios:
- AuthRepository.ts     → auth.repository-impl.ts
- BookRepository.ts     → book.repository-impl.ts
- CartRepository.ts     → cart.repository-impl.ts
- LoanRepository.ts     → loan.repository-impl.ts
```

### 4. Data/Schema/

```-
Antes: data/Schema/Auth/auth.schema.ts
Después: data/Schema/auth.schema.ts (sin cambios - mantiene .schema)

Cambios:
- auth.schema.ts  (sin cambios)
- book.schema.ts  (sin cambios)
- cart.schema.ts  (sin cambios)
- loan.schema.ts  (sin cambios)
- user.schema.ts  (sin cambios)
```

### 5. Domain/UseCase/

#### Auth/

```-
- GetProfileUseCase.ts  → get-profile.usecase.ts
- LoginUseCase.ts       → login.usecase.ts
- LogoutUseCase.ts      → logout.usecase.ts
- RegisterUseCase.ts    → register.usecase.ts
```

#### Book/

```-
- CreateBookUseCase.ts        → create-book.usecase.ts
- DeleteBookUseCase.ts        → delete-book.usecase.ts
- GetAvailableBooksUseCase.ts → get-available-books.usecase.ts
- GetBooksUseCase.ts          → get-books.usecase.ts
- GetBookUseCase.ts           → get-book.usecase.ts
- UpdateBookUseCase.ts        → update-book.usecase.ts
```

#### Cart/

```-
- AddToCartUseCase.ts    → add-to-cart.usecase.ts
- CheckoutUseCase.ts     → checkout.usecase.ts
- GetCartUseCase.ts      → get-cart.usecase.ts
- RemoveFromCartUseCase.ts → remove-from-cart.usecase.ts
```

#### Loan/

```-
- CreateLoanUseCase.ts      → create-loan.usecase.ts
- GetLoansUseCase.ts        → get-loans.usecase.ts
- GetOverdueLoansUseCase.ts → get-overdue-loans.usecase.ts
- ReturnLoanUseCase.ts      → return-loan.usecase.ts
```

#### User/

```-
- GetProfileUseCase.ts   → get-profile.usecase.ts (⚠️ conflicto con Auth)
- UpdateProfileUseCase.ts → update-profile.usecase.ts
```

### 6. Presentation/Components/

```-
Sin grupo .component, solo kebab-case:

- Layout.tsx      → layout.tsx
- Navbar.tsx      → navbar.tsx
- Sidebar.tsx     → sidebar.tsx
- Toast.tsx       → toast.tsx
```

### 7. Presentation/Features/

#### Auth/ _

```-
Componentes (sin grupo):
- RequireAdmin.tsx → require-admin.tsx
- RequireAuth.tsx  → require-auth.tsx

Pages (con .page):
- LoginPage.tsx    → login.page.tsx
- RegisterPage.tsx → register.page.tsx
```

#### Books/

```-
Componentes (sin grupo):
- BookCard.tsx          → book-card.tsx
- BookDetailsModal.tsx  → book-details-modal.tsx

Opcional - Con patrón Container/Presentation:
presentation/features/books/components/BooksTable/
├── books-table.tsx
├── books-table.container.tsx
└── index.ts
```

#### Pages/

```-
- AccountPage.tsx  → account.page.tsx
- AdminPage.tsx    → admin.page.tsx
- CartPage.tsx     → cart.page.tsx
- DashboardPage.tsx → dashboard.page.tsx
- HelpPage.tsx     → help.page.tsx
- LoansPage.tsx    → loans.page.tsx
```

### 8. Presentation/Hooks/

```-
- useAuthGuard.ts → use-auth-guard.hook.ts
- useToast.ts     → use-toast.hook.ts
```

### 9. Shared/Stores/

```-
- useAuthStore.ts  → use-auth.store.ts
- useBookStore.ts  → use-book.store.ts
- useCartStore.ts  → use-cart.store.ts
- useLoanStore.ts  → use-loan.store.ts
- useToastStore.ts → use-toast.store.ts
- useUIStore.ts    → use-ui.store.ts
```

### 10. Shared/Helpers/

```-
- async.ts      → async.helper.ts
- classnames.ts → classnames.helper.ts
- date.ts       → date.helper.ts
- format.ts     → format.helper.ts
- string.ts     → string.helper.ts
- token.ts      → token.helper.ts
- validation.ts → validation.helper.ts
```

### 11. Data/Provider/

```-
- axPrivate.ts    → axios-private.provider.ts
- axPublic.ts     → axios-public.provider.ts
- tokenManager.ts → token-manager.provider.ts
```

## 🔄 Plan de Ejecución (5 Fases)

### Fase 1: Preparación (15 min)

- ✅ Crear backup del proyecto
- ✅ Instalar herramientas de refactorización (opcional: `jscodeshift`, `ts-morph`)
- ✅ Crear rama Git: `feature/naming-convention`

### Fase 2: Renombrado por Capas (45 min)

**Orden crítico por dependencias:**

1. **Entities** (5 min) - No tienen dependencias
2. **Interfaces Repository** (5 min) - No tienen dependencias
3. **Implementaciones Repository** (10 min) - Dependen de interfaces
4. **UseCases** (10 min) - Dependen de repositories
5. **Components, Pages, Hooks** (10 min) - Dependen de useCases/stores
6. **Stores, Helpers, Providers** (5 min) - Dependen de otros módulos

### Fase 3: Actualización de Imports (30 min)

- Usar `find` + `sed` para actualizar imports automáticamente
- Verificar imports relativos vs absolutos
- Actualizar archivos `index.ts` de exportación
- Especial atención a imports de componentes con patrón Container/Presentation

### Fase 4: Verificación (15 min)

- ✅ `pnpm type-check` - Verificar tipos TypeScript
- ✅ `pnpm lint` - Verificar ESLint
- ✅ `pnpm build` - Verificar compilación
- ✅ Ejecutar aplicación en desarrollo

### Fase 5: Finalización (5 min)

- ✅ Commit con mensaje descriptivo
- ✅ Merge a rama principal
- ✅ Actualizar documentación

## ⚠️ Consideraciones Especiales

### Conflictos Identificados

1. **GetProfileUseCase.ts duplicado**: Tanto en `Auth/` como en `User/`
   - Solución: Mantener en contexto específico o renombrar a `get-user-profile.usecase.ts`

### Cambios Clave

- ✅ **Eliminación de grupo `.component`**: Los componentes solo usan `kebab-case`
- ✅ **Patrón Container/Presentation**: Se aplica con carpeta y archivos `.container.tsx`
- ✅ **Simplificación**: Menos carpetas innecesarias en domain/Entity/
- ✅ **Consistencia**: Todos los archivos siguen patrones claros y predecibles

### Archivos que NO cambian

- `App.tsx`, `main.tsx`, `index.css` - Archivos de entrada
- Archivos de configuración: `package.json`, `tsconfig.json`, etc.
- `index.ts` - Archivos de barril (barrel exports)

### Herramientas Recomendadas

```bash
# Para búsqueda masiva
find src -name "*.ts" -o -name "*.tsx" | xargs grep "import.*from"

# Para reemplazos masivos (con cuidado)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/antiguo/nuevo/g'

# Para verificar estructura
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | sort
```

## 📊 Resultado Final Esperado

```-
src/
├── domain/
│   ├── Entity/
│   │   ├── book.entity.ts
│   │   ├── cart.entity.ts
│   │   ├── loan.entity.ts
│   │   └── user.entity.ts
│   ├── Repository/
│   │   ├── auth.repository.ts
│   │   ├── book.repository.ts
│   │   ├── cart.repository.ts
│   │   └── loan.repository.ts
│   └── UseCase/
│       ├── Auth/
│       │   ├── login.usecase.ts
│       │   ├── logout.usecase.ts
│       │   ├── register.usecase.ts
│       │   └── get-profile.usecase.ts
│       └── Book/
│           ├── create-book.usecase.ts
│           ├── delete-book.usecase.ts
│           ├── get-available-books.usecase.ts
│           ├── get-book.usecase.ts
│           ├── get-books.usecase.ts
│           └── update-book.usecase.ts
├── data/
│   ├── Repository/
│   │   ├── auth.repository-impl.ts
│   │   ├── book.repository-impl.ts
│   │   ├── cart.repository-impl.ts
│   │   └── loan.repository-impl.ts
│   ├── Provider/
│   │   ├── axios-private.provider.ts
│   │   ├── axios-public.provider.ts
│   │   └── token-manager.provider.ts
│   └── Schema/
│       ├── auth.schema.ts
│       ├── book.schema.ts
│       ├── cart.schema.ts
│       ├── loan.schema.ts
│       └── user.schema.ts
├── presentation/
│   ├── components/
│   │   ├── layout.tsx
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── toast.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── require-admin.tsx
│   │   │   │   └── require-auth.tsx
│   │   │   └── pages/
│   │   │       ├── login.page.tsx
│   │   │       └── register.page.tsx
│   │   ├── books/
│   │   │   ├── components/
│   │   │   │   ├── BookCard/
│   │   │   │   │   └── book-card.tsx
│   │   │   │   ├── BooksTable/
│   │   │   │   │   ├── books-table.tsx
│   │   │   │   │   ├── books-table.container.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── BookDetailsModal/
│   │   │   │       ├── book-details-modal.tsx
│   │   │   │       └── index.ts
│   │   │   └── pages/
│   │   ├── cart/
│   │   │   └── pages/
│   │   │       └── cart.page.tsx
│   │   ├── loans/
│   │   │   └── pages/
│   │   │       └── loans.page.tsx
│   │   ├── dashboard/
│   │   │   └── pages/
│   │   │       └── dashboard.page.tsx
│   │   ├── account/
│   │   │   └── pages/
│   │   │       └── account.page.tsx
│   │   ├── admin/
│   │   │   └── pages/
│   │   │       └── admin.page.tsx
│   │   └── help/
│   │       └── pages/
│   │           └── help.page.tsx
│   └── hooks/
│       ├── use-auth-guard.hook.ts
│       └── use-toast.hook.ts
└── shared/
    ├── helpers/
    │   ├── async.helper.ts
    │   ├── classnames.helper.ts
    │   ├── date.helper.ts
    │   ├── format.helper.ts
    │   ├── string.helper.ts
    │   ├── token.helper.ts
    │   └── validation.helper.ts
    ├── stores/
    │   ├── use-auth.store.ts
    │   ├── use-book.store.ts
    │   ├── use-cart.store.ts
    │   ├── use-loan.store.ts
    │   ├── use-toast.store.ts
    │   └── use-ui.store.ts
    ├── config/
    │   ├── constants.ts
    │   └── index.ts
    ├── types/
    │   ├── api.types.ts
    │   ├── auth.types.ts
    │   ├── common.types.ts
    │   └── index.ts
    └── assets/
        ├── images/
        │   └── (archivos de imagen)
        └── icons/ (opcional, futuro)
```

## 🎯 Beneficios Esperados

- ✅ **Consistencia**: Nomenclatura uniforme en todo el proyecto
- ✅ **Legibilidad**: Nombres descriptivos y predecibles
- ✅ **Escalabilidad**: Fácil añadir nuevos archivos siguiendo el patrón
- ✅ **Mantenibilidad**: Búsqueda y navegación más eficiente
- ✅ **Flexibilidad**: Patrón Container/Presentation opcional para componentes complejos
- ✅ **Profesionalismo**: Alineado con estándares de la industria

## 📅 Próximos Pasos

1. **Revisar plan** y confirmar cambios
2. **Implementar Fase 1** (Preparación)
3. **Ejecutar Fase 2-5** de forma incremental
4. **Documentar** cambios en equipo

---

**Tiempo estimado total:** ~2 horas
**Riesgo:** Medio (requiere actualización masiva de imports)
**Rollback:** Fácil (revertir commit de Git)
**Última actualización:** Enero 2026
