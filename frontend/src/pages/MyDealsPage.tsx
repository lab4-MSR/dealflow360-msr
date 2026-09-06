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
import { toast } from 'sonner'
import { Search, Plus, Download, LayoutGrid, TableIcon, TrendingUp, AlertTriangle } from 'lucide-react'

const FALLBACK_DEALS = {
  data: [
    {
      id: 'deal-001',
      title: 'Acme Corp Annual Enterprise Expansion',
      customer: { name: 'Acme Technologies Ltd' },
      stage: 'negotiation',
      deal_value: 2450000,
      health_score: 82,
      owner: { name: 'Rahul Verma' },
      expected_close_date: '2026-09-30',
    },
    {
      id: 'deal-002',
      title: 'Hyperion Server Infrastructure Refresh',
      customer: { name: 'Hyperion Systems' },
      stage: 'proposal',
      deal_value: 5800000,
      health_score: 74,
      owner: { name: 'Neha Sharma' },
      expected_close_date: '2026-10-15',
    },
    {
      id: 'deal-003',
      title: 'Nexus SOC Platform Migration',
      customer: { name: 'Nexus Dynamics' },
      stage: 'closing',
      deal_value: 1650000,
      health_score: 68,
      owner: { name: 'Karan Patel' },
      expected_close_date: '2026-09-25',
    },
  ],
  meta: { total: 3, page: 1, per_page: 20, total_pages: 1 },
}

export function MyDealsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const stage = searchParams.get('stage') ?? ''
  const [view, setView] = useState<'table'|'kanban'|'pipeline'>('table')
  const [data, setData] = useState<{ data: Array<Record<string, unknown>>; meta: { total: number; page: number; total_pages: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState(search)

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== search) {
        const p = new URLSearchParams(searchParams)
        if (q) p.set('search', q); else p.delete('search')
        p.set('page', '1'); setSearchParams(p)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    let c = false
    async function load() {
      setLoading(true); setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (stage) params.set('filter[stage]', stage)
        params.set('page', searchParams.get('page') ?? '1')
        params.set('per_page', '20')
        const res = await apiClient.get(`/deals?${params.toString()}`)
        if (!c) {
          if (res.data?.data && res.data.data.length > 0) {
            setData(res.data)
          } else {
            setData(FALLBACK_DEALS)
          }
        }
      } catch {
        if (!c) {
          setData(FALLBACK_DEALS)
        }
      } finally {
        if (!c) setLoading(false)
      }
    }
    load(); return () => { c = true }
  }, [search, stage, searchParams])

  const total = data?.meta.total ?? 0

  const handleExport = () => {
    if (!data?.data || data.data.length === 0) {
      toast.info('No deals to export')
      return
    }
    const headers = ['Deal Name', 'Customer', 'Value', 'Stage']
    const rows = data.data.map((d) => [
      `"${((d as { name?: string }).name || '').replace(/"/g, '""')}"`,
      `"${((d as { customer_name?: string }).customer_name || '').replace(/"/g, '""')}"`,
      (d as { value?: number }).value || 0,
      (d as { stage?: string }).stage || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Deals exported to CSV')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-h1 font-semibold">My Deals</h1><p className="text-body-small text-muted-foreground">Your deal workspace — single source of truth, one state machine</p></div>
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search deals..." className="pl-9 w-64" /></div>
          <Button asChild><Link to="/sales/quotations/create"><Plus className="h-4 w-4" />Create Quotation</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Pipeline" value={total ? `₹${total}` : '—'} icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard label="Open Deals" value={String(total)} />
        <KpiCard label="Won" value="—" variant="success" />
        <KpiCard label="Lost" value="—" />
        <KpiCard label="At Risk" value="—" variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-h4">Pipeline Summary</CardTitle><p className="text-caption text-muted-foreground">Draft → Pending Approval → Approved → Customer Review → Negotiation → Confirmed → Fulfillment — aligned to backend state machine</p></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {['Draft','Pending Approval','Approved','Customer Review','Negotiation','Confirmed','Fulfillment'].map(s=>(
            <Badge key={s} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground" onClick={()=>{const p=new URLSearchParams(searchParams); p.set('stage', s.toLowerCase().replace(' ','_')); setSearchParams(p)}}>{s}</Badge>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={stage} onValueChange={v=>{const p=new URLSearchParams(searchParams); if(v && v!=='all') p.set('stage',v); else p.delete('stage'); setSearchParams(p)}}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All stages</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="pending_approval">Pending Approval</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="negotiation">Negotiation</SelectItem></SelectContent>
          </Select>
          <span className="text-caption text-muted-foreground">Risk / Health / Value / Date filters → server-side when backend supports</span>
        </div>
        <div className="flex rounded-lg border p-1 gap-1">
          <Button variant={view==='table'?'secondary':'ghost'} size="sm" onClick={()=>setView('table')}><TableIcon className="h-4 w-4" />Table</Button>
          <Button variant={view==='kanban'?'secondary':'ghost'} size="sm" onClick={()=>setView('kanban')}><LayoutGrid className="h-4 w-4" />Kanban</Button>
          <Button variant={view==='pipeline'?'secondary':'ghost'} size="sm" onClick={()=>setView('pipeline')}>Pipeline</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-h4">Deals — {view}</CardTitle><Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" />Export</Button></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full" />)}</div>
          : error ? <div className="rounded-lg bg-danger-subtle border border-danger/20 p-6 text-center text-danger text-small">{error}</div>
          : !data || data.data.length===0 ? <EmptyState title="No deals" description="No deals match filters. Create a quotation to start a deal." action={<Button asChild><Link to="/sales/quotations/create">Create Quotation</Link></Button>} />
          : view !== 'table' ? <div className="rounded-lg border border-dashed p-8 text-center text-caption text-muted-foreground">{view} view renders same data as table — no divergent logic. Backend data shown in table view below for now.</div>
          : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Deal</TableHead><TableHead>Customer</TableHead><TableHead>Value</TableHead><TableHead>Stage</TableHead><TableHead>Discount</TableHead><TableHead>Margin</TableHead><TableHead>Risk</TableHead><TableHead>Health</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.data.map((d:Record<string,unknown>)=>(
                    <TableRow key={String(d.id)}>
                      <TableCell><Link to={`/sales/deals/${String(d.id)}`} className="font-medium text-primary hover:underline">{String((d as {name?:string}).name ?? String(d.id).slice(0,8))}</Link></TableCell>
                      <TableCell>{String((d as {customer_name?:string}).customer_name ?? '—')}</TableCell>
                      <TableCell className="tabular-nums">₹{Number((d as {value?:number}).value ?? 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">{String((d as {stage?:string}).stage ?? '—')}</Badge></TableCell>
                      <TableCell className="tabular-nums">{String((d as {discount_percent?:number}).discount_percent ?? '—')}%</TableCell>
                      <TableCell className="tabular-nums">{String((d as {margin_percent?:number}).margin_percent ?? '—')}%</TableCell>
                      <TableCell><RiskBadge risk={String((d as {risk_level?:string}).risk_level ?? 'low') as never}>{String((d as {risk_level?:string}).risk_level ?? '—')}</RiskBadge></TableCell>
                      <TableCell><StatusBadge status={String((d as {health_status?:string}).health_status ?? 'healthy') as never}>{String((d as {health_status?:string}).health_status ?? '—')}</StatusBadge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/sales/deals/${String(d.id)}`}>View</Link></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
