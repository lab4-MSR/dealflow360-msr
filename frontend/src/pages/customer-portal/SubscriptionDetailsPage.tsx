import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, RefreshCw, CheckCircle, Clock, AlertTriangle, Shield, CreditCard, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getCustomerSubscriptionDetail, cancelSubscription, changeSubscriptionPlan } from '@/lib/customer-portal-api'
import { formatCurrency } from '@/lib/analytics-format'

export function SubscriptionDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // State for modals
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('Enterprise Plus')

  // Feedback states
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: sub, isLoading, isError, error } = useQuery({
    queryKey: ['customer-subscription-detail', id],
    queryFn: () => getCustomerSubscriptionDetail(id || ''),
    enabled: !!id,
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelSubscription(id || ''),
    onSuccess: () => {
      setActionSuccess('Subscription cancellation scheduled at the end of current billing period.')
      setIsCancelModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['customer-subscription-detail', id] })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Failed to cancel subscription.')
    },
  })

  // Change plan mutation
  const changePlanMutation = useMutation({
    mutationFn: (newPlan: string) => changeSubscriptionPlan(id || '', newPlan),
    onSuccess: () => {
      setActionSuccess(`Plan change request to ${selectedPlan} submitted successfully.`)
      setIsChangePlanOpen(false)
      queryClient.invalidateQueries({ queryKey: ['customer-subscription-detail', id] })
    },
    onError: (err: Error) => {
      setActionError(err.message || 'Failed to update subscription plan.')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !sub) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Subscription Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to find subscription details.'}</p>
        <Button onClick={() => navigate('/customer-portal/subscriptions')} className="mt-4" variant="outline">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Subscriptions
        </Button>
      </div>
    )
  }

  const isCancelled = sub.status === 'cancelled'

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/customer-portal/subscriptions')}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Subscriptions
        </Button>
      </div>

      {/* Action alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActionSuccess(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActionError(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* Subscription Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight font-mono">{sub.id}</h1>
                <StatusBadge status={sub.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Plan: <strong className="text-foreground">{sub.plan_name}</strong></span>
                <span>•</span>
                <span>Renewal Date: <strong className="text-foreground">{sub.renewal_date}</strong></span>
              </div>
            </div>

            {/* Actions: Change Plan, Cancel, View Billing */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/customer-portal/invoices')}
                className="flex-1 sm:flex-none"
              >
                <FileText className="h-4 w-4 mr-1.5" /> View Billing
              </Button>

              {!isCancelled && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePlanOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    Change Plan
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="text-sm font-bold text-foreground">{sub.plan_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{sub.billing_cycle.replace('_', ' ')} billing</p>
              </div>
              <p className="text-xl font-bold font-mono text-primary">
                {formatCurrency(sub.price)} <span className="text-xs text-muted-foreground font-normal">/ cycle</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Included Features</p>
              <ul className="space-y-1.5 text-sm">
                {sub.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Billing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Current Amount</span>
              <span className="font-mono font-semibold text-foreground">{formatCurrency(sub.current_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Next Billing Date</span>
              <span className="font-medium">{sub.next_billing_date}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-border/50">
              <span className="text-muted-foreground">Payment Status</span>
              <StatusBadge status={sub.payment_status} />
            </div>

            <div className="pt-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Billing History</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {sub.billing_history.map((bh) => (
                  <div key={bh.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/40">
                    <span className="font-mono text-muted-foreground">{bh.date}</span>
                    <span className="font-mono font-medium">{formatCurrency(bh.amount)}</span>
                    <StatusBadge status={bh.status} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage / Entitlements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Usage & Entitlements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {sub.entitlements.usage.map((u, idx) => {
              const percentage = Math.min(Math.round((u.used / u.limit) * 100), 100)
              return (
                <div key={idx} className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{u.metric}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {u.used.toLocaleString()} / {u.limit.toLocaleString()} {u.unit}
                    </span>
                  </div>
                  {/* Usage Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage > 85 ? 'bg-amber-500' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{percentage}% used</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Changes / Upgrades / Downgrades / Proration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Subscription Changes & Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" /> Upgrade Options
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
                {sub.changes.upgrades.map((upg, idx) => (
                  <li key={idx}>{upg}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ArrowDownRight className="h-4 w-4 text-amber-600" /> Downgrade Options
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
                {sub.changes.downgrades.map((dwg, idx) => (
                  <li key={idx}>{dwg}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-foreground">Proration & Effective Date</p>
              <p className="text-xs text-muted-foreground">
                Proration policy: <strong className="text-foreground">{sub.changes.proration}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Effective date: <strong className="text-foreground">{sub.changes.effective_date}</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={isChangePlanOpen} onOpenChange={setIsChangePlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan for subscription <strong className="font-mono">{sub.id}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Target Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enterprise Standard">Enterprise Standard ($2,499 / mo)</SelectItem>
                  <SelectItem value="Enterprise Plus">Enterprise Plus ($4,999 / mo)</SelectItem>
                  <SelectItem value="Custom Tier">Custom Scale Tier (Contact Sales)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Prorated adjustments will be calculated automatically and reflected on your next billing cycle.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePlanOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => changePlanMutation.mutate(selectedPlan)}
              disabled={changePlanMutation.isPending}
            >
              {changePlanMutation.isPending ? 'Updating...' : 'Confirm Plan Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation Dialog */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirm Subscription Cancellation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel subscription <strong className="font-mono">{sub.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 text-xs text-muted-foreground space-y-2">
            <p>
              Your plan benefits will remain active until <strong className="text-foreground">{sub.renewal_date}</strong>.
            </p>
            <p>
              After this date, access to enterprise features will revert to the default standard access tier.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
