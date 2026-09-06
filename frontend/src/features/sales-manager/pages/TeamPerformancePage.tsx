import { useState, useEffect, useMemo } from 'react'
import {
  Award,
  TrendingUp,
  Users,
  IndianRupee,
  Target,
  Percent,
  Download,
  Search,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { getTeamPerformance } from '@/services/salesManager'
import { downloadCsv } from '@/lib/export-csv'
import type { TeamPerformanceRep } from '@/types/salesManager'
import { toast } from 'sonner'

export function TeamPerformancePage() {
  const [period, setPeriod] = useState('q3')
  const [data, setData] = useState<{
    reps: TeamPerformanceRep[]
    summary: {
      team_quota: number
      closed_revenue: number
      attainment_percent: number
      pipeline_coverage_ratio: number
      avg_cycle_days: number
      avg_discount_percent: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'attainment' | 'closed' | 'quota' | 'discount'>('attainment')

  useEffect(() => {
    setLoading(true)
    getTeamPerformance(period)
      .then((res) => setData(res))
      .catch((err) => toast.error('Failed to load performance: ' + err.message))
      .finally(() => setLoading(false))
  }, [period])

  const chartData = useMemo(() => {
    if (!data?.reps) return []
    return data.reps.map((r) => ({
      name: r.name.split(' ')[0], // First name for neat axis
      fullName: r.name,
      quota: r.quota,
      closed: r.closed_amount ?? r.closed_revenue ?? 0,
      pipeline: r.pipeline_amount ?? r.active_pipeline ?? 0,
      attainment: r.attainment_percent,
    }))
  }, [data])

  const filteredReps = useMemo(() => {
    if (!data?.reps) return []
    let list = data.reps.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase())
    )

    list = [...list].sort((a, b) => {
      const closedA = a.closed_amount ?? a.closed_revenue ?? 0
      const closedB = b.closed_amount ?? b.closed_revenue ?? 0
      const discA = a.avg_discount ?? a.avg_discount_percent ?? 0
      const discB = b.avg_discount ?? b.avg_discount_percent ?? 0

      if (sortBy === 'closed') return closedB - closedA
      if (sortBy === 'quota') return b.quota - a.quota
      if (sortBy === 'discount') return discB - discA
      return b.attainment_percent - a.attainment_percent
    })

    return list
  }, [data, search, sortBy])

  const handleExportCsv = () => {
    if (!filteredReps.length) {
      toast.error('No representative records available to export.')
      return
    }

    const rows = filteredReps.map((r) => ({
      Representative: r.name,
      Email: r.email,
      Period: period.toUpperCase(),
      Quota_INR: r.quota,
      Closed_Revenue_INR: r.closed_amount ?? r.closed_revenue ?? 0,
      Attainment_Percent: `${r.attainment_percent}%`,
      Active_Pipeline_INR: r.pipeline_amount ?? r.active_pipeline ?? 0,
      Win_Rate_Percent: `${r.win_rate ?? r.win_rate_percent ?? 0}%`,
      Avg_Discount_Percent: `${r.avg_discount ?? r.avg_discount_percent ?? 0}%`,
      Health_Index: r.health_index ?? 85,
    }))

    downloadCsv(`Sales_Team_Performance_${period.toUpperCase()}_${new Date().toISOString().split('T')[0]}`, rows)
    toast.success('Representative performance leaderboard exported as CSV!')
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Team Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quota attainment, deal cycle velocity, and discount discipline across all direct reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
            {['q1', 'q2', 'q3', 'q4', 'fy26'].map((p) => (
              <Button
                key={p}
                size="sm"
                variant={period === p ? 'default' : 'ghost'}
                onClick={() => setPeriod(p)}
                className="uppercase text-xs"
              >
                {p}
              </Button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCsv} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Team Quota</span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                ₹{(data.summary.team_quota / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Closed Revenue</span>
              <p className="text-lg font-bold tabular-nums text-success">
                ₹{(data.summary.closed_revenue / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Attainment</span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.summary.attainment_percent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Pipeline Coverage</span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.summary.pipeline_coverage_ratio}x
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Avg Cycle Days</span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.summary.avg_cycle_days}d
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground">Avg Discount</span>
              <p className="text-lg font-bold tabular-nums text-warning">
                {data.summary.avg_discount_percent}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Attainment Comparison Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Quota vs Closed Revenue by Sales Representative
              </CardTitle>
              <CardDescription className="text-xs">
                Comparison of assigned quota target vs closed realized revenue (in ₹ INR)
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded bg-muted-foreground/50" /> Quota Target
              </span>
              <span className="flex items-center gap-1.5 text-primary">
                <span className="h-2.5 w-2.5 rounded bg-primary" /> Closed Revenue
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} style={{ background: 'transparent' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name === 'quota' ? 'Quota Target' : 'Closed Revenue']}
                  labelFormatter={(label) => {
                    const match = chartData.find((c) => c.name === label)
                    return match ? `${match.fullName} (${match.attainment}% Attainment)` : label
                  }}
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--color-foreground)',
                    boxShadow: 'none',
                  }}
                />
                <Bar dataKey="quota" fill="var(--color-muted)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="closed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rep Leaderboard Table with Search and Sort */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Rep Quota Attainment & Governance</CardTitle>
            <CardDescription className="text-xs">
              Detailed breakdown of pipeline velocity, win rates, and discount compliance.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search rep..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="attainment">Sort by Attainment %</option>
              <option value="closed">Sort by Closed Revenue</option>
              <option value="quota">Sort by Quota Size</option>
              <option value="discount">Sort by Avg Discount</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="pb-3 font-semibold">Sales Representative</th>
                  <th className="pb-3 text-right font-semibold">Quota</th>
                  <th className="pb-3 text-right font-semibold">Closed</th>
                  <th className="pb-3 font-semibold px-4">Attainment %</th>
                  <th className="pb-3 text-right font-semibold">Pipeline</th>
                  <th className="pb-3 text-right font-semibold">Win Rate</th>
                  <th className="pb-3 text-right font-semibold">Avg Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading performance...
                    </td>
                  </tr>
                ) : filteredReps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No representatives match search filter.
                    </td>
                  </tr>
                ) : (
                  filteredReps.map((rep) => {
                    const closed = rep.closed_amount ?? rep.closed_revenue ?? 0
                    const pipeline = rep.pipeline_amount ?? rep.active_pipeline ?? 0
                    const winRate = rep.win_rate ?? rep.win_rate_percent ?? 0
                    const avgDisc = rep.avg_discount ?? rep.avg_discount_percent ?? 0
                    return (
                      <tr key={rep.id || rep.rep_id} className="hover:bg-muted/30">
                        <td className="py-3">
                          <span className="font-semibold text-foreground block">{rep.name}</span>
                          <span className="text-[11px] text-muted-foreground">{rep.email}</span>
                        </td>
                        <td className="py-3 text-right tabular-nums">₹{rep.quota.toLocaleString()}</td>
                        <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                          ₹{closed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>{rep.attainment_percent}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  rep.attainment_percent >= 85
                                    ? 'bg-success'
                                    : rep.attainment_percent >= 70
                                    ? 'bg-primary'
                                    : 'bg-warning'
                                }`}
                                style={{ width: `${Math.min(rep.attainment_percent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right tabular-nums">₹{pipeline.toLocaleString()}</td>
                        <td className="py-3 text-right tabular-nums">{winRate}%</td>
                        <td className="py-3 text-right tabular-nums">
                          <span className={avgDisc > 15 ? 'text-danger font-semibold' : ''}>
                            {avgDisc}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

