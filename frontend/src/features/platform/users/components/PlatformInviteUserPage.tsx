import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInvitePlatformUser } from '../hooks/use-platform-users'
import type { PlatformUserRole } from '../types'
import { ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'

export function PlatformInviteUserPage() {
  const navigate = useNavigate()
  const inviteUser = useInvitePlatformUser()
  const [form, setForm] = useState({ fullName: '', email: '', role: '' as PlatformUserRole | '', businessId: '', message: '', expiresInDays: '7' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.role) errs.role = 'Role is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      await inviteUser.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role as PlatformUserRole,
        businessId: form.businessId || undefined,
        message: form.message || undefined,
        expiresInDays: parseInt(form.expiresInDays) || 7,
      })
      toast.success('Invitation sent successfully')
      navigate('/platform/users')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/platform/users')} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Button>

      <div>
        <h1 className="text-h2 text-foreground">Invite Platform User</h1>
        <p className="text-body-small text-muted-foreground mt-1">Send an invitation to join the platform.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="John Smith" />
            {errors.fullName && <p className="text-caption text-danger">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
            {errors.email && <p className="text-caption text-danger">{errors.email}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platform Access</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as PlatformUserRole }))}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="business_admin">Business Admin</SelectItem>
                <SelectItem value="sales_manager">Sales Manager</SelectItem>
                <SelectItem value="sales_rep">Sales Rep</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-caption text-danger">{errors.role}</p>}
          </div>
          <div className="space-y-2">
            <Label>Business Scope (optional)</Label>
            <Input value={form.businessId} onChange={(e) => setForm((p) => ({ ...p, businessId: e.target.value }))} placeholder="Leave empty for platform-level access" />
            <p className="text-caption text-muted-foreground">Leave empty to grant platform-level access. Enter a business ID to scope access.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invitation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Input id="message" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Add a personal message to the invitation" />
          </div>
          <div className="space-y-2">
            <Label>Expiration</Label>
            <Select value={form.expiresInDays} onValueChange={(v) => setForm((p) => ({ ...p, expiresInDays: v }))}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate('/platform/users')}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={inviteUser.isPending} className="gap-1.5">
          <Send className="h-4 w-4" />
          {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
        </Button>
      </div>
    </div>
  )
}
