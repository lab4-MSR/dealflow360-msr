import { Inbox } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState, LoadingState } from '@/components/shared'
import type { Notification } from '@/types/shared'
import { NotificationItem } from './NotificationItem'

interface NotificationListProps {
  notifications: Notification[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onSelect: (notification: Notification) => void
  onMarkRead: (id: string) => void
  onToggleRead?: (id: string, currentRead: boolean) => void
  onDelete?: (id: string) => void
  selectedId?: string
}

export function NotificationList({
  notifications,
  isLoading,
  error,
  onRetry,
  onSelect,
  onMarkRead,
  onToggleRead,
  onDelete,
  selectedId,
}: NotificationListProps) {
  if (isLoading) {
    return <LoadingState type="cards" rows={5} />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load notifications"
        description={error}
        onRetry={onRetry}
      />
    )
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-8 w-8" />}
        title="No notifications found"
        description="There are no notifications in this view. Try a different filter or search."
      />
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          selected={n.id === selectedId}
          onSelect={onSelect}
          onMarkRead={onMarkRead}
          onToggleRead={onToggleRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}