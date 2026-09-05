import { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, RefreshCw, Calendar, CreditCard, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, Pagination } from '@/components/ui/datatable';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Drawer } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import {
  useBillingCycles,
  useBillingCycleKpis,
  useCreateBillingCycle,
  useUpdateBillingCycle,
  useDeleteBillingCycle,
} from '../hooks/use-business-admin';
import type { BillingCycle, BillingCycleFilters } from '../types';

const DURATION_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'custom', label: 'Custom' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'draft', label: 'Draft' },
];

function getStatusVariant(status: string) {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'secondary';
    case 'draft': return 'warning';
    default: return 'default';
  }
}


export function BillingCyclesPage() {
  const [filters, setFilters] = useState<BillingCycleFilters>({ page: 1, perPage: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<BillingCycle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<BillingCycle | null>(null);

  const { data: kpis, isLoading: kpisLoading } = useBillingCycleKpis();
  const { data, isLoading, error, refetch } = useBillingCycles(filters);
  const createMutation = useCreateBillingCycle();
  const updateMutation = useUpdateBillingCycle();
  const deleteMutation = useDeleteBillingCycle();

  const cycles = data?.cycles ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status === 'all' ? undefined : status, page: 1 }));
  };

  const handleDurationFilter = (duration: string) => {
    setFilters(prev => ({ ...prev, duration: duration === 'all' ? undefined : duration, page: 1 }));
  };

  const handleOpenCreate = () => {
    setEditingCycle(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (cycle: BillingCycle) => {
    setEditingCycle(cycle);
    setDrawerOpen(true);
  };

  const handleDeleteClick = (cycle: BillingCycle) => {
    setCycleToDelete(cycle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!cycleToDelete) return;
    try {
      await deleteMutation.mutateAsync(cycleToDelete.id);
      toast.success('Billing cycle deleted successfully');
      setDeleteDialogOpen(false);
      setCycleToDelete(null);
    } catch {
      toast.error('Failed to delete billing cycle');
    }
  };

  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
    },
    {
      id: 'duration',
      header: 'Duration',
      accessorFn: (row: BillingCycle) => {
        const opt = DURATION_OPTIONS.find(o => o.value === row.duration);
        return opt?.label ?? row.duration;
      },
    },
    {
      id: 'billingDate',
      header: 'Billing Date',
      accessorKey: 'billingDate',
      sortable: true,
    },
    {
      id: 'renewal',
      header: 'Renewal',
      accessorFn: (row: BillingCycle) => row.automaticRenewal ? 'Automatic' : 'Manual',
    },
    {
      id: 'status',
      header: 'Status',
      accessorFn: (row: BillingCycle) => (
        <Badge variant={getStatusVariant(row.status) as any}>
          {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
        </Badge>
      ),
      headerClassName: 'w-[120px]',
    },
    {
      id: 'actions',
      header: '',
      className: 'w-[100px]',
      accessorFn: (row: BillingCycle) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Cycles"
        description="Manage subscription billing cycles, renewal rules, and payment schedules"
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Billing Cycles' },
        ]}
        actions={
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Cycle
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><CreditCard className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cycles</p>
                    <p className="text-2xl font-bold">{kpis?.totalCycles ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Cycles</p>
                    <p className="text-2xl font-bold">{kpis?.activeCycles ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10"><Users className="h-5 w-5 text-info" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Subscribers</p>
                    <p className="text-2xl font-bold">{kpis?.monthlySubscribers ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10"><Calendar className="h-5 w-5 text-warning" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Subscribers</p>
                    <p className="text-2xl font-bold">{kpis?.annualSubscribers ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Billing Cycles</CardTitle>
          <CardDescription>View and manage all billing cycle configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search billing cycles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>Search</Button>
            <Select value={filters.status ?? 'all'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.duration ?? 'all'} onValueChange={handleDurationFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Duration" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                {DURATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
          </div>

          {isLoading ? (
            <LoadingState rows={5} />
          ) : error ? (
            <ErrorState title="Failed to load billing cycles" description="There was an error loading the data" onRetry={() => refetch()} />
          ) : cycles.length === 0 ? (
            <EmptyState icon={Calendar} title="No billing cycles found" description="Create your first billing cycle to get started" action={<Button onClick={handleOpenCreate}><Plus className="h-4 w-4 mr-2" />New Cycle</Button>} />
          ) : (
            <>
              <DataTable columns={columns} data={cycles} getRowId={(row) => row.id} />
              <div className="flex justify-end">
                <Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} perPage={filters.perPage ?? 10} onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingCycle ? 'Edit Billing Cycle' : 'New Billing Cycle'} description={editingCycle ? 'Update billing cycle details' : 'Create a new billing cycle configuration'} side="right">
        <BillingCycleForm
          cycle={editingCycle}
          onSubmit={async (values) => {
            if (editingCycle) {
              await updateMutation.mutateAsync({ id: editingCycle.id, data: values });
              toast.success('Billing cycle updated');
            } else {
              await createMutation.mutateAsync(values);
              toast.success('Billing cycle created');
            }
            setDrawerOpen(false);
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Billing Cycle"
        description={`Are you sure you want to delete "${cycleToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function BillingCycleForm({ cycle, onSubmit, loading }: { cycle: BillingCycle | null; onSubmit: (values: any) => Promise<void>; loading: boolean }) {
  const [form, setForm] = useState({
    name: cycle?.name ?? '',
    description: cycle?.description ?? '',
    duration: cycle?.duration ?? 'monthly',
    durationDays: cycle?.durationDays ?? 30,
    billingDate: cycle?.billingDate ?? '',
    automaticRenewal: cycle?.automaticRenewal ?? true,
    gracePeriod: cycle?.gracePeriod ?? 3,
    failedPaymentBehavior: cycle?.failedPaymentBehavior ?? 'retry',
    status: cycle?.status ?? 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration *</Label>
          <Select value={form.duration} onValueChange={(v) => setForm(prev => ({ ...prev, duration: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DURATION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration (Days)</Label>
          <Input type="number" value={form.durationDays} onChange={(e) => setForm(prev => ({ ...prev, durationDays: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="billingDate">Billing Date *</Label>
        <Input id="billingDate" type="date" value={form.billingDate} onChange={(e) => setForm(prev => ({ ...prev, billingDate: e.target.value }))} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Grace Period (Days)</Label>
          <Input type="number" value={form.gracePeriod} onChange={(e) => setForm(prev => ({ ...prev, gracePeriod: Number(e.target.value) }))} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" id="autoRenew" checked={form.automaticRenewal} onChange={(e) => setForm(prev => ({ ...prev, automaticRenewal: e.target.checked }))} className="rounded" />
        <Label htmlFor="autoRenew" className="cursor-pointer">Automatic Renewal</Label>
      </div>
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : cycle ? 'Update Cycle' : 'Create Cycle'}</Button>
      </div>
    </form>
  );
}

export default BillingCyclesPage;
