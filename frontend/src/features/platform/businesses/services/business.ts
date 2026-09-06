import type {
  Business,
  BusinessListFilters,
  BusinessKpis,
  CreateBusinessInput,
  BusinessDetail,
  BusinessActivity,
  BusinessPerformanceKpis,
  DealTrendPoint,
  RevenueTrendPoint,
  BusinessUser,
  BusinessUserKpis,
  BusinessUserFilters,
  BusinessDeal,
  BusinessDealKpis,
  BusinessDealFilters,
  RevenueKpis,
  RevenuePeriod,
  RevenueTrendData,
  RevenueBreakdown,
  RevenueByProduct,
  RevenueByCustomer,
  RevenueTransaction,
  UsageOverview,
  UserActivityData,
  DealUsageData,
  FeatureUsageItem,
  UsageTrendPoint,
  HealthScore,
  BusinessActivityHealth,
  PerformanceIndicators,
  RiskIndicators,
  HealthAlert,
  BusinessConfiguration,
} from '../types'

const API_BASE = '/api/v1'

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}`,
  }
}

function buildQueryString(filters: BusinessListFilters): string {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('filter[status]', filters.status)
  if (filters.plan) params.set('filter[plan]', filters.plan)
  if (filters.createdAfter) params.set('created_after', filters.createdAfter)
  if (filters.createdBefore) params.set('created_before', filters.createdBefore)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.perPage) params.set('per_page', String(filters.perPage))
  if (filters.sort) params.set('sort', filters.sort)
  return params.toString()
}

export async function fetchBusinesses(
  filters: BusinessListFilters = {},
): Promise<{ businesses: Business[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  try {
    const qs = buildQueryString(filters)
    const response = await fetch(`${API_BASE}/platform/businesses${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch businesses')
    return {
      businesses: Array.isArray(json.data) ? json.data : [],
      total: json.meta?.total || (Array.isArray(json.data) ? json.data.length : 0),
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch businesses:', err)
    return {
      businesses: [],
      total: 0,
      page: reqPage,
      perPage: reqPerPage,
      totalPages: 1,
    }
  }
}

export async function fetchBusinessKpis(): Promise<BusinessKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/dashboard`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch KPIs')
    return {
      total: json.data?.kpis?.totalBusinesses ?? 0,
      active: json.data?.kpis?.activeBusinesses ?? 0,
      suspended: 0,
      pendingSetup: 0,
    }
  } catch (err) {
    console.error('Failed to fetch business KPIs:', err)
    return { total: 0, active: 0, suspended: 0, pendingSetup: 0 }
  }
}

export async function fetchBusinessById(id: string): Promise<BusinessDetail> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch business')
    return json.data
  } catch (err) {
    console.error(`Failed to fetch business ${id}:`, err)
    return {
      id,
      name: 'Business',
      legalName: '',
      email: '',
      phone: '',
      website: '',
      industry: 'Technology',
      status: 'active',
      logo: '',
      primaryColor: '#4f46e5',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      plan: 'Growth',
      admin: { id: '', name: 'Admin', email: '', avatar: '' },
      usersCount: 0,
      dealsCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      address: { line1: '', city: '', state: '', country: 'India', postalCode: '' },
      subscription: { plan: 'Growth', status: 'active', nextBillingDate: '' },
      health: { overallScore: 80, systemUsage: 75, userActivity: 75, dealActivity: 75, riskLevel: 'low' },
    }
  }
}

export async function fetchBusinessPerformance(id: string): Promise<BusinessPerformanceKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (json.data?.performance) return json.data.performance
    return {
      totalDeals: json.data?.dealsCount || 0,
      revenue: json.data?.revenue || 0,
      customers: 0,
      activeUsers: json.data?.usersCount || 0,
      conversionRate: 0,
    }
  } catch (err) {
    console.error(`Failed to fetch performance for ${id}:`, err)
    return { totalDeals: 0, revenue: 0, customers: 0, activeUsers: 0, conversionRate: 0 }
  }
}

export async function fetchBusinessActivity(id: string): Promise<BusinessActivity[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch activity for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessDealTrend(id: string): Promise<DealTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/deals`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data?.trend) ? json.data.trend : []
  } catch (err) {
    console.error(`Failed to fetch deal trend for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessRevenueTrend(id: string): Promise<RevenueTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data?.trend) ? json.data.trend : []
  } catch (err) {
    console.error(`Failed to fetch revenue trend for ${id}:`, err)
    return []
  }
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const response = await fetch(`${API_BASE}/platform/businesses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to create business')
  }
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to create business')
  return json.data
}

export async function updateBusinessStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
  const response = await fetch(`${API_BASE}/platform/businesses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to update business')
  }
}

export async function bulkAction(
  businessIds: string[],
  action: 'activate' | 'suspend' | 'export',
): Promise<void> {
  const response = await fetch(`${API_BASE}/platform/businesses/bulk-action`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ business_ids: businessIds, action }),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to perform bulk action')
  }
}

// ─── Business Users ───────────────────────────────────────

export async function fetchBusinessUsers(
  id: string,
  filters: BusinessUserFilters = {},
): Promise<{ users: BusinessUser[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.role) params.set('filter[role]', filters.role)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.team) params.set('filter[team]', filters.team)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/users${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch users')
    return {
      users: Array.isArray(json.data) ? json.data : [],
      total: json.meta?.total || (Array.isArray(json.data) ? json.data.length : 0),
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error(`Failed to fetch business users for ${id}:`, err)
    return {
      users: [],
      total: 0,
      page: reqPage,
      perPage: reqPerPage,
      totalPages: 1,
    }
  }
}

export async function fetchBusinessUserKpis(id: string): Promise<BusinessUserKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/users/overview`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { totalUsers: 0, activeUsers: 0, pendingInvitations: 0, inactiveUsers: 0 }
  } catch (err) {
    console.error(`Failed to fetch user KPIs for ${id}:`, err)
    return { totalUsers: 0, activeUsers: 0, pendingInvitations: 0, inactiveUsers: 0 }
  }
}

// ─── Business Deals ───────────────────────────────────────

export async function fetchBusinessDeals(
  id: string,
  filters: BusinessDealFilters = {},
): Promise<{ deals: BusinessDeal[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.risk) params.set('filter[risk]', filters.risk)
    if (filters.salesRep) params.set('filter[sales_rep]', filters.salesRep)
    if (filters.dateFrom) params.set('date_from', filters.dateFrom)
    if (filters.dateTo) params.set('date_to', filters.dateTo)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(
      `${API_BASE}/platform/businesses/${id}/deals/list${qs ? `?${qs}` : ''}`,
      { headers: getAuthHeaders() },
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return {
      deals: Array.isArray(json.data) ? json.data : [],
      total: json.meta?.total || (Array.isArray(json.data) ? json.data.length : 0),
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error(`Failed to fetch business deals for ${id}:`, err)
    return {
      deals: [],
      total: 0,
      page: reqPage,
      perPage: reqPerPage,
      totalPages: 1,
    }
  }
}

export async function fetchBusinessDealKpis(id: string): Promise<BusinessDealKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/deals/kpis`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { totalDeals: 0, activeDeals: 0, wonDeals: 0, lostDeals: 0, totalPipelineValue: 0, avgDealSize: 0, winRate: 0 }
  } catch (err) {
    console.error(`Failed to fetch deal KPIs for ${id}:`, err)
    return { totalDeals: 0, activeDeals: 0, wonDeals: 0, lostDeals: 0, totalPipelineValue: 0, avgDealSize: 0, winRate: 0 }
  }
}

// ─── Business Revenue ─────────────────────────────────────

export async function fetchBusinessRevenueKpis(id: string): Promise<RevenueKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/kpis`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { totalRevenue: 0, recurringRevenue: 0, oneTimeRevenue: 0, avgDealRevenue: 0, revenueGrowth: 0 }
  } catch (err) {
    console.error(`Failed to fetch revenue KPIs for ${id}:`, err)
    return { totalRevenue: 0, recurringRevenue: 0, oneTimeRevenue: 0, avgDealRevenue: 0, revenueGrowth: 0 }
  }
}

export async function fetchBusinessRevenueTrendData(
  id: string,
  period: RevenuePeriod,
): Promise<RevenueTrendData[]> {
  try {
    const response = await fetch(
      `${API_BASE}/platform/businesses/${id}/revenue/trend?period=${period}`,
      { headers: getAuthHeaders() },
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch revenue trend data for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessRevenueBreakdown(id: string): Promise<RevenueBreakdown> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/breakdown`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { recurringPercent: 0, oneTimePercent: 0, categories: [] }
  } catch (err) {
    console.error(`Failed to fetch revenue breakdown for ${id}:`, err)
    return { recurringPercent: 0, oneTimePercent: 0, categories: [] }
  }
}

export async function fetchBusinessRevenueByProduct(id: string): Promise<RevenueByProduct[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/by-product`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch revenue by product for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessRevenueByCustomer(id: string): Promise<RevenueByCustomer[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/by-customer`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch revenue by customer for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessRevenueTransactions(
  id: string,
  page = 1,
  perPage = 10,
): Promise<{ transactions: RevenueTransaction[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(page) || 1)
  const reqPerPage = Math.max(1, Number(perPage) || 10)
  try {
    const response = await fetch(
      `${API_BASE}/platform/businesses/${id}/revenue/transactions?page=${reqPage}&per_page=${reqPerPage}`,
      { headers: getAuthHeaders() },
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return {
      transactions: Array.isArray(json.data) ? json.data : [],
      total: json.meta?.total || (Array.isArray(json.data) ? json.data.length : 0),
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error(`Failed to fetch transactions for ${id}:`, err)
    return {
      transactions: [],
      total: 0,
      page: reqPage,
      perPage: reqPerPage,
      totalPages: 1,
    }
  }
}

// ─── Business Usage ───────────────────────────────────────

export async function fetchBusinessUsageOverview(id: string): Promise<UsageOverview> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { activeUsersToday: 0, dealsCreatedThisMonth: 0, storageUsedGb: 0, apiCallsThisMonth: 0 }
  } catch (err) {
    console.error(`Failed to fetch usage overview for ${id}:`, err)
    return { activeUsersToday: 0, dealsCreatedThisMonth: 0, storageUsedGb: 0, apiCallsThisMonth: 0 }
  }
}

export async function fetchBusinessUserActivity(id: string): Promise<UserActivityData> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/user-activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { dailyActiveUsers: [], weeklyActiveUsers: [], monthlyActiveUsers: [] }
  } catch (err) {
    console.error(`Failed to fetch user activity for ${id}:`, err)
    return { dailyActiveUsers: [], weeklyActiveUsers: [], monthlyActiveUsers: [] }
  }
}

export async function fetchBusinessDealUsage(id: string): Promise<DealUsageData> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/deal-usage`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { totalDealsThisMonth: 0, dealsByStage: [] }
  } catch (err) {
    console.error(`Failed to fetch deal usage for ${id}:`, err)
    return { totalDealsThisMonth: 0, dealsByStage: [] }
  }
}

export async function fetchBusinessFeatureUsage(id: string): Promise<FeatureUsageItem[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/features`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch feature usage for ${id}:`, err)
    return []
  }
}

export async function fetchBusinessUsageTrend(id: string, days = 30): Promise<UsageTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/trend?days=${days}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch usage trend for ${id}:`, err)
    return []
  }
}

// ─── Business Health ──────────────────────────────────────

export async function fetchBusinessHealthScore(id: string): Promise<HealthScore> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { overallScore: 80, systemUsage: 80, userActivity: 80, dealActivity: 80, riskLevel: 'low' }
  } catch (err) {
    console.error(`Failed to fetch health score for ${id}:`, err)
    return { overallScore: 80, systemUsage: 80, userActivity: 80, dealActivity: 80, riskLevel: 'low' }
  }
}

export async function fetchBusinessActivityHealth(id: string): Promise<BusinessActivityHealth> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { lastLoginDate: '', activeUsersPast7Days: 0, actionsPast30Days: 0 }
  } catch (err) {
    console.error(`Failed to fetch activity health for ${id}:`, err)
    return { lastLoginDate: '', activeUsersPast7Days: 0, actionsPast30Days: 0 }
  }
}

export async function fetchBusinessPerformanceIndicators(id: string): Promise<PerformanceIndicators> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/performance`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { responseTimeMs: 25, errorRatePercent: 0, uptimePercent: 99.9 }
  } catch (err) {
    console.error(`Failed to fetch performance indicators for ${id}:`, err)
    return { responseTimeMs: 25, errorRatePercent: 0, uptimePercent: 99.9 }
  }
}

export async function fetchBusinessRiskIndicators(id: string): Promise<RiskIndicators> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/risks`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || { churnRisk: 'low', paymentRisk: 'low', engagementRisk: 'low' }
  } catch (err) {
    console.error(`Failed to fetch risk indicators for ${id}:`, err)
    return { churnRisk: 'low', paymentRisk: 'low', engagementRisk: 'low' }
  }
}

export async function fetchBusinessHealthAlerts(id: string): Promise<HealthAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/alerts`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error(`Failed to fetch health alerts for ${id}:`, err)
    return []
  }
}

// ─── Business Configuration ───────────────────────────────

export async function fetchBusinessConfiguration(id: string): Promise<BusinessConfiguration> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/configuration`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.data || {
      id,
      name: 'Business',
      settings: {
        requireTwoFactor: false,
        sessionTimeoutMinutes: 60,
        allowedIpRanges: [],
      },
      integrations: [],
    }
  } catch (err) {
    console.error(`Failed to fetch configuration for ${id}:`, err)
    return {
      id,
      name: 'Business',
      settings: {
        requireTwoFactor: false,
        sessionTimeoutMinutes: 60,
        allowedIpRanges: [],
      },
      integrations: [],
    }
  }
}

export async function updateBusinessConfiguration(
  id: string,
  config: Partial<BusinessConfiguration>,
): Promise<void> {
  const response = await fetch(`${API_BASE}/platform/businesses/${id}/configuration`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(config),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to update configuration')
  }
}
