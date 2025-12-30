import { useConvexAuth } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signIn, signOut } = useAuthActions()
  const currentUser = useQuery(api.users.current)

  const signInWithPassword = async (email: string, password: string) => {
    try {
      await signIn('password', { email, password, flow: 'signIn' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  }

  const signUpWithPassword = async (email: string, password: string, name?: string) => {
    try {
      await signIn('password', { email, password, ...(name ? { name } : {}), flow: 'signUp' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  }

  return {
    isAuthenticated,
    isLoading,
    user: currentUser,
    userId: currentUser?._id as Id<'users'> | undefined,
    signIn: signInWithPassword,
    signUp: signUpWithPassword,
    signOut: handleSignOut,
  }
}

