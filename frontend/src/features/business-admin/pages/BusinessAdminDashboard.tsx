import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { EmptyState } from '@/components/ui/empty-state'
import { useAuth } from '@/providers/AuthProvider'
import {
  useDashboardKpis,
  useSalesOverview,
  useRevenueOverview,
  useApprovalOverview,
  useInventoryOverview,
  useDealHealth,
  useRecentDeals,
  useRecentActivity,
  useDashboardAlerts,
} from '../hooks/use-business-admin'
import {
  Users,
  Package,
  FileText,
  Clock,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  AlertCircle,
  UserPlus,
  Settings,
  CheckCircle2,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, parseISO } from 'date-fns'

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export function BusinessAdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useDashboardKpis()
  const { data: sales, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSalesOverview()
  const { data: revenue, isLoading: revenueLoading, error: revenueError, refetch: refetchRevenue } = useRevenueOverview()
  const { data: approvals, isLoading: approvalsLoading, error: approvalsError, refetch: refetchApprovals } = useApprovalOverview()
  const { data: inventory, isLoading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useInventoryOverview()
  const { data: dealHealth, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useDealHealth()
  const { data: recentDeals, isLoading: dealsLoading, error: dealsError, refetch: refetchDeals } = useRecentDeals()
  const { data: activity, isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useRecentActivity()
  const { data: alerts, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useDashboardAlerts()

  const isLoading = kpisLoading || salesLoading || revenueLoading || approvalsLoading || inventoryLoading || healthLoading || dealsLoading || activityLoading || alertsLoading
  if (isLoading) return <DashboardSkeleton />

  const safeFormatDate = (ts?: string) => {
    if (!ts) return '—'
    try {
      const d = parseISO(ts)
      if (Number.isNaN(d.getTime())) return '—'
      return format(d, 'MMM d, yyyy · h:mm a')
    } catch {
      return '—'
    }
  }

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {(kpisError || salesError || revenueError || approvalsError || inventoryError || healthError || dealsError || activityError) && (
        <div role="alert" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-danger-subtle p-4 text-sm text-danger">
          <div>
            <p className="font-semibold">Dashboard data is temporarily unavailable.</p>
            <p className="mt-1 text-xs text-muted-foreground">The page is still available, but metrics will appear only after the authoritative analytics API responds.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { refetchKpis(); refetchSales(); refetchRevenue(); refetchApprovals(); refetchInventory(); refetchHealth(); refetchDeals(); refetchActivity(); refetchAlerts(); }}>Retry dashboard</Button>
        </div>
      )}
      {/* Enterprise Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-display">
              {greeting}, {user?.full_name || user?.email || 'Business Admin'}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Workspace
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time operational summary, deal health indicators, and governance pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/users/invite')}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Invite Member
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold shadow-xs"
            onClick={() => navigate('/business-admin/organization/settings')}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Workspace Settings
          </Button>
        </div>
      </div>

      {/* Governance & System Alerts */}
      {!alertsLoading && !alertsError && alerts && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 rounded-xl border p-5 shadow-xs transition-all ${
                alert.severity === 'critical'
                  ? 'border-rose-500/30 bg-rose-500/5 text-rose-950 dark:text-rose-200'
                  : alert.severity === 'warning'
                  ? 'border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-200'
                  : 'border-blue-500/30 bg-blue-500/5 text-blue-950 dark:text-blue-200'
              }`}
            >
              {alert.severity === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              ) : alert.severity === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{alert.description}</p>
              </div>
              {alert.actionLabel && alert.actionPath && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-7 text-xs font-medium border-border/80"
                  onClick={() => navigate(alert.actionPath)}
                >
                  {alert.actionLabel}
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {alertsError && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-xl bg-warning-subtle p-3 text-xs text-warning">
          <span>System alerts could not be loaded.</span>
          <Button variant="ghost" size="sm" className="h-7" onClick={() => refetchAlerts()}>Retry alerts</Button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            <div className="p-1.5 rounded-lg bg-muted/60"><Users className="h-4 w-4 text-foreground/80" /></div>
          </div>
          <p className="text-2xl font-bold font-display tabular-nums text-foreground">
            {kpis?.totalCustomers?.toLocaleString('en-IN') ?? '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">Active accounts</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Products</span>
            <div className="p-1.5 rounded-lg bg-muted/60"><Package className="h-4 w-4 text-foreground/80" /></div>
          </div>
          <p className="text-2xl font-bold font-display tabular-nums text-foreground">
            {kpis?.totalProducts?.toLocaleString('en-IN') ?? '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">Catalog items</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10"><FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
          </div>
          <p className="text-2xl font-bold font-display tabular-nums text-blue-600 dark:text-blue-400">
            {kpis?.activeDeals?.toLocaleString('en-IN') ?? '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">In active negotiation</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approvals</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10"><Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
          </div>
          <p className="text-2xl font-bold font-display tabular-nums text-amber-600 dark:text-amber-400">
            {kpis?.pendingApprovals?.toLocaleString('en-IN') ?? '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">Requires review</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
          </div>
          <p className="text-xl font-bold font-display tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
            {kpis ? `₹${kpis.revenue.toLocaleString('en-IN')}` : '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">Operating total</span>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs hover:border-border transition-colors">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscriptions</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10"><CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
          </div>
          <p className="text-2xl font-bold font-display tabular-nums text-purple-600 dark:text-purple-400">
            {kpis?.activeSubscriptions?.toLocaleString('en-IN') ?? '—'}
          </p>
          <span className="text-[11px] text-muted-foreground">Active recurring</span>
        </div>
      </div>

      {/* Sales Pipeline & Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Overview */}
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="p-5 pb-4 border-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold font-display">Sales Pipeline Velocity</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Deal throughput and conversion breakdown</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Won: {sales?.wonDeals ?? 0}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Lost: {sales?.lostDeals ?? 0}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="grid grid-cols-3 gap-2.5 p-2.5 rounded-lg bg-muted/30 mb-3.5">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground font-display tabular-nums">{sales?.totalDeals ?? 0}</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total Deals</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-display tabular-nums">{sales?.dealConversion ?? 0}%</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Conversion</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-display tabular-nums">
                    {sales?.dealConversion ?? 0}%
                  </p>
                </div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Win Rate</p>
              </div>
            </div>
            {sales?.dealTrend && sales.dealTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="bg-transparent">
                <BarChart data={sales.dealTrend} style={{ background: 'transparent' }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: 'transparent', border: '0', borderRadius: '0', fontSize: '12px', color: 'var(--color-foreground)', boxShadow: 'none' }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} animationDuration={350} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No deal data" description="Deal trend data will appear here." />
            )}
          </CardContent>
        </Card>

        {/* Revenue Overview */}
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="p-5 pb-4 border-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold font-display">Revenue Performance</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Recurring vs. one-time recognized revenue</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {revenue && revenue.revenueGrowth > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{revenue.revenueGrowth}% MoM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {revenue?.revenueGrowth ?? 0}% MoM
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-1">
            <div className="grid grid-cols-3 gap-2.5 p-2.5 rounded-lg bg-muted/30 mb-3.5">
              <div className="text-center">
                <p className="text-base font-bold text-foreground font-display tabular-nums truncate">
                  ₹{(revenue?.totalRevenue ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground font-display tabular-nums truncate">
                  ₹{(revenue?.oneTimeRevenue ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">One-Time</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground font-display tabular-nums truncate">
                  ₹{(revenue?.recurringRevenue ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recurring</p>
              </div>
            </div>
            {revenue?.revenueTrend && revenue.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200} className="bg-transparent">
                <AreaChart data={revenue.revenueTrend} style={{ background: 'transparent' }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: 'transparent', border: '0', borderRadius: '0', fontSize: '12px', color: 'var(--color-foreground)', boxShadow: 'none' }}
                    wrapperStyle={{ outline: 'none' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.12} strokeWidth={2} animationDuration={350} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No revenue data" description="Revenue trend data will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Operational Triad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Approvals Governance */}
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
                Approval Queue
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-semibold font-mono">SLAs</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {approvalsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
            ) : approvalsError ? (
              <ErrorState title="Failed to load" onRetry={refetchApprovals} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Pending Review</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {approvals?.pendingApprovals ?? 0} deals
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">High Risk Escalations</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    {approvals?.highRiskDeals ?? 0} flags
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Avg. Turnaround Time</span>
                  <span className="text-xs font-bold text-foreground font-mono">
                    {approvals?.averageApprovalTime ?? '—'}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-xs font-semibold" onClick={() => navigate('/business-admin/approvals')}>
                  Manage Approval Matrix
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Status */}
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
                Warehouses & Stock
              </CardTitle>
              <Badge variant={inventory?.warehouseStatus === 'healthy' ? 'success' : inventory?.warehouseStatus === 'warning' ? 'warning' : 'danger'} className="capitalize text-[11px]">
                {inventory?.warehouseStatus ?? 'healthy'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {inventoryLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
            ) : inventoryError ? (
              <ErrorState title="Failed to load" onRetry={refetchInventory} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Total In-Stock Units</span>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {inventory?.totalStock?.toLocaleString('en-IN') ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Low Stock Warnings</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {inventory?.lowStock ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Out of Stock & Backorders</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {(inventory?.outOfStock ?? 0) + (inventory?.backorders ?? 0)}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-xs font-semibold" onClick={() => navigate('/business-admin/warehouses')}>
                  Warehouse Logistics
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Health Radar */}
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold font-display uppercase tracking-wider text-foreground">
                Deal Health Sentinel
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => navigate('/business-admin/deal-health')}>
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {healthLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
            ) : healthError ? (
              <ErrorState title="Failed to load" onRetry={refetchHealth} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Clean & Healthy Pipeline</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {dealHealth?.healthyDeals ?? 0} deals
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">At-Risk & Stalled Pipeline</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    {(dealHealth?.atRisk ?? 0) + (dealHealth?.stalled ?? 0)} deals
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/40">
                  <span className="text-xs font-medium text-muted-foreground">Discount Policy Anomalies</span>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    {dealHealth?.discountAnomalies ?? 0} deals
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2 h-8 text-xs font-semibold" onClick={() => navigate('/business-admin/deal-health')}>
                  Open Health Monitor
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals & Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deals */}
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Recent Deals</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Live quotation updates across the sales floor</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary" onClick={() => navigate('/sales/deals')}>
                View All Deals
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {dealsLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : dealsError ? (
              <ErrorState title="Failed to load deals" onRetry={refetchDeals} />
            ) : !recentDeals || recentDeals.length === 0 ? (
              <EmptyState title="No deals yet" description="Deals will appear here once created." />
            ) : (
              <div className="space-y-2.5">
                {recentDeals.slice(0, 5).map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => navigate(`/sales/deals/${deal.id}`)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40 hover:border-border transition-all cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {deal.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {deal.customer} · Rep: {deal.salesRep}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground font-mono tabular-nums">
                        ₹{deal.value.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <RiskBadge risk={deal.risk as any} />
                        <StatusBadge status={deal.status as import('@/types').Status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Governance Activity */}
        <Card className="border border-border/70 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">System Audit Stream</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time immutable compliance and admin ledger</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-primary" onClick={() => navigate('/business-admin/audit')}>
                Full Audit Trail
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
            ) : activityError ? (
              <ErrorState title="Failed to load activity" onRetry={refetchActivity} />
            ) : !activity || activity.length === 0 ? (
              <EmptyState title="No activity yet" description="Activity will appear here." />
            ) : (
              <div className="space-y-2.5">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/20 transition-colors">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                      item.category === 'approval' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      item.category === 'deal' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                      item.category === 'system' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      'bg-muted text-muted-foreground border-border/60'
                    }`}>
                      {item.category === 'approval' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                       item.category === 'deal' ? <FileText className="h-3.5 w-3.5" /> :
                       item.category === 'system' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                       <Users className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">{item.actor}</span>{' '}
                        <span className="text-muted-foreground">{item.action}</span>{' '}
                        <span className="font-semibold text-foreground">{item.resource}</span>
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {safeFormatDate(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
