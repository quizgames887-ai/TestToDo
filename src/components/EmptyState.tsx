import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-medium text-surface-900 mb-2">
        {title}
      </h3>
      <p className="text-surface-500 font-sans max-w-md mb-6">
        {description}
      </p>
      {action}
    </div>
  )
}

