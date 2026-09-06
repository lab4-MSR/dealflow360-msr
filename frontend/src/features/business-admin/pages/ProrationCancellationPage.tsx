import { useState, useMemo } from 'react'
import {
  Plus, Search, Edit, Trash2, RefreshCw, Calendar,
  Percent, Clock, Shield, FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { DataTable, type Column } from '@/components/ui/datatable/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  useProrationRules, useCreateProrationRule, useUpdateProrationRules, useDeleteProrationRule,
  useCancellationRules, useCreateCancellationRule, useUpdateCancellationRules, useDeleteCancellationRule,
} from '../hooks/use-business-admin'
import type { ProrationRule, CancellationRule } from '../types'

const PRORATION_LABELS: Record<string, string> = {
  daily: 'Daily', monthly: 'Monthly', usage_based: 'Usage-Based',
  flat: 'Flat Rate', none: 'None',
}

const CANCELLATION_POLICY_LABELS: Record<string, string> = {
  end_of_cycle: 'End of Billing Cycle', immediate: 'Immediate', custom: 'Custom Date',
}

const REFUND_POLICY_LABELS: Record<string, string> = {
  prorated: 'Prorated Refund', full: 'Full Refund', none: 'No Refund', partial: 'Partial Refund',
}

const REMAINING_PERIOD_LABELS: Record<string, string> = {
  full: 'Full Period', remaining: 'Remaining Days', none: 'None',
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'secondary'
    case 'draft': return 'warning'
    case 'archived': return 'danger'
    default: return 'default'
  }
}

const emptyProrationForm: Partial<ProrationRule> = {
  name: '', description: '', upgradeRule: 'daily', downgradeRule: 'none',
  midCycleChange: 'daily', remainingPeriod: 'full', billingAdjustment: 'credit', status: 'active',
}

const emptyCancellationForm: Partial<CancellationRule> = {
  name: '', description: '', cancellationPolicy: 'end_of_cycle', refundPolicy: 'prorated',
  effectiveDate: '', noticePeriod: 30, eligibility: 'all', status: 'active',
}

function KpiCard({ title, value, icon: Icon, loading }: {
  title: string; value: string | number;
  icon: React.ComponentType<{ className?: string }>; loading?: boolean
}) {
  if (loading) {
    return (
      <Card><CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1 flex-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-6 w-12" /></div>
        </div>
      </CardContent></Card>
    )
  }
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
        <div><p className="text-sm text-muted-foreground">{title}</p><p className="text-2xl font-bold">{value}</p></div>
      </div>
    </CardContent></Card>
  )
}
export function ProrationCancellationPage() {
  const [activeTab, setActiveTab] = useState('proration')
  const [prorationSearch, setProrationSearch] = useState('')
  const [prorationStatusFilter, setProrationStatusFilter] = useState<string>('all')
  const [prorationDialogOpen, setProrationDialogOpen] = useState(false)
  const [editingProration, setEditingProration] = useState<ProrationRule | null>(null)
  const [prorationForm, setProrationForm] = useState<Partial<ProrationRule>>(emptyProrationForm)
  const [prorationDeleteId, setProrationDeleteId] = useState<string | null>(null)
  const [cancellationSearch, setCancellationSearch] = useState('')
  const [cancellationStatusFilter, setCancellationStatusFilter] = useState<string>('all')
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false)
  const [editingCancellation, setEditingCancellation] = useState<CancellationRule | null>(null)
  const [cancellationForm, setCancellationForm] = useState<Partial<CancellationRule>>(emptyCancellationForm)
  const [cancellationDeleteId, setCancellationDeleteId] = useState<string | null>(null)

  const { data: prorationRules, isLoading: prorationLoading, error: prorationError, refetch: refetchProration } = useProrationRules()
  const createProration = useCreateProrationRule()
  const updateProration = useUpdateProrationRules()
  const deleteProration = useDeleteProrationRule()
  const { data: cancellationRules, isLoading: cancellationLoading, error: cancellationError, refetch: refetchCancellation } = useCancellationRules()
  const createCancellation = useCreateCancellationRule()
  const updateCancellation = useUpdateCancellationRules()
  const deleteCancellation = useDeleteCancellationRule()

  const filteredProrationRules = useMemo(() => {
    if (!prorationRules) return []
    let filtered = prorationRules
    if (prorationSearch) {
      const q = prorationSearch.toLowerCase()
      filtered = filtered.filter((r) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    }
    if (prorationStatusFilter !== 'all') filtered = filtered.filter((r) => r.status === prorationStatusFilter)
    return filtered
  }, [prorationRules, prorationSearch, prorationStatusFilter])

  const filteredCancellationRules = useMemo(() => {
    if (!cancellationRules) return []
    let filtered = cancellationRules
    if (cancellationSearch) {
      const q = cancellationSearch.toLowerCase()
      filtered = filtered.filter((r) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
    }
    if (cancellationStatusFilter !== 'all') filtered = filtered.filter((r) => r.status === cancellationStatusFilter)
    return filtered
  }, [cancellationRules, cancellationSearch, cancellationStatusFilter])

  // NOTE: KPIs are computed client-side over the fetched rule list. If the
  // backend paginates this endpoint, switch to server-side aggregates
  // (fetchProrationRuleKpis / fetchCancellationRuleKpis).
  const prorationKpis = useMemo(() => {
    const total = prorationRules?.length ?? 0
    const active = prorationRules?.filter((r) => r.status === 'active').length ?? 0
    const inactive = prorationRules?.filter((r) => r.status === 'inactive').length ?? 0
    const creditAdjustments = prorationRules?.filter((r) => r.billingAdjustment === 'credit').length ?? 0
    return { total, active, inactive, creditAdjustments }
  }, [prorationRules])

  const cancellationKpis = useMemo(() => {
    const total = cancellationRules?.length ?? 0
    const active = cancellationRules?.filter((r) => r.status === 'active').length ?? 0
    const inactive = cancellationRules?.filter((r) => r.status === 'inactive').length ?? 0
    const avgNotice = cancellationRules?.length
      ? Math.round(cancellationRules.reduce((sum, r) => sum + (r.noticePeriod || 0), 0) / cancellationRules.length) : 0
    return { total, active, inactive, avgNotice }
  }, [cancellationRules])
  const handleProrationAdd = () => {
    setEditingProration(null)
    setProrationForm(emptyProrationForm)
    setProrationDialogOpen(true)
  }
  const handleProrationEdit = (rule: ProrationRule) => {
    setEditingProration(rule)
    setProrationForm({ ...rule })
    setProrationDialogOpen(true)
  }
  const handleProrationSave = async () => {
    if (!prorationForm.name?.trim()) { toast.error('Rule name is required'); return }
    try {
      if (editingProration) {
        await updateProration.mutateAsync({ id: editingProration.id, data: prorationForm })
        toast.success('Proration rule updated successfully')
      } else {
        const { ...rest } = prorationForm
        await createProration.mutateAsync({
          ...rest,
          name: prorationForm.name.trim(),
          description: prorationForm.description ?? '',
          upgradeRule: prorationForm.upgradeRule ?? 'daily',
          downgradeRule: prorationForm.downgradeRule ?? 'none',
          midCycleChange: prorationForm.midCycleChange ?? 'daily',
          remainingPeriod: prorationForm.remainingPeriod ?? 'full',
          billingAdjustment: prorationForm.billingAdjustment ?? 'credit',
          status: prorationForm.status ?? 'active',
        })
        toast.success('Proration rule created successfully')
      }
      setProrationDialogOpen(false)
      setEditingProration(null)
    } catch { toast.error('Failed to save proration rule') }
  }
  const handleProrationDelete = async () => {
    if (!prorationDeleteId) return
    try {
      await deleteProration.mutateAsync(prorationDeleteId)
      toast.success('Proration rule deleted successfully')
      setProrationDeleteId(null)
    } catch { toast.error('Failed to delete proration rule') }
  }
  const handleCancellationAdd = () => {
    setEditingCancellation(null)
    setCancellationForm(emptyCancellationForm)
    setCancellationDialogOpen(true)
  }
  const handleCancellationEdit = (rule: CancellationRule) => {
    setEditingCancellation(rule)
    setCancellationForm({ ...rule })
    setCancellationDialogOpen(true)
  }
  const handleCancellationSave = async () => {
    if (!cancellationForm.name?.trim()) { toast.error('Rule name is required'); return }
    try {
      if (editingCancellation) {
        await updateCancellation.mutateAsync({ id: editingCancellation.id, data: cancellationForm })
        toast.success('Cancellation rule updated successfully')
      } else {
        const { ...rest } = cancellationForm
        await createCancellation.mutateAsync({
          ...rest,
          name: cancellationForm.name.trim(),
          description: cancellationForm.description ?? '',
          cancellationPolicy: cancellationForm.cancellationPolicy ?? 'end_of_cycle',
          refundPolicy: cancellationForm.refundPolicy ?? 'prorated',
          effectiveDate: cancellationForm.effectiveDate ?? '',
          noticePeriod: cancellationForm.noticePeriod ?? 30,
          eligibility: cancellationForm.eligibility ?? 'all',
          status: cancellationForm.status ?? 'active',
          ...rest,
        })
        toast.success('Cancellation rule created successfully')
      }
      setCancellationDialogOpen(false)
      setEditingCancellation(null)
    } catch { toast.error('Failed to save cancellation rule') }
  }
  const handleCancellationDelete = async () => {
    if (!cancellationDeleteId) return
    try {
      await deleteCancellation.mutateAsync(cancellationDeleteId)
      toast.success('Cancellation rule deleted successfully')
      setCancellationDeleteId(null)
    } catch { toast.error('Failed to delete cancellation rule') }
  }
  const prorationColumns: Column<ProrationRule>[] = [
    { id: 'name', header: 'Rule Name', accessorKey: 'name', className: 'font-medium' },
    { id: 'upgradeRule', header: 'Upgrade', accessorFn: (row) => PRORATION_LABELS[row.upgradeRule] || row.upgradeRule },
    { id: 'downgradeRule', header: 'Downgrade', accessorFn: (row) => PRORATION_LABELS[row.downgradeRule] || row.downgradeRule },
    { id: 'midCycleChange', header: 'Mid-Cycle', accessorFn: (row) => PRORATION_LABELS[row.midCycleChange] || row.midCycleChange },
    { id: 'status', header: 'Status', accessorFn: (row) => (<Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>) },
    { id: 'actions', header: 'Actions', accessorFn: (row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleProrationEdit(row) }}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setProrationDeleteId(row.id) }}><Trash2 className="h-4 w-4 text-danger" /></Button>
      </div>
    ) },
  ]

  const cancellationColumns: Column<CancellationRule>[] = [
    { id: 'name', header: 'Rule Name', accessorKey: 'name', className: 'font-medium' },
    { id: 'cancellationPolicy', header: 'Cancellation Policy', accessorFn: (row) => CANCELLATION_POLICY_LABELS[row.cancellationPolicy] || row.cancellationPolicy },
    { id: 'refundPolicy', header: 'Refund Policy', accessorFn: (row) => REFUND_POLICY_LABELS[row.refundPolicy] || row.refundPolicy },
    { id: 'noticePeriod', header: 'Notice (Days)', accessorKey: 'noticePeriod' },
    { id: 'status', header: 'Status', accessorFn: (row) => (<Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>) },
    { id: 'actions', header: 'Actions', accessorFn: (row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleCancellationEdit(row) }}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setCancellationDeleteId(row.id) }}><Trash2 className="h-4 w-4 text-danger" /></Button>
      </div>
    ) },
  ]
  return (
    <div className="space-y-4">
      <PageHeader
        title="Proration & Cancellation Rules"
        description="Configure how subscription plan changes and cancellations are handled."
        breadcrumbs={[{ label: 'Business Admin' }, { label: 'Proration & Cancellation' }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'proration' ? (
          <>
            <KpiCard title="Total Rules" value={prorationKpis.total} icon={Shield} loading={prorationLoading} />
            <KpiCard title="Active Rules" value={prorationKpis.active} icon={Percent} loading={prorationLoading} />
            <KpiCard title="Inactive Rules" value={prorationKpis.inactive} icon={Clock} loading={prorationLoading} />
            <KpiCard title="Credit Adjustments" value={prorationKpis.creditAdjustments} icon={Calendar} loading={prorationLoading} />
          </>
        ) : (
          <>
            <KpiCard title="Total Rules" value={cancellationKpis.total} icon={Shield} loading={cancellationLoading} />
            <KpiCard title="Active Rules" value={cancellationKpis.active} icon={Percent} loading={cancellationLoading} />
            <KpiCard title="Inactive Rules" value={cancellationKpis.inactive} icon={Clock} loading={cancellationLoading} />
            <KpiCard title="Avg Notice Period" value={`${cancellationKpis.avgNotice} days`} icon={Calendar} loading={cancellationLoading} />
          </>
        )}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="proration">Proration Rules</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="proration" className="space-y-4">
          {prorationError ? (
            <ErrorState title="Failed to load proration rules" description="There was an error loading the proration rules. Please try again." onRetry={refetchProration} />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Proration Rules</CardTitle>
                    <CardDescription>Manage how plan upgrades and downgrades are calculated mid-cycle.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetchProration()}><RefreshCw className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={handleProrationAdd}><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search rules..." value={prorationSearch} onChange={(e) => setProrationSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={prorationStatusFilter} onValueChange={setProrationStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {prorationLoading ? (
                  <LoadingState rows={5} />
                ) : filteredProrationRules.length === 0 ? (
                  <EmptyState icon={Shield} title="No proration rules found" description="Get started by creating your first proration rule."
                    action={<Button size="sm" onClick={handleProrationAdd}><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>} />
                ) : (
                  <DataTable columns={prorationColumns} data={filteredProrationRules} onRowClick={handleProrationEdit} getRowId={(row) => row.id} />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="cancellation" className="space-y-4">
          {cancellationError ? (
            <ErrorState title="Failed to load cancellation rules" description="There was an error loading the cancellation rules. Please try again." onRetry={refetchCancellation} />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Cancellation Rules</CardTitle>
                    <CardDescription>Define cancellation policies and refund eligibility for subscriptions.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetchCancellation()}><RefreshCw className="h-4 w-4" /></Button>
                    <Button size="sm" onClick={handleCancellationAdd}><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search rules..." value={cancellationSearch} onChange={(e) => setCancellationSearch(e.target.value)} className="pl-9" />
                  </div>
                  <Select value={cancellationStatusFilter} onValueChange={setCancellationStatusFilter}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {cancellationLoading ? (
                  <LoadingState rows={5} />
                ) : filteredCancellationRules.length === 0 ? (
                  <EmptyState icon={FileText} title="No cancellation rules found" description="Get started by creating your first cancellation rule."
                    action={<Button size="sm" onClick={handleCancellationAdd}><Plus className="h-4 w-4 mr-1" /> Add Rule</Button>} />
                ) : (
                  <DataTable columns={cancellationColumns} data={filteredCancellationRules} onRowClick={handleCancellationEdit} getRowId={(row) => row.id} />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={prorationDialogOpen} onOpenChange={setProrationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingProration ? 'Edit Proration Rule' : 'Create Proration Rule'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proration-name">Rule Name *</Label>
              <Input id="proration-name" value={prorationForm.name ?? ''} onChange={(e) => setProrationForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard Monthly Proration" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proration-desc">Description</Label>
              <Input id="proration-desc" value={prorationForm.description ?? ''} onChange={(e) => setProrationForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Upgrade Rule</Label>
                <Select value={prorationForm.upgradeRule ?? 'daily'} onValueChange={(v) => setProrationForm((p) => ({ ...p, upgradeRule: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PRORATION_LABELS).map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Downgrade Rule</Label>
                <Select value={prorationForm.downgradeRule ?? 'none'} onValueChange={(v) => setProrationForm((p) => ({ ...p, downgradeRule: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PRORATION_LABELS).map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mid-Cycle Change</Label>
                <Select value={prorationForm.midCycleChange ?? 'daily'} onValueChange={(v) => setProrationForm((p) => ({ ...p, midCycleChange: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PRORATION_LABELS).map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Adjustment</Label>
                <Select value={prorationForm.billingAdjustment ?? 'credit'} onValueChange={(v) => setProrationForm((p) => ({ ...p, billingAdjustment: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="charge">Charge</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={prorationForm.status ?? 'active'} onValueChange={(v) => setProrationForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setProrationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleProrationSave} loading={updateProration.isPending}>{editingProration ? 'Save Changes' : 'Create Rule'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingCancellation ? 'Edit Cancellation Rule' : 'Create Cancellation Rule'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-name">Rule Name *</Label>
              <Input id="cancel-name" value={cancellationForm.name ?? ''} onChange={(e) => setCancellationForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Standard 30-Day Cancellation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancel-desc">Description</Label>
              <Input id="cancel-desc" value={cancellationForm.description ?? ''} onChange={(e) => setCancellationForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cancellation Policy</Label>
                <Select value={cancellationForm.cancellationPolicy ?? 'end_of_cycle'} onValueChange={(v) => setCancellationForm((p) => ({ ...p, cancellationPolicy: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(CANCELLATION_POLICY_LABELS).map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Refund Policy</Label>
                <Select value={cancellationForm.refundPolicy ?? 'prorated'} onValueChange={(v) => setCancellationForm((p) => ({ ...p, refundPolicy: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(REFUND_POLICY_LABELS).map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cancel-notice">Notice Period (Days)</Label>
                <Input id="cancel-notice" type="number" min="0" value={cancellationForm.noticePeriod ?? 30} onChange={(e) => setCancellationForm((p) => ({ ...p, noticePeriod: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input type="date" value={cancellationForm.effectiveDate ?? ''} onChange={(e) => setCancellationForm((p) => ({ ...p, effectiveDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={cancellationForm.status ?? 'active'} onValueChange={(v) => setCancellationForm((p) => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setCancellationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCancellationSave} loading={updateCancellation.isPending}>{editingCancellation ? 'Save Changes' : 'Create Rule'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!prorationDeleteId} onOpenChange={() => setProrationDeleteId(null)}
        title="Archive proration rule?" description="This proration rule will be archived and no longer available for new subscriptions. Existing subscriptions will not be affected."
        confirmLabel="Archive" variant="danger" onConfirm={handleProrationDelete} loading={updateProration.isPending} />
      <ConfirmDialog open={!!cancellationDeleteId} onOpenChange={() => setCancellationDeleteId(null)}
        title="Archive cancellation rule?" description="This cancellation rule will be archived and no longer available for new subscriptions. Existing subscriptions will not be affected."
        confirmLabel="Archive" variant="danger" onConfirm={handleCancellationDelete} loading={updateCancellation.isPending} />
    </div>
  )
}

export default ProrationCancellationPage
