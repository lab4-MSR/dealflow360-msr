import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useWarehouses, useWarehouseKpis, useDeleteWarehouse, useUpdateWarehouse } from '../hooks/use-business-admin'
import type { Warehouse, WarehouseFilters } from '../types'
import { toast } from 'sonner'
import { Plus, Search, Warehouse as WarehouseIcon, CheckCircle, AlertTriangle, Package, MoreHorizontal, Eye, Edit, Power, Trash2, MapPin } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  maintenance: 'warning',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN').format(value)

export function WarehouseListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters: WarehouseFilters = { search, status: statusFilter, type: typeFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useWarehouses(filters)
  const { data: kpis, isLoading: kpisLoading } = useWarehouseKpis()
  const deleteWarehouse = useDeleteWarehouse()
  const updateWarehouse = useUpdateWarehouse()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setTypeFilter('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteWarehouse.mutateAsync(deleteId)
      toast.success('Warehouse deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete warehouse')
    }
  }

  const handleToggleStatus = async (warehouse: Warehouse) => {
    const nextStatus = warehouse.status === 'active' ? 'inactive' : 'active'
    try {
      await updateWarehouse.mutateAsync({ id: warehouse.id, data: { status: nextStatus } })
      toast.success(`Warehouse ${nextStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update warehouse status')
    }
  }

  // capacityThreshold is stored as a percent (0-100); compare percent-to-percent consistently.
  const getCapacityPct = (w: Warehouse) => {
    const storage = (w as unknown as { storageCapacity?: number }).storageCapacity ?? 0
    const current = (w as unknown as { currentCapacity?: number }).currentCapacity ?? 0
    return storage > 0 ? Math.round((current / storage) * 100) : 0
  }
  const isOverThresholdPct = (w: Warehouse) => {
    const threshold = (w as unknown as { capacityThreshold?: number }).capacityThreshold ?? 100
    return getCapacityPct(w) >= threshold
  }

  const columns: Column<Warehouse>[] = [
    {
      id: 'warehouse',
      header: 'Warehouse',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.code}</p>
        </div>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      accessorFn: (row) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[13px] text-muted-foreground">
            {row.address.city}, {row.address.country}
          </span>
        </div>
      ),
    },
    {
      id: 'inventory',
      header: 'Inventory',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">
          {formatNumber(row.totalInventory)}
        </span>
      ),
    },
    {
      id: 'capacity',
      header: 'Capacity',
      accessorFn: (row) => {
        const w = row as unknown as { storageCapacity?: number; currentCapacity?: number }
        const storage = w.storageCapacity ?? 0
        const current = w.currentCapacity ?? 0
        const percentage = storage > 0 ? Math.round((current / storage) * 100) : 0
        const isOverThreshold = isOverThresholdPct(row)
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {formatNumber(current)} / {formatNumber(storage)}
              </span>
              <span className={`text-[11px] font-medium tabular-nums ${isOverThreshold ? 'text-warning' : 'text-muted-foreground'}`}>
                {percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOverThreshold ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      id: 'shipments',
      header: 'Shipments',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {row.pendingShipments} pending
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>{row.status}</Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/warehouses/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/business-admin/warehouses/${row.id}?edit=1`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                <Power className="h-4 w-4 mr-2" />
                {row.status === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Warehouses & Fulfillment
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Logistics Network Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage regional depot locations, bin capacities, and automated freight carrier dispatch rules.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/warehouses/create')}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all cursor-pointer whitespace-nowrap"
        >
          Depots & Locations ({kpis?.totalWarehouses ?? 0})
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/warehouses/shipping-rules')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Freight & Dispatch Rules
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Depots</span>
                <div className="p-1.5 rounded-lg bg-muted/60"><WarehouseIcon className="h-4 w-4 text-foreground/80" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{kpis?.totalWarehouses ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Fulfillment facilities</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Depots</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">{kpis?.activeWarehouses ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Receiving and dispatching</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Stock Units Stored</span>
                <div className="p-1.5 rounded-lg bg-primary/10"><Package className="h-4 w-4 text-primary" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{formatNumber(kpis?.totalInventory ?? 0)}</p>
              <span className="text-[11px] text-muted-foreground">Cumulative catalog inventory</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Depleted SKUs</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">{kpis?.lowStockItems ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Requires inventory re-order</span>
            </div>
          </>
        )}
      </div>

      {/* Modern Filter Toolbar */}
      <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-xs"
              placeholder="Search warehouse name or facility code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3 text-xs font-medium" onClick={handleSearch}>
            Search
          </Button>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="distribution">Distribution</SelectItem>
              <SelectItem value="fulfillment">Fulfillment</SelectItem>
              <SelectItem value="returns">Returns</SelectItem>
              <SelectItem value="cross_dock">Cross-Dock</SelectItem>
            </SelectContent>
          </Select>

          {(statusFilter || typeFilter || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={handleClearFilters}
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load warehouses" onRetry={refetch} />
      ) : !data?.warehouses || data.warehouses.length === 0 ? (
        <EmptyState
          icon={<WarehouseIcon className="h-8 w-8" />}
          title="No warehouses configured"
          description="Create your first warehouse facility to manage inventory stocking and order fulfillment."
          action={<Button size="sm" onClick={() => navigate('/business-admin/warehouses/create')}><Plus className="h-4 w-4 mr-1.5" />Add Warehouse</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="hidden md:block">
            <DataTable
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              data={data.warehouses as unknown as Record<string, unknown>[]}
              onRowClick={(row) => navigate(`/business-admin/warehouses/${(row as unknown as Warehouse).id}`)}
            />
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.warehouses.map((warehouse) => {
              const capacityPct = getCapacityPct(warehouse)
              const overThreshold = isOverThresholdPct(warehouse)
              return (
                <div
                  key={warehouse.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3 cursor-pointer"
                  onClick={() => navigate(`/business-admin/warehouses/${warehouse.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{warehouse.name}</p>
                      <p className="text-[11px] text-muted-foreground">{warehouse.code}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[warehouse.status] || 'secondary'}>{warehouse.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">{warehouse.address.city}, {warehouse.address.country}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <p className="text-muted-foreground">Inventory</p>
                      <p className="font-medium text-foreground tabular-nums">{formatNumber(warehouse.totalInventory)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending Shipments</p>
                      <p className="font-medium text-foreground tabular-nums">{warehouse.pendingShipments}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-muted-foreground">Capacity</span>
                      <span className={`text-[11px] font-medium tabular-nums ${capacityPct >= ((warehouse as unknown as { capacityThreshold?: number }).capacityThreshold ?? 100) ? 'text-warning' : 'text-muted-foreground'}`}>
                        {capacityPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${overThreshold ? 'bg-warning' : 'bg-primary'}`}
                        style={{ width: `${Math.min(capacityPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              perPage={data.perPage}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete warehouse?"
        description="This action cannot be undone. All warehouse data, inventory records, and shipment history will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteWarehouse.isPending}
      />
    </div>
  )
}
