# Definición de Subagentes Especializados

## 🏗️ Arquitectura de Subagentes

Cada subagente implementa la interfaz `SpecializedAgent` y se especializa en un dominio específico de la biblioteca. Los subagentes pueden compartir skills genéricas pero tienen skills específicas de su dominio.

### Interfaz Base

```typescript
interface SpecializedAgent {
  readonly name: string
  readonly domain: AgentDomain
  readonly skills: Skill[]

  canHandle(intent: Intent): boolean
  execute(request: AgentRequest): Promise<AgentResponse>
  getAvailableSkills(): Skill[]
  getCapabilities(): AgentCapabilities
}

interface AgentCapabilities {
  supportedIntents: IntentType[]
  supportedEntities: EntityType[]
  confidenceThreshold: number
  requiresAuthentication: boolean
  supportsStreaming: boolean
}
```

## 📚 BookRecommenderAgent

**Dominio**: Recomendaciones de libros y descubrimiento literario

### Responsabilidades
- Analizar preferencias de usuario
- Recomendar libros basados en historial de lectura
- Sugerir libros por género, autor, tema
- Proporcionar reseñas y descripciones
- Crear listas de lectura personalizadas

### Skills Específicas
- `genre-based-recommendation`
- `author-based-recommendation`
- `mood-based-recommendation`
- `similar-books-finder`
- `reading-list-creator`

### Triggers
- Keywords: "recomendar", "sugerir", "leer", "interesante", "gusta"
- Intents: `BOOK_RECOMMENDATION`, `DISCOVERY`
- Entities: `genre`, `author`, `mood`, `theme`

### Ejemplo de Interacción
```
Usuario: "Recomiéndame un libro de ciencia ficción"
→ BookRecommenderAgent (confidence: 0.95)
   - Analiza historial del usuario
   - Filtra por género "ciencia ficción"
   - Retorna 3-5 recomendaciones con reseñas cortas
```

### Configuración
```typescript
const bookRecommenderConfig: AgentConfig = {
  name: 'BookRecommenderAgent',
  domain: AgentDomain.BOOKS,
  skills: ['genre-recommendation', 'author-recommendation', 'mood-recommendation'],
  confidenceThreshold: 0.8,
  requiresAuthentication: false,
  supportsStreaming: true
}
```

## 📖 LoanAssistantAgent

**Dominio**: Gestión de préstamos y devoluciones

### Responsabilidades
- Consultar estado de préstamos activos
- Gestionar renovaciones de libros
- Procesar solicitudes de devolución
- Calcular fechas de vencimiento
- Recordar devoluciones próximas

### Skills Específicas
- `loan-status-checker`
- `book-renewal-processor`
- `return-scheduler`
- `overdue-notifier`
- `loan-history-viewer`

### Triggers
- Keywords: "prestar", "devolver", "renovar", "préstamo", "vencido"
- Intents: `LOAN_MANAGEMENT`, `RETURN_PROCESS`
- Entities: `book_title`, `due_date`, `loan_action`

### Ejemplo de Interacción
```
Usuario: "¿Cuándo vence mi préstamo de 'El Quijote'?"
→ LoanAssistantAgent (confidence: 0.92)
   - Consulta BD de préstamos
   - Retorna fecha de vencimiento
   - Sugiere renovación si está próxima
```

### Configuración
```typescript
const loanAssistantConfig: AgentConfig = {
  name: 'LoanAssistantAgent',
  domain: AgentDomain.LOANS,
  skills: ['loan-checker', 'renewal-processor', 'return-handler'],
  confidenceThreshold: 0.85,
  requiresAuthentication: true,
  supportsStreaming: false
}
```

## 📦 InventoryManagerAgent

**Dominio**: Control de inventario y adquisiciones

### Responsabilidades
- Verificar disponibilidad de libros
- Gestionar pedidos de nuevos libros
- Monitorear stock bajo
- Sugerir adquisiciones basadas en demanda
- Reportar estadísticas de inventario

### Skills Específicas
- `stock-checker`
- `availability-verifier`
- `restock-suggester`
- `inventory-reporter`
- `acquisition-planner`

### Triggers
- Keywords: "disponible", "hay", "stock", "comprar", "pedir"
- Intents: `INVENTORY_CHECK`, `ACQUISITION`
- Entities: `book_title`, `quantity`, `location`

### Ejemplo de Interacción
```
Usuario: "¿Tienen 'Cien años de soledad' disponible?"
→ InventoryManagerAgent (confidence: 0.88)
   - Consulta inventario
   - Retorna estado de disponibilidad
   - Sugiere reserva si no disponible
```

### Configuración
```typescript
const inventoryManagerConfig: AgentConfig = {
  name: 'InventoryManagerAgent',
  domain: AgentDomain.INVENTORY,
  skills: ['stock-checker', 'availability-verifier', 'restock-planner'],
  confidenceThreshold: 0.82,
  requiresAuthentication: false,
  supportsStreaming: true
}
```

## 🔍 SearchAgent

**Dominio**: Búsqueda avanzada y filtrado

### Responsabilidades
- Búsqueda por título, autor, ISBN
- Filtrado por género, año, idioma
- Búsqueda semántica de contenido
- Sugerencias de búsqueda
- Resultados paginados

### Skills Específicas
- `text-search`
- `semantic-search`
- `filter-applier`
- `result-ranker`
- `search-suggester`

### Triggers
- Keywords: "buscar", "encontrar", "filtrar", "por", "de"
- Intents: `BOOK_SEARCH`, `FILTERING`
- Entities: `search_query`, `filter_criteria`, `sort_order`

### Ejemplo de Interacción
```
Usuario: "Busca libros de Gabriel García Márquez en español"
→ SearchAgent (confidence: 0.91)
   - Ejecuta búsqueda con filtros
   - Retorna resultados ordenados por relevancia
   - Proporciona opciones de paginación
```

### Configuración
```typescript
const searchAgentConfig: AgentConfig = {
  name: 'SearchAgent',
  domain: AgentDomain.SEARCH,
  skills: ['text-search', 'semantic-search', 'filter-processor'],
  confidenceThreshold: 0.78,
  requiresAuthentication: false,
  supportsStreaming: true
}
```

## ❓ HelpAgent

**Dominio**: Asistencia general y soporte

### Responsabilidades
- Responder preguntas frecuentes
- Guiar a usuarios nuevos
- Explicar funcionalidades del sistema
- Derivar a agentes especializados
- Manejar consultas generales

### Skills Específicas
- `faq-responder`
- `tutorial-provider`
- `feature-explainer`
- `guidance-offerer`
- `fallback-handler`

### Triggers
- Keywords: "ayuda", "cómo", "qué", "dónde", "cuándo"
- Intents: `HELP_REQUEST`, `GENERAL_INFO`
- Entities: `help_topic`, `user_level`

### Ejemplo de Interacción
```
Usuario: "¿Cómo puedo renovar un libro?"
→ HelpAgent (confidence: 0.75) → Deriva a LoanAssistantAgent
   - Explica proceso básico
   - Sugiere hablar con agente especializado
   - Proporciona enlaces a documentación
```

### Configuración
```typescript
const helpAgentConfig: AgentConfig = {
  name: 'HelpAgent',
  domain: AgentDomain.HELP,
  skills: ['faq-responder', 'tutorial-provider', 'guidance-offerer'],
  confidenceThreshold: 0.7,
  requiresAuthentication: false,
  supportsStreaming: false
}
```

## 🔄 Skills Genéricos Compartidos

### Conversational Skills
- `greeting-handler`: Maneja saludos y despedidas
- `context-maintainer`: Mantiene contexto conversacional
- `clarification-seeker`: Pide aclaraciones cuando es necesario

### Data Skills
- `database-query`: Consultas a base de datos
- `cache-manager`: Gestión de caché
- `data-formatter`: Formateo de resultados

### Utility Skills
- `error-handler`: Manejo de errores
- `logging-agent`: Logging de interacciones
- `metrics-collector`: Recolección de métricas

## 🎯 Sistema de Confianza y Selección

### Cálculo de Confianza
```typescript
class AgentSelector {
  calculateAgentConfidence(agent: SpecializedAgent, intent: Intent): number {
    let confidence = 0

    // Base confidence por tipo de intención
    if (agent.getCapabilities().supportedIntents.includes(intent.type)) {
      confidence += 0.4
    }

    // Bonus por entities reconocidas
    const recognizedEntities = intent.entities.filter(entity =>
      agent.getCapabilities().supportedEntities.includes(entity.type)
    )
    confidence += recognizedEntities.length * 0.1

    // Bonus por skills disponibles
    const relevantSkills = agent.skills.filter(skill =>
      skill.canHandle(intent)
    )
    confidence += relevantSkills.length * 0.15

    // Penalty por baja especialización
    if (agent.domain === AgentDomain.HELP) {
      confidence *= 0.8
    }

    return Math.min(confidence, 1.0)
  }
}
```

### Estrategia de Selección
1. **Primera pasada**: Agentes con confianza > 0.8
2. **Segunda pasada**: Mejor agente si ninguno supera threshold
3. **Fallback**: HelpAgent si confianza < 0.5

## 🔧 Implementación Base

### SpecializedAgent Base Class
```typescript
abstract class BaseSpecializedAgent implements SpecializedAgent {
  abstract readonly name: string
  abstract readonly domain: AgentDomain
  abstract readonly skills: Skill[]

  protected skillExecutor: SkillExecutor
  protected contextManager: ContextManager

  async execute(request: AgentRequest): Promise<AgentResponse> {
    // 1. Validar request
    this.validateRequest(request)

    // 2. Seleccionar skill apropiada
    const skill = this.selectSkill(request.intent)

    // 3. Ejecutar skill
    const result = await this.skillExecutor.execute(skill, request)

    // 4. Formatear respuesta
    return this.formatResponse(result, request.context)
  }

  abstract canHandle(intent: Intent): boolean
  abstract getCapabilities(): AgentCapabilities

  // Métodos helper
  protected validateRequest(request: AgentRequest): void { /* ... */ }
  protected selectSkill(intent: Intent): Skill { /* ... */ }
  protected formatResponse(result: any, context: ConversationContext): AgentResponse { /* ... */ }
}
```

Este diseño permite que cada subagente sea especializado en su dominio mientras mantiene una interfaz común y puede compartir skills genéricas según sea necesario.