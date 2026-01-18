# 🚀 TuGestionAmiga Backend - Refactored

Backend moderno con **Express + TypeScript + Prisma 6 + MySQL**

## ✨ Características

- ✅ **TypeScript** para type-safety completo
- ✅ **Prisma 6** ORM agnóstico de BD (MySQL, PostgreSQL, etc.)
- ✅ **MySQL** como base de datos (fácil cambiar a otro proveedor)
- ✅ **Arquitectura por capas** (Routes → Services → Database)
- ✅ **CORS** habilitado para Vite frontend
- ✅ **Nombres en inglés** en BD (tablas, campos, IDs sin prefijo)
- ✅ **Seeding automático** con Prisma (agnóstico de BD)
- ✅ **Password hashing** con bcryptjs

## 📁 Estructura del Proyecto

```
apps/backend/
├── src/
│   ├── config/          # Configuración (database, env, cors)
│   ├── middleware/      # Middlewares (auth, error handling)
│   ├── routes/          # Rutas de la API
│   ├── services/        # Lógica de negocio
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades (password, validators, etc.)
│   ├── app.ts           # Setup de Express
│   └── server.ts        # Entry point
├── prisma/
│   ├── schema.prisma    # Schema de base de datos (Prisma agnóstico)
│   └── seed.ts          # Seeder TypeScript (agnóstico de BD)
├── dist/                # Código compilado
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .env                 # Variables para Prisma CLI
├── .env.local           # Variables para la aplicación
└── .env.example         # Template de variables
```

## 🚀 Inicio Rápido

### 1️⃣ Instalación

```bash
cd apps/backend

# Instalar dependencias
pnpm install

# Crear archivo .env (necesario para Prisma CLI)
cp .env.example .env

# Crear archivo .env.local (necesario para la app)
cp .env.example .env.local
```

### 2️⃣ Configurar Base de Datos

Editar ambos archivos (`.env` y `.env.local`) con tus credenciales MySQL:

```env
DATABASE_URL="mysql://root:tu_password@localhost:3306/tu_gestion_amiga_db"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_PASSWORD=admin123
```

### 3️⃣ Setup Completo (Base de Datos + Seeds)

```bash
# Crear base de datos y tablas
pnpm run prisma:push

# Generar cliente Prisma
pnpm run prisma:generate

# Cargar datos iniciales
pnpm run db:seed
```

### 4️⃣ Ejecutar en Desarrollo

```bash
# Modo desarrollo con hot reload
pnpm run dev

# El servidor estará en http://localhost:3000
```

## 📦 Scripts Disponibles

### Desarrollo

- `pnpm run dev` - Servidor con hot reload (nodemon + ts-node)
- `pnpm run build` - Compilar TypeScript a JavaScript
- `pnpm run start` - Iniciar servidor compilado
- `pnpm run type-check` - Verificar tipos TypeScript sin compilar
- `pnpm run lint` - Ejecutar ESLint

### Prisma & Database

- `pnpm run prisma:generate` - Generar cliente Prisma
- `pnpm run prisma:migrate` - Ejecutar migraciones
- `pnpm run prisma:push` - Push schema a BD (desarrollo rápido)
- `pnpm run prisma:studio` - Abrir Prisma Studio (GUI para la BD)
- `pnpm run db:seed` - Ejecutar seeder (roles, categorías, libros, admin)

## 🗄️ Esquema de Base de Datos

Tablas principales (todas en inglés):

- `role` - Roles (ADMIN, USER)
- `user` - Usuarios del sistema
- `category` - Categorías de libros
- `book` - Catálogo de libros
- `loan` - Préstamos de libros
- `purchase` - Compras de libros
- `cart_item` - Items del carrito de compras

### ¿Por qué Prisma?

Prisma es agnóstico de la base de datos:

```prisma
# Cambiar de MySQL a PostgreSQL es solo modificar una línea:
datasource db {
  provider = "mysql"    # Cambiar a "postgresql", "sqlite", etc.
  url      = env("DATABASE_URL")
}
```

Todos los scripts bash y SQL desaparecen. Prisma maneja todo:
- ✅ Creación de tablas
- ✅ Migraciones
- ✅ Seeding de datos
- ✅ Generación de tipos TypeScript

## 🔐 Credenciales por Defecto

Después de ejecutar `pnpm run db:seed`:

- **Email**: `admin@tugestionamiga.com`
- **Password**: `admin123`
- **Rol**: ADMIN

## 🔗 Endpoints API

### Health Check
- `GET /api/health` - Verificar que el servidor está corriendo

### Autenticación
- `POST /api/auth/register` - Registro de usuario con validación de contraseña
- `POST /api/auth/login` - Login con bcrypt

### Libros
- `GET /api/books` - Listar todos los libros
- `GET /api/books/:id` - Detalle de un libro
- `GET /api/books?available=true` - Listar solo libros disponibles

## 🛠️ Tecnologías

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 20.9.0+ | Runtime |
| **TypeScript** | 5.3+ | Type-safety |
| **Express** | 4.19+ | Web framework |
| **Prisma** | 6.19+ | ORM agnóstico |
| **MySQL** | 8.x | Base de datos |
| **bcryptjs** | 2.4+ | Hashing de passwords |
| **dotenv** | 17.2+ | Variables de entorno |
| **nodemon** | 3.1+ | Hot reload en desarrollo |
| **ts-node** | 10.9+ | Ejecutar TypeScript directo |

## 🔑 Decisiones de Diseño

### ✅ Prisma 6 (No Prisma 7)
- Prisma 6 es LTS (Long Term Support)
- Mantiene la sintaxis familiar `schema.prisma`
- Prisma 7 tiene breaking changes

### ✅ Agnóstico de Base de Datos
- **Antes**: Scripts bash y SQL específicos para MySQL
- **Ahora**: Prisma maneja todo automáticamente
- **Resultado**: Cambiar a PostgreSQL toma 5 segundos

### ✅ TypeScript Seeder
- **Antes**: Scripts bash (requieren MySQL CLI)
- **Ahora**: `prisma/seed.ts` con Prisma Client
- **Resultado**: Funciona en cualquier SO, con cualquier BD

### ✅ Password Utility
- Centralizado en `src/utils/password.ts`
- Validación de fortaleza incluida
- Reutilizable en toda la app

## 📝 Notas Importantes

### Variables de Entorno
El proyecto usa dos archivos `.env`:
- **`.env`** - Usado por Prisma CLI para comandos como `prisma push`
- **`.env.local`** - Usado por la aplicación en runtime (prioridad mayor)

Ambos deben tener el mismo contenido para consistencia.

### CommonJS vs ES Modules
El proyecto usa **CommonJS** para mejor compatibilidad con `ts-node`. No es necesario agregar `.js` a los imports.

### CORS
Configurado por defecto para `http://localhost:5173` (Vite). Cambiar en `.env.local` si es necesario.

## 🐛 Troubleshooting

### Error: Missing DATABASE_URL
```bash
# Verificar que ambos archivos existen
ls .env .env.local

# Verificar contenido
cat .env | grep DATABASE_URL
```

### Error: Cannot connect to MySQL
```bash
# Verificar que MySQL está corriendo
mysql -u root -p -e "SELECT 1;"

# Verificar credenciales en .env.local
# DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB"
```

### Error: Port already in use
```bash
# Cambiar puerto en .env.local
PORT=3001  # o el puerto que prefieras
```

## 🚀 Próximos Pasos

El backend tiene la infraestructura completa. Para expandir:

1. **Completar servicios**: user, loan, cart, purchase, admin
2. **Completar rutas**: users, loans, cart, purchases, admin
3. **Agregar validación** de inputs (Zod recomendado)
4. **JWT authentication** (reemplazar simple header check)
5. **Agregar tests** (Jest o Vitest)
6. **API documentation** (Swagger)

## 📄 Licencia

Proyecto privado - TuGestionAmiga
