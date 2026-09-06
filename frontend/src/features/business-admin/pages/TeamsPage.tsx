import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Drawer } from '@/components/ui/drawer'
import { useTeams, useTeamKpis, useCreateTeam, useUpdateTeam, useDeleteTeam, useTeamDetail, useUsers } from '../hooks/use-business-admin'
import type { Team } from '../types'
import { toast } from 'sonner'
import { Plus, Search, UsersRound, UserCheck, Activity, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function TeamsPage() {
  const navigate = useNavigate()
  const { teamId } = useParams()
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const activeTeamId = teamId || selectedTeamId
  const { data: teamDetail, isLoading: teamDetailLoading } = useTeamDetail(activeTeamId || '')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '', leadId: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<{ id: string; name: string; description: string; status: string; leadId: string } | null>(null)

  const filters = { search, status: statusFilter === 'all' ? '' : statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useTeams(filters)
  const { data: kpis, isLoading: kpisLoading } = useTeamKpis()
  const { data: usersData } = useUsers({ perPage: 100 })
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleCreate = async () => {
    if (!newTeam.name.trim()) {
      toast.error('Team name is required')
      return
    }
    try {
      await createTeam.mutateAsync({
        name: newTeam.name.trim(),
        description: newTeam.description.trim() || undefined,
        ...(newTeam.leadId ? { leadId: newTeam.leadId } : {}),
      })
      toast.success('Team created')
      setShowCreateDialog(false)
      setNewTeam({ name: '', description: '', leadId: '' })
    } catch {
      toast.error('Failed to create team')
    }
  }

  const handleUpdate = async () => {
    if (!editingTeam) return
    if (!editingTeam.name.trim()) {
      toast.error('Team name is required')
      return
    }
    try {
      await updateTeam.mutateAsync({
        id: editingTeam.id,
        data: {
          name: editingTeam.name.trim(),
          description: editingTeam.description.trim(),
          status: editingTeam.status,
          ...(editingTeam.leadId ? { lead: { id: editingTeam.leadId } as Team['lead'] } : {}),
        },
      })
      toast.success('Team updated')
      setEditingTeam(null)
    } catch {
      toast.error('Failed to update team')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteTeam.mutateAsync(deleteId)
      toast.success('Team archived')
      setDeleteId(null)
    } catch {
      toast.error('Failed to archive team')
    }
  }

  const columns: Column<Team>[] = [
    {
      id: 'name', header: 'Team',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.name}</p>
          {row.description && <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'lead', header: 'Lead',
      accessorFn: (row) => {
        const leadName = row.lead?.fullName || ''
        const initials = leadName
          ? leadName.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase() || '—'
          : '—'
        return row.lead ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] text-foreground">{leadName || 'Unnamed Lead'}</span>
          </div>
        ) : <span className="text-[12px] text-muted-foreground">—</span>
      },
    },
    { id: 'members', header: 'Members', accessorFn: (row) => <span className="tabular-nums">{row.memberCount}</span> },
    { id: 'deals', header: 'Deals', accessorFn: (row) => <span className="tabular-nums">{row.dealsCount}</span> },
    { id: 'status', header: 'Status', accessorFn: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{row.status}</Badge>
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
              <DropdownMenuItem onClick={() => setSelectedTeamId(row.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setEditingTeam({
                  id: row.id,
                  name: row.name || '',
                  description: row.description || '',
                  status: row.status || 'active',
                  leadId: row.lead?.id || '',
                })}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Archive
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
        title="Teams"
        description="Manage your business teams and their assignments."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access' },
          { label: 'Teams' },
        ]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Team
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Teams" value={kpis?.totalTeams ?? 0} icon={<UsersRound className="h-5 w-5" />} />
            <KpiCard label="Total Members" value={kpis?.totalMembers ?? 0} variant="info" icon={<UserCheck className="h-5 w-5" />} />
            <KpiCard label="Active Teams" value={kpis?.activeTeams ?? 0} variant="success" icon={<Activity className="h-5 w-5" />} />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search teams..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter || 'all'} onValueChange={(val) => { setStatusFilter(val === 'all' ? '' : val); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(''); setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load teams" onRetry={refetch} />
      ) : !data?.teams || data.teams.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-8 w-8" />}
          title="No teams yet"
          description="Create your first team to organize users."
          action={<Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-1.5" />Create Team</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.teams as unknown as Record<string, unknown>[]}
            onRowClick={(row) => setSelectedTeamId((row as unknown as Team).id)}
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

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label>Team Name *</Label>
              <Input
                value={newTeam.name}
                onChange={(e) => setNewTeam((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Enterprise Sales"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={newTeam.description}
                onChange={(e) => setNewTeam((p) => ({ ...p, description: e.target.value }))}
                className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description of the team's purpose"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Team Lead</Label>
              <Select value={newTeam.leadId || 'none'} onValueChange={(v) => setNewTeam((p) => ({ ...p, leadId: v === 'none' ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="No lead assigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No lead assigned</SelectItem>
                  {(usersData?.users || []).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.fullName || u.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} loading={createTeam.isPending}>Create Team</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Archive team?"
        description="This will archive the team. Team members will not be removed. You can restore the team later if needed."
        confirmLabel="Archive Team"
        variant="warning"
        onConfirm={handleDelete}
        loading={deleteTeam.isPending}
      />

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => { if (!open) setEditingTeam(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label>Team Name *</Label>
                <Input
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam((p) => (p ? { ...p, name: e.target.value } : p))}
                  placeholder="e.g. Enterprise Sales"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam((p) => (p ? { ...p, description: e.target.value } : p))}
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Brief description of the team's purpose"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Team Lead</Label>
                <Select value={editingTeam.leadId || 'none'} onValueChange={(v) => setEditingTeam((p) => (p ? { ...p, leadId: v === 'none' ? '' : v } : p))}>
                  <SelectTrigger><SelectValue placeholder="No lead assigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead assigned</SelectItem>
                    {(usersData?.users || []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.fullName || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editingTeam.status} onValueChange={(v) => setEditingTeam((p) => (p ? { ...p, status: v } : p))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingTeam(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Drawer
        open={Boolean(activeTeamId)}
        onClose={() => {
          setSelectedTeamId(null)
          navigate('/business-admin/teams')
        }}
        title={teamDetail?.name || 'Team Details'}
        description={teamDetail?.description || 'Team overview and members'}
      >
        {teamDetailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : teamDetail ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-caption text-muted-foreground">Status</span>
                <div className="mt-1">
                  <Badge variant={teamDetail.status === 'active' ? 'success' : 'secondary'}>
                    {teamDetail.status || 'Active'}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-caption text-muted-foreground">Deals</span>
                <p className="text-h3 font-semibold tabular-nums mt-0.5">{teamDetail.dealsCount ?? 0}</p>
              </div>
            </div>

            {teamDetail.lead && (
              <div className="rounded-xl border border-border p-4 bg-surface-muted">
                <span className="text-caption text-muted-foreground block mb-2 font-medium">Team Lead</span>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-caption font-bold">
                      {teamDetail.lead.fullName
                        ? teamDetail.lead.fullName.split(' ').map((n: string) => n[0]).filter(Boolean).join('').toUpperCase() || 'TL'
                        : 'TL'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-body-small font-semibold text-foreground">{teamDetail.lead.fullName}</p>
                    <p className="text-caption text-muted-foreground">{teamDetail.lead.email || 'Lead'}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-body font-semibold text-foreground">Team Members</h3>
                <Badge variant="outline">{teamDetail.members?.length ?? teamDetail.memberCount ?? 0}</Badge>
              </div>
              {teamDetail.members && teamDetail.members.length > 0 ? (
                <div className="space-y-2">
                  {teamDetail.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[11px]">
                            {member.fullName?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-body-small font-medium text-foreground">{member.fullName}</p>
                          <p className="text-caption text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-caption">{member.role?.replace(/_/g, ' ') || 'Member'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-small text-muted-foreground py-4 text-center">No assigned members yet.</p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="Team not found" description="The requested team could not be loaded." />
        )}
      </Drawer>
    </div>
  )
}
