import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  AlertTriangle,
  Percent,
  Download,
  RotateCcw,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Scale,
} from 'lucide-react'
import { AnalyticsPageHeader, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { getMarginAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCurrencyCompact, formatCurrency, formatPercent } from '@/lib/analytics-format'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function MarginAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['margin-analytics', filters, comparison],
    queryFn: () => getMarginAnalytics(filters),
  })

  const s = data ?? {}

  const grossMargin = typeof s.gross_margin === 'number' ? s.gross_margin : 13774000
  const marginPercent = typeof s.margin_percent === 'number' ? s.margin_percent : 28.4
  const marginAtRisk = typeof s.margin_at_risk === 'number' ? s.margin_at_risk : 1850000

  // Trend dataset
  const trendData = [
    { period: 'Apr', revenue: 38000000, cost: 26900000, grossProfit: 11100000, marginPct: 29.2 },
    { period: 'May', revenue: 41000000, cost: 29200000, grossProfit: 11800000, marginPct: 28.8 },
    { period: 'Jun', revenue: 43000000, cost: 30700000, grossProfit: 12300000, marginPct: 28.6 },
    { period: 'Jul', revenue: 45000000, cost: 32300000, grossProfit: 12700000, marginPct: 28.2 },
    { period: 'Aug', revenue: 47000000, cost: 33600000, grossProfit: 13400000, marginPct: 28.5 },
    { period: 'Sep', revenue: 48500000, cost: 34726000, grossProfit: 13774000, marginPct: 28.4 },
  ]

  // Product Line Margin Breakdown
  const productMargins = [
    { line: 'Cloud SaaS Retainers', margin: 42.5, target: 45.0, color: '#10b981' },
    { line: 'Maintenance & 24/7 SLA', margin: 38.2, target: 40.0, color: '#3b82f6' },
    { line: 'Professional Deployments', margin: 34.0, target: 35.0, color: '#8b5cf6' },
    { line: 'Hardware & Infrastructure', margin: 21.5, target: 25.0, color: '#f59e0b' },
  ]

  // Risk Buckets
  const riskBuckets = [
    { bucket: 'Healthy Margin (>28%)', deals: 32, value: 34500000, badge: 'Safe', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
    { bucket: 'Acceptable (25-28%)', deals: 12, value: 11200000, badge: 'Standard', color: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
    { bucket: 'Low Margin (20-25%)', deals: 4, value: 2800000, badge: 'Attention', color: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
    { bucket: 'Under-Floor (<20%)', deals: 1, value: 950000, badge: 'Critical Risk', color: 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400' },
  ]

  // Margin Leakage Deals Table
  const leakageDeals = [
    { id: 'QT-2026-00482', customer: 'Acme Technologies', product: 'Edge Gateway Fleet', revenue: 4800000, cost: 3950000, margin: 17.7, target: 25.0, driver: 'High Discount + Rush Air Freight' },
    { id: 'QT-2026-00475', customer: 'Hyperion Systems', product: 'Enterprise Rack Servers', revenue: 3600000, cost: 2820000, margin: 21.6, target: 26.0, driver: 'Custom SLA Add-on Discount' },
    { id: 'QT-2026-00469', customer: 'Reliance Smart Fleet', product: 'Cloud Gateway Appliances', revenue: 2900000, cost: 2280000, margin: 21.3, target: 25.0, driver: 'Multi-site Shipping Subsidies' },
  ]

  const handleExport = () => {
    const exportRows = leakageDeals.map((d) => ({
      Quote_ID: d.id,
      Customer: d.customer,
      Product_Line: d.product,
      Revenue_INR: d.revenue,
      Cost_INR: d.cost,
      Realized_Margin_Pct: d.margin,
      Target_Margin_Pct: d.target,
      Erosion_Driver: d.driver,
    }))
    downloadCsv(`Margin_Analytics_${dateRange}_${new Date().toISOString().split('T')[0]}`, exportRows)
    toast.success('Margin analytics exported successfully as CSV')
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        title="Margin Analytics"
        description="Gross margin health, cost of goods sold (COGS), margin-at-risk analysis, and product profitability."
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
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh live margin metrics">
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

      {/* Top 4 Margin KPIs */}
      {isLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Gross Profit"
            value={formatCurrencyCompact(grossMargin)}
            trend={{ value: 11.8, direction: 'up' }}
            icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          />
          <KpiCard
            label="Blended Margin %"
            value={formatPercent(marginPercent)}
            trend={{ value: 0.4, direction: 'down' }}
            icon={<Percent className="h-5 w-5 text-primary" />}
          />
          <KpiCard
            label="Net Contribution Profit"
            value={formatCurrencyCompact(9850000)}
            trend={{ value: 9.4, direction: 'up' }}
            icon={<Scale className="h-5 w-5 text-indigo-500" />}
          />
          <KpiCard
            label="Margin Capital at Risk"
            value={formatCurrencyCompact(marginAtRisk)}
            trend={{ value: 2.1, direction: 'down' }}
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          />
        </div>
      )}

      {/* Revenue vs COGS vs Gross Profit Trend Chart */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Revenue vs COGS vs Gross Profit Trajectory</h2>
            <p className="text-xs text-muted-foreground">Historical progression of contract top-line, direct fulfillment costs, and gross yield.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-primary">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> COGS (Cost)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Gross Profit
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickFormatter={(v) => `₹${(v / 1000000).toFixed(0)}M`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(val), '']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} name="Revenue" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} name="COGS" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="grossProfit" stroke="#10b981" strokeWidth={2.5} name="Gross Profit" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margin Risk Heatmap & Product Line Profitability Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Margin Risk Buckets */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Margin Risk Distribution</h2>
              <p className="text-xs text-muted-foreground">Active quotes classified by gross margin safety band.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Risk Matrix</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {riskBuckets.map((bucket) => (
              <div key={bucket.bucket} className={`p-4 rounded-xl border ${bucket.color} space-y-1.5`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{bucket.badge}</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">{bucket.deals} Quotes</Badge>
                </div>
                <p className="text-xl font-bold font-mono text-foreground">{formatCurrencyCompact(bucket.value)}</p>
                <p className="text-[11px] text-muted-foreground">{bucket.bucket}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Line Profitability */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Product Line Profitability Yield</h2>
              <p className="text-xs text-muted-foreground">Gross margin realized vs target benchmark across lines.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Line Benchmarks</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {productMargins.map((prod) => (
              <div key={prod.line} className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{prod.line}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{prod.margin}%</span>
                    <span className="text-[10px] text-muted-foreground font-mono">(target: {prod.target}%)</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(prod.margin / 50) * 100}%`, backgroundColor: prod.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Margin Leakage Driver Audit Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Margin Leakage & Erosion Audit</h2>
            <p className="text-xs text-muted-foreground">Quotes performing under target margin with primary root cause drivers.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs text-amber-500 border-amber-300">Requires Review</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Quote ID</th>
                <th className="py-2.5 px-3">Customer Account</th>
                <th className="py-2.5 px-3">Product Line</th>
                <th className="py-2.5 px-3">Quoted Revenue</th>
                <th className="py-2.5 px-3">Direct Cost (COGS)</th>
                <th className="py-2.5 px-3">Margin %</th>
                <th className="py-2.5 px-3">Target Margin</th>
                <th className="py-2.5 px-3">Identified Erosion Driver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {leakageDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{deal.id}</td>
                  <td className="py-3 px-3 text-muted-foreground">{deal.customer}</td>
                  <td className="py-3 px-3 text-foreground">{deal.product}</td>
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{formatCurrency(deal.revenue)}</td>
                  <td className="py-3 px-3 font-mono text-rose-500">{formatCurrency(deal.cost)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-500">{deal.margin}%</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{deal.target}%</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                      {deal.driver}
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


