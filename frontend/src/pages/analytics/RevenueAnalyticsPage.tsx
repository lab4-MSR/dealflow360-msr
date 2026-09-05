import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getRevenueAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatPercent, kpiChange } from '@/lib/analytics-format'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')
  const [trendPeriod, setTrendPeriod] = useState<string>('monthly')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['revenue-analytics', filters, comparison], queryFn: () => getRevenueAnalytics(filters) })
  const s = data ?? {}

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Revenue Analytics" description="Total, recurring, and one-time revenue with growth analysis." dateRange={dateRange} onDateRangeChange={(v) => setDateRange(v as DateRange)} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={(v) => setComparison(v as Comparison)} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={6} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Total Revenue" value={formatCurrencyCompact(s.total_revenue)} trend={kpiChange(s.total_revenue, s.total_revenue)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="One-Time Revenue" value={formatCurrencyCompact(s.one_time_revenue)} trend={kpiChange(s.one_time_revenue, s.one_time_revenue)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Recurring Revenue" value={formatCurrencyCompact(s.recurring_revenue)} trend={kpiChange(s.recurring_revenue, s.recurring_revenue)} icon={<RefreshCw className="h-5 w-5" />} />
          <KpiCard label="MRR" value={formatCurrencyCompact(s.mrr)} trend={kpiChange(s.mrr, s.mrr)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="ARR" value={formatCurrencyCompact(s.arr)} trend={kpiChange(s.arr, s.arr)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Growth" value={formatPercent(s.growth_rate)} trend={kpiChange(s.growth_rate, s.growth_rate)} icon={<TrendingUp className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Revenue Trend" description="Daily, monthly, and yearly revenue trends." action={<Tabs value={trendPeriod} onValueChange={setTrendPeriod}><TabsList><TabsTrigger value="daily">Daily</TabsTrigger><TabsTrigger value="monthly">Monthly</TabsTrigger><TabsTrigger value="yearly">Yearly</TabsTrigger></TabsList></Tabs>} isLoading={isLoading} isEmpty={!isLoading && !s.trend_data} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel={`${trendPeriod} revenue trend chart`} emptyTitle="No revenue trend data for this period.">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={s.trend_data ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><defs><linearGradient id="revTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revTrend)" name="Revenue" /></AreaChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Revenue Breakdown" description="By product, service, subscription, and customer segment." isLoading={isLoading} isEmpty={!isLoading && !s.breakdown} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Revenue breakdown chart" emptyTitle="No breakdown data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={(s.breakdown as any) ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="value" fill="hsl(var(--info))" name="Revenue" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Growth Analysis" description="New revenue, expansion, churn, and net growth." isLoading={isLoading} isEmpty={!isLoading && s.new_revenue == null} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[['New Revenue', formatCurrencyCompact(s.new_revenue)], ['Expansion', formatCurrencyCompact(s.expansion)], ['Churn', formatCurrencyCompact(s.churn)], ['Net Growth', formatCurrencyCompact(s.net_growth)]].map(([l, v]) => (<div key={l} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-lg font-semibold tabular-nums">{v}</p></div>))}</div>
      </AnalyticsSection>
    </div>
  )
}
