import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/ui/kpi-card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useSubscriptionPlanKpis, useDeleteSubscriptionPlan } from '../hooks/use-business-admin'
import { fetchSubscriptionPlanById } from '../services/business-admin'
import { toast } from 'sonner'
import { Eye, DollarSign, UserCog, Plus, ArrowLeft, Pencil, Trash2, Activity } from 'lucide-react'

const formatPrice = (amount: number | undefined, currency: string | undefined) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount ?? 0)
  } catch {
    return `₹${amount ?? 0}`
  }
}

const formatDate = (value: string | undefined) => {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export function SubscriptionPlanDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data: plan, isLoading, error, refetch } = useQuery({
    queryKey: ['ba-subscription-plan', id],
    queryFn: () => fetchSubscriptionPlanById(id!),
    enabled: !!id,
  })

  const { data: kpis } = useSubscriptionPlanKpis()
  const deletePlan = useDeleteSubscriptionPlan()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Failed to load subscription plan" onRetry={refetch} />
  }

  if (!plan) {
    return <EmptyState icon={<Eye className="h-8 w-8" />} title="Plan not found" description="The subscription plan you requested could not be found." />
  }

  const handleDelete = async () => {
    if (!id) return
    try {
      await deletePlan.mutateAsync(id)
      toast.success('Subscription plan deleted')
      setDeleteOpen(false)
      navigate('/business-admin/subscriptions')
    } catch {
      toast.error('Failed to delete subscription plan')
    }
  }

  const features = plan.features ?? []
  const usageLimits = plan.usageLimits ?? []
  // Details route is canonical; no dedicated edit route exists yet, so Edit
  // surfaces a notice instead of navigating to a dead route.
  const handleEdit = () => toast.info('Plan editing is not yet available')

  return (
    <div className="space-y-6">
      <PageHeader
        title={plan.name}
        description={plan.description || 'Subscription plan details, pricing, and billing rules.'}
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Subscriptions', path: '/business-admin/subscriptions' },
          { label: plan.name },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/business-admin/subscriptions')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />Back
            </Button>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-1.5" />Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1.5" />Delete
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-2">
        <Badge variant={plan.status === 'active' ? 'success' : plan.status === 'draft' ? 'warning' : 'secondary'}>
          {plan.status}
        </Badge>
        {plan.planType !== 'trial' && plan.billingCycle && (
          <Badge variant="secondary">
            {plan.billingCycle}
          </Badge>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis && kpis.totalPlans > 0 ? (
          <>
            <KpiCard label="Active Subscribers" value={plan.subscriberCount ?? 0} icon={<UserCog className="h-5 w-5" />} />
            {(plan.price ?? 0) > 0 && <KpiCard label="Monthly Revenue" value={formatPrice(plan.price, plan.currency)} icon={<DollarSign className="h-5 w-5" />} />}
            <KpiCard label="Plan Type" value={plan.planType ?? '—'} icon={<Plus className="h-5 w-5" />} />
            <KpiCard label="Status" value={plan.status ?? '—'} icon={<Activity className="h-5 w-5" />} />
          </>
        ) : (
          <Skeleton className="h-16 rounded-xl" />
        )}
      </div>

      {/* Plan Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overview Section */}
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">Plan Type</p>
            <p className="font-medium">{plan.planType ?? '—'}</p>
            <p className="text-muted-foreground">Billing Cycle</p>
            <p className="font-medium">{plan.billingCycle ?? '—'}</p>
            <p className="text-muted-foreground">Status</p>
            <p className="font-medium">{plan.status ?? '—'}</p>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium text-lg">{formatPrice(plan.price, plan.currency)}</p>
            <p className="text-muted-foreground">Currency</p>
            <p className="font-medium">{plan.currency ?? '—'}</p>
            <p className="text-muted-foreground">Billing Frequency</p>
            <p className="font-medium">{plan.billingFrequency ?? '—'}</p>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card>
          <CardHeader><CardTitle>Features</CardTitle></CardHeader>
          <CardContent>
            {features.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No features configured.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-[11px]">
                    {typeof feature === 'string' ? feature : feature.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Limits Section */}
        <Card>
          <CardHeader><CardTitle>Usage Limits</CardTitle></CardHeader>
          <CardContent>
            {usageLimits.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No usage limits configured.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {usageLimits.map((limit, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px]">
                    {limit.name}: {limit.limit ?? limit.value ?? '—'}{limit.unit ? ` ${limit.unit}` : ''}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trial Section */}
        <Card>
          <CardHeader><CardTitle>Trial</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">Trial Enabled</p>
            <p className="font-medium">{plan.trialEnabled ? 'Yes' : 'No'}</p>
            {plan.trialEnabled && (
              <>
                <p className="text-muted-foreground">Trial Duration (days)</p>
                <p className="font-medium">{plan.trialDuration ?? '—'}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Proration Section */}
        <Card>
          <CardHeader><CardTitle>Proration</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">Upgrade Rule</p>
            <p className="font-medium">{plan.prorationUpgradeRule ?? '—'}</p>
            <p className="text-muted-foreground">Downgrade Rule</p>
            <p className="font-medium">{plan.prorationDowngradeRule ?? '—'}</p>
            <p className="text-muted-foreground">Proration Behavior</p>
            <p className="font-medium">{plan.prorationBehavior ?? '—'}</p>
          </CardContent>
        </Card>

        {/* Cancellation Section */}
        <Card>
          <CardHeader><CardTitle>Cancellation</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Cancellation Policy</p>
            <p className="font-medium">{plan.cancellationPolicy ?? '—'}</p>
            <p className="text-muted-foreground">Refund Policy</p>
            <p className="font-medium">{plan.refundPolicy ?? '—'}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Effective Date: {formatDate(plan.effectiveDate ?? plan.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete subscription plan?"
        description="This plan may be used by active subscriptions. Plans with subscriptions can be set to Inactive instead."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        loading={deletePlan.isPending}
      />
    </div>
  )
}
