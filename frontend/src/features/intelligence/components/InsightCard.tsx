import React from 'react'
import { Sparkles, CheckCircle2, UserPlus, XCircle, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type DecisionInsightItem } from '../types/intelligence'
import { DecisionExplanationPanel } from './DecisionExplanationPanel'

interface InsightCardProps {
  insight: DecisionInsightItem
  onAction?: (id: string, action: string) => void
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onAction }) => {
  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'pricing':
        return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Pricing</Badge>
      case 'margin':
        return <Badge variant="secondary" className="bg-success-subtle text-success border-success/20">Margin</Badge>
      case 'fulfillment':
        return <Badge variant="secondary" className="bg-warning-subtle text-warning border-warning/20">Fulfillment</Badge>
      case 'pipeline':
        return <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/20">Pipeline</Badge>
      default:
        return <Badge variant="outline">{cat}</Badge>
    }
  }

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getCategoryBadge(insight.category)}
              <span className="text-xs text-muted-foreground">{insight.created_at}</span>
            </div>
            <CardTitle className="text-base font-semibold">{insight.title}</CardTitle>
          </div>
          <Badge
            variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'high' ? 'default' : 'secondary'}
            className="uppercase text-[10px]"
          >
            {insight.severity}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <DecisionExplanationPanel
          explanation={insight.explanation}
          onTakeAction={() => onAction && onAction(insight.id, 'take_action')}
          actionLabel="Execute Recommendation"
        />
      </CardContent>

      <CardFooter className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Owner: {insight.explanation.who}</span>
        <div className="flex items-center gap-2">
          {onAction && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction(insight.id, 'dismiss')}
                className="text-xs h-8 text-muted-foreground"
              >
                Dismiss
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction(insight.id, 'assign')}
                className="text-xs h-8 gap-1"
              >
                <UserPlus className="h-3 w-3" /> Assign
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
