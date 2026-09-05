import React from 'react'
import { Shield, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RiskBadge } from '@/components/ui/risk-badge'
import { type RiskDetailRecord } from '../types/intelligence'

interface RiskScoreCardProps {
  riskData: RiskDetailRecord
  className?: string
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ riskData, className = '' }) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-danger bg-danger-subtle border-danger/30'
    if (score >= 40) return 'text-warning bg-warning-subtle border-warning/30'
    return 'text-success bg-success-subtle border-success/30'
  }

  const dimensions = [
    { label: 'Margin Risk', score: riskData.margin_risk_score, desc: 'Erosion from target floor' },
    { label: 'Discount Risk', score: riskData.discount_risk_score, desc: 'Policy limit threshold exceptions' },
    { label: 'Credit Risk', score: riskData.credit_risk_score, desc: 'Customer payment & history risk' },
    { label: 'Delivery Risk', score: riskData.delivery_risk_score, desc: 'Warehouse fulfillment slippage' },
    { label: 'Cancellation Risk', score: riskData.cancellation_risk_score, desc: 'Probability of deal abandonment' },
  ]

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base font-semibold">Blended Risk Assessment</CardTitle>
          </div>
          <RiskBadge risk={riskData.risk_level}>{riskData.risk_level.toUpperCase()}</RiskBadge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Main Score Hero */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-border bg-surface-muted gap-4">
          <div>
            <span className="text-xs uppercase font-medium text-muted-foreground">Composite Risk Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">{riskData.blended_score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {riskData.blended_score >= 70
                ? 'Requires executive intervention before quotation release'
                : riskData.blended_score >= 40
                ? 'Standard management review advised'
                : 'Within standard operating risk thresholds'}
            </p>
          </div>
          <div className="flex gap-4 sm:border-l sm:border-border sm:pl-6 text-center sm:text-left">
            <div>
              <span className="text-xs text-muted-foreground">Margin at Risk</span>
              <p className="text-lg font-bold text-danger">₹{riskData.margin_impact.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Assessed Date</span>
              <p className="text-sm font-medium text-foreground">{riskData.assessed_at}</p>
            </div>
          </div>
        </div>

        {/* 5 Dimensions breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risk Factors Breakdown
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dimensions.map((dim, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-surface flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground">{dim.label}</span>
                  <span className="font-bold text-foreground">{dim.score} / 100</span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.score >= 70 ? 'bg-danger' : dim.score >= 40 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-1.5">{dim.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
