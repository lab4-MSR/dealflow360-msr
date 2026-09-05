import { cn } from '@/lib/utils'
import type { CustomerTier, HealthStatus } from '@/types/salesManager'

interface CustomerTierBadgeProps {
  tier: CustomerTier
  className?: string
}

export function CustomerTierBadge({ tier, className }: CustomerTierBadgeProps) {
  const tierStyles: Record<CustomerTier, { label: string; className: string }> = {
    platinum: {
      label: 'Platinum',
      className: 'bg-slate-900 text-slate-100 border border-slate-700 dark:bg-slate-100 dark:text-slate-900',
    },
    gold: {
      label: 'Gold',
      className: 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    },
    silver: {
      label: 'Silver',
      className: 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    },
    bronze: {
      label: 'Bronze',
      className: 'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    },
  }

  const current = tierStyles[tier] || tierStyles.silver

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider',
        current.className,
        className
      )}
    >
      {current.label}
    </span>
  )
}

interface HealthScoreBadgeProps {
  score: number
  status?: HealthStatus
  showBar?: boolean
  className?: string
}

export function HealthScoreBadge({ score, status, showBar = false, className }: HealthScoreBadgeProps) {
  let color = 'text-success'
  let bgSubtle = 'bg-success-subtle'
  let barBg = 'bg-success'
  let label = 'Healthy'

  if (score < 50 || status === 'critical' || status === 'stalled') {
    color = 'text-danger'
    bgSubtle = 'bg-danger-subtle'
    barBg = 'bg-danger'
    label = status === 'stalled' ? 'Stalled' : 'Critical'
  } else if (score < 80 || status === 'at_risk') {
    color = 'text-warning'
    bgSubtle = 'bg-warning-subtle'
    barBg = 'bg-warning'
    label = 'At Risk'
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('px-2 py-0.5 rounded text-xs font-bold tabular-nums', bgSubtle, color)}>
        {score}/100
      </span>
      {showBar && (
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-300', barBg)} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
        </div>
      )}
      <span className="text-xs text-muted-foreground font-medium hidden sm:inline">{label}</span>
    </div>
  )
}
