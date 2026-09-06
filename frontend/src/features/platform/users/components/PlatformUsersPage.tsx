import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePlatformUsers, usePlatformUserKpis } from '../hooks/use-platform-users'
import type { PlatformUserFilters } from '../types'
import { Pagination } from '@/components/ui/datatable/pagination'
import { Search, X, Users, UserPlus, UserCheck, UserX, Clock } from 'lucide-react'
import { format } from 'date-fns'


const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  inactive: 'secondary',
}

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  business_admin: 'Business Admin',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Rep',
  viewer: 'Viewer',
}

export function PlatformUsersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<PlatformUserFilters>({ page: 1, perPage: 10 })
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: kpis, isLoading: kpisLoading } = usePlatformUserKpis()
  const { data, isLoading, error, refetch } = usePlatformUsers(filters)

  const debouncedSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value || undefined, page: 1 }))
    }, 300)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  if (isLoading || kpisLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-9 w-[140px]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5"><Skeleton className="h-3 w-[60px] mb-2" /><Skeleton className="h-7 w-[40px]" /></div>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) return <ErrorState title="Unable to load users" description="We couldn't load the platform users." onRetry={() => refetch()} />

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Platform Users</h1>
          <p className="text-body-small text-muted-foreground mt-1">Manage users across all businesses on the platform.</p>
        </div>
        <Button onClick={() => navigate('/platform/users/invite')} className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Users" value={kpis?.totalUsers || 0} icon={<Users className="h-5 w-5" />} />
        <KpiCard label="Active" value={kpis?.activeUsers || 0} icon={<UserCheck className="h-5 w-5" />} variant="success" />
        <KpiCard label="Pending" value={kpis?.pendingUsers || 0} icon={<Clock className="h-5 w-5" />} variant="warning" />
        <KpiCard label="Suspended" value={kpis?.suspendedUsers || 0} icon={<UserX className="h-5 w-5" />} variant="danger" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); debouncedSearch(e.target.value) }} className="pl-9" />
            </div>
            <Select value={filters.role || 'all'} onValueChange={(v) => setFilters((p) => ({ ...p, role: (v === 'all' ? undefined : v) as PlatformUserFilters['role'], page: 1 }))}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="business_admin">Business Admin</SelectItem>
                <SelectItem value="sales_manager">Sales Manager</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || 'all'} onValueChange={(v) => setFilters((p) => ({ ...p, status: (v === 'all' ? undefined : v) as PlatformUserFilters['status'], page: 1 }))}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {(filters.search || filters.role || filters.status) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters({ page: 1, perPage: 10 }); setSearchInput('') }} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <EmptyState title="No users found" description="No users match your current filters." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-body">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border">
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden md:table-cell">Business</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden lg:table-cell">Created</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border transition-colors hover:bg-surface-muted/50">
                    <td className="h-14 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-caption font-medium text-muted-foreground">
                          {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-small font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-caption text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="h-14 px-4 align-middle"><Badge variant="secondary">{roleLabel[user.role] || user.role}</Badge></td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground hidden md:table-cell">{user.businessName || '—'}</td>
                    <td className="h-14 px-4 align-middle"><Badge variant={statusVariant[user.status] || 'secondary'}>{user.status}</Badge></td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground hidden lg:table-cell">{user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy') : '—'}</td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground hidden lg:table-cell">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                    <td className="h-14 px-4 align-middle">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/platform/users/${user.id}`)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            page={filters.page || 1}
            totalPages={totalPages}
            total={total}
            perPage={filters.perPage || 10}
            onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
          />
        </div>
      )}
    </div>
  )
}
