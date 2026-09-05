import { useQuery } from '@tanstack/react-query'
import { FileText, Package, Truck, CreditCard, RefreshCw, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { getCustomerDashboard } from '@/lib/customer-portal-api'
import { formatCurrencyCompact } from '@/lib/analytics-format'

export function CustomerDashboardPage() {
  const { data, isLoading, error: _error } = useQuery({ queryKey: ['customer-dashboard'], queryFn: getCustomerDashboard })
  const s = data ?? {}
  const a = s.account_summary ?? {}
  const q = s.quotation_summary ?? {}
  const o = s.order_summary ?? {}
  const b = s.billing_summary ?? {}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Here is what is happening with your account today.</p>
      </div>
      {isLoading ? <Skeleton className="h-[124px] w-full rounded-lg" /> : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="Open Quotations" value={a.open_quotations ?? '—'} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Active Orders" value={a.active_orders ?? '—'} icon={<Package className="h-5 w-5" />} />
          <KpiCard label="Shipments" value={a.shipments ?? '—'} icon={<Truck className="h-5 w-5" />} />
          <KpiCard label="Outstanding" value={formatCurrencyCompact(a.outstanding_invoices)} icon={<CreditCard className="h-5 w-5" />} />
          <KpiCard label="Active Subscriptions" value={a.active_subscriptions ?? '—'} icon={<RefreshCw className="h-5 w-5" />} />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base font-semibold">Quotation Summary</CardTitle><CardDescription>Status of your quotations.</CardDescription></CardHeader><CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Awaiting Review</p><p className="mt-1 text-lg font-semibold tabular-nums">{q.awaiting_review ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Negotiation</p><p className="mt-1 text-lg font-semibold tabular-nums">{q.negotiation ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Accepted</p><p className="mt-1 text-lg font-semibold tabular-nums">{q.accepted ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Expiring Soon</p><p className="mt-1 text-lg font-semibold tabular-nums">{q.expiring_soon ?? '—'}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base font-semibold">Order Summary</CardTitle><CardDescription>Your order statuses.</CardDescription></CardHeader><CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Processing</p><p className="mt-1 text-lg font-semibold tabular-nums">{o.processing ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Shipped</p><p className="mt-1 text-lg font-semibold tabular-nums">{o.shipped ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Delivered</p><p className="mt-1 text-lg font-semibold tabular-nums">{o.delivered ?? '—'}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Backordered</p><p className="mt-1 text-lg font-semibold tabular-nums">{o.backordered ?? '—'}</p></div>
          </div>
        </CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base font-semibold">Billing Summary</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrencyCompact(b.outstanding)}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Paid</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrencyCompact(b.paid)}</p></div>
            <div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatCurrencyCompact(b.overdue)}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base font-semibold">Alerts</CardTitle></CardHeader><CardContent>
          {(s.alerts ?? []).length > 0 ? <div className="space-y-3">{(s.alerts ?? []).map((al, i) => (<div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3"><AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" /><div><p className="text-sm font-medium">{al.title}</p><p className="text-xs text-muted-foreground">{al.message}</p></div></div>))}</div> : <EmptyState title="You are all caught up" description="No alerts at this time." />}
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-base font-semibold">Recent Activity</CardTitle></CardHeader><CardContent>
        {(s.recent_activity ?? []).length > 0 ? <div className="space-y-3">{(s.recent_activity ?? []).map((act, i) => (<div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3"><Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /><div><p className="text-sm font-medium">{act.title}</p><p className="text-xs text-muted-foreground">{act.description}</p></div></div>))}</div> : <EmptyState title="No recent activity" description="Your account activity will appear here." />}
      </CardContent></Card>
    </div>
  )
}
