import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider as ConvexAuthProviderBase } from '@convex-dev/auth/react'
import { ReactNode } from 'react'
import { ConnectionError } from '../components/ConnectionError'

const convexUrl = import.meta.env.VITE_CONVEX_URL

let convex: ConvexReactClient | null = null
let initializationError: Error | null = null

try {
  if (!convexUrl) {
    // In production, show a helpful error message
    if (import.meta.env.PROD) {
      console.error('Missing VITE_CONVEX_URL environment variable.')
      console.error('Please set VITE_CONVEX_URL in your Vercel/Netlify environment variables.')
      console.error('Get your Convex URL from: https://dashboard.convex.dev')
    }
    initializationError = new Error('Missing VITE_CONVEX_URL environment variable. Please configure it in your deployment settings.')
  } else {
    // Validate the URL format
    if (!convexUrl.startsWith('https://')) {
      console.warn('Convex URL should start with https://. Current value:', convexUrl)
    }
    convex = new ConvexReactClient(convexUrl)
  }
} catch (error) {
  console.error('Failed to initialize Convex client:', error)
  initializationError = error instanceof Error ? error : new Error('Failed to initialize Convex client')
}

interface ConvexAuthProviderProps {
  children: ReactNode
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  // Show error if initialization failed
  if (initializationError || !convex) {
    return (
      <ConnectionError
        message={initializationError?.message || 'Convex client not initialized'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProviderBase client={convex}>
        {children}
      </ConvexAuthProviderBase>
    </ConvexProvider>
  )
}

export { convex }

