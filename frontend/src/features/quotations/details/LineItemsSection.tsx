import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Copy, Check, Info, ArrowUpRight } from 'lucide-react'
import { ProductDetailDrawer } from './ProductDetailDrawer'
import { toast } from 'sonner'
import type { QuotationLineItem } from '@/types/quotation'

interface LineItemsSectionProps {
  lines: QuotationLineItem[]
  currency: string
  canViewCost?: boolean
  canViewMargin?: boolean
}

export function LineItemsSection({
  lines,
  currency,
  canViewCost = true,
  canViewMargin = true,
}: LineItemsSectionProps) {
  const [selectedLine, setSelectedLine] = useState<QuotationLineItem | null>(null)
  const [copiedSku, setCopiedSku] = useState<string | null>(null)

  const handleCopySku = (sku: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(sku)
    setCopiedSku(sku)
    toast.success(`SKU ${sku} copied`)
    setTimeout(() => setCopiedSku(null), 2000)
  }

  const curSymbol = '₹'

  return (
    <section id="line-items" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Line Items
        </h2>
        <span className="text-caption text-muted-foreground">
          {lines.length} {lines.length === 1 ? 'item' : 'items'} • Click any row to inspect commercial parameters & margin
        </span>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-small font-semibold flex items-center gap-2">
            Enterprise Product Schedule
          </CardTitle>
          <span className="text-caption text-muted-foreground font-mono">
            Authoritative Server Calculation
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead className="w-[280px]">Product</TableHead>
                  <TableHead className="w-[140px]">SKU</TableHead>
                  <TableHead className="text-right w-[80px]">Qty</TableHead>
                  <TableHead className="text-right w-[120px]">Unit Price</TableHead>
                  <TableHead className="text-right w-[140px]">Line Discount</TableHead>
                  <TableHead className="text-right w-[130px]">Net Price</TableHead>
                  <TableHead className="text-right w-[110px]">Tax</TableHead>
                  <TableHead className="text-right w-[140px]">Line Total</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow
                    key={line.id}
                    onClick={() => setSelectedLine(line)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  >
                    {/* Product */}
                    <TableCell className="font-medium text-foreground">
                      <div>
                        <p className="font-semibold text-small leading-tight text-foreground group-hover:text-primary transition-colors">
                          {line.product_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-caption text-muted-foreground">{line.category}</span>
                          {line.is_recurring && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1 font-mono">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* SKU */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1 font-mono text-caption text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/60">
                        <span>{line.sku}</span>
                        <button
                          onClick={(e) => handleCopySku(line.sku, e)}
                          className="hover:text-foreground p-0.5 rounded"
                          title="Copy SKU"
                        >
                          {copiedSku === line.sku ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-right font-mono font-medium tabular-nums">
                      {line.quantity}
                    </TableCell>

                    {/* Unit Price */}
                    <TableCell className="text-right font-mono tabular-nums text-foreground">
                      <div>
                        <span>
                          {curSymbol}
                          {line.unit_price.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-muted-foreground uppercase font-sans">
                          {line.price_type}
                        </span>
                      </div>
                    </TableCell>

                    {/* Line Discount */}
                    <TableCell className="text-right font-mono tabular-nums">
                      <div>
                        <span
                          className={`font-semibold ${
                            line.discount_percent > 10 ? 'text-warning font-bold' : 'text-foreground'
                          }`}
                        >
                          {line.discount_percent}%
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          -{curSymbol}
                          {line.discount_amount.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>

                    {/* Net Price */}
                    <TableCell className="text-right font-mono font-medium tabular-nums text-foreground">
                      {curSymbol}
                      {line.net_price.toLocaleString()}
                    </TableCell>

                    {/* Tax */}
                    <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                      <div>
                        <span>
                          {curSymbol}
                          {line.tax_amount.toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-muted-foreground font-sans">
                          ({line.tax_rate}%)
                        </span>
                      </div>
                    </TableCell>

                    {/* Line Total */}
                    <TableCell className="text-right font-mono font-bold tabular-nums text-foreground text-small">
                      {curSymbol}
                      {line.line_total.toLocaleString()}
                    </TableCell>

                    {/* Action icon */}
                    <TableCell className="text-right">
                      <Info className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors inline" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile / Tablet Stacked Cards */}
          <div className="md:hidden divide-y divide-border p-3 space-y-3">
            {lines.map((line) => (
              <div
                key={line.id}
                onClick={() => setSelectedLine(line)}
                className="rounded-lg border border-border p-3.5 space-y-2.5 bg-card hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-small text-foreground">{line.product_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-caption text-muted-foreground">{line.sku}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1">
                        {line.category}
                      </Badge>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-foreground text-small">
                    {curSymbol}
                    {line.line_total.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-caption pt-2 border-t border-border/60">
                  <div>
                    <span className="text-muted-foreground">Qty: </span>
                    <span className="font-mono font-medium">{line.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Unit: </span>
                    <span className="font-mono">
                      {curSymbol}
                      {line.unit_price.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discount: </span>
                    <span className="font-mono font-medium text-warning">{line.discount_percent}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Net: </span>
                    <span className="font-mono font-medium">
                      {curSymbol}
                      {line.net_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Drawer */}
      <ProductDetailDrawer
        line={selectedLine}
        currency={currency}
        open={Boolean(selectedLine)}
        onClose={() => setSelectedLine(null)}
        canViewCost={canViewCost}
        canViewMargin={canViewMargin}
      />
    </section>
  )
}
