import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { Id } from './_generated/dataModel'

// List tasks for the current user with optional filters
export const list = query({
  args: {
    status: v.optional(v.union(v.literal('pending'), v.literal('completed'))),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    projectId: v.optional(v.id('projects')),
    categoryId: v.optional(v.id('categories')),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    let tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    // Filter out deleted tasks unless explicitly requested
    if (!args.includeDeleted) {
      tasks = tasks.filter((t) => !t.deletedAt)
    }

    // Apply filters
    if (args.status) {
      tasks = tasks.filter((t) => t.status === args.status)
    }
    if (args.priority) {
      tasks = tasks.filter((t) => t.priority === args.priority)
    }
    if (args.projectId) {
      tasks = tasks.filter((t) => t.projectId === args.projectId)
    }
    if (args.categoryId) {
      tasks = tasks.filter((t) => t.categoryId === args.categoryId)
    }

    // Sort by due date (nulls last), then by creation date
    return tasks.sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.createdAt - a.createdAt
    })
  },
})

// List today's tasks
export const listToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return tasks
      .filter(
        (t) =>
          !t.deletedAt &&
          t.status === 'pending' &&
          t.dueDate &&
          t.dueDate >= startOfDay &&
          t.dueDate <= endOfDay
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  },
})

// List overdue tasks
export const listOverdue = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = Date.now()

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return tasks
      .filter(
        (t) =>
          !t.deletedAt &&
          t.status === 'pending' &&
          t.dueDate &&
          t.dueDate < now
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  },
})

// List upcoming tasks (next 7 days)
export const listUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = new Date()
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
    const endOfWeek = startOfTomorrow + 7 * 24 * 60 * 60 * 1000

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return tasks
      .filter(
        (t) =>
          !t.deletedAt &&
          t.status === 'pending' &&
          t.dueDate &&
          t.dueDate >= startOfTomorrow &&
          t.dueDate < endOfWeek
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  },
})

// Get a single task by ID
export const get = query({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) return null

    return task
  },
})

// Search tasks
export const search = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    if (!args.query.trim()) return []

    const results = await ctx.db
      .query('tasks')
      .withSearchIndex('search_tasks', (q) =>
        q.search('title', args.query).eq('userId', userId)
      )
      .take(20)

    return results.filter((t) => !t.deletedAt)
  },
})

// Get subtasks for a task
export const getSubtasks = query({
  args: { parentTaskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const subtasks = await ctx.db
      .query('tasks')
      .withIndex('by_parent', (q) => q.eq('parentTaskId', args.parentTaskId))
      .collect()

    return subtasks
      .filter((t) => t.userId === userId && !t.deletedAt)
      .sort((a, b) => a.createdAt - b.createdAt)
  },
})

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    projectId: v.optional(v.id('projects')),
    categoryId: v.optional(v.id('categories')),
    parentTaskId: v.optional(v.id('tasks')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const now = Date.now()
    const taskId = await ctx.db.insert('tasks', {
      userId,
      title: args.title,
      description: args.description,
      dueDate: args.dueDate,
      priority: args.priority || 'medium',
      status: 'pending',
      projectId: args.projectId,
      categoryId: args.categoryId,
      parentTaskId: args.parentTaskId,
      createdAt: now,
      updatedAt: now,
    })

    return taskId
  },
})

// Update a task
export const update = mutation({
  args: {
    id: v.id('tasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    status: v.optional(v.union(v.literal('pending'), v.literal('completed'))),
    projectId: v.optional(v.id('projects')),
    categoryId: v.optional(v.id('categories')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(id)
  },
})

// Mark task as complete
export const markComplete = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    await ctx.db.patch(args.id, {
      status: 'completed',
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

// Toggle task status
export const toggleStatus = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    await ctx.db.patch(args.id, {
      status: newStatus,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

// Soft delete a task
export const softDelete = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Permanently delete a task
export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    // Delete associated task tags
    const taskTags = await ctx.db
      .query('taskTags')
      .withIndex('by_task', (q) => q.eq('taskId', args.id))
      .collect()

    for (const tt of taskTags) {
      await ctx.db.delete(tt._id)
    }

    // Delete associated reminders
    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_task', (q) => q.eq('taskId', args.id))
      .collect()

    for (const reminder of reminders) {
      await ctx.db.delete(reminder._id)
    }

    await ctx.db.delete(args.id)
  },
})

// Restore a soft-deleted task
export const restore = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.id)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    await ctx.db.patch(args.id, {
      deletedAt: undefined,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

// Create multiple subtasks at once
export const createSubtasks = mutation({
  args: {
    parentTaskId: v.id('tasks'),
    subtasks: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const parentTask = await ctx.db.get(args.parentTaskId)
    if (!parentTask || parentTask.userId !== userId) {
      throw new Error('Parent task not found')
    }

    const now = Date.now()
    const subtaskIds: Id<'tasks'>[] = []

    for (const subtask of args.subtasks) {
      const id = await ctx.db.insert('tasks', {
        userId,
        title: subtask.title,
        description: subtask.description,
        priority: subtask.priority || parentTask.priority,
        status: 'pending',
        projectId: parentTask.projectId,
        categoryId: parentTask.categoryId,
        parentTaskId: args.parentTaskId,
        dueDate: parentTask.dueDate,
        createdAt: now,
        updatedAt: now,
      })
      subtaskIds.push(id)
    }

    return subtaskIds
  },
})

