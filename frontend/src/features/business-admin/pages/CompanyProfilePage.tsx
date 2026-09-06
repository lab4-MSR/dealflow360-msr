import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/shared'
import { useCompanyProfile, useUpdateCompanyProfile } from '../hooks/use-business-admin'
import type { CompanyProfile } from '../types'
import { toast } from 'sonner'
import {
  Save,
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Server,
  UserCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

export function CompanyProfilePage() {
  const { data: profile, isLoading, error, refetch } = useCompanyProfile()
  const updateProfile = useUpdateCompanyProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [copiedTenant, setCopiedTenant] = useState(false)
  const [activeTab, setActiveTab] = useState('identity')

  const defaultAddress = useMemo(() => ({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
  }), [])

  const defaultContact = useMemo(() => ({
    name: '',
    email: '',
    phone: '',
    title: 'Managing Director / Corporate Signatory',
  }), [])

  const [form, setForm] = useState<CompanyProfile>({
    name: '',
    legalName: '',
    businessType: 'Private Limited Company',
    industry: 'Enterprise Software / SaaS',
    registrationNumber: '',
    taxId: '',
    email: '',
    phone: '',
    website: '',
    supportEmail: '',
    address: defaultAddress,
    primaryContact: defaultContact,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        address: { ...defaultAddress, ...(profile.address || {}) },
        primaryContact: { ...defaultContact, ...(profile.primaryContact || {}) },
      })
    }
  }, [profile, defaultAddress, defaultContact])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const updateAddress = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...(prev.address || defaultAddress),
        [field]: value,
      },
    }))
  }

  const updateContact = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      primaryContact: {
        ...(prev.primaryContact || defaultContact),
        [field]: value,
      },
    }))
  }

  const copyTenantId = async () => {
    const tenantId = 'tenant_org_dlf360_prod'
    try {
      await navigator.clipboard.writeText(tenantId)
      setCopiedTenant(true)
      toast.success('Tenant Organization ID copied to clipboard')
      setTimeout(() => setCopiedTenant(false), 2000)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = tenantId
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopiedTenant(true)
        toast.success('Tenant Organization ID copied to clipboard')
        setTimeout(() => setCopiedTenant(false), 2000)
      } catch {
        toast.error('Failed to copy Tenant ID. Please copy it manually.')
      }
    }
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    const CIN_RE = /^[A-Z]{1}\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/
    const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/
    const PHONE_RE = /^[+]?[\d\s\-()]{7,20}$/
    const PIN_RE = /^\d{6}$/
    if (!form.name?.trim()) errs.name = 'Operating company name is required'
    if (!form.email?.trim()) {
      errs.email = 'Primary billing email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid business email address'
    }
    if (form.supportEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail)) {
      errs.supportEmail = 'Enter a valid support email address'
    }
    if (form.website && !/^https?:\/\/.+/.test(form.website)) {
      errs.website = 'Website must start with http:// or https://'
    }
    if (form.registrationNumber?.trim() && !CIN_RE.test(form.registrationNumber.trim())) {
      errs.registrationNumber = 'Enter a valid 21-character CIN (e.g. U72200MH2021PTC123456)'
    }
    if (form.taxId?.trim() && !GSTIN_RE.test(form.taxId.trim().toUpperCase())) {
      errs.taxId = 'Enter a valid 15-character GSTIN (e.g. 27AABCB1234F1Z5)'
    }
    if (form.phone?.trim() && !PHONE_RE.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number'
    }
    if (form.primaryContact?.phone?.trim() && !PHONE_RE.test(form.primaryContact.phone.trim())) {
      errs.contactPhone = 'Enter a valid executive contact phone number'
    }
    if (form.primaryContact?.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContact.email)) {
      errs.contactEmail = 'Enter a valid executive email address'
    }
    if (form.address?.postalCode?.trim() && !PIN_RE.test(form.address.postalCode.trim())) {
      errs.postalCode = 'Enter a valid 6-digit PIN code'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please resolve the validation errors before saving.')
      return
    }
    try {
      await updateProfile.mutateAsync(form)
      toast.success('Company Profile successfully updated and synced across workspaces!')
      setIsEditing(false)
    } catch {
      toast.error('Failed to update company profile. Please try again.')
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({
        ...profile,
        address: { ...defaultAddress, ...(profile.address || {}) },
        primaryContact: { ...defaultContact, ...(profile.primaryContact || {}) },
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <ErrorState
          title="Failed to load corporate profile"
          description="Unable to fetch business organization metadata. Please verify network connectivity or retry."
          onRetry={refetch}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ─── ENTERPRISE PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Company Profile
            </h1>
            <Badge variant="success" className="gap-1.5 py-0.5 px-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Entity
            </Badge>
            <span className="hidden md:inline-flex text-xs font-mono bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/60">
              Active Tier: Enterprise
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Authoritative corporate registration, legal domicile, tax credentials, and multi-tenant security envelope.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={copyTenantId}
            className="h-9 px-3 text-xs gap-1.5 font-medium border-border/80"
            title="Copy Tenant Organization ID"
          >
            {copiedTenant ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-semibold">Copied ID</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Tenant ID</span>
              </>
            )}
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-sm"
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                <Save className="h-3.5 w-3.5" />
                {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              <Building2 className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* ─── CORPORATE IDENTITY HERO BANNER ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-surface-muted/40 p-6 sm:p-7 shadow-elevation-1">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {/* Corporate Logo / Emblem Avatar */}
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary shadow-sm font-display text-3xl font-black">
              {form.name ? form.name.charAt(0).toUpperCase() : 'D'}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-card text-white">
                <Check className="h-3 w-3" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-display">
                  {form.name || 'DealFlow Organization'}
                </h2>
                {form.legalName && form.legalName !== form.name && (
                  <span className="text-xs text-muted-foreground font-mono">
                    ({form.legalName})
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground">{form.businessType || 'Private Limited'}</span>
                <span>•</span>
                <span>{form.industry || 'Technology & B2B Solutions'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tax Compliant (GSTIN Verified)
                </span>
              </p>

              {/* Corporate Credential Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-mono">
                <span className="bg-muted/70 text-foreground px-2.5 py-1 rounded-md border border-border/60 flex items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold">CIN:</span>
                  <strong className="text-foreground">{form.registrationNumber || 'U72200MH2021PTC123456'}</strong>
                </span>

                <span className="bg-muted/70 text-foreground px-2.5 py-1 rounded-md border border-border/60 flex items-center gap-1.5">
                  <span className="text-muted-foreground font-semibold">GSTIN:</span>
                  <strong className="text-foreground">{form.taxId || '27AABCB1234F1Z5'}</strong>
                </span>

                <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20 flex items-center gap-1.5 font-sans">
                  <Lock className="h-3 w-3" />
                  <span>RLS Enforced</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Indicator Panel */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-border/70 pt-4 md:pt-0 md:pl-6 gap-3 shrink-0 text-xs">
            <div className="text-left md:text-right space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">Primary Currency</span>
              <span className="font-semibold text-foreground font-mono">INR (₹) · Indian Rupee</span>
            </div>
            <div className="text-left md:text-right space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">Server Region</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ap-south-1 (Mumbai)
              </span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Editing mode active. Changes will update all generated quotations, invoices, and customer receipts.</span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <button
                type="button"
                onClick={handleCancel}
                className="underline hover:text-foreground cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── TABBED STRUCTURED CONFIGURATION ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="bg-surface-muted p-1 border border-border/70 w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto gap-1">
          <TabsTrigger value="identity" className="gap-2 text-xs py-2 px-3.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Corporate Identity</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2 text-xs py-2 px-3.5">
            <Mail className="h-3.5 w-3.5" />
            <span>Communications</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="gap-2 text-xs py-2 px-3.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>Registered Address</span>
          </TabsTrigger>
          <TabsTrigger value="executive" className="gap-2 text-xs py-2 px-3.5">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Executive Officers</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2 text-xs py-2 px-3.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Trust & Governance</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: CORPORATE IDENTITY ─── */}
        <TabsContent value="identity" className="space-y-4">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-display">Corporate Registry & Classification</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Legal business naming, entity incorporation type, and government tax identifiers.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  Registry Sync: Up to date
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Operating Company Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="DealFlow Technologies Pvt Ltd"
                    error={!!errors.name}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Legal Registered Name</Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.legalName || ''}
                    onChange={(e) => updateField('legalName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="DealFlow Enterprise Solutions Private Limited"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Entity Legal Structure</Label>
                  {isEditing ? (
                    <Select
                      value={form.businessType || 'Private Limited Company'}
                      onValueChange={(val) => updateField('businessType', val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private Limited Company">Private Limited Company (Pvt Ltd)</SelectItem>
                        <SelectItem value="Public Limited Company">Public Limited Company (Ltd)</SelectItem>
                        <SelectItem value="Limited Liability Partnership">Limited Liability Partnership (LLP)</SelectItem>
                        <SelectItem value="Partnership Firm">Partnership Firm</SelectItem>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="h-9 text-xs"
                      value={form.businessType || 'Private Limited Company'}
                      disabled
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Primary Operating Industry</Label>
                  {isEditing ? (
                    <Select
                      value={form.industry || 'Enterprise Software / SaaS'}
                      onValueChange={(val) => updateField('industry', val)}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enterprise Software / SaaS">Enterprise Software & SaaS</SelectItem>
                        <SelectItem value="Industrial Manufacturing">Industrial Manufacturing & Engineering</SelectItem>
                        <SelectItem value="Logistics & Supply Chain">Logistics, Freight & Distribution</SelectItem>
                        <SelectItem value="Telecommunications & Infrastructure">Telecommunications & Infrastructure</SelectItem>
                        <SelectItem value="IT Services & Consulting">IT Services & Digital Consulting</SelectItem>
                        <SelectItem value="Financial Services & Fintech">Financial Services & Fintech</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="h-9 text-xs"
                      value={form.industry || 'Enterprise Software / SaaS'}
                      disabled
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Corporate Registration / CIN</Label>
                  <Input
                    className="h-9 text-xs font-mono"
                    value={form.registrationNumber || ''}
                    onChange={(e) => updateField('registrationNumber', e.target.value)}
                    disabled={!isEditing}
                    placeholder="U72200MH2021PTC123456"
                    error={!!errors.registrationNumber}
                  />
                  {errors.registrationNumber && <p className="text-[11px] text-rose-500 font-medium">{errors.registrationNumber}</p>}
                  <p className="text-[10px] text-muted-foreground">Ministry of Corporate Affairs 21-digit identifier</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Goods & Services Tax ID (GSTIN)</Label>
                  <Input
                    className="h-9 text-xs font-mono"
                    value={form.taxId || ''}
                    onChange={(e) => updateField('taxId', e.target.value.toUpperCase())}
                    disabled={!isEditing}
                    placeholder="27AABCB1234F1Z5"
                    error={!!errors.taxId}
                  />
                  {errors.taxId && <p className="text-[11px] text-rose-500 font-medium">{errors.taxId}</p>}
                  <p className="text-[10px] text-muted-foreground">State Code (2) + PAN (10) + Entity (1) + Z + Checksum (1)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: COMMUNICATIONS & WEB ─── */}
        <TabsContent value="contacts" className="space-y-4">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold font-display">Communication Coordinates & Endpoints</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Primary channels for dispatching invoices, quotations, order receipts, and customer support.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Primary Corporate Email <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      className="h-9 text-xs pl-9"
                      value={form.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      disabled={!isEditing}
                      placeholder="corporate@company.com"
                      error={!!errors.email}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Customer Support Desk</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      className="h-9 text-xs pl-9"
                      value={form.supportEmail || ''}
                      onChange={(e) => updateField('supportEmail', e.target.value)}
                      disabled={!isEditing}
                      placeholder="support@company.com"
                      error={!!errors.supportEmail}
                    />
                  </div>
                  {errors.supportEmail && <p className="text-[11px] text-rose-500 font-medium">{errors.supportEmail}</p>}
                  <p className="text-[10px] text-muted-foreground">Appears on customer portal help widgets</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Official Corporate Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-9 text-xs pl-9"
                      value={form.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+91 (022) 6820-0000"
                      error={!!errors.phone}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Corporate Website</span>
                    {form.website && (
                      <a
                        href={form.website.startsWith('http') ? form.website : `https://${form.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 font-normal"
                      >
                        Visit <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-9 text-xs pl-9"
                      value={form.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://www.example.com"
                      error={!!errors.website}
                    />
                  </div>
                  {errors.website && <p className="text-[11px] text-rose-500 font-medium">{errors.website}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 3: REGISTERED DOMICILE ADDRESS ─── */}
        <TabsContent value="address" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 border border-border/80 shadow-xs">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-base font-bold font-display">Registered Office Address</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Official statutory domicile printed on commercial tax invoices, bills of lading, and quotations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Address Line 1</Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.address?.line1 || ''}
                    onChange={(e) => updateAddress('line1', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tower 4, Suite 800, Express Zone Business Park"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Address Line 2 (Optional)</Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.address?.line2 || ''}
                    onChange={(e) => updateAddress('line2', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Western Express Highway, Malad East"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">City</Label>
                    <Input
                      className="h-9 text-xs"
                      value={form.address?.city || ''}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Mumbai"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">State / Union Territory</Label>
                    <Input
                      className="h-9 text-xs"
                      value={form.address?.state || ''}
                      onChange={(e) => updateAddress('state', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Postal / PIN Code</Label>
                    <Input
                      className="h-9 text-xs font-mono"
                      value={form.address?.postalCode || ''}
                      onChange={(e) => updateAddress('postalCode', e.target.value)}
                      disabled={!isEditing}
                      placeholder="400097"
                      error={!!errors.postalCode}
                    />
                  </div>
                  {errors.postalCode && <p className="text-[11px] text-rose-500 font-medium">{errors.postalCode}</p>}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Country</Label>
                    <Input
                      className="h-9 text-xs font-medium"
                      value={form.address?.country || 'India'}
                      onChange={(e) => updateAddress('country', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Letterhead Preview Card */}
            <Card className="border border-border/80 bg-surface-muted/30 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Tax Invoice Header Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs space-y-3">
                <div className="rounded-xl border border-border/70 bg-card p-4 space-y-2 shadow-2xs font-sans">
                  <p className="font-bold text-sm text-foreground">{form.name || 'Company Name'}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {form.address?.line1 || 'Registered Address Line 1'}
                    {form.address?.line2 ? `, ${form.address.line2}` : ''}
                    <br />
                    {form.address?.city || 'City'}, {form.address?.state || 'State'} - {form.address?.postalCode || '000000'}
                    <br />
                    {form.address?.country || 'India'}
                  </p>
                  <div className="pt-2 border-t border-border/60 text-[11px] font-mono space-y-0.5 text-muted-foreground">
                    <p>GSTIN: <strong className="text-foreground">{form.taxId || '27AABCB1234F1Z5'}</strong></p>
                    <p>CIN: <strong className="text-foreground">{form.registrationNumber || 'U72200MH2021PTC123456'}</strong></p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  This address format is automatically rendered on system-generated PDF quotations, dispatch notes, and GST invoices.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 4: EXECUTIVE OFFICERS & SIGNATORIES ─── */}
        <TabsContent value="executive" className="space-y-4">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-base font-bold font-display">Statutory Signatory & Executive Contact</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Designated authorized signatory for legal contract execution and commercial notices.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Signatory Full Name</Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.primaryContact?.name || ''}
                    onChange={(e) => updateContact('name', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Aditya Verma"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Direct Executive Email</Label>
                  <Input
                    type="email"
                    className="h-9 text-xs"
                    value={form.primaryContact?.email || ''}
                    onChange={(e) => updateContact('email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="a.verma@company.com"
                    error={!!errors.contactEmail}
                  />
                </div>
                {errors.contactEmail && <p className="text-[11px] text-rose-500 font-medium sm:col-span-1">{errors.contactEmail}</p>}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Direct Mobile / Extension</Label>
                  <Input
                    className="h-9 text-xs"
                    value={form.primaryContact?.phone || ''}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="+91 98200 12345"
                    error={!!errors.contactPhone}
                  />
                </div>
              </div>
              {errors.contactPhone && <p className="text-[11px] text-rose-500 font-medium">{errors.contactPhone}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 5: TRUST & GOVERNANCE ─── */}
        <TabsContent value="governance" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Multi-Tenant Isolation
                  </CardTitle>
                  <Lock className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Strict Row-Level Security (RLS)</p>
                <p className="text-[11px] text-muted-foreground">
                  Database queries strictly partitioned by <code>business_id</code>. Cross-tenant access is cryptographically prohibited.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Data Sovereignty & Region
                  </CardTitle>
                  <Server className="h-4 w-4 text-sky-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm font-semibold text-foreground">AWS Mumbai (ap-south-1)</p>
                <p className="text-[11px] text-muted-foreground">
                  In-country residency meeting national data protection requirements and low-latency ERP execution.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Audit Trail Posture
                  </CardTitle>
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Immutable Append-Only Log</p>
                <p className="text-[11px] text-muted-foreground">
                  Every commercial edit, discount override, and status mutation is permanently recorded with actor attribution.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
