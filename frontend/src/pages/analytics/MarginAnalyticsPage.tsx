import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, AlertTriangle, BarChart3, Percent } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getMarginAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatPercent, kpiChange } from '@/lib/analytics-format'

function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

export function MarginAnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['margin-analytics', filters, comparison], queryFn: () => getMarginAnalytics(filters) })
  const s = data ?? {}
  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Margin Analytics" description="Gross margin, margin-at-risk, breakdown, and trend analysis." dateRange={dateRange} onDateRangeChange={setDateRange} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={setComparison} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={3} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard label="Gross Margin" value={formatCurrencyCompact(s.gross_margin)} trend={kpiChange(s.gross_margin, s.gross_margin)} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Margin %" value={formatPercent(s.margin_percent)} trend={kpiChange(s.margin_percent, s.margin_percent)} icon={<Percent className="h-5 w-5" />} />
          <KpiCard label="Margin at Risk" value={formatCurrencyCompact(s.margin_at_risk)} trend={kpiChange(s.margin_at_risk, s.margin_at_risk)} icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Margin Breakdown" description="By product, category, customer, and sales rep." isLoading={isLoading} isEmpty={!isLoading && !s.breakdown} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Margin breakdown chart" emptyTitle="No margin breakdown data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={(s.breakdown ?? [])} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="margin" fill="hsl(var(--info))" name="Margin" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Margin Risk" description="Below target, below minimum, discount compression, and high risk." isLoading={isLoading} isEmpty={!isLoading && !s.risk_buckets} error={error} onRetry={() => refetch()}>
        <div className="space-y-3">
          {(s.risk_buckets ?? []).length > 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{(s.risk_buckets ?? []).map((bucket, i) => { const name = String(bucket.name ?? bucket.category ?? 'Bucket ' + (i + 1)); const count = typeof bucket.count === 'number' ? String(bucket.count) : typeof bucket.value === 'number' ? String(bucket.value) : '\u2014'; const risk = String(bucket.risk ?? bucket.level ?? 'medium'); return (<div key={name} className="rounded-lg border border-border p-4"><div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{name}</p><RiskBadge risk={risk as any}>{risk}</RiskBadge></div><p className="mt-1 text-lg font-semibold tabular-nums">{count}</p></div>) })}</div>
          ) : (<div className="flex flex-wrap items-center gap-3"><RiskBadge risk="low">Below Target</RiskBadge><RiskBadge risk="medium">Below Minimum</RiskBadge><RiskBadge risk="high">Discount Compression</RiskBadge><RiskBadge risk="critical">High Risk</RiskBadge></div>)}
        </div>
      </AnalyticsSection>
      <AnalyticsSection title="Margin Trend" description="Revenue, cost, gross profit, and margin % over time." isLoading={isLoading} isEmpty={!isLoading && !s.trend} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Margin trend chart" emptyTitle="No margin trend data for this period.">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={(s.trend ?? [])} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue" /><Line type="monotone" dataKey="cost" stroke="hsl(var(--danger))" name="Cost" /><Line type="monotone" dataKey="gross_profit" stroke="hsl(var(--success))" name="Gross Profit" /><Line type="monotone" dataKey="margin_percent" stroke="hsl(var(--info))" name="Margin %" /></LineChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
    </div>
  )
}

