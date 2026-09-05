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
    if (score >= 60) return <Badge className="bg-amber-500 text-white">At Risk</Badge>
    return <Badge variant="destructive">Critical</Badge>
  }

  const dimensions = [
    { label: 'Sales Activity', score: healthData.breakdown.sales_activity, desc: 'Call, email, & meeting cadence' },
    { label: 'Customer Engagement', score: healthData.breakdown.customer_engagement, desc: 'Proposal opens & stakeholder responsiveness' },
    { label: 'Approval Progress', score: healthData.breakdown.approval_progress, desc: 'Internal multi-tier clearance speed' },
    { label: 'Discount Governance', score: healthData.breakdown.discount_risk, desc: 'Adherence to gross margin ceilings' },
    { label: 'Margin Health', score: healthData.breakdown.margin_health, desc: 'Net margin vs target return baseline' },
    { label: 'Fulfillment Feasibility', score: healthData.breakdown.fulfillment_health, desc: 'Warehouse stock availability & lead time' },
  ]

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base font-semibold">6-Dimension Deal Health Engine</CardTitle>
          </div>
          {getStatusBadge(healthData.average_health_score)}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-surface-muted">
          <div>
            <span className="text-xs text-muted-foreground block">Healthy Deals</span>
            <span className="text-2xl font-bold text-success">{healthData.healthy_deals}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">At-Risk Deals</span>
            <span className="text-2xl font-bold text-amber-500">{healthData.at_risk_deals}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Stalled Deals</span>
            <span className="text-2xl font-bold text-rose-500">{healthData.stalled_deals}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Critical Pipeline Value</span>
            <span className="text-xl font-bold text-foreground">₹{healthData.critical_pipeline_value.toLocaleString('en-IN')}</span>
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
                  <span className="font-bold">{dim.score}%</span>
                </div>
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.score >= 75 ? 'bg-success' : dim.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
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
