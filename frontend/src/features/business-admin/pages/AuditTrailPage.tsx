import { useState, useMemo } from 'react';
import { Search, Filter, Download, Shield, User, Clock, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';
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

const MODULES = ['all', 'shipping', 'subscription', 'proration', 'discount', 'approval', 'settings', 'user', 'warehouse'];
const SEVERITIES = ['all', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['all', 'success', 'failure', 'warning'];

function getSeverityVariant(severity: string) {
  switch (severity) {
    case 'critical': return 'danger';
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'secondary';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
    case 'failure': return <XCircle className="h-4 w-4 text-danger" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
    default: return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, perPage: 25 });
  const [searchInput, setSearchInput] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: kpis, isLoading: kpisLoading } = useAuditKpis();
  const { data, isLoading, error, refetch } = useAuditEvents(filters);

  const events = data?.events || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  if (error) {
    return <ErrorState title="Failed to load audit trail" description="An error occurred while fetching audit events." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="Immutable record of all system events and configuration changes."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Audit Trail' },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1">{(kpis?.totalEvents || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Config Changes</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1">{kpis?.configurationChanges || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-subtle">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Approval Actions</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1">{kpis?.approvalActions || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-subtle">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Security Events</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1">{kpis?.securityEvents || 0}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-subtle">
                    <Shield className="h-5 w-5 text-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
            <Input
              placeholder="Search audit events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline" size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-1.5" />Filters
            {showFilters ? <ChevronUp className="h-3 w-3 ml-1.5" /> : <ChevronDown className="h-3 w-3 ml-1.5" />}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select onValueChange={(v) => handleFilterChange('module', v)} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
              <SelectContent>
                {MODULES.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Modules' : m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => handleFilterChange('severity', v)} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                {SEVERITIES.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => handleFilterChange('status', v)} defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" placeholder="From date" onChange={(e) => handleFilterChange('dateFrom', e.target.value)} />
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="No audit events found"
          description="No events match your current filters. Audit events are recorded when configuration changes are made."
        />
      ) : (
        <DataTable
          columns={[
            {
              id: 'timestamp',
              header: 'Timestamp',
              accessorFn: (row: AuditEvent) => (
                <span className="text-[13px] tabular-nums">{format(parseISO(row.timestamp), 'MMM d, yyyy HH:mm')}</span>
              ),
            },
            {
              id: 'actor',
              header: 'User',
              accessorFn: (row: AuditEvent) => (
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium">{row.actor}</p>
                    {row.actorRole && <p className="text-[11px] text-muted-foreground">{row.actorRole}</p>}
                  </div>
                </div>
              ),
            },
            {
              id: 'action',
              header: 'Action',
              accessorFn: (row: AuditEvent) => (
                <span className="text-[13px]">{row.action}</span>
              ),
            },
            {
              id: 'resource',
              header: 'Resource',
              accessorFn: (row: AuditEvent) => (
                <div>
                  <p className="text-[13px]">{row.resource}</p>
                  <p className="text-[11px] text-muted-foreground">{row.module}</p>
                </div>
              ),
            },
            {
              id: 'severity',
              header: 'Severity',
              accessorFn: (row: AuditEvent) => (
                <Badge variant={getSeverityVariant(row.severity) as 'success' | 'warning' | 'danger' | 'secondary'}>{row.severity}</Badge>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessorFn: (row: AuditEvent) => (
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(row.status)}
                  <span className="text-[13px] capitalize">{row.status}</span>
                </div>
              ),
            },
            {
              id: 'actions',
              header: '',
              accessorFn: (row: AuditEvent) => (
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(row)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              ),
            },
          ]}
          data={events}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={filters.page || 1} totalPages={totalPages} total={total} perPage={filters.perPage || 25} onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
      )}

      {/* Detail Drawer */}
      <Drawer open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Audit Event Details" side="right">
        {selectedEvent && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Event ID</Label>
                <p className="text-[13px] font-mono">{selectedEvent.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Timestamp</Label>
                <p className="text-[13px]">{format(parseISO(selectedEvent.timestamp), 'PPpp')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Actor</Label>
                <p className="text-[13px]">{selectedEvent.actor} ({selectedEvent.actorRole})</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Module</Label>
                <p className="text-[13px]">{selectedEvent.module}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Action</Label>
              <p className="text-[13px]">{selectedEvent.action}</p>
            </div>

            <div>
              <Label className="text-muted-foreground">Resource</Label>
              <p className="text-[13px]">{selectedEvent.resource} ({selectedEvent.resourceType})</p>
            </div>

            {selectedEvent.reason && (
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="text-[13px]">{selectedEvent.reason}</p>
              </div>
            )}

            {(selectedEvent.before || selectedEvent.after) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedEvent.before && (
                  <div>
                    <Label className="text-muted-foreground">Before</Label>
                    <pre className="mt-1 rounded-lg bg-surface-muted p-3 text-[11px] overflow-auto max-h-40">
                      {JSON.stringify(selectedEvent.before, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedEvent.after && (
                  <div>
                    <Label className="text-muted-foreground">After</Label>
                    <pre className="mt-1 rounded-lg bg-surface-muted p-3 text-[11px] overflow-auto max-h-40">
                      {JSON.stringify(selectedEvent.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
              <div>
                <Label className="text-muted-foreground">Metadata</Label>
                <pre className="mt-1 rounded-lg bg-surface-muted p-3 text-[11px] overflow-auto max-h-40">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg bg-info-subtle border border-info/20 p-3">
              <Shield className="h-4 w-4 text-info" />
              <p className="text-[12px] text-info">This audit event is immutable and cannot be modified or deleted.</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
