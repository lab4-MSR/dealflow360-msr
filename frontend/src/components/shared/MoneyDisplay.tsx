import { cn } from '@/lib/utils'

interface MoneyDisplayProps {
  amount: number
  currency?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-body-small tabular-nums',
  md: 'text-body tabular-nums',
  lg: 'text-h3 tabular-nums',
}

export function MoneyDisplay({ amount, currency = 'USD', className, size = 'md' }: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)

  return (
    <span className={cn('font-medium', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
