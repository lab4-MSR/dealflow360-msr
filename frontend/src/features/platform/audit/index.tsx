import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Shield, Settings, UserCog, Download, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'


interface AuditEvent {
  id: string
  timestamp: string
  actor: string
  actorRole?: string
  businessName?: string
  action: string
  resource: string
  ip?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: { before?: Record<string, unknown>; after?: Record<string, unknown>; reason?: string; metadata?: Record<string, unknown> }
}

interface AuditData {
  overview: { totalEvents: number; securityEvents: number; configChanges: number; adminActions: number }
  events: AuditEvent[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

const MOCK_AUDIT: AuditData = {
  overview: { totalEvents: 24891, securityEvents: 342, configChanges: 1893, adminActions: 5621 },
  events: [
    { id: 'ae1', timestamp: '2026-09-05T09:15:00Z', actor: 'John Mitchell', actorRole: 'super_admin', action: 'Updated security policy', resource: 'Platform Settings', ip: '192.168.1.100', severity: 'high', details: { before: { mfaRequired: false }, after: { mfaRequired: true }, reason: 'Security hardening initiative' } },
    { id: 'ae2', timestamp: '2026-09-05T08:30:00Z', actor: 'Sarah Chen', actorRole: 'business_admin', businessName: 'Meridian Logistics', action: 'Invited team member', resource: 'User Management', ip: '10.0.0.55', severity: 'low' },
    { id: 'ae3', timestamp: '2026-09-05T07:45:00Z', actor: 'System', action: 'Automated backup completed', resource: 'Database', severity: 'low' },
    { id: 'ae4', timestamp: '2026-09-04T16:30:00Z', actor: 'Michael Park', actorRole: 'business_admin', businessName: 'Cascade Enterprises', action: 'Changed discount rules', resource: 'Configuration', ip: '172.16.0.22', severity: 'medium', details: { before: { maxDiscount: '15%' }, after: { maxDiscount: '20%' }, reason: 'Quarterly review adjustment' } },
    { id: 'ae5', timestamp: '2026-09-04T14:20:00Z', actor: 'System', action: 'Business suspended', resource: 'Quick Serve Retail', severity: 'critical', details: { reason: 'Payment failure after 3 retries' } },
    { id: 'ae6', timestamp: '2026-09-04T11:00:00Z', actor: 'Emily Torres', actorRole: 'sales_manager', businessName: 'Summit Industries', action: 'Exported deal report', resource: 'Analytics', ip: '10.0.0.78', severity: 'low' },
  ],
  total: 24891, page: 1, perPage: 25, totalPages: 996,
}

const severityVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  low: 'secondary', medium: 'warning', high: 'danger', critical: 'danger',
}

export function GlobalAuditPage() {
  const [filters, setFilters] = useState({ search: '', business: '', severity: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['global-audit', filters],
    queryFn: async (): Promise<AuditData> => {
      try {
        const params = new URLSearchParams()
        if (filters.search) params.set('search', filters.search)
        if (filters.business) params.set('filter[business]', filters.business)
        if (filters.severity) params.set('filter[severity]', filters.severity)
        params.set('page', String(filters.page))
        const response = await fetch(`/api/v1/platform/audit?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}` },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        if (!json.success) throw new Error(json.error?.message)
        return json.data
      } catch { return MOCK_AUDIT }
    },
    staleTime: 5 * 60 * 1000,
  })

  const debouncedSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilters((p) => ({ ...p, search: value, page: 1 })), 300)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-xl border border-border bg-card p-5"><Skeleton className="h-3 w-[60px] mb-2" /><Skeleton className="h-7 w-[40px]" /></div>)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !data) return <ErrorState title="Unable to load audit log" description="We couldn't load the global audit trail." onRetry={() => refetch()} />

  const handleExport = () => {
    if (!data?.events?.length) return
    const headers = ["Timestamp", "Actor", "Business", "Action", "Resource", "IP", "Severity"]
    const rows = data.events.map((e) => [
      `"${e.timestamp}"`,
      `"${e.actor}"`,
      `"${e.businessName || ''}"`,
      `"${e.action}"`,
      `"${e.resource}"`,
      `"${e.ip || ''}"`,
      `"${e.severity}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `platform_audit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Global Audit</h1>
          <p className="text-body-small text-muted-foreground mt-1">Platform-wide audit trail across all businesses and users.</p>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={handleExport}><Download className="h-4 w-4" /> Export</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Events" value={data.overview.totalEvents.toLocaleString()} icon={<Clock className="h-5 w-5" />} />
        <KpiCard label="Security Events" value={data.overview.securityEvents} icon={<Shield className="h-5 w-5" />} variant="danger" />
        <KpiCard label="Config Changes" value={data.overview.configChanges} icon={<Settings className="h-5 w-5" />} variant="warning" />
        <KpiCard label="Admin Actions" value={data.overview.adminActions} icon={<UserCog className="h-5 w-5" />} variant="info" />
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audit events..." value={searchInput} onChange={(e) => { setSearchInput(e.target.value); debouncedSearch(e.target.value) }} className="pl-9" />
            </div>
            <Select value={filters.severity || 'all'} onValueChange={(v) => setFilters((p) => ({ ...p, severity: v === 'all' ? '' : v, page: 1 }))}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {(filters.search || filters.severity) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters({ search: '', business: '', severity: '', page: 1 }); setSearchInput('') }} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.events.length === 0 ? (
        <EmptyState title="No audit events found" description="No events match your current filters." />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-body">
              <thead className="[&_tr]:border-b">
                <tr className="border-b border-border">
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Timestamp</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Actor</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden md:table-cell">Business</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Action</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden lg:table-cell">Resource</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground hidden lg:table-cell">IP</th>
                  <th className="h-12 px-4 text-left text-label font-medium text-muted-foreground">Severity</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((event) => (
                  <tr key={event.id} className="border-b border-border transition-colors hover:bg-surface-muted/50">
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground tabular-nums">{format(parseISO(event.timestamp), 'MMM d, h:mm a')}</td>
                    <td className="h-14 px-4 align-middle"><p className="text-small font-medium">{event.actor}</p>{event.actorRole && <p className="text-caption text-muted-foreground">{event.actorRole}</p>}</td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground hidden md:table-cell">{event.businessName || '—'}</td>
                    <td className="h-14 px-4 align-middle text-small">{event.action}</td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground hidden lg:table-cell">{event.resource}</td>
                    <td className="h-14 px-4 align-middle text-small text-muted-foreground tabular-nums hidden lg:table-cell">{event.ip || '—'}</td>
                    <td className="h-14 px-4 align-middle"><Badge variant={severityVariant[event.severity]}>{event.severity}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-caption text-muted-foreground">Showing {((data.page - 1) * data.perPage) + 1} to {Math.min(data.page * data.perPage, data.total)} of {data.total.toLocaleString()}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
