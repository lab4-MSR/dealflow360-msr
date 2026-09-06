import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap shrink-0 transition-colors duration-200 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary-subtle text-primary border border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground border border-border/80',
        success: 'bg-success-subtle text-success border border-success/25',
        warning: 'bg-warning-subtle text-warning border border-warning/25',
        danger: 'bg-danger-subtle text-danger border border-danger/25',
        destructive: 'bg-danger-subtle text-danger border border-danger/25',
        info: 'bg-info-subtle text-info border border-info/25',
        intelligence: 'bg-intelligence-subtle text-intelligence border border-intelligence/25',
        outline: 'border border-border/80 text-foreground bg-background/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
