import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Get the root element
const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found')
}

// Create React 19 root
const root = createRoot(container)

// Render the app with StrictMode for development
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
