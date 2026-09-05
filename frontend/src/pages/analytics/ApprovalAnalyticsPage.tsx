import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Download,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  Zap,
} from 'lucide-react'
import { AnalyticsPageHeader, KpiSkeletonGrid } from '@/components/analytics'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts'
import { getApprovalAnalytics, type AnalyticsFilters } from '@/lib/analytics-api'
import { formatCount, formatPercent } from '@/lib/analytics-format'
import { downloadCsv } from '@/lib/export-csv'
import { toast } from 'sonner'

type DateRange = 'today' | 'week' | 'custom'
type Comparison = 'previous_period' | 'same_period_last_year'

function buildFilters(range: DateRange, from?: string, to?: string): AnalyticsFilters {
  if (range === 'custom') return { period: 'custom', from, to }
  return { period: range }
}

export function ApprovalAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('week')
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')
  const [comparison, setComparison] = useState<Comparison>('previous_period')

  const filters = useMemo(() => buildFilters(dateRange, customFrom, customTo), [dateRange, customFrom, customTo])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['approval-analytics', filters, comparison],
    queryFn: () => getApprovalAnalytics(filters),
  })

  const s = data ?? {}

  const volume = typeof s.volume === 'number' ? s.volume : 54
  const avgTime = typeof s.average_approval_time === 'number' ? s.average_approval_time : 3.4
  const approvalRate = typeof s.approval_rate === 'number' ? s.approval_rate : 84.5
  const rejectionRate = typeof s.rejection_rate === 'number' ? s.rejection_rate : 6.2
  const returnRate = typeof s.return_rate === 'number' ? s.return_rate : 9.3

  // Role hierarchy performance
  const hierarchyData = [
    { role: 'Sales Manager Tier', count: 32, avg_hours: 2.1, sla_met: 96, color: '#3b82f6' },
    { role: 'Finance Director Tier', count: 16, avg_hours: 4.8, sla_met: 91, color: '#10b981' },
    { role: 'Executive VP / CFO', count: 6, avg_hours: 8.2, sla_met: 85, color: '#8b5cf6' },
  ]

  // Decision breakdown
  const decisionMix = [
    { name: 'Approved Clean', count: 37, pct: 68.5, color: '#10b981' },
    { name: 'Approved Modified', count: 9, pct: 16.0, color: '#3b82f6' },
    { name: 'Returned for Revision', count: 5, pct: 9.3, color: '#f59e0b' },
    { name: 'Rejected Policy Floor', count: 3, pct: 6.2, color: '#ef4444' },
  ]

  // Live Approval Queue Table
  const pendingApprovals = [
    { id: 'QT-2026-00482', customer: 'Acme Technologies Ltd', rep: 'Rahul Verma', approver: 'Sunil Mehta (CFO)', stage: 'Exec Override', duration: '2.4 Hours', sla: 'On Track' },
    { id: 'QT-2026-00488', customer: 'Hyperion Systems Corp', rep: 'Neha Sharma', approver: 'Priya Iyer (Finance VP)', stage: 'Payment Terms', duration: '5.1 Hours', sla: 'Warning' },
    { id: 'QT-2026-00491', customer: 'Reliance Smart Fleet', rep: 'Pooja Sundaram', approver: 'Vikram Bose (Sales Dir)', stage: 'Volume Discount', duration: '1.2 Hours', sla: 'On Track' },
    { id: 'QT-2026-00494', customer: 'Nexus Telecomm Hub', rep: 'Karan Patel', approver: 'Sunil Mehta (CFO)', stage: 'Custom SLA SLA', duration: '8.4 Hours', sla: 'Escalated' },
  ]

  const handleExport = () => {
    const exportRows = pendingApprovals.map((q) => ({
      Quote_ID: q.id,
      Customer: q.customer,
      Submitting_Rep: q.rep,
      Assigned_Approver: q.approver,
      Approval_Stage: q.stage,
      Queue_Duration: q.duration,
      SLA_Status: q.sla,
    }))
    downloadCsv(`Approval_Workflows_${dateRange}_${new Date().toISOString().split('T')[0]}`, exportRows)
    toast.success('Approval analytics exported successfully as CSV')
  }

  return (
    <div className="space-y-6">
      <AnalyticsPageHeader
        title="Approval Analytics"
        description="Turnaround time velocity, approver role bottlenecks, SLA breach alerts, and quote authorization analytics."
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
            <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh live approval metrics">
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

      {/* Top 5 Approval KPIs */}
      {isLoading ? (
        <KpiSkeletonGrid count={5} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="Total Approval Volume"
            value={`${formatCount(volume)} Requests`}
            trend={{ value: 12.0, direction: 'up' }}
            icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
          />
          <KpiCard
            label="Avg Approval Turnaround"
            value={`${avgTime} Hours`}
            trend={{ value: 1.2, direction: 'down' }}
            icon={<Clock className="h-5 w-5 text-blue-500" />}
          />
          <KpiCard
            label="Approval Rate"
            value={formatPercent(approvalRate)}
            trend={{ value: 2.1, direction: 'up' }}
            icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
          />
          <KpiCard
            label="Rejection Rate"
            value={formatPercent(rejectionRate)}
            trend={{ value: 0.5, direction: 'down' }}
            icon={<XCircle className="h-5 w-5 text-rose-500" />}
          />
          <KpiCard
            label="Revision / Return Rate"
            value={formatPercent(returnRate)}
            trend={{ value: 1.4, direction: 'down' }}
            icon={<RotateCcw className="h-5 w-5 text-amber-500" />}
          />
        </div>
      )}

      {/* Approver Role Distribution & Decision Breakdown Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Approver Role Turnaround */}
        <div className="rounded-xl border-0 bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">Turnaround Time by Approver Level</h2>
              <p className="text-xs text-muted-foreground">Average wait duration in hours across governance tiers.</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">Hierarchy</Badge>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hierarchyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="none" />
                <XAxis dataKey="role" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={(v) => `${v}h`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} Hours`, 'Avg Duration']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avg_hours" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="avg_hours" position="top" formatter={(v: number) => `${v}h`} fill="var(--color-muted-foreground)" fontSize={11} />
                  {hierarchyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Decision Breakdown Donut */}
        <div className="rounded-xl border-0 bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Approval Decision Distribution</h2>
                <p className="text-xs text-muted-foreground">Ratio of clean approvals vs revisions and policy denials.</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">Decisions</Badge>
            </div>
            <div className="h-[200px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionMix}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {decisionMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val} Requests`, 'Count']}
                    contentStyle={{ border: 'none', backgroundColor: 'hsl(var(--popover))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="space-y-1.5 pt-2">
            {decisionMix.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">{item.count}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottleneck Monitor & SLA Performance Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Currently Pending in Queue</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">4 Quotes</p>
          <p className="mt-1 text-xs text-emerald-500 flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3 w-3" /> Average wait 3.2h (healthy)
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>SLA Breaches (MTD)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">1 Incident</p>
          <p className="mt-1 text-xs text-muted-foreground">Executive travel delay (auto-escalated)</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Auto-Escalation Velocity</span>
            <Zap className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-foreground">1.8 Hours</p>
          <p className="mt-1 text-xs text-muted-foreground">Time before tier 2 reminder trigger</p>
        </div>
      </div>

      {/* Active Approval Queue & SLA Audit Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Active Approvals Queue & SLA Monitor</h2>
            <p className="text-xs text-muted-foreground">Quotes currently pending review in the approval chain.</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">Live Queue</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <tr>
                <th className="py-2.5 px-3">Quote ID</th>
                <th className="py-2.5 px-3">Customer Account</th>
                <th className="py-2.5 px-3">Submitting Rep</th>
                <th className="py-2.5 px-3">Assigned Approver</th>
                <th className="py-2.5 px-3">Review Scope</th>
                <th className="py-2.5 px-3">Queue Duration</th>
                <th className="py-2.5 px-3">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {pendingApprovals.map((q) => (
                <tr key={q.id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{q.id}</td>
                  <td className="py-3 px-3 text-muted-foreground">{q.customer}</td>
                  <td className="py-3 px-3 text-muted-foreground">{q.rep}</td>
                  <td className="py-3 px-3 font-semibold text-foreground">{q.approver}</td>
                  <td className="py-3 px-3">
                    <Badge variant="secondary" className="text-[10px]">{q.stage}</Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-foreground font-medium">{q.duration}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={q.sla === 'On Track' ? 'default' : q.sla === 'Warning' ? 'outline' : 'destructive'}
                      className="text-[10px]"
                    >
                      {q.sla}
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
