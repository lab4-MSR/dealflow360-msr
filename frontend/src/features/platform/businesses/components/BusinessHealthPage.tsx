import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import {
  useBusinessHealthScore,
  useBusinessActivityHealth,
  useBusinessPerformanceIndicators,
  useBusinessRiskIndicators,
  useBusinessHealthAlerts,
} from '../hooks/use-businesses'
import { format } from 'date-fns'
import {
  HeartPulse,
  Activity,
  TrendingUp,
  AlertTriangle,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HealthScore, HealthAlert } from '../types'

const statusLabel: Record<HealthScore['status'], string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  unavailable: 'Unavailable',
}

const statusVariant: Record<HealthScore['status'], 'success' | 'warning' | 'danger' | 'secondary'> = {
  healthy: 'success',
  degraded: 'warning',
  critical: 'danger',
  unavailable: 'secondary',
}

const scoreRingColor: Record<HealthScore['status'], string> = {
  healthy: 'stroke-success',
  degraded: 'stroke-warning',
  critical: 'stroke-danger',
  unavailable: 'stroke-muted-foreground',
}

const activityStatusLabel: Record<string, string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  critical: 'Critical',
  inactive: 'Inactive',
}

const activityStatusDot: Record<string, string> = {
  healthy: 'bg-success',
  degraded: 'bg-warning',
  critical: 'bg-danger',
  inactive: 'bg-muted-foreground',
}

function HealthScoreRing({ score, status }: { score: number; status: HealthScore['status'] }) {
  const radius = 70
  const strokeWidth = 10
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="currentColor"
          className="text-surface-muted"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="currentColor"
          className={cn('transition-all duration-700 ease-out', scoreRingColor[status])}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-h1 font-bold tabular-nums text-foreground">{score}</span>
        <span className="text-caption text-muted-foreground">out of 100</span>
      </div>
    </div>
  )
}

function ActivityCard({ label, value, status }: { label: string; value: number; status: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', activityStatusDot[status] || 'bg-muted-foreground')} />
      <div className="flex-1 min-w-0">
        <p className="text-caption text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                (activityStatusDot[status] || '').replace('bg-', 'bg-')
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <span className="text-small tabular-nums font-medium text-foreground">{value}%</span>
        </div>
        <p className="text-caption text-muted-foreground mt-1">
          {activityStatusLabel[status] || status}
        </p>
      </div>
    </div>
  )
}

function PerformanceMetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-caption text-muted-foreground">{label}</p>
          <p className="text-h4 font-semibold tabular-nums text-foreground mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}

function RiskCard({ icon: Icon, label, count, actionLabel, actionPath }: { icon: React.ElementType; label: string; count: number; actionLabel: string; actionPath: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-caption text-muted-foreground">{label}</p>
            <p className="text-h4 font-semibold tabular-nums text-foreground mt-0.5">{count}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-caption" asChild>
          <a href={actionPath}>{actionLabel}</a>
        </Button>
      </div>
    </div>
  )
}

const severityConfig: Record<HealthAlert['severity'], { variant: 'danger' | 'warning' | 'info'; icon: React.ElementType }> = {
  critical: { variant: 'danger', icon: AlertTriangle },
  warning: { variant: 'warning', icon: Shield },
  informational: { variant: 'info', icon: Activity },
}

function AlertItem({ alert }: { alert: HealthAlert }) {
  const config = severityConfig[alert.severity]
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn(
        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        alert.severity === 'critical' && 'bg-danger-subtle',
        alert.severity === 'warning' && 'bg-warning-subtle',
        alert.severity === 'informational' && 'bg-info-subtle',
      )}>
        <Icon className={cn(
          'h-3.5 w-3.5',
          alert.severity === 'critical' && 'text-danger',
          alert.severity === 'warning' && 'text-warning',
          alert.severity === 'informational' && 'text-info',
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-small font-medium text-foreground">{alert.title}</span>
          <Badge variant={config.variant} className="capitalize">{alert.severity}</Badge>
        </div>
        <p className="text-caption text-muted-foreground mt-0.5">{alert.description}</p>
        <p className="text-caption text-muted-foreground mt-1">
          {format(new Date(alert.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
        </p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-7 w-[200px] max-w-full" />
        <Skeleton className="h-4 w-full max-w-[300px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <Skeleton className="h-[160px] w-[160px] rounded-full" />
            <Skeleton className="h-5 w-[120px]" />
          </CardContent>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-[140px]" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-3 w-[80px] mb-2" />
                <Skeleton className="h-5 w-[60px] mb-1" />
                <Skeleton className="h-3 w-[60px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-[180px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-[80px] mb-2" />
                  <Skeleton className="h-5 w-[60px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function BusinessHealthPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: healthScore,
    isLoading: isLoadingScore,
    error: scoreError,
    refetch: refetchScore,
  } = useBusinessHealthScore(id || '')

  const {
    data: activityHealth,
    isLoading: isLoadingActivity,
  } = useBusinessActivityHealth(id || '')

  const {
    data: performance,
    isLoading: isLoadingPerformance,
  } = useBusinessPerformanceIndicators(id || '')

  const {
    data: risks,
    isLoading: isLoadingRisks,
  } = useBusinessRiskIndicators(id || '')

  const {
    data: alerts,
    isLoading: isLoadingAlerts,
  } = useBusinessHealthAlerts(id || '')

  const isLoading = isLoadingScore || isLoadingActivity || isLoadingPerformance || isLoadingRisks || isLoadingAlerts

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (scoreError) {
    return (
      <ErrorState
        title="Failed to load health data"
        description="We couldn't load the business health information. Please try again."
        onRetry={() => refetchScore()}
      />
    )
  }

  if (!healthScore || healthScore.status === 'unavailable') {
    return (
      <EmptyState
        icon={<HeartPulse className="h-12 w-12" />}
        title="Health data not available yet"
        description="Health metrics for this business are not yet available. Data will appear once the business has sufficient activity."
      />
    )
  }

  const criticalAlerts = alerts?.filter((a) => a.severity === 'critical') || []
  const warningAlerts = alerts?.filter((a) => a.severity === 'warning') || []
  const infoAlerts = alerts?.filter((a) => a.severity === 'informational') || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-h2 text-foreground flex items-center gap-2.5">
          <HeartPulse className="h-6 w-6 text-muted-foreground" />
          Business Health
        </h2>
        <p className="text-body-small text-muted-foreground mt-1">
          Real-time health monitoring and diagnostics for this business.
        </p>
      </div>

      {/* Overall Health + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Health Score */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <HealthScoreRing score={healthScore.score} status={healthScore.status} />
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-label font-medium text-foreground">Overall Health</p>
              <Badge variant={statusVariant[healthScore.status]}>
                {statusLabel[healthScore.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Business Activity */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-label font-medium text-foreground">Business Activity</h3>
          {activityHealth ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ActivityCard
                label="User Activity"
                value={activityHealth.userActivity.value}
                status={activityHealth.userActivity.status}
              />
              <ActivityCard
                label="Deal Activity"
                value={activityHealth.dealActivity.value}
                status={activityHealth.dealActivity.status}
              />
              <ActivityCard
                label="Customer Activity"
                value={activityHealth.customerActivity.value}
                status={activityHealth.customerActivity.status}
              />
            </div>
          ) : (
            <EmptyState
              icon={<Activity className="h-8 w-8" />}
              title="No activity data"
              description="Activity health data is not available for this business yet."
              className="py-8"
            />
          )}
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="space-y-3">
        <h3 className="text-label font-medium text-foreground">Performance Indicators</h3>
        {performance ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PerformanceMetricCard
              icon={TrendingUp}
              label="Deal Conversion"
              value={`${performance.dealConversion}%`}
            />
            <PerformanceMetricCard
              icon={Clock}
              label="Approval Delay"
              value={performance.approvalDelay}
            />
            <PerformanceMetricCard
              icon={BarChart3}
              label="Fulfillment Delay"
              value={performance.fulfillmentDelay}
            />
            <PerformanceMetricCard
              icon={DollarSign}
              label="Payment Issues"
              value={String(performance.paymentIssues)}
            />
          </div>
        ) : (
          <EmptyState
            icon={<BarChart3 className="h-8 w-8" />}
            title="No performance data"
            description="Performance indicators are not available for this business yet."
            className="py-8"
          />
        )}
      </div>

      {/* Risk Indicators */}
      <div className="space-y-3">
        <h3 className="text-label font-medium text-foreground">Risk Indicators</h3>
        {risks ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RiskCard
              icon={AlertTriangle}
              label="High Risk Deals"
              count={risks.highRiskDeals}
              actionLabel="View Deals"
              actionPath={`/platform/businesses/${id}/deals?risk=high`}
            />
            <RiskCard
              icon={DollarSign}
              label="Discount Anomalies"
              count={risks.discountAnomalies}
              actionLabel="View Deals"
              actionPath={`/platform/businesses/${id}/deals`}
            />
            <RiskCard
              icon={Clock}
              label="Stalled Deals"
              count={risks.stalledDeals}
              actionLabel="View Deals"
              actionPath={`/platform/businesses/${id}/deals`}
            />
          </div>
        ) : (
          <EmptyState
            icon={<Shield className="h-8 w-8" />}
            title="No risk data"
            description="Risk indicators are not available for this business yet."
            className="py-8"
          />
        )}
      </div>

      {/* Health Alerts */}
      <div className="space-y-3">
        <h3 className="text-label font-medium text-foreground">Health Alerts</h3>
        {alerts && alerts.length > 0 ? (
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {criticalAlerts.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-caption font-medium text-danger uppercase tracking-wider mb-1">Critical</p>
                  {criticalAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
              {warningAlerts.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-caption font-medium text-warning uppercase tracking-wider mb-1">Warning</p>
                  {warningAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
              {infoAlerts.length > 0 && (
                <div className="px-5 py-3">
                  <p className="text-caption font-medium text-info uppercase tracking-wider mb-1">Informational</p>
                  {infoAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<Shield className="h-8 w-8" />}
            title="No alerts"
            description="There are no active health alerts for this business."
            className="py-8"
          />
        )}
      </div>
    </div>
  )
}
