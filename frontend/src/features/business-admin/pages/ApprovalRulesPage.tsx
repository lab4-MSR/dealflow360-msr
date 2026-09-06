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
import { useApprovalRules, useApprovalRuleKpis, useDeleteApprovalRule, useUpdateApprovalRule } from '../hooks/use-business-admin'
import type { ApprovalRule, ApprovalRuleFilters } from '../types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/errors'
import { Plus, Search, AlertTriangle, Shield, MoreHorizontal, Eye, Edit, Power, Trash2, CheckCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const TRIGGER_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'intelligence'> = {
  discount_threshold: 'warning',
  deal_value: 'info',
  margin: 'success',
  risk_score: 'danger',
  customer_tier: 'intelligence',
  product_category: 'secondary',
  compound: 'default',
}

const LEVEL_VARIANT: Record<string, 'secondary' | 'info' | 'warning' | 'danger'> = {
  none: 'secondary',
  sales_manager: 'info',
  finance: 'warning',
  multi_level: 'danger',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warning',
}

function ApprovalRulesPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [triggerTypeFilter, setTriggerTypeFilter] = useState('')
  const [approvalLevelFilter, setApprovalLevelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters: ApprovalRuleFilters = { search, triggerType: triggerTypeFilter, approvalLevel: approvalLevelFilter, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useApprovalRules(filters)
  const { data: kpis, isLoading: kpisLoading } = useApprovalRuleKpis()
  const deleteApprovalRule = useDeleteApprovalRule()
  const updateApprovalRule = useUpdateApprovalRule()

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const handleClearFilters = () => { setSearch(''); setSearchInput(''); setTriggerTypeFilter(''); setApprovalLevelFilter(''); setStatusFilter(''); setPage(1) }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteApprovalRule.mutateAsync(deleteId); toast.success('Approval rule deleted'); setDeleteId(null) }
    catch (err) { toast.error('Failed to delete approval rule', { description: getErrorMessage(err) }) }
  }

  const getTriggerLabel = (rule: ApprovalRule) => {
    const config = rule.triggerConfig ?? {}
    if (rule.triggerType === 'discount_threshold') return typeof config.discountThreshold === 'number' ? `Discount > ${config.discountThreshold}%` : 'Discount Threshold'
    if (rule.triggerType === 'deal_value') return typeof config.dealValueMin === 'number' ? `Deal ≥ ₹${config.dealValueMin.toLocaleString('en-IN')}` : 'Deal Value'
    if (rule.triggerType === 'margin') return typeof config.marginMax === 'number' ? `Margin < ${config.marginMax}%` : 'Margin'
    if (rule.triggerType === 'risk_score') return typeof config.riskScoreMin === 'number' ? `Risk ≥ ${config.riskScoreMin}` : 'Risk Score'
    if (rule.triggerType === 'customer_tier') return config.customerTier ? `Tier: ${config.customerTier}` : 'Customer Tier'
    if (rule.triggerType === 'product_category') return config.productCategoryId ? `Category: ${config.productCategoryId}` : 'Product Category'
    return 'Compound'
  }

  const getRiskLevel = (priority: number | undefined) => {
    const p = typeof priority === 'number' ? priority : 99
    if (p <= 10) return 'Critical'
    if (p <= 20) return 'High'
    if (p <= 30) return 'Medium'
    return 'Low'
  }

  const columns: Column<ApprovalRule>[] = [
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
      id: 'trigger',
      header: 'Trigger',
      accessorFn: (row) => (
        <Badge variant={TRIGGER_VARIANT[row.triggerType] || 'secondary'} className="gap-1.5">
          {getTriggerLabel(row)}
        </Badge>
      ),
    },
    {
      id: 'riskLevel',
      header: 'Risk Level',
      accessorFn: (row) => {
        const risk = getRiskLevel(row.priority)
        const variant = risk === 'Critical' ? 'danger' : risk === 'High' ? 'warning' : risk === 'Medium' ? 'info' : 'success'
        return <Badge variant={variant}>{risk}</Badge>
      },
    },
    {
      id: 'approvalLevel',
      header: 'Approval Level',
      accessorFn: (row) => (
        <Badge variant={LEVEL_VARIANT[row.approvalLevel] || 'secondary'}>
          {row.approvalLevel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorFn: (row) => <span className="text-[13px] font-medium tabular-nums">{row.priority}</span>,
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/approvals/simulator?ruleId=${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/business-admin/approvals/create?editId=${row.id}`)}>
                <Edit className="h-4 w-4 mr-2" />Edit
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

  const handleToggleStatus = async (rule: ApprovalRule) => {
    const nextStatus = rule.status === 'active' ? 'inactive' : 'active'
    try {
      await updateApprovalRule.mutateAsync({ id: rule.id, data: { status: nextStatus } })
      toast.success(`Rule ${nextStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error('Failed to update rule status', { description: getErrorMessage(err) })
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              Approval Chains & Routing Matrix
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Escalation Engine Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure managerial hierarchies, financial risk thresholds, and automated multi-step sign-off paths.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/approvals/create')}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Approval Rule
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-2 overflow-x-auto">
        <button
          type="button"
          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20 transition-all cursor-pointer whitespace-nowrap"
        >
          Routing Rules ({kpis?.totalRules ?? 0})
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/approvals/chains')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Multi-Stage Chains
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/approvals/thresholds')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Value & Discount Thresholds
        </button>
        <button
          type="button"
          onClick={() => navigate('/business-admin/approvals/simulator')}
          className="px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Route Simulator
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Rules</span>
                <div className="p-1.5 rounded-lg bg-muted/60"><Shield className="h-4 w-4 text-foreground/80" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-foreground">{kpis?.totalRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Configured routing patterns</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active In Production</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400">{kpis?.activeRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Actively governing deal submissions</span>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">High Risk Escalations</span>
                <div className="p-1.5 rounded-lg bg-rose-500/10"><AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" /></div>
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-rose-600 dark:text-rose-400">{kpis?.highRiskRules ?? 0}</p>
              <span className="text-[11px] text-muted-foreground">Requires VP / C-Level clearance</span>
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
              placeholder="Search approval rules..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="secondary" size="sm" className="h-9 px-3 text-xs font-medium" onClick={handleSearch}>
            Search
          </Button>

          <Select value={triggerTypeFilter} onValueChange={v => { setTriggerTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[170px] h-9 text-xs"><SelectValue placeholder="All Trigger Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="discount_threshold">Discount Threshold</SelectItem>
              <SelectItem value="deal_value">Deal Value</SelectItem>
              <SelectItem value="margin">Margin</SelectItem>
              <SelectItem value="risk_score">Risk Score</SelectItem>
              <SelectItem value="customer_tier">Customer Tier</SelectItem>
              <SelectItem value="product_category">Product Category</SelectItem>
              <SelectItem value="compound">Compound</SelectItem>
            </SelectContent>
          </Select>

          <Select value={approvalLevelFilter} onValueChange={v => { setApprovalLevelFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="All Levels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="none">No Approval</SelectItem>
              <SelectItem value="sales_manager">Sales Manager</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="multi_level">Multi-Level</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {(statusFilter || triggerTypeFilter || approvalLevelFilter || search) && (
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
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <ErrorState title="Failed to load approval rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No approval rules defined"
          description="Create your first approval rule to configure automatic routing."
          action={
            <Button size="sm" onClick={() => navigate('/business-admin/approvals/create')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Approval Rule
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="hidden md:block">
            <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={data.rules as unknown as Record<string, unknown>[]} />
          </div>
          <div className="md:hidden p-3 space-y-3">
            {data.rules.map(rule => (
              <div key={rule.id} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">{rule.name}</p>
                    <div className="mt-1"><Badge variant={TRIGGER_VARIANT[rule.triggerType] || 'secondary'}>{getTriggerLabel(rule)}</Badge></div>
                  </div>
                  <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'}>{rule.status}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-border/40">
                  <div><p className="text-muted-foreground text-[10px] uppercase">Level</p><p className="font-medium text-foreground truncate">{rule.approvalLevel.replace('_', ' ')}</p></div>
                  <div><p className="text-muted-foreground text-[10px] uppercase">Priority</p><p className="font-medium font-mono text-foreground">{rule.priority}</p></div>
                  <div><p className="text-muted-foreground text-[10px] uppercase">Risk</p><p className="font-medium text-foreground">{getRiskLevel(rule.priority)}</p></div>
                </div>
              </div>
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="p-3 border-t border-border/60">
              <Pagination page={data.page} totalPages={data.totalPages} total={data.total} perPage={data.perPage} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Governance Architecture Section */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground font-display">Rule Evaluation & Precedence Pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Automated deterministic algorithm governing multi-stakeholder clearance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 1</span>
            <p className="font-semibold text-xs text-foreground mt-1 mb-1">Conditions Match</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Each rule systematically parses line discount %, total contract value, and line gross margin against preset boundaries.</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 2</span>
            <p className="font-semibold text-xs text-foreground mt-1 mb-1">Escalation Candidate Filter</p>
            <p className="text-xs text-muted-foreground leading-relaxed">When multiple rules match a single deal, conflicting paths are ordered by strict integer priority weights.</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 3</span>
            <p className="font-semibold text-xs text-foreground mt-1 mb-1">Deterministic Routing</p>
            <p className="text-xs text-muted-foreground leading-relaxed">The highest-precedence rule assigns the approval chain (Sales Manager → Commercial Finance → Executive Committee).</p>
          </div>
        </div>
      </section>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete Approval Rule?" description="This action will permanently detach this routing rule from the active approval engine. Active quotes waiting for approval will remain on their current assigned step." confirmLabel="Delete Rule" variant="danger" onConfirm={handleDelete} loading={deleteApprovalRule.isPending} />
    </div>
  )
}

export { ApprovalRulesPage }