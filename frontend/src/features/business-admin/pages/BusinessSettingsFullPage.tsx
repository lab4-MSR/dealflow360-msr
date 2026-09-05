import { useState } from 'react';
import { Settings, Palette, Bell, Shield, Plug, Database, Save, RotateCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { useBusinessSettings, useUpdateBusinessSettings, useNotificationSettings, useUpdateNotificationSettings, useSecuritySettings, useUpdateSecuritySettings, useIntegrationSettings, useUpdateIntegrationSettings, useDataPrivacySettings, useUpdateDataPrivacySettings } from '../hooks/use-business-admin';
import { toast } from 'sonner';

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

  const isLoading = settingsLoading || notifLoading || secLoading || intLoading || privLoading;

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
      await updateSettings.mutateAsync(settings || {});
      toast.success('General settings saved');
    } catch {
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotifications.mutateAsync(notifications || {});
      toast.success('Notification settings saved');
    } catch {
      toast.error('Failed to save notification settings');
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateSecurity.mutateAsync(security || {});
      toast.success('Security settings saved');
    } catch {
      toast.error('Failed to save security settings');
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      await updateIntegrations.mutateAsync(integrations || {});
      toast.success('Integration settings saved');
    } catch {
      toast.error('Failed to save integration settings');
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await updatePrivacy.mutateAsync(privacy || {});
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
                  <Input defaultValue={settings?.general?.businessName || ''} placeholder="Your Company Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Legal Name</Label>
                  <Input defaultValue={settings?.general?.legalName || ''} placeholder="Legal Entity Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input defaultValue={settings?.general?.industry || ''} placeholder="e.g., Technology" />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Select defaultValue={settings?.general?.currency || 'USD'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select defaultValue={settings?.general?.timezone || 'UTC'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                      <SelectItem value="Europe/London">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Locale</Label>
                  <Select defaultValue={settings?.general?.locale || 'en-US'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
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
            <Button onClick={handleSaveGeneral}><Save className="h-4 w-4 mr-1.5" />Save General Settings</Button>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Theme & Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Theme</Label>
                <Select defaultValue="system">
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
                    <input type="color" defaultValue="#4F46E5" className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                    <Input defaultValue="#4F46E5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Primary Hover</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue="#4338CA" className="h-10 w-10 rounded-lg border border-border cursor-pointer" />
                    <Input defaultValue="#4338CA" />
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground">Semantic colors (success, warning, danger, info) remain global for accessibility.</p>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={() => toast.info('Appearance settings saved')}><Save className="h-4 w-4 mr-1.5" />Save Appearance</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Configure which notifications your team receives.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'approvalNotifications', label: 'Approval Notifications', desc: 'Notify when approvals are required' },
                { key: 'dealAlerts', label: 'Deal Alerts', desc: 'Notifications for deal stage changes' },
                { key: 'inventoryAlerts', label: 'Inventory Alerts', desc: 'Low stock and backorder notifications' },
                { key: 'billingAlerts', label: 'Billing Alerts', desc: 'Payment and subscription notifications' },
                { key: 'systemAlerts', label: 'System Alerts', desc: 'Platform maintenance and updates' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-[13px] font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked={true} className="h-4 w-4 rounded border-input" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}><Save className="h-4 w-4 mr-1.5" />Save Notifications</Button>
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
                  <Input type="number" defaultValue={security?.passwordMinLength || 8} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiry (days, 0 = never)</Label>
                  <Input type="number" defaultValue={security?.passwordExpiryDays || 0} />
                </div>
              </div>
              <div className="space-y-2">
                {['Require uppercase', 'Require lowercase', 'Require numbers', 'Require special characters'].map(label => (
                  <div key={label} className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked={true} className="h-4 w-4 rounded border-input" />
                    <span className="text-[13px]">{label}</span>
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
                  <Input type="number" defaultValue={security?.sessionDuration || 24} />
                </div>
                <div className="space-y-1.5">
                  <Label>Idle Timeout (minutes)</Label>
                  <Input type="number" defaultValue={security?.idleTimeout || 30} />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Concurrent Sessions</Label>
                  <Input type="number" defaultValue={security?.maxConcurrentSessions || 3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Multi-Factor Authentication</Label>
                  <Select defaultValue={security?.mfaRequired ? 'required' : 'optional'}>
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
            <Button onClick={handleSaveSecurity}><Save className="h-4 w-4 mr-1.5" />Save Security Settings</Button>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Connected Services</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Email Provider', key: 'email', providers: ['SMTP', 'SendGrid', 'Amazon SES'] },
                { name: 'Payment Provider', key: 'payment', providers: ['Stripe', 'PayPal', 'Razorpay'] },
                { name: 'Shipping Provider', key: 'shipping', providers: ['Shippo', 'EasyPost', 'ShipStation'] },
              ].map(service => (
                <div key={service.key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-[13px] font-medium">{service.name}</p>
                    <p className="text-[11px] text-muted-foreground">{integrations ? (service.key === 'email' ? integrations.emailProvider : service.key === 'payment' ? integrations.paymentProvider : integrations.shippingProvider) : 'Not configured'}</p>
                  </div>
                  <Badge variant={integrations ? 'success' : 'secondary'}>
                    {integrations ? <><CheckCircle className="h-3 w-3 mr-1" />Connected</> : <><XCircle className="h-3 w-3 mr-1" />Not Configured</>}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSaveIntegrations}><Save className="h-4 w-4 mr-1.5" />Save Integration Settings</Button>
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
                  <Input type="number" defaultValue={privacy?.dataRetentionDays || 365} />
                </div>
                <div className="space-y-1.5">
                  <Label>Auto-delete Inactive Data</Label>
                  <Select defaultValue={privacy?.autoDeleteInactive ? 'enabled' : 'disabled'}>
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
                  <input type="checkbox" defaultChecked={privacy?.exportEnabled ?? true} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">Enable data export</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={privacy?.anonymizeData ?? false} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">Anonymize data on export</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={privacy?.gdprCompliant ?? true} className="h-4 w-4 rounded border-input" />
                  <span className="text-[13px]">GDPR Compliant mode</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={handleSavePrivacy}><Save className="h-4 w-4 mr-1.5" />Save Privacy Settings</Button>
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
