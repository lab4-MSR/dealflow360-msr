import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared'
import { PageHeader } from '../components/BusinessAdminPageHeader'
import { useBusinessSettings, useUpdateBusinessSettings } from '../hooks/use-business-admin'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { BusinessSettings } from '../types'
import { toast } from 'sonner'
import { Save, RotateCcw, Settings } from 'lucide-react'

export function BusinessSettingsPage() {
  const { data: settings, isLoading, error, refetch } = useBusinessSettings()
  const updateSettings = useUpdateBusinessSettings()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<BusinessSettings>>({})
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const updateSection = <K extends keyof BusinessSettings>(section: K, field: keyof BusinessSettings[K], value: unknown) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section] as unknown as Record<string, unknown>,
        [field]: value,
      } as unknown as BusinessSettings[K],
    }))
  }

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(form)
      toast.success('Business settings saved')
      setIsEditing(false)
    } catch {
      toast.error('Failed to save business settings')
    }
  }

  const handleReset = async () => {
    try {
      await updateSettings.mutateAsync({
        general: settings?.general,
        sales: { quoteValidityDays: 30, defaultPaymentTerms: 'Net 30', defaultPriceList: 'Standard', salesConfiguration: {} },
        discount: { discountCalculation: 'line_item', maximumDiscountBehavior: 'require_approval', discountApproval: true },
        approval: { approvalRequired: true, approvalSequence: [], approvalNotifications: true },
        fulfillment: { defaultWarehouse: '', allocationStrategy: 'nearest', backorderBehavior: 'auto_backorder' },
        billing: { invoicePrefix: 'INV', invoiceNextNumber: 1001, paymentTerms: 'Net 30', subscriptionBilling: 'monthly' },
      })
      toast.success('Settings reset to defaults')
      setShowResetDialog(false)
      setIsEditing(false)
    } catch {
      toast.error('Failed to reset settings')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Failed to load business settings" onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Settings"
        description="Central configuration for your business operations."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Business Settings' },
        ]}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" onClick={() => { if (settings) setForm(settings); setIsEditing(false) }} disabled={updateSettings.isPending}>Cancel</Button>
              <Button onClick={handleSave} loading={updateSettings.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowResetDialog(true)}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reset Defaults
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Settings className="h-4 w-4 mr-1.5" />
                Edit Settings
              </Button>
            </>
          )
        }
      />

      {/* General Settings */}
      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Business Name</Label>
              <Input value={form.general?.businessName || ''} onChange={(e) => updateSection('general', 'businessName', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Default Currency</Label>
              <Select value={form.general?.defaultCurrency || 'INR'} onValueChange={(v) => updateSection('general', 'defaultCurrency', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Timezone</Label>
              <Select value={form.general?.defaultTimezone || 'Asia/Kolkata'} onValueChange={(v) => updateSection('general', 'defaultTimezone', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Language</Label>
              <Select value={form.general?.defaultLanguage || 'en'} onValueChange={(v) => updateSection('general', 'defaultLanguage', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Settings */}
      <Card>
        <CardHeader><CardTitle>Sales Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quote Validity (days)</Label>
              <Input type="number" value={form.sales?.quoteValidityDays ?? 30} onChange={(e) => updateSection('sales', 'quoteValidityDays', parseInt(e.target.value) || 30)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Default Payment Terms</Label>
              <Select value={form.sales?.defaultPaymentTerms || 'Net 30'} onValueChange={(v) => updateSection('sales', 'defaultPaymentTerms', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                  <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Default Price List</Label>
              <Select value={form.sales?.defaultPriceList || 'Standard'} onValueChange={(v) => updateSection('sales', 'defaultPriceList', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Settings */}
      <Card>
        <CardHeader><CardTitle>Discount Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Discount Calculation</Label>
              <Select value={form.discount?.discountCalculation || 'line_item'} onValueChange={(v) => updateSection('discount', 'discountCalculation', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="line_item">Line Item Level</SelectItem>
                  <SelectItem value="order_level">Order Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Maximum Discount Behavior</Label>
              <Select value={form.discount?.maximumDiscountBehavior || 'require_approval'} onValueChange={(v) => updateSection('discount', 'maximumDiscountBehavior', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="require_approval">Require Approval</SelectItem>
                  <SelectItem value="block">Block Exceeding Discount</SelectItem>
                  <SelectItem value="warn">Warn but Allow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discount Approval Required</Label>
              <Select value={form.discount?.discountApproval ? 'true' : 'false'} onValueChange={(v) => updateSection('discount', 'discountApproval', v === 'true')} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Settings */}
      <Card>
        <CardHeader><CardTitle>Approval Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Approval Required</Label>
              <Select value={form.approval?.approvalRequired ? 'true' : 'false'} onValueChange={(v) => updateSection('approval', 'approvalRequired', v === 'true')} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Approval Notifications</Label>
              <Select value={form.approval?.approvalNotifications ? 'true' : 'false'} onValueChange={(v) => updateSection('approval', 'approvalNotifications', v === 'true')} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Enabled</SelectItem>
                  <SelectItem value="false">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.approval?.approvalSequence && form.approval.approvalSequence.length > 0 && (
            <div className="mt-4">
              <Label className="mb-2 block">Approval Sequence</Label>
              <div className="flex items-center gap-2">
                {form.approval.approvalSequence.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-2">
                    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-[13px] font-medium text-foreground">
                      {step.role}
                    </div>
                    {i < form.approval!.approvalSequence!.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fulfillment Settings */}
      <Card>
        <CardHeader><CardTitle>Fulfillment Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Allocation Strategy</Label>
              <Select value={form.fulfillment?.allocationStrategy || 'nearest'} onValueChange={(v) => updateSection('fulfillment', 'allocationStrategy', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nearest">Nearest Warehouse</SelectItem>
                  <SelectItem value="lowest_cost">Lowest Cost</SelectItem>
                  <SelectItem value="balanced">Balanced Load</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Backorder Behavior</Label>
              <Select value={form.fulfillment?.backorderBehavior || 'auto_backorder'} onValueChange={(v) => updateSection('fulfillment', 'backorderBehavior', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto_backorder">Auto Backorder</SelectItem>
                  <SelectItem value="notify_customer">Notify Customer</SelectItem>
                  <SelectItem value="partial_shipment">Allow Partial Shipment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card>
        <CardHeader><CardTitle>Billing Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Invoice Prefix</Label>
              <Input value={form.billing?.invoicePrefix || ''} onChange={(e) => updateSection('billing', 'invoicePrefix', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Invoice Next Number</Label>
              <Input type="number" value={form.billing?.invoiceNextNumber ?? 1001} onChange={(e) => updateSection('billing', 'invoiceNextNumber', parseInt(e.target.value) || 1001)} disabled={!isEditing} />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Select value={form.billing?.paymentTerms || 'Net 30'} onValueChange={(v) => updateSection('billing', 'paymentTerms', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subscription Billing</Label>
              <Select value={form.billing?.subscriptionBilling || 'monthly'} onValueChange={(v) => updateSection('billing', 'subscriptionBilling', v)} disabled={!isEditing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset all settings?"
        description="This will restore all business settings to their default values. General settings (business name, currency, timezone) will be preserved."
        confirmLabel="Reset Settings"
        variant="warning"
        onConfirm={handleReset}
        loading={updateSettings.isPending}
      />
    </div>
  )
}
