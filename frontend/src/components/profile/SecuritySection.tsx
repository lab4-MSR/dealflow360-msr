import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Monitor, Smartphone, KeyRound, Radio, MonitorX } from 'lucide-react'
import type { ActiveSession, LoginActivity } from '@/types/shared'
import { formatInTimezone, formatRelativeTime } from '@/lib/dates'
import { ChangePasswordDialog } from './ChangePasswordDialog'

interface SecuritySectionProps {
  sessions: ActiveSession[]
  sessionsLoading: boolean
  loginActivity: LoginActivity[]
  activityLoading: boolean
  onChangePassword: (current: string, next: string) => Promise<void>
  onRevokeSession: (id: string) => Promise<void>
}

export function SecuritySection({
  sessions,
  sessionsLoading,
  loginActivity,
  activityLoading,
  onChangePassword,
  onRevokeSession,
}: SecuritySectionProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden />
            Change Password
          </CardTitle>
          <CardDescription>Use the secure password flow to update your credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" aria-hidden />
            Active Sessions
          </CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-muted" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={<MonitorX className="h-6 w-6" />}
              title="No active sessions"
              description="There are no active sessions to display."
            />
          ) : (
            <ul className="divide-y divide-border">
              {sessions.map((session) => (
                <li key={session.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                    <Monitor className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-foreground">
                      {session.device || session.browser || 'Device'}
                      {session.current && (
                        <Badge variant="secondary" className="ml-2">Current</Badge>
                      )}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {[session.location, session.ip].filter(Boolean).join(' · ') || 'Location unknown'} · Last active {formatRelativeTime(session.last_active)}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
{/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" aria-hidden />
            Login Activity
          </CardTitle>
          <CardDescription>Recent sign-in events from your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
              ))}
            </div>
          ) : loginActivity.length === 0 ? (
            <EmptyState
              icon={<Radio className="h-6 w-6" />}
              title="No login activity"
              description="There are no recent login events to display."
            />
          ) : (
            <ul className="divide-y divide-border">
              {loginActivity.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 py-3">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-foreground">
                      {entry.location || 'New sign-in'}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {[entry.ip, entry.user_agent].filter(Boolean).join(' · ') || 'Device details unavailable'}
                    </p>
                  </div>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {formatInTimezone(entry.timestamp, 'UTC', 'MM/dd/yyyy')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (current, next) => {
          await onChangePassword(current, next)
          setDialogOpen(false)
        }}
      />
    </div>
  )
}