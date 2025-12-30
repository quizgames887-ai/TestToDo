import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// List all tags for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const tags = await ctx.db
      .query('tags')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return tags.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Get a single tag by ID
export const get = query({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const tag = await ctx.db.get(args.id)
    if (!tag || tag.userId !== userId) return null

    return tag
  },
})

// List tags with task counts
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const tags = await ctx.db
      .query('tags')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const tagsWithStats = await Promise.all(
      tags.map(async (tag) => {
        const taskTags = await ctx.db
          .query('taskTags')
          .withIndex('by_tag', (q) => q.eq('tagId', tag._id))
          .collect()

        let activeTaskCount = 0
        for (const tt of taskTags) {
          const task = await ctx.db.get(tt.taskId)
          if (task && !task.deletedAt) {
            activeTaskCount++
          }
        }

        return {
          ...tag,
          taskCount: activeTaskCount,
        }
      })
    )

    return tagsWithStats.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Get tags for a specific task
export const getByTask = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const taskTags = await ctx.db
      .query('taskTags')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect()

    const tags = await Promise.all(
      taskTags.map(async (tt) => {
        const tag = await ctx.db.get(tt.tagId)
        return tag
      })
    )

    return tags.filter((t) => t !== null && t.userId === userId)
  },
})

// Get tasks by tag
export const getTasks = query({
  args: { tagId: v.id('tags') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const tag = await ctx.db.get(args.tagId)
    if (!tag || tag.userId !== userId) return []

    const taskTags = await ctx.db
      .query('taskTags')
      .withIndex('by_tag', (q) => q.eq('tagId', args.tagId))
      .collect()

    const tasks = await Promise.all(
      taskTags.map(async (tt) => {
        const task = await ctx.db.get(tt.taskId)
        return task
      })
    )

    return tasks.filter((t) => t !== null && t.userId === userId && !t.deletedAt)
  },
})

// Create a new tag
export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const tagId = await ctx.db.insert('tags', {
      userId,
      name: args.name,
      color: args.color || '#6366f1',
      createdAt: Date.now(),
    })

    return tagId
  },
})

// Update a tag
export const update = mutation({
  args: {
    id: v.id('tags'),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const tag = await ctx.db.get(args.id)
    if (!tag || tag.userId !== userId) {
      throw new Error('Tag not found')
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, updates)

    return await ctx.db.get(id)
  },
})

// Delete a tag
export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const tag = await ctx.db.get(args.id)
    if (!tag || tag.userId !== userId) {
      throw new Error('Tag not found')
    }

    // Delete all task-tag associations
    const taskTags = await ctx.db
      .query('taskTags')
      .withIndex('by_tag', (q) => q.eq('tagId', args.id))
      .collect()

    for (const tt of taskTags) {
      await ctx.db.delete(tt._id)
    }

    await ctx.db.delete(args.id)
  },
})

// Add tag to task
export const addToTask = mutation({
  args: {
    taskId: v.id('tasks'),
    tagId: v.id('tags'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    const tag = await ctx.db.get(args.tagId)
    if (!tag || tag.userId !== userId) {
      throw new Error('Tag not found')
    }

    // Check if association already exists
    const existing = await ctx.db
      .query('taskTags')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect()

    if (existing.some((tt) => tt.tagId === args.tagId)) {
      return // Already exists
    }

    await ctx.db.insert('taskTags', {
      taskId: args.taskId,
      tagId: args.tagId,
    })
  },
})

// Remove tag from task
export const removeFromTask = mutation({
  args: {
    taskId: v.id('tasks'),
    tagId: v.id('tags'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const taskTags = await ctx.db
      .query('taskTags')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect()

    const toDelete = taskTags.find((tt) => tt.tagId === args.tagId)
    if (toDelete) {
      await ctx.db.delete(toDelete._id)
    }
  },
})

