import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Info, Scale, CheckCircle2 } from 'lucide-react'
import type { DiscountAnalysisData } from '@/types/quotation'

interface DiscountAnalysisSectionProps {
  analysis: DiscountAnalysisData
  currency: string
}

export function DiscountAnalysisSection({ analysis, currency }: DiscountAnalysisSectionProps) {
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({
    'rule-cat-01': true,
    'rule-mar-02': true,
  })

  const toggleRule = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const curSymbol = currency === 'INR' ? '₹' : '$'
  const hasExcess = analysis.excess_discount > 0

  return (
    <section id="discount" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Discount Analysis
        </h2>
        <Badge
          variant={hasExcess ? 'warning' : 'secondary'}
          className="text-caption font-medium"
        >
          {hasExcess ? `${analysis.excess_discount} pp Policy Excess Detected` : 'Within Discount Ceilings'}
        </Badge>
      </div>

      {/* Grid of Limits vs Requested/Allowed */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Customer Tier Limit */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Customer Tier Limit
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {analysis.customer_tier_limit}%
              </span>
              <span className="text-[11px] text-muted-foreground block truncate" title={analysis.customer_tier_name}>
                {analysis.customer_tier_name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Category Limit */}
        <Card className="shadow-sm border-warning/30 bg-warning-subtle/10">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Category Limit
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-warning">
                {analysis.category_limit}%
              </span>
              <span className="text-[11px] text-muted-foreground block truncate" title={analysis.category_name}>
                {analysis.category_name}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 3. Product Limit */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Product Limit
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-muted-foreground">
                {analysis.product_limit !== null ? `${analysis.product_limit}%` : 'None'}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Standard Catalog
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Requested Discount */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Requested Discount
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {analysis.requested_discount}%
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Sales Rep Proposal
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Allowed Discount */}
        <Card className="shadow-sm border-primary/20 bg-primary-subtle/10">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary block">
              Allowed Discount
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-primary">
                {analysis.allowed_discount}%
              </span>
              <span className="text-[11px] text-muted-foreground block truncate" title={analysis.governing_rule_name}>
                Strictest Policy Rule
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Excess Discount */}
        <Card className={`shadow-sm ${hasExcess ? 'border-danger/40 bg-danger-subtle/20' : ''}`}>
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-danger block">
              Excess Discount
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-danger">
                +{analysis.excess_discount} pp
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Impact: {curSymbol}{analysis.excess_discount_amount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7. Violated Rules */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <ShieldAlert className="h-4 w-4 text-warning" />
              Violated Rules ({analysis.violated_rules.length})
            </CardTitle>
            <span className="text-caption text-muted-foreground">
              Backend Discount Rule Evaluation
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {analysis.violated_rules.length === 0 ? (
              <div className="flex items-center gap-2 text-small text-success py-4">
                <CheckCircle2 className="h-4 w-4" />
                <span>All line items and order concessions comply with discount governance.</span>
              </div>
            ) : (
              analysis.violated_rules.map((rule) => {
                const isExpanded = Boolean(expandedRules[rule.id])
                return (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-border bg-card overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 shrink-0 ${
                            rule.severity === 'critical' ? 'text-danger' : 'text-warning'
                          }`}
                        />
                        <span className="font-semibold text-small text-foreground">
                          {rule.rule_name}
                        </span>
                        <Badge
                          variant={rule.severity === 'critical' ? 'danger' : 'warning'}
                          className="text-[10px] py-0 px-1.5 uppercase"
                        >
                          {rule.severity}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 text-caption border-t border-border/60 bg-muted/10 space-y-2 mt-1">
                        <p className="text-foreground leading-relaxed">{rule.description}</p>
                        <div className="flex items-center gap-4 text-muted-foreground font-mono">
                          <span>Threshold: {rule.threshold_value}%</span>
                          <span>•</span>
                          <span className="text-danger font-semibold">Actual: {rule.actual_value}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* 8. Discount Explanation (WHAT / WHY / IMPACT / NEXT ACTION) */}
        <Card className="shadow-sm border-primary/20 bg-primary-subtle/10">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-4 w-4 text-primary" />
              Discount Explanation & Governance Rationale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-small">
            <div>
              <span className="text-caption uppercase tracking-wider font-bold text-primary block">
                WHAT
              </span>
              <p className="text-foreground mt-0.5 leading-relaxed font-medium">
                {analysis.explanation.what}
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-muted-foreground block">
                WHY
              </span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                {analysis.explanation.why}
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-warning block">
                IMPACT
              </span>
              <p className="text-muted-foreground mt-0.5 leading-relaxed">
                {analysis.explanation.impact}
              </p>
            </div>

            <div className="pt-2 border-t border-border/80">
              <span className="text-caption uppercase tracking-wider font-bold text-success block">
                NEXT ACTION
              </span>
              <p className="text-foreground font-medium mt-0.5 leading-relaxed">
                {analysis.explanation.next_action}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
