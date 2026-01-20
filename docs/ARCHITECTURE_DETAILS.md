# Arquitectura Detallada del Sistema de Agentes

## 🏛️ Arquitectura General

El sistema de agentes se integra como un módulo independiente dentro de la arquitectura Clean existente de Tu Gestion Amiga, siguiendo los principios de separación de responsabilidades y dependency injection.

### Componentes Principales

#### 1. Orchestrator Agent (Agente Orquestador)
```typescript
interface OrchestratorAgent {
  analyzeIntent(message: string, context: UserContext): Promise<AgentRoute>
  routeToSubagent(route: AgentRoute): Promise<AgentResponse>
  manageConversation(sessionId: string): ConversationManager
  handleFallback(query: string): Promise<FallbackResponse>
}
```

**Responsabilidades:**
- Análisis de intenciones del usuario
- Routing a subagentes apropiados
- Gestión de contexto conversacional
- Manejo de fallbacks y errores

#### 2. Subagents (Subagentes Especializados)
Cada subagente implementa la interfaz `SpecializedAgent`:

```typescript
interface SpecializedAgent {
  name: string
  skills: Skill[]
  canHandle(intent: Intent): boolean
  execute(request: AgentRequest): Promise<AgentResponse>
  getAvailableSkills(): Skill[]
}
```

**Subagentes Planificados:**
- `BookRecommenderAgent`
- `LoanAssistantAgent`
- `InventoryManagerAgent`
- `SearchAgent`
- `HelpAgent`

#### 3. Skill System (Sistema de Skills)
Basado en el formato Agent Skills:

```
agents/skills/
├── _shared/           # Skills genéricas
│   ├── conversational/
│   │   ├── SKILL.md
│   │   ├── prompts/
│   │   └── examples/
│   └── search/
│       ├── SKILL.md
│       └── scripts/
├── book-recommendation/
│   ├── SKILL.md
│   ├── instructions.md
│   ├── examples/
│   └── scripts/
├── loan-management/
│   ├── SKILL.md
│   └── prompts/
└── inventory-tracking/
    ├── SKILL.md
    └── utils/
```

### Formato SKILL.md
Cada skill sigue esta estructura:

```markdown
# Skill: [Nombre de la Skill]

## Descripción
Breve descripción de qué hace esta skill.

## Triggers
- Keywords: [lista de palabras clave]
- Intents: [tipos de intenciones que maneja]

## Parámetros
- input: [tipo y descripción]
- context: [contexto requerido]

## Ejemplos de Uso
- "Recomiéndame un libro de ciencia ficción"
- "¿Qué libros tengo prestados?"

## Dependencias
- [Database models requeridos]
- [APIs externas]

## Scripts
- [Utilidades disponibles]
```

#### 4. Intent Detection System (Sistema de Detección de Intenciones)

```typescript
interface IntentDetector {
  detectKeywords(message: string): KeywordMatch[]
  classifyIntent(message: string, context: Context): Promise<Intent>
  calculateConfidence(matches: Match[]): ConfidenceScore
}

interface Intent {
  type: 'recommendation' | 'loan' | 'search' | 'help' | 'inventory'
  confidence: number
  entities: Entity[]
  metadata: Record<string, any>
}
```

**Implementación Híbrida:**
1. **Keyword Matching Rápido**: Para triggers simples
2. **LLM Classification**: Para intenciones complejas
3. **Confidence Scoring**: Combinación de ambos métodos

#### 5. Context Management (Gestión de Contexto)

```typescript
interface ConversationContext {
  sessionId: string
  userId: string
  currentAgent?: string
  conversationHistory: Message[]
  userPreferences: UserPreferences
  activeSkills: Skill[]
  metadata: Record<string, any>
}

interface ContextManager {
  getContext(sessionId: string): Promise<ConversationContext>
  updateContext(sessionId: string, updates: Partial<ConversationContext>): Promise<void>
  persistContext(context: ConversationContext): Promise<void>
}
```

### Integración con Arquitectura Existente

#### Backend Integration
```
apps/backend/src/
├── agents/                    # Nuevo módulo
│   ├── orchestrator/
│   │   ├── OrchestratorAgent.ts
│   │   ├── IntentDetector.ts
│   │   └── ContextManager.ts
│   ├── subagents/
│   │   ├── BookRecommenderAgent.ts
│   │   ├── LoanAssistantAgent.ts
│   │   └── ...
│   ├── skills/
│   │   ├── index.ts
│   │   └── loader.ts
│   └── types/
│       ├── agent.types.ts
│       └── skill.types.ts
├── routes/
│   └── agents.routes.ts        # Nuevo
├── services/
│   └── agents.service.ts       # Nuevo
└── middleware/
    └── agents.middleware.ts    # Nuevo
```

#### Frontend Integration
```
apps/frontend/src/
├── presentation/
│   ├── features/
│   │   └── agents/             # Nueva feature
│   │       ├── components/
│   │       │   ├── ChatWidget.tsx
│   │       │   ├── AgentSelector.tsx
│   │       │   └── MessageBubble.tsx
│   │       ├── pages/
│   │       │   └── chat.page.tsx
│   │       └── stores/
│   │           └── agents.store.ts
│   └── shared/
│       └── components/
│           └── AgentFab.tsx     # Floating Action Button
└── domain/
    ├── Entity/
    │   └── agent.entity.ts     # Nuevo
    └── Repository/
        └── agents.repository.ts # Nuevo
```

### Flujo de Datos

1. **Usuario envía mensaje** → Frontend
2. **Frontend** → API `/api/agents/chat`
3. **Middleware** valida autenticación y sanitiza input
4. **OrchestratorAgent** recibe mensaje
5. **IntentDetector** analiza intención
6. **Routing** a subagente apropiado
7. **Subagente** ejecuta con skills relevantes
8. **Respuesta** retorna al usuario
9. **ContextManager** actualiza estado de conversación

### Seguridad y Performance

#### Seguridad
- Rate limiting por usuario/sesión
- Sanitización de inputs con Zod
- Encriptación de contexto sensible
- Autenticación JWT requerida
- Logs de auditoría

#### Performance
- Caching de respuestas comunes
- Lazy loading de skills
- Connection pooling para LLM
- Background processing para tasks pesadas
- CDN para assets estáticos

### Escalabilidad

#### Horizontal Scaling
- Stateless agents (contexto en DB)
- Queue system para requests pesadas
- Load balancing entre instancias

#### Vertical Scaling
- Memory optimization para skills grandes
- Efficient data structures para context
- Streaming responses para mejor UX

### Testing Strategy

#### Unit Tests
- Skills individuales
- Intent detection accuracy
- Agent routing logic

#### Integration Tests
- End-to-end conversations
- API endpoints
- Database operations

#### Performance Tests
- Response times
- Concurrent users
- Memory usage

### Métricas y Monitoreo

#### KPIs
- User satisfaction scores
- Response accuracy
- Conversation completion rates
- Agent utilization

#### Monitoring
- Error rates por agent/skill
- Performance metrics
- Usage analytics
- A/B testing para improvements

### Próximos Pasos de Diseño

1. **Definir interfaces TypeScript** detalladas
2. **Crear prototipos** de subagentes básicos
3. **Implementar proof-of-concept** del orquestador
4. **Diseñar sistema de feedback** de usuarios
5. **Planificar migración** y deployment strategy