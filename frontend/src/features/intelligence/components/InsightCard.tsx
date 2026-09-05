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
        return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Pricing</Badge>
      case 'margin':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Margin</Badge>
      case 'fulfillment':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Fulfillment</Badge>
      case 'pipeline':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Pipeline</Badge>
      default:
        return <Badge variant="outline">{cat}</Badge>
    }
  }

  return (
    <Card className="hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
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
