export type BusinessStatus = 'pending_setup' | 'active' | 'suspended'

export interface Business {
  id: string
  name: string
  legalName?: string
  email: string
  phone?: string
  website?: string
  industry?: string
  status: BusinessStatus
  logo?: string
  primaryColor?: string
  currency: string
  timezone: string
  plan?: string
  admin?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  usersCount: number
  dealsCount: number
  revenue: number
  createdAt: string
}

export interface BusinessListResponse {
  businesses: Business[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface BusinessListFilters {
  search?: string
  status?: BusinessStatus
  plan?: string
  createdAfter?: string
  createdBefore?: string
  page?: number
  perPage?: number
  sort?: string
}

export interface BusinessKpis {
  total: number
  active: number
  suspended: number
  pendingSetup: number
}

export interface CreateBusinessInput {
  name: string
  legalName?: string
  email: string
  phone?: string
  website?: string
  industry?: string
  address?: {
    line1: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  admin: {
    fullName: string
    email: string
    role: string
  }
  branding?: {
    logo?: string
    primaryColor?: string
    favicon?: string
  }
  configuration: {
    currency: string
    timezone: string
    taxConfig?: Record<string, unknown>
  }
}

export interface BusinessDetail extends Business {
  legalName?: string
  address?: {
    line1: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  subscription?: {
    plan: string
    status: string
    nextBillingDate?: string
  }
  health?: {
    overallScore: number
    systemUsage: number
    userActivity: number
    dealActivity: number
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }
}

export interface BusinessActivity {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: 'user' | 'deal' | 'configuration'
}

export interface BusinessPerformanceKpis {
  totalDeals: number
  revenue: number
  customers: number
  activeUsers: number
  conversionRate?: number
}

export interface DealTrendPoint {
  date: string
  count: number
  value: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  } | null
  error: {
    code: string
    message: string
    field?: string
    details?: Record<string, unknown>
  } | null
}

// ─── Business Users ───────────────────────────────────────

export type UserRole = 'business_admin' | 'sales_manager' | 'sales_rep' | 'viewer'
export type UserStatus = 'active' | 'inactive' | 'pending'

export interface BusinessUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  team?: string
  status: UserStatus
  lastActive?: string
  joinedAt: string
}

export interface BusinessUserKpis {
  totalUsers: number
  activeUsers: number
  pendingInvitations: number
  inactiveUsers: number
}

export interface BusinessUserFilters {
  search?: string
  role?: UserRole
  status?: UserStatus
  team?: string
  page?: number
  perPage?: number
}

// ─── Business Deals ───────────────────────────────────────

export type DealStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'negotiation' | 'confirmed' | 'fulfillment' | 'completed' | 'failed'

export interface BusinessDeal {
  id: string
  name: string
  customer: string
  salesRep: string
  value: number
  risk: 'low' | 'medium' | 'high' | 'critical'
  status: DealStatus
  createdAt: string
}

export interface BusinessDealKpis {
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  totalDealValue: number
}

export interface BusinessDealFilters {
  search?: string
  status?: DealStatus
  risk?: string
  salesRep?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

// ─── Business Revenue ─────────────────────────────────────

export type RevenuePeriod = 'monthly' | 'quarterly' | 'yearly'

export interface RevenueKpis {
  totalRevenue: number
  monthlyRevenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  growth?: number
}

export interface RevenueTrendData {
  date: string
  revenue: number
}

export interface RevenueBreakdown {
  oneTime: number
  subscription: number
  productCategory: { name: string; revenue: number }[]
}

export interface RevenueByProduct {
  product: string
  revenue: number
  orders: number
  share: number
}

export interface RevenueByCustomer {
  customer: string
  revenue: number
  orders: number
  share: number
}

export interface RevenueTransaction {
  id: string
  customer: string
  amount: number
  type: string
  date: string
  status: string
}

// ─── Business Usage ───────────────────────────────────────

export interface UsageOverview {
  activeUsers: number
  activeDeals: number
  quotations: number
  orders: number
  apiUsage: number
}

export interface UserActivityData {
  dailyActiveUsers: number
  monthlyActiveUsers: number
}

export interface DealUsageData {
  dealsCreated: number
  dealsUpdated: number
  dealsCompleted: number
}

export interface FeatureUsageItem {
  name: string
  usageCount: number
  activeUsers: number
  percentage: number
}

export interface UsageTrendPoint {
  date: string
  events: number
  users: number
}

// ─── Business Health ──────────────────────────────────────

export interface HealthScore {
  score: number
  status: 'healthy' | 'degraded' | 'critical' | 'unavailable'
}

export interface BusinessActivityHealth {
  userActivity: { value: number; status: string }
  dealActivity: { value: number; status: string }
  customerActivity: { value: number; status: string }
}

export interface PerformanceIndicators {
  dealConversion: number
  approvalDelay: string
  fulfillmentDelay: string
  paymentIssues: number
}

export interface RiskIndicators {
  highRiskDeals: number
  discountAnomalies: number
  stalledDeals: number
}

export interface HealthAlert {
  id: string
  severity: 'critical' | 'warning' | 'informational'
  title: string
  description: string
  timestamp: string
}

// ─── Business Configuration ───────────────────────────────

export interface BusinessConfiguration {
  general: {
    businessName: string
    legalName?: string
    email: string
    phone?: string
    website?: string
    currency: string
    timezone: string
    locale?: string
  }
  branding: {
    logo?: string
    primaryColor?: string
    favicon?: string
    theme: 'light' | 'dark' | 'system'
  }
  sales: {
    pricingModel?: string
    discountRulesEnabled: boolean
    approvalRulesEnabled: boolean
  }
  operations: {
    warehouses: number
    shippingEnabled: boolean
    fulfillmentEnabled: boolean
  }
  billing: {
    billingCycle?: string
    subscriptionPlan?: string
    prorationEnabled: boolean
  }
  security: {
    authenticationMethod?: string
    sessionDuration?: string
    mfaRequired: boolean
    ipRestriction?: string
  }
}
