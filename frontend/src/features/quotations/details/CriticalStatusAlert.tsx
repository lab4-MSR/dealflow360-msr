import { ShieldAlert, AlertTriangle, Clock, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { QuotationCompleteDetails } from '@/types/quotation'

interface CriticalStatusAlertProps {
  quote: QuotationCompleteDetails
  onRefresh?: () => void
}

export function CriticalStatusAlert({ quote, onRefresh }: CriticalStatusAlertProps) {
  const { negotiation, margin, discount_analysis, overview } = quote

  const isApprovalInvalidated = negotiation.re_approval_status.required
  const isMarginCritical = margin.margin_impact === 'critical'
  const isExcessDiscount = discount_analysis.excess_discount > 0

  if (!isApprovalInvalidated && !isMarginCritical && !isExcessDiscount && !overview.is_expired) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* 1. Approval Invalidation & Version Bump Alert */}
      {isApprovalInvalidated && (
        <div className="rounded-xl border border-warning/40 bg-warning-subtle/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-small text-warning">
                  APPROVAL RE-EVALUATION REQUIRED
                </span>
                <Badge variant="warning" className="font-mono text-[10px] py-0 px-1.5">
                  Version {quote.version}
                </Badge>
              </div>
              <p className="text-small text-foreground mt-0.5 leading-relaxed">
                Previous approval applied to Version {negotiation.re_approval_status.invalidated_version}.
                Version {quote.version} contains material commercial changes (Discount: {discount_analysis.requested_discount}%, Margin: {margin.margin_percent}%).
                Prior approval has been automatically invalidated by the governance engine.
              </p>
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="self-start sm:self-center gap-1.5 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-check State</span>
            </Button>
          )}
        </div>
      )}

      {/* 2. Margin Floor Violation Warning */}
      {isMarginCritical && (
        <div className="rounded-xl border border-danger/30 bg-danger-subtle/20 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
            <span className="text-small text-foreground">
              <strong className="text-danger font-semibold">Margin Violation: </strong>
              Projected gross margin ({margin.margin_percent}%) is below the minimum required policy threshold ({margin.minimum_margin}%). Requires Finance exception approval.
            </span>
          </div>
          <Badge variant="danger" className="text-caption font-mono shrink-0">
            -{margin.minimum_margin - margin.margin_percent} pp below floor
          </Badge>
        </div>
      )}
    </div>
  )
}
