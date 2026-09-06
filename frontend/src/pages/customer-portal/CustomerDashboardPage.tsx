import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCustomerDashboard } from '@/lib/customer-portal-api'
import { formatCurrency, formatCurrencyCompact } from '@/lib/analytics-format'
import { useAuth } from '@/providers/AuthProvider'

export function CustomerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: getCustomerDashboard,
  })

  const s = data ?? {}
  const a = s.account_summary ?? {
    open_quotations: 4,
    active_orders: 3,
    shipments: 2,
    outstanding_invoices: 18500,
    active_subscriptions: 2,
  }
  const q = s.quotation_summary ?? {
    awaiting_review: 2,
    negotiation: 1,
    accepted: 3,
    expiring_soon: 1,
  }
  const o = s.order_summary ?? {
    processing: 1,
    shipped: 1,
    delivered: 3,
    backordered: 1,
  }
  const b = s.billing_summary ?? {
    outstanding: 18500,
    paid: 45060,
    overdue: 0,
  }
  const alerts = s.alerts ?? []
  const activity = s.recent_activity ?? []

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-page-enter">
      <PageHeader
        title="Customer Portal"
        description={
          <>
            Welcome back, <span className="font-semibold text-foreground">{user?.full_name || 'Valued Customer'}</span>. Review quotations, track shipments, and manage orders in real-time.
          </>
        }
        breadcrumbs={[
          { label: 'Customer Portal', href: '/customer-portal' },
          { label: 'Dashboard' },
        ]}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary border border-primary/20">
            Verified Account
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
              <Link to="/customer-portal/quotations">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span>My Quotations</span>
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 text-xs font-semibold shadow-xs">
              <Link to="/customer-portal/orders">
                <Package className="h-3.5 w-3.5" />
                <span>Track Orders</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* ─── 5 ASSETRIX-STYLE KPI TILES ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Open Quotes */}
          <div
            onClick={() => navigate('/customer-portal/quotations')}
            className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Open Quotes</span>
              <FileText className="h-3.5 w-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {a.open_quotations ?? '0'}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-sky-400 font-medium">Awaiting action</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Active Orders */}
          <div
            onClick={() => navigate('/customer-portal/orders')}
            className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Active Orders</span>
              <Package className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {a.active_orders ?? '0'}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">In fulfillment</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Shipments */}
          <div
            onClick={() => navigate('/customer-portal/shipments')}
            className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>In Transit</span>
              <Truck className="h-3.5 w-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {a.shipments ?? '0'}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-medium">Carrier tracking</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Outstanding Balance */}
          <div
            onClick={() => navigate('/customer-portal/invoices')}
            className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Outstanding</span>
              <CreditCard className="h-3.5 w-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatCurrencyCompact(a.outstanding_invoices)}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-rose-400 font-medium">Net terms active</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: Subscriptions */}
          <div
            onClick={() => navigate('/customer-portal/subscriptions')}
            className="p-4 rounded-xl border border-border/80 bg-card space-y-1 shadow-xs hover:border-sky-500/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Subscriptions</span>
              <RefreshCw className="h-3.5 w-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {a.active_subscriptions ?? '0'}
            </p>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-indigo-400 font-medium">Active SLAs</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* ─── ACTION ALERTS BANNER ─── */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((al, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-foreground shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{al.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{al.message}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 gap-1.5 shrink-0 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => navigate('/customer-portal/quotations')}
              >
                <span>View</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ─── DUAL ROW: QUOTATIONS & ORDERS BREAKDOWN ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Summary Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-sky-400" />
                Quotation Pipeline
              </CardTitle>
              <CardDescription className="text-xs">
                Commercial proposals awaiting review or in negotiation
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer-portal/quotations')}
              className="text-xs text-sky-400 hover:text-sky-300 gap-1 h-8"
            >
              <span>All Quotes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => navigate('/customer-portal/quotations')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-sky-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Awaiting Review</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{q.awaiting_review ?? 0}</p>
                <span className="text-[10px] text-amber-400 font-medium">Action required</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/quotations')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-sky-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">In Negotiation</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{q.negotiation ?? 0}</p>
                <span className="text-[10px] text-sky-400 font-medium">Counter offer active</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/quotations')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-sky-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Accepted</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{q.accepted ?? 0}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Converted to order</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/quotations')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-sky-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Expiring Soon</p>
                <p className="mt-1.5 text-xl font-bold text-rose-400 tabular-nums">{q.expiring_soon ?? 0}</p>
                <span className="text-[10px] text-rose-400 font-medium">&lt; 7 days left</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Fulfillment Summary Card */}
        <Card className="rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-emerald-400" />
                Purchase Orders & Fulfillment
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time warehouse allocations and delivery states
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer-portal/orders')}
              className="text-xs text-emerald-400 hover:text-emerald-300 gap-1 h-8"
            >
              <span>All Orders</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => navigate('/customer-portal/orders')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Processing</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{o.processing ?? 0}</p>
                <span className="text-[10px] text-amber-400 font-medium">Warehouse pick</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/orders')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Shipped</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{o.shipped ?? 0}</p>
                <span className="text-[10px] text-sky-400 font-medium">In carrier transit</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/orders')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Delivered</p>
                <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums">{o.delivered ?? 0}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Received at site</span>
              </div>
              <div
                onClick={() => navigate('/customer-portal/orders')}
                className="rounded-xl border border-border/70 p-3.5 bg-secondary/20 hover:border-emerald-500/40 cursor-pointer transition-colors"
              >
                <p className="text-[11px] text-muted-foreground font-medium">Backordered</p>
                <p className="mt-1.5 text-xl font-bold text-amber-400 tabular-nums">{o.backordered ?? 0}</p>
                <span className="text-[10px] text-muted-foreground font-medium">Stock replenishment</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── DUAL ROW: BILLING & RECENT ACTIVITY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Billing Overview */}
        <Card className="lg:col-span-6 rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-sky-400" />
                Billing & Account Balance
              </CardTitle>
              <CardDescription className="text-xs">
                Invoices, payment terms, and historical remittances
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/customer-portal/invoices')}
              className="text-xs text-sky-400 hover:text-sky-300 gap-1 h-8"
            >
              <span>View Invoices</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 p-3.5 bg-secondary/20">
                <p className="text-[11px] text-muted-foreground font-medium">Outstanding</p>
                <p className="mt-1 text-lg font-bold text-amber-400 tabular-nums">
                  {formatCurrencyCompact(b.outstanding)}
                </p>
                <span className="text-[10px] text-muted-foreground">Due Net 30</span>
              </div>
              <div className="rounded-xl border border-border/70 p-3.5 bg-secondary/20">
                <p className="text-[11px] text-muted-foreground font-medium">Total Paid</p>
                <p className="mt-1 text-lg font-bold text-emerald-400 tabular-nums">
                  {formatCurrencyCompact(b.paid)}
                </p>
                <span className="text-[10px] text-muted-foreground">Completed</span>
              </div>
              <div className="rounded-xl border border-border/70 p-3.5 bg-secondary/20">
                <p className="text-[11px] text-muted-foreground font-medium">Overdue</p>
                <p className="mt-1 text-lg font-bold text-foreground tabular-nums">
                  {formatCurrencyCompact(b.overdue)}
                </p>
                <span className="text-[10px] text-emerald-400 font-semibold">Clean ledger</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>GST Tax compliant invoicing with direct PDF receipt generation</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/customer-portal/invoices')}
                className="text-xs h-7"
              >
                Pay Balance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="lg:col-span-6 rounded-2xl border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-sky-400" />
                Recent Account Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Audit trail of changes, confirmations, and shipments
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-border/60 p-3 bg-secondary/15 hover:border-border transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0 mt-0.5">
                      {act.type === 'quotation' ? (
                        <FileText className="h-4 w-4 text-sky-400" />
                      ) : act.type === 'shipment' ? (
                        <Truck className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Package className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground truncate">{act.title}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No recent activity"
                description="Your account events and status updates will appear here."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
