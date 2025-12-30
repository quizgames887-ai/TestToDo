import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexAuthProvider } from './lib/convex-provider'
import App from './App'
import './styles/globals.css'

let root: ReactDOM.Root | null = null

function renderApp() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    console.error('Root element not found')
    return
  }

  try {
    if (!root) {
      root = ReactDOM.createRoot(rootElement)
    }
    
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <ConvexAuthProvider>
            <App />
          </ConvexAuthProvider>
        </BrowserRouter>
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('Failed to render app:', error)
    // Show error in the DOM
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 0.5rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="color: #9ca3af; font-size: 0.875rem;">
          Check the browser console for more details.
        </p>
      </div>
    `
  }
}

renderApp()

