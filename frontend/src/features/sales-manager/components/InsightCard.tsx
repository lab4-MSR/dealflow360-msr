import { Link } from 'react-router-dom'
import { AlertCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DecisionInsight } from '@/types/salesManager'

interface InsightCardProps {
  insight: DecisionInsight
  onAction?: (insight: DecisionInsight) => void
  className?: string
}

export function InsightCard({ insight, onAction, className }: InsightCardProps) {
  const severityConfig = {
    critical: {
      border: 'border-l-[3px] border-l-danger',
      badge: 'bg-danger-subtle text-danger',
      icon: AlertCircle,
      iconColor: 'text-danger',
    },
    high: {
      border: 'border-l-[3px] border-l-danger',
      badge: 'bg-danger-subtle text-danger',
      icon: AlertCircle,
      iconColor: 'text-danger',
    },
    medium: {
      border: 'border-l-[3px] border-l-warning',
      badge: 'bg-warning-subtle text-warning',
      icon: AlertTriangle,
      iconColor: 'text-warning',
    },
    low: {
      border: 'border-l-[3px] border-l-info',
      badge: 'bg-info-subtle text-info',
      icon: Info,
      iconColor: 'text-info',
    },
  }

  const current = severityConfig[insight.severity] || severityConfig.medium
  const IconComponent = current.icon

  return (
    <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-elevation-2', current.border, className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconComponent className={cn('h-4 w-4 shrink-0', current.iconColor)} />
            <h4 className="text-sm font-semibold text-foreground tracking-tight">{insight.title}</h4>
          </div>
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0', current.badge)}>
            {insight.severity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/40 p-2 rounded">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">What</span>
            <p className="text-muted-foreground mt-0.5">{insight.what}</p>
          </div>
          <div className="bg-muted/40 p-2 rounded">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">Why</span>
            <p className="text-muted-foreground mt-0.5">{insight.why}</p>
          </div>
          <div className="bg-muted/40 p-2 rounded">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">Impact</span>
            <p className="text-muted-foreground mt-0.5">{insight.impact}</p>
          </div>
          <div className="bg-muted/40 p-2 rounded">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wide">Next Action</span>
            <p className="text-foreground font-medium mt-0.5">{insight.next_action}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Actor: <strong className="text-foreground">{insight.who}</strong></span>
            <span>Timing: <strong className="text-foreground">{insight.when}</strong></span>
          </div>

          {insight.target_link ? (
            <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
              <Link to={insight.target_link}>
                <span>{insight.action_label || 'Take Action'}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          ) : (
            onAction && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction(insight)}>
                <span>{insight.action_label || 'Take Action'}</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
