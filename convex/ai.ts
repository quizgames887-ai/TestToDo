import { action, mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'
import { api } from './_generated/api'

// Suggest task priority based on content and due date
export const suggestPriority = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    // Simple heuristic-based priority suggestion
    // In production, this would call OpenAI API via an action
    const title = args.title.toLowerCase()
    const description = (args.description || '').toLowerCase()
    const content = `${title} ${description}`

    let priority: 'low' | 'medium' | 'high' = 'medium'

    // Check for urgency keywords
    const highPriorityKeywords = [
      'urgent', 'asap', 'critical', 'emergency', 'deadline',
      'important', 'priority', 'immediately', 'today', 'now',
    ]
    const lowPriorityKeywords = [
      'sometime', 'when possible', 'eventually', 'nice to have',
      'optional', 'whenever', 'no rush', 'low priority',
    ]

    if (highPriorityKeywords.some((kw) => content.includes(kw))) {
      priority = 'high'
    } else if (lowPriorityKeywords.some((kw) => content.includes(kw))) {
      priority = 'low'
    }

    // Check due date
    if (args.dueDate) {
      const now = Date.now()
      const daysUntilDue = (args.dueDate - now) / (1000 * 60 * 60 * 24)

      if (daysUntilDue < 1) {
        priority = 'high'
      } else if (daysUntilDue < 3) {
        priority = priority === 'low' ? 'medium' : priority
      } else if (daysUntilDue > 14) {
        priority = priority === 'high' ? 'medium' : priority
      }
    }

    return { priority }
  },
})

// Recommend deadline based on task content
export const recommendDeadline = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    // Simple heuristic-based deadline recommendation
    const title = args.title.toLowerCase()
    const description = (args.description || '').toLowerCase()
    const content = `${title} ${description}`

    const now = new Date()
    let daysToAdd = 7 // Default 1 week

    // Check for time-related keywords
    if (content.includes('today') || content.includes('asap')) {
      daysToAdd = 0
    } else if (content.includes('tomorrow')) {
      daysToAdd = 1
    } else if (content.includes('this week')) {
      daysToAdd = 5
    } else if (content.includes('next week')) {
      daysToAdd = 10
    } else if (content.includes('this month')) {
      daysToAdd = 21
    } else if (content.includes('next month')) {
      daysToAdd = 35
    }

    // Task complexity heuristics
    const complexKeywords = ['research', 'design', 'develop', 'build', 'implement', 'create']
    const simpleKeywords = ['call', 'email', 'send', 'check', 'review', 'buy']

    if (complexKeywords.some((kw) => content.includes(kw))) {
      daysToAdd = Math.max(daysToAdd, 7)
    }
    if (simpleKeywords.some((kw) => content.includes(kw))) {
      daysToAdd = Math.min(daysToAdd, 3)
    }

    const recommendedDate = new Date(now)
    recommendedDate.setDate(recommendedDate.getDate() + daysToAdd)
    recommendedDate.setHours(17, 0, 0, 0) // Set to 5 PM

    return {
      recommendedDate: recommendedDate.getTime(),
      reasoning: `Based on the task content, this seems like a ${
        daysToAdd <= 3 ? 'quick' : daysToAdd <= 7 ? 'medium' : 'longer-term'
      } task.`,
    }
  },
})

// Break down a task into subtasks using AI
export const breakdownSubtasks = action({
  args: {
    taskId: v.id('tasks'),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In production, this would call OpenAI API
    // For now, use heuristic-based breakdown

    const title = args.title.toLowerCase()
    const description = (args.description || '').toLowerCase()
    const content = `${title} ${description}`

    const subtasks: { title: string; description?: string; priority?: 'low' | 'medium' | 'high' }[] = []

    // Project-related tasks
    if (content.includes('project') || content.includes('build') || content.includes('develop')) {
      subtasks.push(
        { title: 'Define requirements and scope', priority: 'high' },
        { title: 'Create initial design/mockup', priority: 'medium' },
        { title: 'Set up project structure', priority: 'medium' },
        { title: 'Implement core functionality', priority: 'high' },
        { title: 'Test and debug', priority: 'medium' },
        { title: 'Review and finalize', priority: 'low' }
      )
    }
    // Research tasks
    else if (content.includes('research') || content.includes('analyze') || content.includes('investigate')) {
      subtasks.push(
        { title: 'Define research questions', priority: 'high' },
        { title: 'Gather relevant sources', priority: 'medium' },
        { title: 'Review and analyze findings', priority: 'medium' },
        { title: 'Document conclusions', priority: 'medium' },
        { title: 'Create summary/presentation', priority: 'low' }
      )
    }
    // Meeting/presentation tasks
    else if (content.includes('meeting') || content.includes('presentation') || content.includes('present')) {
      subtasks.push(
        { title: 'Define agenda/topics', priority: 'high' },
        { title: 'Prepare materials/slides', priority: 'medium' },
        { title: 'Review and rehearse', priority: 'medium' },
        { title: 'Send invites/reminders', priority: 'low' }
      )
    }
    // Writing tasks
    else if (content.includes('write') || content.includes('document') || content.includes('report')) {
      subtasks.push(
        { title: 'Create outline', priority: 'high' },
        { title: 'Write first draft', priority: 'high' },
        { title: 'Review and edit', priority: 'medium' },
        { title: 'Finalize and format', priority: 'low' }
      )
    }
    // Generic task breakdown
    else {
      subtasks.push(
        { title: `Plan: ${args.title}`, priority: 'high' },
        { title: `Execute: ${args.title}`, priority: 'medium' },
        { title: `Review: ${args.title}`, priority: 'low' }
      )
    }

    return { subtasks }
  },
})

// Generate productivity summary
export const generateProductivitySummary = action({
  args: {
    period: v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly')),
  },
  handler: async (ctx, args) => {
    // This would typically aggregate task data and call OpenAI for insights
    // For now, return a template response

    const periodText = {
      daily: 'today',
      weekly: 'this week',
      monthly: 'this month',
    }[args.period]

    return {
      summary: `Here's your productivity summary for ${periodText}. You've been making steady progress on your tasks. Keep up the good work!`,
      tips: [
        'Consider breaking down larger tasks into smaller subtasks',
        'Try to complete high-priority tasks early in the day',
        'Review overdue tasks and reschedule if needed',
      ],
    }
  },
})

// Generate insights based on task patterns
export const generateInsights = action({
  args: {},
  handler: async () => {
    // In production, this would analyze task patterns and call OpenAI

    return {
      insights: [
        {
          type: 'productivity',
          title: 'Peak Productivity Hours',
          description: 'You tend to complete more tasks in the morning. Consider scheduling important work during this time.',
        },
        {
          type: 'completion',
          title: 'Task Completion Rate',
          description: 'Your task completion rate has improved this week. Keep maintaining this momentum!',
        },
        {
          type: 'priority',
          title: 'Priority Balance',
          description: 'You have a good balance of high, medium, and low priority tasks. This helps maintain sustainable productivity.',
        },
      ],
    }
  },
})

// Cache AI suggestion
export const cacheSuggestion = mutation({
  args: {
    taskId: v.id('tasks'),
    type: v.union(
      v.literal('priority'),
      v.literal('deadline'),
      v.literal('subtasks'),
      v.literal('insight')
    ),
    suggestion: v.string(),
    metadata: v.optional(v.any()),
    expiresInHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error('Not authenticated')

    const now = Date.now()
    const expiresAt = now + (args.expiresInHours || 24) * 60 * 60 * 1000

    // Check if there's an existing suggestion
    const existing = await ctx.db
      .query('aiSuggestions')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .filter((q) => q.eq(q.field('type'), args.type))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        suggestion: args.suggestion,
        metadata: args.metadata,
        expiresAt,
      })
      return existing._id
    }

    return await ctx.db.insert('aiSuggestions', {
      taskId: args.taskId,
      userId,
      type: args.type,
      suggestion: args.suggestion,
      metadata: args.metadata,
      createdAt: now,
      expiresAt,
    })
  },
})

// Get cached suggestion
export const getCachedSuggestion = query({
  args: {
    taskId: v.id('tasks'),
    type: v.union(
      v.literal('priority'),
      v.literal('deadline'),
      v.literal('subtasks'),
      v.literal('insight')
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const suggestion = await ctx.db
      .query('aiSuggestions')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .filter((q) =>
        q.and(
          q.eq(q.field('type'), args.type),
          q.eq(q.field('userId'), userId),
          q.gt(q.field('expiresAt'), Date.now())
        )
      )
      .first()

    return suggestion
  },
})

