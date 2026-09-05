import { useState } from 'react';
import { HeartPulse, AlertTriangle, TrendingDown, Activity, Users, Target, Clock, Package, Eye, ChevronRight, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/shared/ErrorState';
import { RiskIndicator } from '@/components/shared/RiskIndicator';
import { DataTable, Pagination } from '@/components/ui/datatable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { useDealHealthKpis, useDealHealthItems } from '../hooks/use-business-admin';
import type { DealHealthItem, DealHealthFilters } from '../types';
import { format, parseISO } from 'date-fns';

const HEALTH_STATUS = ['all', 'healthy', 'at_risk', 'critical', 'stalled'];
const RISK_LEVELS = ['all', 'low', 'medium', 'high', 'critical'];

function getHealthVariant(status: string) {
  switch (status) {
    case 'healthy': return 'success';
    case 'at_risk': return 'warning';
    case 'critical': return 'danger';
    case 'stalled': return 'secondary';
    default: return 'secondary';
  }
}

function getHealthColor(score: number) {
  if (score >= 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

export function DealHealthPage() {
  const [filters, setFilters] = useState<DealHealthFilters>({ page: 1, perPage: 20 });
  const [searchInput, setSearchInput] = useState('');

  const { data: kpis, isLoading: kpisLoading } = useDealHealthKpis();
  const { data, isLoading, error, refetch } = useDealHealthItems(filters);

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof DealHealthFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  if (error) {
    return <ErrorState title="Failed to load deal health" description="An error occurred while fetching deal health data." onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deal Health"
        description="Intelligence-driven health monitoring for your deal pipeline."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Deal Health' },
        ]}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <Card className="rounded-xl border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Healthy Deals</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-success">{kpis?.healthyDeals || 0}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Score 70+</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-subtle">
                    <HeartPulse className="h-5 w-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">At Risk</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-warning">{kpis?.atRiskDeals || 0}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Score 40-69</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-subtle">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-danger/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Critical</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-danger">{kpis?.criticalDeals || 0}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Score below 40</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-subtle">
                    <TrendingDown className="h-5 w-5 text-danger" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Stalled</p>
                    <p className="text-[26px] font-bold tracking-tight mt-1">{kpis?.stalledDeals || 0}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">No activity 7+ days</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Average Score */}
      {!kpisLoading && kpis && (
        <Card className="border-intelligence/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full border-4 flex items-center justify-center text-h3 font-bold" style={{ borderColor: getHealthColor(kpis.averageHealthScore) }}>
                {kpis.averageHealthScore}
              </div>
              <div>
                <p className="text-[13px] font-medium">Average Health Score</p>
                <p className="text-[11px] text-muted-foreground">Across all active deals. Risk score: {kpis.averageRiskScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
          <Input placeholder="Search deals..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Activity className="h-4 w-4" />
          </Button>
        </div>
        <Select onValueChange={(v) => handleFilterChange('healthStatus', v)} defaultValue="all">
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Health Status" /></SelectTrigger>
          <SelectContent>
            {HEALTH_STATUS.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => handleFilterChange('riskLevel', v)} defaultValue="all">
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            {RISK_LEVELS.map(l => <SelectItem key={l} value={l}>{l === 'all' ? 'All Levels' : l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Deal Health Table */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<HeartPulse className="h-8 w-8" />}
          title="No deals found"
          description="No deals match your current filters. Deal health is calculated based on engagement, approvals, and fulfillment signals."
        />
      ) : (
        <DataTable
          columns={[
            {
              id: 'deal',
              header: 'Deal',
              accessorFn: (row: DealHealthItem) => (
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{row.dealName}</p>
                  <p className="text-[11px] text-muted-foreground">{row.customer} - {row.salesRep}</p>
                </div>
              ),
            },
            {
              id: 'health',
              header: 'Health',
              accessorFn: (row: DealHealthItem) => (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: getHealthColor(row.healthScore) + '20', color: getHealthColor(row.healthScore) }}>
                    {row.healthScore}
                  </div>
                  <Badge variant={getHealthVariant(row.healthStatus) as 'success' | 'warning' | 'danger' | 'secondary'}>{row.healthStatus.replace('_', ' ')}</Badge>
                </div>
              ),
            },
            {
              id: 'risk',
              header: 'Risk',
              accessorFn: (row: DealHealthItem) => <RiskIndicator level={row.riskLevel} size="sm" />,
            },
            {
              id: 'engagement',
              header: 'Engagement',
              accessorFn: (row: DealHealthItem) => (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${row.engagementScore}%` }} />
                  </div>
                  <span className="text-[12px] tabular-nums">{row.engagementScore}%</span>
                </div>
              ),
            },
            {
              id: 'approval',
              header: 'Approval',
              accessorFn: (row: DealHealthItem) => (
                row.approvalDelay > 0 ? (
                  <span className="text-[12px] text-warning">{row.approvalDelay}h pending</span>
                ) : (
                  <span className="text-[12px] text-success">Cleared</span>
                )
              ),
            },
            {
              id: 'lastActivity',
              header: 'Last Activity',
              accessorFn: (row: DealHealthItem) => (
                <span className="text-[12px] text-muted-foreground">{format(parseISO(row.lastActivity), 'MMM d')}</span>
              ),
            },
            {
              id: 'actions',
              header: '',
              accessorFn: (row: DealHealthItem) => (
                <Button variant="ghost" size="sm">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              ),
            },
          ]}
          data={items}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination page={filters.page || 1} totalPages={totalPages} total={total} perPage={filters.perPage || 20} onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} />
      )}

      {/* Health Insights */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="border-danger/20">
            <CardHeader><CardTitle className="text-h4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-danger" />Critical Issues</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.filter(i => i.healthStatus === 'critical').slice(0, 3).map(deal => (
                <div key={deal.id} className="rounded-lg border border-danger/20 bg-danger-subtle p-3">
                  <p className="text-[13px] font-medium">{deal.dealName}</p>
                  <p className="text-[11px] text-muted-foreground">{deal.anomalies[0]?.description || 'Multiple issues detected'}</p>
                </div>
              ))}
              {items.filter(i => i.healthStatus === 'critical').length === 0 && (
                <p className="text-[12px] text-muted-foreground">No critical issues. All deals are being monitored.</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-intelligence/20">
            <CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-intelligence" />Recommended Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {items.filter(i => i.recommendedActions.length > 0).slice(0, 4).map(deal => (
                <div key={deal.id} className="flex items-center gap-2 rounded-lg border p-2">
                  <ChevronRight className="h-3 w-3 text-intelligence" />
                  <span className="text-[12px]">{deal.recommendedActions[0]}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-h4 flex items-center gap-2"><Activity className="h-4 w-4" />Health Trends</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Healthy</span><span className="text-success font-medium">{kpis?.healthyDeals || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">At Risk</span><span className="text-warning font-medium">{kpis?.atRiskDeals || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Critical</span><span className="text-danger font-medium">{kpis?.criticalDeals || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stalled</span><span className="font-medium">{kpis?.stalledDeals || 0}</span></div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
