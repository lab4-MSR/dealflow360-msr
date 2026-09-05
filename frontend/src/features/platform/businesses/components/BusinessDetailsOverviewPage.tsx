import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import {
  useBusinessDetail,
  useBusinessPerformance,
  useBusinessActivity,
  useBusinessDealTrend,
  useBusinessRevenueTrend,
} from '../hooks/use-businesses'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import {
  Users,
  FileText,
  DollarSign,
  Target,
  TrendingUp,
  Activity,
  Globe,
  Mail,
  Phone,
  Zap,
  HeartPulse,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function timeAgo(timestamp: string): string {
  const now = new Date()
  const then = parseISO(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return format(then, 'MMM d')
}

const activityTypeIcon: Record<string, React.ElementType> = {
  user: Users,
  deal: FileText,
  configuration: Activity,
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
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

export function BusinessDetailsOverviewPage() {
  const { id } = useParams<{ id: string }>()

  const { data: business, isLoading, error, refetch } = useBusinessDetail(id || '')
  const { data: performance } = useBusinessPerformance(id || '')
  const { data: activity } = useBusinessActivity(id || '')
  const { data: dealTrend } = useBusinessDealTrend(id || '')
  const { data: revenueTrend } = useBusinessRevenueTrend(id || '')

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-[160px]" /></CardHeader>
              <CardContent><Skeleton className="h-[200px] w-full rounded-lg" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <ErrorState
        title="Business not found"
        description="We couldn't load the business details. It may have been removed or you may not have access."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Business Summary */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-caption text-muted-foreground">Business Admin</p>
              <p className="text-small font-medium text-foreground mt-0.5">
                {business.admin?.name || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Industry</p>
              <p className="text-small font-medium text-foreground mt-0.5">
                {business.industry || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Created</p>
              <p className="text-small font-medium text-foreground mt-0.5">
                {formatDate(business.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Users</p>
              <p className="text-small font-medium text-foreground mt-0.5">{business.usersCount}</p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Plan</p>
              <p className="text-small font-medium text-foreground mt-0.5">
                {business.plan || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground">Currency</p>
              <p className="text-small font-medium text-foreground mt-0.5">{business.currency}</p>
            </div>
          </div>
          {(business.email || business.phone || business.website) && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
              {business.email && (
                <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {business.email}
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {business.phone}
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-1.5 text-small text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  {business.website}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance KPIs */}
      {performance && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Deals"
            value={performance.totalDeals.toLocaleString()}
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Revenue"
            value={formatCurrency(performance.revenue, business.currency)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <KpiCard
            label="Customers"
            value={performance.customers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Users"
            value={performance.activeUsers.toLocaleString()}
            icon={<Target className="h-5 w-5" />}
          />
          {performance.conversionRate !== undefined && (
            <KpiCard
              label="Conversion Rate"
              value={`${performance.conversionRate}%`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Deal Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dealTrend && dealTrend.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val: string) => format(parseISO(val), 'MMM')}
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
                    <Bar dataKey="count" name="Deals" fill="var(--color-primary)" radius={[3, 3, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-body-small text-muted-foreground text-center py-8">No deal data available</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueTrend && revenueTrend.length > 0 ? (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(val: string) => format(parseISO(val), 'MMM')}
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}K`}
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--color-primary)', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-body-small text-muted-foreground text-center py-8">No revenue data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Health */}
      {business.health && (
        <Card>
          <CardHeader>
            <CardTitle>Business Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'System Usage', value: business.health.systemUsage, icon: Zap },
                { label: 'User Activity', value: business.health.userActivity, icon: Users },
                { label: 'Deal Activity', value: business.health.dealActivity, icon: FileText },
                { label: 'Overall Score', value: business.health.overallScore, icon: HeartPulse },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-caption text-muted-foreground">{item.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            item.value >= 80 ? 'bg-success' : item.value >= 50 ? 'bg-warning' : 'bg-danger'
                          )}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="text-small tabular-nums font-medium">{item.value}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activity && activity.length > 0 ? (
            <div className="space-y-0">
              {activity.map((item, index) => {
                const Icon = activityTypeIcon[item.type] || Activity
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 py-3',
                      index < activity.length - 1 && 'border-b border-border'
                    )}
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-small font-medium text-foreground">{item.actor}</span>
                        <span className="text-small text-muted-foreground">{item.action}</span>
                        <span className="text-small font-medium text-foreground">{item.target}</span>
                      </div>
                      <span className="text-caption text-muted-foreground mt-0.5 block">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-body-small text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
