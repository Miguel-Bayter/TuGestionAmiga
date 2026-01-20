# Mecanismo de Triggers y Análisis de Intenciones

## 🎯 Sistema de Triggers Híbrido

El sistema de triggers combina **detección rápida de keywords** con **análisis de intenciones basado en NLP** para lograr un balance entre velocidad y precisión en la activación de skills y subagentes.

## 🏗️ Arquitectura del Sistema de Triggers

### Componentes Principales

```typescript
class TriggerSystem {
  private keywordMatcher: KeywordMatcher
  private intentAnalyzer: IntentAnalyzer
  private confidenceCalculator: ConfidenceCalculator
  private triggerRegistry: TriggerRegistry

  async processMessage(message: string, context: ConversationContext): Promise<TriggerResult> {
    // 1. Análisis rápido de keywords
    const keywordMatches = await this.keywordMatcher.match(message)

    // 2. Si confianza insuficiente, análisis profundo
    if (keywordMatches.confidence < 0.75) {
      const intentAnalysis = await this.intentAnalyzer.analyze(message, context)
      return this.confidenceCalculator.combine(keywordMatches, intentAnalysis)
    }

    return keywordMatches
  }
}
```

## 🔍 Keyword Matching System

### KeywordMatcher Class

```typescript
interface KeywordMatch {
  triggerId: string
  confidence: number
  matchedKeywords: string[]
  context: MatchContext
  skill?: string
  agent?: string
}

class KeywordMatcher {
  private keywordIndex: Map<string, TriggerDefinition[]>
  private fuzzyMatcher: FuzzyMatcher

  async match(message: string): Promise<KeywordMatch[]> {
    const normalizedMessage = this.normalizeText(message)
    const words = this.tokenize(normalizedMessage)

    const matches: KeywordMatch[] = []

    // Exact matching
    for (const word of words) {
      const exactMatches = this.keywordIndex.get(word) || []
      matches.push(...exactMatches.map(def => ({
        triggerId: def.id,
        confidence: def.weight,
        matchedKeywords: [word],
        skill: def.skill,
        agent: def.agent
      })))
    }

    // Fuzzy matching para typos
    const fuzzyMatches = await this.fuzzyMatcher.find(normalizedMessage)
    matches.push(...fuzzyMatches)

    // Combinar y rankear
    return this.rankMatches(matches)
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
  }
}
```

### Trigger Registry Structure

```typescript
interface TriggerDefinition {
  id: string
  type: 'keyword' | 'phrase' | 'pattern'
  value: string | RegExp
  weight: number // 0-1 confidence weight
  skill?: string
  agent?: string
  context?: TriggerContext
  language: 'es' | 'en' // Support for multiple languages
}

interface TriggerContext {
  requiresAuth: boolean
  userType?: 'admin' | 'user'
  conversationState?: 'new' | 'ongoing' | 'error'
  timeConstraints?: TimeConstraint
}
```

### Trigger Database

```typescript
const triggerDefinitions: TriggerDefinition[] = [
  // Book Recommendation Triggers
  {
    id: 'book_rec_basic',
    type: 'keyword',
    value: 'recomendar',
    weight: 0.8,
    skill: 'genre-based-recommendation',
    agent: 'BookRecommenderAgent'
  },
  {
    id: 'book_rec_phrase',
    type: 'phrase',
    value: 'quiero leer',
    weight: 0.9,
    skill: 'genre-based-recommendation',
    agent: 'BookRecommenderAgent'
  },
  {
    id: 'book_rec_genre',
    type: 'pattern',
    value: /libros? de (ciencia ficción|fantasía|misterio|romance)/i,
    weight: 0.95,
    skill: 'genre-based-recommendation',
    agent: 'BookRecommenderAgent'
  },

  // Loan Management Triggers
  {
    id: 'loan_status',
    type: 'keyword',
    value: 'préstamo',
    weight: 0.85,
    skill: 'loan-status-checker',
    agent: 'LoanAssistantAgent',
    context: { requiresAuth: true }
  },
  {
    id: 'loan_return',
    type: 'keyword',
    value: 'devolver',
    weight: 0.9,
    skill: 'return-processor',
    agent: 'LoanAssistantAgent',
    context: { requiresAuth: true }
  },

  // Generic Conversational Triggers
  {
    id: 'greeting_casual',
    type: 'keyword',
    value: 'hola',
    weight: 0.7,
    skill: 'conversational-greeting'
  },
  {
    id: 'thanks',
    type: 'keyword',
    value: 'gracias',
    weight: 0.8,
    skill: 'conversational-thanks'
  }
]
```

## 🧠 Intent Analysis System

### IntentAnalyzer Class

```typescript
interface IntentAnalysis {
  primaryIntent: Intent
  secondaryIntents: Intent[]
  confidence: number
  entities: ExtractedEntity[]
  sentiment: SentimentAnalysis
  metadata: AnalysisMetadata
}

class IntentAnalyzer {
  private llmClient: LLMClient
  private entityExtractor: EntityExtractor
  private sentimentAnalyzer: SentimentAnalyzer

  async analyze(message: string, context: ConversationContext): Promise<IntentAnalysis> {
    // 1. LLM-based intent classification
    const llmResult = await this.llmClient.classifyIntent(message, {
      context: this.buildContextPrompt(context),
      examples: this.getRelevantExamples(context)
    })

    // 2. Entity extraction
    const entities = await this.entityExtractor.extract(message)

    // 3. Sentiment analysis
    const sentiment = await this.sentimentAnalyzer.analyze(message)

    // 4. Combine results
    return {
      primaryIntent: llmResult.primary,
      secondaryIntents: llmResult.secondary,
      confidence: llmResult.confidence,
      entities,
      sentiment,
      metadata: {
        processingTime: Date.now(),
        modelUsed: 'gpt-4',
        tokensUsed: llmResult.tokens
      }
    }
  }
}
```

### Intent Classification Prompt

```typescript
const INTENT_CLASSIFICATION_PROMPT = `
Eres un clasificador de intenciones para un sistema de biblioteca.
Analiza el mensaje del usuario y determina su intención principal.

Mensaje: "{message}"
Contexto: {context}

Posibles intenciones:
- BOOK_RECOMMENDATION: Quiere recomendaciones de libros
- LOAN_MANAGEMENT: Gestionar préstamos, devoluciones, renovaciones
- BOOK_SEARCH: Buscar libros específicos
- INVENTORY_CHECK: Verificar disponibilidad
- HELP_REQUEST: Necesita ayuda general
- GENERAL_CONVERSATION: Charla casual

Responde en formato JSON:
{
  "primary": "INTENT_TYPE",
  "secondary": ["INTENT_TYPE"],
  "confidence": 0.0-1.0,
  "explanation": "razón del análisis"
}
`
```

## 🎯 Confidence Calculator

### Sistema de Combinación de Confianza

```typescript
class ConfidenceCalculator {
  calculateCombinedConfidence(
    keywordResult: KeywordMatch[],
    intentResult: IntentAnalysis
  ): TriggerResult {

    // Strategy 1: Keyword-first with LLM backup
    if (keywordResult.length > 0 && keywordResult[0].confidence > 0.8) {
      return this.boostWithIntent(keywordResult[0], intentResult)
    }

    // Strategy 2: Intent-first with keyword validation
    if (intentResult.confidence > 0.85) {
      return this.validateWithKeywords(intentResult, keywordResult)
    }

    // Strategy 3: Hybrid combination
    return this.combineResults(keywordResult, intentResult)
  }

  private boostWithIntent(keywordMatch: KeywordMatch, intent: IntentAnalysis): TriggerResult {
    // Boost confidence if keyword and intent align
    const alignment = this.calculateAlignment(keywordMatch, intent)

    return {
      triggerId: keywordMatch.triggerId,
      confidence: Math.min(1.0, keywordMatch.confidence + (alignment * 0.2)),
      method: 'keyword_with_intent_boost',
      skill: keywordMatch.skill,
      agent: keywordMatch.agent,
      intent: intent.primaryIntent,
      entities: intent.entities
    }
  }
}
```

### Confidence Thresholds

```typescript
const CONFIDENCE_THRESHOLDS = {
  HIGH_CONFIDENCE: 0.9,     // Trigger immediately
  MEDIUM_CONFIDENCE: 0.7,   // Ask for confirmation
  LOW_CONFIDENCE: 0.5,      // Fallback to help agent
  MINIMUM_CONFIDENCE: 0.3   // Unknown intent
}
```

## 🔍 Entity Extraction

### EntityExtractor Class

```typescript
interface ExtractedEntity {
  type: EntityType
  value: string
  confidence: number
  position: { start: number, end: number }
  metadata?: Record<string, any>
}

enum EntityType {
  BOOK_TITLE = 'book_title',
  AUTHOR = 'author',
  GENRE = 'genre',
  ISBN = 'isbn',
  DUE_DATE = 'due_date',
  USER_ACTION = 'user_action',
  QUANTITY = 'quantity'
}

class EntityExtractor {
  private patterns: Map<EntityType, RegExp[]>
  private llmExtractor: LLMEntityExtractor

  async extract(message: string): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = []

    // Rule-based extraction
    for (const [type, regexes] of this.patterns) {
      for (const regex of regexes) {
        const matches = message.match(regex)
        if (matches) {
          entities.push({
            type,
            value: matches[1] || matches[0],
            confidence: 0.8,
            position: this.getMatchPosition(message, matches)
          })
        }
      }
    }

    // LLM-based extraction for complex entities
    const llmEntities = await this.llmExtractor.extract(message)
    entities.push(...llmEntities)

    return this.deduplicateEntities(entities)
  }
}
```

### Entity Patterns (Spanish)

```typescript
const ENTITY_PATTERNS: Map<EntityType, RegExp[]> = new Map([
  [EntityType.BOOK_TITLE, [
    /["""]((?:[^"""]+))["""]/g,  // Quoted titles
    /el libro [""]?([^""",.!?]+)[""]?/gi  // "el libro X"
  ]],
  [EntityType.AUTHOR, [
    /de ([\w\s]+)(?:\s|$)/gi,  // "de Autor"
    /escrito por ([\w\s]+)/gi  // "escrito por Autor"
  ]],
  [EntityType.GENRE, [
    /(ciencia ficción|fantasía|misterio|romance|terror|biografía)/gi
  ]],
  [EntityType.ISBN, [
    /isbn[:\s-]*([\d-]{10,17})/gi
  ]]
])
```

## 🎭 Sentiment Analysis

### SentimentAnalyzer Class

```typescript
interface SentimentAnalysis {
  polarity: number  // -1 (negative) to 1 (positive)
  magnitude: number // 0 (neutral) to 1 (strong)
  emotions: Emotion[]
  confidence: number
}

class SentimentAnalyzer {
  private lexicon: SentimentLexicon

  analyze(message: string): Promise<SentimentAnalysis> {
    const words = this.tokenize(message)
    let polarity = 0
    let magnitude = 0

    for (const word of words) {
      const sentiment = this.lexicon.get(word)
      if (sentiment) {
        polarity += sentiment.polarity
        magnitude += Math.abs(sentiment.polarity)
      }
    }

    return {
      polarity: Math.max(-1, Math.min(1, polarity / words.length)),
      magnitude: Math.min(1, magnitude / words.length),
      emotions: this.detectEmotions(words),
      confidence: 0.7
    }
  }
}
```

## 📊 Performance Optimization

### Caching System

```typescript
class TriggerCache {
  private cache: Map<string, CachedResult>

  async get(message: string): Promise<CachedResult | null> {
    const key = this.hashMessage(message)
    const cached = this.cache.get(key)

    if (cached && !this.isExpired(cached)) {
      return cached.result
    }

    return null
  }

  async set(message: string, result: TriggerResult): Promise<void> {
    const key = this.hashMessage(message)
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: 3600000 // 1 hour
    })
  }
}
```

### Parallel Processing

```typescript
async processMessageParallel(message: string, context: ConversationContext): Promise<TriggerResult> {
  const [keywordResult, intentResult] = await Promise.all([
    this.keywordMatcher.match(message),
    this.intentAnalyzer.analyze(message, context)
  ])

  return this.confidenceCalculator.combine(keywordResult, intentResult)
}
```

## 🧪 Testing y Validation

### Trigger Testing Framework

```typescript
class TriggerTester {
  testTrigger(trigger: TriggerDefinition, testCases: TestCase[]): TestResult[] {
    return testCases.map(testCase => ({
      triggerId: trigger.id,
      input: testCase.input,
      expected: testCase.expected,
      actual: this.testMatch(trigger, testCase.input),
      passed: this.validateResult(testCase.expected, this.testMatch(trigger, testCase.input))
    }))
  }
}

interface TestCase {
  input: string
  expected: {
    shouldMatch: boolean
    confidence?: number
    skill?: string
  }
}
```

### Test Examples

```typescript
const triggerTests: TestCase[] = [
  {
    input: "Recomiéndame un libro de ciencia ficción",
    expected: {
      shouldMatch: true,
      confidence: 0.9,
      skill: "genre-based-recommendation"
    }
  },
  {
    input: "¿Qué libros tengo prestados?",
    expected: {
      shouldMatch: true,
      confidence: 0.85,
      skill: "loan-status-checker"
    }
  }
]
```

Este sistema de triggers híbrido proporciona una base sólida para la detección precisa y eficiente de intenciones, combinando la velocidad de los keywords con la precisión del análisis de lenguaje natural.