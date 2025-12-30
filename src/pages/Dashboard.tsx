import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { TaskCard } from '../components/TaskCard'
import { TaskSection } from '../components/TaskSection'
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

export function Dashboard() {
  const todayTasks = useQuery(api.tasks.listToday)
  const overdueTasks = useQuery(api.tasks.listOverdue)
  const upcomingTasks = useQuery(api.tasks.listUpcoming)
  const completedTasks = useQuery(api.tasks.list, { status: 'completed' })

  const isLoading = todayTasks === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
          <p className="text-surface-500 font-sans">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  const hasOverdue = overdueTasks && overdueTasks.length > 0
  const hasToday = todayTasks && todayTasks.length > 0
  const hasUpcoming = upcomingTasks && upcomingTasks.length > 0
  const hasCompleted = completedTasks && completedTasks.length > 0

  const isEmpty = !hasOverdue && !hasToday && !hasUpcoming && !hasCompleted

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-surface-900 mb-2">Dashboard</h1>
        <p className="text-surface-500 font-sans">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {isEmpty ? (
        <div className="empty-state">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-serif font-medium text-surface-900 mb-2">
            All caught up!
          </h3>
          <p className="text-surface-500 font-sans max-w-md">
            You don't have any tasks yet. Click the "New Task" button to create your first task.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue Tasks */}
          {hasOverdue && (
            <TaskSection
              title="Overdue"
              icon={<AlertCircle className="w-5 h-5 text-red-500" />}
              tasks={overdueTasks}
              variant="danger"
            />
          )}

          {/* Today's Tasks */}
          <TaskSection
            title="Today"
            icon={<Calendar className="w-5 h-5 text-primary-600" />}
            tasks={todayTasks || []}
            emptyMessage="No tasks scheduled for today"
          />

          {/* Upcoming Tasks */}
          {hasUpcoming && (
            <TaskSection
              title="Upcoming"
              icon={<Clock className="w-5 h-5 text-accent-600" />}
              tasks={upcomingTasks}
              variant="muted"
            />
          )}

          {/* Recently Completed */}
          {hasCompleted && (
            <TaskSection
              title="Recently Completed"
              icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
              tasks={completedTasks.slice(0, 5)}
              variant="success"
              collapsed
            />
          )}
        </div>
      )}
    </div>
  )
}

