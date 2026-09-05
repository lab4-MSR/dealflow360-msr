import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  GeneralSettings,
  AppearanceSettings,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings,
  PrivacySettings,
  type GeneralSettingsValues,
} from '@/components/settings'
import { ChangePasswordDialog } from '@/components/profile'
import { useTheme } from '@/providers/ThemeProvider'
import { sharedApi } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import type { DensityPreference, NotificationChannelPreferences, UserPreferences } from '@/types/shared'

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'security' | 'integrations' | 'privacy'

const TABS: Array<{ value: SettingsTab; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'privacy', label: 'Data & Privacy' },
]

const GENERAL_DEFAULTS: GeneralSettingsValues = {
  application_name: '',
  support_email: '',
  language: 'en',
  timezone: 'UTC',
  currency: 'USD',
  date_format: 'MM/dd/yyyy',
  time_format: '12h',
}

const DEFAULT_CHANNELS: NotificationChannelPreferences = {
  email: true,
  in_app: true,
  approval: true,
  deal: true,
  billing: true,
}

export function SettingsPage() {
  const queryClient = useQueryClient()
  const { theme, setTheme } = useTheme()

  const [tab, setTab] = React.useState<SettingsTab>('general')
  const [general, setGeneral] = React.useState<GeneralSettingsValues>(GENERAL_DEFAULTS)
  const [density, setDensity] = React.useState<DensityPreference>('comfortable')
  const [channels, setChannels] = React.useState<NotificationChannelPreferences>(DEFAULT_CHANNELS)
  const [loaded, setLoaded] = React.useState(false)
  const [passwordOpen, setPasswordOpen] = React.useState(false)
  const baseline = React.useRef<GeneralSettingsValues>(GENERAL_DEFAULTS)

  const orgQuery = useQuery({ queryKey: ['org-settings'], queryFn: () => sharedApi.orgSettings() })
  const prefsQuery = useQuery({ queryKey: ['me-preferences'], queryFn: () => sharedApi.preferences() })
  const sessionsQuery = useQuery({ queryKey: ['me-sessions'], queryFn: () => sharedApi.sessions() })

  React.useEffect(() => {
    if (loaded || !orgQuery.data || !prefsQuery.data) return
    const org = orgQuery.data
    const localization = org.localization ?? {}
    const generalSection = org.general ?? {}
    const next: GeneralSettingsValues = {
      application_name: generalSection.application_name ?? '',
      support_email: generalSection.support_email ?? '',
      language: localization.language ?? generalSection.default_language ?? 'en',
      timezone: localization.timezone ?? generalSection.default_timezone ?? 'UTC',
      currency: localization.currency ?? 'USD',
      date_format: localization.date_format ?? generalSection.date_format ?? 'MM/dd/yyyy',
      time_format: '12h',
    }
    setGeneral(next)
    baseline.current = next
    setDensity(prefsQuery.data.density ?? 'comfortable')
    setChannels({ ...DEFAULT_CHANNELS, ...prefsQuery.data.notifications })
    setLoaded(true)
  }, [loaded, orgQuery.data, prefsQuery.data])
const save = useMutation({
    mutationFn: (values: GeneralSettingsValues) =>
      Promise.all([
        sharedApi.updateOrgSettings({
          general: {
            application_name: values.application_name,
            support_email: values.support_email,
            default_language: values.language,
            default_timezone: values.timezone,
            date_format: values.date_format,
          },
          localization: {
            language: values.language,
            timezone: values.timezone,
            currency: values.currency,
            date_format: values.date_format,
          },
        }),
        sharedApi.updatePreferences({ theme, density, notifications: channels } satisfies Partial<UserPreferences>),
      ]),
    onSuccess: () => {
      baseline.current = general
      void queryClient.invalidateQueries({ queryKey: ['org-settings'] })
      void queryClient.invalidateQueries({ queryKey: ['me-preferences'] })
      toast.success('Settings saved')
    },
    onError: (err) => toast.error('Unable to save settings', { description: getErrorMessage(err) }),
  })

  const changePassword = useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      sharedApi.changePassword({ current_password: current, new_password: next }),
    onSuccess: () => toast.success('Password changed'),
    onError: (err) => toast.error('Unable to change password', { description: getErrorMessage(err) }),
  })

  const revokeSession = useMutation({
    mutationFn: (id: string) => sharedApi.revokeSession(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['me-sessions'], (prev: unknown) =>
        (prev as Array<{ id: string }>).filter((s) => s.id !== id)
      )
      toast.success('Session revoked')
    },
    onError: (err) => toast.error('Unable to revoke session', { description: getErrorMessage(err) }),
  })

  const isDirty = !loaded || JSON.stringify(general) !== JSON.stringify(baseline.current)

  const handleReset = () => {
    setGeneral(baseline.current)
    if (prefsQuery.data) {
      setDensity(prefsQuery.data.density ?? 'comfortable')
      setChannels({ ...DEFAULT_CHANNELS, ...prefsQuery.data.notifications })
    }
  }

  if (orgQuery.isLoading && !loaded) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-foreground">Settings</h1>
        <p className="text-body text-muted-foreground mt-1">
          Workspace configuration that your role is authorized to manage.
        </p>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface-muted p-1">
        {TABS.map((t) => {
          const active = tab === t.value
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              aria-selected={active}
              role="tab"
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-label font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel">
        {tab === 'general' && <GeneralSettings values={general} onChange={setGeneral} />}
        {tab === 'appearance' && (
          <AppearanceSettings theme={theme} density={density} onThemeChange={setTheme} onDensityChange={setDensity} />
        )}
        {tab === 'notifications' && <NotificationSettings channels={channels} onChange={setChannels} />}
        {tab === 'security' && (
          <SecuritySettings
            sessions={sessionsQuery.data ?? []}
            sessionsLoading={sessionsQuery.isLoading}
            onChangePassword={() => setPasswordOpen(true)}
            onRevokeSession={(id) => revokeSession.mutateAsync(id).then(() => undefined)}
          />
        )}
        {tab === 'integrations' && <IntegrationSettings />}
        {tab === 'privacy' && <PrivacySettings />}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <Button onClick={() => save.mutateAsync(general)} loading={save.isPending}>
          Save
        </Button>
        <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
          Reset
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            handleReset()
            setTab('general')
          }}
        >
          Cancel
        </Button>
        {save.isError && (
          <span className="text-body-small text-danger" role="alert">
            Save failed — your changes are still shown and can be retried.
          </span>
        )}
      </div>

      <ChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSubmit={async (current, next) => {
          await changePassword.mutateAsync({ current, next })
          setPasswordOpen(false)
        }}
      />
    </div>
  )
}