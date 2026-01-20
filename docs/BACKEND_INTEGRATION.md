# Integración de Agentes en el Backend

## 🏗️ Arquitectura de Integración

Los agentes se integran como un módulo independiente en el backend existente, manteniendo la separación de responsabilidades y siguiendo la arquitectura Clean existente.

### Estructura de Integración

```
apps/backend/src/
├── agents/                    # 🆕 Nuevo módulo
│   ├── orchestrator/
│   │   ├── OrchestratorAgent.ts
│   │   ├── IntentDetector.ts
│   │   └── ContextManager.ts
│   ├── subagents/
│   │   ├── BookRecommenderAgent.ts
│   │   ├── LoanAssistantAgent.ts
│   │   ├── InventoryManagerAgent.ts
│   │   ├── SearchAgent.ts
│   │   └── HelpAgent.ts
│   ├── skills/
│   │   ├── loader.ts
│   │   ├── executor.ts
│   │   └── registry.ts
│   ├── triggers/
│   │   ├── KeywordMatcher.ts
│   │   ├── IntentAnalyzer.ts
│   │   └── TriggerSystem.ts
│   ├── types/
│   │   ├── agent.types.ts
│   │   ├── skill.types.ts
│   │   └── trigger.types.ts
│   ├── config/
│   │   └── agents.config.ts
│   └── index.ts
├── routes/
│   └── agents.routes.ts        # 🆕 Nuevo
├── middleware/
│   └── agents.middleware.ts    # 🆕 Nuevo
├── services/
│   └── agents.service.ts       # 🆕 Nuevo
└── ...
```

## 🌐 API Endpoints

### Endpoints Principales

#### POST `/api/agents/chat`
**Procesar mensaje del usuario y obtener respuesta del agente**

**Request Body:**
```typescript
interface ChatRequest {
  message: string
  sessionId?: string  // Opcional, se genera si no existe
  context?: {
    userPreferences?: UserPreferences
    conversationHistory?: Message[]
  }
}
```

**Response:**
```typescript
interface ChatResponse {
  success: boolean
  message: string
  agent: string
  skill: string
  confidence: number
  sessionId: string
  suggestions?: string[]
  actions?: AgentAction[]
  error?: string
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/api/agents/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "message": "Recomiéndame un libro de ciencia ficción",
    "sessionId": "session_123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Te recomiendo estos libros de ciencia ficción:",
  "agent": "BookRecommenderAgent",
  "skill": "genre-based-recommendation",
  "confidence": 0.92,
  "sessionId": "session_123",
  "suggestions": ["Prueba también fantasía épica"],
  "actions": [
    {
      "type": "reserve_book",
      "label": "Reservar Dune",
      "bookId": "uuid-123"
    }
  ]
}
```

#### GET `/api/agents/history/:sessionId`
**Obtener historial de conversación**

**Query Parameters:**
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```typescript
interface ConversationHistory {
  sessionId: string
  messages: Message[]
  totalCount: number
  hasMore: boolean
}
```

#### POST `/api/agents/feedback`
**Enviar feedback sobre respuesta de agente**

**Request Body:**
```typescript
interface FeedbackRequest {
  sessionId: string
  messageId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  helpful: boolean
}
```

#### GET `/api/agents/agents`
**Listar agentes disponibles**

**Response:**
```typescript
interface AgentsList {
  agents: AgentInfo[]
}

interface AgentInfo {
  id: string
  name: string
  description: string
  capabilities: string[]
  status: 'active' | 'maintenance' | 'disabled'
}
```

#### GET `/api/agents/skills`
**Listar skills disponibles**

**Query Parameters:**
- `agent`: string (filtrar por agente)

## 🔐 Middleware de Autenticación

### AgentsAuthMiddleware

```typescript
class AgentsAuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Token de autenticación requerido'
        })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
      req.user = await this.getUserById(decoded.userId)

      // Verificar permisos para agentes
      if (!this.hasAgentAccess(req.user)) {
        return res.status(403).json({
          success: false,
          error: 'Acceso no autorizado a agentes'
        })
      }

      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      })
    }
  }

  private hasAgentAccess(user: User): boolean {
    // Lógica de permisos
    return user.role === 'USER' || user.role === 'ADMIN'
  }
}
```

### Rate Limiting para Agentes

```typescript
const agentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each user to 100 requests per windowMs
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor espera antes de continuar.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip
  }
})
```

## 🛠️ Agents Service

### AgentsService Class

```typescript
class AgentsService {
  private orchestrator: OrchestratorAgent
  private conversationManager: ConversationManager
  private metricsCollector: MetricsCollector

  async processChat(request: ChatRequest, user: User): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      // 1. Obtener o crear sesión
      const sessionId = request.sessionId || await this.createSession(user.id)

      // 2. Construir contexto
      const context = await this.buildConversationContext(sessionId, request, user)

      // 3. Procesar mensaje con orquestador
      const result = await this.orchestrator.processMessage({
        content: request.message,
        sessionId,
        userId: user.id,
        timestamp: new Date(),
        context
      })

      // 4. Guardar en historial
      await this.saveMessage(sessionId, {
        role: 'user',
        content: request.message,
        timestamp: new Date()
      })

      await this.saveMessage(sessionId, {
        role: 'agent',
        content: result.message,
        agent: result.agent,
        skill: result.skill,
        timestamp: new Date()
      })

      // 5. Recopilar métricas
      await this.metricsCollector.recordInteraction({
        sessionId,
        userId: user.id,
        agent: result.agent,
        skill: result.skill,
        confidence: result.confidence,
        processingTime: Date.now() - startTime
      })

      return {
        success: true,
        message: result.message,
        agent: result.agent,
        skill: result.skill,
        confidence: result.confidence,
        sessionId,
        suggestions: result.suggestions,
        actions: result.actions
      }

    } catch (error) {
      await this.metricsCollector.recordError(error)
      throw new ApiError(500, 'Error procesando mensaje del agente')
    }
  }
}
```

## 💾 Modelo de Base de Datos

### Nuevas Tablas para Agentes

```sql
-- Conversaciones de agentes
CREATE TABLE agent_conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'error') DEFAULT 'active',
  metadata JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_session (user_id, session_id),
  INDEX idx_status (status)
);

-- Mensajes de conversación
CREATE TABLE agent_messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'agent', 'system') NOT NULL,
  content TEXT NOT NULL,
  agent VARCHAR(100),
  skill VARCHAR(100),
  confidence DECIMAL(3,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_timestamp (conversation_id, timestamp)
);

-- Feedback de usuarios
CREATE TABLE agent_feedback (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  conversation_id VARCHAR(36) NOT NULL,
  message_id VARCHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES agent_messages(id) ON DELETE CASCADE
);

-- Métricas de uso
CREATE TABLE agent_metrics (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  agent VARCHAR(100),
  skill VARCHAR(100),
  interactions_count INT DEFAULT 0,
  average_confidence DECIMAL(3,2),
  average_response_time INT, -- milliseconds
  errors_count INT DEFAULT 0,
  user_satisfaction DECIMAL(3,2),
  UNIQUE KEY unique_agent_skill_date (agent, skill, date)
);
```

## 🔄 Context Manager para Base de Datos

### DatabaseContextManager

```typescript
class DatabaseContextManager implements ContextManager {
  async getContext(sessionId: string): Promise<ConversationContext> {
    const conversation = await prisma.agentConversations.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 20 // Últimos 20 mensajes
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    return {
      sessionId,
      userId: conversation.userId,
      conversationHistory: conversation.messages.reverse(), // Orden cronológico
      metadata: conversation.metadata as any,
      lastActivity: conversation.updatedAt
    }
  }

  async saveMessage(sessionId: string, message: Message): Promise<void> {
    const conversation = await prisma.agentConversations.findUnique({
      where: { sessionId }
    })

    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    await prisma.agentMessages.create({
      data: {
        conversationId: conversation.id,
        role: message.role,
        content: message.content,
        agent: message.agent,
        skill: message.skill,
        confidence: message.confidence,
        metadata: message.metadata
      }
    })

    // Actualizar timestamp de conversación
    await prisma.agentConversations.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    })
  }
}
```

## 📊 Health Checks y Monitoreo

### Agent Health Endpoint

```typescript
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Verificar conectividad con servicios externos
    const openaiStatus = await checkOpenAIConnection()
    const dbStatus = await checkDatabaseConnection()

    // Verificar estado de agentes
    const agentsStatus = await checkAgentsStatus()

    const isHealthy = openaiStatus && dbStatus && agentsStatus.allActive

    res.json({
      success: true,
      status: isHealthy ? 'healthy' : 'degraded',
      services: {
        openai: openaiStatus,
        database: dbStatus,
        agents: agentsStatus
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    })
  }
})
```

### Métricas Endpoint

```typescript
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await prisma.agentMetrics.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        }
      },
      orderBy: { date: 'desc' }
    })

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error obteniendo métricas'
    })
  }
})
```

## 🔧 Configuración y Inicialización

### Agents Module Initialization

```typescript
// agents/index.ts
import { OrchestratorAgent } from './orchestrator/OrchestratorAgent'
import { SkillLoader } from './skills/loader'
import { TriggerSystem } from './triggers/TriggerSystem'
import { DatabaseContextManager } from './context/DatabaseContextManager'

export async function initializeAgents(): Promise<OrchestratorAgent> {
  // 1. Cargar configuración
  const config = loadAgentConfig()

  // 2. Inicializar componentes
  const skillLoader = new SkillLoader()
  const triggerSystem = new TriggerSystem()
  const contextManager = new DatabaseContextManager()

  // 3. Cargar skills
  await skillLoader.loadAllSkills()

  // 4. Crear orquestador
  const orchestrator = new OrchestratorAgent({
    skillLoader,
    triggerSystem,
    contextManager,
    config
  })

  // 5. Inicializar subagentes
  await orchestrator.initializeSubagents()

  return orchestrator
}
```

### Integration in Main App

```typescript
// app.ts
import { initializeAgents } from './agents'
import agentsRoutes from './routes/agents.routes'

async function createApp() {
  const app = express()

  // ... existing middleware ...

  // Initialize agents
  const orchestrator = await initializeAgents()

  // Make orchestrator available in routes
  app.set('orchestrator', orchestrator)

  // Agent routes
  app.use('/api/agents', agentsRoutes)

  return app
}
```

Esta integración proporciona una base sólida para que los agentes funcionen dentro del backend existente, manteniendo la arquitectura limpia y agregando las funcionalidades necesarias para el sistema de agentes.