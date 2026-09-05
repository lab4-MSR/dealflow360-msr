import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column, Pagination } from '@/components/ui/datatable'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useBusinesses,
  useBusinessKpis,
  useUpdateBusinessStatus,
  useBulkAction,
} from '../hooks/use-businesses'
import type { Business, BusinessListFilters, BusinessStatus } from '../types'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Play,
  Pause,
  Building2,
  Download,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusLabel: Record<BusinessStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_setup: 'Pending Setup',
}

const statusVariant: Record<BusinessStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  suspended: 'warning',
  pending_setup: 'warning',
}

const statusDot: Record<BusinessStatus, string> = {
  active: 'bg-success',
  suspended: 'bg-warning',
  pending_setup: 'bg-warning',
}

export function AllBusinessesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BusinessListFilters>({ page: 1, perPage: 25 })
  const [searchInput, setSearchInput] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionRow, setActionRow] = useState<Business | null>(null)
  const [bulkActionType, setBulkActionType] = useState<'activate' | 'suspend' | null>(null)

  const { data, isLoading, error, refetch } = useBusinesses(filters)
  const { data: kpis, isLoading: kpisLoading } = useBusinessKpis()
  const updateStatus = useUpdateBusinessStatus()
  const bulkMutation = useBulkAction()

  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }))
  }, [searchInput])

  const handleFilterChange = (key: keyof BusinessListFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleRowAction = (action: string, business: Business) => {
    if (action === 'view') {
      navigate(`/platform/businesses/${business.id}`)
    } else if (action === 'activate') {
      setActionRow(business)
    } else if (action === 'suspend') {
      setActionRow(business)
    }
  }

  const handleStatusConfirm = async () => {
    if (!actionRow) return
    const newStatus = actionRow.status === 'active' ? 'suspended' : 'active'
    await updateStatus.mutateAsync({ id: actionRow.id, status: newStatus })
    setActionRow(null)
  }

  const handleBulkConfirm = async () => {
    if (!bulkActionType) return
    await bulkMutation.mutateAsync({ ids: selectedIds, action: bulkActionType })
    setSelectedIds([])
    setBulkActionType(null)
  }

  const columns: Column<Business>[] = [
    {
      id: 'business',
      header: 'Business',
      accessorFn: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-caption font-medium text-muted-foreground">
            {row.logo ? (
              <img src={row.logo} alt="" className="h-9 w-9 rounded-lg object-cover" />
            ) : (
              row.name.charAt(0)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium text-foreground truncate">{row.name}</p>
            {row.legalName && (
              <p className="text-caption text-muted-foreground truncate">{row.legalName}</p>
            )}
          </div>
        </div>
      ),
      className: 'min-w-[200px]',
    },
    {
      id: 'admin',
      header: 'Business Admin',
      accessorFn: (row) =>
        row.admin ? (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-caption font-medium text-primary">
              {row.admin.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-small truncate">{row.admin.name}</p>
              <p className="text-caption text-muted-foreground truncate">{row.admin.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-small text-muted-foreground">Not assigned</span>
        ),
      className: 'min-w-[180px]',
    },
    {
      id: 'users',
      header: 'Users',
      accessorFn: (row) => (
        <span className="text-small tabular-nums">{row.usersCount}</span>
      ),
    },
    {
      id: 'deals',
      header: 'Deals',
      accessorFn: (row) => (
        <span className="text-small tabular-nums">{row.dealsCount.toLocaleString()}</span>
      ),
    },
    {
      id: 'revenue',
      header: 'Revenue',
      accessorFn: (row) => (
        <span className="text-small tabular-nums font-medium">
          {formatCurrency(row.revenue, row.currency)}
        </span>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <div className="flex items-center gap-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot[row.status])} />
          <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
        </div>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      accessorFn: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-small text-muted-foreground cursor-default">
                {formatDate(row.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{new Date(row.createdAt).toLocaleString()}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRowAction('view', row)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {row.status !== 'active' && (
                <DropdownMenuItem onClick={() => handleRowAction('activate', row)}>
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
              )}
              {row.status === 'active' && (
                <DropdownMenuItem onClick={() => handleRowAction('suspend', row)}>
                  <Pause className="h-4 w-4 mr-2" />
                  Suspend
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      headerClassName: 'w-12',
      className: 'w-12',
    },
  ]

  if (error) {
    return (
      <ErrorState
        title="We couldn't load businesses"
        description="An error occurred while fetching the business list. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-foreground">Businesses</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage organizations, business accounts, plans, and platform activity.
          </p>
        </div>
        <Button onClick={() => navigate('/platform/businesses/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Business
        </Button>
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[80px] mb-2" />
              <Skeleton className="h-7 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[50px]" />
            </div>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Businesses"
            value={kpis.total.toLocaleString()}
            icon={<Building2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Active"
            value={kpis.active.toLocaleString()}
            variant="success"
            icon={<Building2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Suspended"
            value={kpis.suspended.toLocaleString()}
            variant="warning"
            icon={<Building2 className="h-5 w-5" />}
          />
          <KpiCard
            label="Pending Setup"
            value={kpis.pendingSetup.toLocaleString()}
            variant="info"
            icon={<Building2 className="h-5 w-5" />}
          />
        </div>
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? undefined : v as BusinessStatus)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending_setup">Pending Setup</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.plan || 'all'}
              onValueChange={(v) => handleFilterChange('plan', v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleSearch} className="shrink-0">
              Search
            </Button>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.status || filters.plan) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-caption text-muted-foreground">Active filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <button onClick={() => { setFilters((p) => ({ ...p, search: undefined, page: 1 })); setSearchInput('') }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusLabel[filters.status]}
                  <button onClick={() => handleFilterChange('status', undefined)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.plan && (
                <Badge variant="secondary" className="gap-1">
                  Plan: {filters.plan}
                  <button onClick={() => handleFilterChange('plan', undefined)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={() => { setFilters({ page: 1, perPage: 25 }); setSearchInput('') }}
                className="text-caption text-primary hover:text-primary-hover transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-subtle px-4 py-3">
          <span className="text-small font-medium text-primary">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkActionType('activate')}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkActionType('suspend')}
            >
              Suspend
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-3.5 w-3.5 mr-1" />
              Export
            </Button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 h-14">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[120px] ml-auto" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-[70px] rounded-full" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : data && data.businesses.length > 0 ? (
        <>
          <DataTable
            columns={columns}
            data={data.businesses as unknown as Record<string, unknown>[]}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            getRowId={(row) => row.id as string}
            onRowClick={(row) => navigate(`/platform/businesses/${(row as unknown as Business).id}`)}
          />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            perPage={data.perPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title="No businesses found"
          description={
            filters.search || filters.status || filters.plan
              ? "No businesses match your current filters."
              : "Create your first business to start managing organizations on the DealFlow360 platform."
          }
          action={
            filters.search || filters.status || filters.plan ? (
              <Button variant="outline" onClick={() => { setFilters({ page: 1, perPage: 25 }); setSearchInput('') }}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/platform/businesses/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Business
              </Button>
            )
          }
        />
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={!!actionRow}
        onOpenChange={() => setActionRow(null)}
        title={actionRow?.status === 'active' ? `Suspend ${actionRow?.name}?` : `Activate ${actionRow?.name}?`}
        description={
          actionRow?.status === 'active'
            ? 'Users in this business may lose access to normal platform operations until the business is reactivated.'
            : 'This will restore normal platform operations for all users in this business.'
        }
        confirmLabel={actionRow?.status === 'active' ? 'Suspend Business' : 'Activate Business'}
        variant={actionRow?.status === 'active' ? 'danger' : 'default'}
        onConfirm={handleStatusConfirm}
        loading={updateStatus.isPending}
      />

      <ConfirmDialog
        open={!!bulkActionType}
        onOpenChange={() => setBulkActionType(null)}
        title={bulkActionType === 'activate' ? `Activate ${selectedIds.length} businesses?` : `Suspend ${selectedIds.length} businesses?`}
        description={
          bulkActionType === 'activate'
            ? 'This will restore normal platform operations for all selected businesses.'
            : 'Users in selected businesses may lose access to normal platform operations until reactivated.'
        }
        confirmLabel={bulkActionType === 'activate' ? 'Activate Businesses' : 'Suspend Businesses'}
        variant={bulkActionType === 'suspend' ? 'danger' : 'default'}
        onConfirm={handleBulkConfirm}
        loading={bulkMutation.isPending}
      />
    </div>
  )
}
