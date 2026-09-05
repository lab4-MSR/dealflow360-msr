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
import { useApprovalRules, useApprovalRuleKpis, useDeleteApprovalRule } from '../hooks/use-business-admin'
import type { ApprovalRule, ApprovalRuleFilters } from '../types'
import { toast } from 'sonner'
import { Plus, Search, AlertTriangle, Shield, MoreHorizontal, Eye, Edit, Power, Trash2, Zap, DollarSign, BarChart, Users, Layers, GitBranch, CheckCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const handleClearFilters = () => { setSearch(''); setSearchInput(''); setTriggerTypeFilter(''); setApprovalLevelFilter(''); setStatusFilter(''); setPage(1) }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteApprovalRule.mutateAsync(deleteId); toast.success('Approval rule deleted'); setDeleteId(null) }
    catch { toast.error('Failed to delete approval rule') }
  }

  const getTriggerLabel = (rule: ApprovalRule) => {
    const config = rule.triggerConfig
    if (rule.triggerType === 'discount_threshold') return `Discount > ${config.discountThreshold}%`
    if (rule.triggerType === 'deal_value') return config.dealValueMin ? `Deal ≥ $${config.dealValueMin.toLocaleString()}` : 'Deal Value'
    if (rule.triggerType === 'margin') return config.marginMax ? `Margin < ${config.marginMax}%` : 'Margin'
    if (rule.triggerType === 'risk_score') return config.riskScoreMin ? `Risk ≥ ${config.riskScoreMin}` : 'Risk Score'
    if (rule.triggerType === 'customer_tier') return `Tier: ${config.customerTier}`
    if (rule.triggerType === 'product_category') return `Category: ${config.productCategoryId}`
    return 'Compound'
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
        const risk = row.priority <= 10 ? 'Critical' : row.priority <= 20 ? 'High' : row.priority <= 30 ? 'Medium' : 'Low'
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
              <DropdownMenuItem onClick={() => toast.info(`View details for ${row.name} coming soon`)}>
                <Eye className="h-4 w-4 mr-2" />View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Edit coming soon')}>
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

  const handleToggleStatus = (rule: ApprovalRule) => {
    toast.info(`Toggle status for ${rule.name} coming soon`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Rules"
        description="Configure approval routing rules that determine when and how quotations require managerial or multi-level approval"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Approval Configuration' },
          { label: 'Approval Rules' },
        ]}
        actions={
          <Button onClick={() => toast.info('Create approval rule coming soon')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Approval Rule
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
          <>
            <KpiCard label="Total Rules" value={kpis?.totalRules ?? 0} icon={<Shield className="h-5 w-5" />} />
            <KpiCard label="Active Rules" value={kpis?.activeRules ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="High Risk Rules" value={kpis?.highRiskRules ?? 0} variant="warning" icon={<AlertTriangle className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input placeholder="Search approval rules..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button variant="outline" size="icon" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        </div>
        <Select value={triggerTypeFilter} onValueChange={v => { setTriggerTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Trigger Types" /></SelectTrigger>
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
        <Select value={approvalLevelFilter} onValueChange={v => { setApprovalLevelFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Levels" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="none">No Approval</SelectItem>
            <SelectItem value="sales_manager">Sales Manager</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="multi_level">Multi-Level</SelectItem>
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
        {(statusFilter || triggerTypeFilter || approvalLevelFilter || search) && <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear Filters</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <ErrorState title="Failed to load approval rules" onRetry={refetch} />
      ) : !data?.rules || data.rules.length === 0 ? (
        <EmptyState icon={<Shield className="h-8 w-8" />} title="No approval rules found" description="Create your first approval rule to configure routing." action={<Button onClick={() => toast.info('Create approval rule coming soon')}><Plus className="h-4 w-4 mr-1.5" />Create Approval Rule</Button>} />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTable columns={columns as unknown as Column<Record<string, unknown>>[]} data={data.rules as unknown as Record<string, unknown>[]} />
          </div>
          <div className="md:hidden space-y-3">
            {data.rules.map(rule => (
              <div key={rule.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div><p className="text-[13px] font-semibold text-foreground">{rule.name}</p><Badge variant={TRIGGER_VARIANT[rule.triggerType] || 'secondary'}>{getTriggerLabel(rule)}</Badge></div>
                  <Badge variant={STATUS_VARIANT[rule.status] || 'secondary'}>{rule.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-[12px]">
                  <div><p className="text-muted-foreground">Approval Level</p><p className="font-medium"><Badge variant={LEVEL_VARIANT[rule.approvalLevel] || 'secondary'}>{rule.approvalLevel}</Badge></p></div>
                  <div><p className="text-muted-foreground">Priority</p><p className="font-medium">{rule.priority}</p></div>
                  <div><p className="text-muted-foreground">Risk</p><p className="font-medium">{rule.priority <= 10 ? 'Critical' : rule.priority <= 20 ? 'High' : 'Medium'}</p></div>
                </div>
              </div>
            ))}
          </div>
          {data.totalPages > 1 && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} perPage={data.perPage} onPageChange={setPage} />}
        </>
      )}

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Rule Evaluation Logic</h3>
        <p className="text-sm text-muted-foreground">How approval rules are evaluated and routed.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-medium mb-1">1. Conditions Check</p>
            <p className="text-sm text-muted-foreground">Each rule evaluates its trigger conditions against the quotation data.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-medium mb-1">2. Trigger Match</p>
            <p className="text-sm text-muted-foreground">Matching rules are identified. Multiple rules may match.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="font-medium mb-1">3. Priority Resolution</p>
            <p className="text-sm text-muted-foreground">Highest priority (lowest number) rule determines the approval path.</p>
          </div>
        </div>
      </section>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete approval rule?" description="This action cannot be undone. This rule is currently part of the approval routing configuration." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} loading={deleteApprovalRule.isPending} />
    </div>
  )
}

export { ApprovalRulesPage }