import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { AISummary, AIInsights } from '../components/AISummary'
import { format } from 'date-fns'

const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
}

export function Analytics() {
  const completionRate = useQuery(api.analytics.getCompletionRate, { days: 30 })
  const trends = useQuery(api.analytics.getProductivityTrends, { days: 14 })
  const priorityStats = useQuery(api.analytics.getStatsByPriority)
  const projectStats = useQuery(api.analytics.getStatsByProject)
  const overdueStats = useQuery(api.analytics.getOverdueStats)
  const weeklySummary = useQuery(api.analytics.getWeeklySummary)

  const isLoading = completionRate === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
          <p className="text-surface-500 font-sans">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-surface-900 mb-2">Analytics</h1>
        <p className="text-surface-500 font-sans">
          Track your productivity and task completion
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          icon={<Target className="w-5 h-5" />}
          title="Completion Rate"
          value={`${completionRate?.completionRate || 0}%`}
          subtitle={`${completionRate?.completed || 0} of ${completionRate?.total || 0} tasks`}
          color="primary"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          title="Tasks Completed"
          value={String(weeklySummary?.tasksCompleted || 0)}
          subtitle="This week"
          color="success"
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5" />}
          title="Avg. Completion Time"
          value={`${weeklySummary?.avgCompletionTimeHours || 0}h`}
          subtitle="Per task"
          color="accent"
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5" />}
          title="Overdue Tasks"
          value={String(overdueStats?.overdue || 0)}
          subtitle="Need attention"
          color={overdueStats?.overdue ? 'danger' : 'muted'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productivity Trends Chart */}
        <div className="card">
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Productivity Trends
          </h3>
          {trends && trends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    stroke="#78716c"
                    fontSize={12}
                  />
                  <YAxis stroke="#78716c" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke="#8f7559"
                    strokeWidth={2}
                    dot={{ fill: '#8f7559', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500 font-sans">
              No data available
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Tasks by Priority
          </h3>
          {priorityStats && priorityStats.some((p) => p.total > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis type="number" stroke="#78716c" fontSize={12} />
                  <YAxis
                    dataKey="priority"
                    type="category"
                    stroke="#78716c"
                    fontSize={12}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" stackId="a" fill="#22c55e" />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#e7e5e4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500 font-sans">
              No data available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Progress */}
        <div className="card">
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Project Progress
          </h3>
          {projectStats && projectStats.length > 0 ? (
            <div className="space-y-4">
              {projectStats.slice(0, 5).map((project) => (
                <div key={project.projectId || 'no-project'}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.projectColor || '#78716c' }}
                      />
                      <span className="text-sm font-medium text-surface-900">
                        {project.projectName}
                      </span>
                    </div>
                    <span className="text-xs text-surface-500 font-sans">
                      {project.completionRate}% complete
                    </span>
                  </div>
                  <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${project.completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-surface-500 mt-1 font-sans">
                    {project.completed} of {project.total} tasks
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-surface-500 font-sans">
              No projects with tasks
            </div>
          )}
        </div>

        {/* Overdue Breakdown */}
        <div className="card">
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary-600" />
            Task Status Breakdown
          </h3>
          {overdueStats ? (
            <div className="space-y-3">
              <StatRow
                label="Overdue (< 1 day)"
                value={overdueStats.overdueByDays.lessThanDay}
                color="red"
              />
              <StatRow
                label="Overdue (1-3 days)"
                value={overdueStats.overdueByDays.oneToThreeDays}
                color="red"
              />
              <StatRow
                label="Overdue (3-7 days)"
                value={overdueStats.overdueByDays.threeToSevenDays}
                color="orange"
              />
              <StatRow
                label="Overdue (> 1 week)"
                value={overdueStats.overdueByDays.moreThanWeek}
                color="orange"
              />
              <hr className="border-surface-200" />
              <StatRow
                label="Upcoming"
                value={overdueStats.upcoming}
                color="green"
              />
              <StatRow
                label="No Due Date"
                value={overdueStats.noDueDate}
                color="gray"
              />
            </div>
          ) : (
            <div className="py-8 text-center text-surface-500 font-sans">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4">
            Weekly AI Summary
          </h3>
          <AISummary period="weekly" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-medium text-surface-900 mb-4">
            AI Insights
          </h3>
          <AIInsights />
        </div>
      </div>
    </div>
  )
}

// Summary Card Component
interface SummaryCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: 'primary' | 'success' | 'accent' | 'danger' | 'muted'
}

function SummaryCard({ icon, title, value, subtitle, color }: SummaryCardProps) {
  const colorStyles = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    accent: 'bg-accent-100 text-accent-600',
    danger: 'bg-red-100 text-red-600',
    muted: 'bg-surface-100 text-surface-600',
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 font-sans mb-1">{title}</p>
          <p className="text-3xl font-serif font-medium text-surface-900">{value}</p>
          <p className="text-xs text-surface-500 font-sans mt-1">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Stat Row Component
interface StatRowProps {
  label: string
  value: number
  color: 'red' | 'orange' | 'green' | 'gray'
}

function StatRow({ label, value, color }: StatRowProps) {
  const dotColors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    gray: 'bg-surface-400',
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="text-sm text-surface-700">{label}</span>
      </div>
      <span className="text-sm font-medium text-surface-900">{value}</span>
    </div>
  )
}

