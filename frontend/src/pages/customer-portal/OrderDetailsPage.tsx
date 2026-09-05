import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Truck, CreditCard, FileText, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { getCustomerOrderDetail, type CustomerOrderDetail } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Modal dialog states for 08.8 Actions
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['customer-order-detail', id],
    queryFn: () => getCustomerOrderDetail(id ?? ''),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const o: CustomerOrderDetail = order ?? {
    id: id || 'ORD-2026-00891',
    order_number: 'ORD-2026-00891',
    status: 'processing',
    order_date: '2026-09-02',
    total: 11660.00,
    items: [],
    fulfillment: { fulfillment_status: 'partially_fulfilled', fulfilled_quantity: 8, backordered_quantity: 2, expected_delivery: '2026-09-12' },
    shipments: [],
    billing: { invoice: 'INV-2026-00412', amount: 11660.00, payment_status: 'paid' },
  }

  const items = o.items ?? []
  const shipments = o.shipments ?? []
  const billing = o.billing ?? { invoice: '—', amount: 0, payment_status: 'pending' }
  const fulfillment = o.fulfillment ?? { fulfillment_status: 'unfulfilled', fulfilled_quantity: 0, backordered_quantity: 0, expected_delivery: '—' }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customer-portal/orders')} aria-label="Back to orders">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{o.order_number}</h1>
          <p className="text-sm text-muted-foreground">Order Details & Fulfillment Tracking</p>
        </div>
      </div>

      {/* Order Header */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order Header
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="mt-1 text-base font-semibold text-foreground">{o.order_number}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge
                  status={
                    o.status === 'delivered'
                      ? 'approved'
                      : o.status === 'shipped'
                      ? 'confirmed'
                      : o.status === 'processing'
                      ? 'pending'
                      : o.status === 'backordered'
                      ? 'negotiation'
                      : 'pending'
                  }
                >
                  {o.status}
                </StatusBadge>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Order Date</p>
              <p className="mt-1 text-sm font-medium text-foreground">{o.order_date}</p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="mt-1 text-lg font-bold text-primary tabular-nums">{formatCurrency(o.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Items</CardTitle>
          <CardDescription>Line items included in this purchase order</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.id || idx}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.product}</p>
                        {item.sku && <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="tabular-nums">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No items" description="No line items found for this order." />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fulfillment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg font-semibold">Fulfillment</CardTitle>
            </div>
            <CardDescription>Fulfillment status and stock allocation info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Fulfillment Status</p>
                <div className="mt-1">
                  <StatusBadge
                    status={
                      fulfillment.fulfillment_status === 'fulfilled'
                        ? 'approved'
                        : fulfillment.fulfillment_status === 'partially_fulfilled'
                        ? 'pending'
                        : 'negotiation'
                    }
                  >
                    {fulfillment.fulfillment_status}
                  </StatusBadge>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Expected Delivery</p>
                <p className="mt-1 text-sm font-medium text-foreground">{fulfillment.expected_delivery}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Fulfilled Quantity</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-foreground">{fulfillment.fulfilled_quantity}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Backordered Quantity</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-warning">{fulfillment.backordered_quantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg font-semibold">Billing</CardTitle>
            </div>
            <CardDescription>Associated invoice and payment status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {billing.invoice && billing.invoice !== '—' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Invoice</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{billing.invoice}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-foreground">{formatCurrency(billing.amount)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <div className="mt-1">
                    <StatusBadge status={billing.payment_status === 'paid' ? 'approved' : 'pending'}>
                      {billing.payment_status}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="No invoice information available." description="Billing details will populate once an invoice is issued." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shipments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Shipments</CardTitle>
              <CardDescription>Carrier tracking and delivery progress</CardDescription>
            </div>
            <Truck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          {shipments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shp) => (
                  <TableRow key={shp.id}>
                    <TableCell className="font-semibold">{shp.shipment}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-primary underline cursor-pointer">
                        {shp.tracking}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={shp.status === 'delivered' ? 'approved' : 'pending'}>
                        {shp.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{shp.eta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="No shipment information available." description="Tracking details will appear here once shipment carrier manifests are generated." />
          )}
        </CardContent>
      </Card>

      {/* 08.8 Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Actions</CardTitle>
          <CardDescription>Access customer-facing shipment and billing documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* View Shipment Action */}
            <Button onClick={() => setShipmentModalOpen(true)}>
              <Truck className="mr-2 h-4 w-4" aria-hidden="true" />
              View Shipment
            </Button>

            {/* View Invoice Action */}
            <Button variant="outline" onClick={() => setInvoiceModalOpen(true)}>
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              View Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Shipment Modal */}
      <Dialog open={shipmentModalOpen} onOpenChange={setShipmentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Shipment Tracking Details
            </DialogTitle>
            <DialogDescription>
              Carrier shipment information for {o.order_number}
            </DialogDescription>
          </DialogHeader>
          {shipments.length > 0 ? (
            <div className="space-y-4 py-2">
              {shipments.map((s, i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{s.shipment}</span>
                    <StatusBadge status={s.status === 'delivered' ? 'approved' : 'pending'}>
                      {s.status}
                    </StatusBadge>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Tracking #:</span> {s.tracking}</p>
                    <p><span className="font-medium text-foreground">Estimated Arrival:</span> {s.eta}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No active shipment manifests associated with this order yet.</p>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setShipmentModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Invoice Modal */}
      <Dialog open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Summary
            </DialogTitle>
            <DialogDescription>
              Billing document for {o.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{billing.invoice}</span>
                <StatusBadge status={billing.payment_status === 'paid' ? 'approved' : 'pending'}>
                  {billing.payment_status}
                </StatusBadge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Amount Due / Paid</p>
                <p className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(billing.amount)}</p>
              </div>
              <div className="pt-2 flex justify-between items-center text-xs text-muted-foreground border-t border-border">
                <span>Issue Date: {o.order_date}</span>
                <span>Terms: Net 30</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
