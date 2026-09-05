import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  Server,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { PlatformAlert, Severity } from '../types'
import { cn } from '@/lib/utils'

interface PlatformAlertsProps {
  alerts: PlatformAlert[]
}

const severityConfig: Record<Severity, { variant: 'danger' | 'warning' | 'info' | 'secondary'; icon: React.ElementType }> = {
  critical: { variant: 'danger', icon: AlertTriangle },
  high: { variant: 'danger', icon: AlertTriangle },
  medium: { variant: 'warning', icon: AlertTriangle },
  low: { variant: 'info', icon: Info },
}

const typeIcon: Record<string, React.ElementType> = {
  alert: Info,
  suspended_business: Building2,
  system_issue: Server,
}

export function PlatformAlerts({ alerts }: PlatformAlertsProps) {
  const navigate = useNavigate()

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-success-subtle p-2.5">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-body-small font-medium text-foreground">No platform alerts</p>
            <p className="text-caption text-muted-foreground mt-1">All systems are operating normally</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alerts</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">
              {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {alerts.map((alert, index) => {
            const sev = severityConfig[alert.severity] || severityConfig.low
            const TypeIcon = typeIcon[alert.type] || Info

            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index < alerts.length - 1 && 'border-b border-border'
                )}
              >
                <div className={cn(
                  'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  sev.variant === 'danger' && 'bg-danger-subtle',
                  sev.variant === 'warning' && 'bg-warning-subtle',
                  sev.variant === 'info' && 'bg-info-subtle',
                )}>
                  <TypeIcon className={cn(
                    'h-3.5 w-3.5',
                    sev.variant === 'danger' && 'text-danger',
                    sev.variant === 'warning' && 'text-warning',
                    sev.variant === 'info' && 'text-info',
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-small font-medium text-foreground">
                      {alert.title}
                    </span>
                    <Badge variant={sev.variant} className="px-1.5 py-0 shrink-0">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-caption text-muted-foreground mt-0.5 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-caption text-muted-foreground">
                      {format(parseISO(alert.timestamp), 'MMM d, h:mm a')}
                    </span>
                    {alert.metadata?.businessId && (
                      <button
                        onClick={() => navigate(`/platform/businesses/${alert.metadata!.businessId}`)}
                        className="text-caption text-primary hover:text-primary-hover transition-colors font-medium"
                      >
                        View business
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
