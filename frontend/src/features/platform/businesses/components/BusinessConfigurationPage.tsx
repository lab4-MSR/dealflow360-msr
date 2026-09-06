import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/shared'
import {
  useBusinessConfiguration,
  useUpdateBusinessConfiguration,
} from '../hooks/use-businesses'
import type { BusinessConfiguration } from '../types'
import {
  Settings,
  Palette,
  DollarSign,
  Truck,
  CreditCard,
  Shield,
  Save,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'sales', label: 'Sales Configuration', icon: DollarSign },
  { id: 'operations', label: 'Operations', icon: Truck },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

const CURRENCIES = [
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'GMT / London' },
  { value: 'Europe/Berlin', label: 'CET / Berlin' },
  { value: 'Asia/Tokyo', label: 'JST / Tokyo' },
  { value: 'Asia/Kolkata', label: 'IST / Kolkata' },
]

const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'de-DE', label: 'German' },
  { value: 'fr-FR', label: 'French' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'ja-JP', label: 'Japanese' },
]

const AUTHENTICATION_METHODS = [
  { value: 'email_password', label: 'Email + Password' },
  { value: 'sso', label: 'Single Sign-On (SSO)' },
  { value: 'both', label: 'Both' },
]

const SESSION_DURATIONS = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '8h', label: '8 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
]

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

const SUBSCRIPTION_PLANS = [
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
]

const PRICING_MODELS = [
  { value: 'standard', label: 'Standard Pricing' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'volume', label: 'Volume Pricing' },
  { value: 'custom', label: 'Custom' },
]

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 py-3">
      <div className="space-y-0.5">
        <Label className="text-body font-medium text-foreground">{label}</Label>
        {description && (
          <p className="text-caption text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="w-full sm:w-[280px] shrink-0">{children}</div>
    </div>
  )
}

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address'
  return null
}

function validateUrl(url: string): string | null {
  if (!url) return null
  try {
    new URL(url)
    return null
  } catch {
    return 'Invalid URL'
  }
}

export function BusinessConfigurationPage() {
  const { id } = useParams<{ id: string }>()
  const { data: config, isLoading, error, refetch } = useBusinessConfiguration(id || '')
  const updateMutation = useUpdateBusinessConfiguration(id || '')

  const [activeSection, setActiveSection] = useState<SectionId>('general')
  const [editingSection, setEditingSection] = useState<SectionId | null>(null)
  const [form, setForm] = useState<BusinessConfiguration | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSave, setPendingSave] = useState<BusinessConfiguration | null>(null)

  const hasUnsavedChanges = editingSection !== null && form !== null && config !== null &&
    JSON.stringify(form) !== JSON.stringify(config)

  useEffect(() => {
    if (config) {
      setForm(structuredClone(config))
    }
  }, [config])

  const updateGeneral = useCallback((key: keyof BusinessConfiguration['general'], value: string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        general: { ...prev.general, [key]: value },
      }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`general.${key}`]
      return next
    })
  }, [])

  const updateBranding = useCallback((key: keyof BusinessConfiguration['branding'], value: string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        branding: { ...prev.branding, [key]: value },
      }
    })
  }, [])

  const updateSales = useCallback((key: keyof BusinessConfiguration['sales'], value: boolean | string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sales: { ...prev.sales, [key]: value },
      }
    })
  }, [])

  const updateOperations = useCallback((key: keyof BusinessConfiguration['operations'], value: boolean | number) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        operations: { ...prev.operations, [key]: value },
      }
    })
  }, [])

  const updateBilling = useCallback((key: keyof BusinessConfiguration['billing'], value: boolean | string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        billing: { ...prev.billing, [key]: value },
      }
    })
  }, [])

  const updateSecurity = useCallback((key: keyof BusinessConfiguration['security'], value: boolean | string) => {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        security: { ...prev.security, [key]: value },
      }
    })
  }, [])

  const validateGeneral = useCallback((): boolean => {
    if (!form) return false
    const newErrors: Record<string, string> = {}
    const emailErr = validateEmail(form.general.email)
    if (emailErr) newErrors['general.email'] = emailErr
    if (form.general.website) {
      const urlErr = validateUrl(form.general.website)
      if (urlErr) newErrors['general.website'] = urlErr
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [form])

  const handleStartEditing = useCallback((section: SectionId) => {
    if (config) {
      setForm(structuredClone(config))
    }
    setEditingSection(section)
    setActiveSection(section)
    setErrors({})
  }, [config])

  const handleSave = useCallback(async () => {
    if (!form || editingSection === null) return

    if (editingSection === 'general') {
      if (!validateGeneral()) {
        toast.error('Please fix the validation errors before saving')
        return
      }
    }

    if (editingSection === 'security' || editingSection === 'billing') {
      setPendingSave(structuredClone(form))
      setConfirmOpen(true)
      return
    }

    try {
      await updateMutation.mutateAsync(form)
      toast.success(`${SECTIONS.find((s) => s.id === editingSection)?.label || 'Configuration'} saved successfully`)
      setEditingSection(null)
      setErrors({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save configuration')
    }
  }, [form, editingSection, updateMutation, validateGeneral])

  const handleConfirmSave = useCallback(async () => {
    if (!pendingSave) return
    try {
      await updateMutation.mutateAsync(pendingSave)
      toast.success('Configuration saved successfully')
      setEditingSection(null)
      setConfirmOpen(false)
      setPendingSave(null)
      setErrors({})
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save configuration')
    }
  }, [pendingSave, updateMutation])

  const handleDiscard = useCallback(() => {
    setEditingSection(null)
    setErrors({})
    if (config) {
      setForm(structuredClone(config))
    }
  }, [config])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-[250px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="hidden lg:block h-[500px] w-[200px] rounded-xl" />
          <div className="flex-1 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-[180px]" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-10 w-[280px] rounded-lg" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !config || !form) {
    return (
      <ErrorState
        title="Failed to load configuration"
        description="We couldn't load the business configuration. It may be temporarily unavailable."
        onRetry={() => refetch()}
      />
    )
  }

  const renderSectionNav = () => (
    <nav className="space-y-1">
      {SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        const isEditing = editingSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-label transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{section.label}</span>
            {isEditing && hasUnsavedChanges && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
            )}
          </button>
        )
      })}
    </nav>
  )

  const renderGeneralSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Business Information
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Basic business details and contact information.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Business Name" description="The display name of the business">
          <Input
            value={form.general.businessName}
            onChange={(e) => updateGeneral('businessName', e.target.value)}
            disabled={editingSection !== 'general'}
            placeholder="Business name"
            error={!!errors['general.businessName']}
          />
        </SettingRow>
        <SettingRow label="Legal Name" description="Official registered name">
          <Input
            value={form.general.legalName || ''}
            onChange={(e) => updateGeneral('legalName', e.target.value)}
            disabled={editingSection !== 'general'}
            placeholder="Legal entity name"
          />
        </SettingRow>
        <SettingRow label="Email" description="Primary business contact email">
          <Input
            type="email"
            value={form.general.email}
            onChange={(e) => updateGeneral('email', e.target.value)}
            disabled={editingSection !== 'general'}
            placeholder="admin@business.com"
            error={!!errors['general.email']}
          />
        </SettingRow>
        {errors['general.email'] && (
          <p className="text-caption text-danger pt-1">{errors['general.email']}</p>
        )}
        <SettingRow label="Phone" description="Business phone number">
          <Input
            value={form.general.phone || ''}
            onChange={(e) => updateGeneral('phone', e.target.value)}
            disabled={editingSection !== 'general'}
            placeholder="+1-555-0123"
          />
        </SettingRow>
        <SettingRow label="Website" description="Business website URL">
          <Input
            value={form.general.website || ''}
            onChange={(e) => updateGeneral('website', e.target.value)}
            disabled={editingSection !== 'general'}
            placeholder="https://example.com"
            error={!!errors['general.website']}
          />
        </SettingRow>
        {errors['general.website'] && (
          <p className="text-caption text-danger pt-1">{errors['general.website']}</p>
        )}

        <SettingRow label="Currency" description="Default currency for transactions">
          {editingSection === 'general' ? (
            <Select value={form.general.currency} onValueChange={(v) => updateGeneral('currency', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {CURRENCIES.find((c) => c.value === form.general.currency)?.label || form.general.currency}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Timezone" description="Default timezone for the business">
          {editingSection === 'general' ? (
            <Select value={form.general.timezone} onValueChange={(v) => updateGeneral('timezone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {TIMEZONES.find((t) => t.value === form.general.timezone)?.label || form.general.timezone}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Localization" description="Date and number formatting locale">
          {editingSection === 'general' ? (
            <Select value={form.general.locale || 'en-US'} onValueChange={(v) => updateGeneral('locale', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {LOCALES.find((l) => l.value === form.general.locale)?.label || form.general.locale || 'en-US'}
            </div>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderBrandingSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          Branding
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Customize the look and feel of the business portal.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Logo" description="Business logo displayed across the platform">
          {editingSection === 'branding' ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-muted overflow-hidden">
                {form.branding.logo ? (
                  <img src={form.branding.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Palette className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  value={form.branding.logo || ''}
                  onChange={(e) => updateBranding('logo', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-muted overflow-hidden">
                {form.branding.logo ? (
                  <img src={form.branding.logo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-caption text-muted-foreground">No logo</span>
                )}
              </div>
              <span className="text-body-small text-muted-foreground truncate max-w-[200px]">
                {form.branding.logo || 'Not set'}
              </span>
            </div>
          )}
        </SettingRow>

        <SettingRow label="Primary Color" description="Brand color used throughout the UI">
          {editingSection === 'branding' ? (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.branding.primaryColor || '#0066FF'}
                onChange={(e) => updateBranding('primaryColor', e.target.value)}
                className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-surface p-1"
              />
              <Input
                value={form.branding.primaryColor || ''}
                onChange={(e) => updateBranding('primaryColor', e.target.value)}
                placeholder="#0066FF"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="h-6 w-6 shrink-0 rounded-md border border-border"
                style={{ backgroundColor: form.branding.primaryColor || '#0066FF' }}
              />
              <span className="text-body text-foreground font-mono">
                {form.branding.primaryColor || '#0066FF'}
              </span>
            </div>
          )}
        </SettingRow>

        <SettingRow label="Favicon" description="Small icon for browser tabs">
          {editingSection === 'branding' ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface-muted overflow-hidden">
                {form.branding.favicon ? (
                  <img src={form.branding.favicon} alt="Favicon" className="h-full w-full object-contain" />
                ) : (
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  value={form.branding.favicon || ''}
                  onChange={(e) => updateBranding('favicon', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface-muted overflow-hidden">
                {form.branding.favicon ? (
                  <img src={form.branding.favicon} alt="Favicon" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-caption text-muted-foreground">None</span>
                )}
              </div>
              <span className="text-body-small text-muted-foreground truncate max-w-[200px]">
                {form.branding.favicon || 'Not set'}
              </span>
            </div>
          )}
        </SettingRow>

        <SettingRow label="Theme" description="Default theme for the business portal">
          {editingSection === 'branding' ? (
            <Select value={form.branding.theme} onValueChange={(v: 'light' | 'dark' | 'system') => updateBranding('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted capitalize">
              {form.branding.theme}
            </div>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderSalesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          Sales Configuration
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Configure pricing models, discount rules, and approval workflows.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Pricing Model" description="How pricing is calculated for this business">
          {editingSection === 'sales' ? (
            <Select value={form.sales.pricingModel || 'standard'} onValueChange={(v) => updateSales('pricingModel', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRICING_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {PRICING_MODELS.find((m) => m.value === form.sales.pricingModel)?.label || 'Standard Pricing'}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Discount Rules" description="Enable or disable automatic discount rules">
          {editingSection === 'sales' ? (
            <button
              type="button"
              onClick={() => updateSales('discountRulesEnabled', !form.sales.discountRulesEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.sales.discountRulesEnabled ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.sales.discountRulesEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.sales.discountRulesEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.sales.discountRulesEnabled
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.sales.discountRulesEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </SettingRow>

        <SettingRow label="Approval Rules" description="Require approvals for deals above threshold">
          {editingSection === 'sales' ? (
            <button
              type="button"
              onClick={() => updateSales('approvalRulesEnabled', !form.sales.approvalRulesEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.sales.approvalRulesEnabled ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.sales.approvalRulesEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.sales.approvalRulesEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.sales.approvalRulesEnabled
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.sales.approvalRulesEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderOperationsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-muted-foreground" />
          Operations
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Manage warehouses, shipping, and fulfillment settings.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Warehouses" description="Number of active warehouse locations">
          {editingSection === 'operations' ? (
            <Input
              type="number"
              min={0}
              value={form.operations.warehouses}
              onChange={(e) => updateOperations('warehouses', Math.max(0, parseInt(e.target.value, 10) || 0))}
            />
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {form.operations.warehouses}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Shipping" description="Enable shipping for orders and deals">
          {editingSection === 'operations' ? (
            <button
              type="button"
              onClick={() => updateOperations('shippingEnabled', !form.operations.shippingEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.operations.shippingEnabled ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.operations.shippingEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.operations.shippingEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.operations.shippingEnabled
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.operations.shippingEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </SettingRow>

        <SettingRow label="Fulfillment" description="Enable order fulfillment tracking">
          {editingSection === 'operations' ? (
            <button
              type="button"
              onClick={() => updateOperations('fulfillmentEnabled', !form.operations.fulfillmentEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.operations.fulfillmentEnabled ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.operations.fulfillmentEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.operations.fulfillmentEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.operations.fulfillmentEnabled
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.operations.fulfillmentEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderBillingSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          Billing
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Configure billing cycles, subscriptions, and proration rules.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Billing Cycle" description="How often the business is billed">
          {editingSection === 'billing' ? (
            <Select value={form.billing.billingCycle || 'monthly'} onValueChange={(v) => updateBilling('billingCycle', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_CYCLES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted capitalize">
              {form.billing.billingCycle || 'Monthly'}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Subscription Plan" description="Current plan for this business">
          {editingSection === 'billing' ? (
            <Select value={form.billing.subscriptionPlan || 'professional'} onValueChange={(v) => updateBilling('subscriptionPlan', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_PLANS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted capitalize">
              {form.billing.subscriptionPlan || 'Professional'}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Proration" description="Apply proration when plan changes mid-cycle">
          {editingSection === 'billing' ? (
            <button
              type="button"
              onClick={() => updateBilling('prorationEnabled', !form.billing.prorationEnabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.billing.prorationEnabled ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.billing.prorationEnabled}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.billing.prorationEnabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.billing.prorationEnabled
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.billing.prorationEnabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderSecuritySection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Security
        </CardTitle>
        <p className="text-body-small text-muted-foreground">
          Authentication methods, session policies, and access controls.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow label="Authentication Method" description="How users authenticate with this business">
          {editingSection === 'security' ? (
            <Select value={form.security.authenticationMethod || 'email_password'} onValueChange={(v) => updateSecurity('authenticationMethod', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTHENTICATION_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {AUTHENTICATION_METHODS.find((m) => m.value === form.security.authenticationMethod)?.label || 'Email + Password'}
            </div>
          )}
        </SettingRow>

        <SettingRow label="Session Duration" description="How long user sessions remain active">
          {editingSection === 'security' ? (
            <Select value={form.security.sessionDuration || '8h'} onValueChange={(v) => updateSecurity('sessionDuration', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SESSION_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted">
              {SESSION_DURATIONS.find((d) => d.value === form.security.sessionDuration)?.label || '8 Hours'}
            </div>
          )}
        </SettingRow>

        <SettingRow label="MFA Required" description="Require multi-factor authentication for all users">
          {editingSection === 'security' ? (
            <button
              type="button"
              onClick={() => updateSecurity('mfaRequired', !form.security.mfaRequired)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.security.mfaRequired ? 'bg-primary' : 'bg-surface-muted',
              )}
              role="switch"
              aria-checked={form.security.mfaRequired}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  form.security.mfaRequired ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          ) : (
            <span className={cn(
              'inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium',
              form.security.mfaRequired
                ? 'bg-success-subtle text-success'
                : 'bg-surface-muted text-muted-foreground',
            )}>
              {form.security.mfaRequired ? 'Required' : 'Optional'}
            </span>
          )}
        </SettingRow>

        <SettingRow label="IP Restriction" description="Restrict access to specific IP addresses (comma-separated)">
          {editingSection === 'security' ? (
            <Input
              value={form.security.ipRestriction || ''}
              onChange={(e) => updateSecurity('ipRestriction', e.target.value)}
              placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8"
            />
          ) : (
            <div className="flex h-10 items-center rounded-lg border border-transparent px-3 text-body text-foreground bg-surface-muted truncate">
              {form.security.ipRestriction || 'No restriction'}
            </div>
          )}
        </SettingRow>
      </CardContent>
    </Card>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSection()
      case 'branding':
        return renderBrandingSection()
      case 'sales':
        return renderSalesSection()
      case 'operations':
        return renderOperationsSection()
      case 'billing':
        return renderBillingSection()
      case 'security':
        return renderSecuritySection()
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h1 text-foreground">Business Configuration</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage settings, branding, and operational preferences for this business.
          </p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-body-small text-warning">
            <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
            Unsaved changes
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Sidebar Navigation (desktop) */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-3">
                {renderSectionNav()}
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Mobile Section Navigation */}
        <div className="flex-1 lg:hidden space-y-2">
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-label font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {renderActiveSection()}

          {/* Action Bar */}
          {editingSection !== null && (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
              <p className="text-body-small text-muted-foreground">
                Editing {SECTIONS.find((s) => s.id === editingSection)?.label}
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleDiscard} disabled={updateMutation.isPending}>
                  <X className="h-4 w-4 mr-1" />
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} loading={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* Start Editing Button */}
          {editingSection === null && (
            <div className="flex justify-end">
              <Button onClick={() => handleStartEditing(activeSection)} className="gap-1.5">
                <Settings className="h-4 w-4" />
                Edit {SECTIONS.find((s) => s.id === activeSection)?.label}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog for sensitive changes */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) setPendingSave(null)
        }}
        title={`Save ${SECTIONS.find((s) => s.id === editingSection)?.label || 'Configuration'} Changes?`}
        description={
          editingSection === 'security'
            ? 'Security changes may affect user access immediately. Are you sure you want to save these changes?'
            : 'Billing changes may affect the next billing cycle. Are you sure you want to save these changes?'
        }
        confirmLabel="Save Changes"
        variant="warning"
        onConfirm={handleConfirmSave}
        loading={updateMutation.isPending}
      />
    </div>
  )
}
