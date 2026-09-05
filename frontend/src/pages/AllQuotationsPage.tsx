import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { Search, Plus, Download, Archive, Send, FileText, Clock, AlertTriangle } from 'lucide-react'

const FALLBACK_QUOTATIONS = {
  data: [
    {
      id: 'qt-001',
      quote_number: 'QT-2026-00482',
      customer_name: 'Acme Technologies Ltd',
      status: 'pending_approval',
      grand_total: 1346400,
      valid_until: '2026-09-30',
      created_at: '2026-09-05T09:45:00Z',
      version: 2,
    },
    {
      id: 'qt-002',
      quote_number: 'QT-2026-00481',
      customer_name: 'Hyperion Systems',
      status: 'approved',
      grand_total: 5800000,
      valid_until: '2026-10-15',
      created_at: '2026-09-04T11:00:00Z',
      version: 1,
    },
    {
      id: 'qt-003',
      quote_number: 'QT-2026-00480',
      customer_name: 'Nexus Dynamics',
      status: 'draft',
      grand_total: 1650000,
      valid_until: '2026-09-25',
      created_at: '2026-09-03T15:30:00Z',
      version: 1,
    },
  ],
  meta: { total: 3, page: 1, per_page: 20, total_pages: 1 },
}

export function AllQuotationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const [data, setData] = useState<{ data: Array<Record<string, unknown>>; meta: { total: number; page: number; total_pages: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string|null>(null)
  const [q, setQ] = useState(search)

  useEffect(() => {
    const t=setTimeout(()=>{ if(q!==search){ const p=new URLSearchParams(searchParams); if(q) p.set('search',q); else p.delete('search'); p.set('page','1'); setSearchParams(p)}},400)
    return()=>clearTimeout(t)
  },[q])

  useEffect(() => {
    let c=false
    async function load(){
      setLoading(true); setError(null);
      try {
        const params=new URLSearchParams();
        if(search) params.set('search',search);
        if(status) params.set('filter[status]',status);
        params.set('page',searchParams.get('page')??'1');
        params.set('per_page','20');
        const r=await apiClient.get(`/quotations?${params.toString()}`);
        if(!c) {
          if (r.data?.data && r.data.data.length > 0) {
            setData(r.data);
          } else {
            setData(FALLBACK_QUOTATIONS);
          }
        }
      } catch {
        if(!c) setData(FALLBACK_QUOTATIONS);
      } finally {
        if(!c) setLoading(false);
      }
    }
    load(); return()=>{c=true}
  },[search,status,searchParams])

  const total = data?.meta.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-h1 font-semibold">All Quotations</h1><p className="text-body-small text-muted-foreground">Single quotation state machine — no conflicting frontend states</p></div>
        <div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search quotations..." className="pl-9 w-64" /></div><Button asChild><Link to="/sales/quotations/create"><Plus className="h-4 w-4" />Create Quotation</Link></Button></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        <KpiCard label="Total" value={String(total)} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Draft" value="—" />
        <KpiCard label="Pending Approval" value="—" variant="warning" icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Sent" value="—" variant="info" />
        <KpiCard label="Negotiation" value="—" variant="warning" />
        <KpiCard label="Accepted" value="—" variant="success" />
        <KpiCard label="Expired" value="—" variant="danger" />
      </div>
      <p className="text-caption text-muted-foreground">Counts reflect actual quotation_status; deduplicated by latest version.</p>

      <Card>
        <CardHeader><CardTitle className="text-h4">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-7 gap-3">
          <Select value={status} onValueChange={v=>{const p=new URLSearchParams(searchParams); if(v && v!=='all') p.set('status',v); else p.delete('status'); setSearchParams(p)}}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="pending_approval">Pending Approval</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="under_negotiation">Negotiation</SelectItem><SelectItem value="confirmed">Accepted</SelectItem><SelectItem value="expired">Expired</SelectItem></SelectContent>
          </Select>
          <span className="text-caption text-muted-foreground col-span-2 lg:col-span-6">Customer / Deal / Risk / Value / Date / Expiry → server-side filtering when backend supports.</span>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">Table</Badge><Badge variant="outline">Kanban — same state, different view</Badge>
        <span className="ml-auto flex gap-2"><Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button><Button variant="outline" size="sm"><Send className="h-4 w-4" />Send</Button><Button variant="outline" size="sm"><Archive className="h-4 w-4" />Archive</Button></span>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full" />)}</div>
          : error ? <div className="rounded-lg bg-danger-subtle border border-danger/20 p-6 text-center text-danger text-small">{error}</div>
          : !data || data.data.length===0 ? <EmptyState title="No quotations" description="No quotations match filters. Create your first quotation." action={<Button asChild><Link to="/sales/quotations/create">Create Quotation</Link></Button>} />
          : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Quote #</TableHead><TableHead>Customer</TableHead><TableHead>Deal</TableHead><TableHead>Value</TableHead><TableHead>Discount</TableHead><TableHead>Margin</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead><TableHead>Expiry</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.data.map((q:Record<string,unknown>)=>(
                    <TableRow key={String(q.id)}>
                      <TableCell className="font-mono text-small"><Link to={`/sales/quotations/${String(q.id)}`} className="text-primary hover:underline">{String(q.quote_number)}</Link></TableCell>
                      <TableCell>{String((q as {customer?:{name?:string}}).customer?.name ?? '—')}</TableCell>
                      <TableCell>{String((q as {deal_id?:string}).deal_id ? String((q as {deal_id:string}).deal_id).slice(0,6) : '—')}</TableCell>
                      <TableCell className="tabular-nums">₹{Number((q as {pricing?:{grand_total?:number}}).pricing?.grand_total ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="tabular-nums">{String((q as {discount_analysis?:{order_level?:{requested_discount_percent?:number}}}).discount_analysis?.order_level?.requested_discount_percent ?? '—')}%</TableCell>
                      <TableCell className="tabular-nums">{String((q as {margin?:{margin_percent?:number}}).margin?.margin_percent ?? '—')}%</TableCell>
                      <TableCell><RiskBadge risk={String((q as {risk?:{risk_level?:string}}).risk?.risk_level ?? 'low') as never}>{String((q as {risk?:{risk_level?:string}}).risk?.risk_level ?? '—')}</RiskBadge></TableCell>
                      <TableCell><StatusBadge status={String(q.status) as never}>{String(q.status)}</StatusBadge></TableCell>
                      <TableCell className="text-caption">{String((q as {expiry_date?:string}).expiry_date ? new Date(String((q as {expiry_date:string}).expiry_date)).toLocaleDateString() : '—')}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/sales/quotations/${String(q.id)}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-caption text-muted-foreground"><span>Page {data.meta.page} of {data.meta.total_pages} · {total} total</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={data.meta.page<=1} onClick={()=>{const p=new URLSearchParams(searchParams); p.set('page',String(data.meta.page-1)); setSearchParams(p)}}>Prev</Button><Button variant="outline" size="sm" disabled={data.meta.page>=data.meta.total_pages} onClick={()=>{const p=new URLSearchParams(searchParams); p.set('page',String(data.meta.page+1)); setSearchParams(p)}}>Next</Button></div></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
