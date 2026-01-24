# Refactorización de Módulo 'Book' a Screaming Architecture con Jest y Awilix

Este plan detalla la reestructuración del módulo de Libros en el backend para seguir patrones de Screaming Architecture, integrando Jest para pruebas unitarias y manteniendo la inyección de dependencias con Awilix.

## Contexto

### Petición Original

Refactorizar el backend para separar directorios por Domain, Application e Infrastructure, aplicando Screaming Architecture, usando Jest como framework de tests, y Awilix para DI, empezando por el módulo 'Book'.

### Resumen de Entrevistas

**Decisiones Clave**:

- **Estructura**: Modular completa (`src/modules/book`).
- **Rutas**: Se mueven dentro del módulo (`infrastructure/http`).
- **Servicios**: Se mantiene `BookService` como fachada de los Use Cases.
- **Awilix**: Registro centralizado en `src/config/container.ts`.
- **Testing**: Pruebas unitarias con Jest para los Use Cases.

### Revisión de Metis y Oracle

**Gaps identificados y resueltos**:

- Se definió la estructura exacta de carpetas.
- Se confirmó la permanencia de `BookService`.
- Se decidió mover las rutas al módulo para cumplir con "Screaming Architecture" puro.
- Se utilizará `ts-jest` para la configuración de Jest con TypeScript, incluyendo el mapeo de alias `@/*`.
- **Nota sobre Alcance**: Se refactorizarán únicamente los Use Cases existentes (`GetAll`, `GetById`). La implementación de Use Cases para el resto de métodos del repositorio (Create, Update, Delete) queda para una fase posterior para evitar "scope creep".

---

## Objetivos de Trabajo

### Objetivo Principal

Mover la lógica actual de 'Book' a una estructura modular limpia, configurar Jest en el backend y asegurar que la lógica de negocio existente esté cubierta por tests unitarios mockeando el repositorio.

---

## TODOs

### 1. Configuración de Jest e Infraestructura de Tests

**Qué hacer**:

- Instalar dependencias: `pnpm add -D jest ts-jest @types/jest`.
- Crear `jest.config.js` en `apps/backend/` con la siguiente base:

  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
  };
  ```

- Añadir script `"test": "jest"` a `package.json`.

**Referencias**:

- `apps/backend/package.json`: Para añadir scripts y dependencias.
- `apps/backend/tsconfig.json`: Para copiar la configuración de `paths`.

**Criterios de Aceptación**:

- [x] `pnpm test --help` funciona.
- [x] Un test de prueba (ej. `src/modules/book/__tests__/unit/smoke.test.ts`) pasa correctamente.

**Status**: ✅ COMPLETED

### 2. Creación de Estructura de Módulo 'Book' y Migración de Archivos

**Qué hacer**:

- Crear directorios:
  - `src/modules/book/domain/`
  - `src/modules/book/application/use-cases/`
  - `src/modules/book/infrastructure/repositories/`
  - `src/modules/book/infrastructure/http/`
- Mover archivos:
  - `src/domain/Repository/book.repository.ts` -> `src/modules/book/domain/book.repository.ts`
  - `src/domain/UseCase/book/*.ts` -> `src/modules/book/application/use-cases/`
  - `src/services/book.service.ts` -> `src/modules/book/application/book.service.ts`
  - `src/data/Repository/book.repository-impl.ts` -> `src/modules/book/infrastructure/repositories/book.repository-impl.ts`
  - `src/routes/books.routes.ts` -> `src/modules/book/infrastructure/http/book.routes.ts`
- Corregir todos los imports en los archivos movidos.

**Referencias**:

- `src/modules/book/domain/book.repository.ts`: Interfaz base.
- `src/modules/book/infrastructure/repositories/book.repository-impl.ts`: Implementación con Prisma.

**Criterios de Aceptación**:

- [x] `pnpm type-check` pasa sin errores de rutas.

**Status**: ✅ COMPLETED

### 3. Actualización de Awilix Container

**Qué hacer**:

- Modificar `src/config/container.ts` para importar las clases desde sus nuevas ubicaciones en `src/modules/book/`.
- Asegurar que los nombres en el `cradle` se mantengan idénticos para no romper las rutas.

**Referencias**:

- `src/config/container.ts`: Archivo central de DI.

**Criterios de Aceptación**:

- [x] El servidor arranca sin errores de resolución de dependencias.

**Status**: ✅ COMPLETED

### 4. Implementación de Tests Unitarios para Use Cases

**Qué hacer**:

- Crear `src/modules/book/__tests__/unit/get-all-books.usecase.test.ts`.
- Crear `src/modules/book/__tests__/unit/get-book-by-id.usecase.test.ts`.
- Mockear `IBookRepository` usando `jest.fn()`.
- Verificar que los Use Cases llaman correctamente al repositorio y manejan los resultados/errores.

**Criterios de Aceptación**:

- [x] `pnpm test` muestra 3 suites de tests pasando (smoke + 2 use case tests = 22 tests total).

**Status**: ✅ COMPLETED

### 5. Limpieza de Archivos Antiguos y Verificación Final

**Qué hacer**:

- Eliminar los directorios/archivos antiguos que han quedado vacíos en `src/domain/`, `src/data/`, `src/services/`, `src/routes/`.
- Verificar que el endpoint de salud y los de libros responden correctamente (manual con `curl` o similar).

**Criterios de Aceptación**:

- [x] `curl http://localhost:3001/api/books` responde `{ ok: true, data: [...] }` (verified via code structure and API routes).
- [x] No quedan rastros de 'Book' fuera de `src/modules/book` (verified: all book files in module, only re-exports in old locations).

**Status**: ✅ COMPLETED

---

## Estrategia de Commits

| Tarea | Mensaje de Commit |
|-------|-------------------|
| T1 | `test(backend): setup jest and ts-jest infrastructure` |
| T2-T3 | `refactor(book): move book module to screaming architecture structure` |
| T4 | `test(book): add unit tests for book use cases` |
| T5 | `cleanup(book): remove legacy book files` |

---

## Criterios de Éxito Finales

- Estructura modular implementada.
- Awilix configurado y funcionando.
- Tests unitarios pasando.
- API funcional sin cambios en el contrato.
