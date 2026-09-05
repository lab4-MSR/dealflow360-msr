export type BusinessStatus = 'pending_setup' | 'active' | 'suspended'
export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected' | 'returned'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unavailable'

export interface PlatformKpis {
  totalBusinesses: number
  activeBusinesses: number
  totalUsers: number
  totalDeals: number
  totalRevenue: number
  platformHealth: HealthStatus
  currency: string
}

export interface BusinessTrendPoint {
  date: string
  total: number
  active: number
  new: number
}

export interface BusinessOverview {
  total: number
  active: number
  suspended: number
  pendingSetup: number
  newThisPeriod: number
  growthTrend: BusinessTrendPoint[]
}

export interface DealOverview {
  total: number
  pendingApprovals: number
  highRisk: number
  completed: number
  trend: DealTrendPoint[]
}

export interface DealTrendPoint {
  date: string
  created: number
  completed: number
}

export interface RevenueOverview {
  total: number
  currency: string
  trend: RevenueTrendPoint[]
  byBusiness: RevenueByBusiness[]
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
}

export interface RevenueByBusiness {
  businessId: string
  businessName: string
  revenue: number
}

export interface PlatformActivityItem {
  id: string
  type: 'business' | 'user' | 'system'
  actor: string
  action: string
  target: string
  timestamp: string
  severity?: Severity
}

export interface SystemHealthService {
  name: string
  status: HealthStatus
  latencyMs?: number
  lastChecked: string
}

export interface SystemHealth {
  api: SystemHealthService
  database: SystemHealthService
  authentication: SystemHealthService
  services: SystemHealthService[]
}

export interface PlatformAlert {
  id: string
  severity: Severity
  title: string
  description: string
  timestamp: string
  type: 'alert' | 'suspended_business' | 'system_issue'
  metadata?: {
    businessId?: string
    businessName?: string
  }
}

export interface PlatformDashboardData {
  kpis: PlatformKpis
  businessOverview: BusinessOverview
  dealOverview: DealOverview
  revenueOverview: RevenueOverview
  recentActivity: PlatformActivityItem[]
  systemHealth: SystemHealth
  alerts: PlatformAlert[]
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
