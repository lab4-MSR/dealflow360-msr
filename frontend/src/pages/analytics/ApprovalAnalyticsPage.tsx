import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, RotateCcw, Clock, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getApprovalAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCountCompact, formatPercent, formatDays, kpiChange } from '@/lib/analytics-format'

function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

export function ApprovalAnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['approval-analytics', filters, comparison], queryFn: () => getApprovalAnalytics(filters) })
  const s = data ?? {}
  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Approval Analytics" description="Approval volume, rates, bottlenecks, and decision analysis." dateRange={dateRange} onDateRangeChange={setDateRange} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={setComparison} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={5} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Approval Volume" value={formatCountCompact(s.volume)} trend={kpiChange(s.volume, s.volume)} icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard label="Avg Approval Time" value={formatDays(s.average_approval_time)} trend={kpiChange(s.average_approval_time, s.average_approval_time)} icon={<Clock className="h-5 w-5" />} />
          <KpiCard label="Approval Rate" value={formatPercent(s.approval_rate)} trend={kpiChange(s.approval_rate, s.approval_rate)} icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard label="Rejection Rate" value={formatPercent(s.rejection_rate)} trend={kpiChange(s.rejection_rate, s.rejection_rate)} icon={<XCircle className="h-5 w-5" />} />
          <KpiCard label="Return Rate" value={formatPercent(s.return_rate)} trend={kpiChange(s.return_rate, s.return_rate)} icon={<RotateCcw className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Approval Distribution" description="By risk, sales rep, manager, and deal value." isLoading={isLoading} isEmpty={!isLoading && !s.distribution} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Approval distribution chart" emptyTitle="No distribution data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={(s.distribution ?? [])} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="count" fill="hsl(var(--primary))" name="Approvals" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Bottlenecks" description="Pending, SLA breach, and average wait time." isLoading={isLoading} isEmpty={!isLoading && !s.bottlenecks} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCountCompact(s.bottlenecks?.[0]?.pending ?? null)}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">SLA Breach</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCountCompact(s.sla_breaches?.[0]?.count ?? null)}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Avg Wait Time</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatDays(s.bottlenecks?.[0]?.avg_wait_time ?? null)}</p></div>
        </div>
      </AnalyticsSection>
      <AnalyticsSection title="Decision Analysis" description="Approved, rejected, returned, and escalated." isLoading={isLoading} isEmpty={!isLoading && !s.distribution} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Decision analysis chart" emptyTitle="No decision data for this period.">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={(s.distribution ?? [])} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label><Cell fill="hsl(var(--primary))" /><Cell fill="hsl(var(--danger))" /><Cell fill="hsl(var(--info))" /><Cell fill="hsl(var(--warning))" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
    </div>
  )
}



