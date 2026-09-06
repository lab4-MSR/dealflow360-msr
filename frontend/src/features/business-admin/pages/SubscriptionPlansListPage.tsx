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
import { useSubscriptionPlans, useSubscriptionPlanKpis, useDeleteSubscriptionPlan } from '../hooks/use-business-admin'
import type { SubscriptionPlan } from '../types'
import { toast } from 'sonner'
import { Search, Plus, Eye, Edit, MoreHorizontal, Trash2, CheckCircle, UserCog, AlertTriangle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US').format(value)

const formatPrice = (plan: SubscriptionPlan) => {
  const amount = plan.price ?? 0
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: plan.currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `₹${amount}`
  }
}

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

  // Draft count derived from the loaded page; falls back to total - active when empty.
  const draftPlansCount = data?.plans?.length
    ? data.plans.filter((p) => p.status === 'draft').length
    : Math.max(0, (kpis?.totalPlans ?? 0) - (kpis?.activePlans ?? 0))

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
          {formatPrice(row)}
          {row.billingFrequency ? (
            <span className="text-[11px] text-muted-foreground font-normal"> / {row.billingFrequency}</span>
          ) : null}
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
          {formatNumber(row.subscriberCount ?? 0)}
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/subscriptions/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/business-admin/subscriptions/${row.id}`)}>
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
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Subscription Plans & Billing Models
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Recurring Engine Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define recurring pricing models, proration schedules, usage limits, and trial terms.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/subscriptions/create')}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => { setStatusFilter('active'); setPage(1) }}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all cursor-pointer whitespace-nowrap"
        >
          Active Plans ({kpis?.activePlans ?? 0})
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/subscriptions/billing-cycles')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Billing Cycles & Schedules
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/subscriptions/proration-cancellation')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Proration & Cancellation Rules
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
                <span className="text-xs font-semibold uppercase tracking-wider">Total Tiers</span>
                <div className="p-1.5 rounded-lg bg-muted/60"><Plus className="h-4 w-4 text-foreground/80" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{kpis?.totalPlans ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Configured recurring offerings</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Published</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">{kpis?.activePlans ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Open for sales subscription</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Subscribers</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10"><UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-blue-600 dark:text-blue-400">{formatNumber(kpis?.totalSubscribers ?? 0)}</p>
              <span className="text-[11px] text-muted-foreground">Customers on recurring cycle</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Draft Plans</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">
                {draftPlansCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Staging / unreleased</span>
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
              placeholder="Search plan name or code..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3 text-xs font-medium" onClick={handleSearch}>
            Search
          </Button>

          <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={planTypeFilter || 'all'} onValueChange={(v) => { setPlanTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              {planTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(statusFilter || planTypeFilter || search) && (
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
        <ErrorState title="Failed to load subscription plans" onRetry={refetch} />
      ) : !data?.plans || data.plans.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-8 w-8" />}
          title="No subscription plans found"
          description="Create your first subscription plan to begin recurring subscription contracts."
          action={<Button size="sm" onClick={() => navigate('/business-admin/subscriptions/create')}><Plus className="h-4 w-4 mr-1.5" />Create Plan</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <DataTable
            columns={columns}
            data={data.plans}
            getRowId={(row) => row.id}
            onRowClick={(row) => navigate(`/business-admin/subscriptions/${row.id}`)}
          />
          <div className="flex justify-end p-3 border-t border-border/60">
            <Pagination
              page={page}
              totalPages={data.totalPages ?? 1}
              total={data.total ?? 0}
              perPage={10}
              onPageChange={setPage}
            />
          </div>
        </div>
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
