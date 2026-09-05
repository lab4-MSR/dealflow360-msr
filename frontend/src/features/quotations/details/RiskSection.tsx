import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Shield, AlertTriangle, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react'
import type { RiskData } from '@/types/quotation'

interface RiskSectionProps {
  risk: RiskData
}

export function RiskSection({ risk }: RiskSectionProps) {
  const score = risk.blended_risk_score
  const isHighOrCritical = score > 60

  return (
    <section id="risk" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Risk
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground font-mono">
            Blended Risk Engine
          </span>
          <RiskBadge risk={risk.risk_level} className="text-caption uppercase">
            {risk.risk_level} ({risk.blended_risk_score}/100)
          </RiskBadge>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Blended Risk Score */}
        <Card className={`shadow-sm ${isHighOrCritical ? 'border-danger/30 bg-danger-subtle/10' : ''}`}>
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Blended Risk Score
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${isHighOrCritical ? 'text-danger' : 'text-foreground'}`}>
                {risk.blended_risk_score}
              </span>
              <span className="text-caption text-muted-foreground font-mono">/ 100</span>
            </div>
            {/* Progress Bar Gauge */}
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full ${
                  score <= 30
                    ? 'bg-success'
                    : score <= 60
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Risk Level */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Risk Level
            </span>
            <div className="mt-2">
              <RiskBadge risk={risk.risk_level} size="md" className="capitalize text-small font-semibold">
                {risk.risk_level} Risk
              </RiskBadge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              Standard 4-tier classification
            </span>
          </CardContent>
        </Card>

        {/* 3. Margin Risk */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Margin Risk
            </span>
            <div className="mt-2">
              <Badge
                variant={
                  risk.margin_risk === 'critical'
                    ? 'danger'
                    : risk.margin_risk === 'warning'
                    ? 'warning'
                    : 'secondary'
                }
                className="capitalize text-small font-medium"
              >
                {risk.margin_risk}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              Evaluated against 25% floor
            </span>
          </CardContent>
        </Card>

        {/* 4. Customer Risk */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Customer Risk
            </span>
            <div className="mt-2">
              <Badge variant="secondary" className="capitalize text-small font-medium">
                {risk.customer_risk} Risk
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              Gold Tier credit standing
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 5. Line-Level Risk & 6. Aggregate Risk */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              Line-Level Risk Breakdown
            </CardTitle>
            <span className="text-caption text-muted-foreground">
              Per-Item Risk Allocation
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              {risk.line_level_risks.map((lr) => (
                <div
                  key={lr.line_id}
                  className="rounded-lg border border-border p-3 flex items-center justify-between gap-3 bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-small text-foreground truncate">
                      {lr.product_name}
                    </p>
                    <p className="text-caption text-muted-foreground mt-0.5">
                      {lr.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <RiskBadge risk={lr.risk_level} className="text-caption font-mono">
                      {lr.risk_score}
                    </RiskBadge>
                  </div>
                </div>
              ))}
            </div>

            {/* Aggregate Risk Note */}
            <div className="p-3 rounded-lg border border-border bg-card mt-3">
              <span className="text-caption uppercase tracking-wider font-semibold text-muted-foreground block">
                Aggregate Risk Note
              </span>
              <p className="text-caption text-foreground mt-1 leading-relaxed">
                {risk.aggregate_risk_note}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 7. Risk Explanation (WHY / CONTRIBUTING FACTORS / IMPACT / RECOMMENDED ACTION) */}
        <Card className="shadow-sm border-danger/20 bg-danger-subtle/10">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <AlertOctagon className="h-4 w-4 text-danger" />
              Risk Explanation & Decision Guidance
            </CardTitle>
            <span className="text-caption font-mono font-bold text-danger">
              Score: {risk.blended_risk_score}
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-small">
            <div>
              <span className="text-caption uppercase tracking-wider font-bold text-danger block">
                WHY IS THIS RISKY?
              </span>
              <p className="text-foreground mt-0.5 leading-relaxed font-medium">
                {risk.risk_explanation.why}
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-muted-foreground block">
                CONTRIBUTING FACTORS
              </span>
              <ul className="mt-1 space-y-1 text-caption text-muted-foreground">
                {risk.risk_explanation.contributing_factors.map((cf, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-danger shrink-0 mt-0.5" />
                    <span>{cf}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-warning block">
                IMPACT ON WORKFLOW
              </span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                {risk.risk_explanation.impact}
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-success block">
                RECOMMENDED ACTION
              </span>
              <p className="text-foreground font-medium mt-0.5 leading-relaxed">
                {risk.risk_explanation.recommended_action}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
