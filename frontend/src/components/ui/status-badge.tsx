import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
  {
    variants: {
      status: {
        draft: 'bg-muted text-muted-foreground',
        pending: 'bg-warning-subtle text-warning',
        approved: 'bg-success-subtle text-success',
        rejected: 'bg-danger-subtle text-danger',
        negotiation: 'bg-warning-subtle text-warning',
        confirmed: 'bg-info-subtle text-info',
        fulfillment: 'bg-info-subtle text-info',
        backorder: 'bg-warning-subtle text-warning',
        completed: 'bg-success-subtle text-success',
        failed: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: {
      status: 'draft',
    },
  }
)

const statusDotVariants: Record<string, string> = {
  draft: 'bg-muted-foreground',
  pending: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-danger',
  negotiation: 'bg-warning',
  confirmed: 'bg-info',
  fulfillment: 'bg-info',
  backorder: 'bg-warning',
  completed: 'bg-success',
  failed: 'bg-danger',
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {}

function StatusBadge({ className, status, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusVariants({ status }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', statusDotVariants[status || 'draft'])} />
      {children}
    </div>
  )
}

export { StatusBadge, statusVariants }
