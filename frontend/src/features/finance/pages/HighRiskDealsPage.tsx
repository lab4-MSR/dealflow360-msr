import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { AlertTriangle, RefreshCw, Search, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KpiCard } from "@/components/ui/kpi-card"
import { RiskBadge, CurrencyValue } from "../components/FinanceBadges"
import { getHighRiskDeals, getRiskKpis } from "../services/finance.service"

export function HighRiskDealsPage() {
  const [loading, setLoading] = useState(true)
  const [deals, setDeals] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { loadDeals() }, [])
  async function loadDeals() {
    setLoading(true)
    try {
      const [data, kpiData] = await Promise.all([getHighRiskDeals(), getRiskKpis()])
      setDeals(data.data || [])
      setKpis(kpiData)
    } catch (error) { console.error("Failed to load high risk deals:", error) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">High Risk Deals</h1><p className="text-sm text-muted-foreground mt-1">Deals requiring financial review</p></div>
        <Button variant="outline" size="sm" onClick={loadDeals}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Critical" value={kpis.critical || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="High" value={kpis.high || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard label="Medium" value={kpis.medium || 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
          <KpiCard label="Pending" value={kpis.pending || 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
          <KpiCard label="SLA Breached" value={kpis.sla_breached || 0} variant="danger" icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" /><p>No high risk deals</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border"><tr><th className="px-4 py-2.5 font-semibold">Deal</th><th className="px-4 py-2.5 font-semibold">Customer</th><th className="px-4 py-2.5 font-semibold text-right">Value</th><th className="px-4 py-2.5 font-semibold">Risk Score</th><th className="px-4 py-2.5 font-semibold">Risk Level</th><th className="px-4 py-2.5 font-semibold text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{deal.deal_name}<span className="block text-caption text-muted-foreground font-mono">{deal.quote_number}</span></td>
                      <td className="px-4 py-3">{deal.customer?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold"><CurrencyValue value={deal.deal_value} /></td>
                      <td className="px-4 py-3 font-semibold">{deal.risk_score}</td>
                      <td className="px-4 py-3"><RiskBadge level={deal.risk_level} /></td>
                      <td className="px-4 py-3 text-right"><Button asChild size="sm" variant="ghost" className="h-7 text-xs"><Link to={`/finance/reviews/${deal.quotation_id}`}>Review</Link></Button></td>
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
