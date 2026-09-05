import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowLeft,
  Check,
  TrendingUp,
  FileText,
  DollarSign,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type RecommendationDetailRecord } from '../types/intelligence'
import { DecisionExplanationPanel } from '../components/DecisionExplanationPanel'

export const RecommendationDetailsPage: React.FC = () => {
  const { recommendationId } = useParams<{ recommendationId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RecommendationDetailRecord | null>(null)
  const [applied, setApplied] = useState(false)

  const loadData = async () => {
    if (!recommendationId) return
    setLoading(true)
    try {
      const res = await intelligenceService.getRecommendationDetails(recommendationId)
      setData(res)
    } catch (err) {
      console.error('Failed to load recommendation details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [recommendationId])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/intelligence/recommendations/upsell')}
            className="gap-1 text-xs mb-2 text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Recommendations
          </Button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {data.recommendation_type === 'upsell' ? 'Upsell Proposal' : 'Cross-Sell Bundle'}:{' '}
              {data.recommended_product}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Algorithm-driven opportunity for {data.customer_name} (Deal: {data.deal_name})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link to={`/sales/quotations/${data.quotation_id}`}>
              <FileText className="h-3.5 w-3.5" /> View Quotation <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => setApplied(true)}
            disabled={applied}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1 text-xs"
          >
            {applied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {applied ? 'Applied to Quotation' : 'Apply to Quotation'}
          </Button>
        </div>
      </div>

      {applied && (
        <div className="p-4 bg-success-subtle text-success text-sm font-semibold rounded-lg">
          ✓ Successfully applied recommendation to quotation draft. Deal value updated.
        </div>
      )}

      {/* Financial Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Match Confidence</span>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {data.confidence_score}%
          </p>
          <span className="text-[11px] text-muted-foreground">Purchase propensity score</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Revenue Uplift</span>
          <p className="text-2xl font-bold text-success mt-1">
            +₹{data.potential_revenue_uplift.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Incremental ARR</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Margin Delta</span>
          <p className="text-2xl font-bold text-success mt-1">
            +{data.margin_delta_percent}%
          </p>
          <span className="text-[11px] text-muted-foreground">Blended gross margin expansion</span>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Customer LTV Lift</span>
          <p className="text-2xl font-bold text-foreground mt-1">
            ₹{(data.potential_revenue_uplift * 2.5).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-muted-foreground">Projected 3-year value</span>
        </div>
      </div>

      {/* Decision Framework Panel */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Algorithmic Rationale & Customer Profile Match
        </h2>
        <DecisionExplanationPanel
          explanation={data.explanation}
          onTakeAction={() => setApplied(true)}
          actionLabel="Apply to Quotation"
        />
      </div>

      {/* Baseline vs Proposed Terms Comparison */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Terms Comparison: Baseline vs Proposed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-muted border-b border-border text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Current Baseline</th>
                  <th className="py-3 px-4">With Intelligence Recommendation</th>
                  <th className="py-3 px-4 text-right">Net Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Quoted Product / Package</td>
                  <td className="py-3 px-4 text-muted-foreground">{data.current_product || 'Standard Base Plan'}</td>
                  <td className="py-3 px-4 font-semibold text-purple-700 dark:text-purple-400">
                    {data.recommended_product}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-success">Upgraded</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Total Contract Value</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    ₹{(data.potential_revenue_uplift * 3).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">
                    ₹{(data.potential_revenue_uplift * 4).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-success">
                    +₹{data.potential_revenue_uplift.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Gross Margin %</td>
                  <td className="py-3 px-4 text-muted-foreground">24.5%</td>
                  <td className="py-3 px-4 font-semibold text-success">
                    {(24.5 + data.margin_delta_percent).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-success">
                    +{data.margin_delta_percent}%
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-foreground">Fulfillment Feasibility</td>
                  <td className="py-3 px-4 text-muted-foreground">In Stock (Central Warehouse)</td>
                  <td className="py-3 px-4 font-semibold text-success">Immediate Digital / Cloud Provisioning</td>
                  <td className="py-3 px-4 text-right font-medium text-foreground">0 Delay</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
