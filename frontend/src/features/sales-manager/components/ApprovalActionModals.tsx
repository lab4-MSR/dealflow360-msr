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
import { CheckCircle2, XCircle, Undo2, AlertTriangle } from 'lucide-react'

interface ApproveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteNumber: string
  dealName: string
  requestedDiscount: number
  marginPercent: number
  onConfirm: (comment?: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function ApproveModal({
  open,
  onOpenChange,
  quoteNumber,
  dealName,
  requestedDiscount,
  marginPercent,
  onConfirm,
  isSubmitting = false,
}: ApproveModalProps) {
  const [comment, setComment] = useState('')

  const handleApprove = async () => {
    await onConfirm(comment)
    setComment('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-subtle text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Approve Quotation {quoteNumber}</DialogTitle>
              <DialogDescription className="truncate">{dealName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-xs">
            <div>
              <span className="text-muted-foreground block">Approved Discount</span>
              <span className="font-semibold text-foreground text-sm">{requestedDiscount.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Resulting Deal Margin</span>
              <span className="font-semibold text-foreground text-sm">{marginPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="approve-comment" className="text-xs">Manager Endorsement / Optional Condition</Label>
            <Textarea
              id="approve-comment"
              placeholder="e.g. Approved with condition: Software subscription must be bound to 2-year term..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApprove} disabled={isSubmitting} className="bg-success hover:bg-success/90 text-white">
            {isSubmitting ? 'Approving...' : 'Confirm Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RejectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteNumber: string
  dealName: string
  onConfirm: (reason: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function RejectModal({
  open,
  onOpenChange,
  quoteNumber,
  dealName,
  onConfirm,
  isSubmitting = false,
}: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Rejection reason is required for governance audit.')
      return
    }
    setError('')
    await onConfirm(reason)
    setReason('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-subtle text-danger">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Reject Quotation {quoteNumber}</DialogTitle>
              <DialogDescription className="truncate">{dealName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 bg-danger-subtle/40 border border-danger/20 rounded-lg flex items-start gap-2.5 text-xs text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Rejecting this quotation will terminate the current proposal and notify the sales representative. This action will be logged in the permanent audit trail.
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reject-reason" className="text-xs">
              Reason for Rejection <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="State clear reasons why terms are rejected (e.g. Unacceptable gross margin dilution without revenue compensation)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              rows={4}
              className="resize-none text-xs"
            />
            {error && <p className="text-xs text-danger font-medium">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={isSubmitting}>
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ReturnModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quoteNumber: string
  dealName: string
  onConfirm: (instructions: string) => Promise<void> | void
  isSubmitting?: boolean
}

export function ReturnModal({
  open,
  onOpenChange,
  quoteNumber,
  dealName,
  onConfirm,
  isSubmitting = false,
}: ReturnModalProps) {
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')

  const handleReturn = async () => {
    if (!instructions.trim()) {
      setError('Revision instructions are required for the representative.')
      return
    }
    setError('')
    await onConfirm(instructions)
    setInstructions('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-subtle text-warning">
              <Undo2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Return for Revision {quoteNumber}</DialogTitle>
              <DialogDescription className="truncate">{dealName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 bg-warning-subtle/40 border border-warning/20 rounded-lg text-xs text-warning-foreground">
            This sends the quotation back to Draft status so the sales representative can adjust discount allocations or line items per your guidance.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="return-instructions" className="text-xs">
              Instructions for Sales Representative <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="return-instructions"
              placeholder="e.g. Please reduce Hardware discount to 12% max and offer 2 months free support instead to preserve 24% deal margin..."
              value={instructions}
              onChange={(e) => {
                setInstructions(e.target.value)
                if (error) setError('')
              }}
              rows={4}
              className="resize-none text-xs"
            />
            {error && <p className="text-xs text-danger font-medium">{error}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleReturn} disabled={isSubmitting} className="bg-warning hover:bg-warning/90 text-white">
            {isSubmitting ? 'Returning...' : 'Return to Rep'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
