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
  const formatted = `${value.toFixed(1)}%`

  return (
    <span className={cn('font-medium', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
