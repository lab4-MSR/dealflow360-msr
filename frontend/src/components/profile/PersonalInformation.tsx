import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { UserProfile, UpdateProfilePayload } from '@/types/shared'

interface PersonalInformationProps {
  profile: UserProfile | null
  editing: boolean
  onCancel: () => void
  onSave: (payload: UpdateProfilePayload) => Promise<UserProfile>
}

interface FormErrors {
  full_name?: string
  email?: string
  phone?: string
  job_title?: string
}

function validate(data: UpdateProfilePayload): FormErrors {
  const errors: FormErrors = {}
  if (!data.full_name?.trim()) {
    errors.full_name = 'Name is required.'
  } else if ((data.full_name ?? '').length > 120) {
    errors.full_name = 'Name must be 120 characters or fewer.'
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (data.phone && !/^[+\d][\d\s().-]{6,20}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number.'
  }
  if ((data.job_title ?? '').length > 80) {
    errors.job_title = 'Job title must be 80 characters or fewer.'
  }
  return errors
}

export function PersonalInformation({
  profile,
  editing,
  onCancel,
  onSave,
}: PersonalInformationProps) {
  const [form, setForm] = React.useState<UpdateProfilePayload>({
    full_name: profile?.full_name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    job_title: profile?.job_title ?? '',
  })
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [saving, setSaving] = React.useState(false)

  // Reset the form whenever edit mode toggles or the underlying profile changes.
  React.useEffect(() => {
    setForm({
      full_name: profile?.full_name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      job_title: profile?.job_title ?? '',
    })
    setErrors({})
  }, [editing, profile])

  const update = (field: keyof UpdateProfilePayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value.trim() ? value : null }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSave = async () => {
    const payload: UpdateProfilePayload = {
      full_name: form.full_name?.trim() ?? '',
      email: form.email?.trim() ?? profile?.email ?? '',
      phone: form.phone?.trim() || null,
      job_title: form.job_title?.trim() || null,
    }
    const nextErrors = validate(payload)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSaving(true)
    try {
      await onSave(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your name, contact details and job title. Identity fields are read-only.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pi-name">Name</Label>
            <Input
              id="pi-name"
              value={form.full_name ?? ''}
              disabled={!editing}
              onChange={(e) => update('full_name', e.target.value)}
              error={!!errors.full_name}
              aria-invalid={!!errors.full_name}
            />
            {errors.full_name && <p className="text-caption text-danger">{errors.full_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pi-email">Email</Label>
            <Input
              id="pi-email"
              type="email"
              value={form.email ?? ''}
              disabled
              readOnly
              aria-readonly="true"
              className="opacity-60"
            />
            <p className="text-caption text-muted-foreground">Email is an identity field and cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pi-phone">Phone</Label>
            <Input
              id="pi-phone"
              value={form.phone ?? ''}
              disabled={!editing}
              onChange={(e) => update('phone', e.target.value)}
              error={!!errors.phone}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-caption text-danger">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pi-title">Job Title</Label>
            <Input
              id="pi-title"
              value={form.job_title ?? ''}
              disabled={!editing}
              onChange={(e) => update('job_title', e.target.value)}
              error={!!errors.job_title}
              aria-invalid={!!errors.job_title}
            />
            {errors.job_title && <p className="text-caption text-danger">{errors.job_title}</p>}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex items-center gap-2">
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <div className="sr-only" role="status">
              {saving ? 'Saving profile…' : 'Profile form'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}