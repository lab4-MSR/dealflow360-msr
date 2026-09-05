import { useNavigate } from 'react-router-dom'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Check, CheckCheck, Trash2 } from 'lucide-react'
import type { Notification } from '@/types/shared'
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_PRIORITY_LABELS, NOTIFICATION_PRIORITY_VARIANT } from '@/constants/shared'
import { fullTimestamp } from '@/lib/dates'
import { categoryIcon, relatedRecordUrl } from './helpers'

interface NotificationDetailsProps {
  notification: Notification | null
  open: boolean
  onClose: () => void
  onToggleRead?: (id: string, currentRead: boolean) => void
  onDelete?: (id: string) => void
}

export function NotificationDetails({
  notification,
  open,
  onClose,
  onToggleRead,
  onDelete,
}: NotificationDetailsProps) {
  const navigate = useNavigate()

  const Icon = notification ? categoryIcon(notification.type) : null
  const url = notification ? relatedRecordUrl(notification.related_record) : undefined

  const handleOpenRecord = () => {
    if (!url) return
    onClose()
    navigate(url)
  }

  const handleToggle = () => {
    if (!notification) return
    onToggleRead?.(notification.id, notification.read)
  }

  const handleDelete = () => {
    if (!notification) return
    onDelete?.(notification.id)
    onClose()
  }

  if (!notification) return null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notification Details"
      description="Full details for the selected notification"
      side="right"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
            {Icon && <Icon className="h-5 w-5" aria-hidden />}
          </div>
          <div className="min-w-0">
            <h3 className="text-h4 font-semibold text-foreground">{notification.title}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-caption font-medium text-muted-foreground">
                {NOTIFICATION_CATEGORY_LABELS[notification.type] ?? notification.type}
              </span>
              <Badge variant={notification.read ? 'secondary' : 'default'}>
                {notification.read ? 'Read' : 'Unread'}
              </Badge>
              {notification.priority && (
                <Badge variant={NOTIFICATION_PRIORITY_VARIANT[notification.priority] ?? 'secondary'}>
                  {NOTIFICATION_PRIORITY_LABELS[notification.priority] ?? notification.priority} priority
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="text-label font-medium text-muted-foreground mb-2">Message</h4>
          <p className="text-body text-foreground whitespace-pre-wrap">
            {notification.message || 'No message provided.'}
          </p>
        </section>

        {/* Related record */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="text-label font-medium text-muted-foreground mb-2">Related Record</h4>
          {notification.related_record?.type ? (
            <div className="flex items-center gap-2 text-body text-foreground">
              <span className="capitalize text-muted-foreground">{notification.related_record.type}</span>
              <span className="font-medium tabular-nums">{notification.related_record.id}</span>
              {url && (
                <Button variant="ghost" size="sm" onClick={handleOpenRecord} className="ml-auto">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Open Record
                </Button>
              )}
            </div>
          ) : (
            <p className="text-body-small text-muted-foreground">No related record attached.</p>
          )}
        </section>

        {/* Timestamp */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <h4 className="text-label font-medium text-muted-foreground mb-2">Timestamp</h4>
          <p className="text-body text-foreground">{fullTimestamp(notification.created_at)}</p>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {url && (
            <Button variant="default" className="w-full gap-2" onClick={handleOpenRecord}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span>Navigate to Record</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleToggle}
            >
              {notification.read ? <Check className="h-4 w-4" /> : <CheckCheck className="h-4 w-4 text-primary" />}
              <span>{notification.read ? 'Mark Unread' : 'Mark Read'}</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-danger hover:bg-danger/10 border-danger/30"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span>Dismiss</span>
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}