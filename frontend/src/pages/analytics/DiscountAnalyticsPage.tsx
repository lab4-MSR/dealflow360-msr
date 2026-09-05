import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, AlertTriangle, ShieldCheck, BarChart3, TrendingUp } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { getDiscountAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatPercent, formatCurrencyCompact, kpiChange } from '@/lib/analytics-format'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--info))', 'hsl(var(--success))', 'hsl(var(--warning))']

export function DiscountAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['discount-analytics', filters, comparison], queryFn: () => getDiscountAnalytics(filters) })
  const s = data ?? {}

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Discount Analytics" description="Discount distribution, governance, and business impact." dateRange={dateRange} onDateRangeChange={(v) => setDateRange(v as DateRange)} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={(v) => setComparison(v as Comparison)} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={4} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Average Discount" value={formatPercent(s.average_discount)} trend={kpiChange(s.average_discount, s.average_discount)} icon={<Tag className="h-5 w-5" />} />
          <KpiCard label="Total Discount" value={formatCurrencyCompact(s.total_discount)} trend={kpiChange(s.total_discount, s.total_discount)} icon={<Tag className="h-5 w-5" />} />
          <KpiCard label="Discount Exceptions" value={formatPercent(s.exceptions_count)} trend={kpiChange(s.exceptions_count, s.exceptions_count)} icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="Margin Impact" value={formatPercent(s.margin_impact)} trend={kpiChange(s.margin_impact, s.margin_impact)} icon={<TrendingUp className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Discount Distribution" description="By customer tier, category, product, and sales rep." isLoading={isLoading} isEmpty={!isLoading && !s.distribution} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Discount distribution chart" emptyTitle="No distribution data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={(Array.isArray(s.distribution) ? s.distribution : []) as any} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="discount" fill="hsl(var(--warning))" name="Avg Discount %" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Governance" description="Allowed discounts, violations, approval required, and exceptions." isLoading={isLoading} isEmpty={!isLoading && s.allowed_discounts == null} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[['Allowed Discounts', formatPercent(s.allowed_discounts)], ['Violations', formatPercent(s.violations)], ['Approval Required', formatPercent(s.approval_required)], ['Exceptions', formatPercent(s.exceptions as any)]].map(([l, v]) => (<div key={l} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-1 text-lg font-semibold tabular-nums">{v}</p></div>))}</div>
        <div className="mt-4 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" /><p className="text-xs text-muted-foreground">Within-policy vs outside-policy distinction is based on the governance data returned by the analytics API.</p></div>
      </AnalyticsSection>
      <AnalyticsSection title="Impact" description="Revenue, margin, and risk impact of discounts." isLoading={isLoading} isEmpty={!isLoading && s.revenue_impact == null} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Discount impact chart" emptyTitle="No impact data for this period.">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={(s.impact_breakdown ?? []) as any} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={90} label>{((s.impact_breakdown ?? []) as Array<{category?: string}>).map((entry, i) => (<Cell key={entry.category ?? i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
    </div>
  )
}
