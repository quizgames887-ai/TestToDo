import { useState } from 'react'
import { useAction, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Sparkles, Loader2, Plus, X, Check } from 'lucide-react'

interface Subtask {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
}

interface AISubtaskGeneratorProps {
  taskId: Id<'tasks'>
  taskTitle: string
  taskDescription?: string
  onSubtasksCreated?: () => void
}

export function AISubtaskGenerator({
  taskId,
  taskTitle,
  taskDescription,
  onSubtasksCreated,
}: AISubtaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [generatedSubtasks, setGeneratedSubtasks] = useState<Subtask[]>([])
  const [selectedSubtasks, setSelectedSubtasks] = useState<Set<number>>(new Set())

  const breakdownTask = useAction(api.ai.breakdownSubtasks)
  const createSubtasks = useMutation(api.tasks.createSubtasks)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await breakdownTask({
        taskId,
        title: taskTitle,
        description: taskDescription,
      })
      if (result?.subtasks) {
        setGeneratedSubtasks(result.subtasks)
        setSelectedSubtasks(new Set(result.subtasks.map((_, i) => i)))
      }
    } catch (error) {
      console.error('Failed to generate subtasks:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateSubtasks = async () => {
    const subtasksToCreate = generatedSubtasks.filter((_, i) => selectedSubtasks.has(i))
    if (subtasksToCreate.length === 0) return

    setIsCreating(true)
    try {
      await createSubtasks({
        parentTaskId: taskId,
        subtasks: subtasksToCreate,
      })
      setGeneratedSubtasks([])
      setSelectedSubtasks(new Set())
      onSubtasksCreated?.()
    } catch (error) {
      console.error('Failed to create subtasks:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleSubtask = (index: number) => {
    const newSelected = new Set(selectedSubtasks)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSubtasks(newSelected)
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  }

  if (generatedSubtasks.length > 0) {
    return (
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-accent-900 font-sans text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI-Generated Subtasks
          </h4>
          <button
            onClick={() => {
              setGeneratedSubtasks([])
              setSelectedSubtasks(new Set())
            }}
            className="text-accent-600 hover:text-accent-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {generatedSubtasks.map((subtask, index) => (
            <div
              key={index}
              onClick={() => toggleSubtask(index)}
              className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedSubtasks.has(index)
                  ? 'bg-white border border-accent-300'
                  : 'bg-accent-100/50 border border-transparent'
              }`}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                  selectedSubtasks.has(index)
                    ? 'bg-accent-500 text-white'
                    : 'bg-white border border-surface-300'
                }`}
              >
                {selectedSubtasks.has(index) && <Check className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900">{subtask.title}</p>
                {subtask.description && (
                  <p className="text-xs text-surface-500 mt-0.5">{subtask.description}</p>
                )}
              </div>
              {subtask.priority && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                    priorityColors[subtask.priority]
                  }`}
                >
                  {subtask.priority}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn btn-ghost text-sm flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate'
            )}
          </button>
          <button
            onClick={handleCreateSubtasks}
            disabled={isCreating || selectedSubtasks.size === 0}
            className="btn btn-accent text-sm flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add {selectedSubtasks.size} Subtask{selectedSubtasks.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className="btn btn-ghost text-accent-600 hover:text-accent-700 w-full justify-center py-3 border-2 border-dashed border-accent-200 rounded-xl hover:border-accent-300 hover:bg-accent-50"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating subtasks...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          AI Generate Subtasks
        </>
      )}
    </button>
  )
}

