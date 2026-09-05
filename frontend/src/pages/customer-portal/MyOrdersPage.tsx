import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Package, Clock, Truck, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerOrders, type CustomerOrderFilters } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function MyOrdersPage() {
  const navigate = useNavigate()

  // State for Filters
  const [search, setSearch] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [valueFilter, setValueFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  // Calculate value bounds from filter
  let valueMin: number | undefined
  let valueMax: number | undefined
  if (valueFilter === 'under_10k') {
    valueMax = 10000
  } else if (valueFilter === '10k_25k') {
    valueMin = 10000
    valueMax = 25000
  } else if (valueFilter === 'over_25k') {
    valueMin = 25000
  }

  // Calculate date bounds from filter
  let dateFrom: number | string | undefined
  if (dateRange === '30_days') {
    dateFrom = '2026-08-05'
  } else if (dateRange === '90_days') {
    dateFrom = '2026-06-05'
  } else if (dateRange === '2026') {
    dateFrom = '2026-01-01'
  }

  const queryFilters: CustomerOrderFilters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    date_from: dateFrom ? String(dateFrom) : undefined,
    value_min: valueMin,
    value_max: valueMax,
    page,
    per_page: perPage,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders', queryFilters],
    queryFn: () => getCustomerOrders(queryFilters),
  })

  const orders = data?.orders ?? []
  const kpis = data?.kpis ?? { total_orders: 0, processing: 0, shipped: 0, delivered: 0, backordered: 0 }
  const meta = data?.meta ?? { page: 1, per_page: 10, total: 0, total_pages: 1 }

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || dateRange !== 'all' || valueFilter !== 'all'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage your purchase order history and fulfillment status</p>
        </div>

        {/* Page Header Inputs: Search & Date Range */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search order # or shipment..."
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
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="30_days">Last 30 Days</SelectItem>
                <SelectItem value="90_days">Last 90 Days</SelectItem>
                <SelectItem value="2026">Year 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Order KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            label="Total Orders"
            value={kpis.total_orders}
            icon={<Package className="h-5 w-5 text-primary" />}
          />
          <KpiCard
            label="Processing"
            value={kpis.processing}
            icon={<Clock className="h-5 w-5 text-warning" />}
          />
          <KpiCard
            label="Shipped"
            value={kpis.shipped}
            icon={<Truck className="h-5 w-5 text-info" />}
          />
          <KpiCard
            label="Delivered"
            value={kpis.delivered}
            icon={<CheckCircle className="h-5 w-5 text-success" />}
          />
          <KpiCard
            label="Backordered"
            value={kpis.backordered}
            icon={<AlertTriangle className="h-5 w-5 text-danger" />}
          />
        </div>
      )}

      {/* Filters Bar */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="backordered">Backordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <Select
                  value={dateRange}
                  onValueChange={(val) => {
                    setDateRange(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30_days">Last 30 Days</SelectItem>
                    <SelectItem value="90_days">Last 90 Days</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Value</label>
                <Select
                  value={valueFilter}
                  onValueChange={(val) => {
                    setValueFilter(val)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Values</SelectItem>
                    <SelectItem value="under_10k">Under $10,000</SelectItem>
                    <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                    <SelectItem value="over_25k">Over $25,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('all')
                  setDateRange('all')
                  setValueFilter('all')
                  setPage(1)
                }}
                className="text-xs text-muted-foreground"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                    {/* Order Number */}
                    <TableCell className="font-semibold text-foreground">
                      <button
                        onClick={() => navigate(`/customer-portal/orders/${order.id}`)}
                        className="hover:underline text-primary text-left"
                      >
                        {order.order_number}
                      </button>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-muted-foreground tabular-nums">
                      {order.date}
                    </TableCell>

                    {/* Value */}
                    <TableCell className="font-semibold tabular-nums">
                      {formatCurrency(order.value)}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge
                        status={
                          order.status === 'delivered'
                            ? 'approved'
                            : order.status === 'shipped'
                            ? 'confirmed'
                            : order.status === 'processing'
                            ? 'pending'
                            : order.status === 'backordered'
                            ? 'negotiation'
                            : 'pending'
                        }
                      >
                        {order.status}
                      </StatusBadge>
                    </TableCell>

                    {/* Shipment */}
                    <TableCell className="text-sm text-muted-foreground">
                      {order.shipment}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/customer-portal/orders/${order.id}`)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title={hasActiveFilters ? 'No orders match your selected filters.' : 'No orders found.'}
                description={
                  hasActiveFilters
                    ? 'Try adjusting or clearing your search and filter parameters.'
                    : 'You do not have any active or past orders on file.'
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(page - 1) * perPage + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(page * perPage, meta.total)}</span> of{' '}
            <span className="font-medium text-foreground">{meta.total}</span> orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
              Previous
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              Page {page} of {meta.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
              disabled={page >= meta.total_pages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
