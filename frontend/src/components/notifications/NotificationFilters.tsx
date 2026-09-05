import { cn } from '@/lib/utils'
import { NOTIFICATION_FILTERS } from './helpers'
import type { NotificationFilter } from '@/types/shared'

interface NotificationFiltersProps {
  filter: NotificationFilter
  onChange: (filter: NotificationFilter) => void
  counts: Partial<Record<NotificationFilter, number>>
}

export function NotificationFilters({ filter, onChange, counts }: NotificationFiltersProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter notifications"
      className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-thin"
    >
      {NOTIFICATION_FILTERS.map((option) => {
        const active = filter === option.value
        const count = counts[option.value]
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-label font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'bg-primary-subtle text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {option.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-caption tabular-nums',
                  active ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}