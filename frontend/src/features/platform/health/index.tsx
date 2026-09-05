import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { useQuery } from '@tanstack/react-query'
import { Activity, Server, Clock, AlertTriangle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface SystemHealthData {
  overall: { status: string; uptime: string }
  services: { name: string; status: string; latencyMs?: number; lastChecked: string; description?: string }[]
  performance: { responseTime: number; errorRate: number; requestVolume: number; throughput: number }
  infrastructure: { cpu: number; memory: number; storage: number; connections: number }
  incidents: { id: string; title: string; severity: string; status: string; startedAt: string; resolvedAt?: string; affectedService?: string }[]
  timeline: { date: string; events: number; warnings: number; downtime: number }[]
}

const MOCK_HEALTH: SystemHealthData = {
  overall: { status: 'operational', uptime: '99.97%' },
  services: [
    { name: 'API Gateway', status: 'operational', latencyMs: 42, lastChecked: '2026-09-05T10:00:00Z', description: 'Core API endpoints' },
    { name: 'PostgreSQL', status: 'operational', latencyMs: 8, lastChecked: '2026-09-05T10:00:00Z', description: 'Primary database' },
    { name: 'Auth Service', status: 'operational', latencyMs: 35, lastChecked: '2026-09-05T10:00:00Z', description: 'Authentication & authorization' },
    { name: 'Background Jobs', status: 'degraded', latencyMs: 280, lastChecked: '2026-09-05T10:00:00Z', description: 'Async job processing' },
    { name: 'File Storage', status: 'operational', latencyMs: 55, lastChecked: '2026-09-05T10:00:00Z', description: 'S3-compatible storage' },
    { name: 'Email Service', status: 'operational', latencyMs: 120, lastChecked: '2026-09-05T10:00:00Z', description: 'Transactional email' },
    { name: 'Realtime', status: 'degraded', latencyMs: 280, lastChecked: '2026-09-05T10:00:00Z', description: 'WebSocket connections' },
  ],
  performance: { responseTime: 184, errorRate: 0.12, requestVolume: 128450, throughput: 3420 },
  infrastructure: { cpu: 42, memory: 67, storage: 54, connections: 342 },
  incidents: [
    { id: 'inc1', title: 'Elevated WebSocket latency', severity: 'medium', status: 'investigating', startedAt: '2026-09-05T09:00:00Z', affectedService: 'Realtime' },
    { id: 'inc2', title: 'Background job processing delays', severity: 'medium', status: 'monitoring', startedAt: '2026-09-05T08:00:00Z', resolvedAt: '2026-09-05T09:30:00Z', affectedService: 'Background Jobs' },
  ],
  timeline: [
    { date: '2026-09-01', events: 12, warnings: 2, downtime: 0 },
    { date: '2026-09-02', events: 8, warnings: 1, downtime: 0 },
    { date: '2026-09-03', events: 15, warnings: 3, downtime: 0 },
    { date: '2026-09-04', events: 22, warnings: 5, downtime: 0 },
    { date: '2026-09-05', events: 18, warnings: 4, downtime: 0 },
  ],
}

const serviceStatusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  operational: 'success', degraded: 'warning', outage: 'danger', maintenance: 'secondary',
}

const serviceStatusIcon: Record<string, React.ElementType> = {
  operational: Activity, degraded: AlertTriangle, outage: AlertTriangle, maintenance: Clock,
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 80 ? 'var(--color-success)' : value >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth="6" />
        <circle cx="44" cy="44" r={radius} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 44 44)" className="transition-all duration-700" />
        <text x="44" y="44" textAnchor="middle" dominantBaseline="central" className="text-h4 font-semibold" fill="var(--color-foreground)">{value}%</text>
      </svg>
      <span className="text-caption text-muted-foreground">{label}</span>
    </div>
  )
}

export function SystemHealthPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealthData> => {
      try {
        const response = await fetch('/api/v1/platform/system-health', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}` },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        if (!json.success) throw new Error(json.error?.message)
        return json.data
      } catch { return MOCK_HEALTH }
    },
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[120px] w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !data) return <ErrorState title="Unable to load system health" description="We couldn't retrieve system health information." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-foreground">System Health</h1>
        <p className="text-body-small text-muted-foreground mt-1">Technical infrastructure and service health monitoring.</p>
      </div>

      {/* Overall Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', data.overall.status === 'operational' ? 'bg-success-subtle' : 'bg-warning-subtle')}>
              <Activity className={cn('h-6 w-6', data.overall.status === 'operational' ? 'text-success' : 'text-warning')} />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">System Status</p>
              <p className="text-h3 capitalize">{data.overall.status}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-subtle"><Clock className="h-6 w-6 text-info" /></div>
            <div>
              <p className="text-caption text-muted-foreground">Uptime</p>
              <p className="text-h3">{data.overall.uptime}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-subtle"><Server className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-caption text-muted-foreground">Response Time</p>
              <p className="text-h3">{data.performance.responseTime} ms</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Services */}
      <Card>
        <CardHeader><CardTitle>Core Services</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-0">
            {data.services.map((service, index) => {
              const StatusIcon = serviceStatusIcon[service.status] || Activity
              return (
                <div key={service.name} className={cn('flex items-center gap-4 py-3', index < data.services.length - 1 && 'border-b border-border')}>
                  <StatusIcon className={cn('h-4 w-4 shrink-0', service.status === 'operational' ? 'text-success' : service.status === 'degraded' ? 'text-warning' : 'text-danger')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-small font-medium">{service.name}</span>
                      <Badge variant={serviceStatusVariant[service.status]}>{service.status}</Badge>
                    </div>
                    {service.description && <p className="text-caption text-muted-foreground mt-0.5">{service.description}</p>}
                  </div>
                  {service.latencyMs !== undefined && <span className="text-caption tabular-nums text-muted-foreground">{service.latencyMs}ms</span>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure */}
      <Card>
        <CardHeader><CardTitle>Infrastructure</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8">
            <ProgressRing value={data.infrastructure.cpu} label="CPU" />
            <ProgressRing value={data.infrastructure.memory} label="Memory" />
            <ProgressRing value={data.infrastructure.storage} label="Storage" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-6 border-surface-muted" style={{ borderWidth: 6 }}>
                <span className="text-h4 font-semibold">{data.infrastructure.connections}</span>
              </div>
              <span className="text-caption text-muted-foreground">Connections</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents */}
      {data.incidents.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active Incidents</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {data.incidents.map((incident, index) => (
                <div key={incident.id} className={cn('py-3', index < data.incidents.length - 1 && 'border-b border-border')}>
                  <div className="flex items-center gap-3">
                    <Badge variant={incident.severity === 'critical' ? 'danger' : incident.severity === 'medium' ? 'warning' : 'secondary'}>{incident.severity}</Badge>
                    <span className="text-small font-medium">{incident.title}</span>
                    <Badge variant={incident.status === 'resolved' ? 'success' : 'warning'}>{incident.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-caption text-muted-foreground">
                    <span>Started: {format(parseISO(incident.startedAt), 'MMM d, h:mm a')}</span>
                    {incident.affectedService && <span>Service: {incident.affectedService}</span>}
                    {incident.resolvedAt && <span>Resolved: {format(parseISO(incident.resolvedAt), 'MMM d, h:mm a')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
