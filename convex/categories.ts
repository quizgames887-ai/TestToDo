import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// List all categories for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const categories = await ctx.db
      .query('categories')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return categories.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Get a single category by ID
export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const category = await ctx.db.get(args.id)
    if (!category || category.userId !== userId) return null

    return category
  },
})

// List all categories with task counts
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const categories = await ctx.db
      .query('categories')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const tasks = await ctx.db
          .query('tasks')
          .withIndex('by_category', (q) => q.eq('categoryId', category._id))
          .collect()

        const activeTasks = tasks.filter((t) => !t.deletedAt)
        const completedTasks = activeTasks.filter((t) => t.status === 'completed')
        const pendingTasks = activeTasks.filter((t) => t.status === 'pending')

        return {
          ...category,
          taskCount: activeTasks.length,
          completedCount: completedTasks.length,
          pendingCount: pendingTasks.length,
        }
      })
    )

    return categoriesWithStats.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Create a new category
export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const now = Date.now()
    const categoryId = await ctx.db.insert('categories', {
      userId,
      name: args.name,
      color: args.color || '#0ea5e9',
      createdAt: now,
      updatedAt: now,
    })

    return categoryId
  },
})

// Update a category
export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const category = await ctx.db.get(args.id)
    if (!category || category.userId !== userId) {
      throw new Error('Category not found')
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(id)
  },
})

// Delete a category
export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const category = await ctx.db.get(args.id)
    if (!category || category.userId !== userId) {
      throw new Error('Category not found')
    }

    // Remove category reference from tasks
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_category', (q) => q.eq('categoryId', args.id))
      .collect()

    for (const task of tasks) {
      await ctx.db.patch(task._id, {
        categoryId: undefined,
        updatedAt: Date.now(),
      })
    }

    await ctx.db.delete(args.id)
  },
})

