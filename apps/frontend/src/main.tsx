import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Import DI container provider
import { ContainerProvider } from '@/shared/infrastructure/hooks/use-container.hook'

// Get the root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

// Create React 19 root
const root = createRoot(rootElement)

// Render the app with DI container provider
root.render(
  <StrictMode>
    <ContainerProvider>
      <App />
    </ContainerProvider>
  </StrictMode>
)
