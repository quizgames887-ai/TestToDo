import { useState } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Sparkles, Loader2, RefreshCw, Lightbulb, TrendingUp, Target } from 'lucide-react'

interface AISummaryProps {
  period: 'daily' | 'weekly' | 'monthly'
}

export function AISummary({ period }: AISummaryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<{
    summary: string
    tips: string[]
  } | null>(null)

  const generateSummary = useAction(api.ai.generateProductivitySummary)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateSummary({ period })
      setSummary(result)
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!summary) {
    return (
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full p-6 bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border border-accent-200 hover:border-accent-300 transition-colors text-center"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
            <p className="text-surface-600 font-sans text-sm">Generating your summary...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <p className="font-medium text-surface-900">Generate AI Summary</p>
              <p className="text-sm text-surface-500 font-sans mt-1">
                Get personalized insights about your {period} productivity
              </p>
            </div>
          </div>
        )}
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-accent-50 to-primary-50 rounded-xl border border-accent-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-surface-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-600" />
          AI Summary
        </h3>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="btn btn-ghost p-2 text-surface-500"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-surface-700 mb-6">{summary.summary}</p>

      {summary.tips.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-surface-600 font-sans mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Tips for improvement
          </h4>
          <ul className="space-y-2">
            {summary.tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-surface-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function AIInsights() {
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<{
    type: string
    title: string
    description: string
  }[] | null>(null)

  const generateInsights = useAction(api.ai.generateInsights)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateInsights({})
      setInsights(result.insights)
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const iconMap: Record<string, React.ReactNode> = {
    productivity: <TrendingUp className="w-5 h-5" />,
    completion: <Target className="w-5 h-5" />,
    priority: <Sparkles className="w-5 h-5" />,
  }

  if (!insights) {
    return (
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="btn btn-ghost w-full justify-center py-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating insights...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate AI Insights
          </>
        )}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <div
          key={index}
          className="card bg-gradient-to-br from-white to-surface-50"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600 flex-shrink-0">
              {iconMap[insight.type] || <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-medium text-surface-900 mb-1">{insight.title}</h4>
              <p className="text-sm text-surface-600">{insight.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

