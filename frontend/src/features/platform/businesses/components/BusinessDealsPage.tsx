import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { DataTable, type Column } from '@/components/ui/datatable'
import { Pagination } from '@/components/ui/datatable/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBusinessDeals, useBusinessDealKpis } from '../hooks/use-businesses'
import type { BusinessDealFilters, DealStatus, BusinessDeal } from '../types'
import {
  FileText,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  X,
} from 'lucide-react'
import { format } from 'date-fns'

const STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  fulfillment: 'Fulfillment',
  completed: 'Completed',
  failed: 'Failed',
}

const STATUS_VARIANTS: Record<DealStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  negotiation: 'warning',
  confirmed: 'success',
  fulfillment: 'info',
  completed: 'success',
  failed: 'danger',
}

const RISK_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
}

const RISK_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy')
}

export function BusinessDealsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BusinessDealFilters>({ page: 1, perPage: 25 })
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: dealsResponse, isLoading, error, refetch } = useBusinessDeals(id || '', filters)
  const { data: kpis, isLoading: kpisLoading } = useBusinessDealKpis(id || '')
  const businessCurrency = (dealsResponse as any)?.currency || 'INR'

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput || undefined, page: 1 }))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const handleFilterChange = (key: keyof BusinessDealFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, perPage: 25 })
    setSearchInput('')
  }

  const hasActiveFilters = filters.search || filters.status || filters.risk || filters.salesRep || filters.dateFrom || filters.dateTo

  const columns: Column<BusinessDeal>[] = [
    {
      id: 'deal',
      header: 'Deal',
      accessorFn: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium text-foreground truncate">{row.name}</p>
            <p className="text-caption text-muted-foreground truncate">ID: {row.id}</p>
          </div>
        </div>
      ),
      className: 'min-w-[200px]',
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorFn: (row) => (
        <span className="text-small text-foreground">{row.customer}</span>
      ),
      className: 'min-w-[150px]',
    },
    {
      id: 'salesRep',
      header: 'Sales Rep',
      accessorFn: (row) => (
        <span className="text-small text-foreground">{row.salesRep}</span>
      ),
      className: 'min-w-[130px]',
    },
    {
      id: 'value',
      header: 'Value',
      accessorFn: (row) => (
        <span className="text-small tabular-nums font-medium">
          {formatCurrency(row.value, businessCurrency)}
        </span>
      ),
      headerClassName: 'text-right',
      className: 'text-right',
    },
    {
      id: 'risk',
      header: 'Risk',
      accessorFn: (row) => (
        <Badge variant={RISK_VARIANTS[row.risk] || 'secondary'}>
          {RISK_LABELS[row.risk] || row.risk}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={STATUS_VARIANTS[row.status] || 'secondary'}>
          {STATUS_LABELS[row.status] || row.status}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorFn: (row) => (
        <span className="text-small text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/platform/deals/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
            View Deal
          </Button>
        </div>
      ),
      headerClassName: 'w-[120px]',
      className: 'w-[120px]',
    },
  ]

  if (error) {
    return (
      <ErrorState
        title="We couldn't load deals"
        description="An error occurred while fetching the deal list. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-h1 text-foreground">Business Deals</h1>
        <p className="text-body text-muted-foreground mt-1">
          Manage and review all deals for this business.
        </p>
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Deals"
            value={kpis.totalDeals.toLocaleString()}
            icon={<FileText className="h-5 w-5" />}
          />
          <KpiCard
            label="Open Deals"
            value={kpis.openDeals.toLocaleString()}
            variant="info"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Won Deals"
            value={kpis.wonDeals.toLocaleString()}
            variant="success"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KpiCard
            label="Lost Deals"
            value={kpis.lostDeals.toLocaleString()}
            variant="danger"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <KpiCard
            label="Total Deal Value"
            value={formatCurrency(kpis.totalDealValue, businessCurrency)}
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>
      ) : null}

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? undefined : v as DealStatus)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="fulfillment">Fulfillment</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.risk || 'all'}
              onValueChange={(v) => handleFilterChange('risk', v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.salesRep || 'all'}
              onValueChange={(v) => handleFilterChange('salesRep', v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sales Rep" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sales Reps</SelectItem>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Jane Doe">Jane Doe</SelectItem>
                <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                <SelectItem value="Tom Brown">Tom Brown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-3">
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground">From:</span>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="w-full sm:w-[150px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground">To:</span>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                className="w-full sm:w-[150px]"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 ml-auto">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Deals Table */}
      {isLoading ? (
        <div className="rounded-xl border border-border">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 h-14">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px] ml-auto" />
                <Skeleton className="h-5 w-[70px] rounded-full" />
                <Skeleton className="h-5 w-[80px] rounded-full" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[90px] rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : dealsResponse && dealsResponse.deals.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns as any}
              data={dealsResponse.deals as unknown as Record<string, unknown>[]}
              getRowId={(row) => row.id as string}
            />
          </div>
          <Pagination
            page={dealsResponse.page}
            totalPages={dealsResponse.totalPages}
            total={dealsResponse.total}
            perPage={dealsResponse.perPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No deals found"
          description={
            hasActiveFilters
              ? "No deals match your current filters."
              : "This business doesn't have any deals yet."
          }
          action={
            hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : null
          }
        />
      )}
    </div>
  )
}


