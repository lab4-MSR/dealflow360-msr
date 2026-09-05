import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Mail, Ticket, CheckCircle2 } from 'lucide-react'
import type { SupportTicket, CreateTicketPayload } from '@/types/shared'
import { HELP_CATEGORIES } from '@/constants/shared'

interface SupportProps {
  onContactSupport: () => void
  onCreateTicket: (payload: CreateTicketPayload) => Promise<SupportTicket>
  submittedTicket: SupportTicket | null
  ticketError: string | null
  submitting: boolean
}

const TICKET_STATUS_VARIANT: Record<string, 'secondary' | 'warning' | 'success' | 'info'> = {
  open: 'warning',
  pending: 'warning',
  in_progress: 'info',
  answered: 'success',
  resolved: 'success',
  closed: 'secondary',
}

export function Support({
  onContactSupport,
  onCreateTicket,
  submittedTicket,
  ticketError,
  submitting,
}: SupportProps) {
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState('')
  const [category, setCategory] = React.useState<string>(HELP_CATEGORIES[0].value)
  const [message, setMessage] = React.useState('')

  const canSubmit =
    subject.trim().length > 0 && subject.trim().length <= 140 && message.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onCreateTicket({ subject: subject.trim(), category, message: message.trim() })
    setOpen(false)
    setSubject('')
    setMessage('')
    setCategory(HELP_CATEGORIES[0].value)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" aria-hidden />
            Support
          </CardTitle>
          <CardDescription>Reach our team or submit a support ticket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onContactSupport}>
              <Mail className="h-4 w-4" aria-hidden />
              Contact Support
            </Button>
            <Button size="sm" onClick={() => setOpen((v) => !v)} disabled={submitting}>
              {open ? 'Hide Ticket Form' : 'Submit a Ticket'}
            </Button>
          </div>

          {ticketError && (
            <p className="text-body-small text-danger" role="alert">
              Unable to submit ticket: {ticketError}
            </p>
          )}

          {open && (
            <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  value={subject}
                  maxLength={140}
                  placeholder="Brief description of the issue"
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Topic</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="ticket-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HELP_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-message">Details</Label>
                <textarea
                  id="ticket-message"
                  value={message}
                  rows={4}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe the problem and any steps to reproduce it."
                  className="flex w-full rounded-lg border border-input bg-surface px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                />
              </div>
              <Button onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
                Submit Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
{/* Ticket Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
            Ticket Status
          </CardTitle>
          <CardDescription>Track your most recent support ticket.</CardDescription>
        </CardHeader>
        <CardContent>
          {submittedTicket ? (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-surface p-4">
              <div className="min-w-0">
                <p className="text-body font-medium text-foreground truncate">{submittedTicket.subject}</p>
                <p className="text-caption text-muted-foreground">Ticket #{submittedTicket.id}</p>
              </div>
              <Badge variant={TICKET_STATUS_VARIANT[submittedTicket.status] ?? 'secondary'}>
                {submittedTicket.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          ) : (
            <EmptyState
              icon={<Ticket className="h-6 w-6" />}
              title="No support tickets"
              description="Submit a ticket to track its status here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}