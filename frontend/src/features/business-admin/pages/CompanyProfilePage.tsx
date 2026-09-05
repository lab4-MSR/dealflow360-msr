import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useCompanyProfile, useUpdateCompanyProfile } from '../hooks/use-business-admin'
import type { CompanyProfile } from '../types'
import { toast } from 'sonner'
import { Save, Building2 } from 'lucide-react'

export function CompanyProfilePage() {
  const { data: profile, isLoading, error, refetch } = useCompanyProfile()
  const updateProfile = useUpdateCompanyProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<CompanyProfile>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateAddress = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address!, [field]: value },
    }))
  }

  const updateContact = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      primaryContact: { ...prev.primaryContact!, [field]: value },
    }))
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name?.trim()) errs.name = 'Company name is required'
    if (!form.email?.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (form.website && !/^https?:\/\/.+/.test(form.website)) errs.website = 'Invalid URL'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      await updateProfile.mutateAsync(form)
      toast.success('Company profile updated')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update company profile')
    }
  }

  const handleCancel = () => {
    if (profile) setForm(profile)
    setErrors({})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Failed to load company profile" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile"
        description="Manage your business identity and primary company information."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Company Profile' },
        ]}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>Cancel</Button>
              <Button onClick={handleSave} loading={updateProfile.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Building2 className="h-4 w-4 mr-1.5" />
              Edit Profile
            </Button>
          )
        }
      />

      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-h3 font-bold text-primary">
                {form.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">{form.name}</h2>
              <p className="text-[13px] text-muted-foreground">{form.industry} · {form.businessType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input value={form.name || ''} onChange={(e) => updateField('name', e.target.value)} disabled={!isEditing} error={!!errors.name} />
              {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Legal Business Name</Label>
              <Input value={form.legalName || ''} onChange={(e) => updateField('legalName', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Business Type</Label>
              <Input value={form.businessType || ''} onChange={(e) => updateField('businessType', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Industry</Label>
              <Input value={form.industry || ''} onChange={(e) => updateField('industry', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Registration Number</Label>
              <Input value={form.registrationNumber || ''} onChange={(e) => updateField('registrationNumber', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Tax ID</Label>
              <Input value={form.taxId || ''} onChange={(e) => updateField('taxId', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Email</Label>
              <Input type="email" value={form.email || ''} onChange={(e) => updateField('email', e.target.value)} disabled={!isEditing} error={!!errors.email} />
              {errors.email && <p className="text-[11px] text-danger">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone || ''} onChange={(e) => updateField('phone', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={form.website || ''} onChange={(e) => updateField('website', e.target.value)} disabled={!isEditing} error={!!errors.website} />
              {errors.website && <p className="text-[11px] text-danger">{errors.website}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input type="email" value={form.supportEmail || ''} onChange={(e) => updateField('supportEmail', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Address Line 1</Label>
              <Input value={form.address?.line1 || ''} onChange={(e) => updateAddress('line1', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Address Line 2</Label>
              <Input value={form.address?.line2 || ''} onChange={(e) => updateAddress('line2', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.address?.city || ''} onChange={(e) => updateAddress('city', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.address?.state || ''} onChange={(e) => updateAddress('state', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.address?.country || ''} onChange={(e) => updateAddress('country', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Postal Code</Label>
              <Input value={form.address?.postalCode || ''} onChange={(e) => updateAddress('postalCode', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.primaryContact?.name || ''} onChange={(e) => updateContact('name', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.primaryContact?.email || ''} onChange={(e) => updateContact('email', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.primaryContact?.phone || ''} onChange={(e) => updateContact('phone', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
