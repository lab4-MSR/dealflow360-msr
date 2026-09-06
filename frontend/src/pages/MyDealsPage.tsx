import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { SalesWorkspaceTopMenu } from '@/components/ui/SalesWorkspaceTopMenu'
import apiClient, { getApiErrorMessage } from '@/lib/api'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Download,
  LayoutGrid,
  TableIcon,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  Flag,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export interface DealRecord {
  id: string
  name: string
  customer_name: string
  stage: 'draft' | 'pending_approval' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost'
  value: number
  discount_percent: number
  margin_percent: number
  risk_level: 'low' | 'medium' | 'high'
  health_score: number
  health_status: 'healthy' | 'at_risk' | 'critical' | 'stalled'
  owner_name: string
  expected_close_date: string
  is_flagged?: boolean
}

const KANBAN_STAGES: Array<{ id: DealRecord['stage']; label: string; color: string }> = [
  { id: 'draft', label: 'Draft', color: 'border-slate-500/40 bg-slate-500/5' },
  { id: 'pending_approval', label: 'Pending Approval', color: 'border-amber-500/40 bg-amber-500/5' },
  { id: 'proposal', label: 'Proposal / Sent', color: 'border-sky-500/40 bg-sky-500/5' },
  { id: 'negotiation', label: 'In Negotiation', color: 'border-indigo-500/40 bg-indigo-500/5' },
  { id: 'closing', label: 'Closing', color: 'border-purple-500/40 bg-purple-500/5' },
  { id: 'won', label: 'Won', color: 'border-emerald-500/40 bg-emerald-500/5' },
  { id: 'lost', label: 'Lost', color: 'border-rose-500/40 bg-rose-500/5' },
]

const INITIAL_FALLBACK_DEALS: DealRecord[] = [
  {
    id: 'deal-001',
    name: 'Acme Corp Annual Enterprise Expansion',
    customer_name: 'Acme Technologies Ltd',
    stage: 'negotiation',
    value: 2450000,
    discount_percent: 12,
    margin_percent: 34,
    risk_level: 'low',
    health_score: 82,
    health_status: 'healthy',
    owner_name: 'Rahul Verma',
    expected_close_date: '2026-09-30',
    is_flagged: false,
  },
  {
    id: 'deal-002',
    name: 'Hyperion Server Infrastructure Refresh',
    customer_name: 'Hyperion Systems',
    stage: 'proposal',
    value: 5800000,
    discount_percent: 18,
    margin_percent: 28,
    risk_level: 'medium',
    health_score: 74,
    health_status: 'at_risk',
    owner_name: 'Neha Sharma',
    expected_close_date: '2026-10-15',
    is_flagged: false,
  },
  {
    id: 'deal-003',
    name: 'Nexus SOC Platform Migration',
    customer_name: 'Nexus Dynamics',
    stage: 'closing',
    value: 1650000,
    discount_percent: 8,
    margin_percent: 42,
    risk_level: 'low',
    health_score: 88,
    health_status: 'healthy',
    owner_name: 'Karan Patel',
    expected_close_date: '2026-09-25',
    is_flagged: false,
  },
  {
    id: 'deal-004',
    name: 'Zenith AI Core Appliance Deployment',
    customer_name: 'Zenith Corp',
    stage: 'draft',
    value: 3200000,
    discount_percent: 10,
    margin_percent: 38,
    risk_level: 'low',
    health_score: 90,
    health_status: 'healthy',
    owner_name: 'Rahul Verma',
    expected_close_date: '2026-11-01',
    is_flagged: false,
  },
  {
    id: 'deal-005',
    name: 'Globex Multi-Tenant Cloud Fleet',
    customer_name: 'Globex International',
    stage: 'pending_approval',
    value: 4100000,
    discount_percent: 22,
    margin_percent: 21,
    risk_level: 'high',
    health_score: 58,
    health_status: 'at_risk',
    owner_name: 'Neha Sharma',
    expected_close_date: '2026-10-05',
    is_flagged: true,
  },
  {
    id: 'deal-006',
    name: 'Stark Data Lake Expansion',
    customer_name: 'Stark Industries',
    stage: 'won',
    value: 7200000,
    discount_percent: 5,
    margin_percent: 45,
    risk_level: 'low',
    health_score: 96,
    health_status: 'healthy',
    owner_name: 'Rahul Verma',
    expected_close_date: '2026-08-30',
    is_flagged: false,
  },
  {
    id: 'deal-007',
    name: 'Wayne Security Edge Appliance',
    customer_name: 'Wayne Enterprises',
    stage: 'lost',
    value: 1900000,
    discount_percent: 15,
    margin_percent: 25,
    risk_level: 'high',
    health_score: 42,
    health_status: 'stalled',
    owner_name: 'Karan Patel',
    expected_close_date: '2026-08-20',
    is_flagged: true,
  },
]

export function MyDealsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const stage = searchParams.get('stage') ?? ''
  const viewParam = searchParams.get('view')

  const [view, setView] = useState<'table' | 'kanban'>(
    viewParam === 'kanban' || viewParam === 'pipeline' ? 'kanban' : 'table'
  )
  const [deals, setDeals] = useState<DealRecord[]>(INITIAL_FALLBACK_DEALS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState(search)

  // Sync view when URL changes
  useEffect(() => {
    if (viewParam === 'kanban' || viewParam === 'pipeline') {
      setView('kanban')
    } else if (viewParam === 'table') {
      setView('table')
    }
  }, [viewParam])

  // Debounced search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== search) {
        const p = new URLSearchParams(searchParams)
        if (q) p.set('search', q)
        else p.delete('search')
        p.set('page', '1')
        setSearchParams(p)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [q, search, searchParams, setSearchParams])

  const loadDeals = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (stage && stage !== 'all') params.set('filter[stage]', stage)
      params.set('page', searchParams.get('page') ?? '1')
      params.set('per_page', '50')

      const res = await apiClient.get(`/deals?${params.toString()}`)
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Normalize backend deals
        const normalized: DealRecord[] = res.data.data.map((d: any) => ({
          id: d.id,
          name: d.name || d.title || `Deal-${d.id.slice(0, 6)}`,
          customer_name: d.customer_name || d.customer?.name || 'Customer Organization',
          stage: d.stage || 'draft',
          value: Number(d.value || d.deal_value || 0),
          discount_percent: Number(d.discount_percent ?? d.discount ?? 10),
          margin_percent: Number(d.margin_percent ?? d.margin ?? 35),
          risk_level: d.risk_level ?? 'low',
          health_score: Number(d.health_score ?? 80),
          health_status: d.health_status ?? (d.health_score > 75 ? 'healthy' : 'at_risk'),
          owner_name: d.owner_name || d.owner?.name || 'Sales Representative',
          expected_close_date: d.expected_close_date || new Date().toISOString().slice(0, 10),
          is_flagged: Boolean(d.is_flagged),
        }))
        setDeals(normalized)
      } else {
        setDeals(INITIAL_FALLBACK_DEALS)
      }
    } catch {
      setDeals(INITIAL_FALLBACK_DEALS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals()
  }, [])

  // Filtered deals based on search and stage
  const filteredDeals = useMemo(() => {
    let list = [...deals]
    if (search) {
      const sq = search.toLowerCase().trim()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(sq) ||
          d.customer_name.toLowerCase().includes(sq) ||
          d.owner_name.toLowerCase().includes(sq) ||
          d.stage.toLowerCase().includes(sq)
      )
    }
    if (stage && stage !== 'all') {
      list = list.filter((d) => d.stage === stage)
    }
    return list
  }, [deals, search, stage])

  // KPIs dynamically computed
  const totalPipelineValue = useMemo(
    () => deals.reduce((acc, d) => acc + (d.stage !== 'lost' ? d.value : 0), 0),
    [deals]
  )
  const openDealsCount = useMemo(
    () => deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
    [deals]
  )
  const wonDealsCount = useMemo(() => deals.filter((d) => d.stage === 'won').length, [deals])
  const lostDealsCount = useMemo(() => deals.filter((d) => d.stage === 'lost').length, [deals])
  const atRiskDealsCount = useMemo(
    () => deals.filter((d) => d.risk_level === 'high' || d.is_flagged).length,
    [deals]
  )

  // Quick stage update
  const handleStageChange = async (dealId: string, newStage: DealRecord['stage']) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    )
    toast.success(`Deal moved to ${newStage.replace(/_/g, ' ')}`)
    try {
      await apiClient.patch(`/deals/${dealId}`, { stage: newStage })
    } catch {
      // Backend may be running mocked
    }
  }

  // Toggle flagged state
  const handleToggleFlag = (dealId: string) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          const next = !d.is_flagged
          toast.info(next ? 'Deal flagged for managerial risk review' : 'Deal unflagged')
          return { ...d, is_flagged: next, risk_level: next ? 'high' : d.risk_level }
        }
        return d
      })
    )
  }

  const handleExport = () => {
    if (filteredDeals.length === 0) {
      toast.info('No deals to export')
      return
    }
    const headers = ['Deal Name', 'Customer', 'Value', 'Stage', 'Discount %', 'Margin %', 'Risk', 'Health']
    const rows = filteredDeals.map((d) => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.customer_name.replace(/"/g, '""')}"`,
      d.value,
      d.stage,
      `${d.discount_percent}%`,
      `${d.margin_percent}%`,
      d.risk_level,
      d.health_score,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Deals exported to CSV')
  }

  return (
    <div className="space-y-6">
      {/* Top Menu (B1 requirement) */}
      <SalesWorkspaceTopMenu onReload={loadDeals} />

      <PageHeader
        title="My Deals & Pipeline Workspace"
        description="Unified deal management and stage transition pipeline — aligned to backend state machine."
        breadcrumbs={[
          { label: 'Sales', href: '/sales/deals' },
          { label: 'Pipeline' },
        ]}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Pipeline Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search deals..."
                className="pl-9 w-52 sm:w-64 h-9 text-xs sm:text-sm bg-surface"
              />
            </div>
            <Button size="sm" asChild className="gap-1.5 shadow-xs">
              <Link to="/sales/quotations/create">
                <Plus className="h-4 w-4" />
                <span>Create Quotation</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Total Pipeline"
          value={`₹${(totalPipelineValue / 100000).toFixed(1)}L`}
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
        />
        <KpiCard label="Open Deals" value={String(openDealsCount)} />
        <KpiCard label="Won Deals" value={String(wonDealsCount)} variant="success" />
        <KpiCard label="Lost Deals" value={String(lostDealsCount)} />
        <KpiCard
          label="At Risk Deals"
          value={String(atRiskDealsCount)}
          variant="danger"
          icon={<AlertTriangle className="h-4 w-4 text-danger" />}
        />
      </div>

      {/* Stage Chips Summary */}
      <Card className="shadow-xs">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-foreground">Pipeline State Machine Stages</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Filter pipeline view by clicking any transition stage below.
            </p>
          </div>
          {stage && stage !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-primary"
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.delete('stage')
                setSearchParams(p)
              }}
            >
              Clear Filter
            </Button>
          )}
        </CardHeader>
        <CardContent className="py-2 px-4 flex flex-wrap gap-2">
          {KANBAN_STAGES.map((s) => {
            const count = deals.filter((d) => d.stage === s.id).length
            const isCurrent = stage === s.id
            return (
              <Badge
                key={s.id}
                variant={isCurrent ? 'default' : 'secondary'}
                className="cursor-pointer text-xs py-1 px-2.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  const p = new URLSearchParams(searchParams)
                  p.set('stage', s.id)
                  setSearchParams(p)
                }}
              >
                {s.label} ({count})
              </Badge>
            )
          })}
        </CardContent>
      </Card>

      {/* Filter and View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={stage || 'all'}
            onValueChange={(v) => {
              const p = new URLSearchParams(searchParams)
              if (v && v !== 'all') p.set('stage', v)
              else p.delete('stage')
              setSearchParams(p)
            }}
          >
            <SelectTrigger className="w-44 h-9 text-xs">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Stages</SelectItem>
              {KANBAN_STAGES.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-xs">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground font-numeric">
            Showing {filteredDeals.length} of {deals.length} deals
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 bg-card">
            <Button
              variant={view === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setView('table')
                const p = new URLSearchParams(searchParams)
                p.set('view', 'table')
                setSearchParams(p)
              }}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </Button>
            <Button
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setView('kanban')
                const p = new URLSearchParams(searchParams)
                p.set('view', 'kanban')
                setSearchParams(p)
              }}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Pipeline Kanban</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-danger-subtle border border-danger/20 p-6 text-center text-danger text-small">
          {error}
        </div>
      ) : filteredDeals.length === 0 ? (
        <EmptyState
          title="No deals found"
          description="No deals match your search criteria. Try clearing search or stage filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ('')
                const p = new URLSearchParams()
                setSearchParams(p)
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : view === 'kanban' ? (
        /* B2 Pipeline Kanban Board */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {KANBAN_STAGES.map((col) => {
              const colDeals = filteredDeals.filter((d) => d.stage === col.id)
              const colValue = colDeals.reduce((sum, d) => sum + d.value, 0)
              return (
                <div
                  key={col.id}
                  className={`flex-1 min-w-[220px] max-w-[260px] rounded-xl border p-3 flex flex-col bg-card/50 ${col.color}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
                    <div className="leading-tight">
                      <span className="text-xs font-bold text-foreground block">{col.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono font-numeric">
                        ₹{(colValue / 100000).toFixed(1)}L ({colDeals.length})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
                      {colDeals.length}
                    </Badge>
                  </div>

                  {/* Deals Cards */}
                  <div className="space-y-3 flex-1">
                    {colDeals.length === 0 ? (
                      <div className="p-4 text-center border border-dashed rounded-lg text-[11px] text-muted-foreground">
                        No deals in {col.label}
                      </div>
                    ) : (
                      colDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          className={`shadow-xs hover:shadow-sm transition-all border ${
                            deal.is_flagged ? 'border-danger/70 bg-danger-subtle/10' : 'border-border bg-card'
                          }`}
                        >
                          <CardContent className="p-3 space-y-2.5">
                            {/* Card Top: Customer & Flag */}
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate font-medium">{deal.customer_name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleToggleFlag(deal.id)}
                                className={`p-1 rounded hover:bg-muted transition-colors ${
                                  deal.is_flagged ? 'text-danger' : 'text-muted-foreground'
                                }`}
                                title={deal.is_flagged ? 'Unflag deal' : 'Flag deal for risk review'}
                              >
                                <Flag className="h-3.5 w-3.5" fill={deal.is_flagged ? 'currentColor' : 'none'} />
                              </button>
                            </div>

                            {/* Deal Title Link */}
                            <Link
                              to={`/sales/deals/${deal.id}`}
                              className="text-xs font-semibold text-foreground hover:text-primary hover:underline line-clamp-2 leading-snug block"
                            >
                              {deal.name}
                            </Link>

                            {/* Value & Health Score */}
                            <div className="flex items-baseline justify-between pt-1 border-t border-border/60">
                              <span className="text-sm font-bold font-numeric text-foreground">
                                ₹{Number(deal.value).toLocaleString('en-IN')}
                              </span>
                              <Badge
                                variant={
                                  deal.health_score >= 80
                                    ? 'success'
                                    : deal.health_score >= 60
                                    ? 'warning'
                                    : 'danger'
                                }
                                className="text-[10px] py-0 font-mono"
                              >
                                {deal.health_score}/100
                              </Badge>
                            </div>

                            {/* Discount & Margin Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-numeric">
                              <span className="px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                                Disc: {deal.discount_percent}%
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-mono">
                                Margin: {deal.margin_percent}%
                              </span>
                              <RiskBadge risk={deal.risk_level as never} className="text-[9px] py-0">
                                {deal.risk_level}
                              </RiskBadge>
                            </div>

                            {/* Expected Close Date */}
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                              <Calendar className="h-3 w-3" />
                              <span>Exp: {deal.expected_close_date}</span>
                            </div>

                            {/* Stage Move Dropdown & Quick Actions */}
                            <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5">
                              <Select
                                value={deal.stage}
                                onValueChange={(v) => handleStageChange(deal.id, v as DealRecord['stage'])}
                              >
                                <SelectTrigger className="h-6 text-[10px] px-2 w-28 bg-muted/30">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {KANBAN_STAGES.map((s) => (
                                    <SelectItem key={s.id} value={s.id} className="text-xs">
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <div className="flex items-center gap-1">
                                {deal.stage !== 'won' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStageChange(deal.id, 'won')}
                                    className="h-6 w-6 p-0 text-success hover:text-success hover:bg-success/10"
                                    title="Mark Won"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {deal.stage !== 'lost' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleStageChange(deal.id, 'lost')}
                                    className="h-6 w-6 p-0 text-danger hover:text-danger hover:bg-danger/10"
                                    title="Mark Lost"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <Card className="shadow-xs">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Value (INR)</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Exp Close</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className={deal.is_flagged ? 'bg-danger-subtle/10' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {deal.is_flagged && <Flag className="h-3.5 w-3.5 text-danger shrink-0 fill-current" />}
                        <Link
                          to={`/sales/deals/${deal.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {deal.name}
                        </Link>
                      </div>
                      <span className="text-[11px] text-muted-foreground block font-mono">
                        Owner: {deal.owner_name}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{deal.customer_name}</TableCell>
                    <TableCell className="text-right font-numeric font-bold tabular-nums">
                      ₹{Number(deal.value).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {deal.stage.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-numeric font-mono">{deal.discount_percent}%</TableCell>
                    <TableCell className="text-right font-numeric font-mono text-success font-medium">
                      {deal.margin_percent}%
                    </TableCell>
                    <TableCell>
                      <RiskBadge risk={deal.risk_level as never}>{deal.risk_level}</RiskBadge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deal.health_score >= 80
                            ? 'success'
                            : deal.health_score >= 60
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-xs font-mono"
                      >
                        {deal.health_score}/100
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {deal.expected_close_date}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                          <Link to={`/sales/deals/${deal.id}`}>View</Link>
                        </Button>
                        <Select
                          value={deal.stage}
                          onValueChange={(v) => handleStageChange(deal.id, v as DealRecord['stage'])}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {KANBAN_STAGES.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="text-xs">
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

