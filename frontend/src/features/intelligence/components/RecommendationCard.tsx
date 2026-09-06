import React from 'react'
import { Sparkles, TrendingUp, Check, ArrowRight, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type RecommendationItem } from '../types/intelligence'

interface RecommendationCardProps {
  recommendation: RecommendationItem
  onViewDetails?: (id: string) => void
  onApply?: (id: string) => void
  onDismiss?: (id: string) => void
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
  onApply,
  onDismiss,
}) => {
  return (
    <Card className="flex flex-col justify-between hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                {(recommendation.recommendation_type === 'upsell' || recommendation.type === 'upsell') ? 'Upsell' : 'Cross-Sell'}
              </Badge>
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {recommendation.confidence_score ?? recommendation.confidence_percent ?? 0}% Match
              </span>
            </div>
            <CardTitle className="text-base font-semibold mt-2">{recommendation.recommended_product ?? recommendation.recommended_product_name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Customer: {recommendation.customer_name}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Expected Uplift</span>
            <span className="text-base font-bold text-success font-numeric">+₹{Number(recommendation.potential_revenue_uplift ?? recommendation.revenue_delta ?? 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-3 space-y-3 flex-1 text-sm">
        <div className="bg-surface-muted p-2.5 rounded-md border border-border text-xs">
          <span className="font-semibold text-foreground block mb-0.5">Why this recommendation:</span>
          <p className="text-muted-foreground">{recommendation.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Margin Shift</span>
            <span className="font-semibold text-success font-numeric flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +{recommendation.margin_delta_percent ?? 4.2}%
            </span>
          </div>
          <div className="p-2 rounded bg-surface border border-border">
            <span className="text-muted-foreground block text-[11px]">Related Quote</span>
            <span className="font-semibold text-foreground truncate block">{recommendation.deal_name || recommendation.deal_id}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex items-center justify-between gap-2">
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={() => onDismiss(recommendation.id)} className="text-xs text-muted-foreground h-8">
            Dismiss
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={() => onViewDetails(recommendation.id)} className="text-xs h-8">
              Details
            </Button>
          )}
          {onApply && (
            <Button size="sm" onClick={() => onApply(recommendation.id)} className="bg-primary hover:bg-primary-hover text-white text-xs h-8 gap-1">
              <Check className="h-3 w-3" /> Apply
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
