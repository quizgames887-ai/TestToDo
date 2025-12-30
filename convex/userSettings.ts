import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// Get user settings
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    // Return default settings if none exist
    if (!settings) {
      return {
        userId,
        notificationPreferences: {
          email: true,
          push: true,
          reminderBeforeDue: 24,
        },
        theme: 'light' as const,
        updatedAt: Date.now(),
      }
    }

    return settings
  },
})

// Update or create user settings
export const update = mutation({
  args: {
    notificationPreferences: v.optional(
      v.object({
        email: v.boolean(),
        push: v.boolean(),
        reminderBeforeDue: v.number(),
      })
    ),
    theme: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('system'))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    const updates = {
      notificationPreferences: args.notificationPreferences ?? existing?.notificationPreferences ?? {
        email: true,
        push: true,
        reminderBeforeDue: 24,
      },
      theme: args.theme ?? existing?.theme ?? 'light',
      updatedAt: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, updates)
      return await ctx.db.get(existing._id)
    }

    const settingsId = await ctx.db.insert('userSettings', {
      userId,
      ...updates,
    })

    return await ctx.db.get(settingsId)
  },
})

// Reset settings to defaults
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    const defaults = {
      notificationPreferences: {
        email: true,
        push: true,
        reminderBeforeDue: 24,
      },
      theme: 'light' as const,
      updatedAt: Date.now(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, defaults)
      return await ctx.db.get(existing._id)
    }

    const settingsId = await ctx.db.insert('userSettings', {
      userId,
      ...defaults,
    })

    return await ctx.db.get(settingsId)
  },
})

