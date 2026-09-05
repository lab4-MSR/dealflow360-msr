import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Check, X, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface ApprovalActionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (action: 'approve' | 'reject' | 'return', reason: string) => Promise<void>
  quoteNumber: string
}

export function ApprovalActionModal({
  open,
  onClose,
  onConfirm,
  quoteNumber,
}: ApprovalActionModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'return'>('approve')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if ((action === 'reject' || action === 'return') && !reason.trim()) {
      toast.error(`Please provide a reason to ${action} this quotation.`)
      return
    }

    setSubmitting(true)
    try {
      await onConfirm(action, reason)
      toast.success(`Quotation ${action}d successfully`)
      onClose()
    } catch (err) {
      toast.error('Failed to record approval decision.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h3 font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Approval Decision — {quoteNumber}
          </DialogTitle>
          <DialogDescription>
            Record official governance decision for this quotation version. All decisions are logged in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Action Selector */}
          <div className="space-y-1.5">
            <Label>Decision Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-small font-medium transition-colors ${
                  action === 'approve'
                    ? 'border-success bg-success-subtle text-success'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Check className="h-4 w-4 mb-1" />
                Approve
              </button>

              <button
                type="button"
                onClick={() => setAction('return')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-small font-medium transition-colors ${
                  action === 'return'
                    ? 'border-warning bg-warning-subtle text-warning'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <RotateCcw className="h-4 w-4 mb-1" />
                Return
              </button>

              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-small font-medium transition-colors ${
                  action === 'reject'
                    ? 'border-danger bg-danger-subtle text-danger'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <X className="h-4 w-4 mb-1" />
                Reject
              </button>
            </div>
          </div>

          {/* Reason / Comments */}
          <div className="space-y-1.5">
            <Label htmlFor="decision-reason">
              {action === 'approve' ? 'Optional Notes / Conditions' : 'Mandatory Decision Reason *'}
            </Label>
            <Textarea
              id="decision-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'e.g., Approved based on 15 unit volume commitment and 12-month platform lock-in...'
                  : action === 'return'
                  ? 'e.g., Please cap hardware discount at 14% to keep deal margin above 25% floor...'
                  : 'e.g., Gross margin unacceptable given current supply chain constraints...'
              }
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant={action === 'approve' ? 'default' : action === 'return' ? 'secondary' : 'destructive'}
          >
            {submitting ? 'Recording...' : `Confirm ${action.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
