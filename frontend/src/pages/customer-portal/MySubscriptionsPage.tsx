import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, RefreshCw, CheckCircle, Clock, AlertTriangle, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerSubscriptions, type SubscriptionFilters } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function MySubscriptionsPage() {
  const navigate = useNavigate()

  // State for search and status filter
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  const queryFilters: SubscriptionFilters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: perPage,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer-subscriptions', queryFilters],
    queryFn: () => getCustomerSubscriptions(queryFilters),
  })

  const subscriptions = data?.subscriptions ?? []
  const kpis = data?.kpis ?? { active: 0, trial: 0, renewing_soon: 0, cancelled: 0 }
  const meta = data?.meta ?? { page: 1, per_page: 10, total: 0, total_pages: 1 }

  const hasActiveFilters = search !== '' || statusFilter !== 'all'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage your recurring plans, entitlements, and billing cycles</p>
        </div>

        {/* Page Header Search and Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search plan or subscription..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[180px]">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="renewing_soon">Renewing Soon</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setPage(1)
              }}
              className="text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Subscription KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active"
          value={isLoading ? '...' : kpis.active}
          change={{ value: 0, label: 'active subscriptions' }}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        />
        <KpiCard
          title="Trial"
          value={isLoading ? '...' : kpis.trial}
          change={{ value: 0, label: 'trial plans' }}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        />
        <KpiCard
          title="Renewing Soon"
          value={isLoading ? '...' : kpis.renewing_soon}
          change={{ value: 0, label: 'renews within 30 days' }}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
        <KpiCard
          title="Cancelled"
          value={isLoading ? '...' : kpis.cancelled}
          change={{ value: 0, label: 'expired / cancelled' }}
          icon={<XCircle className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      {/* Subscriptions Table */}
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
              <p className="font-medium text-destructive">Failed to load subscriptions</p>
              <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={RefreshCw}
                title="No subscriptions found"
                description={
                  hasActiveFilters
                    ? 'No subscriptions match your search criteria.'
                    : 'You currently have no active or historical subscriptions.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px]">Subscription</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        <button
                          onClick={() => navigate(`/customer-portal/subscriptions/${sub.id}`)}
                          className="hover:underline focus:outline-none"
                        >
                          {sub.id}
                        </button>
                      </TableCell>

                      <TableCell className="text-sm font-semibold text-foreground">
                        {sub.plan_name}
                      </TableCell>

                      <TableCell className="text-right font-mono text-sm font-semibold">
                        {formatCurrency(sub.amount)}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {sub.billing_cycle.replace('_', ' ')}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {sub.renewal_date}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customer-portal/subscriptions/${sub.id}`)}
                          className="h-8 px-2.5 text-xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>
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
                <span className="font-medium text-foreground">{meta.total}</span> subscriptions
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
