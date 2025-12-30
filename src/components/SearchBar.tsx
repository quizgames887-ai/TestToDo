import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Search, X, Calendar, Flag } from 'lucide-react'
import { format } from 'date-fns'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const searchResults = useQuery(
    api.tasks.search,
    query.trim().length >= 2 ? { query: query.trim() } : 'skip'
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSelect = (taskId: string) => {
    navigate(`/task/${taskId}`)
    setQuery('')
    setIsOpen(false)
  }

  const priorityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  }

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search tasks... (⌘K)"
        className="input pl-12 pr-10 py-2.5"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-100 rounded"
        >
          <X className="w-4 h-4 text-surface-400" />
        </button>
      )}

      {/* Search Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-soft-lg border border-surface-200 max-h-[400px] overflow-y-auto z-20">
            {searchResults === undefined ? (
              <div className="p-4 text-center">
                <div className="spinner mx-auto" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-surface-500 font-sans text-sm">
                No tasks found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((task) => (
                  <button
                    key={task._id}
                    onClick={() => handleSelect(task._id)}
                    className="w-full px-4 py-3 text-left hover:bg-surface-50 flex items-start gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'low' ? 'bg-green-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-surface-900 ${
                        task.status === 'completed' ? 'line-through text-surface-500' : ''
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-surface-500 font-sans">
                            <Calendar className="w-3 h-3" />
                            {format(task.dueDate, 'MMM d')}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 text-xs font-sans capitalize ${priorityColors[task.priority]}`}>
                          <Flag className="w-3 h-3" />
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

