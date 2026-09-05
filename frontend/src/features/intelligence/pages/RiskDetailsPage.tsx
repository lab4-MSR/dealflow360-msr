import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  FileText,
  AlertOctagon,
  TrendingDown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type RiskDetailRecord } from '../types/intelligence'
import { RiskScoreCard } from '../components/RiskScoreCard'
import { DecisionExplanationPanel } from '../components/DecisionExplanationPanel'

export const RiskDetailsPage: React.FC = () => {
  const { riskId } = useParams<{ riskId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<RiskDetailRecord | null>(null)
  const [actionDone, setActionDone] = useState<string | null>(null)

  const loadData = async () => {
    if (!riskId) return
    setLoading(true)
    try {
      const res = await intelligenceService.getRiskDetails(riskId)
      setData(res)
    } catch (err) {
      console.error('Failed to load risk details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [riskId])

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
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
            onClick={() => navigate('/intelligence/risks/high')}
            className="gap-1 text-xs mb-2 text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to High Risk Deals
          </Button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Risk Assessment: {data.quotation_id}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Deep dive evaluation of risk vectors, financial exposure, and automated mitigation paths.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link to={`/sales/quotations/${data.quotation_id}`}>
              <FileText className="h-3.5 w-3.5" /> View Quotation <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Risk Score & Factors */}
      <RiskScoreCard riskData={data} />

      {/* Decision Framework Panel */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Algorithmic Decision Support
        </h2>
        <DecisionExplanationPanel
          explanation={data.explanation}
          onTakeAction={() => setActionDone('Executed recommended mitigation strategy.')}
          actionLabel="Execute Recommended Mitigation"
        />
      </div>

      {/* Mitigations List */}
      <Card>
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Recommended Risk Mitigations</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {data.mitigation_actions.map((act, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-surface hover:bg-surface-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="text-xs font-medium text-foreground">{act}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8 ml-2 shrink-0"
                onClick={() => setActionDone(`Action '${act}' dispatched to workflow.`)}
              >
                Apply
              </Button>
            </div>
          ))}
          {actionDone && (
            <div className="p-3 bg-success-subtle text-success text-xs font-semibold rounded-lg mt-2">
              ✓ {actionDone}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
