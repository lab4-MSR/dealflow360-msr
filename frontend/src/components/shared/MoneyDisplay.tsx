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

export function MoneyDisplay({ amount, className, size = 'md' }: MoneyDisplayProps) {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0)
  let formatted: string
  try {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch {
    formatted = `₹${numericAmount.toLocaleString('en-IN')}`
  }

  return (
    <span className={cn('font-medium whitespace-nowrap font-numeric', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
