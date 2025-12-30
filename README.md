# TaskFlow - AI-Powered Task Management

A modern, AI-powered task management application built with React, TypeScript, Convex, and Tailwind CSS.

## Features

### Core Task Management
- Create, read, update, and delete tasks
- Task fields: title, description, due date, priority, category, project, status
- Mark tasks as complete
- Soft delete with restore capability
- Real-time updates across all devices

### Organization
- Projects to group related tasks
- Categories for classification
- Tags for flexible labeling
- Filtering by status, priority, project, and category
- Full-text search across tasks

### AI Capabilities
- **Priority Suggestions**: AI analyzes task content and due date to suggest optimal priority
- **Deadline Recommendations**: Get smart deadline suggestions based on task complexity
- **Subtask Breakdown**: AI automatically breaks complex tasks into manageable subtasks
- **Productivity Summaries**: Daily, weekly, and monthly AI-generated productivity reports
- **Insights**: Lightweight AI-powered productivity insights

### Reminders & Notifications
- Due date reminders
- Overdue task notifications
- Configurable notification preferences
- Scheduled reminder processing

### Analytics & Insights
- Task completion rates
- Productivity trends over time
- Priority distribution
- Project progress tracking
- Overdue task analysis

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Convex (backend-as-a-service)
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Authentication**: Convex Auth with password provider

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Convex account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TestToDo
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```
This will:
- Create a new Convex project
- Generate the `convex/_generated` directory
- Set up the `.env.local` file with your Convex URL

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_CONVEX_URL=<your-convex-deployment-url>
```

For AI features (optional), add your OpenAI API key in the Convex dashboard under Settings > Environment Variables:
```
OPENAI_API_KEY=<your-openai-api-key>
```

## Project Structure

```
TestToDo/
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema
│   ├── auth.ts                # Authentication configuration
│   ├── tasks.ts               # Task queries and mutations
│   ├── projects.ts            # Project management
│   ├── categories.ts          # Category management
│   ├── tags.ts                # Tag management
│   ├── reminders.ts           # Reminder system
│   ├── analytics.ts           # Analytics queries
│   ├── ai.ts                  # AI actions
│   └── userSettings.ts        # User preferences
├── src/
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── Layout.tsx         # Main layout
│   │   ├── TaskCard.tsx       # Task display
│   │   ├── TaskModal.tsx      # Task creation/editing
│   │   └── ...
│   ├── pages/                 # Route pages
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── TaskDetail.tsx     # Task detail view
│   │   ├── Projects.tsx       # Project management
│   │   ├── Analytics.tsx      # Analytics dashboard
│   │   └── Settings.tsx       # User settings
│   ├── hooks/                 # Custom React hooks
│   │   └── useAuth.ts         # Authentication hook
│   ├── lib/                   # Utilities
│   │   └── convex-provider.tsx
│   └── styles/                # Global styles
│       └── globals.css
├── public/                    # Static assets
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run convex` - Start Convex development server
- `npm run convex:deploy` - Deploy Convex functions

## Design System

### Typography
- **Primary font**: Crimson Pro (serif) - for headings and body text
- **Secondary font**: Inter (sans-serif) - for UI elements

### Colors
- **Primary**: Warm brown tones (#8f7559)
- **Accent**: Blue (#0ea5e9)
- **Surface**: Neutral stone tones
- **Semantic**: Green (success), Yellow (warning), Red (danger)

### Components
- Clean, document-editor-style interface
- Soft shadows and rounded corners
- Subtle hover states
- Fully responsive layout

## Authentication

The app uses Convex Auth with email/password authentication:
- Secure session management
- Protected routes
- User-specific data isolation

## Real-time Updates

Thanks to Convex, all data updates in real-time:
- Tasks sync instantly across devices
- No manual refresh needed
- Optimistic updates for smooth UX

## License

MIT License

