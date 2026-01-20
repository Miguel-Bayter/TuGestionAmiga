# Sistema de Aprendizaje Continuo y Feedback

## 🎯 Sistema de Aprendizaje Continuo

El sistema de aprendizaje continuo permite que los agentes mejoren automáticamente basado en interacciones con usuarios, feedback explícito y análisis de patrones de uso.

### Componentes del Sistema

#### 1. Feedback Collector (Recopilador de Feedback)

```typescript
// agents/learning/FeedbackCollector.ts
interface UserFeedback {
  conversationId: string
  messageId: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  helpful?: boolean
  userId: string
  timestamp: Date
}

interface SkillPerformance {
  skillId: string
  agentId: string
  successRate: number
  averageConfidence: number
  averageResponseTime: number
  userSatisfaction: number
  usageCount: number
  lastUpdated: Date
}

class FeedbackCollector {
  constructor(private prisma: PrismaClient) {}

  async collectFeedback(feedback: UserFeedback): Promise<void> {
    // Guardar feedback en base de datos
    await this.prisma.agentFeedback.create({
      data: {
        userId: feedback.userId,
        conversationId: feedback.conversationId,
        messageId: feedback.messageId,
        rating: feedback.rating,
        comment: feedback.comment,
        helpful: feedback.helpful
      }
    })

    // Actualizar métricas de rendimiento
    await this.updateSkillPerformance(feedback)

    // Trigger learning si es necesario
    if (this.shouldTriggerLearning(feedback)) {
      await this.triggerLearningProcess(feedback)
    }
  }

  private async updateSkillPerformance(feedback: UserFeedback): Promise<void> {
    // Obtener información del mensaje
    const message = await this.prisma.agentMessage.findUnique({
      where: { id: feedback.messageId },
      include: { conversation: true }
    })

    if (!message?.skill || !message?.agent) return

    const date = new Date()
    date.setHours(0, 0, 0, 0)

    // Actualizar métricas por skill
    await this.prisma.agentSkillMetrics.upsert({
      where: {
        date_agent_skill: {
          date,
          agent: message.agent,
          skill: message.skill
        }
      },
      update: {
        // Recalcular promedios con nuevo feedback
        userSatisfaction: await this.calculateAverageSatisfaction(message.skill, date)
      },
      create: {
        date,
        agent: message.agent,
        skill: message.skill,
        userSatisfaction: feedback.rating
      }
    })
  }

  private async calculateAverageSatisfaction(skill: string, date: Date): Promise<number> {
    const feedbacks = await this.prisma.agentFeedback.findMany({
      where: {
        message: {
          skill,
          createdAt: {
            gte: date,
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      },
      select: { rating: true }
    })

    if (feedbacks.length === 0) return 0

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0)
    return Number((sum / feedbacks.length).toFixed(2))
  }

  private shouldTriggerLearning(feedback: UserFeedback): boolean {
    // Trigger learning si:
    // - Rating bajo (< 3) con comentario
    // - Patrón de feedback negativo consistente
    // - Comentarios mencionan problemas específicos

    return feedback.rating < 3 && (feedback.comment || feedback.helpful === false)
  }

  private async triggerLearningProcess(feedback: UserFeedback): Promise<void> {
    // Notificar al sistema de aprendizaje
    await learningService.processFeedback(feedback)
  }
}
```

#### 2. Learning Service (Servicio de Aprendizaje)

```typescript
// agents/learning/LearningService.ts
interface LearningInsight {
  type: 'skill_improvement' | 'trigger_adjustment' | 'response_optimization'
  skillId: string
  insight: string
  confidence: number
  suggestedAction: string
  data: any
}

class LearningService {
  constructor(
    private skillManager: SkillManager,
    private triggerSystem: TriggerSystem,
    private feedbackCollector: FeedbackCollector
  ) {}

  async processFeedback(feedback: UserFeedback): Promise<void> {
    // Analizar el feedback
    const insights = await this.analyzeFeedback(feedback)

    // Aplicar mejoras automáticamente
    for (const insight of insights) {
      await this.applyInsight(insight)
    }

    // Log para revisión manual si es necesario
    await this.logLearningEvent(feedback, insights)
  }

  private async analyzeFeedback(feedback: UserFeedback): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = []

    // Obtener contexto del mensaje
    const message = await this.prisma.agentMessage.findUnique({
      where: { id: feedback.messageId },
      include: { conversation: { include: { messages: true } } }
    })

    if (!message) return insights

    // Análisis de patrones de bajo rendimiento
    if (feedback.rating < 3) {
      insights.push(await this.analyzeLowRating(message, feedback))
    }

    // Análisis de comentarios
    if (feedback.comment) {
      insights.push(...await this.analyzeComment(message, feedback.comment))
    }

    // Análisis de helpfulness
    if (feedback.helpful === false) {
      insights.push(await this.analyzeUnhelpfulResponse(message))
    }

    return insights
  }

  private async analyzeLowRating(message: any, feedback: UserFeedback): Promise<LearningInsight> {
    const skill = await this.skillManager.getSkill(message.skill)

    return {
      type: 'skill_improvement',
      skillId: message.skill,
      insight: `Skill ${message.skill} recibió rating bajo (${feedback.rating}/5)`,
      confidence: 0.8,
      suggestedAction: 'Revisar y mejorar prompts de la skill',
      data: {
        message: message.content,
        rating: feedback.rating,
        skillConfig: skill?.config
      }
    }
  }

  private async analyzeComment(message: any, comment: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = []

    // Análisis de sentimiento en comentario
    const sentiment = await this.analyzeSentiment(comment)

    if (sentiment < -0.5) {
      insights.push({
        type: 'response_optimization',
        skillId: message.skill,
        insight: `Comentario negativo detectado: "${comment}"`,
        confidence: 0.9,
        suggestedAction: 'Ajustar respuestas para evitar este tipo de retroalimentación',
        data: { comment, sentiment }
      })
    }

    // Extraer keywords de problemas
    const problemKeywords = this.extractProblemKeywords(comment)
    if (problemKeywords.length > 0) {
      insights.push({
        type: 'skill_improvement',
        skillId: message.skill,
        insight: `Problemas identificados: ${problemKeywords.join(', ')}`,
        confidence: 0.7,
        suggestedAction: 'Mejorar manejo de estos casos específicos',
        data: { problemKeywords, comment }
      })
    }

    return insights
  }

  private async applyInsight(insight: LearningInsight): Promise<void> {
    switch (insight.type) {
      case 'skill_improvement':
        await this.improveSkill(insight)
        break
      case 'trigger_adjustment':
        await this.adjustTriggers(insight)
        break
      case 'response_optimization':
        await this.optimizeResponses(insight)
        break
    }
  }

  private async improveSkill(insight: LearningInsight): Promise<void> {
    // Obtener skill actual
    const skill = await this.skillManager.getSkill(insight.skillId)
    if (!skill) return

    // Aplicar mejoras basadas en el insight
    const improvedConfig = await this.generateImprovedConfig(skill, insight)

    // Actualizar skill
    await this.skillManager.updateSkill(insight.skillId, improvedConfig)

    // Log del cambio
    await this.logSkillImprovement(insight.skillId, insight, improvedConfig)
  }

  private async generateImprovedConfig(skill: Skill, insight: LearningInsight): Promise<SkillConfig> {
    // Usar LLM para generar mejoras
    const improvementPrompt = `
    Una skill recibió feedback negativo. Mejora su configuración:

    Skill actual: ${JSON.stringify(skill.config, null, 2)}
    Insight: ${insight.insight}
    Datos: ${JSON.stringify(insight.data, null, 2)}

    Genera una configuración mejorada que aborde los problemas identificados.
    `

    const improvedConfig = await this.llmClient.generateImprovement(improvementPrompt)

    return { ...skill.config, ...improvedConfig }
  }
}
```

#### 3. Pattern Analyzer (Analizador de Patrones)

```typescript
// agents/learning/PatternAnalyzer.ts
interface UsagePattern {
  skillId: string
  triggerType: string
  successRate: number
  averageConfidence: number
  commonFailures: string[]
  peakUsageHours: number[]
  userDemographics: {
    ageGroups: Record<string, number>
    readingLevels: Record<string, number>
  }
}

class PatternAnalyzer {
  async analyzeUsagePatterns(timeRange: { start: Date, end: Date }): Promise<UsagePattern[]> {
    const patterns: UsagePattern[] = []

    // Obtener datos de uso
    const usageData = await this.getUsageData(timeRange)

    // Agrupar por skill
    const skills = [...new Set(usageData.map(d => d.skill))]

    for (const skill of skills) {
      const skillData = usageData.filter(d => d.skill === skill)
      const pattern = await this.analyzeSkillPattern(skill, skillData)

      patterns.push(pattern)
    }

    return patterns
  }

  private async analyzeSkillPattern(skillId: string, data: any[]): Promise<UsagePattern> {
    const totalInteractions = data.length
    const successfulInteractions = data.filter(d => d.confidence > 0.7 && d.userRating >= 4).length

    // Analizar horas pico
    const hourDistribution = this.calculateHourDistribution(data)

    // Analizar fallos comunes
    const commonFailures = this.extractCommonFailures(data)

    // Analizar demografía de usuarios
    const demographics = await this.analyzeUserDemographics(data)

    return {
      skillId,
      triggerType: this.determineTriggerType(data),
      successRate: successfulInteractions / totalInteractions,
      averageConfidence: data.reduce((sum, d) => sum + d.confidence, 0) / totalInteractions,
      commonFailures,
      peakUsageHours: this.findPeakHours(hourDistribution),
      userDemographics: demographics
    }
  }

  private calculateHourDistribution(data: any[]): Record<number, number> {
    const distribution: Record<number, number> = {}

    data.forEach(item => {
      const hour = new Date(item.timestamp).getHours()
      distribution[hour] = (distribution[hour] || 0) + 1
    })

    return distribution
  }

  private extractCommonFailures(data: any[]): string[] {
    const failures = data.filter(d => d.confidence < 0.5 || d.userRating < 3)

    // Agrupar por tipo de fallo
    const failureGroups: Record<string, number> = {}

    failures.forEach(failure => {
      const reason = this.categorizeFailure(failure)
      failureGroups[reason] = (failureGroups[reason] || 0) + 1
    })

    // Retornar top 3 fallos
    return Object.entries(failureGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([reason]) => reason)
  }

  private categorizeFailure(failure: any): string {
    if (failure.confidence < 0.3) return 'baja_confianza'
    if (failure.userRating === 1) return 'muy_insatisfecho'
    if (failure.comment?.toLowerCase().includes('lento')) return 'rendimiento'
    if (failure.comment?.toLowerCase().includes('incorrecto')) return 'precision'
    return 'otro'
  }
}
```

#### 4. Continuous Learning Loop

```typescript
// agents/learning/ContinuousLearningLoop.ts
class ContinuousLearningLoop {
  private learningInterval: NodeJS.Timeout | null = null

  start(): void {
    // Ejecutar análisis cada 6 horas
    this.learningInterval = setInterval(async () => {
      await this.performLearningCycle()
    }, 6 * 60 * 60 * 1000)
  }

  stop(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval)
      this.learningInterval = null
    }
  }

  private async performLearningCycle(): Promise<void> {
    try {
      console.log('Iniciando ciclo de aprendizaje continuo...')

      // 1. Recopilar métricas recientes
      const recentMetrics = await this.collectRecentMetrics()

      // 2. Analizar patrones de uso
      const patterns = await this.patternAnalyzer.analyzeUsagePatterns({
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
        end: new Date()
      })

      // 3. Generar insights
      const insights = await this.generateInsights(recentMetrics, patterns)

      // 4. Aplicar mejoras automáticas
      const appliedImprovements = await this.applyAutomaticImprovements(insights)

      // 5. Log y reporte
      await this.logLearningCycle(insights, appliedImprovements)

      console.log(`Ciclo completado. Aplicadas ${appliedImprovements.length} mejoras.`)

    } catch (error) {
      console.error('Error en ciclo de aprendizaje:', error)
      await this.handleLearningError(error)
    }
  }

  private async collectRecentMetrics(): Promise<any> {
    // Recopilar métricas de las últimas 24 horas
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    return await this.prisma.agentMetrics.findMany({
      where: {
        date: {
          gte: yesterday
        }
      }
    })
  }

  private async generateInsights(metrics: any[], patterns: UsagePattern[]): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = []

    // Analizar métricas para insights
    for (const pattern of patterns) {
      if (pattern.successRate < 0.7) {
        insights.push({
          type: 'skill_improvement',
          skillId: pattern.skillId,
          insight: `Skill ${pattern.skillId} tiene tasa de éxito baja (${(pattern.successRate * 100).toFixed(1)}%)`,
          confidence: 0.8,
          suggestedAction: 'Revisar y optimizar la skill',
          data: pattern
        })
      }
    }

    return insights
  }

  private async applyAutomaticImprovements(insights: LearningInsight[]): Promise<string[]> {
    const applied: string[] = []

    for (const insight of insights) {
      if (insight.confidence > 0.7) {
        await this.learningService.applyInsight(insight)
        applied.push(insight.skillId)
      }
    }

    return applied
  }
}
```

## 📊 Dashboard de Aprendizaje

### Learning Dashboard Component

```tsx
// components/LearningDashboard.tsx
export function LearningDashboard() {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null)
  const [insights, setInsights] = useState<LearningInsight[]>([])

  useEffect(() => {
    loadLearningData()
  }, [])

  const loadLearningData = async () => {
    const metricsData = await agentsRepository.getLearningMetrics()
    const insightsData = await agentsRepository.getRecentInsights()

    setMetrics(metricsData)
    setInsights(insightsData)
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Satisfacción del Usuario"
          value={`${metrics?.userSatisfaction || 0}/5`}
          trend={metrics?.satisfactionTrend}
          icon="star"
        />
        <MetricCard
          title="Tasa de Éxito"
          value={`${(metrics?.successRate || 0 * 100).toFixed(1)}%`}
          trend={metrics?.successRateTrend}
          icon="check-circle"
        />
        <MetricCard
          title="Tiempo de Respuesta"
          value={`${metrics?.averageResponseTime || 0}ms`}
          trend={metrics?.responseTimeTrend}
          icon="clock"
        />
        <MetricCard
          title="Mejoras Aplicadas"
          value={metrics?.appliedImprovements || 0}
          trend="positive"
          icon="trending-up"
        />
      </div>

      {/* Insights Recientes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Insights de Aprendizaje</h3>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{insight.skillId}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  insight.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                  insight.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {Math.round(insight.confidence * 100)}% confianza
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{insight.insight}</p>
              <p className="text-xs text-blue-600 mt-1">{insight.suggestedAction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Tendencias */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tendencias de Rendimiento</h3>
        <div className="h-64">
          {/* Chart component would go here */}
          <div className="flex items-center justify-center h-full text-gray-500">
            Gráfico de tendencias (implementar con Chart.js o similar)
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 🔧 Configuración del Sistema de Aprendizaje

### LearningConfig

```typescript
interface LearningConfig {
  feedback: {
    enabled: boolean
    minRatingForLearning: number
    requireComments: boolean
    autoApplyThreshold: number
  }
  patterns: {
    analysisInterval: number // minutos
    lookbackDays: number
    minInteractionsForAnalysis: number
  }
  improvements: {
    maxAutomaticImprovements: number
    requireReviewForHighImpact: boolean
    backupBeforeChanges: boolean
  }
  monitoring: {
    logLearningEvents: boolean
    alertOnPoorPerformance: boolean
    performanceThresholds: {
      minSuccessRate: number
      maxResponseTime: number
    }
  }
}

const defaultLearningConfig: LearningConfig = {
  feedback: {
    enabled: true,
    minRatingForLearning: 3,
    requireComments: false,
    autoApplyThreshold: 0.8
  },
  patterns: {
    analysisInterval: 360, // 6 horas
    lookbackDays: 7,
    minInteractionsForAnalysis: 10
  },
  improvements: {
    maxAutomaticImprovements: 5,
    requireReviewForHighImpact: true,
    backupBeforeChanges: true
  },
  monitoring: {
    logLearningEvents: true,
    alertOnPoorPerformance: true,
    performanceThresholds: {
      minSuccessRate: 0.7,
      maxResponseTime: 2000
    }
  }
}
```

Este sistema de aprendizaje continuo permite que los agentes evolucionen automáticamente basado en la retroalimentación de los usuarios, mejorando continuamente la calidad del servicio y adaptándose a las necesidades cambiantes de los usuarios de la biblioteca.