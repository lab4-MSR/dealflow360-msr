import { useState, useEffect } from 'react'
import { Award, TrendingUp, Users, DollarSign, Target, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTeamPerformance } from '@/services/salesManager'
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

  useEffect(() => {
    setLoading(true)
    getTeamPerformance(period)
      .then((res) => setData(res))
      .catch((err) => toast.error('Failed to load performance: ' + err.message))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h2 font-semibold text-foreground">Sales Team Performance</h1>
          <p className="text-body-small text-muted-foreground">
            Quota attainment, deal cycle velocity, and discount discipline across all direct reports.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
          {['q1', 'q2', 'q3', 'q4', 'fy26'].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'ghost'}
              onClick={() => setPeriod(p)}
              className="uppercase"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Team Quota</span>
              <p className="text-body font-bold tabular-nums text-foreground">
                ₹{(data.summary.team_quota / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Closed Revenue</span>
              <p className="text-body font-bold tabular-nums text-success">
                ₹{(data.summary.closed_revenue / 100000).toFixed(1)}L
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Attainment</span>
              <p className="text-body font-bold tabular-nums text-foreground">
                {data.summary.attainment_percent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Pipeline Coverage</span>
              <p className="text-body font-bold tabular-nums text-foreground">
                {data.summary.pipeline_coverage_ratio}x
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Avg Cycle Days</span>
              <p className="text-body font-bold tabular-nums text-foreground">
                {data.summary.avg_cycle_days}d
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-caption text-muted-foreground">Avg Discount</span>
              <p className="text-body font-bold tabular-nums text-warning">
                {data.summary.avg_discount_percent}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rep Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Rep Quota Attainment & Variance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Sales Representative</th>
                  <th className="pb-3 text-right font-medium">Quota</th>
                  <th className="pb-3 text-right font-medium">Closed</th>
                  <th className="pb-3 font-medium px-4">Attainment %</th>
                  <th className="pb-3 text-right font-medium">Pipeline</th>
                  <th className="pb-3 text-right font-medium">Win Rate</th>
                  <th className="pb-3 text-right font-medium">Avg Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading performance...
                    </td>
                  </tr>
                ) : (
                  data?.reps.map((rep) => {
                    const closed = rep.closed_amount ?? rep.closed_revenue ?? 0
                    const pipeline = rep.pipeline_amount ?? rep.active_pipeline ?? 0
                    const winRate = rep.win_rate ?? rep.win_rate_percent ?? 0
                    const avgDisc = rep.avg_discount ?? rep.avg_discount_percent ?? 0
                    return (
                    <tr key={rep.id || rep.rep_id} className="hover:bg-muted/30">
                      <td className="py-3">
                        <span className="font-semibold text-foreground block">{rep.name}</span>
                        <span className="text-caption text-muted-foreground">{rep.email}</span>
                      </td>
                      <td className="py-3 text-right tabular-nums">₹{rep.quota.toLocaleString()}</td>
                      <td className="py-3 text-right tabular-nums font-semibold text-foreground">
                        ₹{closed.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-caption font-semibold">
                            <span>{rep.attainment_percent}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
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
                  )})
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
