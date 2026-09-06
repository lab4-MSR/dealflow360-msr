import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useUserDetail, useUpdateUser, useDeleteUser } from '../hooks/use-business-admin'
import { ROLE_LABELS } from '@/types/auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ArrowLeft, UserCheck, UserX, Trash2, Shield, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user, isLoading, error, refetch } = useUserDetail(id || '')
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  const handleToggleStatus = async () => {
    if (!user) return
    const newStatus = user.status === 'active' ? 'inactive' : user.status === 'inactive' ? 'active' : 'active'
    try {
      await updateUser.mutateAsync({ id: user.id, data: { status: newStatus } })
      queryClient.invalidateQueries({ queryKey: ['ba-user', user.id] })
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      setShowStatusDialog(false)
    } catch {
      toast.error('Failed to update user status')
    }
  }

  const handleDelete = async () => {
    if (!user) return
    try {
      await deleteUser.mutateAsync(user.id)
      queryClient.invalidateQueries({ queryKey: ['ba-user', user.id] })
      toast.success('User deactivated')
      navigate('/business-admin/users')
    } catch {
      toast.error('Failed to deactivate user')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !user) {
    return <ErrorState title="Failed to load user" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        description={user.email}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access', path: '/business-admin/users-access/users' },
          { label: user.fullName },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/business-admin/users')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
              {user.status === 'active' ? <UserX className="h-4 w-4 mr-1.5" /> : <UserCheck className="h-4 w-4 mr-1.5" />}
              {user.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />
              Revoke Access
            </Button>
          </>
        }
      />

      {/* User Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-[18px] font-bold">
                {(user.fullName || user.email || '?')
                  .split(' ')
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{user.fullName || user.email || 'User'}</h2>
              <p className="text-[13px] text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'success' : user.status === 'pending' ? 'warning' : 'danger'}>
                  {user.status}
                </Badge>
                {user.teamName && <Badge variant="outline">{user.teamName}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Email</p>
                  <p className="text-[13px] text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Phone</p>
                  <p className="text-[13px] text-foreground">{user.phone || '—'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Joined</p>
                  <p className="text-[13px] text-foreground">
                    {(() => {
                      const parsed = user.joinedAt ? parseISO(user.joinedAt) : null
                      return parsed && isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '—'
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Last Active</p>
                  <p className="text-[13px] text-foreground">
                    {(() => {
                      const parsed = user.lastActive ? parseISO(user.lastActive) : null
                      return parsed && isValid(parsed) ? format(parsed, 'MMM d, yyyy · h:mm a') : '—'
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access & Permissions */}
      <Card>
        <CardHeader><CardTitle>Access & Permissions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Role</p>
                <p className="text-[13px] font-medium text-foreground">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</p>
              </div>
            </div>
            {user.permissions && user.permissions.length > 0 && (
              <div>
                <p className="text-[11px] text-muted-foreground mb-2">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.map((p) => (
                    <Badge key={p} variant="outline" className="text-[11px]">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={user.status === 'active' ? 'Deactivate user?' : 'Activate user?'}
        description={user.status === 'active'
          ? 'This will prevent this user from accessing the business. Existing records owned by the user will remain unchanged.'
          : 'This will restore this user\'s access to the business.'}
        confirmLabel={user.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={user.status === 'active' ? 'danger' : 'default'}
        onConfirm={handleToggleStatus}
        loading={updateUser.isPending}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Revoke access?"
        description="This will immediately remove this user's access to the business. This action cannot be undone."
        confirmLabel="Revoke Access"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
      />
    </div>
  )
}
