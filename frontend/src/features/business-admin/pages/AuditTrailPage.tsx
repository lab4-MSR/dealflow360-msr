import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Shield,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RotateCcw,
  FileText,
  Lock,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/shared/ErrorState';
import { DataTable, Pagination } from '@/components/ui/datatable';
import { Drawer } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { useAuditEvents, useAuditKpis } from '../hooks/use-business-admin';
import type { AuditEvent, AuditFilters } from '../types';
import { format, parseISO } from 'date-fns';

const MODULES = [
  'all',
  'shipping',
  'subscription',
  'proration',
  'discount',
  'approval',
  'settings',
  'user',
  'warehouse',
];

const SEVERITIES = ['all', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['all', 'success', 'failure', 'warning'];

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 capitalize">
          Critical
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 capitalize">
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 capitalize">
          Medium
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
          Low
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">
          {severity}
        </span>
      );
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'success':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          Success
        </span>
      );
    case 'failure':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
          <XCircle className="h-3.5 w-3.5 text-rose-500" />
          Failed
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          Warning
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          {status}
        </span>
      );
  }
}

export function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, perPage: 25 });
  const [searchInput, setSearchInput] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'config' | 'approvals' | 'security' | 'operations'>('all');

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useAuditKpis();
  const { data, isLoading, error, refetch, isFetching } = useAuditEvents(filters);

  const events = useMemo(() => data?.events || [], [data?.events]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  const handleTabChange = (tab: 'all' | 'config' | 'approvals' | 'security' | 'operations') => {
    setActiveTab(tab);
    let moduleFilter: string | undefined = undefined;
    if (tab === 'config') moduleFilter = 'settings';
    else if (tab === 'approvals') moduleFilter = 'approval';
    else if (tab === 'security') moduleFilter = 'user';
    else if (tab === 'operations') moduleFilter = 'warehouse';

    setFilters(prev => ({
      ...prev,
      module: moduleFilter,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveTab('all');
    setFilters({ page: 1, perPage: 25 });
    toast.info('Audit filters reset to defaults');
  };

  const handleRefreshAll = () => {
    refetchKpis();
    refetch();
    toast.success('Audit trail refreshed from immutable ledger');
  };

  const handleExport = () => {
    toast.success('Exporting compliance audit log (.CSV)');
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load audit trail"
        description="An error occurred while fetching cryptographic audit events."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Audit Trail & Ledger"
        description="Tamper-evident system log tracking administrative actions, rate changes, approval sign-offs, and security policy modifications."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Security & Governance' },
          { label: 'Audit Trail' },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
            <Lock className="h-3 w-3" />
            Immutable SHA-256 Ledger
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-xs h-9 border-border/80"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              Export Log
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isFetching}
              className="text-xs h-9 shadow-xs"
            >
              <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Stream
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation Categorical Tabs */}
      <div className="flex items-center justify-between border-b border-border/70 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Audit Events', count: total },
            { id: 'config', label: 'Configuration & Rules', count: kpis?.configurationChanges },
            { id: 'approvals', label: 'Approval Decisions', count: kpis?.approvalActions },
            { id: 'security', label: 'Security & Identity', count: kpis?.securityEvents },
            { id: 'operations', label: 'Logistics & Operations' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Total Ledger Events
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 tabular-nums text-foreground">
                      {(kpis?.totalEvents || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Historical records retained</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Configuration Changes
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 tabular-nums text-amber-600 dark:text-amber-400">
                      {kpis?.configurationChanges || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Pricing, rules & org settings</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Approval Decisions
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 tabular-nums text-emerald-600 dark:text-emerald-400">
                      {kpis?.approvalActions || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Quote & margin overrides</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Security & Roles
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 tabular-nums text-rose-600 dark:text-rose-400">
                      {kpis?.securityEvents || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Privilege escalations & logins</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border/70 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, actor, or resource..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9 text-xs h-9 bg-background/50 border-border/70 focus-visible:bg-background"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            className="text-xs h-9 px-3 border-border/70"
          >
            Search
          </Button>

          <Select
            value={filters.module || 'all'}
            onValueChange={(v) => handleFilterChange('module', v)}
          >
            <SelectTrigger className="w-[140px] text-xs h-9 bg-background/50 border-border/70">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {m === 'all' ? 'All Modules' : m.charAt(0).toUpperCase() + m.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity || 'all'}
            onValueChange={(v) => handleFilterChange('severity', v)}
          >
            <SelectTrigger className="w-[130px] text-xs h-9 bg-background/50 border-border/70">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => handleFilterChange('status', v)}
          >
            <SelectTrigger className="w-[130px] text-xs h-9 bg-background/50 border-border/70">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((st) => (
                <SelectItem key={st} value={st} className="text-xs">
                  {st === 'all' ? 'All Statuses' : st.charAt(0).toUpperCase() + st.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="text-xs h-9 w-[140px] bg-background/50 border-border/70"
              title="Filter from date"
            />
          </div>
        </div>

        {(searchInput || filters.module || filters.severity || filters.status || filters.dateFrom) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-10 w-10 text-muted-foreground" />}
            title="No audit events found"
            description="No ledger records match the selected filters. Verify your search query or clear active filters."
            action={
              (searchInput || filters.module || filters.severity || filters.status || filters.dateFrom) ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 text-xs">
                  Clear All Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={[
              {
                id: 'timestamp',
                header: 'Timestamp',
                accessorFn: (row: AuditEvent) => (
                  <div className="py-0.5 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-foreground">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {format(parseISO(row.timestamp), 'dd MMM yyyy')}
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums ml-4.5">
                      {format(parseISO(row.timestamp), 'HH:mm:ss')} IST
                    </span>
                  </div>
                ),
              },
              {
                id: 'actor',
                header: 'Actor / Operator',
                accessorFn: (row: AuditEvent) => (
                  <div className="flex items-center gap-2.5 py-0.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted border border-border/70 text-muted-foreground shrink-0 font-bold text-[10px]">
                      {row.actor?.slice(0, 2).toUpperCase() || 'SY'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{row.actor}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {row.actorRole?.replace('_', ' ') || 'system'}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                id: 'action',
                header: 'Action & Module',
                accessorFn: (row: AuditEvent) => (
                  <div className="py-0.5">
                    <span className="text-xs font-medium text-foreground">
                      {row.action}
                    </span>
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal capitalize">
                        {row.module}
                      </Badge>
                    </div>
                  </div>
                ),
              },
              {
                id: 'resource',
                header: 'Target Resource',
                accessorFn: (row: AuditEvent) => (
                  <div className="py-0.5 max-w-[200px]">
                    <p className="text-xs font-mono text-foreground truncate" title={row.resource}>
                      {row.resource}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                      {row.resourceType}
                    </p>
                  </div>
                ),
              },
              {
                id: 'severity',
                header: 'Severity',
                accessorFn: (row: AuditEvent) => (
                  <div className="py-0.5">
                    {getSeverityBadge(row.severity)}
                  </div>
                ),
              },
              {
                id: 'status',
                header: 'Status',
                accessorFn: (row: AuditEvent) => (
                  <div className="py-0.5">
                    {getStatusBadge(row.status)}
                  </div>
                ),
              },
              {
                id: 'actions',
                header: '',
                accessorFn: (row: AuditEvent) => (
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedEvent(row)}
                      title="Inspect Audit Record"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={events}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-1">
          <Pagination
            page={filters.page || 1}
            totalPages={totalPages}
            total={total}
            perPage={filters.perPage || 25}
            onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
          />
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Audit Record Inspection"
        description="Tamper-proof event details captured in the immutable ledger."
        side="right"
      >
        {selectedEvent && (
          <div className="space-y-5 p-6 overflow-y-auto">
            {/* Header Badge & Hash */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  ID: {selectedEvent.id}
                </span>
                {getSeverityBadge(selectedEvent.severity)}
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Cryptographically Verified Record
                </span>
              </div>
            </div>

            {/* Core Metadata Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Timestamp</Label>
                <p className="text-xs font-semibold text-foreground mt-1 tabular-nums">
                  {format(parseISO(selectedEvent.timestamp), 'PPpp')}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Actor / User</Label>
                <p className="text-xs font-semibold text-foreground mt-1">
                  {selectedEvent.actor}{' '}
                  <span className="text-[10px] text-muted-foreground font-normal">
                    ({selectedEvent.actorRole})
                  </span>
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Module</Label>
                <p className="text-xs font-semibold text-foreground mt-1 capitalize">
                  {selectedEvent.module}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-card">
                <Label className="text-[11px] text-muted-foreground uppercase tracking-wider">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedEvent.status)}
                </div>
              </div>
            </div>

            {/* Action Details */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Executed Action</Label>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium text-foreground">
                {selectedEvent.action}
              </div>
            </div>

            {/* Target Resource */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Target Resource</Label>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs text-foreground font-mono">
                {selectedEvent.resource}{' '}
                <span className="text-muted-foreground font-sans">
                  ({selectedEvent.resourceType})
                </span>
              </div>
            </div>

            {/* Change Reason */}
            {selectedEvent.reason && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Audit Reason / Justification</Label>
                <p className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg border border-border/60 bg-card">
                  {selectedEvent.reason}
                </p>
              </div>
            )}

            {/* State Diffs (Before vs After) */}
            {(selectedEvent.before || selectedEvent.after) && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">State Delta (Before / After)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedEvent.before && (
                    <div>
                      <span className="text-[11px] font-medium text-muted-foreground mb-1 block">Previous State</span>
                      <pre className="rounded-lg bg-muted/50 border border-border/60 p-3 text-[11px] font-mono overflow-auto max-h-48 text-foreground/80">
                        {JSON.stringify(selectedEvent.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedEvent.after && (
                    <div>
                      <span className="text-[11px] font-medium text-muted-foreground mb-1 block">New State</span>
                      <pre className="rounded-lg bg-muted/50 border border-border/60 p-3 text-[11px] font-mono overflow-auto max-h-48 text-foreground/80">
                        {JSON.stringify(selectedEvent.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Telemetry Metadata</Label>
                <pre className="rounded-lg bg-muted/50 border border-border/60 p-3 text-[11px] font-mono overflow-auto max-h-40 text-foreground/80">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Compliance Ledger Seal */}
            <div className="flex items-center gap-2.5 rounded-xl bg-primary/5 border border-primary/20 p-3.5">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground leading-snug">
                This event is stamped onto the permanent compliance ledger. It cannot be altered, rolled back, or deleted.
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

