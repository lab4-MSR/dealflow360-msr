import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium transition-all duration-200 ease-out',
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
        processing: 'bg-info-subtle text-info',
        in_transit: 'bg-info-subtle text-info',
        delivered: 'bg-success-subtle text-success',
        delayed: 'bg-danger-subtle text-danger',
        active: 'bg-success-subtle text-success',
        cancelled: 'bg-muted text-muted-foreground',
        trial: 'bg-purple-subtle text-purple-700',
        paid: 'bg-success-subtle text-success',
        overdue: 'bg-danger-subtle text-danger',
        unpaid: 'bg-warning-subtle text-warning',
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
  processing: 'bg-info',
  in_transit: 'bg-info',
  delivered: 'bg-success',
  delayed: 'bg-danger',
  active: 'bg-success',
  cancelled: 'bg-muted-foreground',
  trial: 'bg-purple-500',
  paid: 'bg-success',
  overdue: 'bg-danger',
  unpaid: 'bg-warning',
}

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  status?: string | null
}

function StatusBadge({ className, status, children, ...props }: StatusBadgeProps) {
  const normStatus = (status?.toLowerCase().replace(/ /g, '_') || 'draft') as any
  const dotColor = statusDotVariants[normStatus] || 'bg-muted-foreground'
  const displayContent = children || (status ? status.replace(/_/g, ' ') : 'Draft')

  return (
    <div className={cn(statusVariants({ status: normStatus in statusDotVariants ? normStatus : 'draft' }), 'capitalize', className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
      {displayContent}
    </div>
  )
}

export { StatusBadge, statusVariants }
