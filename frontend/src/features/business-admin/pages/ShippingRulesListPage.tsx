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
import { useShippingRules, useShippingRuleKpis, useDeleteShippingRule } from '../hooks/use-business-admin'
import type { ShippingRule } from '../types'
import { toast } from 'sonner'
import { Search, Warehouse as WarehouseIcon, CheckCircle, AlertTriangle, Plus, Eye, Edit, MoreHorizontal, Trash2, Power, Clock } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
}

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export function ShippingRulesListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, status: statusFilter, priority: priorityFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useShippingRules(filters)
  const { data: kpis, isLoading: kpisLoading } = useShippingRuleKpis()
  const deleteShippingRule = useDeleteShippingRule()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setPriorityFilter('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteShippingRule.mutateAsync(deleteId)
      toast.success('Shipping rule deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete shipping rule')
    }
  }

  const columns: Column<ShippingRule>[] = [
    {
      id: 'name',
      header: 'Rule Name',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && <p className="text-[11px] text-muted-foreground">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: (row) => (
        <Badge variant={row.priority === 'high' ? 'destructive' : row.priority === 'normal' ? 'warning' : 'secondary'}>
          {row.priority}
        </Badge>
      ),
    },
    {
      id: 'destination',
      header: 'Destination',
      accessorFn: (row) => (
        <div className="text-[11px] text-muted-foreground">
          {row.destination.country}
          {row.destination.state && `, ${row.destination.state}`}
          {row.destination.postalCode && ` ${row.destination.postalCode}`}
        </div>
      ),
    },
    {
      id: 'allocationStrategy',
      header: 'Strategy',
      accessorFn: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.allocationStrategy.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'shippingMethod',
      header: 'Method',
      accessorFn: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.shippingMethod}
        </span>
      ),
    },
    {
      id: 'minOrderValue',
      header: 'Min Order',
      accessorFn: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.minOrderValue !== undefined ? `₹${row.minOrderValue}` : '—'}
        </span>
      ),
    },
    {
      id: 'maxOrderValue',
      header: 'Max Order',
      accessorFn: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.maxOrderValue !== undefined ? `₹${row.maxOrderValue}` : '—'}
        </span>
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/shipping-rules/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Edit coming soon')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
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
        title="Shipping Rules"
        description="Define shipping rules that control warehouse allocation, shipping methods, and fulfillment behavior based on destination, order value, weight, and product filters"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Warehouses', path: '/business-admin/warehouses' },
          { label: 'Shipping Rules' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/shipping-rules/create')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Rule
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<WarehouseIcon className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Default Rule" value={kpis?.defaultRule !== undefined ? 'Yes' : 'No'} variant={kpis?.defaultRule !== undefined ? 'success' : 'secondary'} icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Inactive Rules" value={5 - (kpis?.activeRules ?? 0)} variant="secondary" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search shipping rules..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex h-10 w-full rounded-lg border border-background bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || priorityFilter || search) && (
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
        <ErrorState title="Failed to load shipping rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState
          icon={<WarehouseIcon className="h-8 w-8" />}
          title="No shipping rules found"
          description="Create your first shipping rule to define fulfillment behavior and warehouse allocation."
          action={<Button onClick={() => navigate('/business-admin/shipping-rules/create')}><Plus className="h-4 w-4 mr-1.5" />Create Rule</Button>}
        />
      ) : (
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={data.rules as unknown as Record<string, unknown>[]}
          onRowClick={(row) => navigate(`/business-admin/shipping-rules/${(row as unknown as ShippingRule).id}`)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete shipping rule?"
        description="This action may affect active orders and fulfillment decisions. Ensure no active orders reference this rule before deleting."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteShippingRule.isPending}
      />
    </div>
  )
}