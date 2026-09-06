import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  GitCompare,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import type { NegotiationData } from '@/types/quotation'

interface NegotiationSectionProps {
  negotiation: NegotiationData
  currency: string
}

export function NegotiationSection({ negotiation, currency }: NegotiationSectionProps) {
  const {
    negotiation_status,
    customer_request,
    counter_discount,
    quantity_change,
    price_change,
    quote_version,
    version_comparison,
    risk_recalculation,
    re_approval_status,
  } = negotiation

  const curSymbol = '₹'

  return (
    <section id="negotiation" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Negotiation & Version Recalculation
          </h2>
          <Badge
            variant={
              negotiation_status === 'counter_offer' || negotiation_status === 'requested'
                ? 'warning'
                : negotiation_status === 'accepted'
                ? 'success'
                : 'secondary'
            }
            className="capitalize text-caption"
          >
            {negotiation_status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <span className="font-mono text-caption text-muted-foreground font-semibold">
          Affected Version: {quote_version}
        </span>
      </div>

      {/* Critical Re-Approval Invalidation Banner */}
      {re_approval_status.required && (
        <div className="rounded-xl border border-warning/40 bg-warning-subtle/20 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-small text-warning uppercase tracking-wide">
                Previous Approval Invalidated
              </span>
              <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-mono">
                v{re_approval_status.invalidated_version} → v{re_approval_status.new_approval_version}
              </Badge>
            </div>
            <p className="text-small text-foreground leading-relaxed">
              {re_approval_status.reason}
            </p>
            <p className="text-caption text-muted-foreground font-medium">
              Material commercial terms changed during customer negotiation. Approval must be re-executed before contract issuance.
            </p>
          </div>
        </div>
      )}

      {/* Customer Request & Commercial Concession Diffs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Request */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              Customer Request
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/80 text-small italic text-foreground leading-relaxed">
              &ldquo;{customer_request}&rdquo;
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-small">
              {/* Counter Discount */}
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Original Discount
                </span>
                <span className="font-mono text-base font-bold text-foreground">
                  {counter_discount.original_percent}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-warning/30 bg-warning-subtle/10">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-warning block">
                  Customer Requested
                </span>
                <span className="font-mono text-base font-bold text-warning">
                  {counter_discount.requested_percent}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-primary/30 bg-primary-subtle/10">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-primary block">
                  Current Counter
                </span>
                <span className="font-mono text-base font-bold text-primary">
                  {counter_discount.current_counter_percent}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quantity & Price Change */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              Material Term Diffs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-small">
            {quantity_change && (
              <div>
                <span className="text-caption text-muted-foreground block">
                  Quantity Change ({quantity_change.product_name})
                </span>
                <div className="flex items-center gap-2 mt-1 font-mono">
                  <span className="text-muted-foreground line-through">{quantity_change.old_qty}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-bold text-foreground">{quantity_change.new_qty} units</span>
                  <Badge variant="secondary" className="text-[10px] py-0 font-mono">
                    +{quantity_change.delta}
                  </Badge>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border">
              <span className="text-caption text-muted-foreground block">Net Price Change</span>
              <div className="flex items-center gap-2 mt-1 font-mono">
                <span className="text-muted-foreground line-through text-caption">
                  {curSymbol}{price_change.previous_total.toLocaleString()}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-bold text-foreground text-small">
                  {curSymbol}{price_change.new_total.toLocaleString()}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5 block font-mono">
                Delta: +{curSymbol}{price_change.delta.toLocaleString()}
              </span>
            </div>

            <div className="pt-3 border-t border-border">
              <span className="text-caption text-muted-foreground block">Risk Recalculation</span>
              <div className="flex items-center gap-2 mt-1 font-mono">
                <span className="text-muted-foreground">{risk_recalculation.previous_score}</span>
                <ArrowRight className="h-3.5 w-3.5 text-danger" />
                <span className="font-bold text-danger">{risk_recalculation.new_score} / 100</span>
                <Badge variant="danger" className="text-[10px] py-0 font-mono">
                  +{risk_recalculation.new_score - risk_recalculation.previous_score}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version Comparison Table */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
            <GitCompare className="h-4 w-4 text-primary" />
            Version Comparison: Version {version_comparison.base_version} → Version {version_comparison.target_version}
          </CardTitle>
          <Badge variant="outline" className="font-mono text-caption">
            Comprehensive Diff Audit
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-caption text-muted-foreground text-left">
                <th className="py-2.5 px-4 font-semibold">Parameter / Commercial Metric</th>
                <th className="py-2.5 px-4 font-semibold font-mono text-right">
                  v{version_comparison.base_version} (Previous)
                </th>
                <th className="py-2.5 px-4 font-semibold font-mono text-right">
                  v{version_comparison.target_version} (Current)
                </th>
                <th className="py-2.5 px-4 font-semibold text-right">Impact / Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {version_comparison.diffs.map((diff, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{diff.label}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-foreground tabular-nums">
                    {diff.old_value}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-foreground tabular-nums">
                    {diff.new_value}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    <Badge
                      variant={
                        diff.impact_severity === 'critical'
                          ? 'danger'
                          : diff.impact_severity === 'positive'
                          ? 'success'
                          : 'secondary'
                      }
                      className="text-[11px] py-0 font-mono"
                    >
                      {diff.delta}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  )
}
