import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  NotificationHeader,
  NotificationFilters,
  NotificationList,
  NotificationDetails,
} from '@/components/notifications'
import { sharedApi } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import type { Notification, NotificationFilter, NotificationType } from '@/types/shared'
import { NOTIFICATION_FILTERS } from '@/components/notifications/helpers'
import { KpiCard } from '@/components/ui/kpi-card'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle2, ShieldAlert, Sparkles, Mail, MessageSquare, Smartphone, Save } from 'lucide-react'

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
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [selected, setSelected] = React.useState<Notification | null>(null)
  const [channelsOpen, setChannelsOpen] = React.useState(false)

  // Channel toggles
  const [channels, setChannels] = React.useState({
    emailApprovals: true,
    emailDeals: true,
    emailBilling: true,
    emailSystem: false,
    slackUrgent: true,
    slackGeneral: false,
    pushHighPriority: true,
    inAppSound: true,
  })

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

  const visible = React.useMemo(() => {
    return notifications.filter((n) => {
      const matchCat = matchesFilter(n, filter)
      const matchQ = matchesSearch(n, debouncedSearch)
      const matchP = priorityFilter === 'all' ? true : n.priority === priorityFilter
      return matchCat && matchQ && matchP
    })
  }, [notifications, filter, debouncedSearch, priorityFilter])

  const markRead = useMutation({
    mutationFn: (id: string) => sharedApi.markNotificationRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
        (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      toast.success('Marked as read')
    },
    onError: (err) => toast.error('Unable to mark as read', { description: getErrorMessage(err) }),
  })

  const toggleRead = (id: string, currentRead: boolean) => {
    queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
      (prev ?? []).map((n) => (n.id === id ? { ...n, read: !currentRead } : n))
    )
    toast.success(currentRead ? 'Marked as unread' : 'Marked as read')
  }

  const deleteNotification = (id: string) => {
    queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
      (prev ?? []).filter((n) => n.id !== id)
    )
    if (selected?.id === id) {
      setSelected(null)
    }
    toast.success('Notification dismissed')
  }

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

  const handleClearRead = () => {
    const readCount = notifications.filter((n) => n.read).length
    if (readCount === 0) return
    queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
      (prev ?? []).filter((n) => !n.read)
    )
    if (selected?.read) {
      setSelected(null)
    }
    toast.success(`Cleared ${readCount} read notification${readCount > 1 ? 's' : ''}`)
  }

  const handleSaveChannels = () => {
    setChannelsOpen(false)
    toast.success('Notification channel settings saved successfully')
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const readCount = notifications.filter((n) => n.read).length
  const highPriorityCount = notifications.filter((n) => n.priority === 'high').length
  const approvalCount = notifications.filter((n) => n.type === 'approval').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <NotificationHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={unreadCount}
        hasReadCount={readCount}
        onMarkAllRead={() => markAllRead.mutate()}
        onClearRead={handleClearRead}
        onOpenPreferences={() => setChannelsOpen(true)}
        markAllPending={markAllRead.isPending}
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Total Notifications"
          value={notifications.length}
          icon={<Bell className="h-5 w-5" />}
          description="In-app alerts & updates"
        />
        <div
          className="cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
          role="button"
          tabIndex={0}
        >
          <KpiCard
            label="Unread Alerts"
            value={unreadCount}
            variant={unreadCount > 0 ? 'info' : 'default'}
            icon={<Sparkles className="h-5 w-5" />}
            description={filter === 'unread' ? 'Active filter (Click to reset)' : 'Click to filter unread'}
          />
        </div>
        <div
          className="cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => setPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
          role="button"
          tabIndex={0}
        >
          <KpiCard
            label="Urgent & Critical"
            value={highPriorityCount}
            variant={highPriorityCount > 0 ? 'warning' : 'default'}
            icon={<ShieldAlert className="h-5 w-5" />}
            description={priorityFilter === 'high' ? 'Active filter (Click to reset)' : 'Action required immediately'}
          />
        </div>
        <div
          className="cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => setFilter(filter === 'approval' ? 'all' : 'approval')}
          role="button"
          tabIndex={0}
        >
          <KpiCard
            label="Pending Approvals"
            value={approvalCount}
            variant={approvalCount > 0 ? 'info' : 'default'}
            icon={<CheckCircle2 className="h-5 w-5" />}
            description="Commercial & risk reviews"
          />
        </div>
      </div>

      {/* Filter Tabs & Sub-filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card border border-border p-2 rounded-xl">
        <NotificationFilters filter={filter} onChange={setFilter} counts={counts} />

        <div className="flex items-center gap-1.5 px-2">
          <span className="text-caption text-muted-foreground hidden sm:inline">Priority:</span>
          {(['all', 'high', 'normal', 'low'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-caption font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                priorityFilter === p
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {p === 'high' ? 'Urgent' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <NotificationList
        notifications={visible}
        isLoading={isLoading}
        error={error ? getErrorMessage(error) : null}
        onRetry={() => refetch()}
        onSelect={setSelected}
        onMarkRead={(id) => markRead.mutate(id)}
        onToggleRead={toggleRead}
        onDelete={deleteNotification}
        selectedId={selected?.id}
      />

      {/* Notification Details Drawer */}
      <NotificationDetails
        notification={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onToggleRead={toggleRead}
        onDelete={deleteNotification}
      />

      {/* Notification Channel Preferences Drawer */}
      <Drawer
        open={channelsOpen}
        onClose={() => setChannelsOpen(false)}
        title="Notification Channel Preferences"
        description="Choose how and where you receive commercial alerts and platform events."
        side="right"
      >
        <div className="space-y-6">
          {/* Email Settings */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-small text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email Notifications</span>
            </div>
            <p className="text-caption text-muted-foreground">
              Direct email summaries sent to your primary inbox.
            </p>
            <div className="space-y-2 pt-2 text-small">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Quotation Approvals & Breaches</span>
                <input
                  type="checkbox"
                  checked={channels.emailApprovals}
                  onChange={(e) => setChannels({ ...channels, emailApprovals: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Deal Stage Movements</span>
                <input
                  type="checkbox"
                  checked={channels.emailDeals}
                  onChange={(e) => setChannels({ ...channels, emailDeals: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Invoicing & Captured Payments</span>
                <input
                  type="checkbox"
                  checked={channels.emailBilling}
                  onChange={(e) => setChannels({ ...channels, emailBilling: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Slack & Webhook Settings */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-small text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Slack & Connected Webhooks</span>
            </div>
            <p className="text-caption text-muted-foreground">
              Broadcast high-priority alerts to #sales-ops and #deal-desk channels.
            </p>
            <div className="space-y-2 pt-2 text-small">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Urgent Breaches & Risk Flags</span>
                <input
                  type="checkbox"
                  checked={channels.slackUrgent}
                  onChange={(e) => setChannels({ ...channels, slackUrgent: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Daily Digest & Activity</span>
                <input
                  type="checkbox"
                  checked={channels.slackGeneral}
                  onChange={(e) => setChannels({ ...channels, slackGeneral: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* In-App & Mobile Push */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-small text-foreground">
              <Smartphone className="h-4 w-4 text-primary" />
              <span>In-App & Mobile Audio Alerts</span>
            </div>
            <div className="space-y-2 pt-2 text-small">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Push Critical Notifications</span>
                <input
                  type="checkbox"
                  checked={channels.pushHighPriority}
                  onChange={(e) => setChannels({ ...channels, pushHighPriority: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-foreground">Audible Bell on Live Ping</span>
                <input
                  type="checkbox"
                  checked={channels.inAppSound}
                  onChange={(e) => setChannels({ ...channels, inAppSound: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            </div>
          </div>

          <Button onClick={handleSaveChannels} className="w-full gap-2">
            <Save className="h-4 w-4" />
            <span>Save Channel Preferences</span>
          </Button>
        </div>
      </Drawer>
    </div>
  )
}
