import { useState, useEffect } from "react"
import { RefreshCw, Search, XCircle, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KpiCard } from "@/components/ui/kpi-card"
import { CurrencyValue } from "../components/FinanceBadges"
import { getFailedPayments, getFailedPaymentKpis, retryPayment } from "../services/finance.service"

export function FailedPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [retrying, setRetrying] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])
  async function loadData() {
    setLoading(true)
    try {
      const [data, kpiData] = await Promise.all([getFailedPayments(), getFailedPaymentKpis()])
      setPayments(data.data || [])
      setKpis(kpiData)
    } catch (error) { console.error("Failed to load failed payments:", error) }
    finally { setLoading(false) }
  }

  async function handleRetry(id: string) {
    setRetrying(id)
    try {
      await retryPayment(id)
      await loadData()
    } catch (error) { console.error("Failed to retry payment:", error) }
    finally { setRetrying(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Failed Payments</h1><p className="text-sm text-muted-foreground mt-1">Payment failures requiring attention</p></div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total Failed" value={kpis.total_failed || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
          <KpiCard label="Retry Pending" value={kpis.retry_pending || 0} variant="warning" icon={<RotateCcw className="h-5 w-5" />} />
          <KpiCard label="Retry Successful" value={kpis.retry_successful || 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard label="Critical" value={kpis.critical_failures || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No failed payments</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold">Invoice</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Failure Reason</th><th className="px-4 py-2.5 font-semibold">Failed At</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{pay.customer?.name}</td>
                      <td className="px-4 py-3 font-mono">{pay.invoice?.invoice_number}</td>
                      <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={pay.amount} /></td>
                      <td className="px-4 py-3 text-danger">{pay.failure_reason}</td>
                      <td className="px-4 py-3">{new Date(pay.failed_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium ${pay.retry_status === "success" ? "bg-success-subtle text-success" : pay.retry_status === "pending" ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"}`}>{pay.retry_status}</span></td>
                      <td className="px-4 py-3 text-right">
                        {pay.can_retry && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleRetry(pay.id)} disabled={retrying === pay.id}><RotateCcw className="h-3 w-3 mr-1" />{retrying === pay.id ? "Retrying..." : "Retry"}</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
