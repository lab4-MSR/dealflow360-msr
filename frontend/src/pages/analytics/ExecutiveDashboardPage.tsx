import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, Target, Percent, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { getExecutiveAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatPercent, kpiChange } from '@/lib/analytics-format'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function ExecutiveDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['executive-analytics', filters, comparison], queryFn: () => getExecutiveAnalytics(filters) })
  const s = data ?? {}

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Executive Dashboard" description="High-level business performance across sales, finance, and operations." dateRange={dateRange} onDateRangeChange={(v) => setDateRange(v as DateRange)} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={(v) => setComparison(v as Comparison)} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={6} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Revenue" value={formatCurrencyCompact(s.revenue)} trend={kpiChange(s.revenue, s.revenue)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Pipeline" value={formatCurrencyCompact(s.pipeline)} trend={kpiChange(s.pipeline, s.pipeline)} icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard label="Win Rate" value={formatPercent(s.win_rate)} trend={kpiChange(s.win_rate, s.win_rate)} icon={<Target className="h-5 w-5" />} />
          <KpiCard label="Gross Margin" value={formatPercent((s as any).gross_margin)} trend={kpiChange((s as any).gross_margin, (s as any).gross_margin)} icon={<Percent className="h-5 w-5" />} />
          <KpiCard label="MRR" value={formatCurrencyCompact(s.mrr)} trend={kpiChange(s.mrr, s.mrr)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="ARR" value={formatCurrencyCompact(s.arr)} trend={kpiChange(s.arr, s.arr)} icon={<DollarSign className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Sales" description="Pipeline, revenue, and win rate trends." isLoading={isLoading} isEmpty={!isLoading && s.revenue == null && s.pipeline == null} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Sales trend chart" emptyTitle="No sales data for this period.">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={s.trend_data ?? []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><defs><linearGradient id="edSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#edSales)" name="Revenue" animationDuration={350} animationEasing="ease-out" /></AreaChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Financial" description="Revenue, margin, outstanding, and collection." isLoading={isLoading} isEmpty={!isLoading && s.revenue == null} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[['Revenue', formatCurrencyCompact(s.revenue)], ['Margin', formatPercent((s as any).gross_margin)], ['Outstanding', '—'], ['Collection', '—']].map(([l, v]) => (<div key={l} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-lg font-semibold tabular-nums">{v}</p></div>))}</div>
      </AnalyticsSection>
      <AnalyticsSection title="Operations" description="Fulfillment, backorders, delivery, and inventory." isLoading={isLoading} isEmpty={!isLoading} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{['Fulfillment', 'Backorders', 'Delivery', 'Inventory'].map((l) => (<div key={l} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-lg font-semibold tabular-nums">—</p></div>))}</div>
      </AnalyticsSection>
      <AnalyticsSection title="Risk" description="High-risk deals, discount exceptions, and deal health." isLoading={isLoading} isEmpty={!isLoading} error={error} onRetry={() => refetch()}>
        <div className="flex flex-wrap items-center gap-3"><RiskBadge risk="high">High Risk Deals</RiskBadge><RiskBadge risk="medium">Discount Exceptions</RiskBadge><Badge variant="outline">Deal Health: —</Badge></div>
      </AnalyticsSection>
      <AnalyticsSection title="Executive Insights" description="Data-derived trends, risks, opportunities, and recommended actions." isLoading={isLoading} isEmpty={!isLoading} error={error} onRetry={() => refetch()}>
        <div className="grid gap-4 md:grid-cols-2">{['Key Trends', 'Risks', 'Opportunities', 'Recommended Actions'].map((l) => (<div key={l} className="rounded-lg border border-border p-4"><p className="text-sm font-medium">{l}</p><p className="mt-1 text-xs text-muted-foreground">No insights available for the selected period.</p></div>))}</div>
      </AnalyticsSection>
    </div>
  )
}
