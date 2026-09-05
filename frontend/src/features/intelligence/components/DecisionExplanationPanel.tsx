import React from 'react'
import { AlertCircle, ArrowRight, UserCheck, Zap, Info, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type DecisionExplanation } from '../types/intelligence'

interface DecisionExplanationPanelProps {
  explanation: DecisionExplanation
  className?: string
  onTakeAction?: () => void
  actionLabel?: string
}

export const DecisionExplanationPanel: React.FC<DecisionExplanationPanelProps> = ({
  explanation,
  className = '',
  onTakeAction,
  actionLabel,
}) => {
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Critical Urgency</Badge>
      case 'high':
        return <Badge className="bg-amber-500 text-white hover:bg-amber-600">High Urgency</Badge>
      case 'medium':
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Medium Urgency</Badge>
      default:
        return <Badge variant="secondary">Low Urgency</Badge>
    }
  }

  return (
    <div
      className={`rounded-lg border border-purple-200 bg-purple-50/40 p-4 dark:border-purple-900/60 dark:bg-purple-950/20 ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-900/40">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300">
            Intelligence Analysis & Decision Framework
          </span>
        </div>
        {getUrgencyBadge(explanation.urgency)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
        {/* WHAT */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <Info className="h-3 w-3 text-purple-600" /> What Detected
          </span>
          <p className="text-foreground font-medium text-xs leading-relaxed">{explanation.what}</p>
        </div>

        {/* WHY */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-amber-500" /> Why / Root Cause
          </span>
          <p className="text-foreground font-medium text-xs leading-relaxed">{explanation.why}</p>
        </div>

        {/* IMPACT */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-rose-500" /> Business Impact
          </span>
          <p className="text-foreground font-medium text-xs leading-relaxed">{explanation.impact}</p>
        </div>

        {/* WHO */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
            <UserCheck className="h-3 w-3 text-indigo-500" /> Action Owner
          </span>
          <p className="text-foreground font-medium text-xs leading-relaxed">{explanation.who}</p>
        </div>
      </div>

      {/* NEXT ACTION */}
      <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-100/50 dark:bg-purple-900/30 -mx-4 -mb-4 p-3 rounded-b-lg">
        <div className="flex items-start sm:items-center gap-2">
          <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 sm:mt-0 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200 uppercase tracking-wide mr-1.5">
              Recommended Next Action:
            </span>
            <span className="text-xs font-medium text-foreground">{explanation.next_action}</span>
          </div>
        </div>
        {onTakeAction && (
          <Button
            size="sm"
            onClick={onTakeAction}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 text-xs h-8"
          >
            {actionLabel || 'Execute Action'}
          </Button>
        )}
      </div>
    </div>
  )
}
