import { useState, useEffect } from "react"
import { RefreshCw, TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/ui/kpi-card"
import { TrendIndicator } from "../components/FinanceDisplay"
import { getRevenueAnalytics } from "../services/finance.service"

export function RevenueAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => { loadData() }, [])
  async function loadData() {
    setLoading(true)
    try {
      const result = await getRevenueAnalytics()
      setData(result)
    } catch (error) { console.error("Failed to load revenue analytics:", error) }
    finally { setLoading(false) }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}</div>
      </div>
    )
  }

  const kpis = data.kpis || {}
  const breakdown = data.revenue_breakdown || {}
  const collection = data.collection_analytics || {}
  const insights = data.insights || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div><h1 className="text-2xl font-bold tracking-tight">Revenue Analytics</h1><p className="text-sm text-muted-foreground mt-1">Financial performance and trends</p></div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Revenue" value={`?${(kpis.total_revenue || 0).toLocaleString("en-IN")}`} icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="One-Time" value={`?${(kpis.one_time_revenue || 0).toLocaleString("en-IN")}`} variant="info" icon={<BarChart3 className="h-5 w-5" />} />
        <KpiCard label="Recurring" value={`?${(kpis.recurring_revenue || 0).toLocaleString("en-IN")}`} variant="success" icon={<TrendingUp className="h-5 w-5" />} />
        <KpiCard label="MRR" value={`?${(kpis.mrr || 0).toLocaleString("en-IN")}`} variant="info" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="ARR" value={`?${(kpis.arr || 0).toLocaleString("en-IN")}`} variant="info" icon={<DollarSign className="h-5 w-5" />} />
        <KpiCard label="Growth" value={`${(kpis.revenue_growth || 0).toFixed(1)}%`} variant={kpis.revenue_growth >= 0 ? "success" : "danger"} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue Breakdown</CardTitle><CardDescription>By revenue type</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">One-Time Revenue</span><span className="font-semibold">?{(breakdown.one_time || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Subscription Revenue</span><span className="font-semibold">?{(breakdown.subscription || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Product Revenue</span><span className="font-semibold">?{(breakdown.product || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Service Revenue</span><span className="font-semibold">?{(breakdown.service || 0).toLocaleString("en-IN")}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Collection Analytics</CardTitle><CardDescription>Payment collection metrics</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Collection Rate</span><span className="font-semibold text-success">{collection.collection_rate || 0}%</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Outstanding</span><span className="font-semibold">?{(collection.outstanding || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Overdue</span><span className="font-semibold text-danger">?{(collection.overdue || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Failed Payments</span><span className="font-semibold text-danger">{collection.failed_payments || 0}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="text-h3 font-semibold mb-4">Financial Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight: any) => (
              <Card key={insight.id} className={`border-l-4 ${insight.severity === "critical" ? "border-l-danger" : insight.severity === "high" ? "border-l-danger" : insight.severity === "medium" ? "border-l-warning" : "border-l-info"}`}>
                <CardContent className="p-4">
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-caption text-muted-foreground mt-1">{insight.description}</p>
                  <div className="mt-3 text-caption"><span className="text-muted-foreground">Next Action: </span><span>{insight.next_action}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
