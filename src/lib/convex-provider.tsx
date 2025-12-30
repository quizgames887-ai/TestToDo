import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ConvexAuthProvider as ConvexAuthProviderBase } from '@convex-dev/auth/react'
import { ReactNode } from 'react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  throw new Error('Missing VITE_CONVEX_URL environment variable. Run `npx convex dev` to set it up.')
}

const convex = new ConvexReactClient(convexUrl)

interface ConvexAuthProviderProps {
  children: ReactNode
}

export function ConvexAuthProvider({ children }: ConvexAuthProviderProps) {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProviderBase client={convex}>
        {children}
      </ConvexAuthProviderBase>
    </ConvexProvider>
  )
}

export { convex }

