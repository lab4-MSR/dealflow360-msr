import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Truck,
  Building2,
  Layers,
  Package,
  AlertCircle,
  Clock,
  Split,
  ShieldAlert,
} from 'lucide-react'
import type { FulfillmentData } from '@/types/quotation'

interface FulfillmentSectionProps {
  fulfillment: FulfillmentData
  currency: string
}

export function FulfillmentSection({ fulfillment, currency }: FulfillmentSectionProps) {
  const {
    inventory_status,
    warehouse_allocation,
    warehouse_split,
    shipment_count,
    shipping_cost,
    fulfilled_quantity,
    ordered_quantity,
    backordered_quantity,
    fulfillment_status,
    is_preview,
  } = fulfillment

  const curSymbol = currency === 'INR' ? '₹' : '$'

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
                {shipment_count} {shipment_count === 1 ? 'Shipment' : 'Shipments'}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block font-mono">
              Freight Cost: {curSymbol}{shipping_cost.toLocaleString()}
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
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Warehouse Allocation Plan
            </CardTitle>
            <span className="text-caption text-muted-foreground font-mono">
              Optimized by Inventory & Proximity Engine
            </span>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-caption text-muted-foreground text-left">
                  <th className="py-2.5 px-4 font-semibold">Warehouse / Facility</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Allocated Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Available Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Shipping Cost</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {warehouse_allocation.map((alloc) => (
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
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Split className="h-4 w-4 text-primary" />
              Warehouse Split Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 text-small">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Multi-Hub Split Required:</span>
              <Badge variant={warehouse_split.is_split ? 'warning' : 'secondary'} className="capitalize">
                {warehouse_split.is_split ? 'Split Active' : 'Single Shipment'}
              </Badge>
            </div>

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
        </Card>
      </div>
    </section>
  )
}
