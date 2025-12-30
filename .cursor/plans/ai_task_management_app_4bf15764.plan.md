---
name: AI Task Management App (Convex)
overview: Build a production-ready AI-powered task management application using Convex backend with React frontend, featuring authentication, real-time task CRUD, organization, AI-assisted prioritization, and analytics.
todos:
  - id: setup-project
    content: Initialize Convex project, install dependencies (React + Vite, Convex, TypeScript), configure Convex dashboard
    status: completed
  - id: convex-schema
    content: Define Convex schema with tables for tasks, projects, categories, tags, reminders, and userSettings
    status: completed
    dependencies:
      - setup-project
  - id: convex-auth
    content: Set up Convex authentication (Clerk integration or Convex auth), configure auth helpers
    status: completed
    dependencies:
      - convex-schema
  - id: frontend-auth
    content: Build login/register pages, Convex auth hooks, protected routes, auth state management
    status: completed
    dependencies:
      - convex-auth
  - id: task-queries-mutations
    content: Create Convex queries and mutations for task CRUD operations with user isolation
    status: completed
    dependencies:
      - convex-auth
  - id: task-crud-frontend
    content: Build dashboard with real-time task lists, task detail/edit pages, task form component using Convex hooks
    status: completed
    dependencies:
      - task-queries-mutations
      - frontend-auth
  - id: organization-convex
    content: Implement Convex queries/mutations for projects, categories, tags with relationships
    status: completed
    dependencies:
      - task-queries-mutations
  - id: organization-frontend
    content: Build project/category management UI, filtering, search functionality with Convex queries
    status: completed
    dependencies:
      - organization-convex
      - task-crud-frontend
  - id: ai-actions
    content: Create Convex actions for OpenAI API integration (priority suggestions, deadline recommendations, subtask breakdown)
    status: completed
    dependencies:
      - task-queries-mutations
  - id: ai-features-frontend
    content: Build AI suggestion UI components, integrate AI actions into task creation/editing flow
    status: completed
    dependencies:
      - ai-actions
      - task-crud-frontend
  - id: reminders-scheduled
    content: Implement Convex scheduled functions for reminders, notification system
    status: completed
    dependencies:
      - task-queries-mutations
  - id: reminders-frontend
    content: Build settings page for notification preferences, reminder UI components
    status: completed
    dependencies:
      - reminders-scheduled
  - id: analytics-queries
    content: Create Convex queries for analytics (productivity metrics, completion rates, trends)
    status: completed
    dependencies:
      - task-queries-mutations
  - id: analytics-frontend
    content: Build analytics dashboard with charts, AI-generated productivity summaries using Convex queries and actions
    status: completed
    dependencies:
      - analytics-queries
      - ai-actions
  - id: design-system
    content: "Implement design system: serif typography, Tailwind config, UI components, responsive layout"
    status: completed
    dependencies:
      - frontend-auth
  - id: polish-ux
    content: Refine UX, add loading states, error handling, optimize performance, leverage Convex real-time features
    status: completed
    dependencies:
      - design-system
      - analytics-frontend
      - reminders-frontend
---

# AI Task Management Application - Implementation Plan (Convex)

## Architecture Overview

**Technology Stack:**

- **Frontend**: React + TypeScript + Vite, Tailwind CSS, React Router, Convex React hooks (replaces Zustand)
- **Backend**: Convex (backend-as-a-service) with TypeScript
- **Database**: Convex database (managed, no SQL)
- **Authentication**: Convex Auth (Clerk integration recommended)
- **AI**: OpenAI API via Convex Actions
- **Structure**: Single project with `convex/` and `src/` directories

## Project Structure

```javascript
TestToDo/
├── convex/
│   ├── schema.ts              # Convex schema definitions
│   ├── auth.ts                # Authentication configuration
│   ├── tasks.ts               # Task queries and mutations
│   ├── projects.ts            # Project queries and mutations
│   ├── categories.ts          # Category queries and mutations
│   ├── tags.ts                # Tag queries and mutations
│   ├── reminders.ts           # Reminder queries, mutations, scheduled functions
│   ├── analytics.ts           # Analytics queries
│   ├── ai.ts                  # AI actions (OpenAI integration)
│   └── userSettings.ts         # User settings queries and mutations
├── src/
│   ├── components/            # Reusable UI components
│   ├── pages/                 # Route pages
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities, helpers
│   ├── types/                 # TypeScript types (generated from Convex)
│   └── styles/                # Global styles, Tailwind config
├── public/
├── convex.json                # Convex configuration
├── package.json
└── README.md
```



## Database Schema (Convex)

**Core Tables:**

```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    status: v.union(v.literal("pending"), v.literal("completed")),
    categoryId: v.optional(v.id("categories")),
    projectId: v.optional(v.id("projects")),
    deletedAt: v.optional(v.number()), // soft delete
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_dueDate", ["userId", "dueDate"])
    .index("by_project", ["projectId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  tags: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  taskTags: defineTable({
    taskId: v.id("tasks"),
    tagId: v.id("tags"),
  })
    .index("by_task", ["taskId"])
    .index("by_tag", ["tagId"]),

  reminders: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("users"),
    reminderDate: v.number(),
    notified: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_user_reminderDate", ["userId", "reminderDate"]),

  userSettings: defineTable({
    userId: v.id("users"),
    notificationPreferences: v.object({
      email: v.boolean(),
      push: v.boolean(),
      reminderBeforeDue: v.number(), // hours
    }),
    theme: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
```



## Implementation Phases

### Phase 1: Foundation & Authentication

**Files to create:**

- `convex/schema.ts` - Convex schema with all tables
- `convex/auth.ts` - Authentication setup (Clerk integration)
- `src/lib/convex-provider.tsx` - ConvexProvider setup
- `src/pages/Login.tsx` - Login page
- `src/pages/Register.tsx` - Registration page
- `src/components/ProtectedRoute.tsx` - Route protection using Convex auth

**Key decisions:**

- Use Convex Auth with Clerk for email authentication
- Leverage Convex's built-in user session management
- Use `useQuery` and `useMutation` hooks for real-time data

### Phase 2: Core Task CRUD

**Files to create:**

- `convex/tasks.ts` - Task queries and mutations:
- `list` - Query tasks for user with filters
- `get` - Get single task by ID
- `create` - Create new task
- `update` - Update task
- `markComplete` - Mark task as completed
- `softDelete` - Soft delete task
- `src/pages/Dashboard.tsx` - Main dashboard with real-time task lists
- `src/pages/TaskDetail.tsx` - Task detail/edit page
- `src/components/TaskCard.tsx` - Task display component
- `src/components/TaskForm.tsx` - Create/edit task form

**Features:**

- Full CRUD operations with real-time updates
- Task status updates (pending → completed)
- Soft delete implementation
- Automatic reactivity - UI updates when data changes

### Phase 3: Organization & Filtering

**Files to create:**

- `convex/projects.ts` - Project queries and mutations
- `convex/categories.ts` - Category queries and mutations
- `convex/tags.ts` - Tag queries and mutations
- `convex/tasks.ts` - Add search query using Convex full-text search
- `src/pages/Projects.tsx` - Project organization page
- `src/components/FilterBar.tsx` - Filtering UI
- `src/components/SearchBar.tsx` - Search functionality

**Features:**

- Create/edit projects and categories
- Tag tasks with many-to-many relationship
- Filter by date, priority, status, project, category using Convex indexes
- Search across task titles and descriptions using Convex search

### Phase 4: AI Integration

**Files to create:**

- `convex/ai.ts` - Convex actions for OpenAI:
- `suggestPriority` - Action to suggest task priority
- `recommendDeadline` - Action to recommend due date
- `breakdownSubtasks` - Action to break task into subtasks
- `generateProductivitySummary` - Action for AI summaries
- `src/components/AIPrioritySuggestion.tsx` - Priority suggestion UI
- `src/components/AISubtaskGenerator.tsx` - Subtask breakdown UI
- `src/pages/Analytics.tsx` - Productivity insights page

**AI Features:**

- Priority suggestion based on task content and due date
- Deadline recommendation when missing
- Subtask breakdown for large tasks
- Daily/weekly/monthly productivity summaries
- Lightweight insights without overwhelming users

**Implementation notes:**

- Use Convex Actions for external API calls (OpenAI)
- Actions are async and can call external APIs
- Store AI suggestions in database for caching

### Phase 5: Reminders & Notifications

**Files to create:**

- `convex/reminders.ts`:
- Queries: `listByUser`, `listUpcoming`
- Mutations: `create`, `markNotified`
- Scheduled function: `checkAndNotify` (runs periodically)
- `convex/userSettings.ts` - User notification preferences
- `src/pages/Settings.tsx` - Notification preferences
- `src/components/ReminderList.tsx` - Reminder UI components

**Features:**

- Due date reminders
- Overdue task notifications
- Configurable notification preferences
- Scheduled functions run automatically (Convex handles cron)

### Phase 6: Analytics & Insights

**Files to create:**

- `convex/analytics.ts` - Analytics queries:
- `getCompletionRate` - Calculate completion rates
- `getProductivityTrends` - Get trends over time
- `getTaskStats` - Aggregate task statistics
- `convex/ai.ts` - Add `generateInsights` action
- `src/pages/Analytics.tsx` - Analytics dashboard
- `src/components/ProductivityChart.tsx` - Chart components
- `src/components/AISummary.tsx` - AI-generated summaries

**Features:**

- Task completion rates
- Productivity trends
- AI-generated insights and recommendations
- Real-time analytics updates

### Phase 7: Design System & Polish

**Files to create:**

- `tailwind.config.js` - Tailwind configuration with serif fonts
- `src/styles/globals.css` - Global styles, typography
- `src/components/ui/` - Reusable UI components (Button, Input, Card, etc.)
- Design tokens for colors, spacing, shadows

**Design implementation:**

- Serif typography (e.g., Georgia, "Times New Roman")
- Soft shadows and rounded corners
- Neutral color palette with subtle accents
- Document-editor-style interface
- Fully responsive layout

## Key Architectural Decisions

1. **State Management**: Convex React hooks (`useQuery`, `useMutation`) replace Zustand - automatic reactivity
2. **API Communication**: Direct Convex queries/mutations - no REST API needed
3. **Database**: Convex managed database - no SQL, type-safe queries
4. **Authentication**: Convex Auth with Clerk - built-in session management
5. **AI Integration**: Convex Actions for OpenAI API calls - handles async external calls
6. **Real-time Updates**: Automatic reactivity - UI updates when data changes
7. **Scheduled Tasks**: Convex scheduled functions - no cron jobs needed
8. **Type Safety**: End-to-end TypeScript types generated from Convex schema
9. **Error Handling**: Convex handles errors automatically, display in UI
10. **Validation**: Convex validators in schema and mutations

## Convex-Specific Features

**Real-time Reactivity:**

- All queries automatically update when data changes
- No manual state management needed
- Optimistic updates with mutations

**Type Safety:**

- Types generated from schema automatically
- End-to-end type safety from database to frontend
- Autocomplete for all queries and mutations

**Performance:**

- Automatic query optimization
- Indexed queries for fast filtering
- Efficient data fetching

**Scalability:**

- Convex handles scaling automatically
- No server management needed
- Built-in caching and optimization

## Environment Variables

**Convex:**

- `CONVEX_DEPLOYMENT` - Convex deployment URL (auto-configured)
- `CONVEX_URL` - Convex URL (from dashboard)

**Frontend:**

- `VITE_CONVEX_URL` - Convex URL (from dashboard)

**AI:**

- `OPENAI_API_KEY` - OpenAI API key (stored in Convex dashboard secrets)

## Development Workflow

1. Initialize Convex project: `npx convex dev`
2. Set up Convex dashboard and configure authentication
3. Define schema in `convex/schema.ts`
4. Create queries and mutations
5. Build frontend components using Convex hooks
6. Deploy: `npx convex deploy`

## Security Considerations

- Convex handles authentication and authorization automatically
- User isolation via `userId` in queries
- Input validation via Convex validators
- No SQL injection (no SQL)
- Automatic HTTPS and secure connections
- Secrets stored securely in Convex dashboard
- Row-level security via query filters

## Convex Advantages

1. **No Backend Code**: Queries and mutations are simple TypeScript functions
2. **Real-time by Default**: All data updates automatically in UI
3. **Type Safety**: End-to-end types from database to frontend
4. **No Boilerplate**: No Express routes, controllers, or middleware
5. **Automatic Scaling**: Convex handles infrastructure
6. **Built-in Features**: Auth, scheduled functions, file storage, search