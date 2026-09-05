import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Truck, Package, AlertTriangle, Clock, BarChart3 } from 'lucide-react'
import { AnalyticsPageHeader, AnalyticsSection, ChartFrame, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { getFulfillmentAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatPercent, formatDays, kpiChange } from '@/lib/analytics-format'

function buildFilters(range: string, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range as 'today' | 'week' | 'custom' }
}

export function FulfillmentAnalyticsPage() {
  const [dateRange, setDateRange] = useState('week')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [comparison, setComparison] = useState('previous_period')
  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['fulfillment-analytics', filters, comparison], queryFn: () => getFulfillmentAnalytics(filters) })
  const s = data ?? {}
  return (
    <div className="space-y-6">
      <AnalyticsPageHeader title="Fulfillment Analytics" description="Fulfillment rates, warehouse performance, shipping, and backorders." dateRange={dateRange} onDateRangeChange={setDateRange} customFrom={customFrom} customTo={customTo} onCustomFromChange={setCustomFrom} onCustomToChange={setCustomTo} comparison={comparison} onComparisonChange={setComparison} actions={<Button variant="outline" size="sm" disabled><BarChart3 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Export</Button>} />
      {isLoading ? <KpiSkeletonGrid count={4} /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Fulfillment Rate" value={formatPercent(s.fulfillment_rate)} trend={kpiChange(s.fulfillment_rate, s.fulfillment_rate)} icon={<Package className="h-5 w-5" />} />
          <KpiCard label="Backorder Rate" value={formatPercent(s.backorder_rate)} trend={kpiChange(s.backorder_rate, s.backorder_rate)} icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="On-Time Delivery" value={formatPercent(s.on_time_delivery_rate)} trend={kpiChange(s.on_time_delivery_rate, s.on_time_delivery_rate)} icon={<Truck className="h-5 w-5" />} />
          <KpiCard label="Avg Fulfillment Time" value={formatDays(s.average_fulfillment_time)} trend={kpiChange(s.average_fulfillment_time, s.average_fulfillment_time)} icon={<Clock className="h-5 w-5" />} />
        </div>
      )}
      <AnalyticsSection title="Warehouse Performance" description="Throughput, capacity, allocation efficiency, and inventory turnover." isLoading={isLoading} isEmpty={!isLoading && !s.warehouses} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Warehouse performance chart" emptyTitle="No warehouse data for this period.">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={(s.warehouses ?? [])} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Bar dataKey="throughput" fill="hsl(var(--primary))" name="Throughput" /><Bar dataKey="capacity" fill="hsl(var(--info))" name="Capacity" /></BarChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
      <AnalyticsSection title="Shipping" description="Shipments, delays, shipping cost, and delivery time." isLoading={isLoading} isEmpty={!isLoading && !s.shipping} error={error} onRetry={() => refetch()}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{s.shipping ? Object.entries(s.shipping).map(([k, v]) => (<div key={k} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="mt-1 text-lg font-semibold tabular-nums">{String(v)}</p></div>)) : <p className="text-sm text-muted-foreground">No shipping data available.</p>}</div>
      </AnalyticsSection>
      <AnalyticsSection title="Backorders" description="Volume, duration, and customer impact." isLoading={isLoading} isEmpty={!isLoading && !s.warehouses} error={error} onRetry={() => refetch()}>
        <ChartFrame ariaLabel="Backorder trend chart" emptyTitle="No backorder data for this period.">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={(s.warehouses ?? [])} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Legend /><Line type="monotone" dataKey="backorders" stroke="hsl(var(--danger))" name="Backorders" /></LineChart></ResponsiveContainer>
        </ChartFrame>
      </AnalyticsSection>
    </div>
  )
}

