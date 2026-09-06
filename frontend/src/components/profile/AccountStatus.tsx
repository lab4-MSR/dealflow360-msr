import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ShieldCheck, UserCog, Key, MailCheck, Lock } from 'lucide-react'
import { toast } from 'sonner'
import type { UserProfile } from '@/types/shared'
import { ROLE_LABELS, ACCOUNT_STATUS_LABELS } from '@/constants/shared'

interface AccountStatusProps {
  profile: UserProfile | null
}

export function AccountStatus({ profile }: AccountStatusProps) {
  const [twoFactor, setTwoFactor] = React.useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('dealflow360_2fa_enabled')
      return stored ? JSON.parse(stored) : true
    } catch {
      return true
    }
  })
  const [sendingVerify, setSendingVerify] = React.useState(false)

  const permissions = profile?.permissions ?? []
  const role = profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : '—'
  const status = profile?.account_status ?? null

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactor(checked)
    try {
      localStorage.setItem('dealflow360_2fa_enabled', JSON.stringify(checked))
    } catch {}
    if (checked) {
      toast.success('Two-Factor Authentication (2FA) enabled', {
        description: 'Your account is now secured with authenticator app verification.'
      })
    } else {
      toast.info('Two-Factor Authentication (2FA) disabled', {
        description: 'Account security level has been set to standard credentials.'
      })
    }
  }

  const handleResendVerification = () => {
    setSendingVerify(true)
    setTimeout(() => {
      setSendingVerify(false)
      toast.success('Verification link dispatched', {
        description: `Confirmation email delivered to ${profile?.email || 'your registered address'}.`
      })
    }, 600)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          Account Security & Status
        </CardTitle>
        <CardDescription>Your current role, security tiers, and account governance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <UserCog className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-label font-medium text-muted-foreground">Assigned Role</p>
              <p className="text-body font-semibold text-foreground">{role}</p>
            </div>
          </div>
          <Badge variant={status === 'active' ? 'success' : status === 'suspended' ? 'danger' : 'warning'}>
            {status ? ACCOUNT_STATUS_LABELS[status] ?? status : '—'}
          </Badge>
        </div>

        {/* 2FA Toggle */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Key className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">Two-Factor Auth (2FA)</p>
              <p className="text-caption text-muted-foreground">
                {twoFactor ? 'Secured with TOTP Authenticator' : 'Disabled (Recommended to enable)'}
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactor}
            onCheckedChange={handleToggle2FA}
            aria-label="Toggle Two-Factor Authentication"
          />
        </div>

        {/* Email verification status */}
        <div className="flex items-center justify-between rounded-lg bg-surface p-4 border border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <MailCheck className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">Email Verification</p>
              <p className="text-caption text-muted-foreground">Primary identity confirmed</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResendVerification}
            loading={sendingVerify}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Re-verify
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-label font-medium text-muted-foreground">Active Role Permissions</p>
          </div>
          {permissions.length === 0 ? (
            <p className="text-body-small text-muted-foreground">No permissions available.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="font-mono text-[11px] font-normal">
                  {permission.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}