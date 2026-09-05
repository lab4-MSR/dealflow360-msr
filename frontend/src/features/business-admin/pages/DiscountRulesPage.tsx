import { useState } from 'react'
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
    setSearch(searchInput)
    setPage(1)
  }

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
    <div className="space-y-6">
      <PageHeader
        title="Discount Rules"
        description="Configure discount governance rules that protect margins and drive approval routing"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Discount Governance', path: '/business-admin/discount-governance' },
          { label: 'Discount Rules' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/discount-governance/rules/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Discount Rule
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpisLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<Shield className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Customer Rules" value={kpis?.customerRules ?? 0} variant="info" icon={<Users className="h-5 w-5" />} />
            <KpiCard label="Category Rules" value={kpis?.categoryRules ?? 0} variant="intelligence" icon={<Tag className="h-5 w-5" />} />
            <KpiCard label="Margin Rules" value={kpis?.marginRules ?? 0} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search rules..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer_tier">Customer Tier</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="product">Product</SelectItem>
            <SelectItem value="margin">Margin</SelectItem>
            <SelectItem value="global">Global</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
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
        {(typeFilter || statusFilter || tierFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setTypeFilter(''); setStatusFilter(''); setTierFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}>
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
        <ErrorState title="Failed to load discount rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No discount rules found"
          description="Create your first discount rule to start governing pricing."
          action={
            <Button onClick={() => navigate('/business-admin/discount-governance/rules/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Discount Rule
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.rules as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/discount-governance/rules/${(row as unknown as DiscountRule).id}`)}
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
