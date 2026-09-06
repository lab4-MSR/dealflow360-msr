import React from 'react'
import { Activity, CheckCircle, AlertCircle, Clock, ShieldCheck, PieChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type DealHealthOverviewData } from '../types/intelligence'

interface DealHealthScoreCardProps {
  healthData: DealHealthOverviewData
}

export const DealHealthScoreCard: React.FC<DealHealthScoreCardProps> = ({ healthData }) => {
  const getStatusBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success text-white">Healthy</Badge>
    if (score >= 60) return <Badge className="bg-warning text-warning-foreground">At Risk</Badge>
    return <Badge variant="destructive">Critical</Badge>
  }

  const breakdown = healthData.breakdown || healthData.health_score_breakdown || {}

  const dimensions = [
    { label: 'Sales Activity', score: breakdown.sales_activity ?? 82, desc: 'Call, email, & meeting cadence' },
    { label: 'Customer Engagement', score: breakdown.customer_engagement ?? 68, desc: 'Proposal opens & stakeholder responsiveness' },
    { label: 'Approval Progress', score: breakdown.approval_progress ?? 71, desc: 'Internal multi-tier clearance speed' },
    { label: 'Discount Governance', score: breakdown.discount_risk ?? 65, desc: 'Adherence to gross margin ceilings' },
    { label: 'Margin Health', score: breakdown.margin_health ?? 79, desc: 'Net margin vs target return baseline' },
    { label: 'Fulfillment Feasibility', score: breakdown.fulfillment_health ?? 80, desc: 'Warehouse stock availability & lead time' },
  ]

  const avgScore = healthData.average_health_score ?? breakdown.overall_health ?? 74

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">6-Dimension Deal Health Engine</CardTitle>
          </div>
          {getStatusBadge(avgScore)}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-surface-muted">
          <div>
            <span className="text-xs text-muted-foreground block">Healthy Deals</span>
            <span className="text-2xl font-bold text-success font-numeric">{healthData.healthy_deals ?? healthData.kpis?.healthy ?? 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">At-Risk Deals</span>
            <span className="text-2xl font-bold text-warning font-numeric">{healthData.at_risk_deals ?? healthData.kpis?.at_risk ?? 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Stalled Deals</span>
            <span className="text-2xl font-bold text-danger font-numeric">{healthData.stalled_deals ?? healthData.kpis?.stalled ?? 0}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Critical Pipeline Value</span>
            <span className="text-xl font-bold text-foreground font-numeric">₹{Number(healthData.critical_pipeline_value ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aggregate Health Index Dimensions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {dimensions.map((dim, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-surface">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{dim.label}</span>
                  <span className="font-bold font-numeric">{dim.score}%</span>
                </div>
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.score >= 75 ? 'bg-success' : dim.score >= 50 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1 block truncate">{dim.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
