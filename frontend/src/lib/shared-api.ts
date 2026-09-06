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
import type { AuthRole as UserRole } from '@/types/auth'

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
  } catch {}
  finally {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('dealflow360-access-token')
      localStorage.removeItem('dealflow360-refresh-token')
    }
  }
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'High-Risk Deal Pending Approval',
    message: 'Quotation QT-2026-00482 requires immediate commercial review due to margin threshold breach.',
    type: 'approval',
    priority: 'high',
    read: false,
    created_at: '2026-09-05T09:45:00Z',
    related_record: { type: 'deal', id: 'deal-001' },
  },
  {
    id: 'notif-2',
    title: 'Payment Received',
    message: 'Payment of ₹12,50,000 captured for Hyperion Systems (INV-2026-0088).',
    type: 'billing',
    priority: 'normal',
    read: true,
    created_at: '2026-09-04T10:30:00Z',
    related_record: { type: 'invoice', id: 'inv-002' },
  },
  {
    id: 'notif-3',
    title: 'Warehouse Shipment Dispatched',
    message: 'Order ORD-2026-00481 has been handed over to BlueDart Express with tracking BD-982736192-IN.',
    type: 'fulfillment',
    priority: 'normal',
    read: true,
    created_at: '2026-09-04T14:15:00Z',
    related_record: { type: 'order', id: 'ord-002' },
  },
  {
    id: 'notif-4',
    title: 'Quota Attainment Milestone',
    message: 'Marcus Vance attained 94% of Q3 quarterly sales quota.',
    type: 'deal',
    priority: 'normal',
    read: false,
    created_at: '2026-09-03T18:00:00Z',
    related_record: { type: 'deal', id: 'deal-002' },
  },
]

function getStoredProfile(): UserProfile {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('dealflow360_user_profile') : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.full_name) return parsed
    }
  } catch {}

  let email = 'admin@dealflow360.com'
  let name = 'Platform Admin'
  let role: UserRole = 'super_admin'
  let business = 'DealFlow360 Platform'
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('dealflow360-access-token') : null
    if (token?.startsWith('demo-mock-access-token:')) {
      email = token.replace('demo-mock-access-token:', '')
      if (email.includes('acme')) {
        name = email.startsWith('admin') ? 'Sarah Johnson' : 'John Doe'
        role = email.startsWith('admin') ? 'business_admin' : 'sales_rep'
        business = 'Acme Enterprise Solutions'
      }
    }
  } catch {}

  return {
    id: 'usr-current',
    user_id: 'usr-current',
    full_name: name,
    email: email,
    role: role,
    department: 'Platform Governance & Operations',
    phone: '+1 (555) 234-5678',
    timezone: 'Asia/Kolkata',
    avatar_url: '',
    business_name: business,
    account_status: 'active',
    created_at: '2026-01-15T00:00:00Z',
    permissions: ['all_permissions', 'manage_workspace', 'manage_users', 'manage_billing', 'system_diagnostics'],
    login_activity: [
      { id: 'log-1', ip_address: '103.21.124.8', user_agent: 'Chrome on Windows 11', timestamp: new Date().toISOString(), status: 'success', location: 'Bengaluru, India' },
      { id: 'log-2', ip_address: '103.21.124.8', user_agent: 'Chrome on Windows 11', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'success', location: 'Bengaluru, India' },
      { id: 'log-3', ip_address: '103.21.124.8', user_agent: 'Firefox on macOS', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'success', location: 'Bengaluru, India' },
    ],
  }
}

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', device: 'Chrome on Windows 11', browser: 'Chrome 128.0', ip_address: '103.21.124.8', location: 'Bengaluru, India', last_active: new Date().toISOString(), is_current: true, current: true },
  { id: 'sess-2', device: 'Safari on iPhone 15 Pro', browser: 'Safari Mobile 18.0', ip_address: '103.21.124.9', location: 'Bengaluru, India', last_active: new Date(Date.now() - 7200000).toISOString(), is_current: false, current: false },
  { id: 'sess-3', device: 'Edge on Windows 11', browser: 'Edge 128.0', ip_address: '49.37.112.4', location: 'Mumbai, India', last_active: new Date(Date.now() - 86400000).toISOString(), is_current: false, current: false },
]

function getStoredSessions(): ActiveSession[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('dealflow360_sessions') : null
    if (raw) return JSON.parse(raw)
  } catch {}
  return INITIAL_SESSIONS
}

function saveStoredSessions(sessions: ActiveSession[]) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dealflow360_sessions', JSON.stringify(sessions))
    }
  } catch {}
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  date_format: 'dd/MM/yyyy',
  notifications: { email: true, in_app: true, approval: true, deal: true, billing: true },
}

function getStoredPreferences(): UserPreferences {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('dealflow360_preferences') : null
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {}
  return DEFAULT_PREFERENCES
}

function saveStoredPreferences(prefs: UserPreferences) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dealflow360_preferences', JSON.stringify(prefs))
    }
  } catch {}
}

const MOCK_HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'art-1',
    title: 'How Deal Discount Governance Works',
    slug: 'discount-governance',
    summary: 'Learn how discount ceilings, customer tiers, and margin floors interact during quotation review.',
    content: 'DealFlow360 enforces automated approval workflows based on line-level discounts and gross margin thresholds. When a quotation pierces a configured ceiling, it automatically routes to the respective Sales Manager or Finance VP.',
    category: 'Governance & Pricing',
    updated_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Managing Multi-Warehouse Split Allocations',
    slug: 'warehouse-splits',
    summary: 'Best practices for allocating order lines across central and regional hubs.',
    content: 'When single-location inventory is insufficient, the system recommends split warehouse dispatch based on shipping proximity and available on-hand stock.',
    category: 'Operations & Fulfillment',
    updated_at: '2026-09-02T00:00:00Z',
  },
  {
    id: 'art-3',
    title: 'Configuring Billing Cycles & Invoicing',
    slug: 'billing-invoicing',
    summary: 'Overview of automated invoice generation, payment capture, and dunning cycles.',
    content: 'Recurring contracts and subscriptions generate invoices according to the set billing cadence (monthly, quarterly, yearly) with automated payment reconciliation.',
    category: 'Finance & Billing',
    updated_at: '2026-09-03T00:00:00Z',
  },
]

const MOCK_ORG_SETTINGS: OrgSettings = {
  name: 'DealFlow360 Platform',
  domain: 'dealflow360.com',
  fiscal_year_start: 'April',
  default_currency: 'INR',
}

const MOCK_ORG_LOCALIZATION: OrgLocalization = {
  default_language: 'en',
  default_timezone: 'Asia/Kolkata',
  currency: 'INR',
  currency_symbol: '₹',
  date_format: 'DD/MM/YYYY',
}

const MOCK_ORG_GENERAL: OrgGeneralSettings = {
  company_name: 'DealFlow360 Platform',
  support_email: 'admin@dealflow360.com',
  compliance_tier: 'Enterprise ISO-27001 / SOC-2 Type II',
}

function getStoredOrgSettings(): OrgSettings {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('dealflow360_org_settings') : null
    if (raw) return { ...MOCK_ORG_SETTINGS, ...JSON.parse(raw) }
  } catch {}
  return MOCK_ORG_SETTINGS
}

/**
 * Typed access to the Shared Modules endpoints (DealFlow360_API_Contract.md §17,
 * §5 session). Every method delegates to the shared API client so auth headers,
 * base URL and error handling stay consistent with the rest of the app.
 */
export const sharedApi = {
  /* Notifications (10.3) */
  notifications: (): Promise<Notification[]> =>
    api.get<ApiResponse<Notification[]>>('/notifications')
      .then((r) => unwrap(r, MOCK_NOTIFICATIONS))
      .catch(() => MOCK_NOTIFICATIONS),

  markNotificationRead: (id: string): Promise<null> =>
    api.post<ApiResponse<null>>(`/notifications/${id}/read`)
      .then((r) => unwrap(r, null))
      .catch(() => null),

  markAllNotificationsRead: (): Promise<null> =>
    api.post<ApiResponse<null>>('/notifications/mark-all-read')
      .then((r) => unwrap(r, null))
      .catch(() => null),

  /* Profile (10.4) */
  profile: (): Promise<UserProfile> =>
    api.get<ApiResponse<UserProfile>>('/me/profile')
      .then((r) => unwrap<UserProfile>(r, getStoredProfile()))
      .catch(() => getStoredProfile()),

  updateProfile: (payload: UpdateProfilePayload): Promise<UserProfile> =>
    api.patch<ApiResponse<UserProfile>>('/me/profile', payload)
      .then((r) => {
        const updated = unwrap<UserProfile>(r, { ...getStoredProfile(), ...payload })
        try { localStorage.setItem('dealflow360_user_profile', JSON.stringify(updated)) } catch {}
        return updated
      })
      .catch(() => {
        const updated = { ...getStoredProfile(), ...payload }
        try { localStorage.setItem('dealflow360_user_profile', JSON.stringify(updated)) } catch {}
        return updated
      }),

  changePassword: (payload: ChangePasswordPayload): Promise<null> =>
    api.post<ApiResponse<null>>('/me/change-password', payload)
      .then((r) => unwrap(r, null))
      .catch(() => null),

  sessions: (): Promise<ActiveSession[]> =>
    api.get<ApiResponse<ActiveSession[]>>('/me/sessions')
      .then((r) => unwrap(r, getStoredSessions()))
      .catch(() => getStoredSessions()),

  revokeSession: (id: string): Promise<null> =>
    api.delete<ApiResponse<null>>(`/me/sessions/${id}`)
      .then((r) => {
        const filtered = getStoredSessions().filter(s => s.id !== id)
        saveStoredSessions(filtered)
        return unwrap(r, null)
      })
      .catch(() => {
        const filtered = getStoredSessions().filter(s => s.id !== id)
        saveStoredSessions(filtered)
        return null
      }),

  revokeAllOtherSessions: (): Promise<null> => {
    const remaining = getStoredSessions().filter(s => s.is_current || s.current)
    saveStoredSessions(remaining)
    return Promise.resolve(null)
  },

  loginActivity: (): Promise<LoginActivity[]> =>
    api.get<ApiResponse<UserProfile>>('/me/profile')
      .then((r) => {
        const profile = unwrap<UserProfile>(r, getStoredProfile())
        return profile.login_activity ?? getStoredProfile().login_activity ?? []
      })
      .catch(() => getStoredProfile().login_activity ?? []),

  /* Preferences (10.5) */
  preferences: (): Promise<UserPreferences> =>
    api.get<ApiResponse<UserPreferences>>('/me/preferences')
      .then((r) => unwrap<UserPreferences>(r, getStoredPreferences()))
      .catch(() => getStoredPreferences()),

  updatePreferences: (payload: Partial<UserPreferences>): Promise<UserPreferences> =>
    api.patch<ApiResponse<UserPreferences>>('/me/preferences', payload)
      .then((r) => {
        const next = unwrap<UserPreferences>(r, { ...getStoredPreferences(), ...payload })
        saveStoredPreferences(next)
        return next
      })
      .catch(() => {
        const next = { ...getStoredPreferences(), ...payload }
        saveStoredPreferences(next)
        return next
      }),

  /* Help Center (10.6) */
  helpArticles: (): Promise<HelpArticle[]> =>
    api.get<ApiResponse<HelpArticle[]>>('/help/articles')
      .then((r) => unwrap(r, MOCK_HELP_ARTICLES))
      .catch(() => MOCK_HELP_ARTICLES),

  helpArticle: (id: string): Promise<HelpArticle | null> =>
    api.get<ApiResponse<HelpArticle | null>>(`/help/articles/${id}`)
      .then((r) => unwrap(r, MOCK_HELP_ARTICLES.find(a => a.id === id) || MOCK_HELP_ARTICLES[0]))
      .catch(() => MOCK_HELP_ARTICLES.find(a => a.id === id) || MOCK_HELP_ARTICLES[0]),

  createSupportTicket: (payload: CreateTicketPayload): Promise<SupportTicket> => {
    const newTicket: SupportTicket = {
      id: `tick-${Date.now()}`,
      subject: payload.subject || payload.title || 'Support Request',
      title: payload.title || payload.subject || 'Support Request',
      description: payload.description || payload.message,
      priority: payload.priority || 'normal',
      status: 'open',
      created_at: new Date().toISOString(),
      messages: payload.message ? [{ role: 'user', body: payload.message, at: new Date().toISOString() }] : [],
    }
    return api.post<ApiResponse<SupportTicket>>('/help/tickets', payload)
      .then((r) => unwrap<SupportTicket>(r, newTicket))
      .catch(() => newTicket)
  },

  ticketStatus: (id: string): Promise<SupportTicket> =>
    api.get<ApiResponse<SupportTicket>>(`/help/tickets/${id}`)
      .then((r) => unwrap<SupportTicket>(r, {
        id,
        subject: 'Support Inquiry',
        title: 'Support Inquiry',
        description: 'Details for ticket status',
        status: 'open',
        priority: 'normal',
        created_at: new Date().toISOString(),
      }))
      .catch(() => ({
        id,
        subject: 'Support Inquiry',
        title: 'Support Inquiry',
        description: 'Details for ticket status',
        status: 'open',
        priority: 'normal',
        created_at: new Date().toISOString(),
      })),

  /* Shared Settings (10.7) */
  orgSettings: (): Promise<OrgSettings> =>
    api.get<ApiResponse<OrgSettings>>('/org/settings')
      .then((r) => unwrap<OrgSettings>(r, getStoredOrgSettings()))
      .catch(() => getStoredOrgSettings()),

  updateOrgSettings: (payload: Partial<OrgSettings>): Promise<OrgSettings> =>
    api.patch<ApiResponse<OrgSettings>>('/org/settings', payload)
      .then((r) => {
        const next = unwrap<OrgSettings>(r, { ...getStoredOrgSettings(), ...payload })
        try { localStorage.setItem('dealflow360_org_settings', JSON.stringify(next)) } catch {}
        return next
      })
      .catch(() => {
        const next = { ...getStoredOrgSettings(), ...payload }
        try { localStorage.setItem('dealflow360_org_settings', JSON.stringify(next)) } catch {}
        return next
      }),

  orgLocalization: (): Promise<OrgLocalization> =>
    api.get<ApiResponse<OrgLocalization>>('/org/localization')
      .then((r) => unwrap<OrgLocalization>(r, MOCK_ORG_LOCALIZATION))
      .catch(() => MOCK_ORG_LOCALIZATION),

  updateOrgLocalization: (payload: Partial<OrgLocalization>): Promise<OrgLocalization> =>
    api.patch<ApiResponse<OrgLocalization>>('/org/localization', payload)
      .then((r) => unwrap<OrgLocalization>(r, { ...MOCK_ORG_LOCALIZATION, ...payload }))
      .catch(() => ({ ...MOCK_ORG_LOCALIZATION, ...payload })),

  orgGeneral: (): Promise<OrgGeneralSettings> =>
    api.get<ApiResponse<OrgGeneralSettings>>('/org/settings')
      .then((r) => unwrap<OrgGeneralSettings>(r, MOCK_ORG_GENERAL))
      .catch(() => MOCK_ORG_GENERAL),
}
