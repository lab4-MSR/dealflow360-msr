import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const riskVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium transition-all duration-200 ease-out',
  {
    variants: {
      risk: {
        low: 'bg-success-subtle text-success',
        medium: 'bg-warning-subtle text-warning',
        high: 'bg-danger-subtle text-danger',
        critical: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: {
      risk: 'low',
    },
  }
)

const riskDotVariants: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-danger',
  critical: 'bg-danger',
}

export interface RiskBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof riskVariants> {
  size?: 'sm' | 'md' | 'lg' | string
}

function RiskBadge({ className, risk, children, ...props }: RiskBadgeProps) {
  return (
    <div className={cn(riskVariants({ risk }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-200', riskDotVariants[risk || 'low'], risk === 'critical' && 'animate-pulse motion-reduce:animate-none')} />
      {children}
    </div>
  )
}

export { RiskBadge, riskVariants }
