import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { NotificationHeader, NotificationFilters, NotificationList, NotificationDetails } from '@/components/notifications'
import { sharedApi } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import type { Notification, NotificationFilter, NotificationType } from '@/types/shared'
import { NOTIFICATION_FILTERS } from '@/components/notifications/helpers'

const OPERATIONS_TYPES: NotificationType[] = ['fulfillment', 'system', 'customer']

function matchesFilter(n: Notification, filter: NotificationFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'unread':
      return !n.read
    case 'important':
      return n.priority === 'high'
    case 'approval':
      return n.type === 'approval'
    case 'deal':
      return n.type === 'deal'
    case 'billing':
      return n.type === 'billing'
    case 'operations':
      return OPERATIONS_TYPES.includes(n.type as NotificationType)
    default:
      return true
  }
}

function matchesSearch(n: Notification, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const record = n.related_record ? `${n.related_record.type} ${n.related_record.id}` : ''
  return `${n.title} ${n.message ?? ''} ${record}`.toLowerCase().includes(q)
}

export function NotificationCenterPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = React.useState<NotificationFilter>('all')
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selected, setSelected] = React.useState<Notification | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => sharedApi.notifications(),
  })

  const counts = React.useMemo(() => {
    const result = {} as Record<NotificationFilter, number>
    for (const option of NOTIFICATION_FILTERS) {
      result[option.value] = notifications.filter((n) => matchesFilter(n, option.value)).length
    }
    return result
  }, [notifications])

  const visible = React.useMemo(
    () => notifications.filter((n) => matchesFilter(n, filter) && matchesSearch(n, debouncedSearch)),
    [notifications, filter, debouncedSearch]
  )

  const markRead = useMutation({
    mutationFn: (id: string) => sharedApi.markNotificationRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    },
    onError: (err) => toast.error('Unable to mark as read', { description: getErrorMessage(err) }),
  })

  const markAllRead = useMutation({
    mutationFn: () => sharedApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        (prev ?? []).map((n) => ({ ...n, read: true }))
      )
      toast.success('All notifications marked as read')
    },
    onError: (err) => toast.error('Unable to mark all as read', { description: getErrorMessage(err) }),
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <NotificationHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={unreadCount}
        onMarkAllRead={() => markAllRead.mutate()}
        markAllPending={markAllRead.isPending}
      />

      <NotificationFilters filter={filter} onChange={setFilter} counts={counts} />

      <NotificationList
        notifications={visible}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        onRetry={() => refetch()}
        onSelect={setSelected}
        onMarkRead={(id) => markRead.mutate(id)}
        selectedId={selected?.id}
      />

      <NotificationDetails
        notification={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}