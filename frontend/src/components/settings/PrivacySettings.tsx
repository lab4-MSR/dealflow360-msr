import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Download, Lock, Clock } from 'lucide-react'

export function PrivacySettings() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" aria-hidden />
            Data Export
          </CardTitle>
          <CardDescription>Export your data. Processing states are shown when an export job exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Download className="h-6 w-6" />}
            title="No data exports"
            description="Exports generated through the supported modules will appear here with their current status."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Privacy
          </CardTitle>
          <CardDescription>Privacy controls for your account and workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-3 text-body-small text-muted-foreground">
            <Lock className="h-4 w-4" aria-hidden />
            Access to your data is governed by your role and the workspace security settings.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            Data Retention
          </CardTitle>
          <CardDescription>Retention policy applied to workspace data.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Clock className="h-6 w-6" />}
            title="Retention policy not configured"
            description="A retention policy configured by your administrator will appear here."
          />
        </CardContent>
      </Card>
    </div>
  )
}