import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Activity,
  Database,
  Shield,
  Cog,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import type { SystemHealth, HealthStatus, SystemHealthService } from '../types'
import { cn } from '@/lib/utils'

interface SystemHealthSummaryProps {
  health: SystemHealth
}

const statusConfig: Record<HealthStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  healthy: {
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success-subtle',
    label: 'Healthy',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning-subtle',
    label: 'Degraded',
  },
  critical: {
    icon: XCircle,
    color: 'text-danger',
    bg: 'bg-danger-subtle',
    label: 'Critical',
  },
  unavailable: {
    icon: XCircle,
    color: 'text-danger',
    bg: 'bg-danger-subtle',
    label: 'Unavailable',
  },
}

function HealthRow({ service, icon: Icon }: { service: SystemHealthService; icon: React.ElementType }) {
  const status = statusConfig[service.status] || statusConfig.healthy
  const StatusIcon = status.icon

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-small font-medium text-foreground">{service.name}</p>
          {service.latencyMs !== undefined && (
            <p className="text-caption text-muted-foreground">{service.latencyMs}ms latency</p>
          )}
        </div>
      </div>
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
        status.bg,
        status.color,
      )}>
        <StatusIcon className="h-3 w-3" />
        {status.label}
      </div>
    </div>
  )
}

export function SystemHealthSummary({ health }: SystemHealthSummaryProps) {
  const allServices = [health.api, health.database, health.authentication, ...health.services]
  const healthyCount = allServices.filter((s) => s.status === 'healthy').length
  const totalCount = allServices.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Health</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">
              {healthyCount}/{totalCount} services operational
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          <HealthRow service={health.api} icon={Activity} />
          <HealthRow service={health.database} icon={Database} />
          <HealthRow service={health.authentication} icon={Shield} />
          {health.services.map((service) => (
            <HealthRow key={service.name} service={service} icon={Cog} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
