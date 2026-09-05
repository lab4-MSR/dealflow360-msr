import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const kpiCardVariants = cva(
  'rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-out hover:border-border-strong',
  {
    variants: {
      variant: {
        default: '',
        success: 'border-success/20',
        warning: 'border-warning/20',
        danger: 'border-danger/20',
        info: 'border-info/20',
        intelligence: 'border-intelligence/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof kpiCardVariants> {
  label?: string
  title?: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  change?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
}

function KpiCard({ className, variant, label, title, value, trend, change, icon, children, ...props }: KpiCardProps) {
  const displayLabel = label || title || ''
  return (
    <div className={cn(kpiCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-caption font-medium text-muted-foreground truncate" title={displayLabel}>{displayLabel}</p>
          <p className="text-xl sm:text-h2 font-semibold tabular-nums transition-all duration-200 ease-out whitespace-nowrap overflow-hidden text-ellipsis">{value}</p>
          {trend && (
            <p className={cn(
              'text-caption tabular-nums whitespace-nowrap',
              trend.direction === 'up' && 'text-success',
              trend.direction === 'down' && 'text-danger',
              trend.direction === 'neutral' && 'text-muted-foreground'
            )}>
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {Math.abs(trend.value)}%
            </p>
          )}
          {!trend && change && (
            <p className="text-caption text-muted-foreground tabular-nums whitespace-nowrap truncate">
              {change.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground shrink-0 mt-0.5">
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export { KpiCard, kpiCardVariants }
