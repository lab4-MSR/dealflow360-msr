import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { BellRing } from 'lucide-react'
import type { NotificationChannelPreferences } from '@/types/shared'

interface NotificationSettingsProps {
  channels: NotificationChannelPreferences
  onChange: (channels: NotificationChannelPreferences) => void
}

export function NotificationSettings({ channels, onChange }: NotificationSettingsProps) {
  const update = (key: keyof NotificationChannelPreferences, checked: boolean) => {
    onChange({ ...channels, [key]: checked })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" aria-hidden />
          Notifications
        </CardTitle>
        <CardDescription>Default notification channels. Advanced prefs live in your Preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-body font-medium text-foreground">Email Notifications</p>
            <p className="text-caption text-muted-foreground">Send email for notification events.</p>
          </div>
          <Switch
            checked={channels.email}
            onCheckedChange={(v) => update('email', v)}
            aria-label="Email notifications"
          />
        </div>
        <div className="flex items-center justify-between gap-4 py-3 border-t border-border">
          <div>
            <p className="text-body font-medium text-foreground">In-App Notifications</p>
            <p className="text-caption text-muted-foreground">Show notifications in the app.</p>
          </div>
          <Switch
            checked={channels.in_app}
            onCheckedChange={(v) => update('in_app', v)}
            aria-label="In-app notifications"
          />
        </div>
        <p className="pt-3 text-caption text-muted-foreground border-t border-border">
          Manage approval, deal and billing alert preferences in{' '}
          <span className="font-medium text-foreground">Preferences → Notifications</span>. Both views use the same source.
        </p>
      </CardContent>
    </Card>
  )
}