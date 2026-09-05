import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/datatable/pagination'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useApprovalChains, useApprovalChainKpis, useCreateApprovalChain, useUpdateApprovalChain, useDeleteApprovalChain } from '../hooks/use-business-admin'
import type { ApprovalChain, ApprovalChainFilters } from '../types'
import { toast } from 'sonner'
import { Plus, Search, MoreHorizontal, Eye, Edit, Power, Trash2, ArrowDown, CheckCircle, AlertTriangle, Users, Settings, GitBranch } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOGIC_VARIANT: Record<string, 'info' | 'intelligence' | 'warning'> = {
  sequential: 'info',
  parallel: 'intelligence',
  conditional: 'warning',
}

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  inactive: 'secondary',
  draft: 'warning',
}

const APPROVER_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'intelligence'> = {
  user: 'default',
  role: 'info',
  team: 'success',
}

function ApprovalChainsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingChain, setEditingChain] = useState<ApprovalChain | null>(null)
  const [viewingChain, setViewingChain] = useState<ApprovalChain | null>(null)

  const filters: ApprovalChainFilters = { search, status: statusFilter, page, perPage: 10 }
  const { data, isLoading, error, refetch } = useApprovalChains(filters)
  const { data: kpis, isLoading: kpisLoading } = useApprovalChainKpis()
  const createApprovalChain = useCreateApprovalChain()
  const updateApprovalChain = useUpdateApprovalChain()
  const deleteApprovalChain = useDeleteApprovalChain()

  const handleSearch = () => { setSearch(searchInput); setPage(1) }
  const handleClearFilters = () => { setSearch(''); setSearchInput(''); setStatusFilter(''); setPage(1) }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteApprovalChain.mutateAsync(deleteId); toast.success('Approval chain deleted'); setDeleteId(null) }
    catch { toast.error('Failed to delete approval chain') }
  }

  const handleToggleStatus = (chain: ApprovalChain) => {
    toast.info(`Toggle status for ${chain.name} coming soon`)
  }

  const handleSubmit = async (formData: Partial<ApprovalChain>, isEdit = false) => {
    try {
      if (isEdit && editingChain) {
        await updateApprovalChain.mutateAsync({ id: editingChain.id, data: formData })
        toast.success('Approval chain updated')
      } else {
        await createApprovalChain.mutateAsync(formData as any)
        toast.success('Approval chain created')
      }
      setIsCreateOpen(false)
      setEditingChain(null)
      refetch()
    } catch { toast.error(isEdit ? 'Failed to update approval chain' : 'Failed to create approval chain') }
  }

  const getFormDefaults = (chain?: ApprovalChain) => ({
    name: chain?.name || '',
    description: chain?.description || '',
    triggerDescription: chain?.triggerDescription || '',
    logic: chain?.logic || 'sequential',
    steps: chain?.steps || [{ order: 1, approverType: 'role' as const, approverId: '', approverName: '', approverRole: '', slaMinutes: 1440 }],
    status: chain?.status || 'active',
  })

  const [formData, setFormData] = useState(getFormDefaults())
  const [stepForms, setStepForms] = useState<any[]>([{ order: 1, approverType: 'role', approverId: '', approverName: '', approverRole: '', slaMinutes: 1440 }])

  useEffect(() => {
    if (editingChain) setFormData(getFormDefaults(editingChain))
    else setFormData(getFormDefaults())
    if (editingChain?.steps) setStepForms(editingChain.steps.map(s => ({ ...s })))
    else setStepForms([{ order: 1, approverType: 'role', approverId: '', approverName: '', approverRole: '', slaMinutes: 1440 }])
  }, [editingChain])

  const handleStepChange = (index: number, field: string, value: any) => {
    setStepForms(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const addStep = () => setStepForms(prev => [...prev, { order: prev.length + 1, approverType: 'role', approverId: '', approverName: '', approverRole: '', slaMinutes: 1440 }])
  const removeStep = (index: number) => {
    if (stepForms.length <= 1) return
    setStepForms(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit({ ...formData, steps: stepForms }, !!editingChain)
  }

  const handleOpenCreate = () => { setFormData(getFormDefaults()); setEditingChain(null); setIsCreateOpen(true) }
  const handleOpenEdit = (chain: ApprovalChain) => { setEditingChain(chain); setIsCreateOpen(true) }
  const handleOpenView = (chain: ApprovalChain) => { setViewingChain(chain) }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Chains"
        description="Configure sequential, parallel, or conditional approval chains that define who approves and in what order"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Approval Configuration' },
          { label: 'Approval Chains' },
        ]}
        actions={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1.5" />Create Chain</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpisLoading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
          <>
            <KpiCard label="Total Chains" value={kpis?.totalChains ?? 0} icon={<GitBranch className="h-5 w-5" />} />
            <KpiCard label="Active Chains" value={kpis?.activeChains ?? 0} variant="success" icon={<CheckCircle className="h-5 w-5" />} />
            <KpiCard label="Total Steps" value={kpis?.totalSteps ?? 0} variant="info" icon={<Settings className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input placeholder="Search approval chains..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button variant="outline" size="icon" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter || search) && <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear Filters</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : error ? (
        <ErrorState title="Failed to load approval chains" onRetry={refetch} />
      ) : !data?.chains || data.chains.length === 0 ? (
        <EmptyState icon={<GitBranch className="h-8 w-8" />} title="No approval chains found" description="Create your first approval chain to define approval routing." action={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-1.5" />Create Chain</Button>} />
      ) : (
        <div className="space-y-4">
          {data.chains.map(chain => (
            <Card key={chain.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-foreground">{chain.name}</p>
                      <Badge variant={LOGIC_VARIANT[chain.logic] || 'secondary'}>{chain.logic}</Badge>
                      <Badge variant={STATUS_VARIANT[chain.status] || 'secondary'}>{chain.status}</Badge>
                    </div>
                    {chain.description && <p className="text-sm text-muted-foreground mt-1">{chain.description}</p>}
                    {chain.triggerDescription && <p className="text-xs text-muted-foreground mt-0.5">Trigger: {chain.triggerDescription}</p>}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenView(chain)}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEdit(chain)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(chain)}><Power className="h-4 w-4 mr-2" />{chain.status === 'active' ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeleteId(chain.id)} className="text-danger"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2 pt-3 border-t">
                  {chain.steps.map((step, idx) => (
                    <div key={step.id || idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{step.order}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{step.approverName}</p>
                        <p className="text-xs text-muted-foreground">{step.approverRole} • SLA: {step.slaMinutes} min</p>
                      </div>
                      <Badge variant={APPROVER_VARIANT[step.approverType] || 'secondary'} className="gap-1">
                        <Users className="h-3 w-3" />
                        {step.approverType}
                      </Badge>
                      {idx < chain.steps.length - 1 && <ArrowDown className="text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {data.totalPages > 1 && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} perPage={data.perPage} onPageChange={setPage} />}
        </div>
      )}

      <Dialog open={!!viewingChain} onOpenChange={() => setViewingChain(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewingChain?.name}</DialogTitle></DialogHeader>
          <DialogContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="text-muted-foreground">Logic</p><p className="font-medium"><Badge variant={LOGIC_VARIANT[viewingChain?.logic || '']}>{viewingChain?.logic}</Badge></p></div><div><p className="text-muted-foreground">Steps</p><p className="font-medium">{viewingChain?.steps.length}</p></div><div><p className="text-muted-foreground">Status</p><p className="font-medium"><Badge variant={STATUS_VARIANT[viewingChain?.status || '']}>{viewingChain?.status}</Badge></p></div></div>
              <div className="pt-4 border-t"><p className="font-medium mb-2">Approval Steps</p><div className="space-y-2">{viewingChain?.steps.map((step, idx) => (<div key={step.id || idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{step.order}</div><div className="flex-1"><p className="font-medium">{step.approverName}</p><p className="text-sm text-muted-foreground">{step.approverRole} • SLA: {step.slaMinutes} min</p></div><Badge variant={APPROVER_VARIANT[step.approverType]}>{step.approverType}</Badge>{idx < (viewingChain?.steps.length || 0) - 1 && <ArrowDown className="text-muted-foreground" />}</div>))}</div></div>
            </div>
          </DialogContent>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={() => { setIsCreateOpen(false); setEditingChain(null) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingChain ? 'Edit Approval Chain' : 'Create Approval Chain'}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 p-4 pb-6">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required placeholder="e.g., Finance Approval Chain" /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description" /></div>
            <div className="space-y-2"><Label>Trigger Description</Label><Input value={formData.triggerDescription} onChange={e => setFormData(prev => ({ ...prev, triggerDescription: e.target.value }))} placeholder="e.g., Discount > 15%" /></div>
            <div className="space-y-2"><Label>Logic *</Label><Select value={formData.logic} onValueChange={v => setFormData(prev => ({ ...prev, logic: v as any }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select logic" /></SelectTrigger><SelectContent><SelectItem value="sequential">Sequential</SelectItem><SelectItem value="parallel">Parallel</SelectItem><SelectItem value="conditional">Conditional</SelectItem></SelectContent></Select></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between"><Label className="mb-0">Approval Steps</Label><Button type="button" variant="outline" size="sm" onClick={addStep}><Plus className="h-3.5 w-3.5 mr-1" />Add Step</Button></div>
              {stepForms.map((step, index) => (
                <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between"><span className="font-medium">Step {step.order}</span>{stepForms.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)} className="text-danger"><Trash2 className="h-4 w-4" /></Button>}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Approver Type</Label><Select value={step.approverType} onValueChange={v => handleStepChange(index, 'approverType', v)}><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="role">Role</SelectItem><SelectItem value="team">Team</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Approver Name *</Label><Input value={step.approverName} onChange={e => handleStepChange(index, 'approverName', e.target.value)} required placeholder="e.g., Sarah Lee" /></div>
                    <div className="space-y-2"><Label>Approver Role</Label><Input value={step.approverRole} onChange={e => handleStepChange(index, 'approverRole', e.target.value)} placeholder="e.g., Finance" /></div>
                    <div className="space-y-2"><Label>SLA (minutes) *</Label><Input type="number" min="1" value={step.slaMinutes} onChange={e => handleStepChange(index, 'slaMinutes', parseInt(e.target.value) || 1440)} required placeholder="1440" /></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v as any }))}><SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select></div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setEditingChain(null) }}>Cancel</Button>
              <Button type="submit" disabled={createApprovalChain.isPending || updateApprovalChain.isPending}>
                {createApprovalChain.isPending || updateApprovalChain.isPending ? 'Saving...' : (editingChain ? 'Update Chain' : 'Create Chain')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Delete approval chain?" description="This action cannot be undone. Rules using this chain will need to be updated." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} loading={deleteApprovalChain.isPending} />
    </div>
  )
}

export { ApprovalChainsPage }