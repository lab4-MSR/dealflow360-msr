import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Truck,
  Building2,
  Split,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FulfillmentData } from '@/types/quotation'

interface FulfillmentSectionProps {
  fulfillment: FulfillmentData
  currency: string
}

export function FulfillmentSection({ fulfillment, currency }: FulfillmentSectionProps) {
  const {
    inventory_status,
    warehouse_allocation: initialAllocations,
    warehouse_split,
    shipment_count: initialShipmentCount,
    shipping_cost: initialShippingCost,
    fulfilled_quantity,
    ordered_quantity,
    backordered_quantity,
    fulfillment_status,
    is_preview,
  } = fulfillment

  const curSymbol = '₹'

  const [allocations, setAllocations] = useState(initialAllocations)
  const [isAccepted, setIsAccepted] = useState(false)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [editQty, setEditQty] = useState<Record<string, number>>(() =>
    initialAllocations.reduce((acc, a) => ({ ...acc, [a.warehouse_id]: a.allocated_quantity }), {})
  )
  const [consolidateMode, setConsolidateMode] = useState<'split' | 'consolidated'>('split')

  const handleAcceptRecommendation = () => {
    setIsAccepted(true)
    toast.success('Optimized allocation plan accepted and confirmed for order dispatch.')
  }

  const handleOpenOverride = () => {
    setEditQty(
      allocations.reduce((acc, a) => ({ ...acc, [a.warehouse_id]: a.allocated_quantity }), {})
    )
    setOverrideReason('')
    setOverrideModalOpen(true)
  }

  const handleSaveOverride = () => {
    const updated = allocations.map((a) => ({
      ...a,
      allocated_quantity: editQty[a.warehouse_id] ?? a.allocated_quantity,
    }))
    setAllocations(updated)
    setIsAccepted(true)
    setOverrideModalOpen(false)
    toast.success(`Manual warehouse override saved. ${overrideReason ? `Reason: ${overrideReason}` : ''}`)
  }

  const handleConsolidateChoice = (mode: 'split' | 'consolidated') => {
    setConsolidateMode(mode)
    if (mode === 'consolidated') {
      toast.success('Consolidated order: dispatch held to ship as 1 single shipment upon replenishment.')
    } else {
      toast.info('Split fulfillment active: immediate partial shipments authorized.')
    }
  }

  return (
    <section id="fulfillment" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Fulfillment
          </h2>
          {is_preview && (
            <Badge variant="outline" className="text-caption font-mono border-warning/40 text-warning">
              Operational Preview Snapshot
            </Badge>
          )}
          {isAccepted && (
            <Badge variant="success" className="text-caption gap-1">
              <CheckCircle2 className="h-3 w-3" /> Allocation Confirmed
            </Badge>
          )}
        </div>
        <StatusBadge status={fulfillment_status as never} className="capitalize text-caption">
          {fulfillment_status.replace(/_/g, ' ')}
        </StatusBadge>
      </div>

      {is_preview && (
        <p className="text-caption text-muted-foreground">
          <strong>Note:</strong> Inventory shown is an operational preview snapshot calculated across warehouse hubs.
          It is not a permanent stock lock until order confirmation is recorded.
        </p>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Inventory Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Inventory Status
            </span>
            <div className="mt-2">
              <Badge
                variant={
                  inventory_status === 'in_stock'
                    ? 'success'
                    : inventory_status === 'partial_stock'
                    ? 'warning'
                    : 'danger'
                }
                className="capitalize text-small font-semibold"
              >
                {inventory_status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              {inventory_status === 'partial_stock' ? 'Requires multi-hub split' : 'Single hub supply'}
            </span>
          </CardContent>
        </Card>

        {/* 2. Shipment Count & Shipping Cost */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Shipment Count & Freight
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-foreground">
                {consolidateMode === 'consolidated' ? 1 : initialShipmentCount}{' '}
                {consolidateMode === 'consolidated' || initialShipmentCount === 1 ? 'Shipment' : 'Shipments'}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Freight Cost: {curSymbol}
              {consolidateMode === 'consolidated'
                ? Math.round(initialShippingCost * 0.7).toLocaleString()
                : initialShippingCost.toLocaleString()}
            </span>
          </CardContent>
        </Card>

        {/* 3. Fulfilled Quantity */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Fulfilled Quantity
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {fulfilled_quantity} / {ordered_quantity} units
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {fulfilled_quantity === 0 ? 'Awaiting customer confirmation' : 'In transit'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Backordered Quantity */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Backordered Quantity
            </span>
            <div className="mt-1">
              <span
                className={`text-xl font-bold font-mono ${
                  backordered_quantity > 0 ? 'text-danger' : 'text-success'
                }`}
              >
                {backordered_quantity} units
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {backordered_quantity === 0 ? 'Zero backorder expected' : 'Production lead time apply'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Allocation Table & Warehouse Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Warehouse Allocation Table */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Warehouse Allocation Plan
              </CardTitle>
              <span className="text-caption text-muted-foreground font-mono">
                Optimized by Inventory & Proximity Engine
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isAccepted ? 'outline' : 'default'}
                size="sm"
                onClick={handleAcceptRecommendation}
                className="h-7 text-xs gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{isAccepted ? 'Accepted' : 'Accept Recommendation'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenOverride}
                className="h-7 text-xs gap-1.5"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Manual Override</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-caption text-muted-foreground text-left">
                  <th className="py-2.5 px-4 font-semibold">Warehouse / Facility</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Allocated Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Available Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Shipping Cost</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Expected Delivery</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocations.map((alloc) => (
                  <tr key={alloc.warehouse_id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <p className="font-semibold text-small leading-tight">{alloc.warehouse_name}</p>
                      <span className="font-mono text-caption text-muted-foreground">{alloc.warehouse_code}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground tabular-nums">
                      {alloc.allocated_quantity} units
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground tabular-nums">
                      {alloc.available_quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground tabular-nums">
                      {curSymbol}{alloc.shipping_cost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-caption text-foreground">
                      {alloc.priority === 1 ? '1-2 business days' : '3-4 business days'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-caption">
                      <Badge variant="outline" className="text-[10px] py-0">
                        Priority {alloc.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Warehouse Split Explanation */}
        <Card className="shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
                <Split className="h-4 w-4 text-primary" />
                Warehouse Split Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-small">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Multi-Hub Split:</span>
                <Badge variant={warehouse_split.is_split ? 'warning' : 'secondary'} className="capitalize">
                  {warehouse_split.is_split ? 'Split Active' : 'Single Shipment'}
                </Badge>
              </div>

              {warehouse_split.is_split && (
                <div className="p-2.5 rounded-lg border border-warning/30 bg-warning/5 space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-foreground">
                    <span>Extra Freight from Split:</span>
                    <span className="font-mono font-bold text-warning">+{curSymbol}1,250</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    Split across 2 distinct dispatch centers to expedite delivery.
                  </span>
                </div>
              )}

              {warehouse_split.is_split && (
                <div className="space-y-2 pt-2 border-t border-border/80">
                  <span className="text-caption font-semibold text-foreground block">
                    Distribution by Hub:
                  </span>
                  <div className="space-y-1 text-caption font-mono">
                    {warehouse_split.split_details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/40">
                        <span className="text-foreground">{detail.warehouse_name}</span>
                        <span className="font-bold text-foreground">{detail.units} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border/80">
                <span className="text-caption uppercase tracking-wider font-semibold text-muted-foreground block">
                  Split Rationale
                </span>
                <p className="text-caption text-foreground mt-1 leading-relaxed">
                  {warehouse_split.split_reason}
                </p>
              </div>
            </CardContent>
          </div>

          {/* Consolidation Options (B6 requirement) */}
          <div className="p-4 border-t border-border bg-muted/10 space-y-2">
            <span className="text-[11px] font-semibold text-foreground block uppercase tracking-wider">
              Dispatch Consolidation Options:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={consolidateMode === 'consolidated' ? 'default' : 'outline'}
                onClick={() => handleConsolidateChoice('consolidated')}
                className="text-[11px] h-8 justify-center"
              >
                Wait & Ship Together
              </Button>
              <Button
                size="sm"
                variant={consolidateMode === 'split' ? 'default' : 'outline'}
                onClick={() => handleConsolidateChoice('split')}
                className="text-[11px] h-8 justify-center"
              >
                Split Ship Immediately
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {consolidateMode === 'consolidated'
                ? 'Saves freight cost by holding items until stock replenishes in central hub.'
                : 'Prioritizes delivery speed by dispatching stock immediately from closest facilities.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Manual Override Modal Dialog */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Allocation Override</DialogTitle>
            <DialogDescription>
              Adjust unit quantities assigned to each warehouse facility. Total allocated must match ordered items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {allocations.map((alloc) => (
              <div key={alloc.warehouse_id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">{alloc.warehouse_name}</p>
                  <p className="text-[11px] text-muted-foreground">Available: {alloc.available_quantity} units</p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min={0}
                    max={alloc.available_quantity}
                    value={editQty[alloc.warehouse_id] ?? 0}
                    onChange={(e) =>
                      setEditQty({ ...editQty, [alloc.warehouse_id]: Number(e.target.value) || 0 })
                    }
                    className="h-8 text-xs font-mono text-right"
                  />
                </div>
              </div>
            ))}

            <div className="space-y-1.5 pt-2 border-t border-border">
              <Label className="text-xs">Override Rationale / Authorization Note</Label>
              <Input
                placeholder="e.g. Customer requested single local batch delivery"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveOverride}>
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

