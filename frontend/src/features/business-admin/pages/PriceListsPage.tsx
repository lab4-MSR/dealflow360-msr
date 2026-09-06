import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  usePriceLists,
  usePriceListKpis,
  useCreatePriceList,
  useDeletePriceList,
} from '../hooks/use-business-admin'
import type { PriceList } from '../types'
import { toast } from 'sonner'
import { Plus, Search, List, CheckCircle, FileEdit, Package, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const safeFormatDate = (value: string | undefined | null, fmt = 'MMM d, yyyy'): string => {
  if (!value) return '—'
  try {
    const d = parseISO(value)
    if (!isValid(d)) return '—'
    return format(d, fmt)
  } catch {
    return '—'
  }
}

export function PriceListsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    currency: 'INR',
    scope: 'all' as 'all' | 'tier' | 'customer',
    tierScope: '',
    effectiveFrom: '',
    effectiveUntil: '',
  })

  const statusMapping = (v: string) => v === 'all' ? '' : v
  const currencyMapping = (v: string) => v === 'all' ? '' : v
  const filters = { search, status: statusMapping(statusFilter), currency: currencyMapping(currencyFilter), page, perPage: 10 }
  const { data, isLoading, error, refetch } = usePriceLists(filters)
  const { data: kpis, isLoading: kpisLoading } = usePriceListKpis()
  const createPriceList = useCreatePriceList()
  const deletePriceList = useDeletePriceList()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setCurrencyFilter('')
    setPage(1)
  }

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Price list name is required')
      return
    }
    try {
      await createPriceList.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        currency: form.currency,
        status: 'draft',
        scope: form.scope,
        tierScope: form.scope === 'tier' ? form.tierScope : undefined,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveUntil: form.effectiveUntil || undefined,
      })
      toast.success('Price list created')
      setShowCreateDialog(false)
      setForm({ name: '', description: '', currency: 'INR', scope: 'all', tierScope: '', effectiveFrom: '', effectiveUntil: '' })
    } catch {
      toast.error('Failed to create price list')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePriceList.mutateAsync(deleteId)
      toast.success('Price list deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete price list')
    }
  }

  const scopeBadge = (scope: string) => {
    const map: Record<string, { label: string; variant: 'secondary' | 'info' | 'outline' }> = {
      all: { label: 'All Customers', variant: 'secondary' },
      tier: { label: 'Tier-Based', variant: 'info' },
      customer: { label: 'Customer-Specific', variant: 'outline' },
    }
    const cfg = map[scope] || map.all
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const statusVariant = (status: string): 'success' | 'warning' | 'secondary' => {
    if (status === 'active') return 'success'
    if (status === 'draft') return 'warning'
    if (status === 'inactive') return 'secondary'
    return 'secondary'
  }

  const columns: Column<PriceList>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'currency',
      header: 'Currency',
      accessorFn: (row) => <span className="text-[13px] text-muted-foreground tabular-nums">{row.currency}</span>,
    },
    {
      id: 'scope',
      header: 'Scope',
      accessorFn: (row) => scopeBadge(row.scope),
    },
    {
      id: 'items',
      header: 'Items',
      accessorFn: (row) => <span className="text-[13px] text-muted-foreground tabular-nums">{row.itemCount}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      id: 'effective',
      header: 'Effective',
      accessorFn: (row) => {
        if (!row.effectiveFrom && !row.effectiveUntil) {
          return <span className="text-[12px] text-muted-foreground">Always</span>
        }
        const from = row.effectiveFrom ? safeFormatDate(row.effectiveFrom) : '—'
        const until = row.effectiveUntil ? safeFormatDate(row.effectiveUntil) : '—'
        return (
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {from} — {until}
          </span>
        )
      },
    },
    {
      id: 'updated',
      header: 'Updated',
      accessorFn: (row) => (
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {safeFormatDate(row.updatedAt)}
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/pricing/lists/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/business-admin/pricing/lists/${row.id}?edit=1`)}>
                <FileEdit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-destructive">
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
    <div className="space-y-4">
      <PageHeader
        title="Price Lists"
        description="Manage pricing configurations for different customer segments."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Catalog' },
          { label: 'Price Lists' },
        ]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Price List
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Lists" value={kpis?.totalLists ?? 0} icon={<List className="h-5 w-5" />} />
            <KpiCard label="Active Lists" value={kpis?.activeLists ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Draft Lists" value={kpis?.draftLists ?? 0} variant="warning" icon={<FileEdit className="h-5 w-5" />} />
            <KpiCard label="Total Items" value={kpis?.totalItems ?? 0} variant="info" icon={<Package className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search price lists..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select value={currencyFilter || 'all'} onValueChange={(v) => { setCurrencyFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Currencies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="INR">INR</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || currencyFilter || search) && (
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
        <ErrorState title="Failed to load price lists" onRetry={refetch} />
      ) : !data?.priceLists || data.priceLists.length === 0 ? (
        <EmptyState
          icon={<List className="h-8 w-8" />}
          title="No price lists found"
          description="Create your first price list to start configuring pricing."
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Price List
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.priceLists as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/pricing/lists/${(row as unknown as PriceList).id}`)}
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

      {/* Create Price List Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Price List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Standard Pricing"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm((p) => ({ ...p, currency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Scope</Label>
                <Select value={form.scope} onValueChange={(v: 'all' | 'tier' | 'customer') => setForm((p) => ({ ...p, scope: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="tier">Tier-Based</SelectItem>
                    <SelectItem value="customer">Customer-Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.scope === 'tier' && (
              <div className="space-y-1.5">
                <Label>Tier Scope</Label>
                <Select value={form.tierScope} onValueChange={(v) => setForm((p) => ({ ...p, tierScope: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Effective Until</Label>
                <Input
                  type="date"
                  value={form.effectiveUntil}
                  onChange={(e) => setForm((p) => ({ ...p, effectiveUntil: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createPriceList.isPending}>
              {createPriceList.isPending ? 'Creating...' : 'Create Price List'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete price list?"
        description="This will permanently remove the price list and all its items. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deletePriceList.isPending}
      />
    </div>
  )
}
