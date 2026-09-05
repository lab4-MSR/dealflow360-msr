import type { ReactNode } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'

export interface SelectOption {
  value: string
  label: string
}

/**
 * Predefined date ranges for Analytics pages, aligned with the contract's
 * standard reporting filters (§18): `period` supports today / week /
 * custom range. The custom range uses native date inputs built on the
 * existing Input primitive — no invented backend capability.
 */
export const DATE_RANGE_OPTIONS: SelectOption[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'custom', label: 'Custom Range' },
]

/** Comparison-period options for Analytics pages (period-over-period contexts). */
export const COMPARISON_OPTIONS: SelectOption[] = [
  { value: 'previous_period', label: 'vs Previous Period' },
  { value: 'same_period_last_year', label: 'vs Same Period Last Year' },
]

interface AnalyticsPageHeaderProps {
  title: string
  description?: string
  /** Current date-range value (one of DATE_RANGE_OPTIONS). */
  dateRange: string
  onDateRangeChange: (value: string) => void
  /** Custom-range bounds; rendered when dateRange === 'custom'. */
  customFrom?: string
  customTo?: string
  onCustomFromChange?: (value: string) => void
  onCustomToChange?: (value: string) => void
  /** Current comparison value (one of COMPARISON_OPTIONS). */
  comparison: string
  onComparisonChange: (value: string) => void
  /** Right-side actions (e.g. Export button owned by the page). */
  actions?: ReactNode
}

/**
 * Shared Analytics page header: page title + description on the left,
 * date-range (with custom from/to) / comparison controls plus page actions
 * on the right. Controls are page-local — changing them only affects the
 * current page.
 */
export function AnalyticsPageHeader({
  title,
  description,
  dateRange,
  onDateRangeChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  comparison,
  onComparisonChange,
  actions,
}: AnalyticsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[150px]" aria-label="Date range">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dateRange === 'custom' ? (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              aria-label="From date"
              value={customFrom ?? ''}
              onChange={(event) => onCustomFromChange?.(event.target.value)}
              className="w-[150px]"
            />
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              to
            </span>
            <Input
              type="date"
              aria-label="To date"
              value={customTo ?? ''}
              onChange={(event) => onCustomToChange?.(event.target.value)}
              className="w-[150px]"
            />
          </div>
        ) : null}
        <Select value={comparison} onValueChange={onComparisonChange}>
          <SelectTrigger className="w-[220px]" aria-label="Comparison period">
            <SelectValue placeholder="Comparison" />
          </SelectTrigger>
          <SelectContent>
            {COMPARISON_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actions}
      </div>
    </div>
  )
}

