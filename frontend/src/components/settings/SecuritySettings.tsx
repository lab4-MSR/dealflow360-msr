import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { KeyRound, LogIn, Lock, ShieldCheck, Monitor, ShieldOff } from 'lucide-react'
import type { ActiveSession } from '@/types/shared'
import { formatRelativeTime } from '@/lib/dates'

interface SecuritySettingsProps {
  sessions: ActiveSession[]
  sessionsLoading: boolean
  onChangePassword: () => void
  onRevokeSession: (id: string) => Promise<void>
}

export function SecuritySettings({
  sessions,
  sessionsLoading,
  onChangePassword,
  onRevokeSession,
}: SecuritySettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden />
            Password
          </CardTitle>
          <CardDescription>Change the password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={onChangePassword}>
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" aria-hidden />
            Sessions
          </CardTitle>
          <CardDescription>Manage the devices signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={<ShieldOff className="h-6 w-6" />}
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
                      {session.current && <Badge variant="secondary" className="ml-2">Current</Badge>}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {[session.location, session.ip].filter(Boolean).join(' · ') || 'Location unknown'} · {formatRelativeTime(session.last_active)}
                    </p>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onRevokeSession(session.id)}>
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Login Security
          </CardTitle>
          <CardDescription>Settings around how you sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <InfoRow icon={<LogIn className="h-4 w-4" />} label="Multi-factor authentication" value="Not configured" />
            <InfoRow icon={<ShieldCheck className="h-4 w-4" />} label="Session timeout" value="Standard (8h)" />
            <InfoRow icon={<Lock className="h-4 w-4" />} label="Authentication method" value="Email & password" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-surface px-4 py-3">
      <span className="flex items-center gap-3 text-body-small text-muted-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      <span className="text-body-small font-medium text-foreground">{value}</span>
    </div>
  )
}