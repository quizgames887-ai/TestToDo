import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { X, Loader2 } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId?: Id<'categories'>
}

const COLORS = [
  '#0ea5e9', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#8f7559', '#6366f1', '#a855f7', '#ec4899',
]

export function CategoryModal({ isOpen, onClose, categoryId }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const category = useQuery(api.categories.get, categoryId ? { id: categoryId } : 'skip')
  const createCategory = useMutation(api.categories.create)
  const updateCategory = useMutation(api.categories.update)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setColor(category.color || COLORS[0])
    } else {
      setName('')
      setColor(COLORS[0])
    }
  }, [category, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    try {
      if (categoryId) {
        await updateCategory({
          id: categoryId,
          name: name.trim(),
          color,
        })
      } else {
        await createCategory({
          name: name.trim(),
          color,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save category:', error)
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
            {categoryId ? 'Edit Category' : 'New Category'}
          </h2>
          <button onClick={onClose} className="btn btn-ghost p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="name" className="input-label">
              Category name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Work, Personal, etc."
              required
              autoFocus
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
              ) : categoryId ? (
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

