import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getSubscriptionAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatPercent, formatCountCompact, kpiChange } from '@/lib/analytics-format'

function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

export function SubscriptionAnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['subscription-analytics', filters, comparison], queryFn: () => getSubscriptionAnalytics(filters) })
  const s = data ?? {}
  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Subscription Analytics" description="Active subscriptions, MRR/ARR, churn, renewal, and customer behavior." dateRange={dateRange} onDateRangeChange={setDateRange} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={setComparison} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={5} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Active Subscriptions" value={formatCountCompact(s.active_subscriptions)} trend={kpiChange(s.active_subscriptions, s.active_subscriptions)} icon={<Users className="h-5 w-5" />} />
          <KpiCard label="MRR" value={formatCurrencyCompact(s.mrr)} trend={kpiChange(s.mrr, s.mrr)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="ARR" value={formatCurrencyCompact(s.arr)} trend={kpiChange(s.arr, s.arr)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Churn" value={formatPercent(s.churn_rate)} trend={kpiChange(s.churn_rate, s.churn_rate)} icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard label="Renewal Rate" value={formatPercent(s.renewal_rate)} trend={kpiChange(s.renewal_rate, s.renewal_rate)} icon={<RefreshCw className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Subscription Growth" description="New, upgrades, downgrades, and cancellations." isLoading={isLoading} isEmpty={!isLoading && !s.growth} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Subscription growth chart" emptyTitle="No growth data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={[(s.growth ?? {})]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="new" fill="hsl(var(--primary))" name="New" animationDuration={350} animationEasing="ease-out" /><Bar dataKey="upgrades" fill="hsl(var(--success))" name="Upgrades" animationDuration={350} animationEasing="ease-out" /><Bar dataKey="downgrades" fill="hsl(var(--warning))" name="Downgrades" animationDuration={350} animationEasing="ease-out" /><Bar dataKey="cancellations" fill="hsl(var(--danger))" name="Cancellations" animationDuration={350} animationEasing="ease-out" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Revenue" description="MRR trend, ARR trend, and recurring revenue." isLoading={isLoading} isEmpty={!isLoading && !s.growth} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Subscription revenue trend chart" emptyTitle="No revenue data for this period.">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={[(s.growth ?? {})]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><defs><linearGradient id="subRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Area type="monotone" dataKey="mrr" stroke="hsl(var(--primary))" fill="url(#subRev)" name="MRR" animationDuration={350} animationEasing="ease-out" /></AreaChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Customer Behavior" description="Retention, churn, renewal, and expansion." isLoading={isLoading} isEmpty={!isLoading && !s.customer_behavior} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{s.customer_behavior ? Object.entries(s.customer_behavior).map(([k, v]) => (<div key={k} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg font-semibold tabular-nums">{String(v)}</p></div>)) : <p className="text-sm text-muted-foreground">No customer behavior data available.</p>}</div>
      </AnalyticsSection>
    </div>
  )
}

