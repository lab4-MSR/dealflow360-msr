import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerSubscriptions, type CustomerSubscription } from '@/lib/customer-portal-api'

export const CustomerSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getCustomerSubscriptions()
      setSubscriptions(res)
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">My Subscriptions</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your active recurring plans, SLA tiers, seat allocations, and automatic renewal dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-1 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-primary text-white text-[10px] uppercase mb-1.5">{sub.tier}</Badge>
                    <CardTitle className="text-lg font-bold">{sub.plan_name}</CardTitle>
                    <span className="text-xs text-muted-foreground">Renewal Date: {sub.next_renewal_date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-foreground block">
                      ₹{sub.recurring_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize">/ {sub.billing_cycle}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Seat usage */}
                <div className="p-3 rounded-lg border border-border bg-surface-muted">
                  <div className="flex justify-between font-medium mb-1">
                    <span>Allocated Seats:</span>
                    <span>
                      {sub.seats.utilized} / {sub.seats.allocated} active
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(sub.seats.utilized / sub.seats.allocated) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Included features */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground block text-xs">Plan Entitlements:</span>
                  {sub.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {sub.features.length > 3 && (
                    <span className="text-[11px] text-primary font-medium block">
                      +{sub.features.length - 3} additional enterprise features
                    </span>
                  )}
                </div>
              </CardContent>

              <div className="p-4 border-t border-border flex items-center justify-between">
                <Badge variant={sub.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                  {sub.status}
                </Badge>
                <Link to={`/customer-portal/subscriptions/${sub.id}`}>
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                    Manage Subscription <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
