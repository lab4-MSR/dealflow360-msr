import { cn } from '@/lib/utils'

interface DiscountIndicatorProps {
  allowed: number
  applied: number
  className?: string
  size?: 'sm' | 'md'
}

export function DiscountIndicator({ allowed, applied, className, size = 'md' }: DiscountIndicatorProps) {
  const overDiscount = applied - allowed
  const isOverDiscount = overDiscount > 0

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        isOverDiscount
          ? 'bg-danger-subtle text-danger'
          : 'bg-success-subtle text-success',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-0.5 text-caption'
      )}>
        <span className="tabular-nums">{applied.toFixed(1)}%</span>
      </div>
      {isOverDiscount && (
        <span className={cn('tabular-nums', size === 'sm' ? 'text-caption' : 'text-small', 'text-danger')}>
          +{overDiscount.toFixed(1)}pp over allowed
        </span>
      )}
      {!isOverDiscount && (
        <span className={cn('tabular-nums', size === 'sm' ? 'text-caption' : 'text-small', 'text-muted-foreground')}>
          Allowed: {allowed.toFixed(1)}%
        </span>
      )}
    </div>
  )
}
