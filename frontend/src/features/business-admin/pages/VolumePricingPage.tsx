import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { MoneyDisplay, ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  useVolumePricingRules,
  useVolumePricingKpis,
  useCreateVolumePricingRule,
  useUpdateVolumePricingRule,
  useDeleteVolumePricingRule,
  useProducts,
} from '../hooks/use-business-admin'
import type { VolumePricingRule, VolumePricingTierItem } from '../types'
import { toast } from 'sonner'
import { Plus, Search, BarChart3, ToggleLeft, ToggleRight, MoreHorizontal, Edit, Trash2, Layers, Package } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const INPUT_CLASS = 'flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

interface TierDraft {
  id: string
  minQuantity: string
  maxQuantity: string
  unitPrice: string
  discountPercent: string
}

const createEmptyTier = (): TierDraft => ({
  id: `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  minQuantity: '',
  maxQuantity: '',
  unitPrice: '',
  discountPercent: '',
})

function formatTiers(tiers: VolumePricingTierItem[]): string {
  if (!tiers || tiers.length === 0) return '—'
  return tiers
    .sort((a, b) => a.minQuantity - b.minQuantity)
    .map((t) => {
      const range = t.maxQuantity ? `${t.minQuantity}-${t.maxQuantity}` : `${t.minQuantity}+`
      return `${range}: $${t.unitPrice.toLocaleString()}`
    })
    .join(' | ')
}

export function VolumePricingPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<VolumePricingRule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [tiers, setTiers] = useState<TierDraft[]>([createEmptyTier()])

  const filters = { search, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useVolumePricingRules(filters)
  const { data: kpis, isLoading: kpisLoading } = useVolumePricingKpis()
  const { data: productData } = useProducts({ page: 1, perPage: 100 })
  const createRule = useCreateVolumePricingRule()
  const updateRule = useUpdateVolumePricingRule()
  const deleteRule = useDeleteVolumePricingRule()

  const products = useMemo(() => {
    return (productData?.products || []) as Array<{ id: string; name: string; sku: string }>
  }, [productData])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatusFilter('')
    setPage(1)
  }

  const validateTiers = (): boolean => {
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i]
      const min = parseInt(t.minQuantity)
      const max = t.maxQuantity ? parseInt(t.maxQuantity) : undefined
      const price = parseFloat(t.unitPrice)

      if (isNaN(min) || min <= 0) {
        toast.error(`Tier ${i + 1}: Minimum quantity must be greater than 0`)
        return false
      }
      if (t.maxQuantity && (isNaN(max!) || max! < min)) {
        toast.error(`Tier ${i + 1}: Maximum quantity must be >= minimum`)
        return false
      }
      if (isNaN(price) || price <= 0) {
        toast.error(`Tier ${i + 1}: Price must be greater than 0`)
        return false
      }
      for (let j = 0; j < i; j++) {
        const other = tiers[j]
        const otherMin = parseInt(other.minQuantity)
        const otherMax = other.maxQuantity ? parseInt(other.maxQuantity) : Infinity
        if (min <= otherMax && max !== undefined && max >= otherMin) {
          toast.error(`Tier ${i + 1} overlaps with Tier ${j + 1}`)
          return false
        }
      }
    }
    return true
  }

  const resetDialog = () => {
    setSelectedProductId('')
    setTiers([createEmptyTier()])
    setShowCreateDialog(false)
    setShowEditDialog(false)
    setEditingRule(null)
  }

  const handleCreate = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product')
      return
    }
    if (!validateTiers()) return

    try {
      await createRule.mutateAsync({
        productId: selectedProductId,
        tiers: tiers.map((t) => ({
          productId: selectedProductId,
          productName: '',
          minQuantity: parseInt(t.minQuantity),
          maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity) : undefined,
          unitPrice: parseFloat(t.unitPrice),
          discountPercent: t.discountPercent ? parseFloat(t.discountPercent) : undefined,
          currency: 'USD',
        })),
      })
      toast.success('Volume pricing rule created')
      resetDialog()
    } catch {
      toast.error('Failed to create volume pricing rule')
    }
  }

  const handleEdit = (rule: VolumePricingRule) => {
    setEditingRule(rule)
    setSelectedProductId(rule.productId)
    setTiers(
      rule.tiers.map((t) => ({
        id: t.id,
        minQuantity: t.minQuantity.toString(),
        maxQuantity: t.maxQuantity?.toString() || '',
        unitPrice: t.unitPrice.toString(),
        discountPercent: t.discountPercent?.toString() || '',
      }))
    )
    setShowEditDialog(true)
  }

  const handleUpdate = async () => {
    if (!editingRule) return
    if (!validateTiers()) return

    try {
      await updateRule.mutateAsync({
        id: editingRule.id,
        data: {
          tiers: tiers.map((t) => ({
            productId: editingRule.productId,
            productName: '',
            minQuantity: parseInt(t.minQuantity),
            maxQuantity: t.maxQuantity ? parseInt(t.maxQuantity) : undefined,
            unitPrice: parseFloat(t.unitPrice),
            discountPercent: t.discountPercent ? parseFloat(t.discountPercent) : undefined,
            currency: 'USD',
          })),
        },
      })
      toast.success('Volume pricing rule updated')
      resetDialog()
    } catch {
      toast.error('Failed to update volume pricing rule')
    }
  }

  const handleToggleStatus = async (rule: VolumePricingRule) => {
    const newStatus = rule.status === 'active' ? 'inactive' : 'active'
    try {
      await updateRule.mutateAsync({ id: rule.id, data: { status: newStatus } })
      toast.success(`Rule ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update rule status')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRule.mutateAsync(deleteId)
      toast.success('Volume pricing rule deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete rule')
    }
  }

  const addTier = () => {
    setTiers((prev) => [...prev, createEmptyTier()])
  }

  const removeTier = (id: string) => {
    setTiers((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.id !== id)))
  }

  const updateTier = (id: string, field: keyof TierDraft, value: string) => {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      id: 'product',
      header: 'Product',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{String(row.productName)}</p>
          <p className="text-[11px] text-muted-foreground">{String(row.productSku)}</p>
        </div>
      ),
    },
    {
      id: 'tiers',
      header: 'Tiers',
      accessorFn: (row) => {
        const tiersData = row.tiers as VolumePricingTierItem[] | undefined
        return (
          <span className="text-[12px] text-muted-foreground">
            {tiersData ? formatTiers(tiersData) : '—'}
          </span>
        )
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={String(row.status) === 'active' ? 'success' : 'secondary'}>
          {String(row.status)}
        </Badge>
      ),
    },
    {
      id: 'updated',
      header: 'Updated',
      accessorFn: (row) => (
        <span className="text-[12px] text-muted-foreground tabular-nums">
          {format(parseISO(String(row.updatedAt)), 'MMM d, yyyy')}
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
              <DropdownMenuItem onClick={() => handleEdit(row as unknown as VolumePricingRule)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(row as unknown as VolumePricingRule)}>
                {String(row.status) === 'active' ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {String(row.status) === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(String(row.id))} className="text-danger">
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
        title="Volume Pricing"
        description="Manage quantity-based pricing rules for products."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Pricing' },
          { label: 'Volume Pricing' },
        ]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Volume Rule
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<BarChart3 className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<ToggleRight className="h-5 w-5" />} />
            <KpiCard label="Total Tiers" value={kpis?.totalTiers ?? 0} variant="info" icon={<Layers className="h-5 w-5" />} />
            <KpiCard label="Products Covered" value={kpis?.productsCovered ?? 0} variant="default" icon={<Package className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search volume rules..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || search) && (
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
        <ErrorState title="Failed to load volume pricing" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="No volume pricing rules"
          description="Create your first volume pricing rule to start offering quantity-based discounts."
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Volume Rule
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data.rules as unknown as Record<string, unknown>[]}
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) resetDialog() }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Volume Pricing Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Pricing Tiers *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Tier
                </Button>
              </div>

              {tiers.map((tier, index) => (
                <div key={tier.id} className="flex items-end gap-2 p-3 rounded-lg border border-border bg-surface-muted/30">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Min Qty *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.minQuantity}
                      onChange={(e) => updateTier(tier.id, 'minQuantity', e.target.value)}
                      placeholder="1"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Max Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.maxQuantity}
                      onChange={(e) => updateTier(tier.id, 'maxQuantity', e.target.value)}
                      placeholder="∞"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.unitPrice}
                      onChange={(e) => updateTier(tier.id, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tier.discountPercent}
                      onChange={(e) => updateTier(tier.id, 'discountPercent', e.target.value)}
                      placeholder="0"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger shrink-0"
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createRule.isPending}>
              {createRule.isPending ? 'Creating...' : 'Create Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) resetDialog() }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Volume Pricing Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Input
                value={editingRule?.productName || ''}
                disabled
                className={cn(INPUT_CLASS, 'opacity-60')}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Pricing Tiers *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Tier
                </Button>
              </div>

              {tiers.map((tier) => (
                <div key={tier.id} className="flex items-end gap-2 p-3 rounded-lg border border-border bg-surface-muted/30">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Min Qty *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.minQuantity}
                      onChange={(e) => updateTier(tier.id, 'minQuantity', e.target.value)}
                      placeholder="1"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Max Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={tier.maxQuantity}
                      onChange={(e) => updateTier(tier.id, 'maxQuantity', e.target.value)}
                      placeholder="∞"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Unit Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.unitPrice}
                      onChange={(e) => updateTier(tier.id, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[11px]">Discount %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tier.discountPercent}
                      onChange={(e) => updateTier(tier.id, 'discountPercent', e.target.value)}
                      placeholder="0"
                      className="h-8 text-[12px]"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger shrink-0"
                    onClick={() => removeTier(tier.id)}
                    disabled={tiers.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetDialog}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateRule.isPending}>
              {updateRule.isPending ? 'Updating...' : 'Update Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete volume pricing rule?"
        description="This will permanently remove the rule and all its tiers. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRule.isPending}
      />
    </div>
  )
}
