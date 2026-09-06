import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Shield, Globe, Bell, Plug, Wrench, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PlatformSettings {
  general: { platformName: string; logo: string; defaultLanguage: string }
  security: { authPolicy: string; passwordMinLength: number; sessionDuration: string; mfaRequired: boolean; ipRestriction: string }
  defaults: { defaultCurrency: string; defaultTimezone: string; localization: string }
  notifications: { emailNotifications: boolean; systemAlerts: boolean; adminNotifications: boolean }
  integrations: { emailProvider: string; storageProvider: string; externalServices: string }
  maintenance: { maintenanceMode: boolean; lastBackup: string; nextScheduledBackup: string }
}

const MOCK_SETTINGS: PlatformSettings = {
  general: { platformName: 'DealFlow360', logo: '', defaultLanguage: 'en' },
  security: { authPolicy: 'email_password', passwordMinLength: 8, sessionDuration: '24h', mfaRequired: false, ipRestriction: '' },
  defaults: { defaultCurrency: 'INR', defaultTimezone: 'UTC', localization: 'en-US' },
  notifications: { emailNotifications: true, systemAlerts: true, adminNotifications: true },
  integrations: { emailProvider: 'smtp', storageProvider: 's3', externalServices: 'none' },
  maintenance: { maintenanceMode: false, lastBackup: '2026-09-05T02:00:00Z', nextScheduledBackup: '2026-09-06T02:00:00Z' },
}

const SECTIONS = [
  { id: 'general' as const, label: 'General', icon: Settings },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'defaults' as const, label: 'Platform Defaults', icon: Globe },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'integrations' as const, label: 'Integrations', icon: Plug },
  { id: 'maintenance' as const, label: 'Maintenance', icon: Wrench },
]

export function PlatformSettingsPage() {
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<string>('general')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [form, setForm] = useState<PlatformSettings | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async (): Promise<PlatformSettings> => {
      try {
        const response = await fetch('/api/v1/platform/settings', {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}` },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const json = await response.json()
        if (!json.success) throw new Error(json.error?.message)
        return json.data
      } catch { return MOCK_SETTINGS }
    },
    staleTime: 5 * 60 * 1000,
  })

  const saveMutation = useMutation({
    mutationFn: async (config: Partial<PlatformSettings>) => {
      const response = await fetch('/api/v1/platform/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}` },
        body: JSON.stringify(config),
      })
      if (!response.ok) throw new Error('Failed to save')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
      setEditingSection(null)
      setForm(null)
      toast.success('Settings saved successfully')
    },
    onError: () => toast.error('Failed to save settings'),
  })

  useEffect(() => {
    if (settings) setForm(structuredClone(settings))
  }, [settings])

  const hasUnsavedChanges = editingSection !== null && form !== null && settings !== null &&
    JSON.stringify(form) !== JSON.stringify(settings)

  const handleStartEditing = useCallback((section: string) => {
    if (settings) setForm(structuredClone(settings))
    setEditingSection(section)
    setActiveSection(section)
  }, [settings])

  const handleSave = useCallback(() => {
    if (!form || !editingSection) return
    if (editingSection === 'security' || editingSection === 'maintenance') {
      setConfirmOpen(true)
      return
    }
    saveMutation.mutate({ [editingSection]: form[editingSection as keyof PlatformSettings] } as Partial<PlatformSettings>)
  }, [form, editingSection, saveMutation])

  const handleConfirmSave = useCallback(() => {
    if (!form || !editingSection) return
    saveMutation.mutate({ [editingSection]: form[editingSection as keyof PlatformSettings] } as Partial<PlatformSettings>)
    setConfirmOpen(false)
  }, [form, editingSection, saveMutation])

  const handleDiscard = useCallback(() => {
    setEditingSection(null)
    setForm(settings ? structuredClone(settings) : null)
  }, [settings])

  const updateField = useCallback((section: string, key: string, value: unknown) => {
    setForm((prev) => {
      if (!prev) return prev
      return { ...prev, [section]: { ...(prev[section as keyof PlatformSettings] as Record<string, unknown>), [key]: value } }
    })
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-3" />
        </div>
      </div>
    )
  }

  if (error || !settings) return <ErrorState title="Unable to load settings" description="We couldn't load the platform settings." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Platform Settings</h1>
          <p className="text-body-small text-muted-foreground mt-1">Global platform configuration and defaults.</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-caption text-warning"><span className="h-2 w-2 rounded-full bg-warning animate-pulse" /> Unsaved changes</span>
            <Button variant="outline" size="sm" onClick={handleDiscard}>Discard</Button>
            <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <nav className="space-y-1">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); if (editingSection && editingSection !== section.id) { if (hasUnsavedChanges) { if (confirm('You have unsaved changes. Discard?')) { handleDiscard() } else return } else { setEditingSection(null) } } }}
                className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-small font-medium transition-colors', activeSection === section.id ? 'bg-primary-subtle text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground')}
              >
                <Icon className="h-4 w-4" /> {section.label}
              </button>
            )
          })}
        </nav>

        {/* Section Content */}
        <div className="lg:col-span-3">
          {activeSection === 'general' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>General</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('general')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input value={form?.general.platformName || ''} onChange={(e) => updateField('general', 'platformName', e.target.value)} disabled={editingSection !== 'general'} />
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={form?.general.defaultLanguage || 'en'} onValueChange={(v) => updateField('general', 'defaultLanguage', v)} disabled={editingSection !== 'general'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Security</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('security')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Authentication Policy</Label>
                  <Select value={form?.security.authPolicy || 'email_password'} onValueChange={(v) => updateField('security', 'authPolicy', v)} disabled={editingSection !== 'security'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email_password">Email + Password</SelectItem>
                      <SelectItem value="sso">Single Sign-On</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input type="number" value={form?.security.passwordMinLength || 8} onChange={(e) => updateField('security', 'passwordMinLength', parseInt(e.target.value) || 8)} disabled={editingSection !== 'security'} />
                </div>
                <div className="space-y-2">
                  <Label>Session Duration</Label>
                  <Select value={form?.security.sessionDuration || '24h'} onValueChange={(v) => updateField('security', 'sessionDuration', v)} disabled={editingSection !== 'security'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-caption text-muted-foreground">Changing session duration may affect currently authenticated users.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Label>Require MFA</Label>
                  <button onClick={() => editingSection === 'security' && updateField('security', 'mfaRequired', !form?.security.mfaRequired)} disabled={editingSection !== 'security'} className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', form?.security.mfaRequired ? 'bg-primary' : 'bg-surface-muted', editingSection !== 'security' && 'opacity-50 cursor-not-allowed')}>
                    <span className={cn('pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform', form?.security.mfaRequired ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'defaults' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Platform Defaults</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('defaults')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-caption text-muted-foreground">Applied to new businesses/users where tenant-specific configuration has not been provided.</p>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select value={form?.defaults.defaultCurrency || 'INR'} onValueChange={(v) => updateField('defaults', 'defaultCurrency', v)} disabled={editingSection !== 'defaults'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Select value={form?.defaults.defaultTimezone || 'UTC'} onValueChange={(v) => updateField('defaults', 'defaultTimezone', v)} disabled={editingSection !== 'defaults'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('notifications')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email notifications for important platform events.' },
                  { key: 'systemAlerts', label: 'System Alerts', desc: 'Receive alerts about system health and performance.' },
                  { key: 'adminNotifications', label: 'Admin Notifications', desc: 'Notifications for administrative actions and changes.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div><p className="text-small font-medium">{item.label}</p><p className="text-caption text-muted-foreground">{item.desc}</p></div>
                    <button onClick={() => editingSection === 'notifications' && updateField('notifications', item.key, !(form?.notifications as Record<string, boolean>)?.[item.key])} disabled={editingSection !== 'notifications'} className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', (form?.notifications as Record<string, boolean>)?.[item.key] ? 'bg-primary' : 'bg-surface-muted', editingSection !== 'notifications' && 'opacity-50 cursor-not-allowed')}>
                      <span className={cn('pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform', (form?.notifications as Record<string, boolean>)?.[item.key] ? 'translate-x-4' : 'translate-x-0')} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Integrations</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('integrations')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Provider</Label>
                  <Select value={form?.integrations.emailProvider || 'smtp'} onValueChange={(v) => updateField('integrations', 'emailProvider', v)} disabled={editingSection !== 'integrations'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Storage Provider</Label>
                  <Select value={form?.integrations.storageProvider || 's3'} onValueChange={(v) => updateField('integrations', 'storageProvider', v)} disabled={editingSection !== 'integrations'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'maintenance' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maintenance</CardTitle>
                {!editingSection && <Button variant="outline" size="sm" onClick={() => handleStartEditing('maintenance')}>Edit</Button>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-small font-medium">Maintenance Mode</p>
                    <p className="text-caption text-muted-foreground">When enabled, only Super Admins can access the platform. All other users will see a maintenance message.</p>
                  </div>
                  <button onClick={() => editingSection === 'maintenance' && updateField('maintenance', 'maintenanceMode', !form?.maintenance.maintenanceMode)} disabled={editingSection !== 'maintenance'} className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', form?.maintenance.maintenanceMode ? 'bg-danger' : 'bg-surface-muted', editingSection !== 'maintenance' && 'opacity-50 cursor-not-allowed')}>
                    <span className={cn('pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform', form?.maintenance.maintenanceMode ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div><p className="text-caption text-muted-foreground">Last Backup</p><p className="text-small font-medium">{settings.maintenance.lastBackup ? new Date(settings.maintenance.lastBackup).toLocaleString() : 'Never'}</p></div>
                  <div><p className="text-caption text-muted-foreground">Next Scheduled Backup</p><p className="text-small font-medium">{settings.maintenance.nextScheduledBackup ? new Date(settings.maintenance.nextScheduledBackup).toLocaleString() : 'Not scheduled'}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Save Security Settings?" description="Security changes may affect all users on the platform. Please confirm you want to save these changes." confirmLabel="Save Changes" variant="warning" onConfirm={handleConfirmSave} loading={saveMutation.isPending} />
    </div>
  )
}
