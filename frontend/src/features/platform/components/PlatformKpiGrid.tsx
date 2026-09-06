import { KpiCard } from '@/components/ui/kpi-card'
import {
  Building2,
  Building,
  Users,
  FileText,
  DollarSign,
  HeartPulse,
} from 'lucide-react'
import type { PlatformKpis } from '../types'
import { cn } from '@/lib/utils'

const healthConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger'; description: string }> = {
  healthy: { label: 'Healthy', variant: 'success', description: 'All monitored platform services operational' },
  degraded: { label: 'Degraded', variant: 'warning', description: 'Some services require attention' },
  critical: { label: 'Critical', variant: 'danger', description: 'Platform issues detected' },
  unavailable: { label: 'Unavailable', variant: 'danger', description: 'Platform services unreachable' },
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

interface PlatformKpiGridProps {
  kpis: PlatformKpis
}

export function PlatformKpiGrid({ kpis }: PlatformKpiGridProps) {
  const health = healthConfig[kpis.platformHealth] || healthConfig.healthy

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard
        label="Total Businesses"
        value={formatCompact(kpis.totalBusinesses)}
        icon={<Building2 className="h-5 w-5" />}
      />
      <KpiCard
        label="Active Businesses"
        value={formatCompact(kpis.activeBusinesses)}
        variant="success"
        icon={<Building className="h-5 w-5" />}
      />
      <KpiCard
        label="Total Users"
        value={formatCompact(kpis.totalUsers)}
        icon={<Users className="h-5 w-5" />}
      />
      <KpiCard
        label="Total Deals"
        value={formatCompact(kpis.totalDeals)}
        icon={<FileText className="h-5 w-5" />}
      />
      <KpiCard
        label="Total Revenue"
        value={formatCurrency(kpis.totalRevenue, kpis.currency)}
        icon={<DollarSign className="h-5 w-5" />}
      />
      <KpiCard
        label="Platform Health"
        value={health.label}
        variant={health.variant}
        icon={<HeartPulse className="h-5 w-5" />}
      >
        <p className={cn(
          'text-caption mt-1',
          health.variant === 'success' && 'text-success',
          health.variant === 'warning' && 'text-warning',
          health.variant === 'danger' && 'text-danger',
        )}>
          {health.description}
        </p>
      </KpiCard>
    </div>
  )
}


