import { ReactNode, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { Doc } from '../../convex/_generated/dataModel'

interface TaskSectionProps {
  title: string
  icon: ReactNode
  tasks: Doc<'tasks'>[]
  variant?: 'default' | 'danger' | 'success' | 'muted'
  emptyMessage?: string
  collapsed?: boolean
}

export function TaskSection({
  title,
  icon,
  tasks,
  variant = 'default',
  emptyMessage,
  collapsed: initialCollapsed = false,
}: TaskSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed)

  const variantStyles = {
    default: '',
    danger: 'border-l-4 border-l-red-400 pl-4',
    success: 'opacity-75',
    muted: '',
  }

  return (
    <section className={variantStyles[variant]}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 sm:gap-3 mb-4 group w-full text-left"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-surface-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-surface-400 group-hover:text-surface-600 flex-shrink-0" />
        )}
        <span className="flex-shrink-0">{icon}</span>
        <h2 className="text-lg sm:text-xl font-serif font-medium text-surface-900">{title}</h2>
        <span className="text-sm text-surface-500 font-sans">
          ({tasks.length})
        </span>
      </button>

      {!isCollapsed && (
        <>
          {tasks.length === 0 ? (
            <p className="text-surface-500 font-sans text-sm pl-6 sm:pl-7">
              {emptyMessage || 'No tasks'}
            </p>
          ) : (
            <div className="space-y-3 pl-6 sm:pl-7">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

