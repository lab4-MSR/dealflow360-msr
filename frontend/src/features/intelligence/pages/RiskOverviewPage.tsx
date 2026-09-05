import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RiskBadge } from '@/components/ui/risk-badge'
import { intelligenceService } from '../services/intelligence.service'
import { type RiskOverviewData } from '../types/intelligence'

export const RiskOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RiskOverviewData | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getRiskOverview()
      setData(res)
    } catch (err) {
      console.error('Failed to load risk overview', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Risk Engine Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Algorithmic blended risk scoring across margins, discount ceilings, credit ratings, warehouse capacity, and cancellation probability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/intelligence/risks/high')}
            className="bg-rose-600 hover:bg-rose-700 text-white gap-1 text-xs"
          >
            High-Risk Deals Queue ({data.high_risk_deals})
          </Button>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Total Assessed Deals</span>
            <p className="text-2xl font-bold text-foreground mt-1">{data.total_deals_assessed}</p>
            <span className="text-[11px] text-muted-foreground">100% evaluated</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Avg Blended Score</span>
            <p className="text-2xl font-bold text-foreground mt-1">{data.average_risk_score} / 100</p>
            <span className="text-[11px] text-success">Healthy portfolio baseline</span>
          </CardContent>
        </Card>
        <Card className="border-rose-200 dark:border-rose-900">
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">High Risk Deals</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">{data.high_risk_deals}</p>
            <span className="text-[11px] text-muted-foreground">Requires manager signoff</span>
          </CardContent>
        </Card>
        <Card className="border-rose-300 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/20">
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Critical Risk Deals</span>
            <p className="text-2xl font-bold text-danger mt-1">{data.critical_risk_deals}</p>
            <span className="text-[11px] text-danger font-medium">Immediate block active</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Margin at Risk</span>
            <p className="text-xl font-bold text-foreground mt-1">₹{data.margin_at_risk.toLocaleString('en-IN')}</p>
            <span className="text-[11px] text-rose-600 font-medium">Erosion risk</span>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution Buckets */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Portfolio Risk Distribution</CardTitle>
          <CardDescription>Breakdown of active pipeline by risk severity tier</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-success/30 bg-success-subtle/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-success uppercase">Low Risk</span>
                <Badge className="bg-success text-white text-[10px]">0 - 25</Badge>
              </div>
              <p className="text-2xl font-bold text-success mt-2">{data.distribution.low}</p>
              <p className="text-xs text-muted-foreground mt-1">Auto-approved velocity path</p>
            </div>

            <div className="p-4 rounded-xl border border-warning/30 bg-warning-subtle/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-warning uppercase">Medium Risk</span>
                <Badge className="bg-warning text-white text-[10px]">26 - 50</Badge>
              </div>
              <p className="text-2xl font-bold text-warning mt-2">{data.distribution.medium}</p>
              <p className="text-xs text-muted-foreground mt-1">Standard governance checks</p>
            </div>

            <div className="p-4 rounded-xl border border-danger/30 bg-danger-subtle/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-danger uppercase">High Risk</span>
                <Badge className="bg-danger text-white text-[10px]">51 - 75</Badge>
              </div>
              <p className="text-2xl font-bold text-danger mt-2">{data.distribution.high}</p>
              <p className="text-xs text-muted-foreground mt-1">Manager approval required</p>
            </div>

            <div className="p-4 rounded-xl border border-rose-600 bg-rose-100/50 dark:bg-rose-950/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">Critical Risk</span>
                <Badge className="bg-rose-700 text-white text-[10px]">76 - 100</Badge>
              </div>
              <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-2">{data.distribution.critical}</p>
              <p className="text-xs text-muted-foreground mt-1">Executive VP signoff required</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Risk Drivers Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Primary Risk Contributing Drivers</CardTitle>
            <CardDescription>Deals impacted by individual risk dimensions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {data.risk_factors.map((factor, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{factor.factor}</span>
                  <span className="font-bold text-foreground">
                    {factor.impacted_deals} deals · Avg {factor.average_impact}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(factor.impacted_deals / data.total_deals_assessed) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Panel */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Risk Engine Policies & Safeguards</CardTitle>
            <CardDescription>Active safeguards protecting tenant margins and delivery SLAs</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-3 text-xs text-muted-foreground">
            <div className="p-3 rounded-lg border border-border bg-surface-muted">
              <span className="font-semibold text-foreground block mb-1">Margin Floor Guard:</span>
              Quotes dipping below 15% gross margin automatically trigger level-2 finance escalation.
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface-muted">
              <span className="font-semibold text-foreground block mb-1">Credit Exposure Cap:</span>
              Customers with overdue invoices {'>'} 45 days cannot receive net-60 payment terms.
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface-muted">
              <span className="font-semibold text-foreground block mb-1">Split-Shipment Penalty:</span>
              Deals requiring 3+ warehouse splits incur delivery risk score markup of +20 points.
            </div>
          </CardContent>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Audit Log: 0 policy overrides today</span>
            <Link to="/intelligence/risks/high">
              <Button size="sm" className="bg-primary text-xs gap-1">
                View High-Risk Deals <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
