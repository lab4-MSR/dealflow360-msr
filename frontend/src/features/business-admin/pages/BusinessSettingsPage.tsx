import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared';
import { PageHeader } from '../components/BusinessAdminPageHeader';
import { useBusinessSettings, useUpdateBusinessSettings } from '../hooks/use-business-admin';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { BusinessSettings } from '../types';
import { toast } from 'sonner';
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Building2,
  IndianRupee,
  Percent,
  CheckSquare,
  Truck,
  Receipt,
  Calendar,
  Sliders,
  ArrowRight,
} from 'lucide-react';

export function BusinessSettingsPage() {
  const { data: settings, isLoading, error, refetch } = useBusinessSettings();
  const updateSettings = useUpdateBusinessSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'sales' | 'discount' | 'approval' | 'fulfillment' | 'billing'>('all');

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const updateSection = <K extends keyof BusinessSettings>(
    section: K,
    field: keyof BusinessSettings[K],
    value: unknown
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as unknown as Record<string, unknown>),
        [field]: value,
      } as unknown as BusinessSettings[K],
    }));
  };

  const handleSave = async () => {
    const validity = (form.sales as unknown as { quoteValidityDays?: number } | undefined)?.quoteValidityDays
    if (validity !== undefined && (!(Number.isFinite(validity)) || validity <= 0)) {
      toast.error('Quote validity window must be greater than 0 days.')
      return
    }
    const prefix = ((form.billing as unknown as { invoicePrefix?: string } | undefined)?.invoicePrefix || '').trim()
    if (!prefix) {
      toast.error('Tax invoice prefix is required.')
      return
    }
    try {
      await updateSettings.mutateAsync(form);
      toast.success('System business configurations successfully saved');
      setIsEditing(false);
    } catch {
      toast.error('Failed to save business settings');
    }
  };

  const handleReset = async () => {
    try {
      await updateSettings.mutateAsync({
        general: {
          businessName: settings?.general?.businessName || 'Acme Corp',
          defaultCurrency: 'INR',
          defaultTimezone: 'Asia/Kolkata',
          defaultLanguage: 'en',
        },
        sales: {
          quoteValidityDays: 30,
          defaultPaymentTerms: 'Net 30',
          defaultPriceList: 'Standard',
          salesConfiguration: {},
        },
        discount: {
          discountCalculation: 'line_item',
          maximumDiscountBehavior: 'require_approval',
          discountApproval: true,
        },
        approval: {
          approvalRequired: true,
          approvalSequence: [
            { id: 'step-1', role: 'Sales Manager', order: 1 },
            { id: 'step-2', role: 'Finance', order: 2 },
          ],
          approvalNotifications: true,
        },
        fulfillment: {
          defaultWarehouse: 'Main Warehouse',
          allocationStrategy: 'nearest',
          backorderBehavior: 'auto_backorder',
        },
        billing: {
          invoicePrefix: 'INV',
          invoiceNextNumber: 1001,
          paymentTerms: 'Net 30',
          subscriptionBilling: 'monthly',
        },
      });
      toast.success('Settings restored to enterprise defaults');
      setShowResetDialog(false);
      setIsEditing(false);
    } catch {
      toast.error('Failed to reset settings');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load business settings" onRetry={refetch} />;
  }

  const showAll = activeTab === 'all';

  return (
    <div className="space-y-4">
      {/* Enterprise Page Header */}
      <PageHeader
        title="Business Settings & System Policies"
        description="Global operational policies governing Indian Rupee (INR) currency compliance, discounting thresholds, multi-tier approvals, and invoice generation."
        breadcrumbs={[
          { label: 'Business Admin', path: '/business-admin/dashboard' },
          { label: 'Organization' },
          { label: 'Business Settings' },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <IndianRupee className="h-3 w-3" />
            INR Sovereign Standard Active
          </span>
        }
        actions={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (settings) setForm(settings);
                  setIsEditing(false);
                }}
                disabled={updateSettings.isPending}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                loading={updateSettings.isPending}
                className="text-xs h-9 shadow-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                className="text-xs h-9 border-border/80"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Reset Defaults
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs h-9 shadow-xs"
              >
                <Sliders className="h-3.5 w-3.5 mr-1.5" />
                Edit Settings
              </Button>
            </div>
          )
        }
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border/70 pb-0">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Settings' },
            { id: 'general', label: 'General & Currency' },
            { id: 'sales', label: 'Sales & Quotes' },
            { id: 'discount', label: 'Discounts & Margins' },
            { id: 'approval', label: 'Approval Governance' },
            { id: 'fulfillment', label: 'Logistics & Depots' },
            { id: 'billing', label: 'Invoicing & Billing' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Policy KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Default Currency
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[22px] font-bold tracking-tight text-foreground">
                    INR (₹)
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                    Locked
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Single currency standard</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Quote Validity
                </p>
                <p className="text-[22px] font-bold tracking-tight mt-1 text-foreground tabular-nums">
                  {form.sales?.quoteValidityDays ?? 30} Days
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Default payment: {form.sales?.defaultPaymentTerms || 'Net 30'}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Discount Control
                </p>
                <p className="text-[22px] font-bold tracking-tight mt-1 text-foreground capitalize">
                  {form.discount?.maximumDiscountBehavior === 'require_approval' ? 'Approval Gate' : 'Strict Block'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Calculated at {form.discount?.discountCalculation === 'line_item' ? 'Line Item' : 'Order'} level</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Percent className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Approval Gates
                </p>
                <p className="text-[22px] font-bold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                  {form.approval?.approvalRequired ? 'Enforced' : 'Optional'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {form.approval?.approvalNotifications ? 'Real-time alerts on' : 'Alerts muted'}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Mode Alert Banner */}
      {isEditing && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5 text-primary text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span><strong>Editing Mode Active:</strong> Modify operational parameters across sections below and click "Save Changes" to publish.</span>
          </div>
          <Button size="sm" onClick={handleSave} loading={updateSettings.isPending} className="h-7 text-xs">
            Save Changes
          </Button>
        </div>
      )}

      {/* SECTION 1: General & Currency */}
      {(showAll || activeTab === 'general') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">General & Currency Standards</CardTitle>
                <CardDescription className="text-xs">
                  Legal entity naming, timezone alignment, and strict Indian Rupee monetary standard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Business Legal Name</Label>
                <Input
                  value={form.general?.businessName || ''}
                  onChange={(e) => updateSection('general', 'businessName', e.target.value)}
                  disabled={!isEditing}
                  className="text-xs h-9 bg-background/50 border-border/70"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">System Standard Currency</Label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Strict Standard (Non-changeable)
                  </span>
                </div>
                <Select value="INR" disabled>
                  <SelectTrigger className="text-xs h-9 bg-muted/40 border-border/70 cursor-not-allowed">
                    <SelectValue>INR (₹) - Indian Rupee</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR" className="text-xs">INR (₹) - Indian Rupee</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  The system is standardized strictly to Indian Rupee (₹). Foreign currency toggles are restricted by enterprise compliance.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Timezone</Label>
                <Select
                  value={form.general?.defaultTimezone || 'Asia/Kolkata'}
                  onValueChange={(v) => updateSection('general', 'defaultTimezone', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata" className="text-xs">Asia/Kolkata (IST, UTC+05:30)</SelectItem>
                    <SelectItem value="Asia/Dubai" className="text-xs">Asia/Dubai (GST, UTC+04:00)</SelectItem>
                    <SelectItem value="Asia/Singapore" className="text-xs">Asia/Singapore (SGT, UTC+08:00)</SelectItem>
                    <SelectItem value="Europe/London" className="text-xs">Europe/London (GMT/BST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">System Locale & Language</Label>
                <Select
                  value={form.general?.defaultLanguage || 'en'}
                  onValueChange={(v) => updateSection('general', 'defaultLanguage', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en" className="text-xs">English (India - en-IN)</SelectItem>
                    <SelectItem value="hi" className="text-xs">Hindi (हिन्दी)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: Sales Settings */}
      {(showAll || activeTab === 'sales') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Sales & Quotation Policies</CardTitle>
                <CardDescription className="text-xs">
                  Quote validity window, standard payment cycle terms, and default price book selection.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quote Validity Window (Days)</Label>
                <Input
                  type="number"
                  value={form.sales?.quoteValidityDays ?? 30}
                  onChange={(e) => updateSection('sales', 'quoteValidityDays', e.target.value === '' ? Number.NaN : parseInt(e.target.value, 10))}
                  disabled={!isEditing}
                  className="text-xs h-9 bg-background/50 border-border/70"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Commercial Payment Terms</Label>
                <Select
                  value={form.sales?.defaultPaymentTerms || 'Net 30'}
                  onValueChange={(v) => updateSection('sales', 'defaultPaymentTerms', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15" className="text-xs">Net 15 Days</SelectItem>
                    <SelectItem value="Net 30" className="text-xs">Net 30 Days</SelectItem>
                    <SelectItem value="Net 45" className="text-xs">Net 45 Days</SelectItem>
                    <SelectItem value="Net 60" className="text-xs">Net 60 Days</SelectItem>
                    <SelectItem value="Due on Receipt" className="text-xs">Due on Receipt (Advance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Price List Catalog</Label>
                <Select
                  value={form.sales?.defaultPriceList || 'Standard'}
                  onValueChange={(v) => updateSection('sales', 'defaultPriceList', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard" className="text-xs">Standard Commercial Book (INR)</SelectItem>
                    <SelectItem value="Premium" className="text-xs">Premium Enterprise Book (INR)</SelectItem>
                    <SelectItem value="Enterprise" className="text-xs">Strategic Tier 1 Book (INR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: Discount Settings */}
      {(showAll || activeTab === 'discount') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Percent className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Discount & Margin Safeguards</CardTitle>
                <CardDescription className="text-xs">
                  Discount computation formulas and ceiling violation behavior to preserve profit margins.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Discount Calculation Method</Label>
                <Select
                  value={form.discount?.discountCalculation || 'line_item'}
                  onValueChange={(v) => updateSection('discount', 'discountCalculation', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line_item" className="text-xs">Line Item Level Calculation</SelectItem>
                    <SelectItem value="order_level" className="text-xs">Order Total Level Calculation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Ceiling Violation Enforcement</Label>
                <Select
                  value={form.discount?.maximumDiscountBehavior || 'require_approval'}
                  onValueChange={(v) => updateSection('discount', 'maximumDiscountBehavior', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="require_approval" className="text-xs">Require Management Approval</SelectItem>
                    <SelectItem value="block" className="text-xs">Strictly Block Above Ceiling</SelectItem>
                    <SelectItem value="warn" className="text-xs">Warn User but Allow Submission</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Mandatory Discount Approval Gate</Label>
                <Select
                  value={form.discount?.discountApproval ? 'true' : 'false'}
                  onValueChange={(v) => updateSection('discount', 'discountApproval', v === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-xs">Mandatory (Active)</SelectItem>
                    <SelectItem value="false" className="text-xs">Disabled (Direct Order)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 4: Approval Settings */}
      {(showAll || activeTab === 'approval') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckSquare className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Approval Chains & Governance</CardTitle>
                <CardDescription className="text-xs">
                  Hierarchical sign-off requirements for high-value INR deals and discount overrides.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Multi-tier Approval Enforcement</Label>
                <Select
                  value={form.approval?.approvalRequired ? 'true' : 'false'}
                  onValueChange={(v) => updateSection('approval', 'approvalRequired', v === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-xs">Enforced for Threshold Breaches</SelectItem>
                    <SelectItem value="false" className="text-xs">Bypassed (Auto-approved)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Real-time Approval Notifications</Label>
                <Select
                  value={form.approval?.approvalNotifications ? 'true' : 'false'}
                  onValueChange={(v) => updateSection('approval', 'approvalNotifications', v === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true" className="text-xs">Enabled (Email & In-App Alerts)</SelectItem>
                    <SelectItem value="false" className="text-xs">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Approval Sequence */}
            <div className="pt-2">
              <Label className="text-xs font-medium text-foreground block mb-2">
                Active Governance Hierarchy Flow
              </Label>
              <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl border border-border/70 bg-muted/30">
                {(form.approval?.approvalSequence && form.approval.approvalSequence.length > 0
                  ? form.approval.approvalSequence
                  : [
                      { id: 'step-1', role: 'Sales Manager', order: 1 },
                      { id: 'step-2', role: 'Finance', order: 2 },
                    ]
                ).map((step, i, arr) => (
                  <div key={step.id || i} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground shadow-2xs">
                      <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{step.role}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 5: Fulfillment Settings */}
      {(showAll || activeTab === 'fulfillment') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Logistics & Depot Allocation</CardTitle>
                <CardDescription className="text-xs">
                  Automated routing rules across Indian warehouse hubs (BOM, DEL, BLR, HYD, MAA).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Depot Routing Strategy</Label>
                <Select
                  value={form.fulfillment?.allocationStrategy || 'nearest'}
                  onValueChange={(v) => updateSection('fulfillment', 'allocationStrategy', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest" className="text-xs">Nearest Depot Hub by Pincode</SelectItem>
                    <SelectItem value="lowest_cost" className="text-xs">Lowest Freight Transit Cost (INR)</SelectItem>
                    <SelectItem value="balanced" className="text-xs">Balanced Depot Utilization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Inventory Stockout / Backorder Policy</Label>
                <Select
                  value={form.fulfillment?.backorderBehavior || 'auto_backorder'}
                  onValueChange={(v) => updateSection('fulfillment', 'backorderBehavior', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto_backorder" className="text-xs">Automatic Backorder Creation</SelectItem>
                    <SelectItem value="notify_customer" className="text-xs">Hold for Customer Confirmation</SelectItem>
                    <SelectItem value="partial_shipment" className="text-xs">Permit Split Shipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 6: Billing & Invoicing */}
      {(showAll || activeTab === 'billing') && (
        <Card className="rounded-xl border border-border/70 bg-card shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Tax Invoicing & Subscription Billing</CardTitle>
                <CardDescription className="text-xs">
                  Tax invoice sequence formatting, payment maturity terms, and subscription renewal cycles.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tax Invoice Prefix</Label>
                <Input
                  value={form.billing?.invoicePrefix || 'INV-IN'}
                  onChange={(e) => updateSection('billing', 'invoicePrefix', e.target.value)}
                  disabled={!isEditing}
                  placeholder="e.g. INV-2026"
                  className="text-xs h-9 bg-background/50 border-border/70 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Next Invoice Number Counter</Label>
                <Input
                  type="number"
                  value={form.billing?.invoiceNextNumber ?? 1001}
                  onChange={(e) => updateSection('billing', 'invoiceNextNumber', parseInt(e.target.value) || 1001)}
                  disabled={!isEditing}
                  className="text-xs h-9 bg-background/50 border-border/70 tabular-nums font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Billing Maturity Terms</Label>
                <Select
                  value={form.billing?.paymentTerms || 'Net 30'}
                  onValueChange={(v) => updateSection('billing', 'paymentTerms', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 15" className="text-xs">Net 15 Days</SelectItem>
                    <SelectItem value="Net 30" className="text-xs">Net 30 Days</SelectItem>
                    <SelectItem value="Net 60" className="text-xs">Net 60 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Subscription Billing Frequency</Label>
                <Select
                  value={form.billing?.subscriptionBilling || 'monthly'}
                  onValueChange={(v) => updateSection('billing', 'subscriptionBilling', v)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-xs h-9 bg-background/50 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="text-xs">Monthly Invoicing</SelectItem>
                    <SelectItem value="quarterly" className="text-xs">Quarterly Invoicing</SelectItem>
                    <SelectItem value="annually" className="text-xs">Annual Invoicing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset all system settings to defaults?"
        description="This will restore all operational settings to factory defaults. Your registered company name, INR currency standard, and primary timezone will remain preserved."
        confirmLabel="Reset to Defaults"
        variant="warning"
        onConfirm={handleReset}
        loading={updateSettings.isPending}
      />
    </div>
  );
}

