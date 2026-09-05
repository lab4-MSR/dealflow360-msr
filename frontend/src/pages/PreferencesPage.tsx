import * as React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AppearancePreferences, LocalizationPreferences, NotificationPreferences, type DisplaySettings } from '@/components/preferences'
import { ErrorState } from '@/components/shared'
import { sharedApi } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import { useTheme } from '@/providers/ThemeProvider'
import type { UserPreferences, DensityPreference } from '@/types/shared'

const DEFAULT_PREFS: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  language: 'en',
  timezone: 'UTC',
  currency: 'INR',
  date_format: 'MM/dd/yyyy',
  notifications: { email: true, in_app: true, approval: true, deal: true, billing: true },
}

export function PreferencesPage() {
  const { theme, setTheme } = useTheme()
  const [prefs, setPrefs] = React.useState<UserPreferences>(DEFAULT_PREFS)
  const [display, setDisplay] = React.useState<DisplaySettings>({ reduceMotion: false })
  const [loaded, setLoaded] = React.useState(false)

  const query = useQuery({
    queryKey: ['me-preferences'],
    queryFn: () => sharedApi.preferences(),
  })

  React.useEffect(() => {
    if (query.data && !loaded) {
      setPrefs(query.data)
      setDisplay((prev) => ({ ...prev, reduceMotion: prev.reduceMotion ?? false }))
      setLoaded(true)
    }
  }, [query.data, loaded])

  React.useEffect(() => {
    const root = document.documentElement
    if (display.reduceMotion) root.classList.add('reduce-motion')
    else root.classList.remove('reduce-motion')
    return () => root.classList.remove('reduce-motion')
  }, [display.reduceMotion])

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<UserPreferences>) => sharedApi.updatePreferences(payload),
    onSuccess: (updated) => {
      setPrefs(updated)
      setLoaded(true)
      toast.success('Preferences saved')
    },
    onError: (err) => toast.error('Unable to save preferences', { description: getErrorMessage(err) }),
  })

  const setDensity = (density: DensityPreference) => setPrefs((prev) => ({ ...prev, density }))

  const handleSave = () => {
    saveMutation.mutateAsync({
      theme,
      density: prefs.density,
      language: prefs.language,
      timezone: prefs.timezone,
      currency: prefs.currency,
      date_format: prefs.date_format,
      notifications: prefs.notifications,
    })
  }

  if (query.isLoading && !loaded) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-56 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    )
  }

  if (query.error && !loaded) {
    return (
      <ErrorState
        title="Unable to load preferences"
        description={getErrorMessage(query.error)}
        onRetry={() => query.refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Preferences</h1>
        <p className="text-body text-muted-foreground mt-1">
          Your personal customization — how DealFlow360 looks and communicates with you.
        </p>
      </div>

      <AppearancePreferences
        theme={theme}
        density={prefs.density}
        display={display}
        onThemeChange={setTheme}
        onDensityChange={setDensity}
        onDisplayChange={setDisplay}
      />

      <LocalizationPreferences
        language={prefs.language}
        timezone={prefs.timezone}
        currency={prefs.currency}
        dateFormat={prefs.date_format}
        onLanguageChange={(v) => setPrefs((p) => ({ ...p, language: v }))}
        onTimezoneChange={(v) => setPrefs((p) => ({ ...p, timezone: v }))}
        onCurrencyChange={(v) => setPrefs((p) => ({ ...p, currency: v }))}
        onDateFormatChange={(v) => setPrefs((p) => ({ ...p, date_format: v }))}
      />

      <NotificationPreferences
        channels={prefs.notifications}
        onChange={(channels) => setPrefs((p) => ({ ...p, notifications: channels }))}
      />

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} loading={saveMutation.isPending}>
          Save Preferences
        </Button>
        {saveMutation.isError && (
          <span className="text-body-small text-danger" role="alert">
            Save failed — your changes are still shown and can be retried.
          </span>
        )}
      </div>
    </div>
  )
}