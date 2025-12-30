import { query } from './_generated/server'
import { v } from 'convex/values'
import { getAuthUserId } from '@convex-dev/auth/server'

// Get task completion rate
export const getCompletionRate = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const days = args.days || 30
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.not(q.field('deletedAt')),
          q.gte(q.field('createdAt'), startDate)
        )
      )
      .collect()

    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const pending = tasks.filter((t) => t.status === 'pending').length

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      period: days,
    }
  },
})

// Get productivity trends over time
export const getProductivityTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const days = args.days || 14
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.not(q.field('deletedAt')),
          q.gte(q.field('createdAt'), startDate)
        )
      )
      .collect()

    // Group by day
    const dailyStats: Record<string, { created: number; completed: number }> = {}

    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      dailyStats[dateKey] = { created: 0, completed: 0 }
    }

    tasks.forEach((task) => {
      const createdDate = new Date(task.createdAt).toISOString().split('T')[0]
      if (dailyStats[createdDate]) {
        dailyStats[createdDate].created++
      }

      if (task.status === 'completed' && task.updatedAt) {
        const completedDate = new Date(task.updatedAt).toISOString().split('T')[0]
        if (dailyStats[completedDate]) {
          dailyStats[completedDate].completed++
        }
      }
    })

    return Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },
})

// Get task statistics by priority
export const getStatsByPriority = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.not(q.field('deletedAt')))
      .collect()

    const priorities = ['low', 'medium', 'high'] as const
    return priorities.map((priority) => {
      const priorityTasks = tasks.filter((t) => t.priority === priority)
      const completed = priorityTasks.filter((t) => t.status === 'completed').length
      const pending = priorityTasks.filter((t) => t.status === 'pending').length

      return {
        priority,
        total: priorityTasks.length,
        completed,
        pending,
        completionRate:
          priorityTasks.length > 0
            ? Math.round((completed / priorityTasks.length) * 100)
            : 0,
      }
    })
  },
})

// Get task statistics by project
export const getStatsByProject = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.not(q.field('deletedAt')))
      .collect()

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect()

    const projectStats = projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project._id)
      const completed = projectTasks.filter((t) => t.status === 'completed').length
      const pending = projectTasks.filter((t) => t.status === 'pending').length

      return {
        projectId: project._id,
        projectName: project.name,
        projectColor: project.color,
        total: projectTasks.length,
        completed,
        pending,
        completionRate:
          projectTasks.length > 0
            ? Math.round((completed / projectTasks.length) * 100)
            : 0,
      }
    })

    // Add "No Project" category
    const noProjectTasks = tasks.filter((t) => !t.projectId)
    const noProjectCompleted = noProjectTasks.filter((t) => t.status === 'completed').length
    const noProjectPending = noProjectTasks.filter((t) => t.status === 'pending').length

    projectStats.push({
      projectId: null as any,
      projectName: 'No Project',
      projectColor: '#78716c',
      total: noProjectTasks.length,
      completed: noProjectCompleted,
      pending: noProjectPending,
      completionRate:
        noProjectTasks.length > 0
          ? Math.round((noProjectCompleted / noProjectTasks.length) * 100)
          : 0,
    })

    return projectStats.sort((a, b) => b.total - a.total)
  },
})

// Get overdue task statistics
export const getOverdueStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const now = Date.now()
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.not(q.field('deletedAt')),
          q.eq(q.field('status'), 'pending')
        )
      )
      .collect()

    const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < now)
    const upcomingTasks = tasks.filter((t) => t.dueDate && t.dueDate >= now)
    const noDueDateTasks = tasks.filter((t) => !t.dueDate)

    // Group overdue tasks by how long they've been overdue
    const overdueByDays = {
      lessThanDay: 0,
      oneToThreeDays: 0,
      threeToSevenDays: 0,
      moreThanWeek: 0,
    }

    overdueTasks.forEach((task) => {
      if (!task.dueDate) return
      const daysOverdue = (now - task.dueDate) / (24 * 60 * 60 * 1000)
      
      if (daysOverdue < 1) {
        overdueByDays.lessThanDay++
      } else if (daysOverdue < 3) {
        overdueByDays.oneToThreeDays++
      } else if (daysOverdue < 7) {
        overdueByDays.threeToSevenDays++
      } else {
        overdueByDays.moreThanWeek++
      }
    })

    return {
      totalPending: tasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
      noDueDate: noDueDateTasks.length,
      overdueByDays,
    }
  },
})

// Get weekly summary
export const getWeeklySummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null

    const now = Date.now()
    const weekStart = now - 7 * 24 * 60 * 60 * 1000

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.not(q.field('deletedAt')))
      .collect()

    const thisWeekTasks = tasks.filter((t) => t.createdAt >= weekStart)
    const thisWeekCompleted = thisWeekTasks.filter((t) => t.status === 'completed')

    // Calculate average completion time
    let totalCompletionTime = 0
    let completedWithTime = 0

    thisWeekCompleted.forEach((task) => {
      if (task.updatedAt && task.createdAt) {
        totalCompletionTime += task.updatedAt - task.createdAt
        completedWithTime++
      }
    })

    const avgCompletionTime = completedWithTime > 0
      ? totalCompletionTime / completedWithTime
      : 0

    return {
      tasksCreated: thisWeekTasks.length,
      tasksCompleted: thisWeekCompleted.length,
      completionRate:
        thisWeekTasks.length > 0
          ? Math.round((thisWeekCompleted.length / thisWeekTasks.length) * 100)
          : 0,
      avgCompletionTimeMs: avgCompletionTime,
      avgCompletionTimeHours: Math.round(avgCompletionTime / (60 * 60 * 1000) * 10) / 10,
    }
  },
})

