import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useWarehouses, useWarehouseKpis, useDeleteWarehouse } from '../hooks/use-business-admin'
import type { Warehouse } from '../types'
import { toast } from 'sonner'
import { Plus, Search, Warehouse as WarehouseIcon, CheckCircle, AlertTriangle, Package, MoreHorizontal, Eye, Edit, Power, Trash2, MapPin } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  maintenance: 'warning',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export function WarehouseListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, status: statusFilter, type: typeFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useWarehouses(filters)
  const { data: kpis, isLoading: kpisLoading } = useWarehouseKpis()
  const deleteWarehouse = useDeleteWarehouse()

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

  const handleToggleStatus = (warehouse: Warehouse) => {
    toast.info(`Toggle status for ${warehouse.name} coming soon`)
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
        const percentage = row.storageCapacity > 0
          ? Math.round((row.currentCapacity / row.storageCapacity) * 100)
          : 0
        const isOverThreshold = row.currentCapacity >= row.capacityThreshold
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {formatNumber(row.currentCapacity)} / {formatNumber(row.storageCapacity)}
              </span>
              <span className={`text-[11px] font-medium tabular-nums ${isOverThreshold ? 'text-warning' : 'text-muted-foreground'}`}>
                {percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
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
              <DropdownMenuItem onClick={() => toast.info('Edit coming soon')}>
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
    <div className="space-y-6">
      <PageHeader
        title="Warehouses"
        description="Manage warehouse locations, capacity, and fulfillment settings that drive inventory allocation and shipment routing"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Warehouses', path: '/business-admin/warehouses' },
          { label: 'Warehouse List' },
        ]}
        actions={
          <Button onClick={() => toast.info('Create warehouse coming soon')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Warehouse
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Warehouses" value={kpis?.totalWarehouses ?? 0} icon={<WarehouseIcon className="h-5 w-5" />} />
            <KpiCard label="Active Warehouses" value={kpis?.activeWarehouses ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Total Inventory" value={formatNumber(kpis?.totalInventory ?? 0)} icon={<Package className="h-5 w-5" />} />
            <KpiCard label="Low Stock Items" value={kpis?.lowStockItems ?? 0} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search warehouses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="distribution">Distribution</SelectItem>
            <SelectItem value="fulfillment">Fulfillment</SelectItem>
            <SelectItem value="returns">Returns</SelectItem>
            <SelectItem value="cross_dock">Cross-Dock</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || typeFilter || search) && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load warehouses" onRetry={refetch} />
      ) : !data?.warehouses || data.warehouses.length === 0 ? (
        <EmptyState
          icon={<WarehouseIcon className="h-8 w-8" />}
          title="No warehouses found"
          description="Create your first warehouse to manage inventory and fulfillment."
          action={<Button onClick={() => toast.info('Create warehouse coming soon')}><Plus className="h-4 w-4 mr-1.5" />Create Warehouse</Button>}
        />
      ) : (
        <>
          {/* Desktop table */}
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
              const capacityPct = warehouse.storageCapacity > 0
                ? Math.round((warehouse.currentCapacity / warehouse.storageCapacity) * 100)
                : 0
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
                      <span className={`text-[11px] font-medium tabular-nums ${capacityPct >= warehouse.capacityThreshold ? 'text-warning' : 'text-muted-foreground'}`}>
                        {capacityPct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${capacityPct >= warehouse.capacityThreshold ? 'bg-warning' : 'bg-primary'}`}
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
        </>
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
