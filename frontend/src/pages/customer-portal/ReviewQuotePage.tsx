import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, MessageSquare, Handshake, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { getCustomerQuotationDetail, confirmQuotation, requestChanges, submitCounterOffer, type CustomerQuotationDetail } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function ReviewQuotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [dialog, setDialog] = useState<'accept' | 'reject' | 'changes' | 'counter' | null>(null)
  const [comment, setComment] = useState('')
  const [counterDiscount, setCounterDiscount] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['customer-quotation', id], queryFn: () => getCustomerQuotationDetail(id ?? '') })
  const s = (data ?? {}) as CustomerQuotationDetail
  const items = s.items ?? []
  const p = s.pricing ?? {}

  const mutation = useMutation({ mutationFn: async () => {
    if (!id) return
    if (dialog === 'accept') { await confirmQuotation(id) }
    else if (dialog === 'changes') { await requestChanges(id, { comment }) }
    else if (dialog === 'counter') { await submitCounterOffer(id, { counter_discount_percent: Number(counterDiscount) || 0, comment: comment || undefined }) }
  }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['customer-quotation'] }); setDialog(null); setComment(''); setCounterDiscount('') } })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></Button><div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">Review Quotation</h1><p className="text-sm text-muted-foreground">{s.quote_number ?? 'Quotation'}</p></div></div>
      {isLoading ? <Skeleton className="h-[124px] w-full rounded-lg" /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={s.status === 'accepted' ? 'approved' : s.status === 'expired' ? 'failed' : s.status === 'negotiation' ? 'negotiation' : 'pending'}>{s.status}</StatusBadge></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Issue Date</p><p className="mt-1 text-sm font-medium">{s.issue_date}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Expiry Date</p><p className="mt-1 text-sm font-medium">{s.expiry_date}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Grand Total</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(p.grand_total)}</p></div>
        </div>
      )}
      <Card><CardHeader><CardTitle className="text-base font-semibold">Quote Summary</CardTitle></CardHeader><CardContent>
        <div className="space-y-2">{items.slice(0, 5).map((item, i) => (<div key={i} className="flex justify-between"><span className="text-sm">{item.product} x{item.quantity}</span><span className="text-sm tabular-nums">{formatCurrency(item.line_total)}</span></div>))}<div className="flex justify-between border-t border-border pt-2"><span className="text-sm font-semibold">Total</span><span className="text-lg font-semibold tabular-nums">{formatCurrency(p.grand_total)}</span></div></div>
      </CardContent></Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base font-semibold">Terms</CardTitle></CardHeader><CardContent>
          <div className="space-y-3"><div><p className="text-xs text-muted-foreground">Payment Terms</p><p className="mt-1 text-sm">{s.terms?.payment_terms ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Delivery Terms</p><p className="mt-1 text-sm">{s.terms?.delivery_terms ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Expiry</p><p className="mt-1 text-sm">{s.terms?.expiry_date ?? s.expiry_date ?? '—'}</p></div></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base font-semibold">Customer Decision</CardTitle><CardDescription>Choose how to respond to this quotation.</CardDescription></CardHeader><CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setDialog('accept')}><CheckCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Accept Quote</Button>
            <Button variant="outline" onClick={() => setDialog('reject')}><XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Reject Quote</Button>
            <Button variant="outline" onClick={() => navigate(`/customer-portal/quotations/${id}/request-changes`)}><MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Request Changes</Button>
            <Button variant="outline" onClick={() => navigate(`/customer-portal/quotations/${id}/counter-offer`)}><Handshake className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Negotiate</Button>
          </div>
        </CardContent></Card>
      </div>
      <Dialog open={dialog !== null} onOpenChange={open => { if (!open) setDialog(null) }}>
        <DialogContent><DialogHeader><DialogTitle>{dialog === 'accept' ? 'Accept Quotation' : dialog === 'reject' ? 'Reject Quotation' : dialog === 'changes' ? 'Request Changes' : 'Counter Offer'}</DialogTitle>
          <DialogDescription>{dialog === 'accept' ? 'Are you sure you want to accept this quotation?' : dialog === 'reject' ? 'Are you sure you want to reject this quotation?' : dialog === 'changes' ? 'Describe the changes you would like.' : 'Submit your counter offer.'}</DialogDescription>
        </DialogHeader>
        {dialog === 'changes' && <div><label className="text-xs text-muted-foreground">Requested Changes</label><Input placeholder="Describe your requested changes..." value={comment} onChange={e => setComment(e.target.value)} /></div>}
        {dialog === 'counter' && <div className="space-y-3"><div><label className="text-xs text-muted-foreground">Counter Discount (%)</label><Input type="number" placeholder="e.g. 10" value={counterDiscount} onChange={e => setCounterDiscount(e.target.value)} /></div><div><label className="text-xs text-muted-foreground">Comment (optional)</label><Input placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} /></div></div>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialog(null)} disabled={mutation.isPending}>Cancel</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? 'Submitting...' : 'Confirm'}</Button></div>
        {mutation.isError && <div className="flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-subtle p-3"><AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" /><p className="text-sm text-danger">Unable to process your request. Please try again.</p></div>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
