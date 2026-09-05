/**
 * Shared feature types for the Shared Modules (10.3 – 10.7).
 *
 * These mirror the field shapes defined in DealFlow360_API_Contract.md (§5 session,
 * §17 shared). Optional/unknown fields are kept optional so the UI degrades
 * gracefully when the backend omits optional data.
 */

/* ─────────────────────────── Notification Center (10.3) ─────────────────────────── */

export type NotificationType =
  | 'approval'
  | 'deal'
  | 'customer'
  | 'fulfillment'
  | 'billing'
  | 'subscription'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high'

export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'important'
  | 'approval'
  | 'deal'
  | 'billing'
  | 'operations'

export interface NotificationRelatedRecord {
  type: string
  id: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  priority?: NotificationPriority
  related_record?: NotificationRelatedRecord | null
  read: boolean
  created_at: string
}

/* ─────────────────────────────── Profile (10.4) ─────────────────────────────── */

export type UserRole =
  | 'super_admin'
  | 'business_admin'
  | 'sales_rep'
  | 'sales_manager'
  | 'finance'
  | 'operations'
  | 'customer'

export type AccountStatus = 'active' | 'suspended' | 'pending' | (string & {})

export interface UserProfile {
  user_id: string
  email: string
  full_name: string
  role: UserRole
  business_id?: string | null
  business_name?: string | null
  customer_id?: string | null
  avatar_url?: string | null
  permissions?: string[]
  phone?: string | null
  job_title?: string | null
  account_status?: AccountStatus | null
  /** Provided by GET /me/profile when the backend includes security tab data. */
  sessions?: ActiveSession[]
  login_activity?: LoginActivity[]
}

export interface ActiveSession {
  id: string
  device?: string | null
  browser?: string | null
  location?: string | null
  ip?: string | null
  last_active?: string | null
  current?: boolean
}

export interface LoginActivity {
  id: string
  timestamp?: string
  ip?: string | null
  location?: string | null
  user_agent?: string | null
}

export interface UpdateProfilePayload {
  full_name?: string
  email?: string
  phone?: string | null
  job_title?: string | null
  avatar_url?: string | null
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

/* ────────────────────────────── Preferences (10.5) ────────────────────────────── */

export type ThemePreference = 'light' | 'dark' | 'system'
export type DensityPreference = 'comfortable' | 'compact'

export interface NotificationChannelPreferences {
  email: boolean
  in_app: boolean
  approval: boolean
  deal: boolean
  billing: boolean
  operations?: boolean
}

export interface UserPreferences {
  theme: ThemePreference
  density: DensityPreference
  language: string
  timezone: string
  currency: string
  date_format: string
  notifications: NotificationChannelPreferences
}

/* ─────────────────────────────── Help Center (10.6) ─────────────────────────────── */

export type HelpCategory =
  | 'getting-started'
  | 'sales'
  | 'approvals'
  | 'fulfillment'
  | 'billing'
  | 'subscriptions'
  | 'account'

export type ArticleType = 'guide' | 'faq' | 'tutorial'

export interface HelpArticle {
  id: string
  category: HelpCategory | string
  type: ArticleType
  title: string
  summary?: string
  url?: string
  updated_at?: string
}

export interface SupportTicket {
  id: string
  subject: string
  status: string
  created_at?: string
  updated_at?: string
  messages?: Array<{ role: string; body: string; at?: string }>
}

export interface CreateTicketPayload {
  subject: string
  category: string
  message: string
  priority?: string
}

/* ────────────────────────────── Shared Settings (10.7) ────────────────────────────── */

export interface OrgLocalization {
  language?: string
  timezone?: string
  date_format?: string
  currency?: string
}

export interface OrgGeneralSettings {
  application_name?: string
  support_email?: string
  default_language?: string
  default_timezone?: string
  date_format?: string
  [key: string]: unknown
}

export interface OrgSettings {
  general?: OrgGeneralSettings
  localization?: OrgLocalization
  appearance?: {
    theme?: ThemePreference
    density?: DensityPreference
  }
  notifications?: Partial<NotificationChannelPreferences>
  security?: {
    password_policy?: string
    session_timeout_minutes?: number
  }
  integrations?: {
    connected_services?: Array<{ id: string; name: string; status?: string; connected_at?: string }>
    api_keys?: Array<{ id: string; name: string; created_at?: string }>
    webhooks?: Array<{ id: string; name: string; url?: string; enabled?: boolean }>
  }
  privacy?: {
    data_export_enabled?: boolean
    retention_days?: number
  }
}

export interface DataExportJob {
  id: string
  format: string
  status: 'processing' | 'completed' | 'failed' | (string & {})
  requested_at?: string
  url?: string
}