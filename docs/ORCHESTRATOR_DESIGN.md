# Diseño del Orquestador Principal

## 🎯 Rol del Orquestador

El `OrchestratorAgent` es el componente central que coordina toda la interacción entre usuarios y subagentes. Actúa como un "cerebro" que entiende las intenciones del usuario, selecciona el subagente apropiado, gestiona el contexto conversacional y asegura una experiencia coherente.

## 🏗️ Arquitectura Interna

### Componentes del Orquestador

```typescript
class OrchestratorAgent {
  private intentDetector: IntentDetector
  private contextManager: ContextManager
  private subagents: Map<string, SpecializedAgent>
  private skillLoader: SkillLoader
  private fallbackHandler: FallbackHandler

  constructor(config: OrchestratorConfig) {
    // Inicialización de componentes
  }

  async processMessage(message: UserMessage): Promise<AgentResponse> {
    // Flujo principal de procesamiento
  }
}
```

### Flujo de Procesamiento

```typescript
interface UserMessage {
  content: string
  sessionId: string
  userId: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface AgentResponse {
  message: string
  agent: string
  skill: string
  confidence: number
  suggestions?: string[]
  actions?: AgentAction[]
  metadata: ResponseMetadata
}
```

## 🔍 Sistema de Detección de Intenciones

### IntentDetector Class

```typescript
class IntentDetector {
  private keywordMatcher: KeywordMatcher
  private llmClassifier: LLMClassifier
  private confidenceCalculator: ConfidenceCalculator

  async detectIntent(message: string, context: ConversationContext): Promise<Intent> {
    // 1. Keyword matching rápido
    const keywordMatches = this.keywordMatcher.match(message)

    // 2. Si confianza baja, usar LLM
    if (keywordMatches.confidence < 0.7) {
      const llmIntent = await this.llmClassifier.classify(message, context)
      return this.confidenceCalculator.combine(keywordMatches, llmIntent)
    }

    return keywordMatches
  }
}
```

### Tipos de Intenciones

```typescript
enum IntentType {
  BOOK_RECOMMENDATION = 'book_recommendation',
  LOAN_MANAGEMENT = 'loan_management',
  BOOK_SEARCH = 'book_search',
  INVENTORY_CHECK = 'inventory_check',
  HELP_REQUEST = 'help_request',
  GENERAL_CONVERSATION = 'general_conversation',
  UNKNOWN = 'unknown'
}

interface Intent {
  type: IntentType
  confidence: number
  entities: ExtractedEntity[]
  metadata: Record<string, any>
}

interface ExtractedEntity {
  type: 'book_title' | 'author' | 'genre' | 'user_action' | 'date'
  value: string
  confidence: number
  position: { start: number, end: number }
}
```

## 🎯 Sistema de Routing

### Router Logic

```typescript
class AgentRouter {
  private routingRules: RoutingRule[]

  selectAgent(intent: Intent, context: ConversationContext): AgentSelection {
    // 1. Filtrar agentes candidatos
    const candidates = this.routingRules
      .filter(rule => rule.matches(intent, context))
      .map(rule => ({
        agent: rule.agent,
        score: rule.calculateScore(intent, context)
      }))

    // 2. Ordenar por score
    candidates.sort((a, b) => b.score - a.score)

    // 3. Retornar mejor candidato
    return candidates[0] || this.getFallbackAgent()
  }
}

interface RoutingRule {
  agent: string
  intentTypes: IntentType[]
  keywords: string[]
  contextConditions: ContextCondition[]

  matches(intent: Intent, context: ConversationContext): boolean
  calculateScore(intent: Intent, context: ConversationContext): number
}
```

### Reglas de Routing por Defecto

```typescript
const defaultRoutingRules: RoutingRule[] = [
  {
    agent: 'BookRecommenderAgent',
    intentTypes: [IntentType.BOOK_RECOMMENDATION],
    keywords: ['recomendar', 'sugerir', 'leer', 'interesante'],
    contextConditions: []
  },
  {
    agent: 'LoanAssistantAgent',
    intentTypes: [IntentType.LOAN_MANAGEMENT],
    keywords: ['prestar', 'devolver', 'renovar', 'préstamo'],
    contextConditions: []
  },
  {
    agent: 'SearchAgent',
    intentTypes: [IntentType.BOOK_SEARCH],
    keywords: ['buscar', 'encontrar', 'hay', 'disponible'],
    contextConditions: []
  },
  // ... más reglas
]
```

## 💬 Gestión de Contexto Conversacional

### ContextManager Class

```typescript
class ContextManager {
  private prisma: PrismaClient
  private cache: ContextCache

  async getContext(sessionId: string): Promise<ConversationContext> {
    // 1. Check cache first
    const cached = await this.cache.get(sessionId)
    if (cached) return cached

    // 2. Load from database
    const dbContext = await this.prisma.conversationContext.findUnique({
      where: { sessionId },
      include: { messages: { orderBy: { timestamp: 'desc' }, take: 10 } }
    })

    // 3. Cache and return
    const context = this.buildContext(dbContext)
    await this.cache.set(sessionId, context)
    return context
  }

  async updateContext(sessionId: string, updates: Partial<ConversationContext>): Promise<void> {
    // Update both cache and database
    await this.cache.update(sessionId, updates)
    await this.prisma.conversationContext.update({
      where: { sessionId },
      data: updates
    })
  }
}
```

### ConversationContext Interface

```typescript
interface ConversationContext {
  sessionId: string
  userId: string
  currentAgent?: string
  activeSkill?: string
  conversationHistory: Message[]
  userPreferences: UserPreferences
  sessionMetadata: SessionMetadata
  lastActivity: Date
}

interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  agent?: string
  skill?: string
  intent?: Intent
  metadata?: Record<string, any>
}

interface UserPreferences {
  favoriteGenres: string[]
  preferredLanguage: string
  readingLevel: 'beginner' | 'intermediate' | 'advanced'
  notificationPreferences: NotificationPrefs
}
```

## 🔄 Manejo de Estados del Orquestador

### Estados del Orquestador

```typescript
enum OrchestratorState {
  IDLE = 'idle',
  ANALYZING_INTENT = 'analyzing_intent',
  ROUTING = 'routing',
  EXECUTING = 'executing',
  GENERATING_RESPONSE = 'generating_response',
  ERROR = 'error'
}

class OrchestratorStateManager {
  private currentState: OrchestratorState = OrchestratorState.IDLE
  private stateHistory: StateTransition[] = []

  async transitionTo(state: OrchestratorState, context?: any): Promise<void> {
    const transition: StateTransition = {
      from: this.currentState,
      to: state,
      timestamp: new Date(),
      context
    }

    this.stateHistory.push(transition)
    this.currentState = state

    // Log transition for monitoring
    await this.logTransition(transition)
  }
}
```

## 🛡️ Manejo de Errores y Fallbacks

### FallbackHandler Class

```typescript
class FallbackHandler {
  private helpAgent: HelpAgent
  private errorClassifier: ErrorClassifier

  async handleError(error: AgentError, context: ConversationContext): Promise<FallbackResponse> {
    const errorType = this.errorClassifier.classify(error)

    switch (errorType) {
      case 'intent_not_recognized':
        return this.handleUnrecognizedIntent(context)

      case 'agent_unavailable':
        return this.handleAgentUnavailable(error.agent, context)

      case 'skill_execution_failed':
        return this.handleSkillFailure(error.skill, context)

      default:
        return this.handleGenericError(error, context)
    }
  }

  private async handleUnrecognizedIntent(context: ConversationContext): Promise<FallbackResponse> {
    const suggestions = await this.generateSuggestions(context)

    return {
      message: "No estoy seguro de cómo ayudarte. ¿Podrías reformular tu pregunta?",
      suggestions,
      actions: [
        { type: 'show_help', label: 'Ver opciones de ayuda' },
        { type: 'suggest_examples', examples: suggestions }
      ]
    }
  }
}
```

## 📊 Monitoreo y Analytics

### Metrics Collector

```typescript
class OrchestratorMetrics {
  private metrics: MetricsClient

  async recordInteraction(interaction: InteractionData): Promise<void> {
    await this.metrics.increment('interactions.total')

    if (interaction.intent) {
      await this.metrics.increment(`intents.${interaction.intent.type}`)
    }

    if (interaction.agent) {
      await this.metrics.increment(`agents.${interaction.agent}.usage`)
    }

    if (interaction.error) {
      await this.metrics.increment('errors.total')
      await this.metrics.increment(`errors.${interaction.error.type}`)
    }
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      averageResponseTime: await this.metrics.average('response_time'),
      intentAccuracy: await this.metrics.average('intent_confidence'),
      errorRate: await this.metrics.rate('errors.total'),
      agentUtilization: await this.getAgentUtilization()
    }
  }
}
```

## 🔧 Configuración del Orquestador

### OrchestratorConfig Interface

```typescript
interface OrchestratorConfig {
  // Intent detection
  intentDetection: {
    keywordThreshold: number
    llmThreshold: number
    enableLLM: boolean
    llmModel: string
  }

  // Routing
  routing: {
    minConfidenceThreshold: number
    enableFallbackRouting: boolean
    routingRules: RoutingRule[]
  }

  // Context management
  context: {
    maxHistoryLength: number
    cacheTTL: number
    persistenceEnabled: boolean
  }

  // Error handling
  errorHandling: {
    maxRetries: number
    fallbackEnabled: boolean
    errorLoggingEnabled: boolean
  }

  // Performance
  performance: {
    enableCaching: boolean
    enableParallelProcessing: boolean
    timeoutMs: number
  }
}
```

## 🚀 Inicialización y Lifecycle

### Bootstrap Process

```typescript
async function initializeOrchestrator(): Promise<OrchestratorAgent> {
  // 1. Load configuration
  const config = await loadConfig()

  // 2. Initialize components
  const intentDetector = new IntentDetector(config.intentDetection)
  const contextManager = new ContextManager(config.context)
  const skillLoader = new SkillLoader()

  // 3. Load subagents
  const subagents = await loadSubagents(skillLoader)

  // 4. Create orchestrator
  const orchestrator = new OrchestratorAgent({
    intentDetector,
    contextManager,
    subagents,
    skillLoader,
    config
  })

  // 5. Initialize metrics and monitoring
  await setupMonitoring(orchestrator)

  return orchestrator
}
```

Este diseño proporciona un orquestador robusto, escalable y mantenible que puede crecer con las necesidades del sistema de agentes.