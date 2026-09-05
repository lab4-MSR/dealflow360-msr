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

export function MoneyDisplay({ amount, currency = 'INR', className, size = 'md' }: MoneyDisplayProps) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)

  return (
    <span className={cn('font-medium', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
