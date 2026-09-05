import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoneyDisplay } from '@/components/shared'
import apiClient from '@/lib/api'
import {
  FileText,
  DollarSign,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'

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
    id: 'deal-001',
    title: 'Acme Corp Annual Enterprise Expansion',
    customer: { name: 'Acme Technologies Ltd' },
    stage: 'negotiation',
    deal_value: 2450000,
    health_score: 82,
    expected_close_date: '2026-09-30',
  },
  {
    id: 'deal-002',
    title: 'Hyperion Server Infrastructure Refresh',
    customer: { name: 'Hyperion Systems' },
    stage: 'proposal',
    deal_value: 5800000,
    health_score: 74,
    expected_close_date: '2026-10-15',
  },
  {
    id: 'deal-003',
    title: 'Nexus SOC Platform Migration',
    customer: { name: 'Nexus Dynamics' },
    stage: 'closing',
    deal_value: 1650000,
    health_score: 68,
    expected_close_date: '2026-09-25',
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

export function DashboardPage() {
  const { user } = useAuth()
  const [deals, setDeals] = useState<DealItem[]>(DEFAULT_DEALS)
  const [quotations, setQuotations] = useState<QuotationItem[]>(DEFAULT_QUOTATIONS)
  const [loading, setLoading] = useState(true)

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
  const avgHealthScore = deals.length
    ? Math.round(deals.reduce((sum, d) => sum + (d.health_score || 70), 0) / deals.length)
    : 75

  return (
    <div className="space-y-6">
      {/* Welcome & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sales Representative Workspace
            </h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[11px]">
              Active Pipeline
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.full_name || 'Representative'}. Here is your active deal pipeline, quotation governance, and next actions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/sales/deals">
              <Briefcase className="h-3.5 w-3.5" />
              <span>All Deals</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link to="/sales/quotations">
              <FileText className="h-3.5 w-3.5" />
              <span>All Quotations</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs">
            <Link to="/sales/quotations/create">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Quotation</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Pipeline Value"
          value={`₹${totalPipelineValue.toLocaleString('en-IN')}`}
          trend={{ value: 12.5, direction: 'up' }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          label="Active Deals"
          value={String(deals.length)}
          trend={{ value: 8.2, direction: 'up' }}
          icon={<Briefcase className="h-5 w-5" />}
        />
        <KpiCard
          label="Active Quotations"
          value={String(quotations.length)}
          trend={{ value: 5.0, direction: 'up' }}
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Pending Approvals"
          value={String(pendingApprovalsCount)}
          variant={pendingApprovalsCount > 0 ? 'warning' : 'default'}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KpiCard
          label="Avg Deal Health"
          value={`${avgHealthScore}/100`}
          variant="success"
          trend={{ value: 3.4, direction: 'up' }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Action Items Banner */}
      {pendingApprovalsCount > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning-subtle/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center text-warning shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {pendingApprovalsCount} quotation{pendingApprovalsCount > 1 ? 's' : ''} currently awaiting Manager Approval
              </p>
              <p className="text-muted-foreground mt-0.5">
                Quotes with discount exceptions or custom terms require manager sign-off before customer release.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="text-xs shrink-0 self-start sm:self-center">
            <Link to="/sales/quotations?status=pending_approval">
              <span>View In-Review Quotes</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      {/* Main Dual Grid: Active Deals & Recent Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Active Deals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Active Deals in Pipeline
              </CardTitle>
              <CardDescription className="text-xs">
                Deals currently being managed through the sales cycle
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link to="/sales/deals">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Deal / Customer</TableHead>
                  <TableHead className="text-xs font-semibold">Stage</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Value</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} className="hover:bg-muted/40">
                    <TableCell className="py-2.5">
                      <Link
                        to={`/sales/deals/${deal.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline block max-w-[200px] truncate text-xs"
                      >
                        {deal.title}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {deal.customer.name}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={deal.stage as never} className="capitalize text-[10px]">
                        {deal.stage.replace('_', ' ')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-xs tabular-nums font-semibold">
                      <MoneyDisplay amount={deal.deal_value} />
                    </TableCell>
                    <TableCell className="py-2.5 text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          deal.health_score >= 80
                            ? 'bg-success-subtle text-success'
                            : deal.health_score >= 60
                            ? 'bg-warning-subtle text-warning'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {deal.health_score}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Panel 2: Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Recent Quotations
              </CardTitle>
              <CardDescription className="text-xs">
                Quotations created and governed across your accounts
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link to="/sales/quotations">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold">Quote / Account</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Grand Total</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Valid Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-muted/40">
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/sales/quotations/${quote.id}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {quote.quote_number}
                        </Link>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                          v{quote.version}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate max-w-[180px]">
                        {quote.customer_name}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusBadge status={quote.status as never} className="capitalize text-[10px]">
                        {quote.status.replace(/_/g, ' ')}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-xs tabular-nums font-semibold">
                      <MoneyDisplay amount={quote.grand_total} />
                    </TableCell>
                    <TableCell className="py-2.5 text-right font-mono text-[11px] text-muted-foreground">
                      {quote.valid_until}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Stage Quick Jumps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Stage Filtering & Governance
          </CardTitle>
          <CardDescription className="text-xs">
            Filter deals in the official backend sales cycle state machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Draft', filter: 'draft', desc: 'Initial quote assembly' },
              { name: 'Pending Approval', filter: 'pending_approval', desc: 'Awaiting manager sign-off' },
              { name: 'Approved', filter: 'approved', desc: 'Ready for customer presentation' },
              { name: 'Negotiation', filter: 'negotiation', desc: 'Customer review & counter offers' },
              { name: 'Confirmed', filter: 'confirmed', desc: 'Customer accepted agreement' },
              { name: 'Fulfillment', filter: 'fulfillment', desc: 'Operations & warehouse handoff' },
            ].map((st) => (
              <Button
                key={st.name}
                asChild
                variant="outline"
                size="sm"
                className="text-xs hover:border-primary hover:text-primary transition-colors h-8"
              >
                <Link to={`/sales/deals?stage=${st.filter}`}>
                  <span className="font-semibold">{st.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
