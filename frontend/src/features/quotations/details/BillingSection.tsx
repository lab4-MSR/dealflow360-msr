import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  CreditCard,
  Repeat,
  Package,
  Calendar,
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
} from 'lucide-react'
import type { BillingData } from '@/types/quotation'

interface BillingSectionProps {
  billing: BillingData
  currency: string
}

export function BillingSection({ billing, currency }: BillingSectionProps) {
  const {
    billing_type,
    one_time_items,
    recurring_items,
    billing_cycle,
    subscription,
    proration,
    invoice,
    payment_status,
  } = billing

  const curSymbol = currency === 'INR' ? '₹' : '$'

  return (
    <section id="billing" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Billing & Invoicing Architecture
          </h2>
          <Badge variant="secondary" className="capitalize text-caption">
            Billing Type: {billing_type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground">Payment Status:</span>
          <StatusBadge status={payment_status as never} className="capitalize text-caption">
            {payment_status.replace(/_/g, ' ')}
          </StatusBadge>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Billing Type */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Billing Type
            </span>
            <div className="mt-2">
              <Badge variant="outline" className="capitalize text-small font-semibold">
                {billing_type === 'mixed' ? 'Hybrid (Mixed)' : billing_type}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              CapEx Hardware + OpEx SaaS
            </span>
          </CardContent>
        </Card>

        {/* 2. Billing Cycle */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Recurring Cycle
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-foreground capitalize">
                {billing_cycle}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Subscription renewal schedule
            </span>
          </CardContent>
        </Card>

        {/* 3. Invoice Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Invoice
            </span>
            <div className="mt-1">
              <span className="font-mono font-semibold text-foreground text-small block truncate">
                {invoice ? invoice.invoice_number : 'Pending Order Confirmation'}
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {invoice ? `Due: ${new Date(invoice.due_date).toLocaleDateString()}` : 'Generated post-approval'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Payment Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Payment Status
            </span>
            <div className="mt-2">
              <StatusBadge status={payment_status as never} className="capitalize text-small font-semibold">
                {payment_status.replace(/_/g, ' ')}
              </StatusBadge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              ERP Accounts Receivable
            </span>
          </CardContent>
        </Card>
      </div>

      {/* One-Time vs Recurring Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* One-Time Items */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Package className="h-4 w-4 text-primary" />
              One-Time Capital Items ({one_time_items.length})
            </CardTitle>
            <span className="text-caption text-muted-foreground">Immediate Settlement</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {one_time_items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-small">
                  <span className="font-medium text-foreground">{item.product_name}</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    {curSymbol}{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recurring Items */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <Repeat className="h-4 w-4 text-primary" />
              Recurring Items & Plans ({recurring_items.length})
            </CardTitle>
            <span className="text-caption text-muted-foreground">Automated Billing Ledger</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recurring_items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-small">
                  <div>
                    <span className="font-medium text-foreground block">{item.product_name}</span>
                    <span className="text-caption text-muted-foreground">{item.plan_name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-foreground block tabular-nums">
                      {curSymbol}{item.recurring_price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase font-sans">
                      per {item.billing_cycle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Proration Calculation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscription Detail */}
        {subscription && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
                <Layers className="h-4 w-4 text-primary" />
                Subscription Contract Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2.5 text-small">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono font-medium">{subscription.subscription_id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground">Target Plan</span>
                <span className="font-medium">{subscription.plan}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground">Contract Start</span>
                <span className="font-mono text-caption">
                  {new Date(subscription.start_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Annual Renewal</span>
                <span className="font-mono text-caption">
                  {new Date(subscription.renewal_date).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proration Detail */}
        {proration && (
          <Card className="shadow-sm border-primary/20 bg-primary-subtle/10">
            <CardHeader className="py-3 px-5 border-b border-border">
              <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
                <DollarSign className="h-4 w-4 text-primary" />
                Proration & Mid-Cycle Upgrade Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-small">
              <div className="flex items-center gap-2 text-caption text-muted-foreground font-medium pb-1 border-b border-border/60">
                <span>{proration.current_plan}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="text-foreground font-semibold">{proration.new_plan}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-caption pt-1">
                <div>
                  <span className="text-muted-foreground block">Period Days Used:</span>
                  <span className="font-mono font-medium">{proration.used_days} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Remaining Days:</span>
                  <span className="font-mono font-medium">{proration.remaining_days} days</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Unused Plan Credit:</span>
                  <span className="font-mono font-semibold text-success">
                    -{curSymbol}{proration.credit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">New Plan Charge:</span>
                  <span className="font-mono font-semibold text-foreground">
                    +{curSymbol}{proration.charge.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex justify-between items-center text-small font-medium">
                <span className="text-foreground">Net Proration Adjustment:</span>
                <span className="font-mono font-bold text-primary text-base">
                  +{curSymbol}{proration.final_adjustment.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
