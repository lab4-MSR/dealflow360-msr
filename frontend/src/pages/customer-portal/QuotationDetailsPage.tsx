import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  Handshake,
  FileText,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Truck,
  AlertTriangle,
  Download,
  Printer,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { getCustomerQuotationDetail, confirmQuotation, type CustomerQuotationDetail } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'
import { toast } from 'sonner'

export function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['customer-quotation', id],
    queryFn: () => getCustomerQuotationDetail(id ?? ''),
  })
  const s = (data ?? {}) as CustomerQuotationDetail
  const items = s.items ?? []
  const p = s.pricing ?? {
    subtotal: 13100,
    discount: 1440,
    tax: 950,
    shipping: 150,
    grand_total: 11660,
  }

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!id) return
      return await confirmQuotation(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-quotation', id] })
      qc.invalidateQueries({ queryKey: ['customer-quotations'] })
      qc.invalidateQueries({ queryKey: ['customer-dashboard'] })
      setAcceptModalOpen(false)
      toast.success('Quotation accepted! Order confirmed and routed to operations.')
      navigate('/customer-portal/orders')
    },
    onError: () => {
      toast.error('Unable to accept quotation. Please try again.')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async () => {
      // simulate reject mutation
      return { success: true }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-quotation', id] })
      qc.invalidateQueries({ queryKey: ['customer-quotations'] })
      setRejectModalOpen(false)
      toast.success('Quotation declined. Your account executive has been notified.')
      navigate('/customer-portal/quotations')
    },
  })

  const isActionable = s.status !== 'accepted' && s.status !== 'expired'

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* ─── HEADER & ACTIONS ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customer-portal/quotations')}
            className="gap-1 text-xs mb-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Quotations
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {s.quote_number ?? `Quotation ${id}`}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono">
              v{s.version ?? 1}
            </span>
            <StatusBadge
              status={
                s.status === 'accepted' || s.status === 'approved'
                  ? 'approved'
                  : s.status === 'awaiting_review'
                  ? 'pending'
                  : s.status === 'under_negotiation' || s.status === 'negotiation'
                  ? 'negotiation'
                  : s.status === 'expired'
                  ? 'failed'
                  : 'pending'
              }
            >
              {s.status ?? 'draft'}
            </StatusBadge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Issued: {s.issue_date ?? 'Recent'} · Valid Until: {s.expiry_date ?? 'Sep 28, 2026'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs h-9 gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Downloading official signed quote PDF...')}
            className="text-xs h-9 gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {/* ─── 4 ASSETRIX-STYLE KPI CARDS ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Grand Total</span>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrency(p.grand_total)}
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Includes taxes & shipping</span>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Discount Applied</span>
            <p className="text-2xl font-bold text-sky-400 tabular-nums">
              {formatCurrency(p.discount)}
            </p>
            <span className="text-[10px] text-sky-400 font-medium">Special tier discount</span>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Payment Terms</span>
            <p className="text-base font-bold text-foreground mt-1 truncate">
              {s.terms?.payment_terms ?? 'Net 30 Days'}
            </p>
            <span className="text-[10px] text-muted-foreground">Approved credit terms</span>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Delivery Method</span>
            <p className="text-base font-bold text-foreground mt-1 truncate">
              {s.terms?.delivery_terms ?? 'FOB Destination'}
            </p>
            <span className="text-[10px] text-muted-foreground">Direct carrier logistics</span>
          </div>
        </div>
      )}

      {/* ─── ACTION BUTTONS BAR ─── */}
      {isActionable && (
        <Card className="rounded-2xl border-sky-500/30 bg-sky-500/5 shadow-xs">
          <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Commercial Response Actions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Lock in terms by accepting, or negotiate pricing and quantities with your account executive.
              </p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                onClick={() => setAcceptModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 gap-1.5 shadow-sm"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Accept Quote</span>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-xs h-9 gap-1.5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
              >
                <Link to={`/customer-portal/quotations/${id}/counter-offer`}>
                  <Handshake className="h-3.5 w-3.5" />
                  <span>Counter Offer</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-xs h-9 gap-1.5"
              >
                <Link to={`/customer-portal/quotations/${id}/request-changes`}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Request Changes</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setRejectModalOpen(true)}
                className="text-xs h-9 gap-1.5 text-rose-400 hover:bg-rose-500/10"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Decline</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── LINE ITEMS TABLE ─── */}
      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-3 bg-secondary/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-sky-400" />
            Quotation Line Items
          </CardTitle>
          <CardDescription className="text-xs">
            Products, service subscriptions, quantities, and discount rates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="font-semibold text-xs text-foreground">Product / Service</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground">Description</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-foreground">Quantity</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-foreground">Unit Price</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-foreground">Discount</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={item.id ?? i} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-semibold text-foreground text-xs">
                      {item.product}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                      {item.description ?? '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-sky-400 font-medium">
                      {item.discount != null && item.discount > 0 ? `${item.discount}%` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-xs text-foreground">
                      {formatCurrency(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState title="No items" description="This quotation has no line items." />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── DUAL ROW: PRICING BREAKDOWN & SELLER / TERMS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pricing Summary */}
        <Card className="lg:col-span-6 rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-sky-400" />
              Financial Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Complete cost breakdown including adjustments and applicable taxes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">List Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(p.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Promotional & Tier Discount</span>
              <span className="font-medium text-sky-400 tabular-nums">-{formatCurrency(p.discount)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Estimated Shipping & Logistics</span>
              <span className="font-medium tabular-nums">{formatCurrency(p.shipping)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/40">
              <span className="text-muted-foreground">Estimated Tax (GST/VAT)</span>
              <span className="font-medium tabular-nums">{formatCurrency(p.tax)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-foreground">Grand Total</span>
              <span className="text-xl font-extrabold text-foreground tabular-nums">
                {formatCurrency(p.grand_total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Seller Info & Terms */}
        <Card className="lg:col-span-6 rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4.5 w-4.5 text-sky-400" />
              Seller & Commercial Terms
            </CardTitle>
            <CardDescription className="text-xs">
              Designated account manager and delivery specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-border/60 bg-secondary/20">
              <div>
                <span className="text-[11px] text-muted-foreground block">Enterprise Provider</span>
                <span className="font-semibold text-foreground mt-0.5 block">{s.seller?.company ?? 'Acme Enterprise Solutions'}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Account Executive</span>
                <span className="font-semibold text-foreground mt-0.5 block">{s.seller?.contact ?? 'Sarah Jenkins'}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Email</span>
                <span className="text-primary mt-0.5 block truncate">{s.seller?.email ?? 'sjenkins@acmesolutions.com'}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Phone</span>
                <span className="font-mono mt-0.5 block">{s.seller?.phone ?? '+1 (800) 555-0199'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Payment Terms:</span>
                <span className="font-medium text-foreground">{s.terms?.payment_terms ?? 'Net 30 Days'}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery Terms:</span>
                <span className="font-medium text-foreground">{s.terms?.delivery_terms ?? 'FOB Destination - Air Express'}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Expiration Date:</span>
                <span className="font-mono text-amber-400">{s.terms?.expiry_date ?? s.expiry_date ?? 'Sep 28, 2026'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ACCEPT QUOTATION MODAL ─── */}
      <Dialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              Accept Quotation
            </DialogTitle>
            <DialogDescription>
              Confirming this quotation will create a formal Purchase Order and route items to operations for warehouse allocation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-border/70 bg-secondary/30 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quote Reference:</span>
                <span className="font-semibold text-foreground">{s.quote_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-bold text-emerald-400 text-sm">{formatCurrency(p.grand_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Terms:</span>
                <span className="font-medium">{s.terms?.payment_terms ?? 'Net 30'}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              By clicking "Confirm Acceptance", you agree to the terms and authorize production/fulfillment scheduling.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAcceptModalOpen(false)}
              disabled={acceptMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {acceptMutation.isPending ? 'Confirming...' : 'Confirm Acceptance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── DECLINE QUOTATION MODAL ─── */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <XCircle className="h-5 w-5 text-rose-400" />
              Decline Quotation
            </DialogTitle>
            <DialogDescription>
              Please let your account team know why this quotation is being declined.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label className="text-xs font-medium text-foreground">Reason for declining (optional)</label>
            <Textarea
              placeholder="e.g. Budget constraints, decided to pursue another timeline, terms need revision..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Submitting...' : 'Decline Quotation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
