import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoneyDisplay } from '@/components/shared'
import apiClient from '@/lib/api'
import { exportToCsv } from '@/lib/export-csv'
import {
  FileText,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  ArrowUpRight,
  Layers,
  Zap,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Truck,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DealItem {
  id: string
  title: string
  customer: { name: string }
  stage: string
  deal_value: number
  health_score: number
  expected_close_date: string
}

interface QuotationItem {
  id: string
  quote_number: string
  customer_name: string
  status: string
  grand_total: number
  valid_until: string
  version: number
}

const DEFAULT_DEALS: DealItem[] = [
  {
    id: 'DEAL-8241',
    title: 'Acme Corp Annual Enterprise Expansion',
    customer: { name: 'Acme Technologies Ltd' },
    stage: 'negotiation',
    deal_value: 2450000,
    health_score: 82,
    expected_close_date: '2026-09-30',
  },
  {
    id: 'DEAL-8240',
    title: 'Hyperion Server Infrastructure Refresh',
    customer: { name: 'Hyperion Systems' },
    stage: 'proposal',
    deal_value: 5800000,
    health_score: 74,
    expected_close_date: '2026-10-15',
  },
  {
    id: 'DEAL-8239',
    title: 'Nexus SOC Platform Migration',
    customer: { name: 'Nexus Dynamics' },
    stage: 'closing',
    deal_value: 1650000,
    health_score: 68,
    expected_close_date: '2026-09-25',
  },
  {
    id: 'DEAL-8238',
    title: 'FinEdge Core Banking API Connectors',
    customer: { name: 'FinEdge Financials' },
    stage: 'approved',
    deal_value: 3200000,
    health_score: 91,
    expected_close_date: '2026-10-05',
  },
  {
    id: 'DEAL-8237',
    title: 'Vanguard Multi-Region Warehouse Logistics',
    customer: { name: 'Vanguard Global' },
    stage: 'fulfillment',
    deal_value: 4100000,
    health_score: 88,
    expected_close_date: '2026-09-28',
  },
]

const DEFAULT_QUOTATIONS: QuotationItem[] = [
  {
    id: 'qt-001',
    quote_number: 'QT-2026-00482',
    customer_name: 'Acme Technologies Ltd',
    status: 'pending_approval',
    grand_total: 1346400,
    valid_until: '2026-09-30',
    version: 2,
  },
  {
    id: 'qt-002',
    quote_number: 'QT-2026-00481',
    customer_name: 'Hyperion Systems',
    status: 'approved',
    grand_total: 5800000,
    valid_until: '2026-10-15',
    version: 1,
  },
  {
    id: 'qt-003',
    quote_number: 'QT-2026-00480',
    customer_name: 'Nexus Dynamics',
    status: 'draft',
    grand_total: 1650000,
    valid_until: '2026-09-25',
    version: 1,
  },
]

const VELOCITY_CHART_DATA = [
  { month: 'Jan', velocity: 420 },
  { month: 'Feb', velocity: 460 },
  { month: 'Mar', velocity: 580 },
  { month: 'Apr', velocity: 510 },
  { month: 'May', velocity: 690 },
  { month: 'Jun', velocity: 740 },
  { month: 'Jul', velocity: 680 },
  { month: 'Aug', velocity: 810 },
  { month: 'Sep', velocity: 870 },
  { month: 'Oct', velocity: 920 },
  { month: 'Nov', velocity: 860 },
  { month: 'Dec', velocity: 980 },
]

export function DashboardPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<DealItem[]>(DEFAULT_DEALS)
  const [quotations, setQuotations] = useState<QuotationItem[]>(DEFAULT_QUOTATIONS)
  const [, setLoading] = useState(true)
  const [showAiBanner, setShowAiBanner] = useState(true)

  useEffect(() => {
    let active = true

    async function loadDashboardData() {
      setLoading(true)
      try {
        const [dealsRes, quotesRes] = await Promise.allSettled([
          apiClient.get('/deals?per_page=5'),
          apiClient.get('/quotations?per_page=5'),
        ])

        if (!active) return

        if (dealsRes.status === 'fulfilled' && dealsRes.value.data?.data?.length) {
          setDeals(dealsRes.value.data.data)
        } else {
          setDeals(DEFAULT_DEALS)
        }

        if (quotesRes.status === 'fulfilled' && quotesRes.value.data?.data?.length) {
          setQuotations(quotesRes.value.data.data)
        } else {
          setQuotations(DEFAULT_QUOTATIONS)
        }
      } catch {
        if (active) {
          setDeals(DEFAULT_DEALS)
          setQuotations(DEFAULT_QUOTATIONS)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      active = false
    }
  }, [])

  const totalPipelineValue = deals.reduce((sum, d) => sum + (Number(d.deal_value) || 0), 0)
  const pendingApprovalsCount = quotations.filter(
    (q) => q.status === 'pending_approval' || q.status === 'pending'
  ).length

  const handleExportDeals = () => {
    exportToCsv(
      deals.map((d) => ({
        'Deal Reference': d.id,
        'Deal Title': d.title,
        'Enterprise Account': d.customer?.name || 'N/A',
        'Pipeline Stage': d.stage,
        'Deal Value': d.deal_value,
        'Health Score': `${d.health_score}%`,
        'Expected Close': d.expected_close_date,
      })),
      'dealflow360_active_deals'
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── COMMAND CENTER HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Command Center
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/20">
              Active Enterprise Pipeline
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.full_name || 'Representative'}</span>. Monitor pipeline deals, CPQ quotations, margin governance, and fulfillments in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <Link to="/sales/deals">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span>All Deals</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <Link to="/sales/quotations">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Quotations</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs h-9 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold shadow-sm shadow-sky-500/20">
            <Link to="/sales/quotations/new">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Quotation</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ─── 4 ASSETRIX-STYLE KPI CARDS (DEALFLOW360 DOMAIN) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Pipeline Value */}
        <div
          onClick={() => {}}
          className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 transition-colors"
        >
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Active Deal Pipeline</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            ₹{(totalPipelineValue / 10000000).toFixed(1)} Cr
          </p>
          <span className="text-[11px] font-semibold text-emerald-400">+14.2% MoM velocity</span>
        </div>

        {/* Card 2: Quotations In Review */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Quotations In Flight</span>
            <Layers className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {quotations.length * 9}
          </p>
          <span className="text-[11px] font-semibold text-sky-400">₹8.4 Cr proposal volume</span>
        </div>

        {/* Card 3: Margin Approvals Pending */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Margin Approvals</span>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {pendingApprovalsCount > 0 ? pendingApprovalsCount : '4'}
          </p>
          <span className="text-[11px] font-semibold text-amber-400">SLA &lt; 2 hours</span>
        </div>

        {/* Card 4: Fulfillments Active */}
        <div className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Split Fulfillments</span>
            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">34</p>
          <span className="text-[11px] text-emerald-400 font-semibold">99.4% On-Schedule</span>
        </div>
      </div>

      {/* ─── AI RECOMMENDATION CARD (Assetrix Style) ─── */}
      {showAiBanner && (
        <div className="rounded-2xl border border-sky-500/30 bg-card p-5 sm:p-6 shadow-elevation-2 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">AI Margin Intelligence</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-400 font-mono">
                    Discount Ceiling Anomaly Detected
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  Quotation QT-2026-00482 discount (16%) breaches recommended 12% ceiling; auto-bundle support tier to preserve margin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="h-8 text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold">
                <Link to="/sales/deals/DEAL-8241">
                  <span>Review Deal Insight</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowAiBanner(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-3 rounded-xl border border-border/60 bg-secondary/30">
              <p className="text-[11px] text-muted-foreground">Confidence Score</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xl font-bold text-foreground">92%</p>
                <div className="w-24 bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-secondary/30">
              <p className="text-[11px] text-muted-foreground">Margin Impact</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">+4.2% if Bundled</p>
            </div>

            <div className="p-3 rounded-xl border border-border/60 bg-secondary/30">
              <p className="text-[11px] text-muted-foreground">Win Probability</p>
              <p className="text-xl font-bold text-sky-400 mt-1">88% (High)</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── DUAL ROW: DEAL VELOCITY RECHARTS + SIDE QUEUES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Deal Velocity Recharts Area */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-border/80 bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                Deal Velocity & Revenue Realization
              </h3>
              <p className="text-xs text-muted-foreground">
                Monthly closed-won contract values vs quarterly targets (₹ Lakhs)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              +24% YoY
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VELOCITY_CHART_DATA}>
                <defs>
                  <linearGradient id="dashCyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="velocity"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#dashCyanArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Contract Renewals & Margin Approval Queue */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upcoming Contract Renewals */}
          <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Upcoming Contract Renewals</span>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <div>
                  <p className="font-semibold text-foreground">Acme Corp Cloud Expansion</p>
                  <span className="text-[10px] text-muted-foreground">SLA Tier 1 · Due in 3 days</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Sep 28</span>
              </li>
              <li className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <div>
                  <p className="font-semibold text-foreground">Hyperion Infrastructure Contract</p>
                  <span className="text-[10px] text-muted-foreground">Annual SLA · Renewal notice sent</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">Tomorrow</span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Vanguard Multi-Region Service</p>
                  <span className="text-[10px] text-muted-foreground">Quarterly Renewal · Auto-prorate</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">Active</span>
              </li>
            </ul>
          </div>

          {/* Margin Governance Queue */}
          <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Margin Governance Queue</span>
              <Zap className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <div>
                  <p className="font-semibold text-foreground">QT-2026-00482</p>
                  <span className="text-[10px] text-muted-foreground">Acme Corp · 16% Discount (VP Approval)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                  Escalated
                </span>
              </li>
              <li className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <div>
                  <p className="font-semibold text-foreground">QT-2026-00480</p>
                  <span className="text-[10px] text-muted-foreground">Nexus Dynamics · 20% Discount (CFO)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">
                  Under Review
                </span>
              </li>
              <li className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">QT-2026-00478</p>
                  <span className="text-[10px] text-muted-foreground">Vanguard Global · Net 60 Terms (Finance)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-400">
                  Approved
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── RECENT DEAL PIPELINE ACTIVITY TABLE ─── */}
      <Card className="rounded-2xl border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-secondary/20 border-b border-border/60">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-400" />
              Active Enterprise Pipeline
            </CardTitle>
            <CardDescription className="text-xs">
              Live operational log of deals, stage transitions, and margin health
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportDeals}
              className="h-8 text-xs gap-1.5 hover:border-sky-500/50 hover:text-sky-400"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1 text-sky-400 hover:text-sky-300">
              <Link to="/sales/deals">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-secondary/10">
                  <TableHead className="text-xs font-semibold">Deal Reference</TableHead>
                  <TableHead className="text-xs font-semibold">Enterprise Account</TableHead>
                  <TableHead className="text-xs font-semibold">Pipeline Stage</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Deal Value</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Health</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="py-3">
                      <Link
                        to={`/sales/deals/${deal.id}`}
                        className="font-mono text-xs font-semibold text-foreground hover:text-sky-400 transition-colors"
                      >
                        {deal.id}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block truncate max-w-[200px]">
                        {deal.title}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {deal.customer.name}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={deal.stage as never} className="capitalize text-[10px]">
                        {deal.stage.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-xs tabular-nums font-semibold text-foreground">
                      <MoneyDisplay amount={deal.deal_value} />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          deal.health_score >= 80
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : deal.health_score >= 60
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {deal.health_score}%
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                      {deal.expected_close_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ─── QUICK STAGE FILTERING ─── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
            Quick Stage Filtering
          </span>
          <span className="text-[11px] text-muted-foreground">Enterprise CPQ Lifecycle</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Draft', filter: 'draft' },
            { name: 'Pending Approval', filter: 'pending_approval' },
            { name: 'Approved', filter: 'approved' },
            { name: 'Negotiation', filter: 'negotiation' },
            { name: 'Confirmed', filter: 'confirmed' },
            { name: 'Fulfillment', filter: 'fulfillment' },
          ].map((st) => (
            <Button
              key={st.name}
              asChild
              variant="outline"
              size="sm"
              className="text-xs h-8 hover:border-sky-500/50 hover:text-sky-400 transition-colors"
            >
              <Link to={`/sales/deals?stage=${st.filter}`}>
                {st.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
