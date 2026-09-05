import { cn } from '@/lib/utils'

interface PercentageDisplayProps {
  value: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-body-small tabular-nums',
  md: 'text-body tabular-nums',
  lg: 'text-h3 tabular-nums',
}

export function PercentageDisplay({ value, className, size = 'md' }: PercentageDisplayProps) {
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : (Number(value) || 0)
  const formatted = `${numericValue.toFixed(1)}%`

  return (
    <span className={cn('font-medium whitespace-nowrap', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
