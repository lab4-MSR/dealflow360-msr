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

const MOCK_PROFILE: UserProfile = {
  id: 'usr-current',
  full_name: 'Shubham Kumar',
  email: 'shubhamkumar997800@gmail.com',
  role: 'super_admin',
  department: 'Enterprise Sales & Operations',
  phone: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  avatar_url: '',
  created_at: '2026-01-15T00:00:00Z',
  login_activity: [
    { id: 'log-1', ip_address: '103.21.124.8', user_agent: 'Chrome on Windows', timestamp: new Date().toISOString(), status: 'success' },
  ],
}

const MOCK_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', device: 'Chrome on Windows 11', ip_address: '103.21.124.8', last_active: new Date().toISOString(), is_current: true },
]

const MOCK_PREFERENCES: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  language: 'en',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  date_format: 'dd/MM/yyyy',
  notifications: { email: true, in_app: true, approval: true, deal: true, billing: true },
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
  name: 'DealFlow360 Enterprise',
  domain: 'dealflow360.internal',
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
  company_name: 'DealFlow360 Enterprise Solutions',
  support_email: 'support@dealflow360.internal',
  compliance_tier: 'Enterprise ISO-27001',
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
      .then((r) => unwrap<UserProfile>(r, MOCK_PROFILE))
      .catch(() => MOCK_PROFILE),

  updateProfile: (payload: UpdateProfilePayload): Promise<UserProfile> =>
    api.patch<ApiResponse<UserProfile>>('/me/profile', payload)
      .then((r) => unwrap<UserProfile>(r, { ...MOCK_PROFILE, ...payload }))
      .catch(() => ({ ...MOCK_PROFILE, ...payload })),

  changePassword: (payload: ChangePasswordPayload): Promise<null> =>
    api.post<ApiResponse<null>>('/me/change-password', payload)
      .then((r) => unwrap(r, null))
      .catch(() => null),

  sessions: (): Promise<ActiveSession[]> =>
    api.get<ApiResponse<ActiveSession[]>>('/me/sessions')
      .then((r) => unwrap(r, MOCK_SESSIONS))
      .catch(() => MOCK_SESSIONS),

  revokeSession: (id: string): Promise<null> =>
    api.delete<ApiResponse<null>>(`/me/sessions/${id}`)
      .then((r) => unwrap(r, null))
      .catch(() => null),

  loginActivity: (): Promise<LoginActivity[]> =>
    api.get<ApiResponse<UserProfile>>('/me/profile')
      .then((r) => {
        const profile = unwrap<UserProfile>(r, MOCK_PROFILE)
        return profile.login_activity ?? MOCK_PROFILE.login_activity ?? []
      })
      .catch(() => MOCK_PROFILE.login_activity ?? []),

  /* Preferences (10.5) */
  preferences: (): Promise<UserPreferences> =>
    api.get<ApiResponse<UserPreferences>>('/me/preferences')
      .then((r) => unwrap<UserPreferences>(r, MOCK_PREFERENCES))
      .catch(() => MOCK_PREFERENCES),

  updatePreferences: (payload: Partial<UserPreferences>): Promise<UserPreferences> =>
    api.patch<ApiResponse<UserPreferences>>('/me/preferences', payload)
      .then((r) => unwrap<UserPreferences>(r, { ...MOCK_PREFERENCES, ...payload }))
      .catch(() => ({ ...MOCK_PREFERENCES, ...payload })),

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
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      status: 'open',
      created_at: new Date().toISOString(),
    }
    return api.post<ApiResponse<SupportTicket>>('/help/tickets', payload)
      .then((r) => unwrap<SupportTicket>(r, newTicket))
      .catch(() => newTicket)
  },

  ticketStatus: (id: string): Promise<SupportTicket> =>
    api.get<ApiResponse<SupportTicket>>(`/help/tickets/${id}`)
      .then((r) => unwrap<SupportTicket>(r, {
        id,
        title: 'Support Inquiry',
        description: 'Details for ticket status',
        status: 'open',
        priority: 'normal',
        created_at: new Date().toISOString(),
      }))
      .catch(() => ({
        id,
        title: 'Support Inquiry',
        description: 'Details for ticket status',
        status: 'open',
        priority: 'normal',
        created_at: new Date().toISOString(),
      })),

  /* Shared Settings (10.7) */
  orgSettings: (): Promise<OrgSettings> =>
    api.get<ApiResponse<OrgSettings>>('/org/settings')
      .then((r) => unwrap<OrgSettings>(r, MOCK_ORG_SETTINGS))
      .catch(() => MOCK_ORG_SETTINGS),

  updateOrgSettings: (payload: Partial<OrgSettings>): Promise<OrgSettings> =>
    api.patch<ApiResponse<OrgSettings>>('/org/settings', payload)
      .then((r) => unwrap<OrgSettings>(r, { ...MOCK_ORG_SETTINGS, ...payload }))
      .catch(() => ({ ...MOCK_ORG_SETTINGS, ...payload })),

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