import type {
  NotificationFilter,
  NotificationPriority,
  HelpCategory,
  ArticleType,
  UserRole,
} from '@/types/shared'

/* ────────────────── Notification Center (10.3) ────────────────── */

export const NOTIFICATION_FILTERS: Array<{
  value: NotificationFilter
  label: string
}> = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'important', label: 'Important' },
  { value: 'approval', label: 'Approval' },
  { value: 'deal', label: 'Deal' },
  { value: 'billing', label: 'Billing' },
  { value: 'operations', label: 'Operations' },
]

export const NOTIFICATION_CATEGORY_LABELS: Record<string, string> = {
  approval: 'Approval',
  deal: 'Deal',
  customer: 'Customer',
  fulfillment: 'Fulfillment',
  billing: 'Billing',
  subscription: 'Subscription',
  system: 'System',
  operations: 'Operations',
}

export const NOTIFICATION_PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  medium: 'Medium',
  high: 'High',
}

export const NOTIFICATION_PRIORITY_VARIANT: Record<NotificationPriority, 'secondary' | 'warning' | 'danger'> = {
  low: 'secondary',
  normal: 'secondary',
  medium: 'warning',
  high: 'danger',
}

/* ─────────────────────────────── Profile (10.4) ─────────────────────────────── */

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  business_admin: 'Business Admin',
  sales_rep: 'Sales Rep',
  sales_manager: 'Sales Manager',
  finance: 'Finance',
  operations: 'Operations',
  customer: 'Customer',
}

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
}

/* ────────────────────────────── Preferences (10.5) ────────────────────────────── */

export const THEME_OPTIONS: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export const DENSITY_OPTIONS: Array<{ value: 'comfortable' | 'compact'; label: string }> = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]

export const LANGUAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-gb', label: 'English (UK)' },
]

export const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

export const CURRENCY_OPTIONS: Array<{ value: string; label: string; symbol: string }> = [
  { value: 'INR', label: 'INR — Indian Rupee', symbol: '₹' },
  { value: 'EUR', label: 'EUR — Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP — British Pound', symbol: '£' },
  { value: 'AED', label: 'AED — UAE Dirham', symbol: 'د.إ' },
]

export const DATE_FORMAT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
]

/* ─────────────────────────────── Help Center (10.6) ─────────────────────────────── */

export const HELP_CATEGORIES: Array<{
  value: HelpCategory
  label: string
  description: string
}> = [
  { value: 'getting-started', label: 'Getting Started', description: 'Learn the basics' },
  { value: 'sales', label: 'Sales', description: 'Deals, quotations & customers' },
  { value: 'approvals', label: 'Approvals', description: 'Approval workflows & rules' },
  { value: 'fulfillment', label: 'Fulfillment', description: 'Orders, warehouses & shipping' },
  { value: 'billing', label: 'Billing', description: 'Invoices, payments & credit' },
  { value: 'subscriptions', label: 'Subscriptions', description: 'Plans, renewal & usage' },
  { value: 'account', label: 'Account', description: 'Profile, preferences & security' },
]

export const ARTICLE_TYPE_LABELS: Record<ArticleType, string> = {
  guide: 'Guide',
  faq: 'FAQ',
  tutorial: 'Tutorial',
}

export const ARTICLE_TYPE_VARIANT: Record<ArticleType, 'info' | 'secondary' | 'default'> = {
  guide: 'info',
  faq: 'secondary',
  tutorial: 'default',
}

export const RESOURCE_LINKS: Array<{
  id: string
  label: string
  description: string
  url: string
}> = [
  { id: 'documentation', label: 'Documentation', description: 'Full API and product reference', url: '/help/documentation' },
  { id: 'business-rules', label: 'Business Rules', description: 'Discount, risk and approval rule guides', url: '/help/business-rules' },
  { id: 'release-notes', label: 'Release Notes', description: 'What’s new in DealFlow360', url: '/help/release-notes' },
]