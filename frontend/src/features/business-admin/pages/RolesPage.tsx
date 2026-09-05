import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Pagination } from '@/components/ui/datatable/pagination'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRoles, useRoleKpis, useCreateRole, useDeleteRole } from '../hooks/use-business-admin'
import type { Role } from '../types'
import { toast } from 'sonner'
import { Shield, Search, Users, Plus, MoreHorizontal, Eye, Copy, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function RolesPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', displayName: '', description: '' })

  const filters = { search, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useRoles(filters)
  const { data: kpis, isLoading: kpisLoading } = useRoleKpis()
  const createRole = useCreateRole()
  const deleteRole = useDeleteRole()

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleCreate = async () => {
    if (!newRole.name || !newRole.displayName) {
      toast.error('Name and display name are required')
      return
    }
    try {
      await createRole.mutateAsync(newRole)
      toast.success('Role created')
      setShowCreateDialog(false)
      setNewRole({ name: '', displayName: '', description: '' })
    } catch {
      toast.error('Failed to create role')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteRole.mutateAsync(deleteId)
      toast.success('Role deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete role')
    }
  }

  const columns: Column<Role>[] = [
    {
      id: 'role',
      header: 'Role',
      accessorFn: (row) => (
        <div>
          <p className="text-[13px] font-semibold text-foreground">{row.displayName}</p>
          {row.description && <p className="text-[11px] text-muted-foreground">{row.description}</p>}
        </div>
      ),
    },
    {
      id: 'users',
      header: 'Users',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.userCount}</span>
      ),
    },
    {
      id: 'permissions',
      header: 'Permissions',
      accessorFn: (row) => (
        <span className="text-[13px] text-muted-foreground tabular-nums">{row.permissionCount}</span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorFn: (row) => (
        <Badge variant={row.isSystem ? 'secondary' : 'outline'}>
          {row.isSystem ? 'System' : 'Custom'}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      accessorFn: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/business-admin/users-access/roles/${row.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Duplicate coming soon')}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {!row.isSystem && (
                <DropdownMenuItem onClick={() => setDeleteId(row.id)} className="text-danger">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage roles and configure permission sets for your business."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access' },
          { label: 'Roles' },
        ]}
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard label="Total Roles" value={kpis?.totalRoles ?? 0} icon={<Shield className="h-5 w-5" />} />
            <KpiCard label="Custom Roles" value={kpis?.customRoles ?? 0} variant="info" icon={<Plus className="h-5 w-5" />} />
            <KpiCard label="System Roles" value={kpis?.systemRoles ?? 0} variant="warning" icon={<Shield className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input
            placeholder="Search roles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}>
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : error ? (
        <ErrorState title="Failed to load roles" onRetry={refetch} />
      ) : !data?.roles || data.roles.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No roles found"
          description="Create your first custom role to get started."
          action={<Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-1.5" />Create Role</Button>}
        />
      ) : (
        <>
          <DataTable
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            data={data.roles as unknown as Record<string, unknown>[]}
            onRowClick={(row) => navigate(`/business-admin/users-access/roles/${(row as unknown as Role).id}`)}
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
        title="Delete role?"
        description="This action cannot be undone. Users assigned to this role will lose its permissions."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deleteRole.isPending}
      />

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Name</label>
              <Input
                placeholder="e.g. marketing_manager"
                value={newRole.name}
                onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Display Name</label>
              <Input
                placeholder="e.g. Marketing Manager"
                value={newRole.displayName}
                onChange={(e) => setNewRole((p) => ({ ...p, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Description</label>
              <Input
                placeholder="Optional description"
                value={newRole.description}
                onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createRole.isPending}>
              {createRole.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
