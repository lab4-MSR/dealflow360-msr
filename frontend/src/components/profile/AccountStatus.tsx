import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, UserCog } from 'lucide-react'
import type { UserProfile } from '@/types/shared'
import { ROLE_LABELS, ACCOUNT_STATUS_LABELS } from '@/constants/shared'

interface AccountStatusProps {
  profile: UserProfile | null
}

export function AccountStatus({ profile }: AccountStatusProps) {
  const permissions = profile?.permissions ?? []
  const role = profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : '—'
  const status = profile?.account_status ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
          Account Status
        </CardTitle>
        <CardDescription>Your current role, permissions and account state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
              <UserCog className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-label font-medium text-muted-foreground">Role</p>
              <p className="text-body font-medium text-foreground">{role}</p>
            </div>
          </div>
          <Badge variant={status === 'active' ? 'success' : status === 'suspended' ? 'danger' : 'warning'}>
            {status ? ACCOUNT_STATUS_LABELS[status] ?? status : '—'}
          </Badge>
        </div>

        <div>
          <p className="text-label font-medium text-muted-foreground mb-3">Permissions</p>
          {permissions.length === 0 ? (
            <p className="text-body-small text-muted-foreground">No permissions available.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="font-normal">
                  {permission}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}