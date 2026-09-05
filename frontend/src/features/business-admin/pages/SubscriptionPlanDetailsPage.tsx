import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useSubscriptionPlanKpis } from '../hooks/use-business-admin'
import { fetchSubscriptionPlanById } from '../services/business-admin'
import { Eye, Trash2, Plus, UserCog } from 'lucide-react'

export function SubscriptionPlanDetailsPage() {
  const { id } = useParams()
  const { data: plan, isLoading, error, refetch } = useQuery({
    queryKey: ['ba-subscription-plan', id],
    queryFn: () => fetchSubscriptionPlanById(id!),
    enabled: !!id,
  })

  const { data: kpis } = useSubscriptionPlanKpis()

  if (!plan) {
    return <EmptyState icon={<Eye className="h-8 w-8" />} title="Plan not found" description="The subscription plan you requested could not be found." />
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="border-b pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>
            {plan.description && <p className="text-muted-foreground">{plan.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={plan.status === 'active' ? 'success' : plan.status === 'draft' ? 'warning' : 'secondary'}>
              {plan.status}
            </Badge>
            {plan.planType !== 'trial' && (
              <Badge variant="secondary">
                {plan.billingCycle}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis && kpis.totalPlans > 0 ? (
          <>
            <KpiCard label="Active Subscribers" value={kpis.activePlans ?? 0} icon={<UserCog className="h-5 w-5" />} />
            {plan.price > 0 && <KpiCard label="Monthly Revenue" value={`₹${plan.price}`} icon={<Trash2 className="h-5 w-5" />} />}
            <KpiCard label="Plan Type" value={plan.planType} icon={<Plus className="h-5 w-5" />} />
            <KpiCard label="Status" value={plan.status} icon={<Badge variant={plan.status === 'active' ? 'success' : 'secondary'} className="h-5 w-5" />} />
          </>
        ) : (
          <Skeleton className="h-16 rounded-xl" />
        )}
      </div>

      {/* Plan Details Sections */}
      <div className="grid grid-cols-1 gap-4">
        {/* Overview Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Overview</h2>
          <div className="space-y-3">
            <p className="text-muted-foreground">Plan Type</p>
            <p className="font-medium">{plan.planType}</p>
            <p className="text-muted-foreground">Billing Cycle</p>
            <p className="font-medium">{plan.billingCycle}</p>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{plan.status}</p>
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Pricing</h2>
          <div className="space-y-3">
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium text-lg">₹{plan.price}</p>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-medium">{plan.currency}</p>
            <p className="text-muted-foreground">Billing Frequency</p>
            <p className="font-medium">{plan.billingFrequency}</p>
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Features</h2>
          <div className="grid grid-cols-2 gap-2">
            {plan.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-[11px]">
                {feature.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cancellation Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Cancellation</h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">Cancellation Policy</p>
            <p className="font-medium">{plan.cancellationPolicy}</p>
            <p className="text-muted-foreground">Refund Policy</p>
            <p className="font-medium">{plan.refundPolicy}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Effective Date: {new Date(plan.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
