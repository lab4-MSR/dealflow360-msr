import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { ProfileHeader, PersonalInformation, SecuritySection, AccountStatus } from '@/components/profile'
import { ErrorState } from '@/components/shared'
import { sharedApi, signOut } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import type { UpdateProfilePayload } from '@/types/shared'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editing, setEditing] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)

  const profileQuery = useQuery({
    queryKey: ['me-profile'],
    queryFn: () => sharedApi.profile(),
  })
  const profile = profileQuery.data ?? null

  const sessionsQuery = useQuery({
    queryKey: ['me-sessions'],
    queryFn: () => sharedApi.sessions(),
  })

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => sharedApi.updateProfile(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['me-profile'], updated)
      setEditing(false)
      toast.success('Profile updated')
    },
    onError: (err) => toast.error('Unable to update profile', { description: getErrorMessage(err) }),
  })

  const changePassword = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      sharedApi.changePassword({ current_password: current, new_password: next }),
    onSuccess: () => toast.success('Password changed'),
    onError: (err) => toast.error('Unable to change password', { description: getErrorMessage(err) }),
  })

  const revokeSession = useMutation({
    mutationFn: (id: string) => sharedApi.revokeSession(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['me-sessions'], (prev: unknown) =>
        (prev as Array<{ id: string; [k: string]: unknown }>).filter((s) => s.id !== id)
      )
      toast.success('Session revoked')
    },
    onError: (err) => toast.error('Unable to revoke session', { description: getErrorMessage(err) }),
  })

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      toast.success('Signed out')
      // Landing returns to the signed-out root; authentication flows are handled elsewhere.
      navigate('/', { replace: true })
    } catch {
      toast.error('Unable to sign out')
    } finally {
      setSigningOut(false)
    }
  }

  if (profileQuery.isLoading && !profile) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl border border-border bg-card" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </div>
    )
  }

  if (profileQuery.error && !profile) {
    return (
      <ErrorState
        title="Unable to load profile"
        description={getErrorMessage(profileQuery.error, 'Profile information unavailable.')}
        onRetry={() => profileQuery.refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        editing={editing}
        onEdit={() => setEditing(true)}
        onSignOut={() => void handleSignOut()}
        signOutPending={signingOut}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <PersonalInformation
          profile={profile}
          editing={editing}
          onCancel={() => setEditing(false)}
          onSave={(payload) => updateProfile.mutateAsync(payload)}
        />
        <AccountStatus profile={profile} />
      </div>

      <SecuritySection
        sessions={sessionsQuery.data ?? []}
        sessionsLoading={sessionsQuery.isLoading}
        loginActivity={profile?.login_activity ?? []}
        activityLoading={profileQuery.isLoading}
        onChangePassword={async (current, next) => {
          await changePassword.mutateAsync({ current, next })
        }}
        onRevokeSession={(id) => revokeSession.mutateAsync(id).then(() => undefined)}
      />
    </div>
  )
}