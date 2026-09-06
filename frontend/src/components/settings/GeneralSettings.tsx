import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Globe, Settings2 } from 'lucide-react'
import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '@/constants/shared'

export interface GeneralSettingsValues {
  application_name: string
  support_email: string
  language: string
  timezone: string
  currency: string
  date_format: string
  time_format: string
}

interface GeneralSettingsProps {
  values: GeneralSettingsValues
  onChange: (values: GeneralSettingsValues) => void
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

export function GeneralSettings({ values, onChange }: GeneralSettingsProps) {
  const set = (patch: Partial<GeneralSettingsValues>) => onChange({ ...values, ...patch })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" aria-hidden />
            Application Settings
          </CardTitle>
          <CardDescription>General application configuration for your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field id="app-name" label="Application Name">
            <Input
              id="app-name"
              value={values.application_name}
              onChange={(e) => set({ application_name: e.target.value })}
            />
          </Field>
          <Field id="support-email" label="Support Email">
            <Input
              id="support-email"
              type="email"
              value={values.support_email}
              onChange={(e) => set({ support_email: e.target.value })}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" aria-hidden />
            Localization
          </CardTitle>
          <CardDescription>Default regional configuration for the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field id="org-lang" label="Language">
            <Select value={values.language} onValueChange={(v) => set({ language: v })}>
              <SelectTrigger id="org-lang" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="org-currency" label="Currency">
            <div className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-small font-medium text-foreground">
              <span>INR — Indian Rupee (₹)</span>
              <span className="text-[11px] font-semibold text-primary">Standard</span>
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            Date &amp; Time
          </CardTitle>
          <CardDescription>How dates and times are displayed across the workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <Field id="org-tz" label="Timezone">
            <Select value={values.timezone} onValueChange={(v) => set({ timezone: v })}>
              <SelectTrigger id="org-tz" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="org-datefmt" label="Date Format">
            <Select value={values.date_format} onValueChange={(v) => set({ date_format: v })}>
              <SelectTrigger id="org-datefmt" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="org-timefmt" label="Time Format">
            <Select value={values.time_format} onValueChange={(v) => set({ time_format: v })}>
              <SelectTrigger id="org-timefmt" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>
    </div>
  )
}