import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, CheckCheck, Trash2, ArrowUpRight } from 'lucide-react'
import type { Notification } from '@/types/shared'
import {
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_PRIORITY_VARIANT,
} from '@/constants/shared'
import { formatRelativeTime } from '@/lib/dates'
import { categoryIcon, relatedRecordUrl } from './helpers'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NotificationItemProps {
  notification: Notification
  selected?: boolean
  onSelect: (notification: Notification) => void
  onMarkRead: (id: string) => void
  onToggleRead?: (id: string, currentRead: boolean) => void
  onDelete?: (id: string) => void
}

export function NotificationItem({
  notification,
  selected,
  onSelect,
  onMarkRead,
  onToggleRead,
  onDelete,
}: NotificationItemProps) {
  const navigate = useNavigate()
  const Icon = categoryIcon(notification.type)
  const url = relatedRecordUrl(notification.related_record)
  const unread = !notification.read
  const categoryLabel =
    NOTIFICATION_CATEGORY_LABELS[notification.type] ?? notification.type ?? 'Notification'

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      navigate(url)
    }
  }

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleRead) {
      onToggleRead(notification.id, notification.read)
    } else {
      onMarkRead(notification.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(notification.id)
  }

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
        'group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-xl border p-4 transition-all duration-150',
        'hover:border-border hover:shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        unread
          ? 'bg-card border-primary/20 shadow-xs'
          : 'bg-card/60 border-border/70 text-muted-foreground opacity-90',
        selected && 'border-primary ring-1 ring-primary/40 bg-accent/30'
      )}
    >
      {/* Left unread bar */}
      {unread && (
        <span
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
          aria-hidden
        />
      )}

      {/* Main Content Info */}
      <div className="flex items-start gap-3 min-w-0 flex-1 pl-1">
        {/* Category Icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
            unread
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-muted text-muted-foreground border border-border/60'
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                'text-small leading-tight text-foreground truncate',
                unread ? 'font-semibold' : 'font-medium text-foreground/80'
              )}
            >
              {notification.title}
            </p>
            {notification.priority === 'high' && (
              <Badge variant="danger" className="text-[10px] px-1.5 py-0 h-4">
                Urgent
              </Badge>
            )}
            <span className="text-caption text-muted-foreground sm:hidden">
              • {formatRelativeTime(notification.created_at)}
            </span>
          </div>

          {notification.message && (
            <p className="text-caption text-muted-foreground line-clamp-2 leading-relaxed">
              {notification.message}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
              {categoryLabel}
            </span>
            {notification.priority && notification.priority !== 'high' && (
              <Badge
                variant={NOTIFICATION_PRIORITY_VARIANT[notification.priority] ?? 'secondary'}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {NOTIFICATION_PRIORITY_LABELS[notification.priority] ?? notification.priority}
              </Badge>
            )}
            {notification.related_record && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-primary font-medium">
                <span className="capitalize">{notification.related_record.type}</span>: #{notification.related_record.id}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right meta & actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
        <span className="hidden sm:inline-block text-caption text-muted-foreground tabular-nums text-right">
          {formatRelativeTime(notification.created_at)}
        </span>

        <div className="flex items-center gap-1 ml-auto sm:ml-2">
          {url && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleActionClick}
                  >
                    <span>Open</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Navigate to linked {notification.related_record?.type}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleToggleRead}
                  aria-label={unread ? 'Mark as read' : 'Mark as unread'}
                >
                  {unread ? <Check className="h-4 w-4" /> : <CheckCheck className="h-4 w-4 text-primary" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{unread ? 'Mark as read' : 'Mark as unread'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                    onClick={handleDelete}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dismiss notification</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}