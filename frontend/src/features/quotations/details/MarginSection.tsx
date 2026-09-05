import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Lock, AlertTriangle, CheckCircle2, DollarSign } from 'lucide-react'
import type { MarginData } from '@/types/quotation'

interface MarginSectionProps {
  margin: MarginData
  currency: string
  canViewCost?: boolean
}

export function MarginSection({ margin, currency, canViewCost = true }: MarginSectionProps) {
  const curSymbol = currency === 'INR' ? '₹' : '$'
  const isBelowMinimum = margin.margin_percent < margin.minimum_margin
  const isBelowTarget = margin.margin_percent < margin.target_margin

  return (
    <section id="margin" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Margin
          </h2>
          <Badge variant="outline" className="text-caption font-mono border-warning/40 text-warning">
            Internal Financial Intelligence
          </Badge>
        </div>
        <Badge
          variant={
            margin.margin_impact === 'critical'
              ? 'danger'
              : margin.margin_impact === 'warning'
              ? 'warning'
              : 'success'
          }
          className="capitalize text-caption font-semibold"
        >
          Margin Impact: {margin.margin_impact}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Revenue */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Revenue
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {curSymbol}
                {margin.revenue.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Total Deal Inflow
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Cost (Permission-controlled) */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Cost (COGS)
            </span>
            <div className="mt-1">
              {canViewCost && margin.cost !== null ? (
                <>
                  <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                    {curSymbol}
                    {margin.cost.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Direct Product + Service Cost
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                  <Lock className="h-4 w-4" />
                  <span className="text-caption">Role Restricted</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Gross Margin */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Gross Margin
            </span>
            <div className="mt-1">
              {margin.gross_margin !== null ? (
                <>
                  <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                    {curSymbol}
                    {margin.gross_margin.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Revenue - COGS
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                  <Lock className="h-4 w-4" />
                  <span className="text-caption">Protected</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Margin % */}
        <Card className={`shadow-sm ${isBelowMinimum ? 'border-danger/30 bg-danger-subtle/10' : ''}`}>
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Margin %
            </span>
            <div className="mt-1">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  isBelowMinimum ? 'text-danger' : isBelowTarget ? 'text-warning' : 'text-success'
                }`}
              >
                {margin.margin_percent}%
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Projected Profitability
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Target Margin */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Target Margin
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground tabular-nums">
                {margin.target_margin}%
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Organizational Benchmark
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Minimum Margin */}
        <Card className="shadow-sm border-danger/20">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-danger block">
              Minimum Margin
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-danger tabular-nums">
                {margin.minimum_margin}%
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Policy Floor Requirement
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margin Impact Explanation Card */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
            {isBelowMinimum ? (
              <AlertTriangle className="h-4 w-4 text-danger" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
            Margin Impact & Variance Analysis
          </CardTitle>
          <span className="text-caption font-mono text-muted-foreground">
            Baseline: {margin.baseline_margin}% → Current: {margin.margin_percent}% ({margin.margin_drop_pp > 0 ? `-${margin.margin_drop_pp} pp` : '0 pp'})
          </span>
        </CardHeader>
        <CardContent className="p-5 space-y-3 text-small">
          <p className="text-foreground leading-relaxed">
            {margin.explanation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-caption">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block">Baseline Margin</span>
              <span className="font-mono text-small text-muted-foreground">{margin.baseline_margin}%</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block">Discount Erosion Impact</span>
              <span className="font-mono text-small text-danger">-{margin.margin_drop_pp} percentage points</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block">Policy Floor Gap</span>
              <span className="font-mono text-small text-danger">
                {margin.margin_percent < margin.minimum_margin
                  ? `${margin.minimum_margin - margin.margin_percent} pp below floor`
                  : 'Meets floor'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
