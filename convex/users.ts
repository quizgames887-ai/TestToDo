import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// Get current authenticated user
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    return await ctx.db.get(userId)
  },
})

// Get user by ID
export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    await ctx.db.patch(userId, {
      name: args.name,
    })

    return await ctx.db.get(userId)
  },
})

// Create or update user after authentication
export const createOrUpdate = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db.get(userId)
    if (existing) {
      await ctx.db.patch(userId, {
        email: args.email,
        name: args.name ?? existing.name,
        // Set createdAt if it's missing (for users created before this fix)
        createdAt: existing.createdAt ?? Date.now(),
      })
    }

    return await ctx.db.get(userId)
  },
})

