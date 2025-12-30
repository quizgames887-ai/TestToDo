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

        let userId = args.existingUserId

        if (!userId) {
          // If no existing user ID, create a new user
          // This should rarely happen with Password provider, but handle it for safety
          userId = await ctx.db.insert('users', {
            email,
            name,
            createdAt: Date.now(),
          })
          return userId
        }

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
          // User record should exist from auth, but if it doesn't, insert it
          // This is a fallback for edge cases
          // Note: This will create a new user with a different ID, but that's the safest fallback
          const newUserId = await ctx.db.insert('users', {
            email,
            name,
            createdAt: Date.now(),
          })
          return newUserId
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

