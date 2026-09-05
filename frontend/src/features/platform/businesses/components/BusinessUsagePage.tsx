import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import {
  useBusinessUsageOverview,
  useBusinessUserActivity,
  useBusinessDealUsage,
  useBusinessFeatureUsage,
  useBusinessUsageTrend,
} from '../hooks/use-businesses'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Users, FileText, ShoppingCart, Code, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const trendRanges = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

function getProgressColor(percent: number): string {
  if (percent >= 80) return 'bg-success'
  if (percent >= 50) return 'bg-warning'
  return 'bg-danger'
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-elevation-2">
      <p className="text-caption font-medium text-muted-foreground mb-1.5">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-small tabular-nums">
          <span className="text-muted-foreground">{entry.name}: </span>
          <span className="font-medium text-foreground">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export function BusinessUsagePage() {
  const { id } = useParams<{ id: string }>()
  const [trendDays, setTrendDays] = useState<number>(30)

  const { data: overview, isLoading: overviewLoading, error: overviewError, refetch: refetchOverview } = useBusinessUsageOverview(id || '')
  const { data: userActivity, isLoading: userActivityLoading, error: userActivityError, refetch: refetchUserActivity } = useBusinessUserActivity(id || '')
  const { data: dealUsage, isLoading: dealUsageLoading, error: dealUsageError, refetch: refetchDealUsage } = useBusinessDealUsage(id || '')
  const { data: featureUsage, isLoading: featureUsageLoading, error: featureUsageError, refetch: refetchFeatureUsage } = useBusinessFeatureUsage(id || '')
  const { data: usageTrend, isLoading: trendLoading, error: trendError, refetch: refetchTrend } = useBusinessUsageTrend(id || '', trendDays)

  if (overviewLoading || userActivityLoading || dealUsageLoading || featureUsageLoading || trendLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-[180px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
              <CardContent><Skeleton className="h-7 w-[100px]" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
              <CardContent><Skeleton className="h-7 w-[100px]" /></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-[120px]" /></CardHeader>
          <CardContent><Skeleton className="h-[240px] w-full rounded-lg" /></CardContent>
        </Card>
      </div>
    )
  }

  if (overviewError || userActivityError || dealUsageError || featureUsageError || trendError) {
    return (
      <ErrorState
        title="Failed to load usage data"
        description="We couldn't load the usage information for this business. Please try again."
        onRetry={() => {
          refetchOverview()
          refetchUserActivity()
          refetchDealUsage()
          refetchFeatureUsage()
          refetchTrend()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-h2 text-foreground">Business Usage</h2>

      {/* Usage Overview */}
      {overview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Active Users"
            value={overview.activeUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Deals"
            value={overview.activeDeals.toLocaleString()}
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Quotations"
            value={overview.quotations.toLocaleString()}
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Orders"
            value={overview.orders.toLocaleString()}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <KpiCard
            label="API Usage"
            value={overview.apiUsage.toLocaleString()}
            icon={<Code className="h-5 w-5" />}
          />
        </div>
      ) : (
        <EmptyState
          title="No usage overview"
          description="Usage overview data is not available for this business."
        />
      )}

      {/* User Activity */}
      {userActivity ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-h1 tabular-nums text-foreground">{userActivity.dailyActiveUsers.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-h1 tabular-nums text-foreground">{userActivity.monthlyActiveUsers.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No user activity"
          description="User activity data is not available for this business."
        />
      )}

      {/* Deal Usage */}
      {dealUsage ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-h1 tabular-nums text-foreground">{dealUsage.dealsCreated.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Deals Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-h1 tabular-nums text-foreground">{dealUsage.dealsUpdated.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Deals Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-h1 tabular-nums text-foreground">{dealUsage.dealsCompleted.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState
          title="No deal usage"
          description="Deal usage data is not available for this business."
        />
      )}

      {/* Feature Usage */}
      {featureUsage && featureUsage.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {featureUsage.map((feature, index) => (
                <div
                  key={feature.name}
                  className={cn(
                    'flex items-center gap-4 py-3',
                    index < featureUsage.length - 1 && 'border-b border-border'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-small font-medium text-foreground">{feature.name}</span>
                      <div className="flex items-center gap-3 text-caption text-muted-foreground">
                        <span>{feature.usageCount.toLocaleString()} uses</span>
                        <span>{feature.activeUsers.toLocaleString()} users</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', getProgressColor(feature.percentage))}
                          style={{ width: `${feature.percentage}%` }}
                        />
                      </div>
                      <span className="text-caption tabular-nums font-medium">{feature.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Activity className="h-10 w-10" />}
          title="No feature usage"
          description="Feature usage data is not available for this business."
        />
      )}

      {/* Usage Trend */}
      {usageTrend && usageTrend.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage Trend</CardTitle>
              <div className="flex gap-1">
                {trendRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTrendDays(range.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-caption font-medium transition-colors',
                      trendDays === range.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-surface-muted'
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val: string) => format(parseISO(val), 'MMM d')}
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="events"
                    name="Events"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#colorEvents)"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="var(--color-info)"
                    strokeWidth={2}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={<Activity className="h-10 w-10" />}
          title="No usage trend"
          description="Usage trend data is not available for this business."
        />
      )}
    </div>
  )
}
