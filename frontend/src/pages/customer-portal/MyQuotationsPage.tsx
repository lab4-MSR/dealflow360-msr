import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerQuotations, type CustomerQuotation } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function MyQuotationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading } = useQuery({ queryKey: ['customer-quotations'], queryFn: getCustomerQuotations })
  const quotations = (data ?? []) as CustomerQuotation[]

  const filtered = quotations.filter(q => {
    const matchSearch = (q.quote_number ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || (q.status ?? '') === statusFilter
    return matchSearch && matchStatus
  })

  const kpis = { open: quotations.filter(q => q.status === 'sent').length, awaiting: quotations.filter(q => q.status === 'awaiting_review').length, negotiation: quotations.filter(q => q.status === 'negotiation').length, accepted: quotations.filter(q => q.status === 'accepted').length, expired: quotations.filter(q => q.status === 'expired').length }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1"><h1 className="text-2xl font-semibold tracking-tight">My Quotations</h1><p className="text-sm text-muted-foreground">View and manage your quotations.</p></div>
      </div>
      {isLoading ? <Skeleton className="h-[124px] w-full rounded-lg" /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Open" value={kpis.open} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Awaiting Review" value={kpis.awaiting} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Negotiation" value={kpis.negotiation} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Accepted" value={kpis.accepted} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Expired" value={kpis.expired} icon={<FileText className="h-5 w-5" />} />
        </div>
      )}
      <Card><CardHeader><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" /><Input placeholder="Search quotations..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" /></div><div className="flex gap-2">{['all','sent','awaiting_review','negotiation','accepted','expired'].map(s => (<Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)}>{s === 'all' ? 'All' : s.replace('_',' ')}</Button>))}</div></div></CardHeader><CardContent>
        {filtered.length > 0 ? <Table><TableHeader><TableRow><TableHead>Quote Number</TableHead><TableHead>Date</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead><TableHead>Expiry</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{filtered.map(q => (<TableRow key={q.id}><TableCell className="font-medium">{q.quote_number}</TableCell><TableCell>{q.date}</TableCell><TableCell className="tabular-nums">{formatCurrency(q.value)}</TableCell><TableCell><StatusBadge status={q.status === 'awaiting_review' ? 'pending' : q.status === 'accepted' ? 'approved' : q.status === 'expired' ? 'failed' : q.status === 'negotiation' ? 'negotiation' : 'draft'}>{q.status}</StatusBadge></TableCell><TableCell>{q.expiry_date}</TableCell><TableCell><Button variant="ghost" size="sm" asChild><a href={`/customer-portal/quotations/${q.id}`}><Eye className="h-3.5 w-3.5" aria-hidden="true" /></a></Button></TableCell></TableRow>))}</TableBody></Table> : <EmptyState title="No quotations" description="You do not have any quotations yet." />}
      </CardContent></Card>
    </div>
  )
}
