import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  FileText,
  Sliders,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getCustomerSubscriptionDetail,
  cancelCustomerSubscription,
  type CustomerSubscription,
} from '@/lib/customer-portal-api'

export const CustomerSubscriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null)
  const [cancellationNotice, setCancellationNotice] = useState(false)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getCustomerSubscriptionDetail(id)
      const normalized: CustomerSubscription = {
        ...res,
        tier: res.tier || 'Enterprise Tier',
        recurring_amount: res.recurring_amount ?? res.current_amount ?? res.amount ?? res.price ?? 1499,
        current_period_start: res.current_period_start || '01 Sep 2026',
        current_period_end: res.current_period_end || res.renewal_date || res.next_billing_date || '01 Oct 2026',
        next_renewal_date: res.next_renewal_date || res.renewal_date || res.next_billing_date || '01 Oct 2026',
        seats: (typeof res.seats === 'object' && res.seats !== null)
          ? res.seats
          : { utilized: 34, allocated: 50 },
      }
      setSubscription(normalized)
    } catch (err) {
      console.error('Failed to load subscription detail', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleCancel = async () => {
    if (!id) return
    const confirmed = window.confirm('Are you sure you wish to request cancellation at the end of the billing period?')
    if (!confirmed) return
    await cancelCustomerSubscription(id, { effective: 'end_of_period', reason: 'Customer portal request' })
    setCancellationNotice(true)
  }

  if (loading || !subscription) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/customer-portal/subscriptions')}
            className="gap-1 text-xs mb-2 text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Subscriptions
          </Button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {subscription.plan_name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tier: {subscription.tier} · Recurring Billing: ₹{subscription.recurring_amount.toLocaleString('en-IN')} / {subscription.billing_cycle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-success text-white text-xs">{subscription.status.toUpperCase()}</Badge>
        </div>
      </div>

      {cancellationNotice && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-amber-800 dark:text-amber-200 text-xs rounded-lg">
          Cancellation scheduled. Plan access will remain fully functional until {subscription.current_period_end}.
        </div>
      )}

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Current Period Start</span>
          <p className="text-base font-bold text-foreground mt-1">{subscription.current_period_start}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Next Renewal Date</span>
          <p className="text-base font-bold text-primary mt-1">{subscription.next_renewal_date}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Seat Usage</span>
          <p className="text-base font-bold text-foreground mt-1">
            {subscription.seats.utilized} / {subscription.seats.allocated} seats
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-surface">
          <span className="text-xs text-muted-foreground">Plan Frequency</span>
          <p className="text-base font-bold text-foreground mt-1 capitalize">{subscription.billing_cycle}</p>
        </div>
      </div>

      {/* Features & Plan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Included Service Level Entitlements</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {(subscription.features || []).map((feat: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Subscription Management Actions */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold">Subscription Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs text-muted-foreground">
            <div className="p-3 rounded-lg border border-border bg-surface-muted">
              <span className="font-semibold text-foreground block mb-1">Upgrade / Downgrade Plan:</span>
              Contact your designated Account Executive to adjust seat allocations or upgrade feature tiers with prorated credits.
            </div>
            <div className="p-3 rounded-lg border border-border bg-surface-muted">
              <span className="font-semibold text-foreground block mb-1">Proration Terms:</span>
              Mid-cycle modifications are automatically calculated on a daily proration basis per master agreement.
            </div>
          </CardContent>
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="text-xs text-rose-600 hover:text-rose-700 h-8 gap-1"
            >
              <XCircle className="h-3.5 w-3.5" /> Cancel Subscription
            </Button>
            <Button size="sm" className="bg-primary text-xs h-8">
              Request Seat Expansion
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
