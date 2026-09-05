import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  HeartPulse,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { intelligenceService } from '../services/intelligence.service'
import { type DealHealthOverviewData } from '../types/intelligence'
import { DealHealthScoreCard } from '../components/DealHealthScoreCard'

export const DealHealthOverviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DealHealthOverviewData | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await intelligenceService.getDealHealthOverview()
      setData(res)
    } catch (err) {
      console.error('Failed to load deal health overview', err)
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
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
              <HeartPulse className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Deal Health Command</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Multidimensional vitality tracking assessing activity cadence, buyer engagement, discount compliance, and fulfillment readiness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/intelligence/health/stalled')}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1 text-xs"
          >
            Stalled Deals Queue ({data.stalled_deals})
          </Button>
        </div>
      </div>

      {/* 6-Dimension Health Engine Card */}
      <DealHealthScoreCard healthData={data} />

      {/* Additional Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Avg Days in Pipeline</span>
            <p className="text-2xl font-bold text-foreground mt-1">18.4 Days</p>
            <span className="text-[11px] text-success">Within healthy 30-day velocity target</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Buyer Proposal Engagement</span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">82% Opened</p>
            <span className="text-[11px] text-muted-foreground">Avg 4.2 customer review sessions</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <span className="text-xs text-muted-foreground">Approval Cycle Time</span>
            <p className="text-2xl font-bold text-foreground mt-1">4.2 Hours</p>
            <span className="text-[11px] text-success">Fast-track automated approval path</span>
          </CardContent>
        </Card>
      </div>

      {/* Stalled Pipeline Callout */}
      <div className="p-5 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {data.stalled_deals} Deals Currently Stalled Beyond SLA
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Pipeline value of ₹{data.critical_pipeline_value.toLocaleString('en-IN')} has had 0 rep or buyer activity for over 14 days.
          </p>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1 shrink-0" asChild>
          <Link to="/intelligence/health/stalled">
            View Stalled Deals <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
