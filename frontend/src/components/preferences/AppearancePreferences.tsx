import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Palette, Monitor, Accessibility } from 'lucide-react'
import type { ThemePreference, DensityPreference } from '@/types/shared'
import { THEME_OPTIONS, DENSITY_OPTIONS } from '@/constants/shared'

interface DisplaySettings {
  reduceMotion: boolean
}

export type { DisplaySettings }

interface AppearancePreferencesProps {
  theme: ThemePreference
  density: DensityPreference
  display: DisplaySettings
  onThemeChange: (theme: ThemePreference) => void
  onDensityChange: (density: DensityPreference) => void
  onDisplayChange: (display: DisplaySettings) => void
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-surface-muted p-1">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-label font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function AppearancePreferences({
  theme,
  density,
  display,
  onThemeChange,
  onDensityChange,
  onDisplayChange,
}: AppearancePreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden />
          Appearance
        </CardTitle>
        <CardDescription>Personalize how DealFlow360 looks and feels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
              <Palette className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">Theme</p>
              <p className="text-caption text-muted-foreground">Choose light, dark or follow your system.</p>
            </div>
          </div>
          <Segmented label="Theme" options={THEME_OPTIONS} value={theme} onChange={onThemeChange} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
              <Monitor className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">Density</p>
              <p className="text-caption text-muted-foreground">Control spacing and information density.</p>
            </div>
          </div>
          <Segmented label="Density" options={DENSITY_OPTIONS} value={density} onChange={onDensityChange} />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
              <Accessibility className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-body font-medium text-foreground">Reduce motion</p>
              <p className="text-caption text-muted-foreground">Minimize decorative transitions.</p>
            </div>
          </div>
          <Switch
            checked={display.reduceMotion}
            onCheckedChange={(checked) => onDisplayChange({ ...display, reduceMotion: checked })}
            aria-label="Reduce motion"
          />
        </div>
      </CardContent>
    </Card>
  )
}