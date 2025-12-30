import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Bell, Trash2, Check, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export function ReminderList() {
  const upcomingReminders = useQuery(api.reminders.listUpcoming, { limit: 5 })
  const overdueReminders = useQuery(api.reminders.listOverdue)
  const markNotified = useMutation(api.reminders.markNotified)
  const deleteReminder = useMutation(api.reminders.remove)

  const isLoading = upcomingReminders === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner" />
      </div>
    )
  }

  const hasReminders =
    (upcomingReminders && upcomingReminders.length > 0) ||
    (overdueReminders && overdueReminders.length > 0)

  if (!hasReminders) {
    return (
      <div className="text-center py-8">
        <Bell className="w-8 h-8 text-surface-400 mx-auto mb-2" />
        <p className="text-surface-500 font-sans text-sm">No upcoming reminders</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {overdueReminders && overdueReminders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Overdue ({overdueReminders.length})
          </h4>
          <div className="space-y-2">
            {overdueReminders.map((reminder) => (
              <ReminderItem
                key={reminder._id}
                reminder={reminder}
                onMarkNotified={() => markNotified({ id: reminder._id })}
                onDelete={() => deleteReminder({ id: reminder._id })}
                isOverdue
              />
            ))}
          </div>
        </div>
      )}

      {upcomingReminders && upcomingReminders.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-600 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Upcoming ({upcomingReminders.length})
          </h4>
          <div className="space-y-2">
            {upcomingReminders.map((reminder) => (
              <ReminderItem
                key={reminder._id}
                reminder={reminder}
                onMarkNotified={() => markNotified({ id: reminder._id })}
                onDelete={() => deleteReminder({ id: reminder._id })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ReminderItemProps {
  reminder: {
    _id: Id<'reminders'>
    reminderDate: number
    task: {
      _id: Id<'tasks'>
      title: string
    } | null
  }
  onMarkNotified: () => void
  onDelete: () => void
  isOverdue?: boolean
}

function ReminderItem({ reminder, onMarkNotified, onDelete, isOverdue }: ReminderItemProps) {
  if (!reminder.task) return null

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-surface-50 border-surface-200'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 truncate">
          {reminder.task.title}
        </p>
        <p className={`text-xs font-sans ${isOverdue ? 'text-red-600' : 'text-surface-500'}`}>
          {isOverdue
            ? `${formatDistanceToNow(reminder.reminderDate)} ago`
            : format(reminder.reminderDate, 'MMM d, h:mm a')}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onMarkNotified}
          className="p-1.5 rounded hover:bg-surface-200 text-surface-500 hover:text-green-600"
          title="Mark as notified"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-surface-200 text-surface-500 hover:text-red-600"
          title="Delete reminder"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

