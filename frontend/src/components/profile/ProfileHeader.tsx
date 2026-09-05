import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Building2, LogOut, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types/shared'
import { ROLE_LABELS, ACCOUNT_STATUS_LABELS } from '@/constants/shared'

interface ProfileHeaderProps {
  profile: UserProfile | null
  onEdit: () => void
  editing: boolean
  onSignOut: () => void
  signOutPending?: boolean
}

function initials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase().slice(0, 2)
}

export function ProfileHeader({ profile, onEdit, editing, onSignOut, signOutPending }: ProfileHeaderProps) {
  const role = profile?.role ? ROLE_LABELS[profile.role] ?? profile.role : '—'
  const status = profile?.account_status ?? null

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
          <AvatarFallback className="text-body font-semibold bg-primary-subtle text-primary text-base">
            {initials(profile?.full_name ?? profile?.email)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h2 text-foreground">{profile?.full_name || 'Profile'}</h1>
            {status && (
              <Badge variant={status === 'active' ? 'success' : status === 'suspended' ? 'danger' : 'warning'}>
                {ACCOUNT_STATUS_LABELS[status] ?? status}
              </Badge>
            )}
          </div>
          <p className="text-body text-muted-foreground">{role}</p>
          <p className="text-body-small text-muted-foreground">{profile?.email || 'No email available'}</p>
          {profile?.business_name && (
            <p className="inline-flex items-center gap-1.5 text-body-small text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              {profile.business_name}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEdit} disabled={editing}>
          <Pencil className="h-4 w-4" aria-hidden />
          {editing ? 'Editing…' : 'Edit Profile'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          loading={signOutPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sign Out
        </Button>
      </div>
    </div>
  )
}