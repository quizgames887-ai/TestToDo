import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Doc } from '../../convex/_generated/dataModel'
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns'
import {
  Calendar,
  MoreHorizontal,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
} from 'lucide-react'

interface TaskCardProps {
  task: Doc<'tasks'>
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  
  const toggleStatus = useMutation(api.tasks.toggleStatus)
  const softDelete = useMutation(api.tasks.softDelete)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleStatus({ id: task._id })
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await softDelete({ id: task._id })
    setShowMenu(false)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/task/${task._id}`)
    setShowMenu(false)
  }

  const isCompleted = task.status === 'completed'
  const isOverdue = task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && !isCompleted

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  }

  const formatDueDate = (date: number) => {
    if (isToday(date)) {
      return 'Today'
    }
    if (isPast(date)) {
      return `${formatDistanceToNow(date)} ago`
    }
    return format(date, 'MMM d')
  }

  return (
    <div
      onClick={() => navigate(`/task/${task._id}`)}
      className={`task-item cursor-pointer group ${
        isCompleted ? 'opacity-60' : ''
      } ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className="flex-shrink-0 mt-0.5"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-surface-400 hover:text-primary-500" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Priority dot */}
          <div
            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              priorityColors[task.priority]
            }`}
          />
          
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm sm:text-base text-surface-900 ${
                isCompleted ? 'line-through text-surface-500' : ''
              }`}
            >
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-xs sm:text-sm text-surface-500 line-clamp-2 mt-1">
                {task.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 sm:gap-4 mt-2">
              {task.dueDate && (
                <span
                  className={`flex items-center gap-1.5 text-xs font-sans ${
                    isOverdue
                      ? 'text-red-600 font-medium'
                      : 'text-surface-500'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="btn btn-ghost p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
              }}
            />
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-soft-lg border border-surface-200 py-1 z-20 min-w-[140px]">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50 font-sans"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-sans"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

