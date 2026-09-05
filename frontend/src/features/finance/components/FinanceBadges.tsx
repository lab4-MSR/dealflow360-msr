import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================
// INVOICE STATUS BADGE
// ============================================================

const invoiceStatusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
  {
    variants: {
      status: {
        draft: 'bg-muted text-muted-foreground',
        issued: 'bg-info-subtle text-info',
        paid: 'bg-success-subtle text-success',
        partially_paid: 'bg-warning-subtle text-warning',
        overdue: 'bg-danger-subtle text-danger',
        void: 'bg-muted text-muted-foreground line-through',
      },
    },
    defaultVariants: { status: 'draft' },
  }
)

export interface InvoiceStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof invoiceStatusVariants> {}

export function InvoiceStatusBadge({ className, status, children, ...props }: InvoiceStatusBadgeProps) {
  const labels: Record<string, string> = {
    draft: 'Draft', issued: 'Issued', paid: 'Paid',
    partially_paid: 'Partial', overdue: 'Overdue', void: 'Void',
  }
  return (
    <div className={cn(invoiceStatusVariants({ status }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-muted-foreground': status === 'draft' || status === 'void',
        'bg-info': status === 'issued', 'bg-success': status === 'paid',
        'bg-warning': status === 'partially_paid' || status === 'overdue',
        'bg-danger': status === 'overdue',
      })} />
      {children || labels[status || 'draft']}
    </div>
  )
}

// ============================================================
// PAYMENT STATUS BADGE
// ============================================================

const paymentStatusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
  {
    variants: {
      status: {
        pending: 'bg-warning-subtle text-warning',
        succeeded: 'bg-success-subtle text-success',
        failed: 'bg-danger-subtle text-danger',
        refunded: 'bg-info-subtle text-info',
      },
    },
    defaultVariants: { status: 'pending' },
  }
)

export interface PaymentStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof paymentStatusVariants> {}

export function PaymentStatusBadge({ className, status, children, ...props }: PaymentStatusBadgeProps) {
  const labels: Record<string, string> = {
    pending: 'Pending', succeeded: 'Successful', failed: 'Failed', refunded: 'Refunded',
  }
  return (
    <div className={cn(paymentStatusVariants({ status }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-warning': status === 'pending', 'bg-success': status === 'succeeded',
        'bg-danger': status === 'failed', 'bg-info': status === 'refunded',
      })} />
      {children || labels[status || 'pending']}
    </div>
  )
}

// ============================================================
// SUBSCRIPTION STATUS BADGE
// ============================================================

const subscriptionStatusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
  {
    variants: {
      status: {
        trialing: 'bg-info-subtle text-info',
        active: 'bg-success-subtle text-success',
        past_due: 'bg-warning-subtle text-warning',
        cancelled: 'bg-muted text-muted-foreground',
        expired: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: { status: 'active' },
  }
)

export interface SubscriptionStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof subscriptionStatusVariants> {}

export function SubscriptionStatusBadge({ className, status, children, ...props }: SubscriptionStatusBadgeProps) {
  const labels: Record<string, string> = {
    trialing: 'Trial', active: 'Active', past_due: 'Past Due', cancelled: 'Cancelled', expired: 'Expired',
  }
  return (
    <div className={cn(subscriptionStatusVariants({ status }), className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-info': status === 'trialing', 'bg-success': status === 'active',
        'bg-warning': status === 'past_due', 'bg-muted-foreground': status === 'cancelled',
        'bg-danger': status === 'expired',
      })} />
      {children || labels[status || 'active']}
    </div>
  )
}

// ============================================================
// RISK BADGE
// ============================================================

const riskVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium',
  {
    variants: {
      level: {
        low: 'bg-success-subtle text-success',
        medium: 'bg-warning-subtle text-warning',
        high: 'bg-danger-subtle text-danger',
        critical: 'bg-danger text-white',
      },
    },
    defaultVariants: { level: 'low' },
  }
)

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof riskVariants> {}

export function RiskBadge({ className, level, children, ...props }: RiskBadgeProps) {
  const labels: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }
  return (
    <div className={cn(riskVariants({ level }), className)} {...props}>
      {children || labels[level || 'low']}
    </div>
  )
}
