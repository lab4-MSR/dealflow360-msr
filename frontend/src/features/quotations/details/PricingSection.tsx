import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShieldCheck, HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { QuotationPricingSummary } from '@/types/quotation'

interface PricingSectionProps {
  pricing: QuotationPricingSummary
}

export function PricingSection({ pricing }: PricingSectionProps) {
  const curSymbol = '₹'

  return (
    <section id="pricing" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Pricing
        </h2>
        <span className="text-caption text-muted-foreground font-mono">
          Authoritative Financial Summary (INR)
        </span>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="py-3 px-5 bg-muted/20 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-small font-semibold flex items-center gap-2">
            Commercial Breakdown & Net Total
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Pricing details help" className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-caption">
                All pricing calculations are authoritative from the Quotation Pricing Engine. Float rounding differences are eliminated server-side.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-xl ml-auto space-y-2.5 font-mono text-small">
            {/* 1. Subtotal */}
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-sans text-small">Subtotal (Gross List Value)</span>
              <span className="font-semibold text-foreground tabular-nums">
                {curSymbol}
                {pricing.subtotal.toLocaleString()}
              </span>
            </div>

            {/* 2. Line Discount */}
            <div className="flex justify-between items-center py-1 text-warning">
              <span className="font-sans text-small flex items-center gap-1.5">
                <span>Line Discount Total</span>
              </span>
              <span className="font-semibold tabular-nums">
                -{curSymbol}
                {pricing.line_discounts_total.toLocaleString()}
              </span>
            </div>

            {/* 3. Order Discount */}
            <div className="flex justify-between items-center py-1 text-warning">
              <span className="font-sans text-small">Order-Level Discount</span>
              <span className="font-semibold tabular-nums">
                -{curSymbol}
                {pricing.order_discount.toLocaleString()}
              </span>
            </div>

            {/* 4. Shipping */}
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-sans text-small">Shipping & Freight Handling</span>
              <span className="text-foreground tabular-nums">
                {curSymbol}
                {pricing.shipping.toLocaleString()}
              </span>
            </div>

            {/* 5. Tax */}
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-sans text-small">Applicable GST / VAT (18%)</span>
              <span className="text-foreground tabular-nums">
                {curSymbol}
                {pricing.tax.toLocaleString()}
              </span>
            </div>

            {/* 6. Grand Total */}
            <div className="border-t-2 border-border pt-3 mt-2 flex justify-between items-baseline">
              <div>
                <span className="font-sans font-bold text-base text-foreground block">Grand Total</span>
                <span className="text-[11px] font-sans text-muted-foreground">
                  Final net payable in INR
                </span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary tabular-nums">
                {curSymbol}
                {pricing.grand_total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-caption text-muted-foreground">
            <span className="flex items-center gap-1.5 text-success font-medium">
              <ShieldCheck className="h-4 w-4" />
              Reconciled with Deal & Billing Models
            </span>
            <span>Tax calculated on post-discount net value</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
