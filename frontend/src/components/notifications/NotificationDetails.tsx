import { useNavigate } from 'react-router-dom'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { Notification } from '@/types/shared'
import { NOTIFICATION_CATEGORY_LABELS, NOTIFICATION_PRIORITY_LABELS, NOTIFICATION_PRIORITY_VARIANT } from '@/constants/shared'
import { fullTimestamp } from '@/lib/dates'
import { categoryIcon, relatedRecordUrl } from './helpers'

interface NotificationDetailsProps {
  notification: Notification | null
  open: boolean
  onClose: () => void
}

export function NotificationDetails({ notification, open, onClose }: NotificationDetailsProps) {
  const navigate = useNavigate()

  const Icon = notification ? categoryIcon(notification.type) : null
  const url = notification ? relatedRecordUrl(notification.related_record) : undefined

  const handleOpenRecord = () => {
    if (!url) return
    onClose()
    navigate(url)
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

        {/* Action */}
        {url && (
          <Button variant="default" className="w-full" onClick={handleOpenRecord}>
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open Record
          </Button>
        )}
      </div>
    </Drawer>
  )
}