import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Truck, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Eye, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { getCustomerShipments, type ShipmentFilters } from '@/lib/customer-portal-api'

export function ShipmentListPage() {
  const navigate = useNavigate()

  // State for search, status filter, and pagination
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const perPage = 10

  const queryFilters: ShipmentFilters = {
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: perPage,
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer-shipments', queryFilters],
    queryFn: () => getCustomerShipments(queryFilters),
  })

  const shipments = data?.shipments ?? []
  const kpis = data?.kpis ?? { processing: 0, in_transit: 0, delivered: 0, delayed: 0 }
  const meta = data?.meta ?? { page: 1, per_page: 10, total: 0, total_pages: 1 }

  const hasActiveFilters = search !== '' || statusFilter !== 'all'

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
          <p className="text-sm text-muted-foreground">Track and monitor status of your order deliveries in real time</p>
        </div>

        {/* Page Header Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search shipment, order, carrier..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-sm"
            />
          </div>

          {/* Filters */}
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
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

      {/* Shipment KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Processing"
          value={isLoading ? '...' : kpis.processing}
          change={{ value: 0, label: 'shipments being prepped' }}
          icon={<Clock className="h-5 w-5 text-blue-600" />}
        />
        <KpiCard
          title="In Transit"
          value={isLoading ? '...' : kpis.in_transit}
          change={{ value: 0, label: 'active deliveries' }}
          icon={<Truck className="h-5 w-5 text-amber-600" />}
        />
        <KpiCard
          title="Delivered"
          value={isLoading ? '...' : kpis.delivered}
          change={{ value: 0, label: 'successfully delivered' }}
          icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
        />
        <KpiCard
          title="Delayed"
          value={isLoading ? '...' : kpis.delayed}
          change={{ value: 0, label: 'attention needed' }}
          icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
        />
      </div>

      {/* Shipment Content / Table */}
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
              <p className="font-medium text-destructive">Failed to load shipments</p>
              <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4" size="sm">
                Try Again
              </Button>
            </div>
          ) : shipments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Truck}
                title="No shipments found"
                description={
                  hasActiveFilters
                    ? 'No shipments match your search criteria. Try adjusting your search or filters.'
                    : 'You currently have no active or historical shipments.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[140px]">Shipment</TableHead>
                    <TableHead className="w-[140px]">Order</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETA / Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary">
                        <button
                          onClick={() => navigate(`/customer-portal/shipments/${shipment.id}`)}
                          className="hover:underline focus:outline-none"
                        >
                          {shipment.id}
                        </button>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <button
                          onClick={() => navigate(`/customer-portal/orders/${shipment.order_id}`)}
                          className="hover:underline focus:outline-none hover:text-foreground"
                        >
                          {shipment.order_number || shipment.order_id}
                        </button>
                      </TableCell>

                      <TableCell className="text-sm font-medium">
                        {shipment.carrier}
                      </TableCell>

                      <TableCell className="text-sm font-mono text-xs text-muted-foreground">
                        {shipment.tracking_number ? (
                          <div className="flex items-center gap-1.5">
                            <span>{shipment.tracking_number}</span>
                            {shipment.tracking_url && (
                              <a
                                href={shipment.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                                title="Open Carrier Tracking"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={shipment.status} />
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {shipment.expected_delivery || shipment.delivery_date || 'TBD'}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/customer-portal/shipments/${shipment.id}`)}
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
                <span className="font-medium text-foreground">{meta.total}</span> shipments
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
