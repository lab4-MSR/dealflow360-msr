import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useDiscountRules, useDiscountRuleKpis, useDeleteDiscountRule } from '../hooks/use-business-admin'
import type { DiscountRule } from '../types'
import { toast } from 'sonner'
import { Plus, Search, Shield, CheckCircle, Users, Tag, AlertTriangle, MoreHorizontal, Eye, Edit, Trash2, ArrowRight, Power, PowerOff } from 'lucide-react'
import { useUpdateDiscountRule } from '../hooks/use-business-admin'

const TYPE_VARIANT: Record<string, 'info' | 'intelligence' | 'success' | 'warning' | 'secondary'> = {
  customer_tier: 'info',
  category: 'intelligence',
  product: 'success',
  margin: 'warning',
  global: 'secondary',
}

const TYPE_LABEL: Record<string, string> = {
  customer_tier: 'Customer Tier',
  category: 'Category',
  product: 'Product',
  margin: 'Margin',
  global: 'Global',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warning',
}

const SCOPE_LABEL: Record<string, string> = {
  customer_tier: 'Tier-based',
  category: 'Category-specific',
  product: 'Product-specific',
  margin: 'Margin Protection',
  global: 'All Transactions',
}

export function DiscountRulesPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, type: typeFilter, status: statusFilter, customerTier: tierFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useDiscountRules(filters)
  const { data: kpis, isLoading: kpisLoading } = useDiscountRuleKpis()
  const deleteRule = useDeleteDiscountRule()
  const updateRule = useUpdateDiscountRule()

  const handleSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRule.mutateAsync(deleteId)
      toast.success('Discount rule deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete discount rule')
    }
  }

  const handleToggleStatus = async (rule: DiscountRule) => {
    try {
      await updateRule.mutateAsync({
        id: rule.id,
        data: { status: rule.status === 'active' ? 'inactive' : 'active' },
      })
      toast.success(`Rule ${rule.status === 'active' ? 'deactivated' : 'activated'}`)
    } catch {
      toast.error('Failed to update rule status')
    }
  }

  const columns: Column<DiscountRule>[] = [
    {
      id: 'rule',
      header: 'Rule',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && (
            <p className="text-[11px] text-muted-foreground truncate max-w-[300px]">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => (
        <Badge variant={TYPE_VARIANT[row.type] || 'secondary'}>{TYPE_LABEL[row.type] || row.type}</Badge>
      ),
    },
    {
      id: 'maxDiscount',
      header: 'Max Discount',
      accessorFn: (row) => (
        <span className="text-[13px] text-foreground tabular-nums font-medium">{row.maxDiscountPercent}%</span>
      ),
    },
    {
      id: 'scope',
      header: 'Scope',
      accessorFn: (row) => (
        <Badge variant="outline">{SCOPE_LABEL[row.type] || 'Custom'}</Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.priority}</span>
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/discount-governance/rules/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/business-admin/discount-governance/rules/${row.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(row)}>
                {row.status === 'active' ? (
                  <><PowerOff className="h-4 w-4 mr-2" />Deactivate</>
                ) : (
                  <><Power className="h-4 w-4 mr-2" />Activate</>
                )}
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
              Discount Governance & Ceilings
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Policy Engine Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure discount caps, margin protection floors, and automated multi-tier approval triggers.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/discount-governance/rules/new')}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Discount Rule
          </Button>
        </div>
      </div>

      {/* Discount Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all cursor-pointer whitespace-nowrap"
        >
          All Rules ({kpis?.totalRules ?? 0})
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/discounts/customer-tier')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Customer Tiers
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/discounts/category')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Product Categories
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/discounts/margin')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Margin Floors
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/discounts/simulator')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Rule Simulator
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {kpisLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Rules</span>
                <div className="p-1.5 rounded-lg bg-muted/60"><Shield className="h-4 w-4 text-foreground/80" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{kpis?.totalRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Governance guardrails</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Enforced</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">{kpis?.activeRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Active in validation pass</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Tier Caps</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10"><Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-blue-600 dark:text-blue-400">{kpis?.customerRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Bronze/Silver/Gold/Plat</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Category Caps</span>
                <div className="p-1.5 rounded-lg bg-purple-500/10"><Tag className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-purple-600 dark:text-purple-400">{kpis?.categoryRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Software/Service/Hardware</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Margin Floors</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10"><AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">{kpis?.marginRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Profit protection thresholds</span>
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
              placeholder="Search rule title or scope..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3 text-xs font-medium" onClick={handleSearch}>
            Search
          </Button>

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer_tier">Customer Tier</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="margin">Margin</SelectItem>
              <SelectItem value="global">Global</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Tiers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>

          {(typeFilter || statusFilter || tierFilter || search) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => { setTypeFilter(''); setStatusFilter(''); setTierFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}
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
        <ErrorState title="Failed to load discount rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No discount rules defined"
          description="Create your first discount rule to govern quotation line pricing and protect deal margins."
          action={
            <Button size="sm" onClick={() => navigate('/business-admin/discount-governance/rules/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Discount Rule
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.rules as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/discount-governance/rules/${(row as unknown as DiscountRule).id}`)}
          />
          {data.totalPages > 1 && (
            <div className="p-3 border-t border-border/60">
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                perPage={data.perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Rule Evaluation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Rule Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Discount rules are evaluated by the backend pricing engine when quotations are created.
            Rules are processed in priority order (lowest number first). The most specific rule that
            matches the transaction context wins. When multiple rules conflict, the engine applies
            the rule with the highest priority (lowest priority number). Margin protection rules
            act as hard floors — they cannot be overridden by higher-priority discount rules.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-[12px] font-medium text-foreground mb-1">1. Match</p>
              <p className="text-[11px] text-muted-foreground">Rules are matched against customer tier, category, product, and deal conditions</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-[12px] font-medium text-foreground mb-1">2. Prioritize</p>
              <p className="text-[11px] text-muted-foreground">Matching rules are sorted by priority; margin rules act as absolute floors</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-[12px] font-medium text-foreground mb-1">3. Enforce</p>
              <p className="text-[11px] text-muted-foreground">Discount limits are enforced; excess requires approval or is blocked per risk behavior</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete discount rule?"
        description="This action cannot be undone. The rule will be permanently removed and no longer applied to quotations."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRule.isPending}
      />
    </div>
  )
}
