import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useLocalization, useUpdateLocalization } from '../hooks/use-business-admin'
import type { LocalizationConfig } from '../types'
import { toast } from 'sonner'
import { Save, Globe } from 'lucide-react'
import { format } from 'date-fns'

const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland']
const DATE_FORMATS = ['dd MMM yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'MMM dd, yyyy']
const TIME_FORMATS = ['HH:mm', 'hh:mm a', 'HH:mm:ss']
const DECIMAL_SEPARATORS = ['.', ',']
const THOUSANDS_SEPARATORS = [',', '.', ' ', '']
const BCP47_RE = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/
const NONE_SENTINEL = '_none'

function safeFormatDate(d: Date, fmt: string | undefined, fallback: string): string {
  try {
    return format(d, fmt || fallback)
  } catch {
    try {
      return format(d, fallback)
    } catch {
      return d.toISOString()
    }
  }
}

export function LocalizationPage() {
  const { data: config, isLoading, error, refetch } = useLocalization()
  const updateLocalization = useUpdateLocalization()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<LocalizationConfig>>({})

  useEffect(() => {
    if (config) setForm(config)
  }, [config])

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const locale = ((form.locale as string) || '').trim()
    if (locale && !BCP47_RE.test(locale)) {
      toast.error('Enter a valid locale (BCP47, e.g. en-IN, en-US, hi).')
      return
    }
    try {
      const payload = { ...form }
      if ((payload.thousandsSeparator as string) === NONE_SENTINEL) payload.thousandsSeparator = '' as unknown as string
      if ((payload.decimalSeparator as string) === NONE_SENTINEL) payload.decimalSeparator = '' as unknown as string
      await updateLocalization.mutateAsync(payload)
      toast.success('Localization settings saved')
      setIsEditing(false)
    } catch {
      toast.error('Failed to save localization settings')
    }
  }

  const sampleDate = new Date()
  const sampleNumber = 1234567.89

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
    return <ErrorState title="Failed to load localization" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Localization"
        description="Configure regional display behavior for your tenant."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Localization' },
        ]}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={() => { if (config) setForm(config); setIsEditing(false) }} disabled={updateLocalization.isPending}>Cancel</Button>
              <Button onClick={handleSave} loading={updateLocalization.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Globe className="h-4 w-4 mr-1.5" />
              Edit Settings
            </Button>
          )
        }
      />

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Default Language</Label>
              <Select value={form.language || 'en'} onValueChange={(v) => updateField('language', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Locale</Label>
              <Input value={form.locale || ''} onChange={(e) => updateField('locale', e.target.value)} disabled={!isEditing} placeholder="en-IN" />
              <p className="text-[10px] text-muted-foreground">BCP47 format (e.g. en-IN, en-US, hi)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time */}
      <Card>
        <CardHeader>
          <CardTitle>Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={form.timezone || 'Asia/Kolkata'} onValueChange={(v) => updateField('timezone', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date Format</Label>
              <Select value={form.dateFormat || 'dd MMM yyyy'} onValueChange={(v) => updateField('dateFormat', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time Format</Label>
              <Select value={form.timeFormat || 'HH:mm'} onValueChange={(v) => updateField('timeFormat', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIME_FORMATS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-surface-muted p-3">
            <p className="text-[12px] text-muted-foreground">
              Preview: <span className="font-medium text-foreground">{safeFormatDate(sampleDate, form.dateFormat as string, 'dd MMM yyyy')} {safeFormatDate(sampleDate, form.timeFormat as string, 'HH:mm')}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Number Formatting */}
      <Card>
        <CardHeader>
          <CardTitle>Number Formatting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Decimal Separator</Label>
              <Select value={(form.decimalSeparator as string) === '' ? NONE_SENTINEL : ((form.decimalSeparator as string) || '.')} onValueChange={(v) => updateField('decimalSeparator', v === NONE_SENTINEL ? '' : v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DECIMAL_SEPARATORS.map((s) => <SelectItem key={s === '' ? NONE_SENTINEL : s} value={s === '' ? NONE_SENTINEL : s}>{s === '' ? '(none)' : s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Thousands Separator</Label>
              <Select value={(form.thousandsSeparator as string) === '' ? NONE_SENTINEL : ((form.thousandsSeparator as string) || ',')} onValueChange={(v) => updateField('thousandsSeparator', v === NONE_SENTINEL ? '' : v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THOUSANDS_SEPARATORS.map((s) => <SelectItem key={s === '' ? NONE_SENTINEL : s || NONE_SENTINEL} value={s === '' ? NONE_SENTINEL : s}>{s === '' ? '(none)' : (s === ' ' ? '(space)' : s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Decimal Precision</Label>
              <Select value={String(form.decimalPrecision ?? 2)} onValueChange={(v) => updateField('decimalPrecision', parseInt(v))} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} digits</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-surface-muted p-3">
            <p className="text-[12px] text-muted-foreground">
              Preview: <span className="font-medium text-foreground tabular-nums">
                {sampleNumber.toLocaleString(undefined, {
                  minimumFractionDigits: form.decimalPrecision ?? 2,
                  maximumFractionDigits: form.decimalPrecision ?? 2,
                })}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input value={form.country || ''} onChange={(e) => updateField('country', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Input value={form.region || ''} onChange={(e) => updateField('region', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
