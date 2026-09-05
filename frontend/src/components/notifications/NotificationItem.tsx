import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Check, ExternalLink } from 'lucide-react'
import type { Notification } from '@/types/shared'
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_PRIORITY_VARIANT,
} from '@/constants/shared'
import { formatRelativeTime } from '@/lib/dates'
import { categoryIcon, relatedRecordUrl } from './helpers'

interface NotificationItemProps {
  notification: Notification
  selected?: boolean
  onSelect: (notification: Notification) => void
  onMarkRead: (id: string) => void
}

export function NotificationItem({ notification, selected, onSelect, onMarkRead }: NotificationItemProps) {
  const Icon = categoryIcon(notification.type)
  const url = relatedRecordUrl(notification.related_record)
  const unread = !notification.read
  const categoryLabel =
    NOTIFICATION_CATEGORY_LABELS[notification.type] ?? notification.type ?? 'Notification'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={selected}
      onClick={() => onSelect(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(notification)
        }
      }}
      className={cn(
        'group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors',
        'hover:bg-accent/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        unread ? 'bg-card' : '',
        selected && 'border-primary/40 ring-1 ring-primary/30'
      )}
    >
      {/* Unread cue (non-color indicator + accent bar) */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          unread ? 'bg-primary-subtle text-primary' : 'bg-surface-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      {unread && (
        <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-full bg-primary" aria-hidden />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              'text-body font-medium text-foreground',
              unread ? 'font-semibold' : 'text-muted-foreground font-normal'
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-caption text-muted-foreground">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>

        {notification.message && (
          <p className="mt-0.5 line-clamp-2 text-body-small text-muted-foreground">{notification.message}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-caption font-medium text-muted-foreground">
            {categoryLabel}
          </span>
          {notification.priority && (
            <Badge variant={NOTIFICATION_PRIORITY_VARIANT[notification.priority] ?? 'secondary'}>
              {NOTIFICATION_PRIORITY_LABELS[notification.priority] ?? notification.priority}
            </Badge>
          )}
          {url && (
            <span
              className="inline-flex items-center gap-1 text-caption font-medium text-primary"
              aria-label={`Related record ${notification.related_record?.type}`}
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              {notification.related_record?.type} · {notification.related_record?.id}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Read status (non-color indicator) */}
        <span
          className={cn(
            'hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption',
            unread ? 'bg-primary-subtle text-primary' : 'bg-surface-muted text-muted-foreground'
          )}
        >
          <span
            className={cn('h-1.5 w-1.5 rounded-full', unread ? 'bg-primary' : 'bg-muted-foreground')}
            aria-hidden
          />
          {unread ? 'Unread' : 'Read'}
        </span>

        {unread && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead(notification.id)
            }}
            aria-label="Mark as read"
            title="Mark as read"
            className="rounded-md p-1.5 text-muted-foreground opacity-70 transition hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}