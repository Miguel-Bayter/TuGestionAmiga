# Interfaz de Chat en el Frontend

## 🎨 Diseño de la UI de Chat

La interfaz de chat se integra como una feature completa en la aplicación React existente, siguiendo la arquitectura Clean y utilizando Zustand para el estado.

### Estructura de Componentes

```
apps/frontend/src/
├── presentation/
│   ├── features/
│   │   └── agents/                    # 🆕 Nueva feature
│   │       ├── components/
│   │       │   ├── ChatWidget.tsx     # Widget principal de chat
│   │       │   ├── MessageBubble.tsx  # Burbuja de mensaje
│   │       │   ├── TypingIndicator.tsx # Indicador de escritura
│   │       │   ├── AgentSelector.tsx  # Selector de agente (opcional)
│   │       │   ├── QuickActions.tsx   # Acciones rápidas
│   │       │   └── ChatInput.tsx      # Input de mensaje
│   │       ├── pages/
│   │       │   └── chat.page.tsx      # Página dedicada de chat
│   │       ├── stores/
│   │       │   └── agents.store.ts    # Store de Zustand
│   │       └── hooks/
│   │           └── useAgents.ts       # Hook personalizado
│   └── shared/
│       ├── components/
│       │   └── FloatingChatButton.tsx # Botón flotante para abrir chat
│       └── ...
└── domain/
    ├── Entity/
    │   └── agent.entity.ts           # 🆕 Entidades de agentes
    └── Repository/
        └── agents.repository.ts       # 🆕 Repository para API
```

## 🏪 Zustand Store para Agentes

### AgentsStore

```typescript
// stores/agents.store.ts
interface Message {
  id: string
  role: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  agent?: string
  skill?: string
  confidence?: number
  suggestions?: string[]
  actions?: AgentAction[]
}

interface Conversation {
  sessionId: string
  messages: Message[]
  isLoading: boolean
  error?: string
}

interface AgentAction {
  type: 'reserve_book' | 'renew_loan' | 'view_details'
  label: string
  data: any
}

interface AgentsState {
  conversations: Map<string, Conversation>
  currentSessionId: string | null
  isChatOpen: boolean
  availableAgents: AgentInfo[]
  isTyping: boolean

  // Actions
  openChat: () => void
  closeChat: () => void
  sendMessage: (message: string) => Promise<void>
  loadConversation: (sessionId: string) => Promise<void>
  createNewConversation: () => Promise<void>
  executeAction: (action: AgentAction) => Promise<void>
  clearError: () => void
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  conversations: new Map(),
  currentSessionId: null,
  isChatOpen: false,
  availableAgents: [],
  isTyping: false,

  openChat: () => set({ isChatOpen: true }),

  closeChat: () => set({ isChatOpen: false }),

  sendMessage: async (message: string) => {
    const { currentSessionId, conversations } = get()

    if (!currentSessionId) {
      await get().createNewConversation()
      return get().sendMessage(message) // Retry with new session
    }

    const conversation = conversations.get(currentSessionId)
    if (!conversation) return

    // Add user message immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    set(state => {
      const updatedConversations = new Map(state.conversations)
      const conv = updatedConversations.get(currentSessionId)
      if (conv) {
        conv.messages.push(userMessage)
        conv.isLoading = true
      }
      return { conversations: updatedConversations }
    })

    try {
      // Call API
      const response = await agentsRepository.sendMessage({
        message,
        sessionId: currentSessionId
      })

      // Add agent response
      const agentMessage: Message = {
        id: generateId(),
        role: 'agent',
        content: response.message,
        timestamp: new Date(),
        agent: response.agent,
        skill: response.skill,
        confidence: response.confidence,
        suggestions: response.suggestions,
        actions: response.actions
      }

      set(state => {
        const updatedConversations = new Map(state.conversations)
        const conv = updatedConversations.get(currentSessionId)
        if (conv) {
          conv.messages.push(agentMessage)
          conv.isLoading = false
        }
        return { conversations: updatedConversations }
      })

    } catch (error) {
      set(state => {
        const updatedConversations = new Map(state.conversations)
        const conv = updatedConversations.get(currentSessionId)
        if (conv) {
          conv.isLoading = false
          conv.error = error.message
        }
        return { conversations: updatedConversations }
      })
    }
  },

  loadConversation: async (sessionId: string) => {
    try {
      const history = await agentsRepository.getConversationHistory(sessionId)

      set(state => {
        const updatedConversations = new Map(state.conversations)
        updatedConversations.set(sessionId, {
          sessionId,
          messages: history.messages,
          isLoading: false
        })
        return {
          conversations: updatedConversations,
          currentSessionId: sessionId
        }
      })
    } catch (error) {
      console.error('Error loading conversation:', error)
    }
  },

  createNewConversation: async () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    set(state => ({
      currentSessionId: newSessionId,
      conversations: new Map(state.conversations).set(newSessionId, {
        sessionId: newSessionId,
        messages: [],
        isLoading: false
      })
    }))
  },

  executeAction: async (action: AgentAction) => {
    // Handle different action types
    switch (action.type) {
      case 'reserve_book':
        // Navigate to reservation page or open modal
        break
      case 'renew_loan':
        // Call renewal API
        break
      case 'view_details':
        // Navigate to book details
        break
    }
  },

  clearError: () => {
    const { currentSessionId, conversations } = get()
    if (!currentSessionId) return

    set(state => {
      const updatedConversations = new Map(state.conversations)
      const conv = updatedConversations.get(currentSessionId)
      if (conv) {
        conv.error = undefined
      }
      return { conversations: updatedConversations }
    })
  }
}))
```

## 💬 Componentes de Chat

### ChatWidget (Componente Principal)

```tsx
// components/ChatWidget.tsx
import { useAgentsStore } from '../stores/agents.store'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { QuickActions } from './QuickActions'

export function ChatWidget() {
  const {
    isChatOpen,
    closeChat,
    currentSessionId,
    conversations,
    isTyping
  } = useAgentsStore()

  const conversation = currentSessionId ? conversations.get(currentSessionId) : null

  if (!isChatOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Asistente de Biblioteca</h3>
            <p className="text-sm text-gray-600">Siempre listo para ayudar</p>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        {conversation?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{conversation.error}</p>
            <button
              onClick={() => useAgentsStore.getState().clearError()}
              className="text-red-600 hover:text-red-800 text-sm underline mt-1"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {conversation && conversation.messages.length === 0 && (
        <QuickActions />
      )}

      {/* Input */}
      <ChatInput />
    </div>
  )
}
```

### MessageBubble Component

```tsx
// components/MessageBubble.tsx
import { Message } from '../stores/agents.store'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAgent = message.role === 'agent'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isUser
          ? 'bg-blue-500 text-white'
          : isAgent
          ? 'bg-gray-100 text-gray-900'
          : 'bg-yellow-100 text-gray-900'
      }`}>
        {/* Agent/Skill Info */}
        {isAgent && message.agent && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-medium text-blue-600">
              {message.agent}
            </span>
            {message.skill && (
              <span className="text-xs text-gray-500">
                • {message.skill}
              </span>
            )}
            {message.confidence && (
              <span className={`text-xs px-1 py-0.5 rounded ${
                message.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                message.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {Math.round(message.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Timestamp */}
        <p className={`text-xs mt-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString()}
        </p>

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => useAgentsStore.getState().sendMessage(suggestion)}
                className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 rounded px-2 py-1 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => useAgentsStore.getState().executeAction(action)}
                className="block w-full text-left text-xs bg-blue-600 hover:bg-blue-700 text-white rounded px-2 py-1 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### ChatInput Component

```tsx
// components/ChatInput.tsx
import { useState } from 'react'
import { useAgentsStore } from '../stores/agents.store'

export function ChatInput() {
  const [message, setMessage] = useState('')
  const { sendMessage, isTyping } = useAgentsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isTyping) return

    const messageToSend = message.trim()
    setMessage('')
    await sendMessage(messageToSend)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!message.trim() || isTyping}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isTyping ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <SendIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  )
}
```

### QuickActions Component

```tsx
// components/QuickActions.tsx
import { useAgentsStore } from '../stores/agents.store'

const QUICK_ACTIONS = [
  "Recomiéndame un libro",
  "¿Qué libros tengo prestados?",
  "¿Hay disponibilidad de 'El Quijote'?",
  "Ayuda con la búsqueda"
]

export function QuickActions() {
  const { sendMessage } = useAgentsStore()

  return (
    <div className="p-4 border-t border-gray-200">
      <p className="text-sm text-gray-600 mb-2">¿Qué te gustaría hacer?</p>
      <div className="grid grid-cols-1 gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => sendMessage(action)}
            className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}
```

## 🪝 Custom Hook para Agentes

### useAgents Hook

```typescript
// hooks/useAgents.ts
import { useAgentsStore } from '../stores/agents.store'
import { useAuthStore } from '@/shared/stores/auth.store'

export function useAgents() {
  const agentsStore = useAgentsStore()
  const { user } = useAuthStore()

  const sendMessage = async (message: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    await agentsStore.sendMessage(message)
  }

  const hasActiveConversation = () => {
    return agentsStore.currentSessionId &&
           agentsStore.conversations.has(agentsStore.currentSessionId)
  }

  const getCurrentConversation = () => {
    if (!agentsStore.currentSessionId) return null
    return agentsStore.conversations.get(agentsStore.currentSessionId) || null
  }

  return {
    ...agentsStore,
    sendMessage,
    hasActiveConversation,
    getCurrentConversation,
    isAuthenticated: !!user
  }
}
```

## 🔗 Repository para API

### AgentsRepository

```typescript
// domain/Repository/agents.repository.ts
import { apiClient } from '@/shared/config/api'

export interface ChatRequest {
  message: string
  sessionId?: string
}

export interface ChatResponse {
  success: boolean
  message: string
  agent: string
  skill: string
  confidence: number
  sessionId: string
  suggestions?: string[]
  actions?: AgentAction[]
}

export interface ConversationHistory {
  sessionId: string
  messages: Message[]
  totalCount: number
  hasMore: boolean
}

export class AgentsRepository {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/agents/chat', request)
    return response.data
  }

  async getConversationHistory(sessionId: string, limit = 50, offset = 0): Promise<ConversationHistory> {
    const response = await apiClient.get<ConversationHistory>(
      `/agents/history/${sessionId}`,
      { params: { limit, offset } }
    )
    return response.data
  }

  async sendFeedback(feedback: FeedbackRequest): Promise<void> {
    await apiClient.post('/agents/feedback', feedback)
  }

  async getAvailableAgents(): Promise<AgentInfo[]> {
    const response = await apiClient.get<{ agents: AgentInfo[] }>('/agents/agents')
    return response.data.agents
  }
}

export const agentsRepository = new AgentsRepository()
```

## 🎯 Integración Global

### FloatingChatButton

```tsx
// shared/components/FloatingChatButton.tsx
import { useAgentsStore } from '@/presentation/features/agents/stores/agents.store'

export function FloatingChatButton() {
  const { isChatOpen, openChat } = useAgentsStore()

  if (isChatOpen) return null

  return (
    <button
      onClick={openChat}
      className="fixed bottom-4 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40 flex items-center justify-center"
      aria-label="Abrir chat con asistente"
    >
      <ChatIcon className="w-6 h-6" />
      {/* Badge para conversaciones no leídas */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-xs text-white font-bold">1</span>
      </div>
    </button>
  )
}
```

### App Integration

```tsx
// App.tsx or main layout
import { ChatWidget } from './presentation/features/agents/components/ChatWidget'
import { FloatingChatButton } from './shared/components/FloatingChatButton'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Existing app content */}

      {/* Agent chat system */}
      <ChatWidget />
      <FloatingChatButton />
    </div>
  )
}
```

## 📱 Responsive Design

- **Desktop**: Widget fijo en esquina inferior derecha (400px width)
- **Mobile**: Modal fullscreen o widget expandible
- **Tablet**: Widget mediano con posición adaptable

## ♿ Accesibilidad

- ARIA labels en todos los controles
- Navegación por teclado completa
- Indicadores de estado para lectores de pantalla
- Contraste de colores WCAG compliant
- Mensajes de error descriptivos

Esta implementación proporciona una interfaz de chat completa, integrada con el estado global de la aplicación y siguiendo las mejores prácticas de React y Zustand.