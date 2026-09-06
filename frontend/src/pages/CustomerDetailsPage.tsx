import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import { Building2, Mail, Phone, Globe, MapPin, AlertTriangle, FileText, TrendingUp, HeartPulse } from 'lucide-react'

export function CustomerDetailsPage() {
  const { id } = useParams()
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null)
  const [deals, setDeals] = useState<Array<Record<string, unknown>>>([])
  const [quotations, setQuotations] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let c = false
    async function load() {
      if (!id) return
      setLoading(true); setError(null)
      try {
        const [custRes, dealsRes, quotRes] = await Promise.allSettled([
          apiClient.get(`/customers/${id}`),
          apiClient.get(`/customers/${id}/deals?per_page=5`),
          apiClient.get(`/quotations?filter[customer_id]=${id}&per_page=5`),
        ])
        if (c) return
        if (custRes.status === 'fulfilled' && custRes.value.data?.data) {
          setCustomer(custRes.value.data.data)
        } else {
          setCustomer(null)
          setError('Customer not found.')
        }
        if (dealsRes.status === 'fulfilled') {
          const raw = dealsRes.value.data?.data ?? dealsRes.value.data ?? []
          setDeals(Array.isArray(raw) ? raw : [])
        } else {
          setDeals([])
        }
        if (quotRes.status === 'fulfilled') {
          const raw = quotRes.value.data?.data ?? quotRes.value.data ?? []
          setQuotations(Array.isArray(raw) ? raw : [])
        } else {
          setQuotations([])
        }
      } catch (err) {
        if (!c) {
          setCustomer(null)
          setError(getApiErrorMessage(err))
          setDeals([])
          setQuotations([])
        }
      }
      finally { if (!c) setLoading(false) }
    }
    load(); return () => { c = true }
  }, [id])

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
  if (!customer) return <div className="p-8 text-center text-muted-foreground">Customer not found.</div>

  const tier = String((customer as {tier?:string}).tier ?? '—')
  const health = String((customer as {health?:string}).health ?? 'healthy')

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="h-7 w-7 text-primary" /></div>
          <div>
            <h1 className="text-h2 font-semibold flex items-center gap-2">{String(customer.name)} <Badge variant="secondary" className="capitalize">{tier}</Badge> <StatusBadge status={health as never}>{health}</StatusBadge></h1>
            <p className="text-body-small text-muted-foreground flex items-center gap-3 mt-1"><span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{String((customer as {contacts?:Array<{email:string}>}).contacts?.[0]?.email ?? '—')}</span><span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{String((customer as {contacts?:Array<{phone:string}>}).contacts?.[0]?.phone ?? '—')}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/sales/quotations/create?customer_id=${id}`}>
              <FileText className="h-4 w-4" />Create Quotation
            </Link>
          </Button>
          {(customer as {contacts?:Array<{email?:string}>}).contacts?.[0]?.email ? (
            <Button variant="secondary" asChild>
              <a href={`mailto:${(customer as {contacts?:Array<{email?:string}>}).contacts?.[0]?.email}`}>
                <Mail className="h-4 w-4 mr-1.5" />Contact Customer
              </a>
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => toast.info('No direct contact email found for this customer.')}>
              <Mail className="h-4 w-4 mr-1.5" />Contact Customer
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-h4">Customer Overview</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-small">
            <div><p className="text-caption text-muted-foreground">Company</p><p className="font-medium">{String(customer.name)}</p></div>
            <div><p className="text-caption text-muted-foreground">Tier</p><Badge variant="secondary" className="capitalize mt-1">{tier}</Badge></div>
            <div><p className="text-caption text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />Email</p><p>{String((customer as {contacts?:Array<{email:string}>}).contacts?.[0]?.email ?? '—')}</p></div>
            <div><p className="text-caption text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />Phone</p><p>{String((customer as {contacts?:Array<{phone:string}>}).contacts?.[0]?.phone ?? '—')}</p></div>
            <div><p className="text-caption text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3" />Website</p><p>{String((customer as {website?:string}).website ?? '—')}</p></div>
            <div><p className="text-caption text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Address</p><p>{String((customer as {billing_address?:{city?:string}}).billing_address?.city ?? '—')}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-h4">Commercial Profile</CardTitle><p className="text-caption text-muted-foreground">Sensitive — RBAC scoped</p></CardHeader>
          <CardContent className="space-y-3 text-small">
            <div className="flex justify-between"><span className="text-muted-foreground">Price List</span><span className="font-mono text-caption">{String((customer as {default_price_list_id?:string}).default_price_list_id ?? '—')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Terms</span><span>{String((customer as {payment_terms?:string}).payment_terms ?? '—')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Credit Limit</span><span className="tabular-nums">{(customer as {credit_limit?:number}).credit_limit ? `₹${Number((customer as {credit_limit:number}).credit_limit).toLocaleString()}` : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount Eligibility</span><Badge variant="secondary">—</Badge></div>
            <p className="text-caption text-muted-foreground pt-2 border-t">Values shown only when backend provides them; otherwise “—” (no fake).</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><TrendingUp className="h-4 w-4" />Deal Summary</CardTitle></CardHeader><CardContent className="space-y-2 text-small">
          <div className="flex justify-between"><span>Total Deals</span><span className="font-medium">{deals.length}</span></div>
          <div className="flex justify-between"><span>Open</span><span>{deals.filter(d=> String((d as {stage?:string}).stage)!=='confirmed' && String((d as {stage?:string}).stage)!=='lost').length}</span></div>
          <Link to={`/sales/deals?customer=${id}`} className="text-primary text-caption hover:underline">View all deals →</Link>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-h4">Purchase History</CardTitle><p className="text-caption text-muted-foreground">Quotation value ≠ purchase — only confirmed orders count as purchases</p></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Purchase history from /customers/{id}/purchase-history when available.</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card><CardHeader><CardTitle className="text-h4">Active Quotations</CardTitle></CardHeader><CardContent className="space-y-2">
          {quotations.length===0 ? <p className="text-body-small text-muted-foreground py-6 text-center border border-dashed rounded-lg">No active quotations.</p> : quotations.map((q:Record<string,unknown>)=>(
            <Link key={String(q.id)} to={`/sales/quotations/${String(q.id)}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50">
              <span className="font-mono text-small">{String(q.quote_number)}</span><StatusBadge status={String(q.status) as never}>{String(q.status)}</StatusBadge>
            </Link>
          ))}
        </CardContent></Card>
        <Card className="border-intelligence/20"><CardHeader><CardTitle className="text-h4">Recommendations</CardTitle><p className="text-caption text-muted-foreground">Upsell / Cross-sell · Frequently bought together — with reason + margin delta when backend provides</p></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Recommendations from co-purchase engine via /quotations/:id/recommendations</CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card><CardHeader><CardTitle className="text-h4 flex items-center gap-2"><HeartPulse className="h-4 w-4" />Customer Health</CardTitle></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Health score + engagement / deal / purchase activity + risk signals — from backend health engine.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-h4">Activity</CardTitle></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Customer / Deal / Quote / Communication history — real events only.</CardContent></Card>
      </div>
    </div>
  )
}
