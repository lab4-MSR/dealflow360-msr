import { useState, useEffect } from "react"
import { RefreshCw, Search, FileText, CheckCircle, CreditCard, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { CurrencyValue } from "../components/FinanceBadges"
import { getFinanceAudit, getAuditOverview } from "../services/finance.service"

export function FinanceAuditPage() {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [overview, setOverview] = useState<any>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadData() }, [])
  async function loadData() {
    setLoading(true)
    try {
      const [eventData, overviewData] = await Promise.all([getFinanceAudit(), getAuditOverview()])
      setEvents(eventData.data || [])
      setOverview(overviewData)
    } catch (error) { console.error("Failed to load audit data:", error) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Finance Audit</h1><p className="text-sm text-muted-foreground mt-1">Financial event traceability</p></div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Total Events" value={overview.total_events || 0} icon={<FileText className="h-5 w-5" />} />
          <KpiCard label="Financial Changes" value={overview.financial_changes || 0} icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Approval Decisions" value={overview.approval_decisions || 0} icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard label="Billing Events" value={overview.billing_events || 0} icon={<CreditCard className="h-5 w-5" />} />
          <KpiCard label="Payment Events" value={overview.payment_events || 0} icon={<DollarSign className="h-5 w-5" />} />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search audit events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No audit events found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Timestamp</th><th className="px-4 py-2.5 font-semibold">User</th><th className="px-4 py-2.5 font-semibold">Action</th><th className="px-4 py-2.5 font-semibold">Resource</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Module</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-caption">{new Date(event.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-4 py-3">{event.actor?.name}</td>
                      <td className="px-4 py-3 capitalize">{event.action}</td>
                      <td className="px-4 py-3">{event.resource_name || event.resource_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-right">{event.amount ? <CurrencyValue value={event.amount} /> : "-"}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{event.module}</Badge></td>
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
