import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  AlertTriangle,
  TrendingDown,
  Activity,
  Clock,
  Eye,
  ChevronRight,
  Lightbulb,
  Search,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
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

function getHealthVariant(status: string): 'success' | 'warning' | 'danger' | 'secondary' {
  switch (status) {
    case 'healthy':
      return 'success';
    case 'at_risk':
      return 'warning';
    case 'critical':
      return 'danger';
    case 'stalled':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getHealthColor(score: number): string {
  if (score >= 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

const formatINR = (val: number) =>
  '₹' + Math.round(val || 0).toLocaleString('en-IN');

export function DealHealthPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DealHealthFilters>({ page: 1, perPage: 20 });
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'healthy' | 'at_risk' | 'critical' | 'stalled'>('all');

  const { data: kpis, isLoading: kpisLoading, refetch: refetchKpis } = useDealHealthKpis();
  const { data, isLoading, error, refetch: refetchItems, isFetching } = useDealHealthItems(filters);

  const items = useMemo(() => data?.items || [], [data?.items]);
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const totalMonitoredPipelineValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [items]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput.trim() || undefined, page: 1 }));
  };

  const handleFilterChange = (key: keyof DealHealthFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  const handleTabChange = (tab: 'all' | 'healthy' | 'at_risk' | 'critical' | 'stalled') => {
    setActiveTab(tab);
    setFilters(prev => ({
      ...prev,
      healthStatus: tab === 'all' ? undefined : (tab as DealHealthFilters['healthStatus']),
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveTab('all');
    setFilters({ page: 1, perPage: 20 });
    toast.info('Health filters reset to defaults');
  };

  const handleRefreshAll = () => {
    refetchKpis();
    refetchItems();
    toast.success('Telemetry data refreshed from diagnostic engine');
  };

  const handleExport = () => {
    toast.success('Exporting deal health diagnostic telemetry (.CSV)');
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load deal health"
        description="An error occurred while fetching deal health telemetry data."
        onRetry={refetchItems}
      />
    );
  }

  const totalDealsSum =
    (kpis?.healthyDeals || 0) +
    (kpis?.atRiskDeals || 0) +
    (kpis?.criticalDeals || 0) +
    (kpis?.stalledDeals || 0) || 1;

  return (
    <div className="space-y-4">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Deal Health Monitor"
        description="Real-time multi-signal telemetry tracking deal velocity, discount anomalies, approval bottlenecks, and win probability."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Intelligence' },
          { label: 'Deal Health' },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Telemetry Engine Online
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
              Export Report
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isFetching}
              className="text-xs h-9 shadow-xs"
            >
              <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Telemetry
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border/70 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Deals', count: total },
            { id: 'healthy', label: 'Healthy', count: kpis?.healthyDeals },
            { id: 'at_risk', label: 'At Risk', count: kpis?.atRiskDeals },
            { id: 'critical', label: 'Critical', count: kpis?.criticalDeals },
            { id: 'stalled', label: 'Stalled', count: kpis?.stalledDeals },
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
                      Healthy Deals
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                      {kpis?.healthyDeals || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round(((kpis?.healthyDeals || 0) / totalDealsSum) * 100)}% of pipeline
                      </span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      At-Risk Deals
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-amber-600 dark:text-amber-400">
                      {kpis?.atRiskDeals || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Score 40 – 69</span>
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
                      Critical Deals
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-rose-600 dark:text-rose-400">
                      {kpis?.criticalDeals || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Requires immediate review</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border/70 bg-card shadow-xs transition-all hover:border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      Stalled Pipeline
                    </p>
                    <p className="text-[26px] font-bold tracking-tight mt-1 text-foreground">
                      {kpis?.stalledDeals || 0}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] text-muted-foreground">Inactivity &gt; 7 days</span>
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted border border-border/70 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Telemetry Summary & Score Card */}
      {!kpisLoading && kpis && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Health Score Gauge */}
              <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-border/60 pb-4 md:pb-0 md:pr-6">
                <div
                  className="h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-bold border-2 shadow-xs shrink-0"
                  style={{
                    borderColor: getHealthColor(kpis.averageHealthScore),
                    backgroundColor: `${getHealthColor(kpis.averageHealthScore)}15`,
                    color: getHealthColor(kpis.averageHealthScore),
                  }}
                >
                  <span className="text-[22px] leading-none">{kpis.averageHealthScore}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider mt-0.5">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">Average Health Index</h3>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                      Aggregated
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pipeline health rating evaluated from engagement and approval telemetry.
                  </p>
                </div>
              </div>

              {/* Monitored Pipeline Value in INR */}
              <div className="border-b md:border-b-0 md:border-r border-border/60 pb-4 md:pb-0 md:pr-6">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Monitored Deal Volume
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {formatINR(totalMonitoredPipelineValue)}
                  </span>
                  <span className="text-xs text-muted-foreground">across filtered deals</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-muted-foreground">
                    Avg Risk Score:{' '}
                    <strong className="text-foreground font-semibold">
                      {kpis.averageRiskScore}/100
                    </strong>
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    INR Denominated
                  </span>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Diagnostic Insights</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {kpis.criticalDeals > 0
                      ? `${kpis.criticalDeals} critical deal${kpis.criticalDeals > 1 ? 's' : ''} have severe approval delays or discount anomalies requiring executive sign-off.`
                      : 'All active deals are within nominal velocity boundaries. No critical escalations currently detected.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border/70 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px] max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by deal, customer, or sales rep..."
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
            value={filters.healthStatus || 'all'}
            onValueChange={(v) => handleFilterChange('healthStatus', v)}
          >
            <SelectTrigger className="w-[145px] text-xs h-9 bg-background/50 border-border/70">
              <SelectValue placeholder="Health Status" />
            </SelectTrigger>
            <SelectContent>
              {HEALTH_STATUS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s === 'all'
                    ? 'All Statuses'
                    : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.riskLevel || 'all'}
            onValueChange={(v) => handleFilterChange('riskLevel', v)}
          >
            <SelectTrigger className="w-[145px] text-xs h-9 bg-background/50 border-border/70">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map((l) => (
                <SelectItem key={l} value={l} className="text-xs">
                  {l === 'all' ? 'All Risks' : l.charAt(0).toUpperCase() + l.slice(1) + ' Risk'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(searchInput || filters.healthStatus || filters.riskLevel) && (
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

      {/* Deal Health Table */}
      <div className="rounded-xl border border-border/70 bg-card shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<HeartPulse className="h-10 w-10 text-muted-foreground" />}
            title="No deal telemetry found"
            description="No deals match the selected health filters or search criteria. Try modifying your filter options."
            action={
              (searchInput || filters.healthStatus || filters.riskLevel) ? (
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
                id: 'deal',
                header: 'Deal & Customer',
                accessorFn: (row: DealHealthItem) => (
                  <div className="py-0.5">
                    <p
                      className="text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/sales/deals/${row.id}`)}
                    >
                      {row.dealName}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {row.customer} <span className="opacity-40">•</span> Rep: {row.salesRep}
                    </p>
                  </div>
                ),
              },
              {
                id: 'value',
                header: 'Deal Value (INR)',
                accessorFn: (row: DealHealthItem) => (
                  <div className="py-0.5">
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {formatINR(row.value)}
                    </span>
                  </div>
                ),
              },
              {
                id: 'health',
                header: 'Health Score',
                accessorFn: (row: DealHealthItem) => (
                  <div className="flex items-center gap-2 py-0.5">
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold border"
                      style={{
                        backgroundColor: `${getHealthColor(row.healthScore)}15`,
                        borderColor: `${getHealthColor(row.healthScore)}40`,
                        color: getHealthColor(row.healthScore),
                      }}
                    >
                      {row.healthScore}
                    </div>
                    <Badge
                      variant={getHealthVariant(row.healthStatus)}
                      className="text-[10px] capitalize px-2 py-0.5 font-medium"
                    >
                      {row.healthStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                ),
              },
              {
                id: 'risk',
                header: 'Risk Level',
                accessorFn: (row: DealHealthItem) => (
                  <div className="py-0.5">
                    <RiskIndicator level={row.riskLevel} size="sm" />
                  </div>
                ),
              },
              {
                id: 'engagement',
                header: 'Engagement',
                accessorFn: (row: DealHealthItem) => (
                  <div className="flex items-center gap-2 py-0.5 min-w-[110px]">
                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, row.engagementScore || 0))}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground font-medium">
                      {row.engagementScore}%
                    </span>
                  </div>
                ),
              },
              {
                id: 'approval',
                header: 'Approval State',
                accessorFn: (row: DealHealthItem) => (
                  <div className="py-0.5">
                    {row.approvalDelay > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" />
                        {row.approvalDelay}h pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="h-3 w-3" />
                        Cleared
                      </span>
                    )}
                  </div>
                ),
              },
              {
                id: 'lastActivity',
                header: 'Last Signal',
                accessorFn: (row: DealHealthItem) => (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {row.lastActivity ? format(parseISO(row.lastActivity), 'dd MMM yyyy') : '—'}
                  </span>
                ),
              },
              {
                id: 'actions',
                header: '',
                accessorFn: (row: DealHealthItem) => (
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`View deal ${row.dealName}`}
                      onClick={() => navigate(`/sales/deals/${row.id}`)}
                      title="Inspect Deal"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={items}
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
            perPage={filters.perPage || 20}
            onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
          />
        </div>
      )}

      {/* Bottom Health & AI Diagnostics */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* Critical Issues & Bottlenecks */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                Critical Anomalies & Stalls
              </CardTitle>
              <CardDescription className="text-xs">
                Active deals requiring mitigation to prevent pipeline slippage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {items
                .filter((i) => i.healthStatus === 'critical' || i.healthStatus === 'at_risk')
                .slice(0, 3)
                .map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => navigate(`/sales/deals/${deal.id}`)}
                    className="group rounded-lg border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 p-3 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {deal.dealName}
                      </p>
                      <span className="text-[11px] font-bold tabular-nums text-foreground">
                        {formatINR(deal.value)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {deal.anomalies?.[0]?.description ||
                        `Health score dropped to ${deal.healthScore}/100. Approval delay: ${deal.approvalDelay}h.`}
                    </p>
                  </div>
                ))}
              {items.filter((i) => i.healthStatus === 'critical' || i.healthStatus === 'at_risk').length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                  No critical deal anomalies detected in the current filter scope.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Next-Best Actions */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Prescriptive Next-Best Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Automated recommendations derived from historical win patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {items
                .filter((i) => i.recommendedActions && i.recommendedActions.length > 0)
                .slice(0, 4)
                .map((deal, idx) => (
                  <div
                    key={deal.id || idx}
                    onClick={() => navigate(`/sales/deals/${deal.id}`)}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {deal.recommendedActions[0]}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Target: {deal.dealName}
                      </p>
                    </div>
                  </div>
                ))}
              {items.filter((i) => i.recommendedActions && i.recommendedActions.length > 0).length === 0 && (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No automated action recommendations pending.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Distribution Breakdown */}
          <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Pipeline Velocity & Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time cohort segmentation across active deals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Healthy Deals
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {kpis?.healthyDeals || 0}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.round(((kpis?.healthyDeals || 0) / totalDealsSum) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    At-Risk Deals
                  </span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                    {kpis?.atRiskDeals || 0}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${Math.round(((kpis?.atRiskDeals || 0) / totalDealsSum) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Critical Deals
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    {kpis?.criticalDeals || 0}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${Math.round(((kpis?.criticalDeals || 0) / totalDealsSum) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    Stalled Deals
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {kpis?.stalledDeals || 0}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-muted-foreground rounded-full"
                    style={{
                      width: `${Math.round(((kpis?.stalledDeals || 0) / totalDealsSum) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
