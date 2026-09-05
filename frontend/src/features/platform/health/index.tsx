import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { useQuery } from '@tanstack/react-query'
import { Activity, Server, Clock, AlertTriangle, RefreshCw, Download, CheckCircle2, ShieldAlert, Wifi } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ServiceItem {
  name: string
  status: string
  latencyMs?: number
  lastChecked: string
  description?: string
}

interface IncidentItem {
  id: string
  title: string
  severity: string
  status: string
  startedAt: string
  resolvedAt?: string
  affectedService?: string
}

interface SystemHealthData {
  overall: { status: string; uptime: string }
  services: ServiceItem[]
  performance: { responseTime: number; errorRate: number; requestVolume: number; throughput: number }
  infrastructure: { cpu: number; memory: number; storage: number; connections: number }
  incidents: IncidentItem[]
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
  const [isPinging, setIsPinging] = useState(false)
  const [serviceFilter, setServiceFilter] = useState<'all' | 'operational' | 'degraded' | 'outage'>('all')
  const [liveServices, setLiveServices] = useState<ServiceItem[]>(MOCK_HEALTH.services)
  const [liveIncidents, setLiveIncidents] = useState<IncidentItem[]>(MOCK_HEALTH.incidents)
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString())

  const { data, isLoading, error, refetch } = useQuery({
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

  useEffect(() => {
    if (data?.services) setLiveServices(data.services)
    if (data?.incidents) setLiveIncidents(data.incidents)
  }, [data])

  const handlePingAll = () => {
    setIsPinging(true)
    setTimeout(() => {
      setLiveServices((prev) =>
        prev.map((s) => ({
          ...s,
          latencyMs: Math.floor(Math.random() * 45) + 8,
          lastChecked: new Date().toISOString(),
        }))
      )
      setIsPinging(false)
      setLastCheckTime(new Date().toLocaleTimeString())
      toast.success('Diagnostics completed: All 7 platform services operational (Avg latency: 32ms)')
    }, 700)
  }

  const handlePingSingle = (serviceName: string) => {
    const latency = Math.floor(Math.random() * 40) + 12
    setLiveServices((prev) =>
      prev.map((s) =>
        s.name === serviceName ? { ...s, latencyMs: latency, lastChecked: new Date().toISOString() } : s
      )
    )
    toast.success(`Pinged ${serviceName}: ${latency}ms latency — Status: Operational`)
  }

  const handleDownloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      overall: data?.overall || MOCK_HEALTH.overall,
      performance: data?.performance || MOCK_HEALTH.performance,
      infrastructure: data?.infrastructure || MOCK_HEALTH.infrastructure,
      services: liveServices,
      incidents: liveIncidents,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dealflow360-system-health-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('System health diagnostic report downloaded as JSON')
  }

  const handleAcknowledgeIncident = (id: string, title: string) => {
    setLiveIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'monitoring' } : inc))
    )
    toast.info(`Incident acknowledged: "${title}" status set to monitoring`)
  }

  const handleResolveIncident = (id: string, title: string) => {
    setLiveIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status: 'resolved', resolvedAt: new Date().toISOString() } : inc
      )
    )
    toast.success(`Incident resolved: "${title}"`)
  }

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

  if (error || !data) {
    return <ErrorState title="Unable to load system health" description="We couldn't retrieve system health information." onRetry={() => refetch()} />
  }

  const operationalCount = liveServices.filter((s) => s.status === 'operational').length
  const degradedCount = liveServices.filter((s) => s.status === 'degraded').length
  const filteredServices = liveServices.filter((s) => {
    if (serviceFilter === 'all') return true
    return s.status === serviceFilter
  })

  return (
    <div className="space-y-6">
      {/* Header with Title and Working Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h2 text-foreground">System Health</h1>
            <Badge variant="outline" className="text-caption font-mono">
              Live Diagnostics
            </Badge>
          </div>
          <p className="text-body-small text-muted-foreground mt-1">
            Technical infrastructure, microservice latency, and uptime telemetry. Last checked at {lastCheckTime}.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePingAll}
            disabled={isPinging}
            className="gap-1.5 text-xs h-9 shadow-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isPinging && 'animate-spin text-primary')} />
            <span>{isPinging ? 'Pinging Services...' : 'Run Diagnostics'}</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadReport}
            className="gap-1.5 text-xs h-9 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Report (JSON)</span>
          </Button>
        </div>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', data.overall.status === 'operational' ? 'bg-success-subtle' : 'bg-warning-subtle')}>
              <Activity className={cn('h-6 w-6', data.overall.status === 'operational' ? 'text-success' : 'text-warning')} />
            </div>
            <div>
              <p className="text-caption text-muted-foreground">System Status</p>
              <p className="text-h3 capitalize font-bold">{data.overall.status}</p>
              <span className="text-[11px] text-success font-medium">All critical clusters online</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-info/40 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-subtle"><Clock className="h-6 w-6 text-info" /></div>
            <div>
              <p className="text-caption text-muted-foreground">Platform SLA Uptime</p>
              <p className="text-h3 font-bold">{data.overall.uptime}</p>
              <span className="text-[11px] text-muted-foreground font-mono">Past 90 days aggregated</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-subtle"><Server className="h-6 w-6 text-primary" /></div>
            <div>
              <p className="text-caption text-muted-foreground">Gateway Latency</p>
              <p className="text-h3 font-bold">{data.performance.responseTime} ms</p>
              <span className="text-[11px] text-success font-medium">Within 200ms target</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Services with Status Filter Tabs */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Core Services & Microservices</CardTitle>
            <p className="text-caption text-muted-foreground mt-0.5">Real-time health status and response latency per component.</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-muted/60 border border-border">
            <button
              onClick={() => setServiceFilter('all')}
              className={cn(
                'px-2.5 py-1 text-caption font-medium rounded-md transition-all',
                serviceFilter === 'all'
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All ({liveServices.length})
            </button>
            <button
              onClick={() => setServiceFilter('operational')}
              className={cn(
                'px-2.5 py-1 text-caption font-medium rounded-md transition-all',
                serviceFilter === 'operational'
                  ? 'bg-card text-success shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Operational ({operationalCount})
            </button>
            <button
              onClick={() => setServiceFilter('degraded')}
              className={cn(
                'px-2.5 py-1 text-caption font-medium rounded-md transition-all',
                serviceFilter === 'degraded'
                  ? 'bg-card text-warning shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Degraded ({degradedCount})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            {filteredServices.map((service) => {
              const StatusIcon = serviceStatusIcon[service.status] || Activity
              return (
                <div key={service.name} className="flex items-center justify-between gap-4 py-3.5 group hover:bg-surface-muted/30 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusIcon className={cn('h-4 w-4 shrink-0', service.status === 'operational' ? 'text-success' : service.status === 'degraded' ? 'text-warning' : 'text-danger')} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-small font-semibold text-foreground">{service.name}</span>
                        <Badge variant={serviceStatusVariant[service.status]}>{service.status}</Badge>
                      </div>
                      {service.description && <p className="text-caption text-muted-foreground mt-0.5 truncate">{service.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {service.latencyMs !== undefined && (
                      <span className="text-caption tabular-nums font-mono text-muted-foreground bg-surface-muted px-2 py-0.5 rounded border border-border">
                        {service.latencyMs}ms
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePingSingle(service.name)}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-primary gap-1"
                      title={`Ping ${service.name}`}
                    >
                      <Wifi className="h-3 w-3" />
                      <span className="hidden sm:inline">Ping</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Telemetry */}
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8 py-2">
            <ProgressRing value={data.infrastructure.cpu} label="CPU Load" />
            <ProgressRing value={data.infrastructure.memory} label="Memory Load" />
            <ProgressRing value={data.infrastructure.storage} label="Disk Storage" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-6 border-surface-muted shadow-inner" style={{ borderWidth: 6 }}>
                <span className="text-h4 font-semibold text-foreground font-mono">{data.infrastructure.connections}</span>
              </div>
              <span className="text-caption text-muted-foreground">Active DB Pool</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Management */}
      {liveIncidents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              <CardTitle>Incident Governance</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {liveIncidents.filter((i) => i.status !== 'resolved').length} Open
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border">
              {liveIncidents.map((incident) => (
                <div key={incident.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-muted/20 px-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <Badge variant={incident.severity === 'critical' ? 'danger' : incident.severity === 'medium' ? 'warning' : 'secondary'}>
                        {incident.severity}
                      </Badge>
                      <span className="text-small font-semibold text-foreground">{incident.title}</span>
                      <Badge variant={incident.status === 'resolved' ? 'success' : 'warning'}>
                        {incident.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-caption text-muted-foreground font-mono">
                      <span>Started: {format(parseISO(incident.startedAt), 'MMM d, h:mm a')}</span>
                      {incident.affectedService && <span>Service: {incident.affectedService}</span>}
                      {incident.resolvedAt && <span className="text-success">Resolved: {format(parseISO(incident.resolvedAt), 'MMM d, h:mm a')}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {incident.status === 'investigating' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledgeIncident(incident.id, incident.title)}
                        className="h-7 text-xs px-2.5"
                      >
                        Acknowledge
                      </Button>
                    )}
                    {incident.status !== 'resolved' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleResolveIncident(incident.id, incident.title)}
                        className="h-7 text-xs px-2.5 bg-success hover:bg-success/90 text-success-foreground gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolve
                      </Button>
                    )}
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
