import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (current: string, next: string) => Promise<void>
}

interface Errors {
  current?: string
  next?: string
  confirm?: string
}

export function ChangePasswordDialog({ open, onOpenChange, onSubmit }: ChangePasswordDialogProps) {
  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [errors, setErrors] = React.useState<Errors>({})
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setCurrent('')
      setNext('')
      setConfirm('')
      setErrors({})
      setSubmitting(false)
    }
  }, [open])

  // Never log or expose password values.
  const handleSubmit = async () => {
    const errs: Errors = {}
    if (!current) errs.current = 'Enter your current password.'
    if (!next) {
      errs.next = 'Enter a new password.'
    } else if (next.length < 8) {
      errs.next = 'New password must be at least 8 characters.'
    }
    if (confirm !== next) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setSubmitting(true)
    try {
      await onSubmit(current, next)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Choose a strong password you don’t use elsewhere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-current">Current Password</Label>
            <Input
              id="cp-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value)
                if (errors.current) setErrors((prev) => ({ ...prev, current: undefined }))
              }}
              error={!!errors.current}
              aria-invalid={!!errors.current}
            />
            {errors.current && <p className="text-caption text-danger">{errors.current}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-new">New Password</Label>
            <Input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => {
                setNext(e.target.value)
                if (errors.next) setErrors((prev) => ({ ...prev, next: undefined }))
              }}
              error={!!errors.next}
              aria-invalid={!!errors.next}
            />
            {errors.next && <p className="text-caption text-danger">{errors.next}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-confirm">Confirm New Password</Label>
            <Input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }))
              }}
              error={!!errors.confirm}
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <p className="text-caption text-danger">{errors.confirm}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Update Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}