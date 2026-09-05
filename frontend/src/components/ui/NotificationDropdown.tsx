import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sharedApi } from '@/lib/shared-api'
import type { Notification } from '@/types/shared'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Truck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function getNotificationIcon(type?: string, priority?: string) {
  if (priority === 'high') {
    return <ShieldAlert className="h-4 w-4 text-rose-500" />
  }
  switch (type) {
    case 'approval':
      return <CheckCircle2 className="h-4 w-4 text-amber-500" />
    case 'deal':
      return <FileText className="h-4 w-4 text-blue-500" />
    case 'billing':
      return <DollarSign className="h-4 w-4 text-emerald-500" />
    case 'fulfillment':
      return <Truck className="h-4 w-4 text-indigo-500" />
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />
  }
}

function formatRelativeTime(isoDate?: string): string {
  if (!isoDate) return 'Recently'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationDropdown() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'urgent'>('all')
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => sharedApi.notifications(),
  })

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => sharedApi.markNotificationRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old ? old.map((n) => (n.id === id ? { ...n, read: true } : n)) : []
      )
    },
  })

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => sharedApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old ? old.map((n) => ({ ...n, read: true })) : []
      )
      toast.success('All notifications marked as read')
    },
  })

  // Outside click listener
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Escape key listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const urgentCount = React.useMemo(
    () => notifications.filter((n) => n.priority === 'high' && !n.read).length,
    [notifications]
  )

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    if (filter === 'urgent') return notifications.filter((n) => n.priority === 'high')
    return notifications
  }, [notifications, filter])

  const handleNotificationClick = (item: Notification) => {
    if (!item.read) {
      markReadMutation.mutate(item.id)
    }
    setOpen(false)

    // Deep navigation
    if (item.related_record?.type === 'quotation' || item.related_record?.type === 'deal') {
      navigate(`/sales/quotations`)
    } else if (item.related_record?.type === 'order' || item.related_record?.type === 'fulfillment') {
      navigate(`/dashboard`)
    } else if (item.related_record?.type === 'invoice' || item.related_record?.type === 'billing') {
      navigate(`/analytics/revenue`)
    } else {
      navigate('/notifications')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Notification Center"
        title="Notifications"
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-accent text-foreground'
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
          </span>
        )}
      </button>

      {/* Pop-up Card */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications popover"
          className="absolute right-0 mt-2 w-84 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card shadow-elevation-3 z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top-right motion-reduce:animate-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-card">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                  Caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50 bg-muted/30">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                filter === 'all'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                filter === 'unread'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('urgent')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                filter === 'urgent'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Urgent {urgentCount > 0 && `(${urgentCount})`}
            </button>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filter === 'unread'
                    ? "You're all caught up with your unread alerts."
                    : 'No notifications found in this view.'}
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    'flex items-start gap-3 p-3.5 hover:bg-accent/50 cursor-pointer transition-colors text-left group',
                    !item.read && 'bg-primary/[0.03]'
                  )}
                >
                  {/* Category icon container */}
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/60">
                    {getNotificationIcon(item.type, item.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={cn('text-xs truncate font-medium', !item.read ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    {item.message && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground/70">
                      <span>{formatRelativeTime(item.created_at)}</span>
                      {item.priority === 'high' && (
                        <span className="text-rose-500 font-semibold uppercase tracking-wider">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/70 bg-muted/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/notifications')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer w-full justify-center"
            >
              <span>View all notifications</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
