import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { authTables } from '@convex-dev/auth/server'

export default defineSchema({
  ...authTables,

  // Users table (extended from auth)
  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  }).index('by_email', ['email']),

  // Tasks table
  tasks: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    status: v.union(v.literal('pending'), v.literal('completed')),
    categoryId: v.optional(v.id('categories')),
    projectId: v.optional(v.id('projects')),
    parentTaskId: v.optional(v.id('tasks')), // For subtasks
    deletedAt: v.optional(v.number()), // Soft delete
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_status', ['userId', 'status'])
    .index('by_user_dueDate', ['userId', 'dueDate'])
    .index('by_project', ['projectId'])
    .index('by_category', ['categoryId'])
    .index('by_parent', ['parentTaskId'])
    .searchIndex('search_tasks', {
      searchField: 'title',
      filterFields: ['userId', 'status', 'priority'],
    }),

  // Projects table
  projects: defineTable({
    userId: v.id('users'),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Categories table
  categories: defineTable({
    userId: v.id('users'),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // Tags table
  tags: defineTable({
    userId: v.id('users'),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  // TaskTags junction table (many-to-many)
  taskTags: defineTable({
    taskId: v.id('tasks'),
    tagId: v.id('tags'),
  })
    .index('by_task', ['taskId'])
    .index('by_tag', ['tagId']),

  // Reminders table
  reminders: defineTable({
    taskId: v.id('tasks'),
    userId: v.id('users'),
    reminderDate: v.number(),
    notified: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_task', ['taskId'])
    .index('by_user_date', ['userId', 'reminderDate'])
    .index('by_pending', ['notified', 'reminderDate']),

  // User settings table
  userSettings: defineTable({
    userId: v.id('users'),
    notificationPreferences: v.object({
      email: v.boolean(),
      push: v.boolean(),
      reminderBeforeDue: v.number(), // hours
    }),
    theme: v.optional(v.union(v.literal('light'), v.literal('dark'), v.literal('system'))),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  // AI suggestions cache
  aiSuggestions: defineTable({
    taskId: v.id('tasks'),
    userId: v.id('users'),
    type: v.union(
      v.literal('priority'),
      v.literal('deadline'),
      v.literal('subtasks'),
      v.literal('insight')
    ),
    suggestion: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index('by_task', ['taskId'])
    .index('by_user_type', ['userId', 'type']),
})

