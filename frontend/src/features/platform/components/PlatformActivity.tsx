import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import {
  Building2,
  UserCog,
  Server,
} from 'lucide-react'
import type { PlatformActivityItem, Severity } from '../types'
import { cn } from '@/lib/utils'

interface PlatformActivityProps {
  activities: PlatformActivityItem[]
}

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  business: { icon: Building2, label: 'Business' },
  user: { icon: UserCog, label: 'User' },
  system: { icon: Server, label: 'System' },
}

const severityVariant: Record<Severity, 'danger' | 'warning' | 'info' | 'secondary'> = {
  critical: 'danger',
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

function timeAgo(timestamp: string): string {
  const now = new Date()
  const then = parseISO(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return format(then, 'MMM d')
}

export function PlatformActivity({ activities }: PlatformActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-body-small text-muted-foreground text-center py-8">
            No recent activity
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Platform Activity</CardTitle>
            <p className="text-caption text-muted-foreground mt-1">Recent events across the platform</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type] || typeConfig.system
            const Icon = config.icon

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 py-3',
                  index < activities.length - 1 && 'border-b border-border'
                )}
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-small font-medium text-foreground">
                      {activity.actor}
                    </span>
                    <span className="text-small text-muted-foreground">
                      {activity.action}
                    </span>
                    <span className="text-small font-medium text-foreground">
                      {activity.target}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-caption text-muted-foreground">
                      {timeAgo(activity.timestamp)}
                    </span>
                    {activity.severity && activity.severity !== 'low' && (
                      <Badge variant={severityVariant[activity.severity]} className="px-1.5 py-0">
                        {activity.severity}
                      </Badge>
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
