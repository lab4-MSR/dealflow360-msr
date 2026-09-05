import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Sparkles,
  HeartPulse,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Layers,
  Activity,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import {
  type IntelligenceDashboardData,
  type HighRiskDealItem,
  type RecommendationItem,
  type DecisionInsightItem,
} from '../types/intelligence'
import { DecisionExplanationPanel } from '../components/DecisionExplanationPanel'
import { RecommendationCard } from '../components/RecommendationCard'

export const IntelligenceDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<IntelligenceDashboardData | null>(null)
  const [highRiskDeals, setHighRiskDeals] = useState<HighRiskDealItem[]>([])
  const [upsells, setUpsells] = useState<RecommendationItem[]>([])
  const [insights, setInsights] = useState<DecisionInsightItem[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dash, risks, recs, ins] = await Promise.all([
        intelligenceService.getDashboard(),
        intelligenceService.getHighRiskDeals(),
        intelligenceService.getUpsellRecommendations(),
        intelligenceService.getInsights(),
      ])
      setDashboardData(dash)
      setHighRiskDeals(risks.slice(0, 5))
      setUpsells(recs.slice(0, 3))
      setInsights(ins.slice(0, 3))
    } catch (err) {
      console.error('Failed to load intelligence dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-72" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Intelligence & Decision Command</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time algorithmic risk evaluation, upsell modeling, deal health monitoring, and governance anomaly alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/intelligence/insights')}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs"
          >
            All Insights ({dashboardData.active_insights_count})
          </Button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Risk Deals */}
        <Card className="hover:border-rose-300 dark:hover:border-rose-900 transition-colors">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">High-Risk Pipeline</span>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600">{dashboardData.high_risk_deals_count}</span>
              <span className="text-xs text-muted-foreground">deals</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{dashboardData.high_risk_pipeline_value.toLocaleString('en-IN')} total exposure
            </p>
            <div className="mt-3 pt-2 border-t border-border">
              <Link
                to="/intelligence/risks/high"
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                Inspect high risk deals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upsell Revenue Opportunity */}
        <Card className="hover:border-purple-300 dark:hover:border-purple-900 transition-colors">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Identified Revenue Uplift</span>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                ₹{dashboardData.identified_revenue_uplift.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across 18 ranked deal recommendations</p>
            <div className="mt-3 pt-2 border-t border-border">
              <Link
                to="/intelligence/recommendations/upsell"
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                Explore recommendations <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stalled Deals */}
        <Card className="hover:border-amber-300 dark:hover:border-amber-900 transition-colors">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Stalled Pipeline</span>
              <HeartPulse className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">{dashboardData.stalled_deals_count}</span>
              <span className="text-xs text-muted-foreground">stalled deals</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{dashboardData.stalled_pipeline_value.toLocaleString('en-IN')} pending action
            </p>
            <div className="mt-3 pt-2 border-t border-border">
              <Link
                to="/intelligence/health/stalled"
                className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
              >
                Unstick stalled deals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Governance Anomalies */}
        <Card className="hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Anomalies</span>
              <AlertTriangle className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {dashboardData.active_anomalies_count}
              </span>
              <span className="text-xs text-muted-foreground">violations</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Discount breaches & delivery slippages</p>
            <div className="mt-3 pt-2 border-t border-border">
              <Link
                to="/intelligence/anomalies/discount"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Inspect anomaly queue <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Intelligence Command Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/intelligence/risks"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <ShieldAlert className="h-5 w-5 mx-auto text-rose-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Risk Overview</span>
            <span className="text-[11px] text-muted-foreground">Composite KPIs</span>
          </Link>

          <Link
            to="/intelligence/recommendations/upsell"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <TrendingUp className="h-5 w-5 mx-auto text-purple-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Upsell Engine</span>
            <span className="text-[11px] text-muted-foreground">Tier upgrades</span>
          </Link>

          <Link
            to="/intelligence/recommendations/cross-sell"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <Layers className="h-5 w-5 mx-auto text-purple-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Cross-Sell</span>
            <span className="text-[11px] text-muted-foreground">Affinity bundles</span>
          </Link>

          <Link
            to="/intelligence/health"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <HeartPulse className="h-5 w-5 mx-auto text-indigo-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Deal Health</span>
            <span className="text-[11px] text-muted-foreground">6-dimension index</span>
          </Link>

          <Link
            to="/intelligence/anomalies/discount"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Discount Anomalies</span>
            <span className="text-[11px] text-muted-foreground">Margin policy checks</span>
          </Link>

          <Link
            to="/intelligence/insights"
            className="p-3 rounded-lg border border-border bg-surface hover:border-purple-300 dark:hover:border-purple-800 transition-colors text-center"
          >
            <Sparkles className="h-5 w-5 mx-auto text-purple-600 mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">Decision Insights</span>
            <span className="text-[11px] text-muted-foreground">WHAT/WHY/IMPACT</span>
          </Link>
        </div>
      </div>

      {/* Primary Intelligence Feed: High-Risk Deals & Top Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* High Risk Deals Table */}
        <Card className="lg:col-span-7">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">High & Critical Risk Deals</CardTitle>
                <CardDescription>Deals requiring executive or managerial risk mitigation</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-rose-600 gap-1">
                <Link to="/intelligence/risks/high">
                  View All ({dashboardData.high_risk_deals_count}) <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Deal / Customer</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Primary Factor</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {highRiskDeals.map((deal) => (
                    <tr key={deal.deal_id} className="hover:bg-surface-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{deal.deal_name}</div>
                        <div className="text-[11px] text-muted-foreground">{deal.customer_name} · Rep: {deal.rep_name}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        ₹{deal.deal_value.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge risk={deal.risk_level}>{deal.blended_score} / 100</RiskBadge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{deal.primary_risk_driver}</span>
                        <div className="text-[11px] text-muted-foreground">Margin: {deal.margin_percent}%</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button asChild variant="outline" size="sm" className="text-xs h-7">
                          <Link to={`/intelligence/risks/${deal.quotation_id}`}>
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

        {/* Top Upsell & Cross-sell Opportunities */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <h2 className="text-base font-semibold text-foreground">Smart Recommendations</h2>
            </div>
            <Link
              to="/intelligence/recommendations/upsell"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
            >
              All Upsell <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upsells.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onViewDetails={(id) => navigate(`/intelligence/recommendations/${id}`)}
                onApply={(id) => navigate(`/sales/quotations/${rec.quotation_id}`)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Critical Decision Insights Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Active Intelligence Explanations & Next Actions</h2>
            <p className="text-xs text-muted-foreground">
              Direct evidence-backed decision support with WHAT, WHY, IMPACT, WHO, and NEXT ACTION framework
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1">
            <Link to="/intelligence/insights">
              View All Insights <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item) => (
            <Card key={item.id} className="p-4 border-purple-200 dark:border-purple-900/60">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">{item.title}</span>
                <Badge variant={item.severity === 'critical' ? 'destructive' : 'default'} className="uppercase text-[10px]">
                  {item.severity}
                </Badge>
              </div>
              <DecisionExplanationPanel
                explanation={item.explanation}
                onTakeAction={() => navigate('/intelligence/insights')}
                actionLabel="Review & Execute"
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
