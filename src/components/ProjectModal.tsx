import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { X, Loader2 } from 'lucide-react'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  projectId?: Id<'projects'>
}

const COLORS = [
  '#8f7559', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899',
]

export function ProjectModal({ isOpen, onClose, projectId }: ProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const project = useQuery(api.projects.get, projectId ? { id: projectId } : 'skip')
  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.update)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description || '')
      setColor(project.color || COLORS[0])
    } else {
      setName('')
      setDescription('')
      setColor(COLORS[0])
    }
  }, [project, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      if (projectId) {
        await updateProject({
          id: projectId,
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        })
      } else {
        await createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-soft-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-surface-200">
          <h2 className="text-xl font-serif font-medium text-surface-900">
            {projectId ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="name" className="input-label">
              Project name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="My Project"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="description" className="input-label">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input min-h-[80px] resize-none"
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label className="input-label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-surface-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : projectId ? (
                'Update'
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

