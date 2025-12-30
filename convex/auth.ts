import { convexAuth } from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'
import { DataModel } from './_generated/dataModel'
import { GenericMutationCtx } from 'convex/server'
import { Id } from './_generated/dataModel'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password<DataModel>()],
  callbacks: {
    createOrUpdateUser: async (
      ctx: GenericMutationCtx<DataModel>,
      args: {
        existingUserId: Id<'users'> | null
        type: 'email' | 'credentials' | 'oauth' | 'phone' | 'verification'
        provider: unknown
        profile: Record<string, unknown> & { email?: string; name?: string; image?: string }
        shouldLink?: boolean
      }
    ): Promise<Id<'users'>> => {
      try {
        // Get user info from profile
        const email = args.profile?.email as string | undefined
        const name = args.profile?.name as string | undefined

        // With Password provider, existingUserId should always be provided
        // The auth system creates the user record before calling this callback
        if (!args.existingUserId) {
          throw new Error('existingUserId is required for Password provider')
        }

        const userId = args.existingUserId

        // Check if user record exists
        const existing = await ctx.db.get(userId)
        
        if (existing) {
          // Update user with email/name if provided and not already set
          const updates: { email?: string; name?: string; createdAt?: number } = {}
          if (email && !existing.email) updates.email = email
          if (name && !existing.name) updates.name = name
          if (!existing.createdAt) updates.createdAt = Date.now()
          
          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(userId, updates)
          }
        } else {
          // User record should exist from auth system
          // Sometimes there's a race condition, so we'll wait a bit and check again
          await new Promise(resolve => setTimeout(resolve, 100))
          const retryCheck = await ctx.db.get(userId)
          
          if (retryCheck) {
            // User exists now, update it
            const updates: { email?: string; name?: string; createdAt?: number } = {}
            if (email && !retryCheck.email) updates.email = email
            if (name && !retryCheck.name) updates.name = name
            if (!retryCheck.createdAt) updates.createdAt = Date.now()
            
            if (Object.keys(updates).length > 0) {
              await ctx.db.patch(userId, updates)
            }
          } else {
            // User still doesn't exist - this shouldn't happen with Password provider
            // Try to create it with replace (will fail if doc truly doesn't exist)
            try {
              await ctx.db.replace(userId, {
                email: email || '',
                name: name,
                createdAt: Date.now(),
              })
            } catch (replaceError) {
              // If replace fails, the document truly doesn't exist
              // This is a serious issue - log it and throw an error
              console.error('User record missing for userId:', userId, 'Auth system may not have created the user')
              throw new Error('Failed to create user record. Please try signing up again.')
            }
          }
        }
        
        return userId
      } catch (error) {
        // Log error but rethrow - we need to return a userId
        console.error('Error in createOrUpdateUser callback:', error)
        throw error
      }
    },
  },
})

