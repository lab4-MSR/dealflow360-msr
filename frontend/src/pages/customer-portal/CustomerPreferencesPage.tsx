import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SlidersHorizontal, Bell, Globe, Sun, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCustomerPreferences, updateCustomerPreferences, type CustomerPreferencesData } from '@/lib/customer-portal-api'

export function CustomerPreferencesPage() {
  const queryClient = useQueryClient()

  const [prefs, setPrefs] = useState<CustomerPreferencesData | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer-preferences'],
    queryFn: getCustomerPreferences,
  })

  useEffect(() => {
    if (data) {
      setPrefs(data)
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (updated: CustomerPreferencesData) => updateCustomerPreferences(updated),
    onSuccess: (savedData) => {
      setSuccessMsg('Preferences saved successfully.')
      setErrorMsg(null)
      queryClient.setQueryData(['customer-preferences'], savedData)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Failed to save preferences.')
      setSuccessMsg(null)
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prefs) return
    setSuccessMsg(null)
    setErrorMsg(null)
    updateMutation.mutate(prefs)
  }

  if (isLoading || !prefs) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Failed to Load Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to load user preferences'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customer Preferences</h1>
        <p className="text-sm text-muted-foreground">Configure communication notifications, regional formats, and UI theme options</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setErrorMsg(null)} className="h-7 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Communication Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Communication & Notifications
            </CardTitle>
            <CardDescription>Select which email alert types you wish to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label htmlFor="email_notifications" className="font-semibold text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Master toggle for all email communications</p>
              </div>
              <Switch
                id="email_notifications"
                checked={prefs.notifications.email_notifications}
                onCheckedChange={(checked) =>
                  setPrefs({
                    ...prefs,
                    notifications: { ...prefs.notifications, email_notifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label htmlFor="quote_notifications" className="font-semibold text-foreground">Quote Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates on quote approvals, revisions, and counter-offers</p>
              </div>
              <Switch
                id="quote_notifications"
                checked={prefs.notifications.quote_notifications}
                onCheckedChange={(checked) =>
                  setPrefs({
                    ...prefs,
                    notifications: { ...prefs.notifications, quote_notifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label htmlFor="order_notifications" className="font-semibold text-foreground">Order Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive status changes on your purchase orders</p>
              </div>
              <Switch
                id="order_notifications"
                checked={prefs.notifications.order_notifications}
                onCheckedChange={(checked) =>
                  setPrefs({
                    ...prefs,
                    notifications: { ...prefs.notifications, order_notifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <Label htmlFor="shipment_notifications" className="font-semibold text-foreground">Shipment Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive dispatch, tracking, and delivery updates</p>
              </div>
              <Switch
                id="shipment_notifications"
                checked={prefs.notifications.shipment_notifications}
                onCheckedChange={(checked) =>
                  setPrefs({
                    ...prefs,
                    notifications: { ...prefs.notifications, shipment_notifications: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="billing_notifications" className="font-semibold text-foreground">Billing Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive new invoices, payment reminders, and receipts</p>
              </div>
              <Switch
                id="billing_notifications"
                checked={prefs.notifications.billing_notifications}
                onCheckedChange={(checked) =>
                  setPrefs({
                    ...prefs,
                    notifications: { ...prefs.notifications, billing_notifications: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Localization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Regional & Localization
            </CardTitle>
            <CardDescription>Configure language, timezone, currency, and date formatting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={prefs.localization.language}
                  onValueChange={(val) =>
                    setPrefs({
                      ...prefs,
                      localization: { ...prefs.localization, language: val },
                    })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English (US)">English (US)</SelectItem>
                    <SelectItem value="English (UK)">English (UK)</SelectItem>
                    <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                    <SelectItem value="German">German (Deutsch)</SelectItem>
                    <SelectItem value="French">French (Français)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={prefs.localization.timezone}
                  onValueChange={(val) =>
                    setPrefs({
                      ...prefs,
                      localization: { ...prefs.localization, timezone: val },
                    })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC (GMT+0)">UTC (GMT+0)</SelectItem>
                    <SelectItem value="America/New_York (EST)">America/New_York (EST / GMT-5)</SelectItem>
                    <SelectItem value="America/Los_Angeles (PST)">America/Los_Angeles (PST / GMT-8)</SelectItem>
                    <SelectItem value="Europe/London (BST)">Europe/London (BST / GMT+1)</SelectItem>
                    <SelectItem value="Asia/Tokyo (JST)">Asia/Tokyo (JST / GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currency">Display Currency</Label>
                <div className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                  <span>INR (₹) — Indian Rupee</span>
                  <span className="text-xs font-semibold text-primary">Standard</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date_format">Date Format</Label>
                <Select
                  value={prefs.localization.date_format}
                  onValueChange={(val) =>
                    setPrefs({
                      ...prefs,
                      localization: { ...prefs.localization, date_format: val },
                    })
                  }
                >
                  <SelectTrigger id="date_format">
                    <SelectValue placeholder="Select Date Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-09-05)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (09/05/2026)</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (05/09/2026)</SelectItem>
                    <SelectItem value="MMM DD, YYYY">MMM DD, YYYY (Sep 05, 2026)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" /> Appearance & Display
            </CardTitle>
            <CardDescription>Personalize application color theme and interface density</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="theme">Portal Theme</Label>
                <Select
                  value={prefs.appearance.theme}
                  onValueChange={(val: 'system' | 'light' | 'dark') =>
                    setPrefs({
                      ...prefs,
                      appearance: { ...prefs.appearance, theme: val },
                    })
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Preference</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="display_preferences">Display Density</Label>
                <Select
                  value={prefs.appearance.display_preferences}
                  onValueChange={(val) =>
                    setPrefs({
                      ...prefs,
                      appearance: { ...prefs.appearance, display_preferences: val },
                    })
                  }
                >
                  <SelectTrigger id="display_preferences">
                    <SelectValue placeholder="Select Display Preferences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable (Standard Padding)</SelectItem>
                    <SelectItem value="compact">Compact (Dense Data View)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Preferences Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving Preferences...' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  )
}
