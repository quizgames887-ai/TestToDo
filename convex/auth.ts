import { convexAuth } from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'
import { DataModel } from './_generated/dataModel'

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password<DataModel>()],
  callbacks: {
    afterAuth: async (ctx, args) => {
      try {
        const userId = args.userId
        if (!userId) return

        // Get user info from provider data
        // The Password provider passes email and name in the signIn call
        const providerData = args.providerData as Record<string, unknown> | undefined
        const email = providerData?.email as string | undefined
        const name = providerData?.name as string | undefined

        // Check if user record exists (it should, created by auth system)
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
          // User record should exist, but if it doesn't, log a warning
          // The createOrUpdate mutation called from frontend will handle this
          console.warn('User record not found after auth, userId:', userId)
        }
      } catch (error) {
        // Log error but don't throw - auth should still succeed
        console.error('Error in afterAuth callback:', error)
      }
    },
  },
})

