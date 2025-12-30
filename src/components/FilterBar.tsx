import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { Filter, ChevronDown } from 'lucide-react'

interface FilterBarProps {
  filters: {
    status?: 'pending' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    projectId?: Id<'projects'>
    categoryId?: Id<'categories'>
  }
  onFilterChange: (filters: FilterBarProps['filters']) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const projects = useQuery(api.projects.list)
  const categories = useQuery(api.categories.list)

  const hasFilters = filters.status || filters.priority || filters.projectId || filters.categoryId

  const clearFilters = () => {
    onFilterChange({})
  }

  const updateFilter = <K extends keyof FilterBarProps['filters']>(
    key: K,
    value: FilterBarProps['filters'][K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn ${hasFilters ? 'btn-primary' : 'btn-secondary'} gap-2`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasFilters && (
          <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">
            {Object.values(filters).filter(Boolean).length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 bg-white rounded-xl shadow-soft-lg border border-surface-200 p-4 z-20 min-w-[280px] max-w-[90vw] sm:max-w-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-surface-900 font-sans text-sm">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent-600 hover:text-accent-700 font-sans"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-surface-600 font-sans mb-2 block">
                  Status
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('status', filters.status === 'pending' ? undefined : 'pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium ${
                      filters.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateFilter('status', filters.status === 'completed' ? undefined : 'completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium ${
                      filters.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-xs font-medium text-surface-600 font-sans mb-2 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter('priority', filters.priority === p ? undefined : p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium capitalize ${
                        filters.priority === p
                          ? p === 'low'
                            ? 'bg-green-100 text-green-700'
                            : p === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              {projects && projects.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-surface-600 font-sans mb-2 block">
                    Project
                  </label>
                  <select
                    value={filters.projectId || ''}
                    onChange={(e) => updateFilter('projectId', e.target.value as Id<'projects'> || undefined)}
                    className="input py-2 text-sm"
                  >
                    <option value="">All projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category Filter */}
              {categories && categories.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-surface-600 font-sans mb-2 block">
                    Category
                  </label>
                  <select
                    value={filters.categoryId || ''}
                    onChange={(e) => updateFilter('categoryId', e.target.value as Id<'categories'> || undefined)}
                    className="input py-2 text-sm"
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

