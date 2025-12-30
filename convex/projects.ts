import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// List all projects for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    return projects.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Get a single project by ID
export const get = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== userId) return null

    return project
  },
})

// Get project with task count
export const getWithStats = query({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== userId) return null

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_project', (q) => q.eq('projectId', args.id))
      .collect()

    const activeTasks = tasks.filter((t) => !t.deletedAt)
    const completedTasks = activeTasks.filter((t) => t.status === 'completed')
    const pendingTasks = activeTasks.filter((t) => t.status === 'pending')

    return {
      ...project,
      taskCount: activeTasks.length,
      completedCount: completedTasks.length,
      pendingCount: pendingTasks.length,
    }
  },
})

// List all projects with task counts
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await ctx.db
          .query('tasks')
          .withIndex('by_project', (q) => q.eq('projectId', project._id))
          .collect()

        const activeTasks = tasks.filter((t) => !t.deletedAt)
        const completedTasks = activeTasks.filter((t) => t.status === 'completed')
        const pendingTasks = activeTasks.filter((t) => t.status === 'pending')

        return {
          ...project,
          taskCount: activeTasks.length,
          completedCount: completedTasks.length,
          pendingCount: pendingTasks.length,
        }
      })
    )

    return projectsWithStats.sort((a, b) => a.name.localeCompare(b.name))
  },
})

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const now = Date.now()
    const projectId = await ctx.db.insert('projects', {
      userId,
      name: args.name,
      description: args.description,
      color: args.color || '#8f7559',
      createdAt: now,
      updatedAt: now,
    })

    return projectId
  },
})

// Update a project
export const update = mutation({
  args: {
    id: v.id('projects'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== userId) {
      throw new Error('Project not found')
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(id)
  },
})

// Delete a project (and optionally its tasks)
export const remove = mutation({
  args: {
    id: v.id('projects'),
    deleteTasks: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== userId) {
      throw new Error('Project not found')
    }

    // Get all tasks in this project
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_project', (q) => q.eq('projectId', args.id))
      .collect()

    if (args.deleteTasks) {
      // Delete all tasks in the project
      for (const task of tasks) {
        // Delete task tags
        const taskTags = await ctx.db
          .query('taskTags')
          .withIndex('by_task', (q) => q.eq('taskId', task._id))
          .collect()
        for (const tt of taskTags) {
          await ctx.db.delete(tt._id)
        }
        // Delete reminders
        const reminders = await ctx.db
          .query('reminders')
          .withIndex('by_task', (q) => q.eq('taskId', task._id))
          .collect()
        for (const r of reminders) {
          await ctx.db.delete(r._id)
        }
        await ctx.db.delete(task._id)
      }
    } else {
      // Remove project reference from tasks
      for (const task of tasks) {
        await ctx.db.patch(task._id, {
          projectId: undefined,
          updatedAt: Date.now(),
        })
      }
    }

    await ctx.db.delete(args.id)
  },
})

