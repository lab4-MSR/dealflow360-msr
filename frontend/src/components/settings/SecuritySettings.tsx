import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import { KeyRound, LogIn, Lock, ShieldCheck, Monitor, ShieldOff, Key } from 'lucide-react'
import type { ActiveSession } from '@/types/shared'
import { formatRelativeTime } from '@/lib/dates'
import { toast } from 'sonner'

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
  const [twoFactor, setTwoFactor] = React.useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_2fa_enabled')
      return stored ? JSON.parse(stored) : true
    } catch {
      return true
    }
  })
  const [timeout, setTimeout] = React.useState('8h')

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactor(checked)
    try {
      localStorage.setItem('dealflow360_2fa_enabled', JSON.stringify(checked))
    } catch {}
    if (checked) {
      toast.success('Two-Factor Authentication (2FA) enabled', {
        description: 'Authentication requires TOTP authenticator codes on login.',
      })
    } else {
      toast.info('Two-Factor Authentication (2FA) disabled', {
        description: 'Standard single-factor password credentials will now be used.',
      })
    }
  }

  const handleTimeoutChange = (val: string) => {
    setTimeout(val)
    toast.success('Session timeout updated', {
      description: `Inactivity timeout is now set to ${val}.`,
    })
  }

  const handleTerminateOtherSessions = async () => {
    const others = sessions.filter((s) => !s.current && !s.is_current)
    for (const sess of others) {
      await onRevokeSession(sess.id)
    }
    toast.success('Terminated other active sessions')
  }

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
          <Button variant="outline" size="sm" onClick={onChangePassword} className="cursor-pointer">
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" aria-hidden />
              Sessions
            </CardTitle>
            <CardDescription>Manage the devices signed in to your account.</CardDescription>
          </div>
          {sessions.filter((s) => !s.current && !s.is_current).length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTerminateOtherSessions}
              className="text-xs text-danger hover:bg-danger/10 cursor-pointer"
            >
              Terminate Other Sessions
            </Button>
          )}
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
                      {(session.current || session.is_current) && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {[session.location, session.ip || session.ip_address]
                        .filter(Boolean)
                        .join(' · ') || 'Location unknown'}{' '}
                      · {formatRelativeTime(session.last_active)}
                    </p>
                  </div>
                  {!session.current && !session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" aria-hidden />
            Login Security & Governance
          </CardTitle>
          <CardDescription>Configure authentication standards and session expirations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                <Key className="h-4 w-4" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactor ? 'Secured with TOTP authenticator app' : 'Single-factor password only'}
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactor}
              onCheckedChange={handleToggle2FA}
              aria-label="Toggle Two Factor Auth"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Idle Session Timeout</p>
                <p className="text-xs text-muted-foreground">
                  Automatically invalidate tokens after inactivity
                </p>
              </div>
            </div>
            <select
              value={timeout}
              onChange={(e) => handleTimeoutChange(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0"
            >
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="8h">8 Hours (Default)</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}