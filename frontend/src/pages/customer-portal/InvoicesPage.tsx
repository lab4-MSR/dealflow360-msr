import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, CreditCard, CheckCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerInvoices, type InvoiceFilters } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function InvoicesPage() {
  const navigate = useNavigate()

  // State for search and filters
  const [search, setSearch] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [amountFilter, setAmountFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  // Calculate amount bounds
  let amountMin: number | undefined
  let amountMax: number | undefined
  if (amountFilter === 'under_5k') {
    amountMax = 5000
  } else if (amountFilter === '5k_25k') {
    amountMin = 5000
    amountMax = 25000
  } else if (amountFilter === 'over_25k') {
    amountMin = 25000
  }

  // Calculate date bounds
  let dateFrom: string | undefined
  if (dateRange === '30_days') {
    dateFrom = '2026-08-05'
  } else if (dateRange === '90_days') {
    dateFrom = '2026-06-05'
  } else if (dateRange === '2026') {
    dateFrom = '2026-01-01'
  }

  const queryFilters: InvoiceFilters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    date_from: dateFrom,
    amount_min: amountMin,
    amount_max: amountMax,
    page,
    per_page: perPage,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer-invoices', queryFilters],
    queryFn: () => getCustomerInvoices(queryFilters),
  })

  const invoices = data?.invoices ?? []
  const kpis = data?.kpis ?? { total: 0, paid: 0, outstanding: 0, overdue: 0 }
  const meta = data?.meta ?? { page: 1, per_page: 10, total: 0, total_pages: 1 }

  const hasActiveFilters = search !== '' || dateRange !== 'all' || statusFilter !== 'all' || amountFilter !== 'all'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">View, download, and pay your business invoices</p>
        </div>

        {/* Page Header Inputs: Search & Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search invoice #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="w-[160px]">
            <Select
              value={dateRange}
              onValueChange={(val) => {
                setDateRange(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30_days">Last 30 Days</SelectItem>
                <SelectItem value="90_days">Last 90 Days</SelectItem>
                <SelectItem value="2026">Year 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Invoice KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Invoiced"
          value={isLoading ? '...' : formatCurrency(kpis.total)}
          change={{ value: 0, label: 'lifetime billed' }}
          icon={<CreditCard className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Paid"
          value={isLoading ? '...' : formatCurrency(kpis.paid)}
          change={{ value: 0, label: 'settled invoices' }}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        />
        <KpiCard
          title="Outstanding"
          value={isLoading ? '...' : formatCurrency(kpis.outstanding)}
          change={{ value: 0, label: 'pending payment' }}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
        />
        <KpiCard
          title="Overdue"
          value={isLoading ? '...' : formatCurrency(kpis.overdue)}
          change={{ value: 0, label: 'action required' }}
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
        />
      </div>

      {/* Additional Filters Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters:</span>

            {/* Status Filter */}
            <div className="w-[160px]">
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="outstanding">Outstanding</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Filter */}
            <div className="w-[160px]">
              <Select
                value={amountFilter}
                onValueChange={(val) => {
                  setAmountFilter(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Amount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="under_5k">Under $5,000</SelectItem>
                  <SelectItem value="5k_25k">$5,000 - $25,000</SelectItem>
                  <SelectItem value="over_25k">Over $25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setDateRange('all')
                  setStatusFilter('all')
                  setAmountFilter('all')
                  setPage(1)
                }}
                className="text-xs ml-auto"
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-destructive mb-2" />
              <p className="font-medium text-destructive">Failed to load invoices</p>
              <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="No invoices found"
                description={
                  hasActiveFilters
                    ? 'No invoices match your selected filters. Try broadening your criteria.'
                    : 'You currently have no billing invoices on record.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        <button
                          onClick={() => navigate(`/customer-portal/invoices/${inv.id}`)}
                          className="hover:underline focus:outline-none"
                        >
                          {inv.invoice_number}
                        </button>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {inv.invoice_date}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {inv.due_date}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(inv.totals.grand_total)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/customer-portal/invoices/${inv.id}`)}
                            className="h-8 px-2.5 text-xs font-medium"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(meta.page - 1) * meta.per_page + 1}</span> to{' '}
                <span className="font-medium text-foreground">{Math.min(meta.page * meta.per_page, meta.total)}</span> of{' '}
                <span className="font-medium text-foreground">{meta.total}</span> invoices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="h-8 text-xs"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Previous
                </Button>
                <span className="text-xs font-medium px-2">
                  Page {meta.page} of {meta.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.total_pages}
                  onClick={() => setPage((prev) => Math.min(prev + 1, meta.total_pages))}
                  className="h-8 text-xs"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
