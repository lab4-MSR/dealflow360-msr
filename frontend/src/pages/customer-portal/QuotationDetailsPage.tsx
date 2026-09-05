import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Handshake } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerQuotationDetail, type CustomerQuotationDetail } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function QuotationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['customer-quotation', id], queryFn: () => getCustomerQuotationDetail(id ?? '') })
  const s = (data ?? {}) as CustomerQuotationDetail
  const items = s.items ?? []
  const p = s.pricing ?? {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></Button><div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">{s.quote_number ?? 'Quotation'}</h1><p className="text-sm text-muted-foreground">Quotation details</p></div></div>
      {isLoading ? <Skeleton className="h-[124px] w-full rounded-lg" /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={s.status === 'accepted' ? 'approved' : s.status === 'expired' ? 'failed' : s.status === 'negotiation' ? 'negotiation' : 'pending'}>{s.status}</StatusBadge></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Issue Date</p><p className="mt-1 text-sm font-medium">{s.issue_date}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Expiry Date</p><p className="mt-1 text-sm font-medium">{s.expiry_date}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Grand Total</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrency(p.grand_total)}</p></div>
        </div>
      )}
      <Card><CardHeader><CardTitle className="text-base font-semibold">Seller Information</CardTitle></CardHeader><CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Company</p><p className="mt-1 text-sm font-medium">{s.seller?.company ?? '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Contact</p><p className="mt-1 text-sm font-medium">{s.seller?.contact ?? '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="mt-1 text-sm font-medium">{s.seller?.email ?? '—'}</p></div>
          <div><p className="text-xs text-muted-foreground">Phone</p><p className="mt-1 text-sm font-medium">{s.seller?.phone ?? '—'}</p></div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base font-semibold">Quote Items</CardTitle></CardHeader><CardContent>
        {items.length > 0 ? <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Description</TableHead><TableHead>Quantity</TableHead><TableHead>Unit Price</TableHead><TableHead>Discount</TableHead><TableHead>Line Total</TableHead></TableRow></TableHeader><TableBody>{items.map((item, i) => (<TableRow key={i}><TableCell className="font-medium">{item.product}</TableCell><TableCell>{item.description ?? '—'}</TableCell><TableCell className="tabular-nums">{item.quantity}</TableCell><TableCell className="tabular-nums">{formatCurrency(item.unit_price)}</TableCell><TableCell className="tabular-nums">{item.discount != null ? `${item.discount}%` : '—'}</TableCell><TableCell className="tabular-nums">{formatCurrency(item.line_total)}</TableCell></TableRow>))}</TableBody></Table> : <EmptyState title="No items" description="This quotation has no line items." />}
      </CardContent></Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base font-semibold">Pricing</CardTitle></CardHeader><CardContent>
          <div className="space-y-2">{[{l:'Subtotal',v:p.subtotal},{l:'Discount',v:p.discount},{l:'Tax',v:p.tax},{l:'Shipping',v:p.shipping}].map(row => (<div key={row.l} className="flex justify-between"><span className="text-sm text-muted-foreground">{row.l}</span><span className="text-sm tabular-nums">{formatCurrency(row.v)}</span></div>))}<div className="flex justify-between border-t border-border pt-2"><span className="text-sm font-semibold">Grand Total</span><span className="text-lg font-semibold tabular-nums">{formatCurrency(p.grand_total)}</span></div></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base font-semibold">Terms</CardTitle></CardHeader><CardContent>
          <div className="space-y-3"><div><p className="text-xs text-muted-foreground">Payment Terms</p><p className="mt-1 text-sm">{s.terms?.payment_terms ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Delivery Terms</p><p className="mt-1 text-sm">{s.terms?.delivery_terms ?? '—'}</p></div><div><p className="text-xs text-muted-foreground">Expiry</p><p className="mt-1 text-sm">{s.terms?.expiry_date ?? s.expiry_date ?? '—'}</p></div></div>
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base font-semibold">Actions</CardTitle><CardDescription>Respond to this quotation.</CardDescription></CardHeader><CardContent>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/customer-portal/review/${id}`)}><CheckCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Accept</Button>
          <Button variant="outline" onClick={() => navigate(`/customer-portal/review/${id}`)}><XCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Reject</Button>
          <Button variant="outline" onClick={() => navigate(`/customer-portal/quotations/${id}/request-changes`)}><MessageSquare className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Request Changes</Button>
          <Button variant="outline" onClick={() => navigate(`/customer-portal/quotations/${id}/counter-offer`)}><Handshake className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />Counter Offer</Button>
        </div>
      </CardContent></Card>
    </div>
  )
}
