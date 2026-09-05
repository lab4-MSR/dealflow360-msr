import { cn } from '@/lib/utils'
import type { RiskLevel } from '@/types'

interface RiskIndicatorProps {
  level: RiskLevel
  score?: number
  showLabel?: boolean
  showScore?: boolean
  className?: string
  size?: 'sm' | 'md'
}

const riskConfig: Record<RiskLevel, { color: string; bg: string; label: string; border: string }> = {
  low: {
    color: 'text-success',
    bg: 'bg-success-subtle',
    label: 'Low Risk',
    border: 'border-success/20',
  },
  medium: {
    color: 'text-warning',
    bg: 'bg-warning-subtle',
    label: 'Medium Risk',
    border: 'border-warning/20',
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    label: 'High Risk',
    border: 'border-orange-200 dark:border-orange-800/30',
  },
  critical: {
    color: 'text-danger',
    bg: 'bg-danger-subtle',
    label: 'Critical Risk',
    border: 'border-danger/20',
  },
}

export function RiskIndicator({ level, score, showLabel = true, showScore = true, className, size = 'md' }: RiskIndicatorProps) {
  const normalizedLevel = (level?.toLowerCase?.() || 'low') as RiskLevel
  const config = riskConfig[normalizedLevel] || riskConfig.low

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-0.5 text-caption'
      )}>
        <span className={cn(
          'h-1.5 w-1.5 rounded-full',
          normalizedLevel === 'low' && 'bg-success',
          normalizedLevel === 'medium' && 'bg-warning',
          normalizedLevel === 'high' && 'bg-orange-500',
          normalizedLevel === 'critical' && 'bg-danger'
        )} />
        {showLabel && config.label}
      </div>
      {showScore && score !== undefined && (
        <span className="text-small tabular-nums text-muted-foreground">
          ({score})
        </span>
      )}
    </div>
  )
}
