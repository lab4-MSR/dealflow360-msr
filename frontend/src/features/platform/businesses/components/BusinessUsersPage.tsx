import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, UserPlus, Search, Filter, X, MoreHorizontal, Eye, UserX, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { DataTable, type Column } from '@/components/ui/datatable'
import { Pagination } from '@/components/ui/datatable/pagination'
import { useBusinessUsers, useBusinessUserKpis } from '../hooks/use-businesses'
import type { BusinessUserFilters, UserRole, UserStatus, BusinessUser } from '../types'

const ROLE_LABELS: Record<UserRole, string> = {
  business_admin: 'Business Admin',
  sales_manager: 'Sales Manager',
  sales_rep: 'Sales Rep',
  viewer: 'Viewer',
}

const ROLE_VARIANT: Record<UserRole, 'default' | 'info' | 'secondary'> = {
  business_admin: 'default',
  sales_manager: 'info',
  sales_rep: 'secondary',
  viewer: 'secondary',
}

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
}

const STATUS_VARIANT: Record<UserStatus, 'success' | 'danger' | 'warning'> = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function useDebouncedCallback<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedFn
}

export function BusinessUsersPage() {
  const { id } = useParams<{ id: string }>()

  const [page, setPage] = useState(1)
  const [perPage] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>(undefined)
  const [teamFilter, setTeamFilter] = useState<string | undefined>(undefined)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value)
    setPage(1)
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    debouncedSetSearch(value)
  }

  const filters: BusinessUserFilters = {
    search: debouncedSearch || undefined,
    role: roleFilter,
    status: statusFilter,
    team: teamFilter,
    page,
    perPage,
  }

  const { data: userData, isLoading, error, refetch } = useBusinessUsers(id || '', filters)
  const { data: kpis, isLoading: kpisLoading } = useBusinessUserKpis(id || '')

  const hasActiveFilters = debouncedSearch || roleFilter || statusFilter || teamFilter

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setRoleFilter(undefined)
    setStatusFilter(undefined)
    setTeamFilter(undefined)
    setPage(1)
  }

  const columns: Column<BusinessUser>[] = [
    {
      id: 'user',
      header: 'User',
      accessorFn: (row: BusinessUser) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-caption font-semibold text-muted-foreground">
            {row.avatar ? (
              <img src={row.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              getInitials(row.name)
            )}
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium text-foreground truncate">{row.name}</p>
            <p className="text-caption text-muted-foreground truncate">{row.email}</p>
          </div>
        </div>
      ),
      className: 'min-w-[240px]',
    },
    {
      id: 'role',
      header: 'Role',
      accessorFn: (row: BusinessUser) => (
        <Badge variant={ROLE_VARIANT[row.role]}>{ROLE_LABELS[row.role]}</Badge>
      ),
      className: 'min-w-[140px]',
    },
    {
      id: 'team',
      header: 'Team',
      accessorFn: (row: BusinessUser) => (
        <span className="text-small text-foreground">{row.team || '—'}</span>
      ),
      className: 'min-w-[120px]',
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row: BusinessUser) => (
        <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABELS[row.status]}</Badge>
      ),
      className: 'min-w-[100px]',
    },
    {
      id: 'lastActive',
      header: 'Last Active',
      accessorFn: (row: BusinessUser) => (
        <span className="text-small text-muted-foreground">
          {row.lastActive ? formatDate(row.lastActive) : '—'}
        </span>
      ),
      className: 'min-w-[120px]',
    },
    {
      id: 'joinedAt',
      header: 'Joined',
      accessorFn: (row: BusinessUser) => (
        <span className="text-small text-muted-foreground">{formatDate(row.joinedAt)}</span>
      ),
      className: 'min-w-[110px]',
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row: BusinessUser) => (
        <div className="relative flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              setOpenDropdown(openDropdown === row.id ? null : row.id)
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {openDropdown === row.id && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-elevation-2">
                <button className="flex w-full items-center gap-2 px-3 py-2 text-small text-foreground hover:bg-accent transition-colors">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Profile
                </button>
                {row.status === 'active' ? (
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-small text-danger hover:bg-accent transition-colors">
                    <UserX className="h-4 w-4" />
                    Deactivate
                  </button>
                ) : (
                  <button className="flex w-full items-center gap-2 px-3 py-2 text-small text-success hover:bg-accent transition-colors">
                    <UserCheck className="h-4 w-4" />
                    Reactivate
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ),
      className: 'w-12',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-[180px]" />
          <Skeleton className="h-9 w-[140px] rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[280px] rounded-lg" />
          <Skeleton className="h-10 w-[140px] rounded-lg" />
          <Skeleton className="h-10 w-[140px] rounded-lg" />
        </div>
        <div className="rounded-xl border border-border">
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-5 w-[100px] rounded-full" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-5 w-[70px] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load users"
        description="We couldn't load the users for this business. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-h2 text-foreground">Business Users</h1>
        <Button className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* User Overview KPIs */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <Skeleton className="h-3 w-[60px] mb-2" />
              <Skeleton className="h-7 w-[80px]" />
            </div>
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Users"
            value={kpis.totalUsers.toLocaleString()}
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Active Users"
            value={kpis.activeUsers.toLocaleString()}
            variant="success"
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            label="Pending Invitations"
            value={kpis.pendingInvitations.toLocaleString()}
            variant="warning"
            icon={<UserPlus className="h-5 w-5" />}
          />
          <KpiCard
            label="Inactive Users"
            value={kpis.inactiveUsers.toLocaleString()}
            variant="danger"
            icon={<Users className="h-5 w-5" />}
          />
        </div>
      ) : null}

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={roleFilter || undefined}
                onValueChange={(value) => {
                  setRoleFilter(value as UserRole || undefined)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_admin">Business Admin</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager</SelectItem>
                  <SelectItem value="sales_rep">Sales Rep</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter || undefined}
                onValueChange={(value) => {
                  setStatusFilter(value as UserStatus || undefined)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={teamFilter || undefined}
                onValueChange={(value) => {
                  setTeamFilter(value || undefined)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {userData && userData.users.length > 0 ? (
          <>
            <DataTable<BusinessUser>
              columns={columns}
              data={userData.users as unknown as Record<string, unknown>[]}
              getRowId={(row) => (row as unknown as BusinessUser).id}
              emptyMessage="No users found"
            />
            {userData.totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  page={userData.page}
                  totalPages={userData.totalPages}
                  total={userData.total}
                  perPage={userData.perPage}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No users found"
            description={
              hasActiveFilters
                ? 'No users match your current filters. Try adjusting your search criteria.'
                : 'This business has no users yet. Invite team members to get started.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters} className="gap-1.5">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              ) : (
                <Button className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Invite User
                </Button>
              )
            }
          />
        )}
      </div>
    </div>
  )
}
