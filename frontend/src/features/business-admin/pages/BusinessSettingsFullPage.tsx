import { useState, useEffect } from 'react';
import { Settings, Palette, Bell, Shield, Plug, Database, Save, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { useBusinessSettings, useUpdateBusinessSettings, useNotificationSettings, useUpdateNotificationSettings, useSecuritySettings, useUpdateSecuritySettings, useIntegrationSettings, useUpdateIntegrationSettings, useDataPrivacySettings, useUpdateDataPrivacySettings, useBranding, useUpdateBranding } from '../hooks/use-business-admin';
import { toast } from 'sonner';

const NOTIF_ITEMS = [
  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
  { key: 'approvalNotifications', label: 'Approval Notifications', desc: 'Notify when approvals are required' },
  { key: 'dealAlerts', label: 'Deal Alerts', desc: 'Notifications for deal stage changes' },
  { key: 'inventoryAlerts', label: 'Inventory Alerts', desc: 'Low stock and backorder notifications' },
  { key: 'billingAlerts', label: 'Billing Alerts', desc: 'Payment and subscription notifications' },
  { key: 'systemAlerts', label: 'System Alerts', desc: 'Platform maintenance and updates' },
] as const;

export function BusinessSettingsFullPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showResetDialog, setShowResetDialog] = useState(false);

  const { data: settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const { data: notifications, isLoading: notifLoading } = useNotificationSettings();
  const updateNotifications = useUpdateNotificationSettings();
  const { data: security, isLoading: secLoading } = useSecuritySettings();
  const updateSecurity = useUpdateSecuritySettings();
  const { data: integrations, isLoading: intLoading } = useIntegrationSettings();
  const updateIntegrations = useUpdateIntegrationSettings();
  const { data: privacy, isLoading: privLoading } = useDataPrivacySettings();
  const updatePrivacy = useUpdateDataPrivacySettings();
  const { data: branding, isLoading: brandingLoading } = useBranding();
  const updateBranding = useUpdateBranding();

  // ─── Local controlled form state (initialized from fetched settings) ───
  const [generalForm, setGeneralForm] = useState({ businessName: '', legalName: '', industry: '', currency: 'INR', timezone: 'Asia/Kolkata', locale: 'en-IN' });
  const [appearanceForm, setAppearanceForm] = useState({ theme: 'system', primaryColor: '#4F46E5', primaryHover: '#4338CA' });
  const [notificationsForm, setNotificationsForm] = useState<Record<string, boolean>>({ emailNotifications: true, approvalNotifications: true, dealAlerts: true, inventoryAlerts: true, billingAlerts: true, systemAlerts: true });
  const [securityForm, setSecurityForm] = useState({ passwordMinLength: 8, passwordExpiryDays: 0, requireUpper: true, requireLower: true, requireNumbers: true, requireSpecial: true, sessionDuration: 24, idleTimeout: 30, maxConcurrentSessions: 3, mfa: 'optional' });
  const [integrationsForm, setIntegrationsForm] = useState({ emailProvider: '', paymentProvider: '', shippingProvider: '' });
  const [privacyForm, setPrivacyForm] = useState({ dataRetentionDays: 365, autoDeleteInactive: 'disabled', exportEnabled: true, anonymizeData: false, gdprCompliant: true });

  useEffect(() => {
    if (settings?.general) {
      const g = settings.general as unknown as Record<string, string>;
      setGeneralForm({
        businessName: g.businessName || '',
        legalName: g.legalName || '',
        industry: g.industry || '',
        currency: g.currency || 'INR',
        timezone: g.timezone || 'Asia/Kolkata',
        locale: g.locale || 'en-IN',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (branding) {
      setAppearanceForm((prev) => ({
        theme: prev.theme,
        primaryColor: (branding.primaryColor as string) || '#4F46E5',
        primaryHover: (branding.primaryHover as string) || '#4338CA',
      }));
    }
  }, [branding]);

  useEffect(() => {
    if (notifications) {
      setNotificationsForm({
        emailNotifications: notifications.emailNotifications ?? true,
        approvalNotifications: notifications.approvalNotifications ?? true,
        dealAlerts: notifications.dealAlerts ?? true,
        inventoryAlerts: notifications.inventoryAlerts ?? true,
        billingAlerts: notifications.billingAlerts ?? true,
        systemAlerts: notifications.systemAlerts ?? true,
      });
    }
  }, [notifications]);

  useEffect(() => {
    if (security) {
      setSecurityForm({
        passwordMinLength: security.passwordMinLength ?? 8,
        passwordExpiryDays: security.passwordExpiryDays ?? 0,
        requireUpper: security.passwordRequireUppercase ?? true,
        requireLower: security.passwordRequireLowercase ?? true,
        requireNumbers: security.passwordRequireNumbers ?? true,
        requireSpecial: security.passwordRequireSpecialChars ?? true,
        sessionDuration: security.sessionDuration ?? 24,
        idleTimeout: security.idleTimeout ?? 30,
        maxConcurrentSessions: security.maxConcurrentSessions ?? 3,
        mfa: security.mfaRequired ? 'required' : 'optional',
      });
    }
  }, [security]);

  useEffect(() => {
    if (integrations) {
      setIntegrationsForm({
        emailProvider: integrations.emailProvider || '',
        paymentProvider: integrations.paymentProvider || '',
        shippingProvider: integrations.shippingProvider || '',
      });
    }
  }, [integrations]);

  useEffect(() => {
    if (privacy) {
      setPrivacyForm({
        dataRetentionDays: privacy.dataRetentionDays ?? 365,
        autoDeleteInactive: privacy.autoDeleteInactive ? 'enabled' : 'disabled',
        exportEnabled: privacy.exportEnabled ?? true,
        anonymizeData: privacy.anonymizeData ?? false,
        gdprCompliant: privacy.gdprCompliant ?? true,
      });
    }
  }, [privacy]);

  const isLoading = settingsLoading || notifLoading || secLoading || intLoading || privLoading || brandingLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (settingsError) {
    return <ErrorState title="Failed to load settings" onRetry={refetchSettings} />;
  }

  const handleSaveGeneral = async () => {
    try {
      await updateSettings.mutateAsync({ general: generalForm } as unknown as Parameters<typeof updateSettings.mutateAsync>[0]);
      toast.success('General settings saved');
    } catch {
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveAppearance = async () => {
    try {
      await updateBranding.mutateAsync({ primaryColor: appearanceForm.primaryColor, primaryHover: appearanceForm.primaryHover });
      toast.success('Appearance settings saved');
    } catch {
      toast.error('Failed to save appearance settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotifications.mutateAsync({ ...notificationsForm });
      toast.success('Notification settings saved');
    } catch {
      toast.error('Failed to save notification settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateSecurity.mutateAsync({
        passwordMinLength: securityForm.passwordMinLength,
        passwordExpiryDays: securityForm.passwordExpiryDays,
        passwordRequireUppercase: securityForm.requireUpper,
        passwordRequireLowercase: securityForm.requireLower,
        passwordRequireNumbers: securityForm.requireNumbers,
        passwordRequireSpecialChars: securityForm.requireSpecial,
        sessionDuration: securityForm.sessionDuration,
        idleTimeout: securityForm.idleTimeout,
        maxConcurrentSessions: securityForm.maxConcurrentSessions,
        mfaRequired: securityForm.mfa === 'required',
      });
      toast.success('Security settings saved');
    } catch {
      toast.error('Failed to save security settings');
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      await updateIntegrations.mutateAsync({ ...integrationsForm });
      toast.success('Integration settings saved');
    } catch {
      toast.error('Failed to save integration settings');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await updatePrivacy.mutateAsync({
        dataRetentionDays: privacyForm.dataRetentionDays,
        autoDeleteInactive: privacyForm.autoDeleteInactive === 'enabled',
        exportEnabled: privacyForm.exportEnabled,
        anonymizeData: privacyForm.anonymizeData,
        gdprCompliant: privacyForm.gdprCompliant,
      });
      toast.success('Data privacy settings saved');
    } catch {
      toast.error('Failed to save data privacy settings');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Settings"
        description="Central configuration for your business operations, security, and integrations."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Settings' },
        ]}
        actions={
          <Button variant="outline" onClick={() => setShowResetDialog(true)}>
            Reset All
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="general"><Settings className="h-3.5 w-3.5 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="h-3.5 w-3.5 mr-1.5" />Appearance</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-3.5 w-3.5 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-3.5 w-3.5 mr-1.5" />Security</TabsTrigger>
          <TabsTrigger value="integrations"><Plug className="h-3.5 w-3.5 mr-1.5" />Integrations</TabsTrigger>
          <TabsTrigger value="privacy"><Database className="h-3.5 w-3.5 mr-1.5" />Data & Privacy</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input value={generalForm.businessName} onChange={(e) => setGeneralForm((p) => ({ ...p, businessName: e.target.value }))} placeholder="Your Company Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Legal Name</Label>
                  <Input value={generalForm.legalName} onChange={(e) => setGeneralForm((p) => ({ ...p, legalName: e.target.value }))} placeholder="Legal Entity Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input value={generalForm.industry} onChange={(e) => setGeneralForm((p) => ({ ...p, industry: e.target.value }))} placeholder="e.g., Technology" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select value={generalForm.currency} onValueChange={(v) => setGeneralForm((p) => ({ ...p, currency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select value={generalForm.timezone} onValueChange={(v) => setGeneralForm((p) => ({ ...p, timezone: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Locale</Label>
                  <Select value={generalForm.locale} onValueChange={(v) => setGeneralForm((p) => ({ ...p, locale: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} loading={updateSettings.isPending}><Save className="h-4 w-4 mr-1.5" />Save General Settings</Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Theme & Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <Select value={appearanceForm.theme} onValueChange={(v) => setAppearanceForm((p) => ({ ...p, theme: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System (auto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={appearanceForm.primaryColor} onChange={(e) => setAppearanceForm((p) => ({ ...p, primaryColor: e.target.value }))} className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                    <Input value={appearanceForm.primaryColor} onChange={(e) => setAppearanceForm((p) => ({ ...p, primaryColor: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Hover</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={appearanceForm.primaryHover} onChange={(e) => setAppearanceForm((p) => ({ ...p, primaryHover: e.target.value }))} className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                    <Input value={appearanceForm.primaryHover} onChange={(e) => setAppearanceForm((p) => ({ ...p, primaryHover: e.target.value }))} />
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground">Semantic colors (success, warning, danger, info) remain global for accessibility.</p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveAppearance} loading={updateBranding.isPending}><Save className="h-4 w-4 mr-1.5" />Save Appearance</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Configure which notifications your team receives.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {NOTIF_ITEMS.map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-[13px] font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={notificationsForm[item.key] ?? true} onChange={(e) => setNotificationsForm((p) => ({ ...p, [item.key]: e.target.checked }))} className="h-4 w-4 rounded border-input" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications} loading={updateNotifications.isPending}><Save className="h-4 w-4 mr-1.5" />Save Notifications</Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Password Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Minimum Length</Label>
                  <Input type="number" value={securityForm.passwordMinLength} onChange={(e) => setSecurityForm((p) => ({ ...p, passwordMinLength: parseInt(e.target.value, 10) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiry (days, 0 = never)</Label>
                  <Input type="number" value={securityForm.passwordExpiryDays} onChange={(e) => setSecurityForm((p) => ({ ...p, passwordExpiryDays: parseInt(e.target.value, 10) || 0 }))} />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'requireUpper', label: 'Require uppercase' },
                  { key: 'requireLower', label: 'Require lowercase' },
                  { key: 'requireNumbers', label: 'Require numbers' },
                  { key: 'requireSpecial', label: 'Require special characters' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input type="checkbox" checked={securityForm[item.key as keyof typeof securityForm] as boolean} onChange={(e) => setSecurityForm((p) => ({ ...p, [item.key]: e.target.checked }))} className="h-4 w-4 rounded border-input" />
                    <span className="text-[13px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Session Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Session Duration (hours)</Label>
                  <Input type="number" value={securityForm.sessionDuration} onChange={(e) => setSecurityForm((p) => ({ ...p, sessionDuration: parseInt(e.target.value, 10) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Idle Timeout (minutes)</Label>
                  <Input type="number" value={securityForm.idleTimeout} onChange={(e) => setSecurityForm((p) => ({ ...p, idleTimeout: parseInt(e.target.value, 10) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Concurrent Sessions</Label>
                  <Input type="number" value={securityForm.maxConcurrentSessions} onChange={(e) => setSecurityForm((p) => ({ ...p, maxConcurrentSessions: parseInt(e.target.value, 10) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Multi-Factor Authentication</Label>
                  <Select value={securityForm.mfa} onValueChange={(v) => setSecurityForm((p) => ({ ...p, mfa: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="optional">Optional</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveSecurity} loading={updateSecurity.isPending}><Save className="h-4 w-4 mr-1.5" />Save Security Settings</Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Connected Services</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Email Provider', key: 'emailProvider', providers: ['SMTP', 'SendGrid', 'Amazon SES'] },
                { name: 'Payment Provider', key: 'paymentProvider', providers: ['Stripe', 'PayPal', 'Razorpay'] },
                { name: 'Shipping Provider', key: 'shippingProvider', providers: ['Shippo', 'EasyPost', 'ShipStation'] },
              ].map(service => {
                const current = integrationsForm[service.key as keyof typeof integrationsForm];
                return (
                  <div key={service.key} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{service.name}</p>
                      <p className="text-[11px] text-muted-foreground">{current || 'Not configured'}</p>
                      <div className="mt-2 w-48">
                        <Select value={current || undefined} onValueChange={(v) => setIntegrationsForm((p) => ({ ...p, [service.key]: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                          <SelectContent>
                            {service.providers.map((prov) => (
                              <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Badge variant={current ? 'success' : 'secondary'}>
                      {current ? <><CheckCircle className="h-3 w-3 mr-1" />Connected</> : <><XCircle className="h-3 w-3 mr-1" />Not Configured</>}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations} loading={updateIntegrations.isPending}><Save className="h-4 w-4 mr-1.5" />Save Integration Settings</Button>
          </div>
        </TabsContent>

        {/* Data & Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Data Retention (days)</Label>
                  <Input type="number" value={privacyForm.dataRetentionDays} onChange={(e) => setPrivacyForm((p) => ({ ...p, dataRetentionDays: parseInt(e.target.value, 10) || 0 }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Auto-delete Inactive Data</Label>
                  <Select value={privacyForm.autoDeleteInactive} onValueChange={(v) => setPrivacyForm((p) => ({ ...p, autoDeleteInactive: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={privacyForm.exportEnabled} onChange={(e) => setPrivacyForm((p) => ({ ...p, exportEnabled: e.target.checked }))} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">Enable data export</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={privacyForm.anonymizeData} onChange={(e) => setPrivacyForm((p) => ({ ...p, anonymizeData: e.target.checked }))} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">Anonymize data on export</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={privacyForm.gdprCompliant} onChange={(e) => setPrivacyForm((p) => ({ ...p, gdprCompliant: e.target.checked }))} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">GDPR Compliant mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSavePrivacy} loading={updatePrivacy.isPending}><Save className="h-4 w-4 mr-1.5" />Save Privacy Settings</Button>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset all settings?"
        description="This will restore all settings to their default values. This action cannot be undone."
        confirmLabel="Reset All"
        variant="danger"
        onConfirm={() => { toast.success('Settings reset to defaults'); setShowResetDialog(false); }}
      />
    </div>
  );
}
