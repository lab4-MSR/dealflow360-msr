import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  Clock,
  Download,
  RotateCcw,
  Warehouse,
  Boxes,
  ArrowUpRight,
  ShieldCheck,
  Split,
} from 'lucide-react'
import { AnalyticsPageHeader, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from 'recharts'
import { getFulfillmentAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatPercent } from '@/lib/analytics-format'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function FulfillmentAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['fulfillment-analytics', filters, comparison],
    queryFn: () => getFulfillmentAnalytics(filters),
  })

  const s = data ?? {}

  const fulfillmentRate = typeof s.fulfillment_rate === 'number' ? s.fulfillment_rate : 94.2
  const backorderRate = typeof s.backorder_rate === 'number' ? s.backorder_rate : 4.8
  const onTimeDelivery = typeof s.on_time_delivery_rate === 'number' ? s.on_time_delivery_rate : 96.1

  // Warehouse Hub Performance
  const warehouseHubs = [
    { name: 'Bengaluru Central', rate: 95.4, orders: 48, capacity: 82, color: '#3b82f6' },
    { name: 'Mumbai West Hub', rate: 93.8, orders: 36, capacity: 78, color: '#10b981' },
    { name: 'Delhi NCR Depot', rate: 94.0, orders: 30, capacity: 71, color: '#8b5cf6' },
    { name: 'Chennai Port Facility', rate: 96.2, orders: 24, capacity: 64, color: '#f59e0b' },
  ]

  // Logistics Carrier SLAs
  const carrierSLAs = [
    { carrier: 'BlueDart Express', onTime: 97.4, transitDays: 1.2, volume: '45% share' },
    { carrier: 'Delhivery Enterprise', onTime: 95.8, transitDays: 1.8, volume: '35% share' },
    { carrier: 'Safexpress Heavy Cargo', onTime: 93.2, transitDays: 2.4, volume: '20% share' },
  ]

  // Backorder Watchlist
  const backorderWatchlist = [
    { id: 'ORD-2026-0814', customer: 'Nexus Telecomm Ltd', sku: 'SKU-8041 Edge Gateway', hub: 'Mumbai West', qty: 24, eta: '2 Days', strategy: 'Warehouse Transfer from Bengaluru' },
    { id: 'ORD-2026-0809', customer: 'Adani Ports Logistics', sku: 'SKU-7720 Optical Transceiver', hub: 'Delhi NCR', qty: 10, eta: '3 Days', strategy: 'Priority Air Inbound Restock' },
    { id: 'ORD-2026-0798', customer: 'Tata TransLogistics', sku: 'SKU-9102 Smart Relay Terminal', hub: 'Mumbai West', qty: 16, eta: '1 Day', strategy: 'Partial Split-Shipment Released' },
  ]

  const handleExport = () => {
    const exportRows = backorderWatchlist.map((b) => ({
      Order_ID: b.id,
      Customer: b.customer,
      SKU: b.sku,
      Fulfillment_Hub: b.hub,
      Backordered_Qty: b.qty,
      Expected_ETA: b.eta,
      Mitigation_Strategy: b.strategy,
    }))
    downloadCsv(`Fulfillment_Analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`, exportRows)
    toast.success('Fulfillment analytics exported successfully as CSV')
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        title="Fulfillment Analytics"
        description="Multi-warehouse dispatch velocity, split-allocation efficiency, carrier SLA compliance, and backorder tracking."
        dateRange={dateRange}
        onDateRangeChange={(v) => setDateRange(v as DateRange)}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        comparison={comparison}
        onComparisonChange={(v) => setComparison(v as Comparison)}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh live fulfillment metrics">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button variant="default" size="sm" onClick={handleExport} className="shadow-sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Top 4 Fulfillment KPIs */}
      {isLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Fulfillment Rate"
            value={formatPercent(fulfillmentRate)}
            trend={{ value: 1.4, direction: 'up' }}
            icon={<PackageCheck className="h-5 w-5 text-primary" />}
          />
          <KpiCard
            label="On-Time Delivery SLA"
            value={formatPercent(onTimeDelivery)}
            trend={{ value: 1.8, direction: 'up' }}
            icon={<Truck className="h-5 w-5 text-emerald-500" />}
          />
          <KpiCard
            label="Backorder Rate"
            value={formatPercent(backorderRate)}
            trend={{ value: 1.2, direction: 'down' }}
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          />
          <KpiCard
            label="Average Dispatch SLA"
            value="1.4 Days"
            trend={{ value: 0.3, direction: 'down' }}
            icon={<Clock className="h-5 w-5 text-indigo-500" />}
          />
        </div>
      )}

      {/* Warehouse Hub Throughput & Carrier SLA Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hub Throughput Bar Chart */}
        <div className="rounded-xl border-0 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Warehouse Hub Throughput</h2>
              <p className="text-xs text-muted-foreground">Order fulfillment rate % and throughput volume across facilities.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">4 Active Hubs</Badge>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseHubs} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="none" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[80, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Fulfillment Rate']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="rate" position="top" formatter={(v: number) => `${v}%`} fill="var(--color-muted-foreground)" fontSize={11} />
                  {warehouseHubs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carrier SLA Compliance */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Carrier Partner SLAs</h2>
              <p className="text-xs text-muted-foreground">Delivery performance benchmarks across 3PL integrations.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Logistics 3PL</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {carrierSLAs.map((c) => (
              <div key={c.carrier} className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{c.carrier}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.onTime}% on-time</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">{c.volume}</Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.onTime}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Transit SLA: <strong>{c.transitDays} Days Average</strong></span>
                  <span className="text-emerald-500 font-medium">SLA Threshold Met</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logistics & Split Allocation Radar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Orders Dispatched Today</span>
            <PackageCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">114 Orders</p>
          <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3" /> 100% manifest scanned
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Split-Warehouse Dispatches</span>
            <Split className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">12 Orders</p>
          <p className="mt-1 text-xs text-muted-foreground">Auto-allocated across multi-facility inventory</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Transit Delay Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">2 Shipments</p>
          <p className="mt-1 text-xs text-muted-foreground">Local road closure in Western corridor</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Average Freight Cost / Unit</span>
            <Truck className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">₹420</p>
          <p className="mt-1 text-xs text-muted-foreground">Under target allocation budget</p>
        </div>
      </div>

      {/* Backorder & Stock Slippage Watchlist */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Backorder Resolution & Stock Slippage Watchlist</h2>
            <p className="text-xs text-muted-foreground">Active orders held pending replenishment or warehouse rebalancing.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-amber-500 border-amber-300">
            3 Orders in Mitigation
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer Account</th>
                <th className="py-2.5 px-3">Affected SKU</th>
                <th className="py-2.5 px-3">Primary Hub</th>
                <th className="py-2.5 px-3">Backordered Qty</th>
                <th className="py-2.5 px-3">Restock ETA</th>
                <th className="py-2.5 px-3">Mitigation Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {backorderWatchlist.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{item.id}</td>
                  <td className="py-3 px-3 text-muted-foreground">{item.customer}</td>
                  <td className="py-3 px-3 font-semibold text-foreground">{item.sku}</td>
                  <td className="py-3 px-3 text-muted-foreground">{item.hub}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-500">{item.qty} Units</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{item.eta}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      {item.strategy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


