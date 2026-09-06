import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useRoleDetail, useUpdateRolePermissions } from '../hooks/use-business-admin'
import { toast } from 'sonner'
import { ArrowLeft, Shield, Users, Save } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

export function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: role, isLoading, error, refetch } = useRoleDetail(id || '')
  const updatePermissions = useUpdateRolePermissions()
  const isSystem = !!role?.isSystem

  const [localPermissions, setLocalPermissions] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (role?.permissions) {
      if (Array.isArray(role.permissions)) {
        setLocalPermissions(new Set(role.permissions))
      } else if (typeof role.permissions === 'object') {
        const flat: string[] = []
        Object.entries(role.permissions).forEach(([mod, perms]) => {
          if (Array.isArray(perms)) {
            perms.forEach((p) => flat.push(`${mod}.${p}`))
          }
        })
        setLocalPermissions(new Set(flat))
      }
      setHasChanges(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id])

  const togglePermission = (key: string) => {
    setLocalPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
    setHasChanges(true)
  }

  const toggleGroup = (keys: string[], enabled: boolean) => {
    setLocalPermissions((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => {
        if (enabled) {
          next.add(k)
        } else {
          next.delete(k)
        }
      })
      return next
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!role || isSystem) return
    try {
      await updatePermissions.mutateAsync({ id: role.id, permissions: Array.from(localPermissions) })
      queryClient.invalidateQueries({ queryKey: ['ba-role', role.id] })
      toast.success('Permissions updated')
      setHasChanges(false)
    } catch {
      toast.error('Failed to update permissions')
    }
  }

  const handleReset = () => {
    if (!role?.permissions) {
      setLocalPermissions(new Set())
    } else if (Array.isArray(role.permissions)) {
      setLocalPermissions(new Set(role.permissions))
    } else if (typeof role.permissions === 'object') {
      const flat: string[] = []
      Object.entries(role.permissions).forEach(([mod, perms]) => {
        if (Array.isArray(perms)) {
          perms.forEach((p) => flat.push(`${mod}.${p}`))
        }
      })
      setLocalPermissions(new Set(flat))
    }
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !role) {
    return <ErrorState title="Failed to load role" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.displayName}
        description={role.description}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access', path: '/business-admin/users-access/roles' },
          { label: role.displayName },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/business-admin/users-access/roles')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || updatePermissions.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || updatePermissions.isPending || isSystem} title={isSystem ? 'System roles are read-only' : undefined}>
              <Save className="h-4 w-4 mr-1.5" />
              {updatePermissions.isPending ? 'Saving...' : 'Save Permissions'}
            </Button>
          </>
        }
      />

      {isSystem && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-3 px-4">
            <p className="text-[12px] text-warning font-medium">
              This is a system role. Its permissions are managed by the platform and cannot be modified.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{role.displayName}</h2>
              {role.description && <p className="text-[13px] text-muted-foreground">{role.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={role.isSystem ? 'secondary' : 'outline'}>
                  {role.isSystem ? 'System Role' : 'Custom Role'}
                </Badge>
                <Badge variant={role.status === 'active' ? 'success' : 'secondary'}>
                  {role.status}
                </Badge>
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {role.userCount ?? 0} user{(role.userCount ?? 0) !== 1 ? 's' : ''}
                </span>
                <span className="text-[12px] text-muted-foreground">·</span>
                <span className="text-[12px] text-muted-foreground">
                  {localPermissions.size} permission{localPermissions.size !== 1 ? 's' : ''}
                </span>
                <span className="text-[12px] text-muted-foreground">·</span>
                <span className="text-[12px] text-muted-foreground">
                  Created {role.createdAt && isValid(parseISO(role.createdAt)) ? format(parseISO(role.createdAt), 'MMM d, yyyy') : '—'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-h4 font-semibold text-foreground">Permissions</h3>
          {hasChanges && (
            <Badge variant="warning" className="text-[11px]">Unsaved changes</Badge>
          )}
        </div>

        {(role.permissionGroups ?? []).map((group) => {
          const groupKeys = group.permissions.map((p) => p.key)
          const allEnabled = groupKeys.every((k) => localPermissions.has(k))
          const someEnabled = groupKeys.some((k) => localPermissions.has(k))

          return (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[14px] font-semibold">{group.name}</CardTitle>
                  <button
                    onClick={() => toggleGroup(groupKeys, !allEnabled)}
                    aria-pressed={allEnabled}
                    disabled={isSystem}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className={cn(
                        'h-4 w-7 rounded-full transition-colors relative',
                        allEnabled ? 'bg-success' : someEnabled ? 'bg-warning' : 'bg-border',
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
                          allEnabled ? 'left-3.5' : 'left-0.5',
                        )}
                      />
                    </div>
                    {allEnabled ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {group.permissions.map((perm) => {
                    const enabled = localPermissions.has(perm.key)
                    return (
                      <div key={perm.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="space-y-0.5">
                          <p className="text-[13px] font-medium text-foreground">{perm.label}</p>
                          {perm.description && (
                            <p className="text-[11px] text-muted-foreground">{perm.description}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground font-mono">{perm.key}</p>
                        </div>
                        <button
                          onClick={() => togglePermission(perm.key)}
                          aria-pressed={enabled}
                          aria-label={`${enabled ? 'Disable' : 'Enable'} ${perm.label}`}
                          disabled={isSystem}
                          className="flex-shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div
                            className={cn(
                              'h-5 w-9 rounded-full transition-colors relative',
                              enabled ? 'bg-success' : 'bg-border',
                            )}
                          >
                            <div
                              className={cn(
                                'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
                                enabled ? 'translate-x-4' : 'translate-x-0.5',
                              )}
                            />
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(!role.permissionGroups || role.permissionGroups.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No permissions available for this role.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


