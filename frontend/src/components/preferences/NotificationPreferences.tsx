import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Bell } from 'lucide-react'
import type { NotificationChannelPreferences } from '@/types/shared'

interface ChannelRow {
  key: keyof NotificationChannelPreferences
  title: string
  description: string
}

const CHANNEL_ROWS: ChannelRow[] = [
  { key: 'email', title: 'Email notifications', description: 'Receive updates by email.' },
  { key: 'in_app', title: 'In-app notifications', description: 'Show updates in your notification center.' },
  { key: 'approval', title: 'Approval alerts', description: 'When an approval requires your action.' },
  { key: 'deal', title: 'Deal alerts', description: 'When deals change or need attention.' },
  { key: 'billing', title: 'Billing alerts', description: 'Invoices, payments and billing updates.' },
]

interface NotificationPreferencesProps {
  channels: NotificationChannelPreferences
  onChange: (channels: NotificationChannelPreferences) => void
}

export function NotificationPreferences({ channels, onChange }: NotificationPreferencesProps) {
  const update = (key: keyof NotificationChannelPreferences, checked: boolean) => {
    onChange({ ...channels, [key]: checked })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" aria-hidden />
          Notifications
        </CardTitle>
        <CardDescription>Choose which notifications you want to receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {CHANNEL_ROWS.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="text-body font-medium text-foreground">{row.title}</p>
                <p className="text-caption text-muted-foreground">{row.description}</p>
              </div>
              <Switch
                checked={channels[row.key] ?? true}
                onCheckedChange={(checked) => update(row.key, checked)}
                aria-label={row.title}
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}