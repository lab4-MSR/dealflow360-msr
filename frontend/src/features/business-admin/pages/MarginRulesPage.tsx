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
import { useMarginRules, useMarginRuleKpis, useCreateMarginRule, useUpdateMarginRule, useDeleteMarginRule } from '../hooks/use-business-admin'
import type { MarginRule, MarginRuleFilters } from '../types'
import { toast } from 'sonner'
import { Plus, Search, AlertTriangle, Target, XCircle, MoreHorizontal, Eye, Edit, Power, Trash2, Shield, Package, Layers, Users, Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useProducts } from '../hooks/use-business-admin'
import { useCategories } from '../hooks/use-business-admin'
import { useCustomerTiers } from '../hooks/use-business-admin'
import { cn } from '@/lib/utils'

const TYPE_VARIANT: Record<string, 'secondary' | 'success' | 'intelligence' | 'info'> = {
  global: 'secondary',
  product: 'success',
  category: 'intelligence',
  customer_tier: 'info',
}

const RISK_VARIANT: Record<string, 'danger' | 'warning' | 'info'> = {
  block: 'danger',
  require_approval: 'warning',
  flag: 'info',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warning',
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

function MarginRulesPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<MarginRule | null>(null)

  const filters: MarginRuleFilters = { search, type: typeFilter, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useMarginRules(filters)
  const { data: kpis, isLoading: kpisLoading } = useMarginRuleKpis()
  const createMarginRule = useCreateMarginRule()
  const updateMarginRule = useUpdateMarginRule()
  const deleteMarginRule = useDeleteMarginRule()

  const { data: productsData } = useProducts({ perPage: 100 })
  const { data: categoriesData } = useCategories({})
  const { data: tiersData } = useCustomerTiers()

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const handleClearFilters = () => { setSearch(''); setSearchInput(''); setTypeFilter(''); setStatusFilter(''); setPage(1) }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMarginRule.mutateAsync(deleteId); toast.success('Margin rule deleted'); setDeleteId(null) }
    catch { toast.error('Failed to delete margin rule') }
  }

  const handleSubmit = async (formData: Partial<MarginRule>, isEdit = false) => {
    try {
      if (isEdit && editingRule) {
        await updateMarginRule.mutateAsync({ id: editingRule.id, data: formData })
        toast.success('Margin rule updated')
      } else {
        await createMarginRule.mutateAsync(formData as Omit<MarginRule, 'id' | 'createdAt' | 'updatedAt'>)
        toast.success('Margin rule created')
      }
      setIsCreateOpen(false)
      setEditingRule(null)
      refetch()
    } catch { toast.error(isEdit ? 'Failed to update margin rule' : 'Failed to create margin rule') }
  }

  const columns: Column<MarginRule>[] = [
    {
      id: 'name',
      header: 'Rule',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && <p className="text-[11px] text-muted-foreground line-clamp-1">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => (
        <Badge variant={TYPE_VARIANT[row.type] || 'secondary'} className="gap-1.5">
          {row.type === 'global' && <Globe className="h-3 w-3" />}
          {row.type === 'product' && <Package className="h-3 w-3" />}
          {row.type === 'category' && <Layers className="h-3 w-3" />}
          {row.type === 'customer_tier' && <Users className="h-3 w-3" />}
          {row.type.charAt(0).toUpperCase() + row.type.slice(1).replace('_', ' ')}
        </Badge>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      accessorFn: (row) => {
        let scopeText = 'All'
        if (row.scope.isGlobal) scopeText = 'Global (All Products)'
        else if (row.scope.productId) scopeText = `${row.scope.productName || 'Product'} (${row.scope.productSku || row.scope.productId})`
        else if (row.scope.categoryId) scopeText = row.scope.categoryName || row.scope.categoryId
        else if (row.scope.customerTier) scopeText = `Tier: ${row.scope.customerTier.charAt(0).toUpperCase() + row.scope.customerTier.slice(1)}`
        return <span className="text-[13px] text-muted-foreground">{scopeText}</span>
      },
    },
    {
      id: 'minimumMarginPercent',
      header: 'Min Margin %',
      accessorFn: (row) => <span className="text-[13px] font-medium tabular-nums">{row.minimumMarginPercent}%</span>,
    },
    {
      id: 'targetMarginPercent',
      header: 'Target Margin %',
      accessorFn: (row) => <span className="text-[13px] text-muted-foreground tabular-nums">{row.targetMarginPercent ? `${row.targetMarginPercent}%` : '—'}</span>,
    },
    {
      id: 'criticalMarginPercent',
      header: 'Critical Margin %',
      accessorFn: (row) => <span className="text-[13px] text-muted-foreground tabular-nums">{row.criticalMarginPercent ? `${row.criticalMarginPercent}%` : '—'}</span>,
    },
    {
      id: 'riskBehavior',
      header: 'Risk Behavior',
      accessorFn: (row) => (
        <Badge variant={RISK_VARIANT[row.riskBehavior] || 'secondary'} className="gap-1.5">
          {row.riskBehavior === 'block' && <XCircle className="h-3 w-3" />}
          {row.riskBehavior === 'require_approval' && <Shield className="h-3 w-3" />}
          {row.riskBehavior === 'flag' && <AlertTriangle className="h-3 w-3" />}
          {row.riskBehavior.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>{row.status}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setEditingRule(row); setIsCreateOpen(true) }}>
                <Eye className="h-4 w-4 mr-2" />View / Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                <Power className="h-4 w-4 mr-2" />
                {row.status === 'active' ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const handleToggleStatus = (rule: MarginRule) => {
    toast.info(`Toggle status for ${rule.name} coming soon`)
  }

  const getFormDefaults = (rule?: MarginRule) => ({
    name: rule?.name || '',
    description: rule?.description || '',
    type: rule?.type || 'global',
    minimumMarginPercent: rule?.minimumMarginPercent || 15,
    targetMarginPercent: rule?.targetMarginPercent || 25,
    criticalMarginPercent: rule?.criticalMarginPercent || 10,
    riskBehavior: rule?.riskBehavior || 'require_approval',
    status: rule?.status || 'active',
    productId: rule?.scope.productId || '',
    categoryId: rule?.scope.categoryId || '',
    customerTier: rule?.scope.customerTier || '',
  })

  const [formData, setFormData] = useState(getFormDefaults())

  const handleFormChange = (field: string, value: any) => { setFormData(prev => ({ ...prev, [field]: value })) }
  const handleOpenCreate = () => { setFormData(getFormDefaults()); setEditingRule(null); setIsCreateOpen(true) }
  const handleOpenEdit = (rule: MarginRule) => { setFormData(getFormDefaults(rule)); setEditingRule(rule); setIsCreateOpen(true) }
  const handleCloseDialog = () => { setIsCreateOpen(false); setEditingRule(null); setFormData(getFormDefaults()) }

  const renderScopeFields = () => {
    switch (formData.type) {
      case 'product':
        return (
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={formData.productId} onValueChange={v => handleFormChange('productId', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {productsData?.products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      case 'category':
        return (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.categoryId} onValueChange={v => handleFormChange('categoryId', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categoriesData?.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      case 'customer_tier':
        return (
          <div className="space-y-2">
            <Label>Customer Tier</Label>
            <Select value={formData.customerTier} onValueChange={v => handleFormChange('customerTier', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select tier" /></SelectTrigger>
              <SelectContent>
                {tiersData?.map(t => <SelectItem key={t.id} value={t.tier}>{t.displayName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )
      default:
        return <div className="text-[13px] text-muted-foreground">This rule applies globally to all products.</div>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Margin Rules"
        description="Configure minimum, target, and critical margin thresholds that protect profitability across products, categories, and customer tiers"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance' },
          { label: 'Margin Rules' },
        ]}
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Margin Rule
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpisLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<Package className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<Shield className="h-5 w-5" />} />
            <KpiCard label="Global Rules" value={kpis?.globalRules ?? 0} variant="info" icon={<Globe className="h-5 w-5" />} />
            <KpiCard label="Product Rules" value={kpis?.productRules ?? 0} variant="success" icon={<Package className="h-5 w-5" />} />
            <KpiCard label="Category Rules" value={kpis?.categoryRules ?? 0} variant="intelligence" icon={<Layers className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input placeholder="Search margin rules..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button variant="outline" size="icon" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        </div>
        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="customer_tier">Customer Tier</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || typeFilter || search) && <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear Filters</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <ErrorState title="Failed to load margin rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState icon={<Package className="h-8 w-8" />} title="No margin rules found" description="Create your first margin rule to protect profitability." action={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1.5" />Create Margin Rule</Button>} />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={data.rules as unknown as Record<string, unknown>[]} />
          </div>
          <div className="md:hidden space-y-3">
            {data.rules.map(rule => (
              <div key={rule.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><p className="text-[13px] font-semibold text-foreground">{rule.name}</p><Badge variant={TYPE_VARIANT[rule.type] || 'secondary'}>{rule.type}</Badge></div>
                  <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'}>{rule.status}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
                  <div><p className="text-muted-foreground">Min Margin</p><p className="font-medium">{rule.minimumMarginPercent}%</p></div>
                  <div><p className="text-muted-foreground">Target Margin</p><p className="font-medium">{rule.targetMarginPercent ? `${rule.targetMarginPercent}%` : '—'}</p></div>
                  <div><p className="text-muted-foreground">Critical</p><p className="font-medium">{rule.criticalMarginPercent ? `${rule.criticalMarginPercent}%` : '—'}</p></div>
                </div>
                <Badge variant={RISK_VARIANT[rule.riskBehavior] || 'secondary'}>{rule.riskBehavior}</Badge>
              </div>
            ))}
          </div>
          {data.totalPages > 1 && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} perPage={data.perPage} onPageChange={setPage} />}
        </>
      )}

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Margin Overview</h3>
        <p className="text-sm text-muted-foreground">Visual hierarchy of margin thresholds from target to critical risk.</p>
        <div className="space-y-4">
          <div className="rounded-lg bg-primary/10 p-4 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Target Margin (Healthy Zone)</span>
              <span className="text-sm font-medium tabular-nums text-primary">≥ 25%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden mt-2">
              <div className="h-full rounded-full bg-primary" style={{ width: '40%' }} />
            </div>
          </div>
          <div className="rounded-lg bg-warning/10 p-4 border-l-4 border-warning">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Minimum Margin (Warning Zone)</span>
              <span className="text-sm font-medium tabular-nums text-warning">15–24%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden mt-2">
              <div className="h-full rounded-full bg-warning" style={{ width: '35%' }} />
            </div>
          </div>
          <div className="rounded-lg bg-danger/10 p-4 border-l-4 border-danger">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Critical Margin (Critical Risk)</span>
              <span className="text-sm font-medium tabular-nums text-danger">{'< 15%'}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden mt-2">
              <div className="h-full rounded-full bg-danger" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </section>

      <Dialog open={isCreateOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Margin Rule' : 'Create Margin Rule'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleSubmit(formData, !!editingRule) }} className="space-y-6 p-4 pb-6">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} required placeholder="e.g., Global Minimum Margin" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => handleFormChange('description', e.target.value)} placeholder="Optional description" /></div>
            <div className="space-y-2"><Label>Type *</Label><Select value={formData.type} onValueChange={v => handleFormChange('type', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="global">Global</SelectItem><SelectItem value="product">Product</SelectItem><SelectItem value="category">Category</SelectItem><SelectItem value="customer_tier">Customer Tier</SelectItem></SelectContent></Select></div>
            <div className="space-y-2">{renderScopeFields()}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Minimum Margin % *</Label><Input type="number" min="0" max="100" step="0.1" value={formData.minimumMarginPercent} onChange={e => handleFormChange('minimumMarginPercent', parseFloat(e.target.value) || 0)} required placeholder="15" /></div>
              <div className="space-y-2"><Label>Target Margin %</Label><Input type="number" min="0" max="100" step="0.1" value={formData.targetMarginPercent || 0} onChange={e => handleFormChange('targetMarginPercent', parseFloat(e.target.value) || 0)} placeholder="25" /></div>
              <div className="space-y-2"><Label>Critical Margin %</Label><Input type="number" min="0" max="100" step="0.1" value={formData.criticalMarginPercent || 0} onChange={e => handleFormChange('criticalMarginPercent', parseFloat(e.target.value) || 0)} placeholder="10" /></div>
            </div>
            <div className="space-y-2"><Label>Risk Behavior *</Label><Select value={formData.riskBehavior} onValueChange={v => handleFormChange('riskBehavior', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select behavior" /></SelectTrigger><SelectContent><SelectItem value="block">Block</SelectItem><SelectItem value="require_approval">Require Approval</SelectItem><SelectItem value="flag">Flag</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => handleFormChange('status', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select></div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" disabled={createMarginRule.isPending || updateMarginRule.isPending}>
                {createMarginRule.isPending || updateMarginRule.isPending ? 'Saving...' : (editingRule ? 'Update Rule' : 'Create Rule')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete margin rule?" description="This action cannot be undone. This rule is currently protecting margins across your pricing configuration." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} loading={deleteMarginRule.isPending} />
    </div>
  )
}

export { MarginRulesPage }