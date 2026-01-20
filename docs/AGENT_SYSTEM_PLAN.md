# Sistema de Agentes para Tu Gestion Amiga

## 🎯 Visión General
Crear un sistema de IA conversacional integrado en la aplicación de gestión de biblioteca, donde un **orquestador principal** coordina **subagentes especializados** con **skills específicas y genéricas** que se activan por keywords o análisis de intenciones. Esto permitirá a los usuarios interactuar naturalmente con el sistema (ej: "Recomiéndame un libro de ciencia ficción" o "Ayúdame a devolver este libro").

## 🏗️ Arquitectura Propuesta

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend UI   │────│   Orchestrator   │
│   (Chat Interface)   │    │   Agent       │
└─────────────────┘    └──────────────────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
            ┌───────▼────┐ ┌──▼───┐ ┌────▼────┐
            │ Book Agent │ │Loan  │ │Inventory│
            │            │ │Agent │ │ Agent   │
            └────────────┘ └──────┘ └─────────┘
                    │          │          │
            ┌───────▼────┐ ┌──▼───┐ ┌────▼────┘
            │ Skills/    │ │Skills│ │ Skills/  │
            │ recommend/ │ │manage│ │ track/   │
            │ search     │ │loans │ │ stock    │
            └────────────┘ └──────┘ └─────────┘
```

## 📋 Plan de Implementación Detallado

### 1. **Investigación y Diseño de Arquitectura**
- ✅ Investigado Agent Skills format: carpetas con `SKILL.md`, instrucciones, scripts y recursos
- ✅ Consultados conceptos de AGENTS.md para organización de agentes
- **Próximo**: Definir interfaces entre orquestador y subagentes
- **Entregable**: Documento de arquitectura con diagramas

### 2. **Selección de Tecnologías**
- **LangChain.js**: Framework principal para agentes y chains
- **OpenAI API**: Para capacidades de LLM y análisis de intenciones
- **NLP Libraries**: `compromise.js` o `natural` para keyword matching básico
- **Vector Stores**: Para búsqueda semántica de libros/recomendaciones
- **Integración**: Mantener compatibilidad con Express/TypeScript existente

### 3. **Diseño del Orquestador Principal**
- **Router Agent**: Analiza mensajes del usuario y determina qué subagente activar
- **Context Manager**: Mantiene estado de conversaciones entre subagentes
- **Fallback Handler**: Gestiona queries no reconocidas
- **Implementación**: Clase `OrchestratorAgent` que extiende `AgentExecutor` de LangChain

### 4. **Definición de Subagentes Especializados**
- **BookRecommender**: Recomienda libros basado en preferencias, historial
- **LoanAssistant**: Gestiona préstamos, renovaciones, devoluciones
- **InventoryManager**: Controla stock, adquisiciones, alertas
- **SearchAgent**: Búsqueda avanzada de libros por múltiples criterios
- **HelpAgent**: Asistencia general y FAQs

### 5. **Sistema de Skills con Agent Skills Format**
Estructura de carpetas:
```
agents/skills/
├── book-recommendation/
│   ├── SKILL.md          # Descripción e instrucciones
│   ├── instructions.md   # Guías detalladas
│   ├── examples/         # Casos de uso
│   └── scripts/          # Utilidades
├── loan-management/
│   └── ...
└── generic-skills/
    ├── search/
    ├── explain/
    └── conversational/
```

### 6. **Mecanismo de Triggers por Keywords/Intenciones**
- **Keyword Matching**: Diccionarios de triggers por skill ("recomendar", "préstamo", "buscar")
- **Intent Classification**: LLM para análisis semántico de intenciones
- **Hybrid Approach**: Keywords rápidos + LLM para casos complejos
- **Confidence Scoring**: Sistema de puntuación para seleccionar mejor subagente

### 7. **Integración en Backend**
- **Nuevos Endpoints**:
  - `POST /api/agents/chat` - Interacción principal
  - `GET /api/agents/history` - Historial de conversaciones
  - `POST /api/agents/feedback` - Retroalimentación de usuarios
- **Middleware**: Autenticación JWT para agentes
- **Database Models**: Conversaciones, feedbacks, contexto de usuarios

### 8. **Interfaz de Chat en Frontend**
- **Componente ChatWidget**: Integrado en páginas relevantes
- **Zustand Store**: Gestión de estado de conversaciones
- **UI/UX**: Diseño consistente con Tailwind existente
- **Responsive**: Funciona en móvil y desktop

### 9. **Persistencia de Conversaciones**
- **Prisma Models**: `Conversation`, `Message`, `AgentContext`
- **Session Management**: Mantener contexto entre sesiones
- **Privacy**: Encriptación de datos sensibles

### 10. **Aprendizaje Continuo y Feedback**
- **Feedback Loop**: Usuarios califican respuestas de agentes
- **Skill Improvement**: Actualización automática de prompts basados en feedback
- **Analytics**: Métricas de efectividad por skill/agente

## 🔧 Consideraciones Técnicas

- **Compatibilidad**: Integrar con arquitectura Clean existente
- **Performance**: Caching de respuestas, lazy loading de skills
- **Security**: Rate limiting, sanitización de inputs
- **Testing**: Unit tests para skills, integration tests para agentes
- **Monitoring**: Logging de interacciones, métricas de uso

## 📊 Fases de Implementación

1. **Fase 1 (1-2 semanas)**: Infraestructura básica (orquestador, 1 subagente)
2. **Fase 2 (2-3 semanas)**: Skills específicas y triggers
3. **Fase 3 (1 semana)**: UI y integración completa
4. **Fase 4 (1 semana)**: Testing, optimización y feedback

## 🔗 Referencias
- [Agent Skills Specification](https://agentskills.io/home)
- [AGENTS.md Format](https://agents.md/)
- [LangChain.js Documentation](https://js.langchain.com/)
- [OpenAI API](https://platform.openai.com/docs)

## 📝 Próximos Pasos
- Confirmar arquitectura con el usuario
- Refinar requerimientos específicos
- Comenzar implementación de la Fase 1