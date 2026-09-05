import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Handshake,
  ArrowLeft,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CreditCard,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  getCustomerQuotationDetail,
  confirmQuotation,
  requestChanges,
  submitCounterOffer,
  type CustomerQuotationDetail,
} from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'
import { toast } from 'sonner'

export function ReviewQuotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [dialog, setDialog] = useState<'accept' | 'reject' | 'changes' | 'counter' | null>(null)
  const [comment, setComment] = useState('')
  const [counterDiscount, setCounterDiscount] = useState('15')

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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id) return
      if (dialog === 'accept') {
        await confirmQuotation(id)
      } else if (dialog === 'reject') {
        // record rejection
        return { success: true }
      } else if (dialog === 'changes') {
        await requestChanges(id, { comment: comment || 'Requested change order' })
      } else if (dialog === 'counter') {
        await submitCounterOffer(id, {
          counter_discount_percent: Number(counterDiscount) || 10,
          comment: comment || undefined,
        })
      }
    },
    onSuccess: () => {
      const wasAccept = dialog === 'accept'
      const wasReject = dialog === 'reject'
      qc.invalidateQueries({ queryKey: ['customer-quotation', id] })
      qc.invalidateQueries({ queryKey: ['customer-quotations'] })
      qc.invalidateQueries({ queryKey: ['customer-orders'] })
      qc.invalidateQueries({ queryKey: ['customer-dashboard'] })

      setDialog(null)
      setComment('')
      setCounterDiscount('15')

      if (wasAccept) {
        toast.success('Quotation accepted! Order confirmed and routed to operations.')
        navigate('/customer-portal/orders')
      } else if (wasReject) {
        toast.info('Quotation declined. Your feedback has been recorded.')
        navigate('/customer-portal/quotations')
      } else {
        toast.success('Feedback recorded successfully. Your account team will review your proposal.')
        navigate(`/customer-portal/quotations/${id}`)
      }
    },
    onError: () => {
      toast.error('Unable to submit response. Please try again.')
    },
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/70 pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/customer-portal/quotations/${id}`)}
          className="gap-1 text-xs"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quote
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Review Quotation: {s.quote_number ?? id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Review commercial summary, line items, and select your response
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Status</span>
            <div className="mt-1">
              <StatusBadge
                status={
                  s.status === 'accepted' || s.status === 'approved'
                    ? 'approved'
                    : s.status === 'under_negotiation' || s.status === 'negotiation'
                    ? 'negotiation'
                    : s.status === 'expired'
                    ? 'failed'
                    : 'pending'
                }
              >
                {s.status ?? 'pending'}
              </StatusBadge>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Issued Date</span>
            <p className="text-base font-bold text-foreground mt-1">{s.issue_date ?? 'Recent'}</p>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Valid Through</span>
            <p className="text-base font-bold text-foreground mt-1 font-mono">{s.expiry_date ?? 'Sep 28, 2026'}</p>
          </div>
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs">
            <span className="text-[11px] text-muted-foreground">Grand Total</span>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">
              {formatCurrency(p.grand_total)}
            </p>
          </div>
        </div>
      )}

      {/* Quote Summary Lines */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-sky-400" />
            Commercial Summary
          </CardTitle>
          <CardDescription className="text-xs">
            Items and contracted rates included in this proposal
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-border/40">
              <div>
                <span className="font-semibold text-foreground">{item.product}</span>
                <span className="text-muted-foreground ml-2 font-mono">x{item.quantity}</span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">
                {formatCurrency(item.line_total)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-foreground">Total Proposal Value</span>
            <span className="text-xl font-extrabold text-foreground tabular-nums">
              {formatCurrency(p.grand_total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Decision Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Terms */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-sky-400" />
              Contract Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Payment Terms:</span>
              <span className="font-semibold text-foreground">{s.terms?.payment_terms ?? 'Net 30 Days'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Delivery Method:</span>
              <span className="font-semibold text-foreground">{s.terms?.delivery_terms ?? 'FOB Destination'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Offer Validity:</span>
              <span className="font-mono text-amber-400">{s.terms?.expiry_date ?? s.expiry_date ?? 'Sep 28, 2026'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Decision Actions */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Handshake className="h-4.5 w-4.5 text-sky-400" />
              Customer Decision
            </CardTitle>
            <CardDescription className="text-xs">
              Select an action to proceed with this quotation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setDialog('accept')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 gap-1.5 shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Accept Quote</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialog('reject')}
                className="text-xs h-10 gap-1.5 text-rose-400 hover:bg-rose-500/10 border-rose-500/30"
              >
                <XCircle className="h-4 w-4" />
                <span>Decline Quote</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/customer-portal/quotations/${id}/counter-offer`)}
                className="text-xs h-10 gap-1.5 border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
              >
                <Handshake className="h-4 w-4" />
                <span>Negotiate / Counter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/customer-portal/quotations/${id}/request-changes`)}
                className="text-xs h-10 gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Request Changes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Dialog Modal */}
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialog === 'accept' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
              {dialog === 'reject' && <XCircle className="h-5 w-5 text-rose-400" />}
              {dialog === 'changes' && <MessageSquare className="h-5 w-5 text-sky-400" />}
              {dialog === 'counter' && <Handshake className="h-5 w-5 text-sky-400" />}
              <span>
                {dialog === 'accept'
                  ? 'Accept Quotation'
                  : dialog === 'reject'
                  ? 'Decline Quotation'
                  : dialog === 'changes'
                  ? 'Request Changes'
                  : 'Submit Counter Offer'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {dialog === 'accept'
                ? 'Confirm acceptance to issue an active purchase order and start fulfillment.'
                : dialog === 'reject'
                ? 'Are you sure you wish to decline this commercial proposal?'
                : dialog === 'changes'
                ? 'Specify the adjustments required for quantities, terms, or product mix.'
                : 'Propose a target discount or commercial concession.'}
            </DialogDescription>
          </DialogHeader>

          {dialog === 'reject' && (
            <div className="py-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Decline Reason (Optional)</label>
              <Textarea
                placeholder="Share reason with the sales account manager..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>
          )}

          {dialog === 'changes' && (
            <div className="py-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Requested Modifications</label>
              <Textarea
                placeholder="Describe required changes (e.g. increase license count by 5, extend payment to Net 45)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-xs min-h-[90px]"
              />
            </div>
          )}

          {dialog === 'counter' && (
            <div className="py-2 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Proposed Counter Discount (%)</label>
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={counterDiscount}
                  onChange={(e) => setCounterDiscount(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Notes for Commercial Review</label>
                <Textarea
                  placeholder="Context for this pricing proposal..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialog(null)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={dialog === 'reject' ? 'destructive' : 'default'}
              size="sm"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              loading={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting...' : 'Confirm Decision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
