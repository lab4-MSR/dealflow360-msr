import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, FileText, RefreshCw, ArrowRight, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { KpiCard } from "@/components/ui/kpi-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InvoiceStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getFinanceDashboard } from "../services/finance.service"

export function FinanceDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<any>(null)
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => { loadDashboard() }, [])
  async function loadDashboard() {
    setLoading(true)
    try {
      const data = await getFinanceDashboard()
      setKpis(data.kpis)
      setRecentInvoices(data.recent_invoices || [])
      setAlerts(data.alerts || [])
    } catch (error) { console.error("Failed to load finance dashboard:", error) }
    finally { setLoading(false) }
  }

  if (loading || !kpis) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance Command Center"
        description="Financial operations overview, revenue intelligence, and high-risk deal reviews"
        breadcrumbs={[
          { label: 'Finance', href: '/finance' },
          { label: 'Dashboard' },
        ]}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Finance
          </span>
        }
        actions={
          <Button variant="outline" size="sm" onClick={loadDashboard} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Revenue" value={`₹${(kpis.total_revenue || 0).toLocaleString("en-IN")}`} icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="Recurring Revenue" value={`₹${(kpis.recurring_revenue || 0).toLocaleString("en-IN")}`} variant="success" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard label="Outstanding" value={`₹${(kpis.outstanding_amount || 0).toLocaleString("en-IN")}`} variant="warning" icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Collected" value={`₹${(kpis.collected_amount || 0).toLocaleString("en-IN")}`} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard label="Overdue" value={`₹${(kpis.overdue_amount || 0).toLocaleString("en-IN")}`} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="One-Time" value={`₹${(kpis.one_time_revenue || 0).toLocaleString("en-IN")}`} variant="info" icon={<FileText className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/finance/risk/high" className="block"><KpiCard label="High Risk Deals" value={kpis.high_risk_deals || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} /></Link>
        <KpiCard label="Pending Review" value={kpis.pending_financial_review || 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Approved" value={kpis.approved_count || 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard label="Rejected" value={kpis.rejected_count || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
        <KpiCard label="SLA Breached" value={kpis.sla_breached || 0} variant="danger" icon={<AlertCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/finance/invoices" className="block"><KpiCard label="Total Invoices" value={kpis.total_invoices || 0} icon={<FileText className="h-5 w-5" />} /></Link>
        <KpiCard label="Paid" value={kpis.paid_invoices || 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
        <KpiCard label="Pending" value={kpis.pending_invoices || 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Overdue" value={kpis.overdue_invoices || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
        <KpiCard label="Failed" value={kpis.failed_invoices || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/finance/subscriptions" className="block"><KpiCard label="Active Subscriptions" value={kpis.active_subscriptions || 0} variant="success" icon={<TrendingUp className="h-5 w-5" />} /></Link>
        <KpiCard label="MRR" value={`₹${(kpis.mrr || 0).toLocaleString("en-IN")}`} variant="info" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="ARR" value={`₹${(kpis.arr || 0).toLocaleString("en-IN")}`} variant="info" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="Renewals" value={kpis.renewals || 0} icon={<RefreshCw className="h-5 w-5" />} />
        <KpiCard label="Cancellations" value={kpis.cancellations || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Recent Invoices</CardTitle><CardDescription>Latest billing activity</CardDescription></div>
          <Button asChild variant="ghost" size="sm"><Link to="/finance/invoices">View All <ArrowRight className="h-4 w-4 ml-1" /></Link></Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No recent invoices</p></div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Invoice</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Due Date</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border">
                {recentInvoices.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-medium">{inv.invoice_number}</td>
                    <td className="px-4 py-3">{inv.customer?.name}</td>
                    <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={inv.amount} /></td>
                    <td className="px-4 py-3">{new Date(inv.due_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                    <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3 text-right"><Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to={`/finance/invoices/${inv.id}`}>View</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert: any) => (
            <Card key={alert.id} className={`border-l-4 ${alert.severity === "critical" ? "border-l-danger" : alert.severity === "medium" ? "border-l-warning" : "border-l-info"}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className={`h-5 w-5 mt-0.5 ${alert.severity === "critical" ? "text-danger" : alert.severity === "medium" ? "text-warning" : "text-info"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-small">{alert.title}</p>
                    <p className="text-caption text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
                    <Badge variant="outline" className="mt-2 text-caption">{alert.type?.replace("_", " ")}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
