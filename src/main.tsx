import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConvexAuthProvider } from './lib/convex-provider'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConvexAuthProvider>
        <App />
      </ConvexAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

