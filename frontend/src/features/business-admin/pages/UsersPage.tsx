import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useUsers, useUserKpis, useDeleteUser } from '../hooks/use-business-admin'
import type { BusinessUser } from '../types'
import { ROLE_LABELS } from '@/types/auth'
import { toast } from 'sonner'
import { UserPlus, Search, Users, UserCheck, Clock, UserX, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function UsersPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, role: roleFilter, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useUsers(filters)
  const { data: kpis, isLoading: kpisLoading } = useUserKpis()
  const deleteUser = useDeleteUser()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser.mutateAsync(deleteId)
      toast.success('User deactivated')
      setDeleteId(null)
    } catch {
      toast.error('Failed to deactivate user')
    }
  }

  const columns: Column<BusinessUser>[] = [
    {
      id: 'user', header: 'User',
      accessorFn: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
              {row.fullName.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{row.fullName}</p>
            <p className="text-[11px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    { id: 'role', header: 'Role', accessorFn: (row) => <Badge variant="secondary">{ROLE_LABELS[row.role] || row.role}</Badge> },
    { id: 'team', header: 'Team', accessorFn: (row) => <span className="text-[13px] text-muted-foreground">{row.teamName || '—'}</span> },
    { id: 'status', header: 'Status', accessorFn: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : row.status === 'suspended' ? 'danger' : 'secondary'}>
        {row.status}
      </Badge>
    )},
    { id: 'lastActive', header: 'Last Active', accessorFn: (row) => (
      <span className="text-[12px] text-muted-foreground tabular-nums">
        {row.lastActive ? format(parseISO(row.lastActive), 'MMM d, yyyy') : '—'}
      </span>
    )},
    {
      id: 'actions', header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/users-access/users/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage users belonging to your business."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access' },
          { label: 'Users' },
        ]}
        actions={
          <Button onClick={() => navigate('/business-admin/users-access/invite')}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite User
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Users" value={kpis?.totalUsers ?? 0} icon={<Users className="h-5 w-5" />} />
            <KpiCard label="Active Users" value={kpis?.activeUsers ?? 0} variant="success" icon={<UserCheck className="h-5 w-5" />} />
            <KpiCard label="Pending Invitations" value={kpis?.pendingInvitations ?? 0} variant="warning" icon={<Clock className="h-5 w-5" />} />
            <KpiCard label="Inactive Users" value={kpis?.inactiveUsers ?? 0} variant="danger" icon={<UserX className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="business_admin">Business Admin</SelectItem>
            <SelectItem value="sales_manager">Sales Manager</SelectItem>
            <SelectItem value="sales_rep">Sales Rep</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        {(roleFilter || statusFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setRoleFilter(''); setStatusFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">{selectedIds.length}</span> selected
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load users" onRetry={refetch} />
      ) : !data?.users || data.users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No users found"
          description="Invite your first team member to get started."
          action={<Button onClick={() => navigate('/business-admin/users-access/invite')}><UserPlus className="h-4 w-4 mr-1.5" />Invite User</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.users as unknown as Record<string, unknown>[]}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onRowClick={(row) => navigate(`/business-admin/users-access/users/${(row as unknown as BusinessUser).id}`)}
          />
          {data.totalPages > 1 && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              perPage={data.perPage}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Deactivate user?"
        description="This will prevent this user from accessing the business. Existing records owned by the user will remain unchanged."
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteUser.isPending}
      />
    </div>
  )
}
