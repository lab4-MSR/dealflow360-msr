import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateBusiness } from '../hooks/use-businesses'
import type { CreateBusinessInput } from '../types'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

export function CreateBusinessPage() {
  const navigate = useNavigate()
  const createMutation = useCreateBusiness()

  const [form, setForm] = useState<CreateBusinessInput>({
    name: '',
    legalName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    admin: {
      fullName: '',
      email: '',
      role: 'business_admin',
    },
    configuration: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    },
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = <K extends keyof CreateBusinessInput>(key: K, value: CreateBusinessInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const updateAdmin = (key: keyof CreateBusinessInput['admin'], value: string) => {
    setForm((prev) => ({ ...prev, admin: { ...prev.admin, [key]: value } }))
    if (errors[`admin.${key}`]) setErrors((prev) => ({ ...prev, [`admin.${key}`]: '' }))
  }

  const updateConfig = (key: keyof CreateBusinessInput['configuration'], value: string) => {
    setForm((prev) => ({ ...prev, configuration: { ...prev.configuration, [key]: value } }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Business name is required'
    if (!form.email.trim()) newErrors.email = 'Business email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address'
    if (!form.admin.fullName.trim()) newErrors['admin.fullName'] = 'Admin name is required'
    if (!form.admin.email.trim()) newErrors['admin.email'] = 'Admin email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.admin.email)) newErrors['admin.email'] = 'Invalid email address'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      const result = await createMutation.mutateAsync(form)
      toast.success('Business created successfully')
      navigate(`/platform/businesses/${result.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create business')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/platform/businesses')}
          className="gap-1.5 mb-3 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Businesses
        </Button>
        <h1 className="text-h1 text-foreground">Create Business</h1>
        <p className="text-body text-muted-foreground mt-1">
          Set up a new organization on the DealFlow360 platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Acme Corporation"
                  error={!!errors.name}
                />
                {errors.name && <p className="text-caption text-danger">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name</Label>
                <Input
                  id="legalName"
                  value={form.legalName || ''}
                  onChange={(e) => updateField('legalName', e.target.value)}
                  placeholder="Acme Corporation LLC"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="admin@acme.com"
                  error={!!errors.email}
                />
                {errors.email && <p className="text-caption text-danger">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1-555-0123"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={form.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={form.industry || ''}
                  onValueChange={(v) => updateField('industry', v)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Admin */}
        <Card>
          <CardHeader>
            <CardTitle>Business Admin</CardTitle>
            <p className="text-caption text-muted-foreground">
              The initial administrator for this business. They will receive an invitation email.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Full Name *</Label>
                <Input
                  id="adminName"
                  value={form.admin.fullName}
                  onChange={(e) => updateAdmin('fullName', e.target.value)}
                  placeholder="John Doe"
                  error={!!errors['admin.fullName']}
                />
                {errors['admin.fullName'] && <p className="text-caption text-danger">{errors['admin.fullName']}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={form.admin.email}
                  onChange={(e) => updateAdmin('email', e.target.value)}
                  placeholder="john@acme.com"
                  error={!!errors['admin.email']}
                />
                {errors['admin.email'] && <p className="text-caption text-danger">{errors['admin.email']}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value="Business Admin" disabled className="bg-surface-muted" />
              <p className="text-caption text-muted-foreground">
                Role is automatically assigned as Business Admin.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Business Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={form.configuration.currency}
                  onValueChange={(v) => updateConfig('currency', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={form.configuration.timezone}
                  onValueChange={(v) => updateConfig('timezone', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">GMT / London</SelectItem>
                    <SelectItem value="Europe/Berlin">CET / Berlin</SelectItem>
                    <SelectItem value="Asia/Tokyo">JST / Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/platform/businesses')}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Create Business
          </Button>
        </div>
      </form>
    </div>
  )
}
