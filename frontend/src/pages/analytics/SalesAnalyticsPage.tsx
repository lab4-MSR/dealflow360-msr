import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Target, Award, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getSalesAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatPercent, formatCountCompact, kpiChange } from '@/lib/analytics-format'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function SalesAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['sales-analytics', filters, comparison], queryFn: () => getSalesAnalytics(filters) })
  const s = data ?? {}

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Sales Analytics" description="Deep analysis of sales performance, pipeline, and conversions." dateRange={dateRange} onDateRangeChange={(v) => setDateRange(v as DateRange)} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={(v) => setComparison(v as Comparison)} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={5} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Revenue" value={formatCurrencyCompact(s.revenue)} trend={kpiChange(s.revenue, s.revenue)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Pipeline" value={formatCurrencyCompact(s.pipeline)} trend={kpiChange(s.pipeline, s.pipeline)} icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard label="Deals" value={formatCountCompact(s.deals_count)} trend={kpiChange(s.deals_count, s.deals_count)} icon={<Award className="h-5 w-5" />} />
          <KpiCard label="Win Rate" value={formatPercent(s.win_rate)} trend={kpiChange(s.win_rate, s.win_rate)} icon={<Target className="h-5 w-5" />} />
          <KpiCard label="Avg Deal Value" value={formatCurrencyCompact(s.average_deal_value)} trend={kpiChange(s.average_deal_value, s.average_deal_value)} icon={<DollarSign className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Pipeline" description="Stage distribution, trend, and velocity." isLoading={isLoading} isEmpty={!isLoading && !s.stage_distribution} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Pipeline stage distribution chart" emptyTitle="No pipeline data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={s.stage_distribution ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="count" fill="hsl(var(--primary))" name="Deals" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Pipeline Trend" description="Pipeline value over time." isLoading={isLoading} isEmpty={!isLoading && !s.trend_data} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Pipeline trend chart" emptyTitle="No trend data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={s.trend_data ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Bar dataKey="value" fill="hsl(var(--info))" name="Pipeline Value" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Pipeline Velocity" description="How quickly deals move through stages." isLoading={isLoading} isEmpty={!isLoading && s.velocity_days == null} error={error} onRetry={() => refetch()}>
        <div className="rounded-lg border border-border p-6 text-center"><p className="text-sm text-muted-foreground">Average velocity: {s.velocity_days != null ? `${s.velocity_days} days` : '—'}</p></div>
      </AnalyticsSection>
      <AnalyticsSection title="Sales Performance" description="Rep, team, and customer performance." isLoading={isLoading} isEmpty={!isLoading && !s.rep_performance} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Rep performance chart" emptyTitle="No performance data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={s.rep_performance ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Bar dataKey="revenue" fill="hsl(var(--success))" name="Revenue" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Conversion" description="Lead to Deal to Quote to Won funnel." isLoading={isLoading} isEmpty={!isLoading && !s.funnel} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Conversion funnel chart" emptyTitle="No conversion data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={s.funnel ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Bar dataKey="count" fill="hsl(var(--intelligence))" name="Count" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
    </div>
  )
}
