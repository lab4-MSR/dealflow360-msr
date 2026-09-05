import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { RefreshCw, Search, Wrench, TrendingUp, DollarSign, RefreshCcw, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KpiCard } from "@/components/ui/kpi-card"
import { SubscriptionStatusBadge, CurrencyValue } from "../components/FinanceBadges"
import { getSubscriptions, getSubscriptionKpis } from "../services/finance.service"

export function SubscriptionsPage() {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadData() }, [])
  async function loadData() {
    setLoading(true)
    try {
      const [data, kpiData] = await Promise.all([getSubscriptions(), getSubscriptionKpis()])
      setSubscriptions(data.data || [])
      setKpis(kpiData)
    } catch (error) { console.error("Failed to load subscriptions:", error) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1><p className="text-sm text-muted-foreground mt-1">Manage recurring billing</p></div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Active" value={kpis.active || 0} variant="success" icon={<Wrench className="h-5 w-5" />} />
          <KpiCard label="Trial" value={kpis.trialing || 0} variant="info" icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard label="Past Due" value={kpis.past_due || 0} variant="warning" icon={<RefreshCcw className="h-5 w-5" />} />
          <KpiCard label="MRR" value={`?${(kpis.mrr || 0).toLocaleString("en-IN")}`} variant="info" icon={<DollarSign className="h-5 w-5" />} />
          <KpiCard label="Cancelled" value={kpis.cancelled || 0} variant="danger" icon={<XCircle className="h-5 w-5" />} />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search subscriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No subscriptions found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Subscription</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold">Plan</th><th className="px-4 py-2.5 font-semibold text-right">Amount</th><th className="px-4 py-2.5 font-semibold">Billing</th><th className="px-4 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{sub.subscription_name || sub.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">{sub.customer?.name}</td>
                      <td className="px-4 py-3">{sub.plan?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={sub.amount} /></td>
                      <td className="px-4 py-3 capitalize">{sub.billing_cycle?.replace("_", " ")}</td>
                      <td className="px-4 py-3"><SubscriptionStatusBadge status={sub.status} /></td>
                      <td className="px-4 py-3 text-right"><Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to={`/finance/subscriptions/${sub.id}`}>View</Link></Button></td>
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
