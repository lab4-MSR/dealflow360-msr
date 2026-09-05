import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus, Check, TrendingUp, Tag, PackageCheck } from 'lucide-react'
import type { RecommendationItem } from '@/types/quotation'

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[]
  currency: string
  onAddRecommendation: (recId: string) => void
  canAdd?: boolean
}

export function RecommendationsSection({
  recommendations,
  currency,
  onAddRecommendation,
  canAdd = true,
}: RecommendationsSectionProps) {
  const upsellRecs = recommendations.filter((r) => r.type === 'upsell')
  const crossSellRecs = recommendations.filter((r) => r.type === 'cross_sell')

  const curSymbol = '₹'

  const renderCard = (rec: RecommendationItem) => (
    <Card
      key={rec.id}
      className={`shadow-sm border-intelligence/20 bg-intelligence-subtle/10 hover:border-intelligence/40 transition-colors ${
        rec.added ? 'opacity-70 bg-muted/20 border-border' : ''
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] font-semibold text-intelligence border-intelligence/30 uppercase tracking-wider"
              >
                {rec.type === 'upsell' ? 'Upsell Recommendation' : 'Cross-Sell Recommendation'}
              </Badge>
              {rec.promotion && (
                <Badge variant="secondary" className="text-[10px] gap-1 text-warning">
                  <Tag className="h-3 w-3" />
                  {rec.promotion}
                </Badge>
              )}
            </div>
            <h4 className="font-semibold text-small text-foreground">{rec.product_name}</h4>
            <span className="font-mono text-caption text-muted-foreground block">{rec.sku}</span>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono font-bold text-foreground text-small">
              {curSymbol}
              {rec.unit_price.toLocaleString()}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Stock: {rec.available_stock}
            </span>
          </div>
        </div>

        {/* Reason */}
        <p className="text-caption text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reason: </strong>
          {rec.reason}
        </p>

        {/* Margin Delta & Action */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-success font-medium text-caption">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>
              Margin Delta: +{curSymbol}
              {rec.margin_delta.toLocaleString()} (+{rec.margin_delta_pp} pp)
            </span>
          </div>

          <Button
            size="sm"
            variant={rec.added ? 'outline' : 'default'}
            onClick={() => onAddRecommendation(rec.id)}
            disabled={rec.added || !canAdd}
            className={
              rec.added
                ? 'h-7 text-caption'
                : 'h-7 text-caption bg-intelligence hover:bg-intelligence/90 text-white gap-1'
            }
          >
            {rec.added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add Recommendation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section id="recommendations" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-intelligence" />
            Recommendations
          </h2>
          <Badge variant="outline" className="text-caption border-intelligence/30 text-intelligence font-medium">
            AI Recommendation Engine
          </Badge>
        </div>
        <span className="text-caption text-muted-foreground">
          Co-purchase patterns & margin optimization suggestions
        </span>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <PackageCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-small font-medium text-foreground">
            No recommendations currently available
          </p>
          <p className="text-caption text-muted-foreground mt-1">
            The quotation already aligns with optimal customer bundle patterns.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Upsell Recommendations */}
          {upsellRecs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-small font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                Upsell Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upsellRecs.map(renderCard)}
              </div>
            </div>
          )}

          {/* Cross-Sell Recommendations */}
          {crossSellRecs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-small font-semibold text-foreground uppercase tracking-wider text-[11px] text-muted-foreground">
                Cross-Sell Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {crossSellRecs.map(renderCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
