import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useBranding, useUpdateBranding, useResetBranding } from '../hooks/use-business-admin'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { BrandingConfig } from '../types'
import { toast } from 'sonner'
import { Save, RotateCcw, Palette } from 'lucide-react'

function ColorInput({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#4F46E5'}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-10 w-10 rounded-lg border border-border cursor-pointer disabled:opacity-50"
        />
        <Input value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="flex-1" />
      </div>
    </div>
  )
}

export function BrandingPage() {
  const { data: branding, isLoading, error, refetch } = useBranding()
  const updateBranding = useUpdateBranding()
  const resetBranding = useResetBranding()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<BrandingConfig>>({})
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    if (branding) setForm(branding)
  }, [branding])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateBranding.mutateAsync(form)
      toast.success('Branding saved')
      setIsEditing(false)
    } catch {
      toast.error('Failed to save branding')
    }
  }

  const handleReset = async () => {
    try {
      await resetBranding.mutateAsync()
      toast.success('Branding reset to defaults')
      setShowResetDialog(false)
      setIsEditing(false)
    } catch {
      toast.error('Failed to reset branding')
    }
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
    return <ErrorState title="Failed to load branding" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        description="Customize your tenant's visual identity across the application."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Branding' },
        ]}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={() => { if (branding) setForm(branding); setIsEditing(false) }} disabled={updateBranding.isPending}>Cancel</Button>
              <Button onClick={handleSave} loading={updateBranding.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowResetDialog(true)}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Palette className="h-4 w-4 mr-1.5" />
                Edit Branding
              </Button>
            </>
          )
        }
      />

      {/* Brand Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Brand Name</Label>
              <Input value={form.brandName || ''} onChange={(e) => updateField('brandName', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input value={form.logo || ''} onChange={(e) => updateField('logo', e.target.value)} disabled={!isEditing} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Favicon URL</Label>
              <Input value={form.favicon || ''} onChange={(e) => updateField('favicon', e.target.value)} disabled={!isEditing} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput label="Primary Color" value={form.primaryColor || '#4F46E5'} onChange={(v) => updateField('primaryColor', v)} disabled={!isEditing} />
            <ColorInput label="Primary Hover" value={form.primaryHover || '#4338CA'} onChange={(v) => updateField('primaryHover', v)} disabled={!isEditing} />
            <ColorInput label="Primary Subtle" value={form.primarySubtle || '#EEF2FF'} onChange={(v) => updateField('primarySubtle', v)} disabled={!isEditing} />
            <ColorInput label="Secondary Color" value={form.secondaryColor || '#64748B'} onChange={(v) => updateField('secondaryColor', v)} disabled={!isEditing} />
          </div>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Semantic colors (success, warning, danger, info) remain global and are not affected by branding.
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border p-6 bg-background">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: form.primaryColor || '#4F46E5' }}>
                <span className="text-[13px] font-bold text-white">{form.brandName?.charAt(0) || 'A'}</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">{form.brandName || 'Company Name'}</p>
                <p className="text-[11px] text-muted-foreground">Enterprise Sales Platform</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toast.success(`Preview: ${form.brandName || 'Brand'} primary action triggered`)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors cursor-pointer"
                style={{ backgroundColor: form.primaryColor || '#4F46E5' }}
              >
                Primary Button
              </button>
              <button
                type="button"
                onClick={() => toast.info(`Preview: ${form.brandName || 'Brand'} secondary action triggered`)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-border text-foreground transition-colors hover:bg-accent cursor-pointer"
              >
                Secondary Button
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset branding?"
        description="This will restore the business to the default DealFlow360 branding. This action cannot be undone."
        confirmLabel="Reset Branding"
        variant="warning"
        onConfirm={handleReset}
        loading={resetBranding.isPending}
      />
    </div>
  )
}
