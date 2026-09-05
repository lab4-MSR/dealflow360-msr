import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useTeams, useTeamKpis, useCreateTeam, useDeleteTeam } from '../hooks/use-business-admin'
import type { Team } from '../types'
import { toast } from 'sonner'
import { Plus, Search, UsersRound, UserCheck, Activity, MoreHorizontal, Eye, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function TeamsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = { search, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useTeams(filters)
  const { data: kpis, isLoading: kpisLoading } = useTeamKpis()
  const createTeam = useCreateTeam()
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
      await createTeam.mutateAsync(newTeam)
      toast.success('Team created')
      setShowCreateDialog(false)
      setNewTeam({ name: '', description: '' })
    } catch {
      toast.error('Failed to create team')
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
      accessorFn: (row) => row.lead ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
              {row.lead.fullName.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px] text-foreground">{row.lead.fullName}</span>
        </div>
      ) : <span className="text-[12px] text-muted-foreground">—</span>,
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
              <DropdownMenuItem onClick={() => navigate(`/business-admin/users-access/teams/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
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
            onRowClick={(row) => navigate(`/business-admin/users-access/teams/${(row as unknown as Team).id}`)}
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
    </div>
  )
}
