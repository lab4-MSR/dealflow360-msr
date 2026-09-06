import { cn } from '@/lib/utils'

// CURRENCY DISPLAY
export interface CurrencyValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  currency?: string
  showSign?: boolean
}

export function CurrencyValue({ value, showSign = false, className, ...props }: CurrencyValueProps) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(Math.abs(value))

  return (
    <span className={cn('tabular-nums font-mono', className)} {...props}>
      {showSign && value > 0 ? '+' : value < 0 ? '-' : ''}
      {formatted}
    </span>
  )
}

// PERCENTAGE DISPLAY
export interface PercentageValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  showSign?: boolean
  decimals?: number
}

export function PercentageValue({ value, showSign = false, decimals = 1, className, ...props }: PercentageValueProps) {
  return (
    <span className={cn('tabular-nums', className)} {...props}>
      {showSign && value > 0 ? '+' : ''}{value.toFixed(decimals)}%
    </span>
  )
}

// TREND INDICATOR
export interface TrendIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  direction: 'up' | 'down' | 'neutral'
  positiveIsGood?: boolean
}

export function TrendIndicator({ value, direction, positiveIsGood = true, className, ...props }: TrendIndicatorProps) {
  const isPositive = direction === 'up'
  const isGood = positiveIsGood ? isPositive : !isPositive
  const colorClass = isGood ? 'text-success' : direction === 'down' ? 'text-danger' : 'text-muted-foreground'

  return (
    <span className={cn('tabular-nums inline-flex items-center gap-0.5', colorClass, className)} {...props}>
      {direction === 'up' && 'Ã¢â€ â€˜'} {direction === 'down' && 'Ã¢â€ â€œ'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

// FINANCIAL METRIC CARD
export interface FinancialMetricProps {
  label: string
  value: string | number
  previousValue?: string | number
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  icon?: React.ReactNode
}

export function FinancialMetric({ label, value, previousValue, trend, variant = 'default', icon }: FinancialMetricProps) {
  return (
    <div className={cn('p-4 rounded-xl border bg-card', {
      'border-success/20': variant === 'success', 'border-warning/20': variant === 'warning',
      'border-danger/20': variant === 'danger', 'border-info/20': variant === 'info',
      'border-border': variant === 'default',
    })}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-caption font-medium text-muted-foreground">{label}</p>
          <p className="text-h3 tabular-nums font-semibold">{value}</p>
          {trend && <TrendIndicator value={trend.value} direction={trend.direction} />}
          {previousValue !== undefined && <p className="text-caption text-muted-foreground">Previous: {previousValue}</p>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}

// MONEY BREAKDOWN
export interface MoneyBreakdownRow { label: string; value: number; isTotal?: boolean; isNegative?: boolean }
export interface MoneyBreakdownProps { rows: MoneyBreakdownRow[]; currency?: string }

export function MoneyBreakdown({ rows }: MoneyBreakdownProps) {
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className={cn('flex justify-between items-center py-1', row.isTotal && 'border-t border-border font-semibold pt-2')}>
          <span className={cn('text-small', row.isTotal ? 'text-foreground' : 'text-muted-foreground')}>{row.label}</span>
          <span className={cn('tabular-nums font-mono text-small', {
            'text-foreground': !row.isNegative, 'text-danger': row.isNegative, 'text-foreground font-semibold': row.isTotal,
          })}>
            {row.isNegative ? '-' : ''}{String.fromCharCode(0x20B9)}{(row.value < 0 ? Math.abs(row.value) : row.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  )
}

// DATE RANGE OPTIONS
export interface DateRangeOption { label: string; value: string; date_from: string; date_to: string }

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  { label: 'Today', value: 'today', date_from: new Date().toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] },
  { label: 'This Week', value: 'week', date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] },
  { label: 'This Month', value: 'month', date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] },
  { label: 'This Quarter', value: 'quarter', date_from: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1).toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] },
  { label: 'This Year', value: 'year', date_from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], date_to: new Date().toISOString().split('T')[0] },
  { label: 'All Time', value: 'all', date_from: '', date_to: '' },
]




