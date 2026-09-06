import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plug,
  KeyRound,
  Webhook,
  ShieldCheck,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Send,
  ExternalLink,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface ConnectedApp {
  id: string
  name: string
  category: string
  description: string
  connected: boolean
  lastSync?: string
  badgeText?: string
}

interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  fullKey?: string
  scopes: string[]
  created: string
  lastUsed: string
}

interface WebhookItem {
  id: string
  url: string
  events: string[]
  active: boolean
  lastDelivered?: string
}

const INITIAL_APPS: ConnectedApp[] = [
  {
    id: 'slack',
    name: 'Slack Notifications',
    category: 'Communication',
    description: 'Instant deal margin alerts, approval pings, and escalation notices in Slack channels.',
    connected: true,
    lastSync: '5 mins ago',
    badgeText: 'Active',
  },
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    category: 'CRM & Pipeline',
    description: 'Bi-directional sync of customer contacts, opportunities, and deal closure telemetry.',
    connected: true,
    lastSync: '12 mins ago',
    badgeText: 'Synced',
  },
  {
    id: 'razorpay',
    name: 'Razorpay / Stripe Payments',
    category: 'Billing & Gateway',
    description: 'Automated invoice payment capture, subscription recurring charges, and dunning.',
    connected: true,
    lastSync: 'Real-time Webhook',
    badgeText: 'Live Mode',
  },
  {
    id: 'bluedart',
    name: 'BlueDart Logistics API',
    category: 'Fulfillment & Freight',
    description: 'Airway bill generation, consignment tracking numbers, and automated delivery status.',
    connected: true,
    lastSync: '1 hour ago',
    badgeText: 'API Connected',
  },
  {
    id: 'google',
    name: 'Google Workspace',
    category: 'Productivity',
    description: 'Single sign-on via Google OAuth, quotation PDF export to Google Drive, and Gmail syncing.',
    connected: false,
    badgeText: 'Available',
  },
  {
    id: 'office365',
    name: 'Microsoft 365',
    category: 'Productivity',
    description: 'Outlook calendar scheduling for sales reviews and OneDrive proposal archival.',
    connected: false,
    badgeText: 'Available',
  },
]

const INITIAL_KEYS: ApiKeyItem[] = [
  {
    id: 'key-1',
    name: 'Production Primary Server Key',
    keyPrefix: 'df360_live_8f7b••••••••291e',
    fullKey: 'df360_live_8f7b9201824765912830291e',
    scopes: ['deals:read', 'deals:write', 'quotes:read', 'quotes:write', 'customers:read'],
    created: '14 days ago',
    lastUsed: '4 minutes ago',
  },
  {
    id: 'key-2',
    name: 'Fulfillment Dispatch Webhook Key',
    keyPrefix: 'df360_live_4a1c••••••••773a',
    fullKey: 'df360_live_4a1c0982341276541908773a',
    scopes: ['shipments:read', 'shipments:write', 'inventory:read'],
    created: '2 months ago',
    lastUsed: '1 hour ago',
  },
]

const INITIAL_WEBHOOKS: WebhookItem[] = [
  {
    id: 'wh-1',
    url: 'https://api.dealflow360.com/integrations/deals-stream',
    events: ['deal.created', 'deal.won', 'deal.lost'],
    active: true,
    lastDelivered: '2 minutes ago',
  },
  {
    id: 'wh-2',
    url: 'https://erp.internal.acme.com/v1/invoices/reconciliation',
    events: ['invoice.created', 'invoice.paid'],
    active: true,
    lastDelivered: '45 minutes ago',
  },
]

export function IntegrationSettings() {
  const [apps, setApps] = React.useState<ConnectedApp[]>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_connected_apps')
      return stored ? JSON.parse(stored) : INITIAL_APPS
    } catch {
      return INITIAL_APPS
    }
  })

  const [keys, setKeys] = React.useState<ApiKeyItem[]>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_api_keys')
      return stored ? JSON.parse(stored) : INITIAL_KEYS
    } catch {
      return INITIAL_KEYS
    }
  })

  const [webhooks, setWebhooks] = React.useState<WebhookItem[]>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_webhooks')
      return stored ? JSON.parse(stored) : INITIAL_WEBHOOKS
    } catch {
      return INITIAL_WEBHOOKS
    }
  })

  const [syncingApp, setSyncingApp] = React.useState<string | null>(null)
  const [testingWebhook, setTestingWebhook] = React.useState<string | null>(null)

  // API Key Dialog
  const [newKeyDialogOpen, setNewKeyDialogOpen] = React.useState(false)
  const [keyName, setKeyName] = React.useState('')
  const [keyExpiry, setKeyExpiry] = React.useState('90')

  // Webhook Dialog
  const [newWebhookDialogOpen, setNewWebhookDialogOpen] = React.useState(false)
  const [webhookUrl, setWebhookUrl] = React.useState('')
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([
    'deal.created',
    'deal.won',
  ])

  const saveApps = (next: ConnectedApp[]) => {
    setApps(next)
    try {
      localStorage.setItem('dealflow360_connected_apps', JSON.stringify(next))
    } catch {}
  }

  const saveKeys = (next: ApiKeyItem[]) => {
    setKeys(next)
    try {
      localStorage.setItem('dealflow360_api_keys', JSON.stringify(next))
    } catch {}
  }

  const saveWebhooks = (next: WebhookItem[]) => {
    setWebhooks(next)
    try {
      localStorage.setItem('dealflow360_webhooks', JSON.stringify(next))
    } catch {}
  }

  const handleToggleApp = (app: ConnectedApp) => {
    const updated = apps.map((a) => {
      if (a.id === app.id) {
        const nextConnected = !a.connected
        return {
          ...a,
          connected: nextConnected,
          badgeText: nextConnected ? 'Active' : 'Available',
          lastSync: nextConnected ? 'Just now' : undefined,
        }
      }
      return a
    })
    saveApps(updated)
    if (!app.connected) {
      toast.success(`${app.name} connected successfully`, {
        description: 'Authentication tokens verified and webhook synchronizer started.',
      })
    } else {
      toast.info(`${app.name} disconnected`, {
        description: 'Sync pipeline paused and API access revoked.',
      })
    }
  }

  const handleSyncApp = (app: ConnectedApp) => {
    setSyncingApp(app.id)
    setTimeout(() => {
      setSyncingApp(null)
      const updated = apps.map((a) =>
        a.id === app.id ? { ...a, lastSync: 'Just now' } : a
      )
      saveApps(updated)
      toast.success(`${app.name} sync complete`, {
        description: 'All upstream records and event states are fully up-to-date.',
      })
    }, 800)
  }

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast.error('Please enter a descriptive key name.')
      return
    }
    const randPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    const newFullKey = `df360_live_${randPart}`
    const prefix = `df360_live_${randPart.slice(0, 4)}••••••••${randPart.slice(-4)}`

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: keyName.trim(),
      keyPrefix: prefix,
      fullKey: newFullKey,
      scopes: ['deals:read', 'deals:write', 'quotes:read'],
      created: 'Just now',
      lastUsed: 'Never',
    }

    const updated = [newKey, ...keys]
    saveKeys(updated)
    setNewKeyDialogOpen(false)
    setKeyName('')

    try {
      navigator.clipboard.writeText(newFullKey)
    } catch {}

    toast.success('API Key generated successfully', {
      description: 'The secret key has been copied to your clipboard.',
    })
  }

  const handleCopyKey = (key: ApiKeyItem) => {
    const textToCopy = key.fullKey || key.keyPrefix
    try {
      navigator.clipboard.writeText(textToCopy)
      toast.success('API Key copied to clipboard')
    } catch {
      toast.info(`Key: ${textToCopy}`)
    }
  }

  const handleRevokeKey = (keyId: string) => {
    const updated = keys.filter((k) => k.id !== keyId)
    saveKeys(updated)
    toast.success('API key revoked', {
      description: 'Incoming requests using this token will now be rejected.',
    })
  }

  const handleAddWebhook = () => {
    if (!webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      toast.error('Please enter a valid HTTP or HTTPS webhook URL.')
      return
    }
    const newWh: WebhookItem = {
      id: `wh-${Date.now()}`,
      url: webhookUrl.trim(),
      events: selectedEvents.length > 0 ? selectedEvents : ['deal.created'],
      active: true,
      lastDelivered: 'Never',
    }
    const updated = [newWh, ...webhooks]
    saveWebhooks(updated)
    setNewWebhookDialogOpen(false)
    setWebhookUrl('')
    toast.success('Webhook endpoint registered', {
      description: 'Event notifications will be dispatched to this destination.',
    })
  }

  const handleTestWebhook = (wh: WebhookItem) => {
    setTestingWebhook(wh.id)
    setTimeout(() => {
      setTestingWebhook(null)
      toast.success('Webhook ping delivered (HTTP 200 OK)', {
        description: `Delivered test event to ${wh.url} in 142ms.`,
      })
    }, 700)
  }

  const handleToggleWebhook = (wh: WebhookItem) => {
    const updated = webhooks.map((item) =>
      item.id === wh.id ? { ...item, active: !item.active } : item
    )
    saveWebhooks(updated)
    toast.info(`Webhook ${wh.active ? 'paused' : 'activated'}`)
  }

  const handleDeleteWebhook = (whId: string) => {
    const updated = webhooks.filter((w) => w.id !== whId)
    saveWebhooks(updated)
    toast.success('Webhook endpoint removed')
  }

  return (
    <div className="space-y-6">
      {/* Connected Services */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" aria-hidden />
              Connected Services
            </CardTitle>
            <CardDescription>
              Enterprise integrations connected to your DealFlow360 workspace.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-normal shrink-0">
            {apps.filter((a) => a.connected).length} Connected
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {app.name}
                        {app.connected && (
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {app.category}
                      </span>
                    </div>
                    <Badge
                      variant={app.connected ? 'success' : 'secondary'}
                      className="text-[11px] shrink-0"
                    >
                      {app.badgeText}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {app.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    {app.lastSync ? `Sync: ${app.lastSync}` : 'Not connected'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {app.connected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSyncApp(app)}
                        loading={syncingApp === app.id}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Trigger manual synchronization"
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Sync
                      </Button>
                    )}
                    <Button
                      variant={app.connected ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleApp(app)}
                      className="h-7 px-2.5 text-xs cursor-pointer"
                    >
                      {app.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" aria-hidden />
              API Access Keys
            </CardTitle>
            <CardDescription>
              Programmatic secret tokens for REST API authentication and CRM pipelines.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setNewKeyDialogOpen(true)}
            className="cursor-pointer gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Generate New Key
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-3 text-body-small text-muted-foreground border border-border/60">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" aria-hidden />
            <span>
              Keys are encrypted at rest with AES-256 and verified through HMAC signature validation.
            </span>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{k.name}</p>
                    <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
                      Live
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-foreground">
                      {k.keyPrefix}
                    </code>
                    <span>· Created {k.created}</span>
                    <span>· Last used {k.lastUsed}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {k.scopes.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyKey(k)}
                    className="h-8 text-xs cursor-pointer gap-1"
                    title="Copy API Key"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeKey(k.id)}
                    className="h-8 text-xs text-danger hover:bg-danger/10 hover:text-danger cursor-pointer"
                    title="Revoke API Key"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-4 w-4 text-primary" aria-hidden />
              Outgoing Webhooks
            </CardTitle>
            <CardDescription>
              Real-time HTTP POST notifications dispatched on deal milestones and financial events.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setNewWebhookDialogOpen(true)}
            className="cursor-pointer gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Webhook
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-mono font-medium text-foreground truncate max-w-[340px] sm:max-w-md">
                      {wh.url}
                    </p>
                    <Badge variant={wh.active ? 'success' : 'secondary'} className="text-[10px] shrink-0">
                      {wh.active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map((e) => (
                      <span
                        key={e}
                        className="inline-flex items-center rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-secondary-foreground"
                      >
                        {e}
                      </span>
                    ))}
                    {wh.lastDelivered && (
                      <span className="text-[11px] text-muted-foreground ml-2">
                        Last ping: {wh.lastDelivered}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(wh)}
                    loading={testingWebhook === wh.id}
                    className="h-8 text-xs cursor-pointer gap-1"
                    title="Send test ping"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Test Ping
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleWebhook(wh)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {wh.active ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebhook(wh.id)}
                    className="h-8 text-xs text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Key Modal */}
      <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a secured secret token for integrating with DealFlow360 services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name / Description</Label>
              <Input
                id="key-name"
                placeholder="e.g. Zapier Automated Sync"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-expiry">Expiration</Label>
              <select
                id="key-expiry"
                value={keyExpiry}
                onChange={(e) => setKeyExpiry(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="30">30 Days</option>
                <option value="90">90 Days (Recommended)</option>
                <option value="365">1 Year</option>
                <option value="never">No Expiration</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey}>Generate & Copy Key</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Modal */}
      <Dialog open={newWebhookDialogOpen} onOpenChange={setNewWebhookDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook Endpoint</DialogTitle>
            <DialogDescription>
              Register an HTTPS endpoint to receive JSON webhooks when deals or invoices change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wh-url">Endpoint URL</Label>
              <Input
                id="wh-url"
                placeholder="https://api.yourdomain.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger Events</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'deal.created',
                  'deal.won',
                  'deal.lost',
                  'quote.approved',
                  'invoice.created',
                  'invoice.paid',
                  'shipment.dispatched',
                ].map((ev) => {
                  const checked = selectedEvents.includes(ev)
                  return (
                    <label
                      key={ev}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer hover:bg-muted/40"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (checked) {
                            setSelectedEvents(selectedEvents.filter((e) => e !== ev))
                          } else {
                            setSelectedEvents([...selectedEvents, ev])
                          }
                        }}
                        className="rounded"
                      />
                      <span className="font-mono text-[11px]">{ev}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setNewWebhookDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWebhook}>Register Webhook</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}