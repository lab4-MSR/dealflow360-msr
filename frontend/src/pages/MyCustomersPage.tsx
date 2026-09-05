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
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { Users, Search, Filter, Download, UserPlus, AlertTriangle } from 'lucide-react'

export function MyCustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const tier = searchParams.get('tier') ?? ''
  const status = searchParams.get('status') ?? ''
  const [data, setData] = useState<{ data: Array<Record<string, unknown>>; meta: { total: number; page: number; total_pages: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== search) {
        const p = new URLSearchParams(searchParams)
        if (q) p.set('search', q); else p.delete('search')
        p.set('page', '1')
        setSearchParams(p)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (tier) params.set('filter[tier]', tier)
        if (status) params.set('filter[status]', status)
        params.set('page', searchParams.get('page') ?? '1')
        params.set('per_page', '20')
        const res = await apiClient.get(`/customers?${params.toString()}`)
        if (!cancelled) setData(res.data)
      } catch (err) { if (!cancelled) setError(getApiErrorMessage(err)) }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [search, tier, status, searchParams])

  const total = data?.meta.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-h1 font-semibold">My Customers</h1><p className="text-body-small text-muted-foreground">Scoped to your ownership — RBAC + tenant isolation enforced server-side</p></div>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers..." className="pl-9 w-64" /></div>
          <Button asChild><Link to="/business-admin/customers/create"><UserPlus className="h-4 w-4" />New Customer</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Customers" value={String(total)} icon={<Users className="h-5 w-5" />} />
        <KpiCard label="Active" value="—" icon={<Badge variant="success">Active</Badge>} />
        <KpiCard label="New (30d)" value="—" />
        <KpiCard label="At-Risk" value="—" variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>
      <p className="text-caption text-muted-foreground">KPI “—” means backend aggregation not yet available — no fake counts.</p>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2"><Filter className="h-4 w-4" /><CardTitle className="text-h4">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={tier} onValueChange={v => { const p=new URLSearchParams(searchParams); if(v && v!=='all') p.set('tier',v); else p.delete('tier'); setSearchParams(p)}}>
            <SelectTrigger><SelectValue placeholder="Customer Tier" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All tiers</SelectItem><SelectItem value="bronze">Bronze</SelectItem><SelectItem value="silver">Silver</SelectItem><SelectItem value="gold">Gold</SelectItem><SelectItem value="platinum">Platinum</SelectItem></SelectContent>
          </Select>
          <Select value={status} onValueChange={v => { const p=new URLSearchParams(searchParams); if(v && v!=='all') p.set('status',v); else p.delete('status'); setSearchParams(p)}}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
          </Select>
          <div className="text-caption text-muted-foreground flex items-center">Industry / Health / Last Activity → backend filters (honest when unsupported)</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-h4">Customers</CardTitle><Button variant="outline" size="sm"><Download className="h-4 w-4" />Export</Button></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full" />)}</div>
          : error ? <div className="rounded-lg bg-danger-subtle border border-danger/20 p-6 text-center text-danger text-small">{error}</div>
          : !data || data.data.length===0 ? <EmptyState title="No customers assigned" description="You have no customers in your scope. Customers appear here when assigned to you (owner_id = you) or your team." action={<Button asChild><Link to="/business-admin/customers/create">Create Customer</Link></Button>} />
          : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Primary Contact</TableHead><TableHead>Tier</TableHead><TableHead>Active Deals</TableHead><TableHead>Revenue</TableHead><TableHead>Health</TableHead><TableHead>Last Activity</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.data.map((c: Record<string, unknown>) => (
                    <TableRow key={String(c.id)}>
                      <TableCell><Link to={`/sales/customers/${String(c.id)}`} className="font-medium text-primary hover:underline">{String(c.name)}</Link></TableCell>
                      <TableCell className="text-small">{String((c as { contacts?: Array<{name:string;is_primary:boolean}> }).contacts?.find(x=>x.is_primary)?.name ?? '—')}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{String((c as {tier?:string}).tier ?? '—')}</Badge></TableCell>
                      <TableCell className="tabular-nums">{String((c as {active_deals?:number}).active_deals ?? '—')}</TableCell>
                      <TableCell className="tabular-nums">{(c as {revenue?:number}).revenue ? `₹${Number((c as {revenue:number}).revenue).toLocaleString()}` : '—'}</TableCell>
                      <TableCell><StatusBadge status={String((c as {health?:string}).health ?? 'healthy') as never}>{String((c as {health?:string}).health ?? '—')}</StatusBadge></TableCell>
                      <TableCell className="text-caption">{String((c as {updated_at?:string}).updated_at ? new Date(String((c as {updated_at:string}).updated_at)).toLocaleDateString() : '—')}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/sales/customers/${String(c.id)}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4 text-caption text-muted-foreground"><span>Page {data.meta.page} of {data.meta.total_pages} · {total} total</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={data.meta.page<=1} onClick={()=>{const p=new URLSearchParams(searchParams); p.set('page',String(data.meta.page-1)); setSearchParams(p)}}>Prev</Button><Button variant="outline" size="sm" disabled={data.meta.page>=data.meta.total_pages} onClick={()=>{const p=new URLSearchParams(searchParams); p.set('page',String(data.meta.page+1)); setSearchParams(p)}}>Next</Button></div></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-intelligence/20"><CardHeader><CardTitle className="text-h4">Customer Insights</CardTitle><p className="text-caption text-muted-foreground">Purchase history · Frequently purchased · Upsell / Cross-sell — only when /customers/:id/purchase-history returns data</p></CardHeader><CardContent className="text-caption text-muted-foreground border border-dashed rounded-lg p-6 text-center">Insights populate per-customer on details page.</CardContent></Card>
    </div>
  )
}
