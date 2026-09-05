import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/ui/risk-badge'
import { getDealHealthData } from '@/services/salesManager'
import type { DealHealthOverview } from '@/types/salesManager'
import { toast } from 'sonner'

export function DealHealthManagerPage() {
  const [data, setData] = useState<DealHealthOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDealHealthData()
      .then((res) => setData(res))
      .catch((err) => toast.error('Failed to load health: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-h2 font-semibold text-foreground">Deal Health Command Center</h1>
        <p className="text-body-small text-muted-foreground">
          Identify stalled stages, discount leakage, and deals requiring immediate management intervention.
        </p>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-success/30 bg-success-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-caption uppercase font-semibold text-success">Healthy Deals</span>
              <p className="text-h2 font-bold tabular-nums text-success">{data.healthy_count}</p>
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-caption uppercase font-semibold text-warning">At-Risk Deals</span>
              <p className="text-h2 font-bold tabular-nums text-warning">{data.at_risk_count}</p>
            </CardContent>
          </Card>

          <Card className="border-danger/30 bg-danger-subtle/20">
            <CardContent className="p-5 space-y-1">
              <span className="text-caption uppercase font-semibold text-danger">Stalled Deals</span>
              <p className="text-h2 font-bold tabular-nums text-danger">{data.stalled_count}</p>
            </CardContent>
          </Card>

          <Card className="border-danger/50 bg-danger-subtle/30">
            <CardContent className="p-5 space-y-1">
              <span className="text-caption uppercase font-semibold text-danger">Critical Attention</span>
              <p className="text-h2 font-bold tabular-nums text-danger">{data.critical_count}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flagged Deals List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body font-semibold">Flagged Deals Requiring Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-border text-caption text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Deal</th>
                  <th className="pb-3 font-medium">Rep</th>
                  <th className="pb-3 text-right font-medium">Value</th>
                  <th className="pb-3 font-medium">Health Status</th>
                  <th className="pb-3 font-medium">Detected Risk Drivers</th>
                  <th className="pb-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading deal health...
                    </td>
                  </tr>
                ) : (
                  data?.flagged_deals.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        <Link to={`/sales-manager/deals/${item.id}`} className="hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <span className="text-caption text-muted-foreground block">{item.customer_name}</span>
                      </td>
                      <td className="py-3 text-muted-foreground">{item.rep_name}</td>
                      <td className="py-3 text-right tabular-nums font-semibold">
                        ₹{Number(item.value).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={item.status === 'critical' ? 'danger' : 'warning'}
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="space-y-0.5">
                          {item.reasons.map((r, i) => (
                            <span key={i} className="text-caption text-danger block">
                              • {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/sales-manager/deals/${item.id}`}>
                            Intervene <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
