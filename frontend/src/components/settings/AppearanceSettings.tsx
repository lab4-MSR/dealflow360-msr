import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Palette } from 'lucide-react'
import type { ThemePreference, DensityPreference } from '@/types/shared'
import { THEME_OPTIONS, DENSITY_OPTIONS } from '@/constants/shared'

interface AppearanceSettingsProps {
  theme: ThemePreference
  density: DensityPreference
  onThemeChange: (theme: ThemePreference) => void
  onDensityChange: (density: DensityPreference) => void
}

export function AppearanceSettings({
  theme,
  density,
  onThemeChange,
  onDensityChange,
}: AppearanceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" aria-hidden />
          Appearance
        </CardTitle>
        <CardDescription>Theme and density for your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body font-medium text-foreground">Theme</p>
            <p className="text-caption text-muted-foreground">Shared appearance source — synced with Preferences.</p>
          </div>
          <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg bg-surface-muted p-1">
            {THEME_OPTIONS.map((o) => {
              const active = theme === o.value
              return (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onThemeChange(o.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-label font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body font-medium text-foreground">Density</p>
            <p className="text-caption text-muted-foreground">Controls spacing across the application.</p>
          </div>
          <div role="radiogroup" aria-label="Density" className="inline-flex rounded-lg bg-surface-muted p-1">
            {DENSITY_OPTIONS.map((o) => {
              const active = density === o.value
              return (
                <button
                  key={o.value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onDensityChange(o.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-label font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}