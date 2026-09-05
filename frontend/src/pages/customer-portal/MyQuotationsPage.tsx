import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  FileText,
  Eye,
  ArrowRight,
  Handshake,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerQuotations, type CustomerQuotation } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function MyQuotationsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customer-quotations'],
    queryFn: getCustomerQuotations,
  })
  const quotations = (data ?? []) as CustomerQuotation[]

  const filtered = quotations.filter((q) => {
    const matchSearch =
      (q.quote_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (q.id ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || (q.status ?? '') === statusFilter
    return matchSearch && matchStatus
  })

  const kpis = {
    total: quotations.length,
    awaiting: quotations.filter((q) => q.status === 'awaiting_review').length,
    negotiation: quotations.filter((q) => q.status === 'negotiation' || q.status === 'under_negotiation').length,
    accepted: quotations.filter((q) => q.status === 'accepted' || q.status === 'approved').length,
    expired: quotations.filter((q) => q.status === 'expired').length,
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-page-enter">
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Quotations
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20">
              Commercial Proposals
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review formal quotations, submit counter-offers, request change orders, and accept contract terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs h-9 gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ─── 5 ASSETRIX-STYLE KPI TILES ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-xl border bg-card space-y-1 shadow-xs cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'border-sky-500/50 ring-1 ring-sky-500/20'
                : 'border-border/80 hover:border-sky-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>All Quotes</span>
              <FileText className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{kpis.total}</p>
            <span className="text-[10px] text-muted-foreground">Total received</span>
          </div>

          <div
            onClick={() => setStatusFilter('awaiting_review')}
            className={`p-4 rounded-xl border bg-card space-y-1 shadow-xs cursor-pointer transition-all ${
              statusFilter === 'awaiting_review'
                ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                : 'border-border/80 hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Awaiting Review</span>
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{kpis.awaiting}</p>
            <span className="text-[10px] text-amber-400 font-medium">Pending decision</span>
          </div>

          <div
            onClick={() => setStatusFilter('negotiation')}
            className={`p-4 rounded-xl border bg-card space-y-1 shadow-xs cursor-pointer transition-all ${
              statusFilter === 'negotiation'
                ? 'border-sky-500/50 ring-1 ring-sky-500/20'
                : 'border-border/80 hover:border-sky-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Under Negotiation</span>
              <Handshake className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{kpis.negotiation}</p>
            <span className="text-[10px] text-sky-400 font-medium">Counter offer sent</span>
          </div>

          <div
            onClick={() => setStatusFilter('accepted')}
            className={`p-4 rounded-xl border bg-card space-y-1 shadow-xs cursor-pointer transition-all ${
              statusFilter === 'accepted'
                ? 'border-emerald-500/50 ring-1 ring-emerald-500/20'
                : 'border-border/80 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Accepted</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{kpis.accepted}</p>
            <span className="text-[10px] text-emerald-400 font-medium">Order confirmed</span>
          </div>

          <div
            onClick={() => setStatusFilter('expired')}
            className={`p-4 rounded-xl border bg-card space-y-1 shadow-xs cursor-pointer transition-all ${
              statusFilter === 'expired'
                ? 'border-rose-500/50 ring-1 ring-rose-500/20'
                : 'border-border/80 hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Expired</span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{kpis.expired}</p>
            <span className="text-[10px] text-rose-400 font-medium">Past valid date</span>
          </div>
        </div>
      )}

      {/* ─── SEARCH & FILTER TOOLBAR ─── */}
      <Card className="rounded-2xl border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quote number, QT-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'awaiting_review', label: 'Awaiting Review' },
                { id: 'negotiation', label: 'Negotiation' },
                { id: 'accepted', label: 'Accepted' },
                { id: 'expired', label: 'Expired' },
              ].map((pill) => (
                <Button
                  key={pill.id}
                  variant={statusFilter === pill.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(pill.id)}
                  className="text-xs h-8"
                >
                  {pill.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead className="font-semibold text-xs text-foreground">Quote Number</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">Date Issued</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">Grand Total</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-foreground">Valid Until</TableHead>
                    <TableHead className="text-right font-semibold text-xs text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((q) => (
                    <TableRow
                      key={q.id}
                      className="hover:bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/customer-portal/quotations/${q.id}`)}
                    >
                      <TableCell className="font-bold text-foreground">
                        <span className="text-primary hover:underline flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-sky-400" />
                          {q.quote_number}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{q.date}</TableCell>
                      <TableCell className="font-semibold tabular-nums text-foreground">
                        {formatCurrency(q.value)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={
                            q.status === 'accepted' || q.status === 'approved'
                              ? 'approved'
                              : q.status === 'awaiting_review'
                              ? 'pending'
                              : q.status === 'negotiation' || q.status === 'under_negotiation'
                              ? 'negotiation'
                              : q.status === 'expired'
                              ? 'failed'
                              : 'draft'
                          }
                        >
                          {q.status.replace('_', ' ')}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {q.expiry_date}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {q.status !== 'accepted' && q.status !== 'expired' && (
                            <Button
                              asChild
                              size="xs"
                              className="font-semibold shadow-xs"
                            >
                              <Link to={`/customer-portal/quotations/${q.id}/review`}>
                                Review
                              </Link>
                            </Button>
                          )}
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                          >
                            <Link to={`/customer-portal/quotations/${q.id}`}>
                              <Eye className="h-3 w-3" />
                              <span>Details</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No quotations found"
                description={
                  search || statusFilter !== 'all'
                    ? 'No quotations match the active search or filter criteria.'
                    : 'You do not have any quotations on file yet.'
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
