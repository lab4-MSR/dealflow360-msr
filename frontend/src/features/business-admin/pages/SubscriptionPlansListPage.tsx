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
import { useSubscriptionPlans, useSubscriptionPlanKpis, useDeleteSubscriptionPlan } from '../hooks/use-business-admin'
import type { SubscriptionPlan } from '../types'
import { toast } from 'sonner'
import { Search, Plus, Eye, Edit, MoreHorizontal, Trash2, CheckCircle, UserCog, AlertTriangle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

export function SubscriptionPlansListPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planTypeFilter, setPlanTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, status: statusFilter, planType: planTypeFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useSubscriptionPlans(filters)
  const { data: kpis, isLoading: kpisLoading } = useSubscriptionPlanKpis()
  const deletePlan = useDeleteSubscriptionPlan()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setPlanTypeFilter('')
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePlan.mutateAsync(deleteId)
      toast.success('Subscription plan deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete subscription plan')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' },
  ]

  const planTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi_annual', label: 'Semi-Annual' },
    { value: 'annual', label: 'Annual' },
    { value: 'trial', label: 'Trial' },
  ]

  const columns: Column<SubscriptionPlan>[] = [
    {
      id: 'name',
      header: 'Plan Name',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && <p className="text-[11px] text-muted-foreground">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground font-medium">
          ₹{row.price}
        </span>
      ),
    },
    {
      id: 'billingCycle',
      header: 'Billing Cycle',
      accessorFn: (row) => (
        <span className="text-[11px] text-muted-foreground">
          {row.billingCycle}
        </span>
      ),
    },
    {
      id: 'planType',
      header: 'Plan Type',
      accessorFn: (row) => (
        <Badge variant={row.planType === 'trial' ? 'info' : 'secondary'}>
          {row.planType}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : row.status === 'draft' ? 'warning' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'subscribers',
      header: 'Subscribers',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">
          {formatNumber(row.usageLimits?.[0]?.limit || 0)}
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/subscription-plans/${row.id}`)}>
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
        title="Subscription Plans"
        description="Manage subscription plans that drive recurring revenue, billing cycles, and subscriber management"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Subscriptions', path: '/business-admin/subscription-plans' },
          { label: 'Plans' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/subscription-plans/create')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Plan
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Plans" value={kpis?.totalPlans ?? 0} icon={<Plus className="h-5 w-5" />} />
            <KpiCard label="Active Plans" value={kpis?.activePlans ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Total Subscribers" value={formatNumber(kpis?.totalSubscribers ?? 0)} icon={<UserCog className="h-5 w-5" />} />
            <KpiCard label="Inactive Plans" value={5 - (kpis?.activePlans ?? 0)} variant="secondary" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search plans..."
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
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={planTypeFilter} onValueChange={(v) => { setPlanTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            {planTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(statusFilter || planTypeFilter || search) && (
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
        <ErrorState title="Failed to load subscription plans" onRetry={refetch} />
      ) : !data?.plans || data.plans.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-8 w-8" />}
          title="No subscription plans found"
          description="Create your first subscription plan to start recurring billing."
          action={<Button onClick={() => navigate('/business-admin/subscription-plans/create')}><Plus className="h-4 w-4 mr-1.5" />Create Plan</Button>}
        />
      ) : (
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={data.plans as unknown as Record<string, unknown>[]}
          onRowClick={(row) => navigate(`/business-admin/subscription-plans/${(row as unknown as SubscriptionPlan).id}`)}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete subscription plan?"
        description="This plan may be used by active subscriptions. Ensure no active subscriptions reference this plan before deleting. Plans with subscriptions can be set to Inactive instead."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deletePlan.isPending}
      />
    </div>
  )
}
