# Sistema de Skills - Agent Skills Format

## 📁 Estructura del Sistema de Skills

El sistema de skills está organizado siguiendo el formato **Agent Skills** de Anthropic, adaptado para el contexto de Tu Gestion Amiga.

```
agents/skills/
├── _shared/              # Skills genéricos reutilizables
│   ├── conversational/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   │   ├── greeting.txt
│   │   │   └── clarification.txt
│   │   ├── scripts/
│   │   │   └── context-manager.js
│   │   └── examples/
│   │       └── sample-conversations.json
│   ├── search/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   └── examples/
│   └── error-handling/
│       ├── SKILL.md
│       └── scripts/
├── book-recommendation/
│   ├── SKILL.md
│   ├── instructions.md
│   ├── prompts/
│   │   ├── genre-recommendation.txt
│   │   ├── author-recommendation.txt
│   │   └── mood-recommendation.txt
│   ├── scripts/
│   │   ├── book-scorer.js
│   │   └── preference-analyzer.js
│   └── examples/
│       ├── genre-examples.json
│       └── mood-examples.json
├── loan-management/
│   ├── SKILL.md
│   ├── prompts/
│   ├── scripts/
│   └── examples/
├── inventory-tracking/
│   ├── SKILL.md
│   ├── scripts/
│   └── examples/
└── help-support/
    ├── SKILL.md
    ├── prompts/
    └── examples/
```

## 📋 Formato SKILL.md

Cada skill debe tener un archivo `SKILL.md` que sigue esta estructura estándar:

```markdown
# Skill: [Nombre de la Skill]

## Descripción
Breve descripción de qué hace esta skill y cuándo usarla.

## Triggers
Lista de keywords e intents que activan esta skill.

### Keywords
- palabra1
- palabra2
- "frase exacta"

### Intents
- BOOK_RECOMMENDATION
- LOAN_MANAGEMENT

## Parámetros
Descripción de inputs requeridos y opcionales.

### Requeridos
- `query`: string - La consulta del usuario
- `context`: ConversationContext - Contexto conversacional

### Opcionales
- `filters`: object - Filtros adicionales
- `limit`: number - Número máximo de resultados

## Respuesta
Formato esperado de la respuesta.

### Éxito
```json
{
  "success": true,
  "data": { ... },
  "message": "Respuesta al usuario"
}
```

### Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "suggestions": ["Sugerencia 1", "Sugerencia 2"]
}
```

## Dependencias
Recursos externos requeridos.

### Base de Datos
- `books` table
- `loans` table

### APIs Externas
- OpenAI API (opcional)
- Vector search service

## Scripts
Utilidades y helpers disponibles.

### book-scorer.js
Algoritmo de puntuación de libros basado en preferencias.

### preference-analyzer.js
Análisis de patrones de lectura del usuario.

## Ejemplos
Casos de uso concretos.

### Ejemplo 1: Recomendación por género
```
Input: "Recomiéndame libros de misterio"
Output: Lista de 3 libros de misterio con reseñas cortas
```

### Ejemplo 2: Recomendación por estado de ánimo
```
Input: "Quiero leer algo relajante"
Output: Libros de géneros calmantes (ficción lite, no-ficción)
```

## Métricas
KPIs para medir efectividad de la skill.

- **Accuracy**: Porcentaje de recomendaciones aceptadas
- **Response Time**: Tiempo promedio de respuesta
- **User Satisfaction**: Rating promedio de usuarios

## Version
- **v1.0.0** - Implementación inicial
- **v1.1.0** - Agregado análisis de preferencias
```

## 🔧 Skill Loader System

### SkillLoader Class

```typescript
class SkillLoader {
  private skillRegistry: Map<string, Skill> = new Map()

  async loadSkill(skillId: string): Promise<Skill> {
    if (this.skillRegistry.has(skillId)) {
      return this.skillRegistry.get(skillId)!
    }

    const skillPath = path.join(__dirname, '..', 'skills', skillId)
    const skillMdPath = path.join(skillPath, 'SKILL.md')

    // Parse SKILL.md
    const skillConfig = await this.parseSkillMd(skillMdPath)

    // Load scripts and prompts
    const scripts = await this.loadScripts(skillPath)
    const prompts = await this.loadPrompts(skillPath)

    // Create skill instance
    const skill = new Skill(skillConfig, scripts, prompts)

    this.skillRegistry.set(skillId, skill)
    return skill
  }

  private async parseSkillMd(filePath: string): Promise<SkillConfig> {
    const content = await fs.readFile(filePath, 'utf-8')
    return this.parseMarkdown(content)
  }
}
```

### Skill Interface

```typescript
interface Skill {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly triggers: SkillTriggers
  readonly parameters: SkillParameters
  readonly dependencies: SkillDependencies

  canHandle(intent: Intent): boolean
  execute(params: SkillExecutionParams): Promise<SkillResult>
  validateParams(params: any): ValidationResult
}

interface SkillTriggers {
  keywords: string[]
  intents: IntentType[]
  entities: EntityType[]
}

interface SkillExecutionParams {
  query: string
  context: ConversationContext
  additionalParams?: Record<string, any>
}

interface SkillResult {
  success: boolean
  data?: any
  message: string
  suggestions?: string[]
  metadata?: Record<string, any>
}
```

## 📝 Ejemplos de Skills Implementadas

### Skill: genre-based-recommendation

**Ubicación**: `agents/skills/book-recommendation/`

**SKILL.md**:
```markdown
# Skill: genre-based-recommendation

## Descripción
Recomienda libros basados en géneros específicos, considerando las preferencias del usuario y su historial de lectura.

## Triggers
### Keywords
- recomendar
- sugerir
- libros de [género]
- quiero leer [género]

### Intents
- BOOK_RECOMMENDATION

## Parámetros
### Requeridos
- `genre`: string - Género deseado
- `userId`: string - ID del usuario para personalización

### Opcionales
- `limit`: number - Número de recomendaciones (default: 3)
- `excludeRead`: boolean - Excluir libros ya leídos (default: true)

## Respuesta
Lista de libros recomendados con puntuaciones y reseñas cortas.

## Dependencias
### Base de Datos
- `books` table
- `user_reading_history` table

### Scripts
- `genre-matcher.js` - Algoritmo de matching por género
- `personalization-engine.js` - Personalización basada en historial

## Ejemplos
### Input
```
{
  "genre": "ciencia ficción",
  "userId": "user123",
  "limit": 3
}
```

### Output
```
{
  "success": true,
  "data": [
    {
      "title": "Dune",
      "author": "Frank Herbert",
      "score": 0.95,
      "review": "Una epopeya espacial clásica..."
    }
  ],
  "message": "Te recomiendo estos libros de ciencia ficción:"
}
```
```

### Skill: loan-status-checker

**Ubicación**: `agents/skills/loan-management/`

**SKILL.md**:
```markdown
# Skill: loan-status-checker

## Descripción
Consulta el estado actual de préstamos activos de un usuario.

## Triggers
### Keywords
- préstamos
- prestado
- devolver
- vencer

### Intents
- LOAN_MANAGEMENT

## Parámetros
### Requeridos
- `userId`: string - ID del usuario

### Opcionales
- `includeOverdue`: boolean - Incluir solo vencidos (default: false)

## Respuesta
Lista de préstamos activos con fechas de vencimiento.

## Dependencias
### Base de Datos
- `loans` table
- `books` table

## Scripts
- `loan-calculator.js` - Cálculos de fechas y multas

## Ejemplos
### Input
```
{
  "userId": "user123"
}
```

### Output
```
{
  "success": true,
  "data": [
    {
      "bookTitle": "El Quijote",
      "dueDate": "2024-02-15",
      "daysRemaining": 3,
      "isOverdue": false
    }
  ],
  "message": "Tienes 1 libro prestado. El más próximo a vencer es 'El Quijote' en 3 días."
}
```
```

### Skill: semantic-search

**Ubicación**: `agents/skills/_shared/search/`

**SKILL.md**:
```markdown
# Skill: semantic-search

## Descripción
Búsqueda semántica de libros usando embeddings y similitud vectorial.

## Triggers
### Keywords
- buscar
- encontrar
- similar a
- como

### Intents
- BOOK_SEARCH

## Parámetros
### Requeridos
- `query`: string - Término de búsqueda

### Opcionales
- `topK`: number - Número de resultados (default: 10)
- `threshold`: number - Umbral de similitud mínimo (default: 0.7)

## Respuesta
Lista de libros ordenados por relevancia semántica.

## Dependencias
### APIs Externas
- Vector database service
- Embedding service (OpenAI)

## Scripts
- `embedding-generator.js` - Genera embeddings de queries
- `similarity-scorer.js` - Calcula similitudes

## Ejemplos
### Input
```
{
  "query": "libros sobre viajes en el tiempo",
  "topK": 5
}
```

### Output
```
{
  "success": true,
  "data": [
    {
      "title": "The Time Machine",
      "similarity": 0.92,
      "reason": "Viaje temporal directo"
    }
  ],
  "message": "Encontré estos libros relacionados con viajes en el tiempo:"
}
```
```

## 🔄 Skill Registry System

### Registry Configuration

```typescript
interface SkillRegistry {
  [skillId: string]: {
    path: string
    version: string
    dependencies: string[]
    capabilities: SkillCapabilities
  }
}

const skillRegistry: SkillRegistry = {
  'genre-based-recommendation': {
    path: 'book-recommendation',
    version: '1.0.0',
    dependencies: ['books-db', 'user-history'],
    capabilities: {
      requiresAuth: false,
      supportsStreaming: true,
      executionTime: 'fast'
    }
  },
  'loan-status-checker': {
    path: 'loan-management',
    version: '1.0.0',
    dependencies: ['loans-db', 'books-db'],
    capabilities: {
      requiresAuth: true,
      supportsStreaming: false,
      executionTime: 'fast'
    }
  }
}
```

## 📊 Sistema de Versionado y Updates

### Version Management

```typescript
class SkillVersionManager {
  async checkForUpdates(): Promise<SkillUpdate[]> {
    // Check for new versions of skills
    // Compare with registry versions
    // Return list of available updates
  }

  async updateSkill(skillId: string, newVersion: string): Promise<void> {
    // Download new version
    // Validate compatibility
    // Update registry
    // Reload skill
  }
}
```

Este sistema de skills proporciona una arquitectura modular y extensible que permite a los agentes especializados compartir funcionalidades comunes mientras mantienen especialización en sus dominios específicos.