import { api, type ApiResponse } from '@/lib/api'
import type {
  Notification,
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ActiveSession,
  LoginActivity,
  UserPreferences,
  HelpArticle,
  SupportTicket,
  CreateTicketPayload,
  OrgSettings,
  OrgLocalization,
  OrgGeneralSettings,
} from '@/types/shared'

function unwrap<T>(response: any, fallback: T): T {
  if (!response) return fallback
  const payload = response?.data !== undefined ? response.data : response
  if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
    return (payload as ApiResponse<T>).data ?? fallback
  }
  return (payload as unknown as T) ?? fallback
}

/** Sign the current session out via the existing auth endpoint. */
export async function signOut(): Promise<void> {
  try {
    await api.post<ApiResponse<null>>('/auth/logout')
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

/**
 * Typed access to the Shared Modules endpoints (DealFlow360_API_Contract.md §17,
 * §5 session). Every method delegates to the shared API client so auth headers,
 * base URL and error handling stay consistent with the rest of the app.
 */
export const sharedApi = {
  /* Notifications (10.3) */
  notifications: (): Promise<Notification[]> =>
    api.get<ApiResponse<Notification[]>>('/notifications').then((r) => unwrap(r, [])),
  markNotificationRead: (id: string): Promise<null> =>
    api.post<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => unwrap(r, null)),
  markAllNotificationsRead: (): Promise<null> =>
    api.post<ApiResponse<null>>('/notifications/mark-all-read').then((r) => unwrap(r, null)),

  /* Profile (10.4) */
  profile: (): Promise<UserProfile> =>
    api.get<ApiResponse<UserProfile>>('/me/profile').then((r) => unwrap<UserProfile>(r, {} as UserProfile)),
  updateProfile: (payload: UpdateProfilePayload): Promise<UserProfile> =>
    api.patch<ApiResponse<UserProfile>>('/me/profile', payload).then((r) => unwrap<UserProfile>(r, {} as UserProfile)),
  changePassword: (payload: ChangePasswordPayload): Promise<null> =>
    api.post<ApiResponse<null>>('/me/change-password', payload).then((r) => unwrap(r, null)),
  sessions: (): Promise<ActiveSession[]> =>
    api.get<ApiResponse<ActiveSession[]>>('/me/sessions').then((r) => unwrap(r, [])),
  revokeSession: (id: string): Promise<null> =>
    api.delete<ApiResponse<null>>(`/me/sessions/${id}`).then((r) => unwrap(r, null)),
  loginActivity: (): Promise<LoginActivity[]> =>
    api.get<ApiResponse<UserProfile>>('/me/profile').then((r) => {
      const profile = unwrap<UserProfile>(r, {} as UserProfile)
      return profile.login_activity ?? []
    }),

  /* Preferences (10.5) */
  preferences: (): Promise<UserPreferences> =>
    api.get<ApiResponse<UserPreferences>>('/me/preferences').then((r) =>
      unwrap<UserPreferences>(r, {
        theme: 'system',
        density: 'comfortable',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        notifications: { email: true, in_app: true, approval: true, deal: true, billing: true },
      })
    ),
  updatePreferences: (payload: Partial<UserPreferences>): Promise<UserPreferences> =>
    api.patch<ApiResponse<UserPreferences>>('/me/preferences', payload).then((r) =>
      unwrap<UserPreferences>(r, {
        theme: 'system',
        density: 'comfortable',
        language: 'en',
        timezone: 'UTC',
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        notifications: { email: true, in_app: true, approval: true, deal: true, billing: true },
      })
    ),

  /* Help Center (10.6) */
  helpArticles: (): Promise<HelpArticle[]> =>
    api.get<ApiResponse<HelpArticle[]>>('/help/articles').then((r) => unwrap(r, [])),
  helpArticle: (id: string): Promise<HelpArticle | null> =>
    api.get<ApiResponse<HelpArticle | null>>(`/help/articles/${id}`).then((r) => unwrap(r, null)),
  createSupportTicket: (payload: CreateTicketPayload): Promise<SupportTicket> =>
    api.post<ApiResponse<SupportTicket>>('/help/tickets', payload).then((r) => unwrap<SupportTicket>(r, {} as SupportTicket)),
  ticketStatus: (id: string): Promise<SupportTicket> =>
    api.get<ApiResponse<SupportTicket>>(`/help/tickets/${id}`).then((r) => unwrap<SupportTicket>(r, {} as SupportTicket)),

  /* Shared Settings (10.7) */
  orgSettings: (): Promise<OrgSettings> =>
    api.get<ApiResponse<OrgSettings>>('/org/settings').then((r) => unwrap<OrgSettings>(r, {})),
  updateOrgSettings: (payload: Partial<OrgSettings>): Promise<OrgSettings> =>
    api.patch<ApiResponse<OrgSettings>>('/org/settings', payload).then((r) => unwrap<OrgSettings>(r, {})),
  orgLocalization: (): Promise<OrgLocalization> =>
    api.get<ApiResponse<OrgLocalization>>('/org/localization').then((r) => unwrap<OrgLocalization>(r, {})),
  updateOrgLocalization: (payload: Partial<OrgLocalization>): Promise<OrgLocalization> =>
    api.patch<ApiResponse<OrgLocalization>>('/org/localization', payload).then((r) => unwrap<OrgLocalization>(r, {})),
  orgGeneral: (): Promise<OrgGeneralSettings> =>
    api.get<ApiResponse<OrgGeneralSettings>>('/org/settings').then((r) => unwrap<OrgGeneralSettings>(r, {})),
}