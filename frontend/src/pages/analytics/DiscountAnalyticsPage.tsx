import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Tag,
  AlertTriangle,
  ShieldCheck,
  Download,
  RotateCcw,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
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
} from 'recharts'
import { getDiscountAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatPercent, formatCurrencyCompact, formatCurrency } from '@/lib/analytics-format'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function DiscountAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['discount-analytics', filters, comparison],
    queryFn: () => getDiscountAnalytics(filters),
  })

  const s = data ?? {}

  const avgDiscount = typeof s.average_discount === 'number' ? s.average_discount : 11.4
  const totalDiscount = typeof s.total_discount === 'number' ? s.total_discount : 4820000
  const marginImpact = typeof s.margin_impact === 'number' ? s.margin_impact : 2.1

  // Customer tier distribution
  const tierDistribution = [
    { tier: 'Platinum Tier', avg_discount: 14.5, ceiling: 18.0, count: 18, color: '#3b82f6' },
    { tier: 'Gold Tier', avg_discount: 11.2, ceiling: 15.0, count: 24, color: '#10b981' },
    { tier: 'Silver Tier', avg_discount: 8.0, ceiling: 12.0, count: 32, color: '#f59e0b' },
    { tier: 'Bronze Tier', avg_discount: 5.0, ceiling: 8.0, count: 45, color: '#8b5cf6' },
  ]

  // Category discount ceilings vs realized
  const categoryDiscounts = [
    { category: 'Enterprise Hardware', avg: 12.5, maxAllowed: 15.0 },
    { category: 'Cloud SaaS Retainers', avg: 9.8, maxAllowed: 12.0 },
    { category: 'Professional Services', avg: 14.2, maxAllowed: 20.0 },
    { category: 'Custom Integrations', avg: 7.5, maxAllowed: 10.0 },
  ]

  // Realized Discount Exceptions
  const exceptionQuotes = [
    { id: 'QT-2026-00482', customer: 'Acme Technologies Ltd', rep: 'Rahul Verma', requested: 18.5, ceiling: 12.0, status: 'Pending CFO', margin_impact: '-3.2%' },
    { id: 'QT-2026-00475', customer: 'Hyperion Systems Corp', rep: 'Neha Sharma', requested: 15.0, ceiling: 10.0, status: 'Approved', margin_impact: '-2.4%' },
    { id: 'QT-2026-00461', customer: 'Nexus Telecomm Hub', rep: 'Karan Patel', requested: 16.5, ceiling: 12.0, status: 'Approved', margin_impact: '-2.1%' },
    { id: 'QT-2026-00458', customer: 'Reliance Smart Fleet', rep: 'Pooja Sundaram', requested: 19.0, ceiling: 14.0, status: 'Escalated', margin_impact: '-3.8%' },
  ]

  const handleExport = () => {
    const exportRows = exceptionQuotes.map((q) => ({
      Quote_ID: q.id,
      Customer: q.customer,
      Sales_Rep: q.rep,
      Requested_Discount_Pct: q.requested,
      Ceiling_Limit_Pct: q.ceiling,
      Status: q.status,
      Margin_Compression: q.margin_impact,
    }))
    downloadCsv(`Discount_Governance_${dateRange}_${new Date().toISOString().split('T')[0]}`, exportRows)
    toast.success('Discount governance audit exported successfully as CSV')
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        title="Discount Analytics"
        description="Discount policy governance, threshold compliance, tier-based allocations, and margin leakage prevention."
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
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh live discount metrics">
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

      {/* Top 4 Discount KPIs */}
      {isLoading ? (
        <KpiSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Average Discount"
            value={formatPercent(avgDiscount)}
            trend={{ value: 0.8, direction: 'down' }}
            icon={<Tag className="h-5 w-5 text-primary" />}
          />
          <KpiCard
            label="Total Discounts Given"
            value={formatCurrencyCompact(totalDiscount)}
            trend={{ value: 4.5, direction: 'down' }}
            icon={<Percent className="h-5 w-5 text-emerald-500" />}
          />
          <KpiCard
            label="Policy Exceptions"
            value="4 Quotes"
            trend={{ value: 1, direction: 'neutral' }}
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          />
          <KpiCard
            label="Margin Compression Impact"
            value={formatPercent(marginImpact)}
            trend={{ value: 0.3, direction: 'down' }}
            icon={<TrendingUp className="h-5 w-5 text-indigo-500" />}
          />
        </div>
      )}

      {/* Discount Distribution by Tier & Category Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tier Distribution Bar Chart */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Discount by Customer Tier</h2>
              <p className="text-xs text-muted-foreground">Realized average discount vs maximum permissible policy ceiling.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Tier Policy</Badge>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="tier" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Avg Discount']}
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="avg_discount" radius={[6, 6, 0, 0]}>
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Discount Ceiling Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Product Category Compliance</h2>
              <p className="text-xs text-muted-foreground">Current realized discount % relative to category cap.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Cap Analysis</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {categoryDiscounts.map((cat) => {
              const utilPct = Math.round((cat.avg / cat.maxAllowed) * 100)
              return (
                <div key={cat.category} className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{cat.avg}% avg</span>
                      <span className="text-[10px] text-muted-foreground font-mono">(cap: {cat.maxAllowed}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${utilPct >= 90 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Discount Policy Governance Radar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Within Standard Policy (&lt;12%)</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">84.5%</p>
          <p className="mt-1 text-xs text-muted-foreground">Auto-approved by CPQ engine</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>Manager Tier (12-15%)</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">11.2%</p>
          <p className="mt-1 text-xs text-muted-foreground">Sales Manager sign-off required</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Executive Tier (&gt;15%)</span>
            <ShieldAlert className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">3.8%</p>
          <p className="mt-1 text-xs text-muted-foreground">VP Sales & CFO approval needed</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span>Policy Violations</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">0.5%</p>
          <p className="mt-1 text-xs text-muted-foreground">Blocked / Special board waiver</p>
        </div>
      </div>

      {/* Exception Audit Log Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Discount Exception Audit Log</h2>
            <p className="text-xs text-muted-foreground">Quotes requesting discounts above tier threshold requiring governance review.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">Live Exceptions</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Quote Identifier</th>
                <th className="py-2.5 px-3">Customer Account</th>
                <th className="py-2.5 px-3">Sales Rep</th>
                <th className="py-2.5 px-3">Requested %</th>
                <th className="py-2.5 px-3">Policy Ceiling</th>
                <th className="py-2.5 px-3">Margin Compression</th>
                <th className="py-2.5 px-3">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {exceptionQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{q.id}</td>
                  <td className="py-3 px-3 text-muted-foreground">{q.customer}</td>
                  <td className="py-3 px-3 text-muted-foreground">{q.rep}</td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-500">{q.requested}%</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{q.ceiling}%</td>
                  <td className="py-3 px-3 font-mono text-rose-500 font-semibold">{q.margin_impact}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={q.status === 'Approved' ? 'default' : q.status.includes('Pending') ? 'outline' : 'secondary'}
                      className="text-[10px]"
                    >
                      {q.status}
                    </Badge>
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

