import React from 'react'
import { AlertOctagon, TrendingDown, Clock, ArrowRight, ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type DiscountAnomalyItem, type DeliverySlippageItem } from '../types/intelligence'
import { DecisionExplanationPanel } from './DecisionExplanationPanel'

interface DiscountAnomalyCardProps {
  item: DiscountAnomalyItem
  onDismiss?: (id: string) => void
  onReview?: (dealId: string) => void
}

export const DiscountAnomalyCard: React.FC<DiscountAnomalyCardProps> = ({ item, onDismiss, onReview }) => {
  return (
    <Card className="border-border hover:border-danger/30 transition-colors overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-surface-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-danger" />
            <CardTitle className="text-sm font-semibold text-foreground">
              {item.deal_name} · {item.customer_name}
            </CardTitle>
          </div>
          <Badge variant={item.severity === 'critical' ? 'destructive' : 'default'} className="uppercase text-[10px]">
            {item.severity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Quoted Discount</span>
            <span className="font-bold text-danger font-numeric text-sm">{item.quoted_discount_percent}%</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Max Permitted</span>
            <span className="font-bold text-foreground font-numeric text-sm">{item.allowed_discount_percent}%</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Excess Variance</span>
            <span className="font-bold text-danger font-numeric text-sm">+{item.difference_percent}%</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Margin Erosion</span>
            <span className="font-bold text-danger font-numeric text-sm">₹{item.margin_impact.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <DecisionExplanationPanel explanation={item.explanation} />
      </CardContent>

      <CardFooter className="pt-2 pb-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Rep: {item.rep_name}</span>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <Button variant="outline" size="sm" onClick={() => onDismiss(item.id)} className="text-xs h-8">
              Dismiss
            </Button>
          )}
          {onReview && (
            <Button size="sm" onClick={() => onReview(item.deal_id)} className="text-xs h-8 gap-1 bg-primary hover:bg-primary-hover text-white">
              Review Deal <ArrowRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

interface DeliverySlippageCardProps {
  item: DeliverySlippageItem
  onRemediate?: (id: string) => void
}

export const DeliverySlippageCard: React.FC<DeliverySlippageCardProps> = ({ item, onRemediate }) => {
  return (
    <Card className="border-border hover:border-warning/30 transition-colors overflow-hidden">
      <CardHeader className="pb-3 border-b border-border bg-surface-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <CardTitle className="text-sm font-semibold text-foreground">
              Order #{item.order_number} · {item.customer_name}
            </CardTitle>
          </div>
          <Badge className="bg-warning text-warning-foreground uppercase text-[10px]">{item.severity}</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Warehouse</span>
            <span className="font-semibold text-foreground block truncate">{item.warehouse_name}</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Promised Date</span>
            <span className="font-semibold text-foreground">{item.expected_delivery_date}</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Revised ETA</span>
            <span className="font-bold text-warning">{item.current_eta}</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Slippage Delay</span>
            <span className="font-bold text-danger font-numeric">+{item.slippage_days} Days</span>
          </div>
        </div>

        <DecisionExplanationPanel explanation={item.explanation} />
      </CardContent>

      <CardFooter className="pt-2 pb-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-numeric">Order Value: ₹{item.order_value.toLocaleString('en-IN')}</span>
        {onRemediate && (
          <Button size="sm" onClick={() => onRemediate(item.id)} className="text-xs h-8 gap-1 bg-primary hover:bg-primary-hover text-white">
            Remediate Dispatch <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
