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
import { useCustomers, useCustomerKpis, useDeleteCustomer } from '../hooks/use-business-admin'
import type { Customer } from '../types'
import { toast } from 'sonner'
import { Plus, Search, Users, UserCheck, DollarSign, TrendingUp, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const TIER_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'default'> = {
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
  platinum: 'default',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'danger'> = {
  active: 'success',
  inactive: 'secondary',
  suspended: 'danger',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export function CustomersPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, tier: tierFilter, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useCustomers(filters)
  const { data: kpis, isLoading: kpisLoading } = useCustomerKpis()
  const deleteCustomer = useDeleteCustomer()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCustomer.mutateAsync(deleteId)
      toast.success('Customer deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete customer')
    }
  }

  const columns: Column<Customer>[] = [
    {
      id: 'customer', header: 'Customer',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.contacts[0]?.email || '—'}</p>
        </div>
      ),
    },
    { id: 'tier', header: 'Tier', accessorFn: (row) => (
      <Badge variant={TIER_VARIANT[row.tier] || 'secondary'}>{row.tier}</Badge>
    )},
    { id: 'owner', header: 'Owner', accessorFn: (row) => (
      <span className="text-[13px] text-muted-foreground">{row.ownerName || '—'}</span>
    )},
    { id: 'revenue', header: 'Revenue', accessorFn: (row) => (
      <span className="text-[13px] text-foreground tabular-nums font-medium">{formatCurrency(row.totalRevenue)}</span>
    )},
    { id: 'status', header: 'Status', accessorFn: (row) => (
      <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>{row.status}</Badge>
    )},
    { id: 'deals', header: 'Deals', accessorFn: (row) => (
      <span className="text-[13px] text-muted-foreground tabular-nums">{row.totalDeals}</span>
    )},
    {
      id: 'actions', header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/customers/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
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
        title="Customers"
        description="Manage your customer accounts and relationships."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/customers/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Customers" value={kpis?.totalCustomers ?? 0} icon={<Users className="h-5 w-5" />} />
            <KpiCard label="Active Customers" value={kpis?.activeCustomers ?? 0} variant="success" icon={<UserCheck className="h-5 w-5" />} />
            <KpiCard label="Total Revenue" value={formatCurrency(kpis?.totalRevenue ?? 0)} icon={<DollarSign className="h-5 w-5" />} />
            <KpiCard label="Average Deal Size" value={formatCurrency(kpis?.averageDealSize ?? 0)} variant="info" icon={<TrendingUp className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search customers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Tiers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {(tierFilter || statusFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setTierFilter(''); setStatusFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}>
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
        <ErrorState title="Failed to load customers" onRetry={refetch} />
      ) : !data?.customers || data.customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No customers found"
          description="Add your first customer to get started."
          action={<Button onClick={() => navigate('/business-admin/customers/new')}><Plus className="h-4 w-4 mr-1.5" />Add Customer</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.customers as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/customers/${(row as unknown as Customer).id}`)}
          />
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
        title="Delete customer?"
        description="This action cannot be undone. All customer data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteCustomer.isPending}
      />
    </div>
  )
}
