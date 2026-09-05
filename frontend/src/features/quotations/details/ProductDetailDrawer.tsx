import { Drawer } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Copy, Check, DollarSign, ShieldAlert, Sparkles, Layers } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { QuotationLineItem } from '@/types/quotation'

interface ProductDetailDrawerProps {
  line: QuotationLineItem | null
  currency: string
  open: boolean
  onClose: () => void
  canViewCost?: boolean
  canViewMargin?: boolean
}

export function ProductDetailDrawer({
  line,
  currency,
  open,
  onClose,
  canViewCost = true,
  canViewMargin = true,
}: ProductDetailDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!line) return null

  const handleCopySku = () => {
    navigator.clipboard.writeText(line.sku)
    setCopied(true)
    toast.success(`SKU ${line.sku} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  const curSymbol = '₹'

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={line.product_name}
      description="Detailed product line information including pricing, availability, and financial margins."
      className="max-w-xl"
    >
      <div className="space-y-5">
        <div className="text-left border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-foreground">
                  {line.product_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-caption text-muted-foreground">{line.sku}</span>
                  <button
                    onClick={handleCopySku}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy SKU"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <Badge variant="outline" className="text-caption">
                    {line.category}
                  </Badge>
                  {line.is_recurring && (
                    <Badge variant="secondary" className="text-caption">
                      Recurring ({line.billing_cycle || 'Monthly'})
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant={
                line.inventory_status === 'in_stock'
                  ? 'success'
                  : line.inventory_status === 'partial_stock'
                  ? 'warning'
                  : 'danger'
              }
              className="capitalize text-caption"
            >
              {line.inventory_status ? line.inventory_status.replace(/_/g, ' ') : 'In Stock'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4 text-small">
          {/* Commercial & Pricing Breakdown */}
          <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/20">
            <h4 className="text-caption uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-primary" /> Commercial & Pricing Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3 pt-2 text-small">
              <div>
                <span className="text-caption text-muted-foreground block">Unit Price ({line.price_type})</span>
                <span className="font-mono font-medium">
                  {curSymbol}
                  {line.unit_price.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Quantity</span>
                <span className="font-mono font-medium">{line.quantity} units</span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Applied Line Discount</span>
                <span className="font-medium text-warning font-mono">
                  {line.discount_percent}% ({curSymbol}{line.discount_amount.toLocaleString()})
                </span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Net Line Price</span>
                <span className="font-mono font-semibold">
                  {curSymbol}
                  {line.net_price.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Tax ({line.tax_rate}%)</span>
                <span className="font-mono">
                  {curSymbol}
                  {line.tax_amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Line Total (Inc. Tax)</span>
                <span className="font-mono font-bold text-foreground">
                  {curSymbol}
                  {line.line_total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Margin Context (Protected) */}
          {canViewMargin && (
            <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/10">
              <h4 className="text-caption uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-warning" /> Internal Financial Intelligence (Sales Restricted)
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {canViewCost && line.cost !== undefined && (
                  <div>
                    <span className="text-caption text-muted-foreground block">COGS / Unit Cost</span>
                    <span className="font-mono font-medium">
                      {curSymbol}
                      {line.cost.toLocaleString()}
                    </span>
                  </div>
                )}
                {line.margin_percent !== undefined && (
                  <div>
                    <span className="text-caption text-muted-foreground block">Gross Margin %</span>
                    <span
                      className={`font-mono font-bold ${
                        line.margin_percent < 25 ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {line.margin_percent}%
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Internal margin data strictly controlled by backend RBAC. Never exposed to customer-facing views.
              </p>
            </div>
          )}

          {/* Availability & Recommendation */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <h4 className="text-caption uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" /> Inventory & Recommendation Context
            </h4>
            <div className="text-small space-y-1 pt-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Immediate Stock:</span>
                <span className="font-mono font-medium">
                  {line.available_stock !== undefined ? `${line.available_stock} units` : 'Available'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recommendation Linkage:</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-intelligence" /> Auto-governed bundle item
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-row justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
