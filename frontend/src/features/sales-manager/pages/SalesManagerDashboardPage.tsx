import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  Percent,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Users,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { SlaCountdown } from '../components/SlaCountdown'
import { CustomerTierBadge, HealthScoreBadge } from '../components/CustomerTierBadge'
import { InsightCard } from '../components/InsightCard'
import {
  getSalesManagerDashboard,
  getTeamPerformance,
  getDealHealthData,
} from '@/services/salesManager'
import type {
  SalesManagerDashboardKpis,
  ApprovalQueueItem,
  TeamDeal,
  DecisionInsight,
  TeamPerformanceRep,
} from '@/types/salesManager'

export function SalesManagerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<SalesManagerDashboardKpis | null>(null)
  const [priorityApprovals, setPriorityApprovals] = useState<ApprovalQueueItem[]>([])
  const [recentDeals, setRecentDeals] = useState<TeamDeal[]>([])
  const [insights, setInsights] = useState<DecisionInsight[]>([])
  const [reps, setReps] = useState<TeamPerformanceRep[]>([])
  const [healthSummary, setHealthSummary] = useState<{ healthy: number; at_risk: number; stalled: number; critical: number } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('Q3 2026')
  const [selectedTeam, setSelectedTeam] = useState('North America Enterprise')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [dash, perf, health] = await Promise.all([
          getSalesManagerDashboard(),
          getTeamPerformance(),
          getDealHealthData(),
        ])
        setKpis(dash.kpis)
        setPriorityApprovals(dash.priority_approvals)
        setRecentDeals(dash.recent_deals)
        setInsights(dash.insights)
        setReps(perf.reps)
        setHealthSummary(health.counts)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedPeriod, selectedTeam])

  if (loading || !kpis) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ─── HEADER & CONTROLS ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sales Manager Command Center</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Manager View
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time discount governance, approval workflow execution, and team pipeline intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="North America Enterprise">North America Enterprise</option>
            <option value="EMEA Commercial">EMEA Commercial</option>
            <option value="APAC Growth">APAC Growth</option>
            <option value="All Teams">All Teams</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Q3 2026">Q3 2026 (Active)</option>
            <option value="September 2026">September 2026</option>
            <option value="Year to Date">Year to Date (2026)</option>
          </select>

          <Button asChild size="sm" className="gap-1.5 shadow-sm">
            <Link to="/sales-manager/approvals">
              <CheckSquare className="h-4 w-4" />
              <span>Inbox ({kpis.deals_requiring_approval})</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── PRIMARY KPI GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Team Pipeline Value"
          value={`$${(kpis.team_pipeline_value / 1000).toFixed(0)}k`}
          trend={{ value: kpis.pipeline_trend_percent, direction: 'up' }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Team Win Rate"
          value={`${kpis.team_win_rate}%`}
          trend={{ value: kpis.win_rate_trend_percent, direction: 'up' }}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
        />
        <KpiCard
          label="Approvals Pending"
          value={kpis.deals_requiring_approval}
          icon={<CheckSquare className="h-4 w-4" />}
          variant={kpis.deals_requiring_approval > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          label="SLA Breach Risks"
          value={kpis.sla_breach_risk_count}
          icon={<Clock className="h-4 w-4" />}
          variant={kpis.sla_breach_risk_count > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          label="Avg Team Discount"
          value={`${kpis.team_discount_variance}%`}
          icon={<Percent className="h-4 w-4" />}
        />
        <KpiCard
          label="Team Margin Health"
          value={`${kpis.team_margin_health}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
        />
        <KpiCard
          label="Stalled Deals"
          value={kpis.stalled_deals_count}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={kpis.stalled_deals_count > 0 ? 'warning' : 'default'}
        />
        <KpiCard
          label="Avg Approval Speed"
          value={`${kpis.avg_approval_time_hours}h`}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* ─── ROW 2: APPROVAL PRIORITY QUEUE + APPROVAL PERFORMANCE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Queue Preview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                Priority Approvals Requiring Immediate Action
              </CardTitle>
              <CardDescription className="text-xs">
                Pending manager sign-off ordered by SLA urgency and blended risk score
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link to="/sales-manager/approvals">
                <span>View Full Inbox</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {priorityApprovals.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-primary">{item.quote_number}</span>
                      <CustomerTierBadge tier={item.customer.tier} />
                      <RiskBadge risk={item.risk_level}>Risk {item.blended_risk_score}</RiskBadge>
                      <SlaCountdown expiresAt={item.sla_expires_at} />
                    </div>

                    <h4 className="text-sm font-semibold text-foreground tracking-tight">
                      {item.deal_name}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>Customer: <strong className="text-foreground">{item.customer.name}</strong></span>
                      <span>Rep: <strong className="text-foreground">{item.rep.name}</strong></span>
                      <span>Value: <strong className="text-foreground">${item.deal_value.toLocaleString()}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 text-xs pt-1">
                      <span className="text-muted-foreground">Req. Discount:</span>
                      <span className="font-semibold text-foreground">{item.requested_discount_percent.toFixed(1)}%</span>
                      {item.excess_discount_percent > 0 && (
                        <span className="text-danger font-semibold bg-danger-subtle px-1.5 py-0.2 rounded text-[11px]">
                          +{item.excess_discount_percent.toFixed(1)}% excess
                        </span>
                      )}
                      <span className="text-muted-foreground ml-2">Margin:</span>
                      <span className="font-semibold text-foreground">{item.margin_percent.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                    <Button asChild size="sm" className="text-xs gap-1">
                      <Link to={`/sales-manager/approvals/${item.id}`}>
                        <span>Review Terms</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                    <span className="text-[11px] text-muted-foreground">
                      Step {item.current_step} of {item.total_steps}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Approval Efficiency & Governance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Approval Governance Metrics
            </CardTitle>
            <CardDescription className="text-xs">Turnaround time and decision ratios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Approved Rate</span>
                  <span className="font-semibold text-success">{kpis.approval_rate_percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${kpis.approval_rate_percent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Returned for Revision</span>
                  <span className="font-semibold text-warning">{kpis.return_rate_percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${kpis.return_rate_percent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Rejected Rate</span>
                  <span className="font-semibold text-danger">{kpis.rejection_rate_percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${kpis.rejection_rate_percent}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg Decision Speed</span>
                <span className="font-bold text-foreground">{kpis.avg_approval_time_hours} hours</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Decided This Month</span>
                <span className="font-bold text-foreground">38 Deals</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SLA Compliance Rate</span>
                <span className="font-bold text-success">94.7%</span>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="w-full text-xs mt-2">
              <Link to="/sales-manager/approvals/history">
                View Decision History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 3: DECISION INSIGHTS (WHAT / WHY / IMPACT / NEXT ACTION) ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <h3 className="text-base font-semibold text-foreground">Manager Decision Insights & Risk Alerts</h3>
          </div>
          <span className="text-xs text-muted-foreground">AI Intelligence & Rule Governance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      {/* ─── ROW 4: TEAM PERFORMANCE & PIPELINE SNAPSHOT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Rep Quota Attainment */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Representative Quota Attainment & Governance
              </CardTitle>
              <CardDescription className="text-xs">
                Revenue contribution vs discount variance by team member
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link to="/sales-manager/performance">
                <span>All Rep Details</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Representative</th>
                    <th className="px-4 py-2.5 font-semibold">Quota</th>
                    <th className="px-4 py-2.5 font-semibold">Closed Revenue</th>
                    <th className="px-4 py-2.5 font-semibold">Attainment</th>
                    <th className="px-4 py-2.5 font-semibold">Avg Discount</th>
                    <th className="px-4 py-2.5 font-semibold">Exceptions</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reps.map((rep) => {
                    const attainment = rep.attainment_percent
                    let barColor = 'bg-success'
                    if (attainment < 65) barColor = 'bg-danger'
                    else if (attainment < 85) barColor = 'bg-warning'

                    return (
                      <tr key={rep.rep_id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {rep.name}
                          <span className="block text-[11px] text-muted-foreground">{rep.open_deals_count} active deals</span>
                        </td>
                        <td className="px-4 py-3 tabular-nums">${rep.quota.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-foreground tabular-nums">
                          ${rep.closed_revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold tabular-nums">{attainment}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, attainment)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          {rep.avg_discount_percent.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          {rep.discount_violations_count > 0 ? (
                            <span className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-semibold bg-danger-subtle text-danger">
                              {rep.discount_violations_count} breaches
                            </span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <HealthScoreBadge score={rep.health_index} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 col: Deal Health Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              Pipeline Health Breakdown
            </CardTitle>
            <CardDescription className="text-xs">Overall distribution across 24 team deals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthSummary && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-success-subtle/40 rounded-lg border border-success/20">
                  <span className="text-2xl font-bold text-success block">{healthSummary.healthy}</span>
                  <span className="text-xs text-muted-foreground font-medium">Healthy Deals</span>
                </div>
                <div className="p-3 bg-warning-subtle/40 rounded-lg border border-warning/20">
                  <span className="text-2xl font-bold text-warning block">{healthSummary.at_risk}</span>
                  <span className="text-xs text-muted-foreground font-medium">At Risk</span>
                </div>
                <div className="p-3 bg-orange-100/50 dark:bg-orange-950/40 rounded-lg border border-orange-300 dark:border-orange-800">
                  <span className="text-2xl font-bold text-orange-600 block">{healthSummary.stalled}</span>
                  <span className="text-xs text-muted-foreground font-medium">Stalled Deals</span>
                </div>
                <div className="p-3 bg-danger-subtle/40 rounded-lg border border-danger/20">
                  <span className="text-2xl font-bold text-danger block">{healthSummary.critical}</span>
                  <span className="text-xs text-muted-foreground font-medium">Critical</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-muted/40 rounded-lg text-xs space-y-1.5">
              <p className="font-semibold text-foreground">Immediate Manager Intervention:</p>
              <p className="text-muted-foreground">
                1 critical anomaly detected on Solaria BioTech equipment margin (6.25%).
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link to="/sales-manager/deal-health">
                Explore Deal Health Deep Dive
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 5: RECENT TEAM DEALS TABLE ─── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Active Team Deals Snapshot
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time progress across discovery, proposal, negotiation, and approval
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
            <Link to="/sales-manager/deals">
              <span>View All Team Deals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Deal Name</th>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-4 py-2.5 font-semibold">Stage</th>
                  <th className="px-4 py-2.5 font-semibold">Value</th>
                  <th className="px-4 py-2.5 font-semibold">Rep</th>
                  <th className="px-4 py-2.5 font-semibold">Health</th>
                  <th className="px-4 py-2.5 font-semibold">Risk</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/sales-manager/deals/${deal.id}`} className="font-semibold text-foreground hover:underline">
                        {deal.title}
                      </Link>
                      {deal.active_quote_number && (
                        <span className="block text-[11px] font-mono text-muted-foreground">
                          {deal.active_quote_number}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground block">{deal.customer_name}</span>
                      <CustomerTierBadge tier={deal.customer_tier} className="mt-0.5" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-foreground px-2 py-0.5 rounded bg-muted">
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground tabular-nums">
                      ${deal.deal_value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-foreground font-medium">{deal.rep_name}</td>
                    <td className="px-4 py-3">
                      <HealthScoreBadge score={deal.health_score} status={deal.health_status} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={deal.risk_level}>{deal.risk_level}</RiskBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                        <Link to={`/sales-manager/deals/${deal.id}`}>
                          Inspect
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
