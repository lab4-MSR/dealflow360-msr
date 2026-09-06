import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useInviteUser, useTeams } from '../hooks/use-business-admin'
import type { BusinessUserRole } from '../types'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'

export function InviteUserPage() {
  const navigate = useNavigate()
  const inviteUser = useInviteUser()
  const { data: teamsData, isLoading: teamsLoading } = useTeams({ perPage: 100 })
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'sales_rep' as BusinessUserRole,
    teamId: '',
    invitationMessage: '',
    sendWelcomeEmail: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (form.phone.trim() && !/^[+\d][\d\s\-()]{6,19}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await inviteUser.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        ...(form.teamId ? { teamId: form.teamId } : {}),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      })
      toast.success('Invitation sent successfully')
      navigate('/business-admin/users-access/users')
    } catch {
      toast.error('Failed to send invitation')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invite User"
        description="Send an invitation to join your business."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Users & Access', path: '/business-admin/users-access/users' },
          { label: 'Invite User' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate('/business-admin/users-access/users')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Users
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        {/* User Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="John Doe"
                  error={!!errors.fullName}
                />
                {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@company.com"
                  error={!!errors.email}
                />
                {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  error={!!errors.phone}
                />
                {errors.phone && <p className="text-[11px] text-destructive">{errors.phone}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Access */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Organization Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={(v) => updateField('role', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_admin">Business Admin</SelectItem>
                    <SelectItem value="sales_manager">Sales Manager</SelectItem>
                    <SelectItem value="sales_rep">Sales Representative</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">Role determines what the user can access.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Team</Label>
                <Select value={form.teamId || 'none'} onValueChange={(v) => updateField('teamId', v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="No team" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team</SelectItem>
                    {teamsLoading ? (
                      <SelectItem value="__loading" disabled>Loading teams…</SelectItem>
                    ) : (
                      (teamsData?.teams || []).map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invitation Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invitation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Invitation Message</Label>
                <textarea
                  value={form.invitationMessage}
                  onChange={(e) => updateField('invitationMessage', e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Welcome to the team! We're excited to have you on board."
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sendWelcome"
                  checked={form.sendWelcomeEmail}
                  onChange={(e) => updateField('sendWelcomeEmail', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="sendWelcome" className="text-[13px] font-normal">Send welcome email</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/business-admin/users-access/users')}>
            Cancel
          </Button>
          <Button type="submit" disabled={inviteUser.isPending}>
            <Send className="h-4 w-4 mr-1.5" />
            {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
