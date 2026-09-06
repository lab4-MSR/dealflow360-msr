import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import {
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '@/constants/shared'

interface LocalizationPreferencesProps {
  language: string
  timezone: string
  currency: string
  dateFormat: string

  onLanguageChange: (value: string) => void
  onTimezoneChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onDateFormatChange: (value: string) => void
}

function SelectField({
  id,
  label,
  value,
  options,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onValueChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function LocalizationPreferences({
  language,
  timezone,
  currency,
  dateFormat,
  onLanguageChange,
  onTimezoneChange,
  onCurrencyChange,
  onDateFormatChange,
}: LocalizationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" aria-hidden />
          Localization
        </CardTitle>
        <CardDescription>Regional settings used when presenting information.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <SelectField id="lang" label="Language" value={language} options={LANGUAGE_OPTIONS} onValueChange={onLanguageChange} />
        <div className="space-y-2">
          <Label htmlFor="currency">System Currency</Label>
          <div className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-small font-medium text-foreground">
            <span>INR — Indian Rupee (₹)</span>
            <span className="text-[11px] font-semibold text-primary">Fixed (INR)</span>
          </div>
        </div>
        <SelectField id="datefmt" label="Date Format" value={dateFormat} options={DATE_FORMAT_OPTIONS} onValueChange={onDateFormatChange} />
      </CardContent>
    </Card>
  )
}