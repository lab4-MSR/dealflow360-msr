import { Bell, CheckCheck, Filter, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { NotificationFilter } from '@/types/shared'
import { NOTIFICATION_FILTERS } from './helpers'

interface NotificationHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  filter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
  unreadCount: number
  onMarkAllRead: () => void
  markAllPending?: boolean
}

export function NotificationHeader({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  unreadCount,
  onMarkAllRead,
  markAllPending,
}: NotificationHeaderProps) {
  const filterLabel = NOTIFICATION_FILTERS.find((f) => f.value === filter)?.label ?? 'All'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-h1 text-foreground flex items-center gap-2.5">
            <Bell className="h-6 w-6 text-primary" aria-hidden />
            Notification Center
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Review approvals, deals, billing and operational updates.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary-subtle px-2 py-0.5 text-caption font-medium text-primary">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllRead}
          disabled={markAllPending || unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" aria-hidden />
          Mark All Read
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Notification-specific search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications..."
            aria-label="Search notifications"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter control (mirrors the filter tabs) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="justify-between gap-2 sm:w-auto w-full">
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4" aria-hidden />
                Filter
              </span>
              <span className="text-muted-foreground">{filterLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATION_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => onFilterChange(f.value)}
                className={filter === f.value ? 'text-primary font-medium' : undefined}
              >
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}