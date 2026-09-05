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
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0)
  let formatted: string
  try {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 0,
    }).format(numericAmount)
  } catch {
    formatted = `${currency || '₹'} ${numericAmount.toLocaleString('en-IN')}`
  }

  return (
    <span className={cn('font-medium whitespace-nowrap', sizeClasses[size], className)}>
      {formatted}
    </span>
  )
}
