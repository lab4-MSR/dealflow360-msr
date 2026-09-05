import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCustomerSubscriptions, type CustomerSubscription } from '@/lib/customer-portal-api'

function SubscriptionStatusBadge({ status }: { status: string }) {
  const isOk = status === 'active'
  return (
    <Badge variant={isOk ? 'default' : 'secondary'} className="capitalize text-xs">
      {status}
    </Badge>
  )
}

export const CustomerSubscriptionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCustomerSubscriptions()
      const subs = res && 'subscriptions' in res ? res.subscriptions : (Array.isArray(res) ? res : [])
      setSubscriptions(subs)
    } catch (err) {
      console.error('Failed to load subscriptions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <RefreshCw className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions & Recurring Services</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your active recurring plans, SLA tiers, seat allocations, and automatic renewal dates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : subscriptions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No subscriptions found.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub: any) => (
            <Card key={sub.id} className="p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{sub.plan_name}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{sub.id}</span>
                  </div>
                  <SubscriptionStatusBadge status={sub.status} />
                </div>

                <div className="bg-surface-muted p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Recurring Rate</span>
                    <span className="text-xl font-bold text-foreground">₹{sub.amount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground capitalize"> / {sub.billing_cycle}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Next Renewal</span>
                    <span className="text-xs font-medium text-foreground">{sub.renewal_date || sub.next_billing_date}</span>
                  </div>
                </div>

                {/* Included features */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground block text-xs">Plan Entitlements:</span>
                  {(sub.features || []).slice(0, 3).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {sub.features && sub.features.length > 3 && (
                    <span className="text-[11px] text-primary font-medium block">
                      +{sub.features.length - 3} additional enterprise features
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border flex items-center justify-between mt-4">
                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                  {sub.status}
                </Badge>
                <Button asChild size="sm" variant="outline" className="text-xs h-8 gap-1">
                  <Link to={`/customer-portal/subscriptions/${sub.id}`}>
                    Manage Subscription <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
