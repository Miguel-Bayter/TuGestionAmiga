# Persistencia de Conversaciones y Contexto

## 💾 Diseño de Base de Datos

La persistencia de conversaciones utiliza Prisma para mantener el estado conversacional entre sesiones, permitir análisis de uso y proporcionar historial completo.

### Schema de Prisma

```prisma
// prisma/schema.prisma
model AgentConversation {
  id            String   @id @default(cuid())
  sessionId     String   @unique
  userId        String
  status        ConversationStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  metadata      Json?
  lastActivity  DateTime @default(now())

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages      AgentMessage[]
  feedback      AgentFeedback[]

  @@index([userId, status])
  @@index([updatedAt])
  @@map("agent_conversations")
}

model AgentMessage {
  id             String      @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String
  agent          String?
  skill          String?
  confidence     Decimal?    @db.Decimal(3, 2)
  timestamp      DateTime    @default(now())
  metadata       Json?

  // Relations
  conversation   AgentConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, timestamp])
  @@map("agent_messages")
}

model AgentFeedback {
  id             String   @id @default(cuid())
  userId         String
  conversationId String
  messageId      String
  rating         Int      // 1-5 stars
  comment        String?
  helpful        Boolean?
  createdAt      DateTime @default(now())

  // Relations
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   AgentConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  message        AgentMessage    @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([userId, createdAt])
  @@map("agent_feedback")
}

model AgentMetrics {
  id                   String   @id @default(cuid())
  date                 Date     @unique
  totalInteractions    Int      @default(0)
  totalUsers           Int      @default(0)
  averageConfidence    Decimal? @db.Decimal(3, 2)
  averageResponseTime  Int?     // milliseconds
  errorsCount          Int      @default(0)
  userSatisfaction     Decimal? @db.Decimal(3, 2)

  @@map("agent_metrics")
}

model AgentSkillMetrics {
  id                   String   @id @default(cuid())
  date                 Date
  agent                String
  skill                String
  usageCount           Int      @default(0)
  averageConfidence    Decimal? @db.Decimal(3, 2)
  averageResponseTime  Int?
  errorsCount          Int      @default(0)
  userSatisfaction     Decimal? @db.Decimal(3, 2)

  @@unique([date, agent, skill])
  @@index([agent, skill])
  @@map("agent_skill_metrics")
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  ERROR
  ARCHIVED
}

enum MessageRole {
  USER
  AGENT
  SYSTEM
}
```

### Migración y Seeds

```typescript
// prisma/migrations/[timestamp]/add_agent_tables/migration.sql
-- Crear tablas para sistema de agentes
CREATE TABLE agent_conversations (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'ERROR', 'ARCHIVED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  metadata JSON,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_updated_at (updated_at)
);

-- Crear tabla de mensajes
CREATE TABLE agent_messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('USER', 'AGENT', 'SYSTEM') NOT NULL,
  content TEXT NOT NULL,
  agent VARCHAR(100),
  skill VARCHAR(100),
  confidence DECIMAL(3,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,

  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation_timestamp (conversation_id, timestamp)
);

-- Crear tabla de feedback
CREATE TABLE agent_feedback (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  conversation_id VARCHAR(36) NOT NULL,
  message_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (message_id) REFERENCES agent_messages(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversation_id),
  INDEX idx_user_created (user_id, created_at)
);
```

## 🔄 Context Manager Implementation

### DatabaseContextManager Class

```typescript
// agents/context/DatabaseContextManager.ts
import { PrismaClient } from '@prisma/client'

export class DatabaseContextManager implements ContextManager {
  constructor(private prisma: PrismaClient) {}

  async getContext(sessionId: string): Promise<ConversationContext> {
    const conversation = await this.prisma.agentConversation.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 50 // Últimos 50 mensajes para contexto
        },
        user: {
          select: {
            id: true,
            name: true,
            preferences: true
          }
        }
      }
    })

    if (!conversation) {
      throw new Error(`Conversation with sessionId ${sessionId} not found`)
    }

    // Convertir mensajes a formato interno
    const messages: Message[] = conversation.messages
      .reverse() // Orden cronológico
      .map(msg => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'agent' | 'system',
        content: msg.content,
        timestamp: msg.timestamp,
        agent: msg.agent || undefined,
        skill: msg.skill || undefined,
        confidence: msg.confidence ? Number(msg.confidence) : undefined,
        metadata: msg.metadata as any
      }))

    return {
      sessionId,
      userId: conversation.userId,
      currentAgent: this.extractCurrentAgent(messages),
      activeSkill: this.extractActiveSkill(messages),
      conversationHistory: messages,
      userPreferences: this.buildUserPreferences(conversation.user),
      sessionMetadata: conversation.metadata as any,
      lastActivity: conversation.lastActivity
    }
  }

  async saveContext(context: ConversationContext): Promise<void> {
    await this.prisma.agentConversation.upsert({
      where: { sessionId: context.sessionId },
      update: {
        status: 'ACTIVE',
        updatedAt: new Date(),
        lastActivity: new Date(),
        metadata: context.sessionMetadata
      },
      create: {
        sessionId: context.sessionId,
        userId: context.userId,
        status: 'ACTIVE',
        metadata: context.sessionMetadata
      }
    })
  }

  async saveMessage(sessionId: string, message: Message): Promise<void> {
    // Asegurar que la conversación existe
    const conversation = await this.prisma.agentConversation.findUnique({
      where: { sessionId }
    })

    if (!conversation) {
      throw new Error(`Conversation ${sessionId} not found`)
    }

    // Guardar mensaje
    await this.prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: message.role.toUpperCase() as any,
        content: message.content,
        agent: message.agent,
        skill: message.skill,
        confidence: message.confidence,
        metadata: message.metadata
      }
    })

    // Actualizar timestamp de conversación
    await this.prisma.agentConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        lastActivity: new Date()
      }
    })
  }

  async getConversationHistory(
    sessionId: string,
    limit = 50,
    offset = 0
  ): Promise<{ messages: Message[], totalCount: number, hasMore: boolean }> {
    const conversation = await this.prisma.agentConversation.findUnique({
      where: { sessionId },
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          orderBy: { timestamp: 'desc' },
          skip: offset,
          take: limit
        }
      }
    })

    if (!conversation) {
      throw new Error(`Conversation ${sessionId} not found`)
    }

    const messages: Message[] = conversation.messages
      .reverse()
      .map(msg => ({
        id: msg.id,
        role: msg.role.toLowerCase() as 'user' | 'agent' | 'system',
        content: msg.content,
        timestamp: msg.timestamp,
        agent: msg.agent || undefined,
        skill: msg.skill || undefined,
        confidence: msg.confidence ? Number(msg.confidence) : undefined,
        metadata: msg.metadata as any
      }))

    return {
      messages,
      totalCount: conversation._count.messages,
      hasMore: offset + limit < conversation._count.messages
    }
  }

  async archiveOldConversations(daysOld = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await this.prisma.agentConversation.updateMany({
      where: {
        updatedAt: {
          lt: cutoffDate
        },
        status: 'ACTIVE'
      },
      data: {
        status: 'ARCHIVED'
      }
    })

    return result.count
  }

  async deleteConversation(sessionId: string): Promise<void> {
    await this.prisma.agentConversation.delete({
      where: { sessionId }
    })
  }

  private extractCurrentAgent(messages: Message[]): string | undefined {
    // Encontrar el último mensaje de agente
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'agent' && messages[i].agent) {
        return messages[i].agent
      }
    }
    return undefined
  }

  private extractActiveSkill(messages: Message[]): string | undefined {
    // Encontrar el último mensaje con skill
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].skill) {
        return messages[i].skill
      }
    }
    return undefined
  }

  private buildUserPreferences(user: any): UserPreferences {
    return {
      favoriteGenres: user.preferences?.favoriteGenres || [],
      preferredLanguage: user.preferences?.preferredLanguage || 'es',
      readingLevel: user.preferences?.readingLevel || 'intermediate',
      notificationPreferences: user.preferences?.notificationPreferences || {}
    }
  }
}
```

## 📊 Metrics Collection

### MetricsCollector Class

```typescript
// agents/metrics/MetricsCollector.ts
import { PrismaClient } from '@prisma/client'

export class MetricsCollector {
  constructor(private prisma: PrismaClient) {}

  async recordInteraction(interaction: InteractionData): Promise<void> {
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    // Actualizar métricas generales
    await this.prisma.agentMetrics.upsert({
      where: { date },
      update: {
        totalInteractions: { increment: 1 },
        totalUsers: {
          set: await this.getUniqueUsersCount(date)
        }
      },
      create: {
        date,
        totalInteractions: 1,
        totalUsers: 1
      }
    })

    // Actualizar métricas por skill
    if (interaction.agent && interaction.skill) {
      await this.prisma.agentSkillMetrics.upsert({
        where: {
          date_agent_skill: {
            date,
            agent: interaction.agent,
            skill: interaction.skill
          }
        },
        update: {
          usageCount: { increment: 1 }
        },
        create: {
          date,
          agent: interaction.agent,
          skill: interaction.skill,
          usageCount: 1
        }
      })
    }

    // Registrar errores si los hay
    if (interaction.error) {
      await this.recordError(date, interaction.error)
    }
  }

  async recordFeedback(feedback: FeedbackData): Promise<void> {
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    // Actualizar satisfacción del usuario
    const averageSatisfaction = await this.calculateAverageSatisfaction(date)

    await this.prisma.agentMetrics.update({
      where: { date },
      data: {
        userSatisfaction: averageSatisfaction
      }
    })
  }

  private async getUniqueUsersCount(date: Date): Promise<number> {
    const startOfDay = new Date(date)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await this.prisma.agentConversation.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    return result.length
  }

  private async recordError(date: Date, error: ErrorData): Promise<void> {
    await this.prisma.agentMetrics.update({
      where: { date },
      data: {
        errorsCount: { increment: 1 }
      }
    })
  }

  private async calculateAverageSatisfaction(date: Date): Promise<number> {
    const feedbacks = await this.prisma.agentFeedback.findMany({
      where: {
        createdAt: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: {
        rating: true
      }
    })

    if (feedbacks.length === 0) return 0

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0)
    return Number((sum / feedbacks.length).toFixed(2))
  }
}
```

## 🔧 Data Migration Scripts

### Migration Helper

```typescript
// scripts/migrate-conversations.ts
import { PrismaClient } from '@prisma/client'

async function migrateConversations() {
  const prisma = new PrismaClient()

  try {
    // Crear índices adicionales si es necesario
    await prisma.$executeRaw`
      ALTER TABLE agent_conversations
      ADD INDEX idx_session_user (session_id, user_id)
    `

    // Migrar datos existentes si los hay
    const existingConversations = await prisma.conversation.findMany()
    // ... lógica de migración

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateConversations()
```

## 🧹 Data Cleanup Jobs

### Cleanup Service

```typescript
// agents/services/CleanupService.ts
export class CleanupService {
  constructor(private prisma: PrismaClient) {}

  async cleanupOldData(): Promise<CleanupResult> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Archivar conversaciones antiguas
    const archivedCount = await this.prisma.agentConversation.updateMany({
      where: {
        updatedAt: { lt: thirtyDaysAgo },
        status: 'ACTIVE'
      },
      data: { status: 'ARCHIVED' }
    })

    // Eliminar conversaciones archivadas muy antiguas (90 días)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const deletedCount = await this.prisma.agentConversation.deleteMany({
      where: {
        updatedAt: { lt: ninetyDaysAgo },
        status: 'ARCHIVED'
      }
    })

    return {
      archivedConversations: archivedCount.count,
      deletedConversations: deletedCount.count
    }
  }

  async cleanupOrphanedData(): Promise<void> {
    // Eliminar mensajes huérfanos
    await this.prisma.$executeRaw`
      DELETE am FROM agent_messages am
      LEFT JOIN agent_conversations ac ON am.conversation_id = ac.id
      WHERE ac.id IS NULL
    `

    // Eliminar feedback huérfano
    await this.prisma.$executeRaw`
      DELETE af FROM agent_feedback af
      LEFT JOIN agent_messages am ON af.message_id = am.id
      WHERE am.id IS NULL
    `
  }
}
```

Esta implementación proporciona una capa de persistencia robusta y escalable para el sistema de agentes, con métricas integradas y capacidad de mantenimiento automático.