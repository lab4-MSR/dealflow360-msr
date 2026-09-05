import { useQuery } from '@tanstack/react-query'
import { fetchPlatformDashboard } from '../services/platform-dashboard'
import { PlatformPageHeader } from './PlatformPageHeader'
import { PlatformKpiGrid } from './PlatformKpiGrid'
import { BusinessOverview } from './BusinessOverview'
import { DealOverview } from './DealOverview'
import { RevenueOverview } from './RevenueOverview'
import { PlatformActivity } from './PlatformActivity'
import { SystemHealthSummary } from './SystemHealthSummary'
import { PlatformAlerts } from './PlatformAlerts'
import { DashboardSkeleton } from './DashboardSkeleton'
import { ErrorState } from '@/components/shared'

export function SuperAdminDashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform-dashboard'],
    queryFn: fetchPlatformDashboard,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Platform data couldn't be loaded"
        description="An error occurred while fetching platform dashboard data. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader />

      <PlatformKpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BusinessOverview data={data.businessOverview} />
        <DealOverview data={data.dealOverview} />
      </div>

      <RevenueOverview data={data.revenueOverview} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <PlatformActivity activities={data.recentActivity} />
        </div>
        <div className="lg:col-span-1">
          <SystemHealthSummary health={data.systemHealth} />
        </div>
        <div className="lg:col-span-1">
          <PlatformAlerts alerts={data.alerts} />
        </div>
      </div>
    </div>
  )
}
