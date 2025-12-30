import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { X, Calendar, Flag, Folder, Tag, Sparkles, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskId?: Id<'tasks'>
}

export function TaskModal({ isOpen, onClose, taskId }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [projectId, setProjectId] = useState<Id<'projects'> | undefined>()
  const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuggestingPriority, setIsSuggestingPriority] = useState(false)

  const task = useQuery(api.tasks.get, taskId ? { id: taskId } : 'skip')
  const projects = useQuery(api.projects.list)
  const categories = useQuery(api.categories.list)
  
  const createTask = useMutation(api.tasks.create)
  const updateTask = useMutation(api.tasks.update)
  const suggestPriority = useMutation(api.ai.suggestPriority)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '')
      setPriority(task.priority)
      setProjectId(task.projectId)
      setCategoryId(task.categoryId)
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setProjectId(undefined)
      setCategoryId(undefined)
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        priority,
        projectId,
        categoryId,
      }

      if (taskId) {
        await updateTask({ id: taskId, ...taskData })
      } else {
        await createTask(taskData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestPriority = async () => {
    if (!title.trim()) return
    setIsSuggestingPriority(true)
    try {
      const result = await suggestPriority({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      })
      if (result?.priority) {
        setPriority(result.priority as 'low' | 'medium' | 'high')
      }
    } catch (error) {
      console.error('Failed to suggest priority:', error)
    } finally {
      setIsSuggestingPriority(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-soft-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-xl font-serif font-medium text-surface-900">
            {taskId ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2 -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="input-label">
              Task title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="input-label">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Add more details..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="input-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="input-label flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Priority
              <button
                type="button"
                onClick={handleSuggestPriority}
                disabled={isSuggestingPriority || !title.trim()}
                className="ml-auto btn btn-ghost text-xs py-1 px-2 text-accent-600 hover:text-accent-700"
              >
                {isSuggestingPriority ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </button>
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-sans font-medium capitalize transition-all ${
                    priority === p
                      ? p === 'low'
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : p === 'medium'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : 'bg-red-100 border-red-300 text-red-700'
                      : 'border-surface-300 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <label htmlFor="project" className="input-label flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Project (optional)
            </label>
            <select
              id="project"
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value as Id<'projects'> || undefined)}
              className="input"
            >
              <option value="">No project</option>
              {projects?.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="input-label flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category (optional)
            </label>
            <select
              id="category"
              value={categoryId || ''}
              onChange={(e) => setCategoryId(e.target.value as Id<'categories'> || undefined)}
              className="input"
            >
              <option value="">No category</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : taskId ? (
                'Update Task'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

