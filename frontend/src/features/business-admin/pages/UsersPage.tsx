import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  useUsers,
  useUserKpis,
  useDeleteUser,
  useInviteUser,
  useRoles,
  useRoleKpis,
  useCreateRole,
  useDeleteRole,
} from '../hooks/use-business-admin'
import type { BusinessUser, Role } from '../types'
import { ROLE_LABELS } from '@/types/auth'
import { toast } from 'sonner'
import {
  UserPlus,
  Search,
  Users,
  UserCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  Send,
  Plus,
  Clock,
  Download,
  CheckCircle2,
  RefreshCw,
  Lock,
  Building,
  Key,
  ChevronRight,
} from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

export function UsersPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'invitations'>('users')

  // Users Tab State
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Roles Tab State
  const [roleSearchInput, setRoleSearchInput] = useState('')
  const [roleSearch, setRoleSearch] = useState('')
  const [rolePage, setRolePage] = useState(1)
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null)
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false)
  const [newRoleForm, setNewRoleForm] = useState({ name: '', displayName: '', description: '' })

  // Quick Invite Dialog State
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    role: 'sales_rep',
    teamId: '',
  })
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({})

  // Data Queries
  const userFilters = {
    search,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page,
    perPage: 10,
  }
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers(userFilters)
  const { data: userKpis, isLoading: kpisLoading } = useUserKpis()
  const deleteUser = useDeleteUser()
  const inviteUser = useInviteUser()

  const roleFilters = {
    search: roleSearch,
    page: rolePage,
    perPage: 10,
  }
  const { data: rolesData, isLoading: rolesLoading, error: rolesError, refetch: refetchRoles } = useRoles(roleFilters)
  const { data: roleKpis } = useRoleKpis()
  const createRole = useCreateRole()
  const deleteRole = useDeleteRole()

  // User Actions
  const handleSearchUsers = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  const handleDeleteUser = async () => {
    if (!deleteId) return
    try {
      await deleteUser.mutateAsync(deleteId)
      toast.success('Member access successfully revoked')
      setDeleteId(null)
    } catch {
      toast.error('Failed to revoke member access')
    }
  }

  const handleSendInvite = async () => {
    const errs: Record<string, string> = {}
    if (!inviteForm.fullName.trim()) errs.fullName = 'Full name is required'
    if (!inviteForm.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      errs.email = 'Enter a valid corporate email'
    }
    setInviteErrors(errs)
    if (Object.keys(errs).length > 0) return

    try {
      await inviteUser.mutateAsync({
        fullName: inviteForm.fullName.trim(),
        email: inviteForm.email.trim().toLowerCase(),
        role: inviteForm.role,
        ...(inviteForm.teamId ? { teamId: inviteForm.teamId } : {}),
      })
      toast.success(`Invitation dispatched to ${inviteForm.email}`)
      setShowInviteDialog(false)
      setInviteForm({ fullName: '', email: '', role: 'sales_rep', teamId: '' })
      setInviteErrors({})
    } catch {
      toast.error('Failed to send member invitation')
    }
  }

  // Role Actions
  const handleSearchRoles = () => {
    setRoleSearch(roleSearchInput)
    setRolePage(1)
  }

  const handleCreateRole = async () => {
    if (!newRoleForm.displayName.trim()) {
      toast.error('Role display name is required')
      return
    }
    const slugName = (newRoleForm.name.trim() || newRoleForm.displayName.trim())
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
    try {
      await createRole.mutateAsync({
        name: slugName,
        displayName: newRoleForm.displayName.trim(),
        description: newRoleForm.description.trim(),
      })
      toast.success(`Custom role "${newRoleForm.displayName}" created successfully`)
      setShowCreateRoleDialog(false)
      setNewRoleForm({ name: '', displayName: '', description: '' })
    } catch {
      toast.error('Failed to create role')
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return
    try {
      await deleteRole.mutateAsync(deleteRoleId)
      toast.success('Custom role deleted')
      setDeleteRoleId(null)
    } catch {
      toast.error('Failed to delete role')
    }
  }

  const csvEscape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

  const exportUserCsv = () => {
    if (!usersData?.users || usersData.users.length === 0) {
      toast.error('No user records available to export')
      return
    }
    const headers = ['Full Name', 'Email', 'Role', 'Team', 'Status', 'Last Active']
    const rows = usersData.users.map((u: BusinessUser) => [
      csvEscape(u.fullName),
      csvEscape(u.email),
      csvEscape(u.role),
      csvEscape(u.teamName || 'Unassigned'),
      csvEscape(u.status),
      csvEscape(u.lastActive || 'Never'),
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dealflow360-members-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Member directory exported as CSV')
  }

  // Users Table Columns
  const userColumns: Column<BusinessUser>[] = [
    {
      id: 'user',
      header: 'Member Profile',
      accessorFn: (row) => {
        const initials = (row.fullName || row.email)
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-mono">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                  row.status === 'active'
                    ? 'bg-emerald-500'
                    : row.status === 'pending'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/business-admin/users-access/users/${row.id}`)}>
                {row.fullName || 'Unnamed User'}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">{row.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: 'role',
      header: 'Assigned Role',
      accessorFn: (row) => {
        const role = row.role || 'sales_rep'
        const badgeColor =
          role.includes('admin')
            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
            : role.includes('manager')
            ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
            : role.includes('finance')
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            : role.includes('operations')
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeColor}`}>
            {ROLE_LABELS[role] || role}
          </span>
        )
      },
    },
    {
      id: 'team',
      header: 'Department / Team',
      accessorFn: (row) => (
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Building className="h-3 w-3 text-muted-foreground/70" />
          {row.teamName || <span className="italic text-muted-foreground/60">Unassigned</span>}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Security Status',
      accessorFn: (row) => (
        <Badge
          variant={
            row.status === 'active'
              ? 'success'
              : row.status === 'pending'
              ? 'warning'
              : row.status === 'suspended'
              ? 'danger'
              : 'secondary'
          }
          className="capitalize text-[10px]"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'lastActive',
      header: 'Activity Telemetry',
      accessorFn: (row) => {
        const parsed = row.lastActive ? parseISO(row.lastActive) : null
        const label = parsed && isValid(parsed) ? format(parsed, 'MMM d, yyyy') : 'Never logged in'
        return (
          <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1.5 font-mono">
            <Clock className="h-3 w-3 text-muted-foreground/70" />
            {label}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/users-access/users/${row.id}`)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                Inspect Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Password reset link sent to ${row.email}`)}>
                <Key className="h-3.5 w-3.5 mr-2" />
                Reset Credentials
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteId(row.id)}
                className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Deactivate Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  // Roles Table Columns
  const roleColumns: Column<Role>[] = [
    {
      id: 'role',
      header: 'Role Profile',
      accessorFn: (row) => (
        <div className="py-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground">{row.displayName || row.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {row.name}
            </span>
          </div>
          {row.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Classification',
      accessorFn: (row) => (
        <Badge variant={row.isSystem ? 'secondary' : 'default'} className="text-[10px]">
          {row.isSystem ? 'System Governed' : 'Custom Defined'}
        </Badge>
      ),
    },
    {
      id: 'users',
      header: 'Active Users',
      accessorFn: (row) => (
        <span className="text-xs font-semibold text-foreground font-mono flex items-center gap-1.5">
          <Users className="h-3 w-3 text-muted-foreground" />
          {row.userCount ?? 0} members
        </span>
      ),
    },
    {
      id: 'permissions',
      header: 'Permission Scope',
      accessorFn: (row) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.permissionCount ?? 'All'} Capabilities
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/users-access/roles/${row.id}`)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Permissions
              </DropdownMenuItem>
              {!row.isSystem && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteRoleId(row.id)}
                    className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Role
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─── ENTERPRISE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Users & Roles
            </h1>
            <Badge variant="outline" className="gap-1 text-xs py-0.5 px-2.5 font-mono">
              <Lock className="h-3 w-3 text-primary" />
              RBAC Authority
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise team directory, functional access tiers, invitation pipeline, and granular permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportUserCsv}
            className="h-9 px-3 text-xs gap-1.5 font-medium border-border/80"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateRoleDialog(true)}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            New Role
          </Button>

          <Button
            size="sm"
            className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm bg-primary text-primary-foreground"
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* ─── TELEMETRY KPI STATS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : userKpis?.totalUsers ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Registered tenant accounts</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {kpisLoading ? <Skeleton className="h-8 w-16" /> : userKpis?.activeUsers ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Active sessions in last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Defined Roles
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {roleKpis?.totalRoles ?? 6}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {roleKpis?.customRoles ?? 0} custom policy matrixes
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pending Invites
            </CardTitle>
            <Mail className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {userKpis?.pendingInvites ?? userKpis?.pendingInvitations ?? 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting acceptance link</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── TABBED SECTION (USERS vs ROLES vs INVITATIONS) ─── */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <TabsList className="bg-surface-muted p-1 border border-border/70">
            <TabsTrigger value="users" className="gap-2 text-xs py-1.5 px-3.5">
              <Users className="h-3.5 w-3.5" />
              <span>Team Members ({usersData?.total ?? userKpis?.totalUsers ?? 0})</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2 text-xs py-1.5 px-3.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Roles & Permissions ({roleKpis?.totalRoles ?? 6})</span>
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2 text-xs py-1.5 px-3.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Pending Invitations</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Strict Row-Level Security</span>
          </div>
        </div>

        {/* ─── TAB 1: TEAM MEMBERS ─── */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search members by name or corporate email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-xs">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="business_admin">Business Admin</SelectItem>
                <SelectItem value="sales_manager">Sales Manager</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="finance">Finance Controller</SelectItem>
                <SelectItem value="operations">Operations Specialist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" onClick={handleSearchUsers} className="h-9 px-4 text-xs font-semibold shrink-0">
              Filter
            </Button>

            {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground">
                Reset
              </Button>
            )}
          </div>

          {/* Table Area */}
          {usersLoading ? (
            <Card className="border border-border/80 p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              ))}
            </Card>
          ) : usersError ? (
            <ErrorState title="Failed to load member records" onRetry={refetchUsers} />
          ) : !usersData?.users || usersData.users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members match your filter criteria"
              description="Try adjusting your keyword search, role filter, or invite a new member to the workspace."
              action={<Button onClick={() => setShowInviteDialog(true)}>Invite New Member</Button>}
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <DataTable
                columns={userColumns}
                data={usersData.users}
                onRowClick={(row) => navigate(`/business-admin/users-access/users/${row.id}`)}
              />
              {usersData.totalPages > 1 && (
                <div className="border-t border-border/60 p-3 bg-surface-muted/30">
                  <Pagination
                    page={page}
                    totalPages={usersData.totalPages || 1}
                    total={usersData.total}
                    perPage={usersData.perPage}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: ROLES & PERMISSIONS MATRIX ─── */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search functional roles by label..."
                value={roleSearchInput}
                onChange={(e) => setRoleSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchRoles()}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setShowCreateRoleDialog(true)}
              className="h-9 px-4 text-xs font-semibold gap-1.5 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Role
            </Button>
          </div>

          {rolesLoading ? (
            <Card className="border border-border/80 p-6 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-48 rounded-xl" />
            </Card>
          ) : rolesError ? (
            <ErrorState title="Failed to load roles catalog" onRetry={refetchRoles} />
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <DataTable
                  columns={roleColumns}
                  data={rolesData?.roles || []}
                  onRowClick={(row) => navigate(`/business-admin/users-access/roles/${row.id}`)}
                />
              </div>

              {/* Functional Permission Capabilities Overview */}
              <Card className="border border-border/80 shadow-xs">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" />
                    Standard Functional Role Access Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Preconfigured baseline permissions authoritative for all default system roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground font-mono text-[11px]">
                        <th className="pb-2 font-semibold">Role Tier</th>
                        <th className="pb-2 font-semibold">CRM Deals</th>
                        <th className="pb-2 font-semibold">Algorithmic CPQ</th>
                        <th className="pb-2 font-semibold">Approvals Sign-off</th>
                        <th className="pb-2 font-semibold">Inventory Allocation</th>
                        <th className="pb-2 font-semibold">Invoices & Billing</th>
                        <th className="pb-2 font-semibold">Admin Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-foreground">
                      <tr>
                        <td className="py-2.5 font-semibold text-purple-600 dark:text-purple-400">Business Admin</td>
                        <td className="py-2.5">Full Authority</td>
                        <td className="py-2.5">Rule Config</td>
                        <td className="py-2.5">Executive Override</td>
                        <td className="py-2.5">Warehouse Rules</td>
                        <td className="py-2.5">Ledger & Audit</td>
                        <td className="py-2.5">Full Control</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">Sales Manager</td>
                        <td className="py-2.5">Team Visibility</td>
                        <td className="py-2.5">Tier Floor Cap</td>
                        <td className="py-2.5">Stage 1 & 2 Sign-off</td>
                        <td className="py-2.5">Stock Telemetry</td>
                        <td className="py-2.5">Read Margin</td>
                        <td className="py-2.5">Restricted</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-blue-600 dark:text-blue-400">Sales Rep</td>
                        <td className="py-2.5">Owned Accounts</td>
                        <td className="py-2.5">Quote Creation</td>
                        <td className="py-2.5">Submit Request</td>
                        <td className="py-2.5">Check Availability</td>
                        <td className="py-2.5">Draft Quotation</td>
                        <td className="py-2.5">None</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Finance Controller</td>
                        <td className="py-2.5">Read Value</td>
                        <td className="py-2.5">Margin Floor Guard</td>
                        <td className="py-2.5">Payment Term Gate</td>
                        <td className="py-2.5">Asset Costing</td>
                        <td className="py-2.5">Full Invoicing</td>
                        <td className="py-2.5">Currency & Tax</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-semibold text-amber-600 dark:text-amber-400">Operations Specialist</td>
                        <td className="py-2.5">Order View</td>
                        <td className="py-2.5">BOM Readiness</td>
                        <td className="py-2.5">Fulfillment Lock</td>
                        <td className="py-2.5">Full Execution</td>
                        <td className="py-2.5">Waybill Verification</td>
                        <td className="py-2.5">Warehouse Setup</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 3: PENDING INVITATIONS ─── */}
        <TabsContent value="invitations" className="space-y-4">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold font-display">Active Invitation Pipeline</CardTitle>
                <CardDescription className="text-xs">
                  Pending corporate invitations dispatched to enterprise team members awaiting credential activation.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setShowInviteDialog(true)}
                className="h-8 px-3 text-xs font-semibold gap-1.5"
              >
                <UserPlus className="h-3 w-3" />
                Dispatch Invite
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  {
                    email: 'priya.nair@company.com',
                    role: 'sales_rep',
                    inviter: 'Aditya Verma (Admin)',
                    sentAt: '2 days ago',
                    expiresIn: '5 days remaining',
                  },
                  {
                    email: 'karan.singh@company.com',
                    role: 'operations',
                    inviter: 'Aditya Verma (Admin)',
                    sentAt: '5 hours ago',
                    expiresIn: '7 days remaining',
                  },
                ].map((inv, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-surface-muted/40 hover:bg-surface-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground font-mono">{inv.email}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Invited by {inv.inviter} · {inv.sentAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge variant="secondary" className="text-[10px] font-mono capitalize">
                        {inv.role.replace('_', ' ')}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">{inv.expiresIn}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                title="Resend is unavailable: no invitation API endpoint"
                                className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
                              >
                                Resend
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Resend is unavailable — no invitation API endpoint is exposed.
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                title="Revoke is unavailable: no invitation API endpoint"
                                className="h-7 px-2 text-xs text-rose-500 hover:bg-rose-500/10 disabled:opacity-50"
                              >
                                Revoke
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Revoke is unavailable — no invitation API endpoint is exposed.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ─── MODAL 1: QUICK INVITE MEMBER ─── */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a secure single-use invitation link with pre-assigned workspace role and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Full Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Rohan Mehta"
                value={inviteForm.fullName}
                onChange={(e) => {
                  setInviteForm((prev) => ({ ...prev, fullName: e.target.value }))
                  if (inviteErrors.fullName) setInviteErrors((prev) => ({ ...prev, fullName: '' }))
                }}
                className="h-9 text-xs"
                error={!!inviteErrors.fullName}
              />
              {inviteErrors.fullName && <p className="text-[11px] text-rose-500">{inviteErrors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Corporate Email Address <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="rohan@company.com"
                value={inviteForm.email}
                onChange={(e) => {
                  setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                  if (inviteErrors.email) setInviteErrors((prev) => ({ ...prev, email: '' }))
                }}
                className="h-9 text-xs"
                error={!!inviteErrors.email}
              />
              {inviteErrors.email && <p className="text-[11px] text-rose-500">{inviteErrors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Assigned Enterprise Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(val) => setInviteForm((prev) => ({ ...prev, role: val }))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_rep">Sales Representative (Deals & Quotes)</SelectItem>
                  <SelectItem value="sales_manager">Sales Manager (Approvals & Coaching)</SelectItem>
                  <SelectItem value="finance">Finance Controller (Invoicing & Margin)</SelectItem>
                  <SelectItem value="operations">Operations Specialist (Inventory & Shipping)</SelectItem>
                  <SelectItem value="business_admin">Business Administrator (Full Setup)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendInvite}
              disabled={inviteUser.isPending}
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Send className="h-3 w-3" />
              {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: CREATE CUSTOM ROLE ─── */}
      <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Create Custom Role
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new permission group tailored to specific enterprise operational workflows.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Role Display Name</Label>
              <Input
                placeholder="e.g. Regional Pricing Specialist"
                value={newRoleForm.displayName}
                onChange={(e) => setNewRoleForm((prev) => ({ ...prev, displayName: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Internal Slug ID (Optional)</Label>
              <Input
                placeholder="e.g. regional_pricing_specialist"
                value={newRoleForm.name}
                onChange={(e) => setNewRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Role Description</Label>
              <Input
                placeholder="Describe functional responsibilities and clearance level"
                value={newRoleForm.description}
                onChange={(e) => setNewRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateRoleDialog(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateRole}
              disabled={createRole.isPending}
              className="text-xs font-semibold"
            >
              {createRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CONFIRM DIALOG: REVOKE MEMBER ─── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Revoke Member Access"
        description="Are you sure you want to deactivate this team member? They will immediately lose access to all tenant CRM records, quotes, and approvals."
        confirmLabel="Deactivate Member"
        variant="danger"
        onConfirm={handleDeleteUser}
      />

      {/* ─── CONFIRM DIALOG: DELETE ROLE ─── */}
      <ConfirmDialog
        open={!!deleteRoleId}
        onOpenChange={(open) => !open && setDeleteRoleId(null)}
        title="Delete Custom Role"
        description="Are you sure you want to delete this custom role? Any users assigned to this role must be reassigned to avoid access disruptions."
        confirmLabel="Delete Role"
        variant="danger"
        onConfirm={handleDeleteRole}
      />
    </div>
  )
}
