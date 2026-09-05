import { useState, useEffect } from "react"
import { RefreshCw, Search, DollarSign, CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KpiCard } from "@/components/ui/kpi-card"
import { PaymentStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getPayments, getPaymentKpis } from "../services/finance.service"

export function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadData() }, [])
  async function loadData() {
    setLoading(true)
    try {
      const [data, kpiData] = await Promise.all([getPayments(), getPaymentKpis()])
      setPayments(data.data || [])
      setKpis(kpiData)
    } catch (error) { console.error("Failed to load payments:", error) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Payments</h1><p className="text-sm text-muted-foreground mt-1">Track all payment transactions</p></div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Total Collected" value={`₹${(kpis.total_collected || 0).toLocaleString("en-IN")}`} variant="success" icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Successful" value={kpis.successful || 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard label="Pending" value={kpis.pending || 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
          <KpiCard label="Failed" value={kpis.failed || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
          <KpiCard label="Refunded" value={kpis.refunded || 0} variant="info" icon={<RotateCcw className="h-5 w-5" />} />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No payments found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Transaction</th><th className="px-4 py-2.5 font-semibold">Invoice</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Method</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold">Date</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono font-medium">{pay.transaction_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-mono">{pay.invoice?.invoice_number}</td>
                      <td className="px-4 py-3">{pay.customer?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={pay.amount} /></td>
                      <td className="px-4 py-3 capitalize">{pay.method}</td>
                      <td className="px-4 py-3"><PaymentStatusBadge status={pay.status} /></td>
                      <td className="px-4 py-3">{new Date(pay.timestamp).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
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
