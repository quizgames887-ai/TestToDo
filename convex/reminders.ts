import { query, mutation, internalMutation } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { internal } from './_generated/api'
import { cronJobs } from 'convex/server'

// List all reminders for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_user_date', (q) => q.eq('userId', userId))
      .collect()

    // Get associated tasks
    const remindersWithTasks = await Promise.all(
      reminders.map(async (reminder) => {
        const task = await ctx.db.get(reminder.taskId)
        return { ...reminder, task }
      })
    )

    return remindersWithTasks.filter((r) => r.task && !r.task.deletedAt)
  },
})

// List upcoming reminders (not yet notified)
export const listUpcoming = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = Date.now()
    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_user_date', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('notified'), false),
          q.gt(q.field('reminderDate'), now)
        )
      )
      .take(args.limit || 10)

    const remindersWithTasks = await Promise.all(
      reminders.map(async (reminder) => {
        const task = await ctx.db.get(reminder.taskId)
        return { ...reminder, task }
      })
    )

    return remindersWithTasks.filter((r) => r.task && !r.task.deletedAt)
  },
})

// List overdue reminders (past due, not notified)
export const listOverdue = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = Date.now()
    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_pending', (q) =>
        q.eq('notified', false).lt('reminderDate', now)
      )
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()

    const remindersWithTasks = await Promise.all(
      reminders.map(async (reminder) => {
        const task = await ctx.db.get(reminder.taskId)
        return { ...reminder, task }
      })
    )

    return remindersWithTasks.filter((r) => r.task && !r.task.deletedAt)
  },
})

// Get reminder by ID
export const get = query({
  args: { id: v.id('reminders') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const reminder = await ctx.db.get(args.id)
    if (!reminder || reminder.userId !== userId) return null

    const task = await ctx.db.get(reminder.taskId)
    return { ...reminder, task }
  },
})

// Get reminders for a specific task
export const getByTask = query({
  args: { taskId: v.id('tasks') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const reminders = await ctx.db
      .query('reminders')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()

    return reminders
  },
})

// Create a reminder
export const create = mutation({
  args: {
    taskId: v.id('tasks'),
    reminderDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    // Verify the task exists and belongs to the user
    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    const reminderId = await ctx.db.insert('reminders', {
      taskId: args.taskId,
      userId,
      reminderDate: args.reminderDate,
      notified: false,
      createdAt: Date.now(),
    })

    return reminderId
  },
})

// Update a reminder
export const update = mutation({
  args: {
    id: v.id('reminders'),
    reminderDate: v.optional(v.number()),
    notified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const reminder = await ctx.db.get(args.id)
    if (!reminder || reminder.userId !== userId) {
      throw new Error('Reminder not found')
    }

    const { id, ...updates } = args
    await ctx.db.patch(id, updates)

    return await ctx.db.get(id)
  },
})

// Delete a reminder
export const remove = mutation({
  args: { id: v.id('reminders') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const reminder = await ctx.db.get(args.id)
    if (!reminder || reminder.userId !== userId) {
      throw new Error('Reminder not found')
    }

    await ctx.db.delete(args.id)
  },
})

// Mark reminder as notified
export const markNotified = mutation({
  args: { id: v.id('reminders') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const reminder = await ctx.db.get(args.id)
    if (!reminder || reminder.userId !== userId) {
      throw new Error('Reminder not found')
    }

    await ctx.db.patch(args.id, { notified: true })
  },
})

// Internal mutation for scheduled function to process reminders
export const processReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    
    // Get all pending reminders that are due
    const dueReminders = await ctx.db
      .query('reminders')
      .withIndex('by_pending', (q) =>
        q.eq('notified', false).lt('reminderDate', now)
      )
      .take(100) // Process in batches

    let processed = 0
    for (const reminder of dueReminders) {
      // Get the associated task
      const task = await ctx.db.get(reminder.taskId)
      
      // Skip if task is deleted or completed
      if (!task || task.deletedAt || task.status === 'completed') {
        await ctx.db.patch(reminder._id, { notified: true })
        continue
      }

      // In a real application, this would send an email/push notification
      // For now, we just mark as notified
      await ctx.db.patch(reminder._id, { notified: true })
      processed++
    }

    return { processed }
  },
})

// Create automatic reminder for task based on due date
export const createFromTask = mutation({
  args: {
    taskId: v.id('tasks'),
    hoursBeforeDue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const task = await ctx.db.get(args.taskId)
    if (!task || task.userId !== userId) {
      throw new Error('Task not found')
    }

    if (!task.dueDate) {
      throw new Error('Task has no due date')
    }

    // Get user settings for default reminder time
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first()

    const hoursBeforeDue = args.hoursBeforeDue ?? 
      settings?.notificationPreferences?.reminderBeforeDue ?? 
      24 // Default 24 hours

    const reminderDate = task.dueDate - hoursBeforeDue * 60 * 60 * 1000

    // Don't create reminder if it's in the past
    if (reminderDate < Date.now()) {
      return null
    }

    const reminderId = await ctx.db.insert('reminders', {
      taskId: args.taskId,
      userId,
      reminderDate,
      notified: false,
      createdAt: Date.now(),
    })

    return reminderId
  },
})

// Define cron job to process reminders every 5 minutes
const crons = cronJobs()

crons.interval(
  'process reminders',
  { minutes: 5 },
  internal.reminders.processReminders
)

export default crons

