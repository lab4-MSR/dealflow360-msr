import * as React from 'react'
import { X, ChevronDown, Calendar, User, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

export interface SearchFilters {
  type: string[]
  status: string[]
  dateFrom: string
  dateTo: string
  ownerId: string
}

export interface FilterOptions {
  types: { value: string; label: string }[]
  statuses: { value: string; label: string }[]
  owners: { value: string; label: string }[]
}

interface SearchFiltersProps {
  filters: SearchFilters
  onChange: (filters: Partial<SearchFilters>) => void
  onClear: () => void
  options: FilterOptions
  isLoading?: boolean
  className?: string
}

const TYPE_OPTIONS = [
  { value: 'deals', label: 'Deals' },
  { value: 'quotations', label: 'Quotations' },
  { value: 'customers', label: 'Customers' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'shipments', label: 'Shipments' },
]

const DATE_PRESETS = [
  { value: '', label: 'Custom range' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
  { value: 'last_week', label: 'Last week' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_quarter', label: 'Last quarter' },
  { value: 'last_year', label: 'Last year' },
]

function getDateRange(preset: string): { from: string; to: string } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const format = (d: Date) => d.toISOString().split('T')[0]

  switch (preset) {
    case 'today':
      return { from: format(today), to: format(today) }
    case 'week': {
      const start = new Date(today)
      start.setDate(today.getDate() - today.getDay())
      return { from: format(start), to: format(today) }
    }
    case 'month':
      return { from: format(new Date(today.getFullYear(), today.getMonth(), 1)), to: format(today) }
    case 'quarter': {
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
      return { from: format(quarterStart), to: format(today) }
    }
    case 'year':
      return { from: format(new Date(today.getFullYear(), 0, 1)), to: format(today) }
    case 'last_week': {
      const end = new Date(today)
      end.setDate(today.getDate() - today.getDay() - 1)
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      return { from: format(start), to: format(end) }
    }
    case 'last_month': {
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      return { from: format(start), to: format(end) }
    }
    case 'last_quarter': {
      const quarterStart = Math.floor(today.getMonth() / 3) * 3
      const end = new Date(today.getFullYear(), quarterStart, 0)
      const start = new Date(today.getFullYear(), quarterStart - 3, 1)
      return { from: format(start), to: format(end) }
    }
    case 'last_year':
      return { from: format(new Date(today.getFullYear() - 1, 0, 1)), to: format(new Date(today.getFullYear() - 1, 11, 31)) }
    default:
      return { from: '', to: '' }
  }
}

export function SearchFilters({
  filters,
  onChange,
  onClear,
  options,
  isLoading,
  className,
}: SearchFiltersProps) {
  const [datePreset, setDatePreset] = React.useState<string>('')

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.type.length > 0) count++
    if (filters.status.length > 0) count++
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.ownerId) count++
    return count
  }, [filters])

  const handleDatePresetChange = React.useCallback(
    (preset: string) => {
      setDatePreset(preset)
      if (preset) {
        const range = getDateRange(preset)
        onChange({ dateFrom: range.from, dateTo: range.to })
      } else {
        onChange({ dateFrom: '', dateTo: '' })
      }
    },
    [onChange]
  )

  const handleDateChange = React.useCallback(
    (field: 'dateFrom' | 'dateTo', value: string) => {
      setDatePreset('')
      onChange({ [field]: value })
    },
    [onChange]
  )

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground text-label">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1.5 h-9 px-3', filters.type.length > 0 && 'bg-accent')}
            >
              <span className="text-label">Type</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="px-2 py-1.5 text-caption font-medium text-muted-foreground">
              Entity Type
            </DropdownMenuLabel>
            {TYPE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => {
                  const newTypes = filters.type.includes(option.value)
                    ? filters.type.filter((t) => t !== option.value)
                    : [...filters.type, option.value]
                  onChange({ type: newTypes })
                }}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5',
                  filters.type.includes(option.value) && 'bg-accent'
                )}
              >
                <span className="text-body-small">{option.label}</span>
                {filters.type.includes(option.value) && (
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1.5 h-9 px-3', filters.status.length > 0 && 'bg-accent')}
            >
              <span className="text-label">Status</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="px-2 py-1.5 text-caption font-medium text-muted-foreground">
              Status
            </DropdownMenuLabel>
            {options.statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onSelect={() => {
                  const newStatuses = filters.status.includes(status.value)
                    ? filters.status.filter((s) => s !== status.value)
                    : [...filters.status, status.value]
                  onChange({ status: newStatuses })
                }}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5',
                  filters.status.includes(status.value) && 'bg-accent'
                )}
              >
                <span className="text-body-small">{status.label}</span>
                {filters.status.includes(status.value) && (
                  <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1.5 h-9 px-3', (filters.dateFrom || filters.dateTo) && 'bg-accent')}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-label">Date</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-2">
            <DropdownMenuLabel className="px-2 py-1.5 text-caption font-medium text-muted-foreground">
              Date Range
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-2 gap-2 px-2 py-2">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={datePreset === preset.value ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start h-8 px-2 py-1 text-body-small"
                  onClick={() => handleDatePresetChange(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-2 space-y-2">
              <div>
                <label className="text-caption text-muted-foreground mb-1 block">From</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="h-9 text-body-small"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="text-caption text-muted-foreground mb-1 block">To</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="h-9 text-body-small"
                  disabled={isLoading}
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn('gap-1.5 h-9 px-3', filters.ownerId && 'bg-accent')}
            >
              <User className="h-4 w-4" />
              <span className="text-label">Owner</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-64">
            <DropdownMenuLabel className="px-2 py-1.5 text-caption font-medium text-muted-foreground">
              Owner
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => onChange({ ownerId: '' })}
              className={cn('flex items-center gap-2 px-2 py-1.5', !filters.ownerId && 'bg-accent')}
            >
              <span className="text-body-small">All owners</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {options.owners.map((owner) => (
              <DropdownMenuItem
                key={owner.value}
                onSelect={() => onChange({ ownerId: owner.value })}
                className={cn('flex items-center gap-2 px-2 py-1.5', filters.ownerId === owner.value && 'bg-accent')}
              >
                <span className="text-body-small">{owner.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 h-9 px-3 text-muted-foreground hover:text-foreground"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
            <span className="text-label">Clear all</span>
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-caption text-muted-foreground">Active filters:</span>
          {filters.type.map((type) => {
            const option = TYPE_OPTIONS.find((o) => o.value === type)
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-caption"
              >
                <span>{option?.label || type}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => onChange({ type: filters.type.filter((t) => t !== type) })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )
          })}
          {filters.status.map((status) => {
            const option = options.statuses.find((s) => s.value === status)
            return (
              <span
                key={status}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-caption"
              >
                <span>{option?.label || status}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
                  onClick={() => onChange({ status: filters.status.filter((s) => s !== status) })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </span>
            )
          })}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-caption">
              <Calendar className="h-3 w-3" />
              <span>
                {filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : '...'} –
                {filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : '...'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => onChange({ dateFrom: '', dateTo: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}
          {filters.ownerId && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-caption">
              <User className="h-3 w-3" />
              <span>{options.owners.find((o) => o.value === filters.ownerId)?.label || filters.ownerId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => onChange({ ownerId: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}