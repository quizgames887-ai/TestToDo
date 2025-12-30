import { useConvexAuth } from 'convex/react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const { signIn, signOut } = useAuthActions()
  const currentUser = useQuery(api.users.current)
  const createOrUpdateUser = useMutation(api.users.createOrUpdate)

  const signInWithPassword = async (email: string, password: string) => {
    try {
      await signIn('password', { email, password, flow: 'signIn' })
      // Wait for auth to complete, then ensure user record is updated
      // The callback should handle this, but this is a backup
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        await createOrUpdateUser({ email, name: undefined })
      } catch (err) {
        // Ignore errors - user might already be updated by callback
        console.warn('Failed to update user after sign in:', err)
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  }

  const signUpWithPassword = async (email: string, password: string, name?: string) => {
    try {
      await signIn('password', { email, password, ...(name ? { name } : {}), flow: 'signUp' })
      // Wait for auth to complete, then ensure user record is created/updated
      // The callback should handle this, but this is a backup
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        await createOrUpdateUser({ email, name })
      } catch (err) {
        // Ignore errors - user might already be created by callback
        console.warn('Failed to create/update user after sign up:', err)
      }
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

