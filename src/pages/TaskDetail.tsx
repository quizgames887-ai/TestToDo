import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Flag,
  Folder,
  Tag,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  Plus,
  ListTree,
} from 'lucide-react'
import { TaskCard } from '../components/TaskCard'

export function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const taskId = id as Id<'tasks'>

  const task = useQuery(api.tasks.get, { id: taskId })
  const subtasks = useQuery(api.tasks.getSubtasks, { parentTaskId: taskId })
  const projects = useQuery(api.projects.list)
  const categories = useQuery(api.categories.list)

  const updateTask = useMutation(api.tasks.update)
  const toggleStatus = useMutation(api.tasks.toggleStatus)
  const softDelete = useMutation(api.tasks.softDelete)
  const createSubtasks = useMutation(api.tasks.createSubtasks)
  
  // AI actions
  const breakdownTask = useAction(api.ai.breakdownSubtasks)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [projectId, setProjectId] = useState<Id<'projects'> | undefined>()
  const [categoryId, setCategoryId] = useState<Id<'categories'> | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '')
      setPriority(task.priority)
      setProjectId(task.projectId)
      setCategoryId(task.categoryId)
      setHasChanges(false)
    }
  }, [task])

  const handleSave = async () => {
    if (!hasChanges) return
    setIsSaving(true)
    try {
      await updateTask({
        id: taskId,
        title,
        description: description || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        priority,
        projectId,
        categoryId,
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    await softDelete({ id: taskId })
    navigate('/')
  }

  const handleToggleStatus = async () => {
    await toggleStatus({ id: taskId })
  }

  const handleGenerateSubtasks = async () => {
    if (!task) return
    setIsGeneratingSubtasks(true)
    try {
      const result = await breakdownTask({
        taskId,
        title: task.title,
        description: task.description,
      })
      if (result?.subtasks && result.subtasks.length > 0) {
        await createSubtasks({
          parentTaskId: taskId,
          subtasks: result.subtasks,
        })
      }
    } catch (error) {
      console.error('Failed to generate subtasks:', error)
    } finally {
      setIsGeneratingSubtasks(false)
    }
  }

  const handleFieldChange = <T,>(setter: (val: T) => void) => (value: T) => {
    setter(value)
    setHasChanges(true)
  }

  if (task === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  if (task === null) {
    return (
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="empty-state">
          <h3 className="text-xl font-serif font-medium text-surface-900 mb-2">
            Task not found
          </h3>
          <p className="text-surface-500 font-sans">
            This task may have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  const isCompleted = task.status === 'completed'
  const project = projects?.find((p) => p._id === task.projectId)
  const category = categories?.find((c) => c._id === task.categoryId)

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn btn-ghost text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Status */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleStatus}
            className="flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-surface-400 hover:text-primary-500" />
            )}
          </button>
          <div className="flex-1">
            <span className={`text-sm font-sans ${isCompleted ? 'text-green-600' : 'text-surface-500'}`}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="card space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleFieldChange(setTitle)(e.target.value)}
            className="w-full text-2xl font-serif font-medium text-surface-900 border-none focus:outline-none focus:ring-0 p-0"
            placeholder="Task title"
          />
        </div>

        {/* Description */}
        <div>
          <textarea
            value={description}
            onChange={(e) => handleFieldChange(setDescription)(e.target.value)}
            className="w-full text-surface-700 border-none focus:outline-none focus:ring-0 p-0 min-h-[100px] resize-none"
            placeholder="Add a description..."
          />
        </div>

        <hr className="border-surface-200" />

        {/* Due Date */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-surface-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-sans">Due date</span>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => handleFieldChange(setDueDate)(e.target.value)}
            className="input py-2"
          />
        </div>

        {/* Priority */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-surface-600">
            <Flag className="w-4 h-4" />
            <span className="text-sm font-sans">Priority</span>
          </div>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleFieldChange(setPriority)(p)}
                className={`py-1.5 px-3 rounded-lg border text-sm font-sans font-medium capitalize transition-all ${
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-surface-600">
            <Folder className="w-4 h-4" />
            <span className="text-sm font-sans">Project</span>
          </div>
          <select
            value={projectId || ''}
            onChange={(e) => handleFieldChange(setProjectId)(e.target.value as Id<'projects'> || undefined)}
            className="input py-2"
          >
            <option value="">No project</option>
            {projects?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32 text-surface-600">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-sans">Category</span>
          </div>
          <select
            value={categoryId || ''}
            onChange={(e) => handleFieldChange(setCategoryId)(e.target.value as Id<'categories'> || undefined)}
            className="input py-2"
          >
            <option value="">No category</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-medium text-surface-900 flex items-center gap-2">
            <ListTree className="w-5 h-5" />
            Subtasks
          </h2>
          <button
            onClick={handleGenerateSubtasks}
            disabled={isGeneratingSubtasks}
            className="btn btn-ghost text-accent-600"
          >
            {isGeneratingSubtasks ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Generate
              </>
            )}
          </button>
        </div>

        {subtasks && subtasks.length > 0 ? (
          <div className="space-y-3">
            {subtasks.map((subtask) => (
              <TaskCard key={subtask._id} task={subtask} />
            ))}
          </div>
        ) : (
          <div className="card bg-surface-50 border-dashed text-center py-8">
            <p className="text-surface-500 font-sans text-sm">
              No subtasks yet. Use AI to break down this task or add them manually.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

