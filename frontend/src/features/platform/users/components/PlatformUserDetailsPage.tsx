import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { usePlatformUserDetail, useUpdatePlatformUserStatus } from '../hooks/use-platform-users'
import { format } from 'date-fns'
import { ArrowLeft, Mail, Phone, Building2, Shield, Clock, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success', pending: 'warning', suspended: 'danger', inactive: 'secondary',
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin', business_admin: 'Business Admin', sales_manager: 'Sales Manager', sales_rep: 'Sales Rep', viewer: 'Viewer',
}

export function PlatformUserDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: user, isLoading, error, refetch } = usePlatformUserDetail(id || '')
  const updateStatus = useUpdatePlatformUserStatus()
  const [showStatusDialog, setShowStatusDialog] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-9 w-[140px]" />
        <div className="flex items-center gap-4"><Skeleton className="h-16 w-16 rounded-full" /><div className="space-y-2"><Skeleton className="h-6 w-[200px]" /><Skeleton className="h-4 w-[300px]" /></div></div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !user) return <ErrorState title="User not found" description="We couldn't load the user details." onRetry={() => refetch()} />

  const handleStatusToggle = async () => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    await updateStatus.mutateAsync({ id: user.id, status: newStatus })
    setShowStatusDialog(false)
    refetch()
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/platform/users')} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Button>

      {/* User Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface-muted text-h3 font-semibold text-muted-foreground">
            {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-h2 text-foreground">{user.name}</h1>
              <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
            </div>
            <p className="text-small text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {user.status === 'active' ? (
            <Button variant="outline" onClick={() => setShowStatusDialog(true)} className="gap-1.5">Suspend</Button>
          ) : user.status === 'suspended' ? (
            <Button onClick={() => setShowStatusDialog(true)} className="gap-1.5">Activate</Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Email</p><p className="text-small font-medium">{user.email}</p></div></div>
              {user.phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Phone</p><p className="text-small font-medium">{user.phone}</p></div></div>}
              <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Business</p><p className="text-small font-medium">{user.businessName || 'Platform Level'}</p></div></div>
              <div className="flex items-center gap-3"><Shield className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Role</p><p className="text-small font-medium">{roleLabel[user.role]}</p></div></div>
              <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Created</p><p className="text-small font-medium">{format(new Date(user.createdAt), 'MMM d, yyyy')}</p></div></div>
              <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-muted-foreground" /><div><p className="text-caption text-muted-foreground">Last Active</p><p className="text-small font-medium">{user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy h:mm a') : 'Never'}</p></div></div>
            </div>
          </CardContent>
        </Card>

        {/* Access */}
        <Card>
          <CardHeader><CardTitle>Access</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-caption text-muted-foreground mb-1">Access Scope</p><Badge variant={user.accessScope === 'platform' ? 'default' : 'secondary'}>{user.accessScope === 'platform' ? 'Platform Level' : 'Business Scoped'}</Badge></div>
            {user.permissions && user.permissions.length > 0 && (
              <div><p className="text-caption text-muted-foreground mb-2">Permissions</p><div className="flex flex-wrap gap-1.5">{user.permissions.map((p) => <Badge key={p} variant="outline" className="text-caption">{p}</Badge>)}</div></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {user.recentActivity && user.recentActivity.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {user.recentActivity.map((item, index) => (
                <div key={item.id} className={cn('flex items-start gap-3 py-3', index < (user.recentActivity?.length || 0) - 1 && 'border-b border-border')}>
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted"><Activity className="h-3.5 w-3.5 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-small"><span className="font-medium text-foreground">{item.action}</span> <span className="text-muted-foreground">{item.target}</span></p>
                    <span className="text-caption text-muted-foreground">{format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        title={user.status === 'active' ? `Suspend ${user.name}?` : `Activate ${user.name}?`}
        description={user.status === 'active' ? 'This will prevent the user from accessing DealFlow360.' : 'This will restore the user\'s access to DealFlow360.'}
        confirmLabel={user.status === 'active' ? 'Suspend User' : 'Activate User'}
        variant={user.status === 'active' ? 'danger' : 'default'}
        onConfirm={handleStatusToggle}
        loading={updateStatus.isPending}
      />
    </div>
  )
}
