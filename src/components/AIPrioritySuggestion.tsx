import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Sparkles, Loader2, Check } from 'lucide-react'

interface AIPrioritySuggestionProps {
  title: string
  description?: string
  dueDate?: number
  currentPriority: 'low' | 'medium' | 'high'
  onAccept: (priority: 'low' | 'medium' | 'high') => void
}

export function AIPrioritySuggestion({
  title,
  description,
  dueDate,
  currentPriority,
  onAccept,
}: AIPrioritySuggestionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<'low' | 'medium' | 'high' | null>(null)

  const suggestPriority = useMutation(api.ai.suggestPriority)

  const handleSuggest = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const result = await suggestPriority({
        title,
        description,
        dueDate,
      })
      if (result?.priority) {
        setSuggestion(result.priority as 'low' | 'medium' | 'high')
      }
    } catch (error) {
      console.error('Failed to get suggestion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    if (suggestion) {
      onAccept(suggestion)
      setSuggestion(null)
    }
  }

  if (suggestion && suggestion !== currentPriority) {
    const priorityColors = {
      low: 'bg-green-50 border-green-200 text-green-700',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      high: 'bg-red-50 border-red-200 text-red-700',
    }

    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${priorityColors[suggestion]}`}>
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-sans flex-1">
          AI suggests <strong className="capitalize">{suggestion}</strong> priority
        </span>
        <button
          onClick={handleAccept}
          className="p-1.5 rounded-md bg-white/50 hover:bg-white/80 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSuggestion(null)}
          className="text-xs opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSuggest}
      disabled={isLoading || !title.trim()}
      className="inline-flex items-center gap-1.5 text-xs font-sans text-accent-600 hover:text-accent-700 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      {isLoading ? 'Analyzing...' : 'AI Suggest'}
    </button>
  )
}

