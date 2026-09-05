import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '../components/BusinessAdminPageHeader'
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
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
  const { data: kpis, isLoading: kpisLoading, error: kpisError, refetch: refetchKpis } = useDashboardKpis()
  const { data: sales, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSalesOverview()
  const { data: revenue, isLoading: revenueLoading, error: revenueError, refetch: refetchRevenue } = useRevenueOverview()
  const { data: approvals, isLoading: approvalsLoading, error: approvalsError, refetch: refetchApprovals } = useApprovalOverview()
  const { data: inventory, isLoading: inventoryLoading, error: inventoryError, refetch: refetchInventory } = useInventoryOverview()
  const { data: dealHealth, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useDealHealth()
  const { data: recentDeals, isLoading: dealsLoading, error: dealsError, refetch: refetchDeals } = useRecentDeals()
  const { data: activity, isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useRecentActivity()
  const { data: alerts, isLoading: alertsLoading, error: alertsError } = useDashboardAlerts()

  const isLoading = kpisLoading || salesLoading || revenueLoading
  if (isLoading) return <DashboardSkeleton />

  if (kpisError || salesError || revenueError) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        description="There was a problem loading your dashboard data."
        onRetry={() => { refetchKpis(); refetchSales(); refetchRevenue() }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good morning, ${new Date().getHours() < 12 ? '' : new Date().getHours() < 17 ? '' : ''}Admin`}
        description="Here's what's happening with your business today."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/business-admin/users/invite')}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Add User
            </Button>
            <Button size="sm" onClick={() => navigate('/business-admin/organization/settings')}>
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        }
      />

      {/* Alerts */}
      {!alertsLoading && !alertsError && alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${
                alert.severity === 'critical'
                  ? 'border-danger/30 bg-danger-subtle'
                  : alert.severity === 'warning'
                  ? 'border-warning/30 bg-warning-subtle'
                  : 'border-info/30 bg-info-subtle'
              }`}
            >
              {alert.severity === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              ) : alert.severity === 'warning' ? (
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{alert.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
              {alert.actionLabel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => alert.actionPath && navigate(alert.actionPath)}
                >
                  {alert.actionLabel}
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Customers" value={kpis?.totalCustomers ?? 0} icon={<Users className="h-5 w-5" />} />
        <KpiCard label="Products" value={kpis?.totalProducts ?? 0} icon={<Package className="h-5 w-5" />} />
        <KpiCard label="Active Deals" value={kpis?.activeDeals ?? 0} variant="info" icon={<FileText className="h-5 w-5" />} />
        <KpiCard label="Pending Approvals" value={kpis?.pendingApprovals ?? 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
        <KpiCard
          label="Revenue"
          value={`₹${(kpis?.revenue ?? 0).toLocaleString()}`}
          variant="success"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard label="Subscriptions" value={kpis?.activeSubscriptions ?? 0} variant="intelligence" icon={<CreditCard className="h-5 w-5" />} />
      </div>

      {/* Sales & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Overview</CardTitle>
              <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Won: {sales?.wonDeals ?? 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger" />
                  Lost: {sales?.lostDeals ?? 0}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-[24px] font-bold text-foreground tabular-nums">{sales?.totalDeals ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">Total Deals</p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-bold text-success tabular-nums">{sales?.dealConversion ?? 0}%</p>
                <p className="text-[11px] text-muted-foreground">Conversion</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  <p className="text-[24px] font-bold text-success tabular-nums">
                    {sales?.wonDeals ? Math.round((sales.wonDeals / Math.max(sales.totalDeals, 1)) * 100) : 0}%
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">Win Rate</p>
              </div>
            </div>
            {sales?.dealTrend && sales.dealTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sales.dealTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Overview</CardTitle>
              <div className="flex items-center gap-1.5 text-[12px]">
                {revenue && revenue.revenueGrowth > 0 ? (
                  <span className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +{revenue.revenueGrowth}%
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-danger">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {revenue?.revenueGrowth ?? 0}%
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-[24px] font-bold text-foreground tabular-nums">
                  ${(revenue?.totalRevenue ?? 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-bold text-foreground tabular-nums">
                  ${(revenue?.oneTimeRevenue ?? 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">One-Time</p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-bold text-foreground tabular-nums">
                  ${(revenue?.recurringRevenue ?? 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground">Recurring</p>
              </div>
            </div>
            {revenue?.revenueTrend && revenue.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenue.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.1} animationDuration={350} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No revenue data" description="Revenue trend data will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approval, Inventory, Deal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Approval Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {approvalsLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : approvalsError ? (
              <ErrorState title="Failed to load" onRetry={refetchApprovals} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Pending</span>
                  <span className="text-[13px] font-semibold text-warning tabular-nums">{approvals?.pendingApprovals ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">High Risk</span>
                  <span className="text-[13px] font-semibold text-danger tabular-nums">{approvals?.highRiskDeals ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Avg. Time</span>
                  <span className="text-[13px] font-semibold text-foreground">{approvals?.averageApprovalTime ?? '—'}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/business-admin/approvals')}>
                  Review Approvals
                  <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : inventoryError ? (
              <ErrorState title="Failed to load" onRetry={refetchInventory} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Total Stock</span>
                  <span className="text-[13px] font-semibold text-foreground tabular-nums">{inventory?.totalStock?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Low Stock</span>
                  <span className="text-[13px] font-semibold text-warning tabular-nums">{inventory?.lowStock ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Out of Stock</span>
                  <span className="text-[13px] font-semibold text-danger tabular-nums">{inventory?.outOfStock ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Backorders</span>
                  <span className="text-[13px] font-semibold text-warning tabular-nums">{inventory?.backorders ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Status</span>
                  <Badge variant={inventory?.warehouseStatus === 'healthy' ? 'success' : inventory?.warehouseStatus === 'warning' ? 'warning' : 'danger'}>
                    {inventory?.warehouseStatus ?? 'unknown'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deal Health */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Health</CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : healthError ? (
              <ErrorState title="Failed to load" onRetry={refetchHealth} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Healthy</span>
                  <span className="text-[13px] font-semibold text-success tabular-nums">{dealHealth?.healthyDeals ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">At Risk</span>
                  <span className="text-[13px] font-semibold text-warning tabular-nums">{dealHealth?.atRisk ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Stalled</span>
                  <span className="text-[13px] font-semibold text-danger tabular-nums">{dealHealth?.stalled ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Discount Anomalies</span>
                  <span className="text-[13px] font-semibold text-warning tabular-nums">{dealHealth?.discountAnomalies ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">Delivery Slippage</span>
                  <span className="text-[13px] font-semibold text-danger tabular-nums">{dealHealth?.deliverySlippage ?? 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Deals</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sales/deals')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : dealsError ? (
              <ErrorState title="Failed to load deals" onRetry={refetchDeals} />
            ) : !recentDeals || recentDeals.length === 0 ? (
              <EmptyState title="No deals yet" description="Deals will appear here once created." />
            ) : (
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => navigate(`/sales/deals/${deal.id}`)}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{deal.name}</p>
                      <p className="text-[11px] text-muted-foreground">{deal.customer} · {deal.salesRep}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-foreground tabular-nums">
                        ${deal.value.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/business-admin/audit')}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : activityError ? (
              <ErrorState title="Failed to load activity" onRetry={refetchActivity} />
            ) : !activity || activity.length === 0 ? (
              <EmptyState title="No activity yet" description="Activity will appear here." />
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      item.category === 'approval' ? 'bg-success-subtle' :
                      item.category === 'deal' ? 'bg-info-subtle' :
                      item.category === 'system' ? 'bg-warning-subtle' :
                      'bg-surface-muted'
                    }`}>
                      {item.category === 'approval' ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> :
                       item.category === 'deal' ? <FileText className="h-3.5 w-3.5 text-info" /> :
                       item.category === 'system' ? <AlertTriangle className="h-3.5 w-3.5 text-warning" /> :
                       <Users className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground">
                        <span className="font-semibold">{item.actor}</span>{' '}
                        {item.action}{' '}
                        <span className="font-medium">{item.resource}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {format(parseISO(item.timestamp), 'MMM d, yyyy · h:mm a')}
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
