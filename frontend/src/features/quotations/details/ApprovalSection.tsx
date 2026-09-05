import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  Shield,
  Clock,
  User,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  UserCheck,
  ChevronRight,
  History,
} from 'lucide-react'
import { ApprovalActionModal } from './ApprovalActionModal'
import type { ApprovalData } from '@/types/quotation'

interface ApprovalSectionProps {
  approval: ApprovalData
  quoteNumber: string
  canApprove?: boolean
  onDecision: (action: 'approve' | 'reject' | 'return', reason: string) => Promise<void>
}

export function ApprovalSection({
  approval,
  quoteNumber,
  canApprove = true,
  onDecision,
}: ApprovalSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const isPending = approval.approval_status === 'pending'
  const isApproved = approval.approval_status === 'approved'
  const isRejected = approval.approval_status === 'rejected'
  const isReturned = approval.approval_status === 'returned'

  return (
    <section id="approval" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-h3 font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Approval
          </h2>
          <StatusBadge status={approval.approval_status as never} className="capitalize text-caption">
            {approval.approval_status.replace(/_/g, ' ')}
          </StatusBadge>
        </div>

        {isPending && canApprove && (
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"
          >
            <UserCheck className="h-4 w-4" />
            Review Approval Decision
          </Button>
        )}
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Approval Status */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Approval Status
            </span>
            <div className="mt-2">
              <StatusBadge status={approval.approval_status as never} className="capitalize text-small font-semibold">
                {approval.approval_status.replace(/_/g, ' ')}
              </StatusBadge>
            </div>
            <span className="text-[11px] text-muted-foreground block mt-1">
              Authoritative Workflow State
            </span>
          </CardContent>
        </Card>

        {/* 2. Approval Required */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Approval Required
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`text-2xl font-bold font-mono ${
                  approval.approval_required ? 'text-warning' : 'text-success'
                }`}
              >
                {approval.approval_required ? 'YES' : 'NO'}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate" title={approval.approval_required_reason}>
              {approval.approval_required_reason || 'Standard quote limits'}
            </span>
          </CardContent>
        </Card>

        {/* 3. Current Level */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Current Level
            </span>
            <div className="mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {approval.current_level ? `Level ${approval.current_level_index} of ${approval.total_levels}` : '—'}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {approval.current_level || 'Fully resolved'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Current Approver */}
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
              Current Approver
            </span>
            <div className="mt-1">
              <span className="font-semibold text-small text-foreground block truncate">
                {approval.current_approver ? approval.current_approver.name : 'None (Completed)'}
              </span>
              <span className="text-[11px] text-muted-foreground block truncate">
                {approval.current_approver ? `${approval.current_approver.role} • ${approval.current_approver.pending_duration}` : 'No action pending'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rejection / Return Reason Prominent Banner */}
      {isRejected && approval.rejection_reason && (
        <div className="rounded-xl border border-danger/30 bg-danger-subtle/20 p-4 flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-small text-danger">Quotation Rejected</h4>
            <p className="text-small text-foreground mt-0.5">{approval.rejection_reason}</p>
            <p className="text-caption text-muted-foreground mt-1">
              Sales Rep must create a new version with adjusted pricing or request commercial re-evaluation.
            </p>
          </div>
        </div>
      )}

      {isReturned && approval.return_reason && (
        <div className="rounded-xl border border-warning/30 bg-warning-subtle/20 p-4 flex items-start gap-3">
          <RotateCcw className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-small text-warning">Quotation Returned for Revision</h4>
            <p className="text-small text-foreground mt-0.5">{approval.return_reason}</p>
            <p className="text-caption text-muted-foreground mt-1">
              Adjust requested concessions and resubmit for approval.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 5. Approval Chain (Interactive Stepper) */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              Approval Chain
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-4">
              {approval.approval_chain.map((step, idx) => {
                const isStepApproved = step.status === 'approved'
                const isStepPending = step.status === 'pending'
                const isStepCurrent = step.is_current

                return (
                  <div key={step.step_number} className="flex items-start gap-3.5 relative">
                    {/* Stepper Dot & Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-caption shrink-0 transition-colors ${
                          isStepApproved
                            ? 'bg-success text-white'
                            : isStepPending
                            ? 'bg-warning text-warning-foreground ring-4 ring-warning/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isStepApproved ? <CheckCircle2 className="h-4 w-4" /> : step.step_number}
                      </div>
                      {idx < approval.approval_chain.length - 1 && (
                        <div className="w-0.5 h-12 bg-border my-1" />
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-small text-foreground">
                          {step.level_name}
                        </span>
                        <Badge
                          variant={isStepApproved ? 'success' : isStepPending ? 'warning' : 'secondary'}
                          className="capitalize text-[10px] py-0 px-1.5"
                        >
                          {step.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-caption text-muted-foreground mt-0.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{step.approver_name}</span>
                        <span>•</span>
                        <span className="capitalize">{step.approver_role.replace(/_/g, ' ')}</span>
                      </div>

                      {step.comments && (
                        <p className="text-caption text-foreground mt-1.5 p-2 rounded bg-muted/40 border border-border/60">
                          &ldquo;{step.comments}&rdquo;
                        </p>
                      )}

                      {step.elapsed_time && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 font-mono">
                          <Clock className="h-3 w-3" /> SLA: {step.sla_hours}h max (Elapsed: {step.elapsed_time})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 6. Approval History */}
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-5 border-b border-border">
            <CardTitle className="text-small font-semibold flex items-center gap-2 text-foreground">
              <History className="h-4 w-4 text-primary" />
              Approval History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {approval.approval_history.length === 0 ? (
              <p className="text-caption text-muted-foreground text-center py-6">
                No prior approval actions recorded.
              </p>
            ) : (
              <div className="space-y-2.5">
                {approval.approval_history.map((hist) => (
                  <div
                    key={hist.id}
                    className="rounded-lg border border-border p-3 text-small bg-muted/10 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{hist.actor}</span>
                        <span className="text-caption text-muted-foreground">({hist.actor_role})</span>
                      </div>
                      <Badge variant="secondary" className="capitalize text-[10px] py-0">
                        {hist.action}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-caption text-muted-foreground">
                      <span>{hist.level}</span>
                      <span className="font-mono">
                        {new Date(hist.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {hist.reason && (
                      <p className="text-caption text-foreground pt-1 border-t border-border/60 mt-1 font-mono">
                        Reason: {hist.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Decision Modal */}
      <ApprovalActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onDecision}
        quoteNumber={quoteNumber}
      />
    </section>
  )
}
