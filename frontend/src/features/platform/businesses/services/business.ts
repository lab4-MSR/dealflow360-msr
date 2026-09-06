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

export async function fetchBusinesses(filters: BusinessListFilters = {}): Promise<{ businesses: Business[]; total: number; page: number; perPage: number; totalPages: number }> {
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
      businesses: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return getMockBusinesses(filters)
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
      total: json.data.kpis.totalBusinesses,
      active: json.data.kpis.activeBusinesses,
      suspended: 12,
      pendingSetup: 37,
    }
  } catch {
    return { total: 247, active: 198, suspended: 12, pendingSetup: 37 }
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
  } catch {
    return MOCK_BUSINESS_DETAIL
  }
}

export async function fetchBusinessPerformance(id: string): Promise<BusinessPerformanceKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch performance')
    return json.data.performance || MOCK_BUSINESS_PERFORMANCE
  } catch {
    return MOCK_BUSINESS_PERFORMANCE
  }
}

export async function fetchBusinessActivity(id: string): Promise<BusinessActivity[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch activity')
    return json.data
  } catch {
    return MOCK_BUSINESS_ACTIVITY
  }
}

export async function fetchBusinessDealTrend(id: string): Promise<DealTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/deals`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch deal trend')
    return json.data.trend || MOCK_DEAL_TREND
  } catch {
    return MOCK_DEAL_TREND
  }
}

export async function fetchBusinessRevenueTrend(id: string): Promise<RevenueTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue trend')
    return json.data.trend || MOCK_REVENUE_TREND
  } catch {
    return MOCK_REVENUE_TREND
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

export async function bulkAction(businessIds: string[], action: 'activate' | 'suspend' | 'export'): Promise<void> {
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

const ALL_MOCK_BUSINESSES: Business[] = [
  { id: 'b1', name: 'Apex Distribution Co.', email: 'admin@apexdist.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u1', name: 'John Mitchell', email: 'john@apexdist.com', avatar: '' }, usersCount: 48, dealsCount: 342, revenue: 4872300, createdAt: '2025-11-15T10:00:00Z' },
  { id: 'b2', name: 'Meridian Logistics', email: 'admin@meridianlog.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u2', name: 'Sarah Chen', email: 'sarah@meridianlog.com', avatar: '' }, usersCount: 32, dealsCount: 218, revenue: 4128900, createdAt: '2025-12-03T10:00:00Z' },
  { id: 'b3', name: 'Cascade Enterprises', email: 'admin@cascadeent.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u3', name: 'Michael Park', email: 'michael@cascadeent.com', avatar: '' }, usersCount: 56, dealsCount: 287, revenue: 3567200, createdAt: '2026-01-20T10:00:00Z' },
  { id: 'b4', name: 'Summit Industries', email: 'admin@summitind.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u4', name: 'Emily Torres', email: 'emily@summitind.com', avatar: '' }, usersCount: 28, dealsCount: 156, revenue: 2984500, createdAt: '2026-02-10T10:00:00Z' },
  { id: 'b5', name: 'Pinnacle Trading', email: 'admin@pinnacletrading.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u5', name: 'David Okafor', email: 'david@pinnacletrading.com', avatar: '' }, usersCount: 42, dealsCount: 198, revenue: 2673400, createdAt: '2026-03-05T10:00:00Z' },
  { id: 'b6', name: 'Horizon Supply Chain', email: 'admin@horizonsupply.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u6', name: 'Lisa Wang', email: 'lisa@horizonsupply.com', avatar: '' }, usersCount: 15, dealsCount: 89, revenue: 2345800, createdAt: '2026-03-22T10:00:00Z' },
  { id: 'b7', name: 'Vanguard Solutions', email: 'admin@vanguardsol.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u7', name: 'Robert Kim', email: 'robert@vanguardsol.com', avatar: '' }, usersCount: 22, dealsCount: 134, revenue: 1983200, createdAt: '2026-04-08T10:00:00Z' },
  { id: 'b8', name: 'Sterling Commerce', email: 'admin@sterlingcom.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u8', name: 'James Wright', email: 'james@sterlingcom.com', avatar: '' }, usersCount: 38, dealsCount: 167, revenue: 1768900, createdAt: '2026-04-15T10:00:00Z' },
  { id: 'b9', name: 'Atlas Global Trading', email: 'admin@atlasglobal.com', status: 'pending_setup', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u9', name: 'Anna Petrov', email: 'anna@atlasglobal.com', avatar: '' }, usersCount: 3, dealsCount: 0, revenue: 0, createdAt: '2026-09-01T10:00:00Z' },
  { id: 'b10', name: 'Quick Serve Retail', email: 'admin@quickserve.com', status: 'suspended', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u10', name: 'Alex Rivera', email: 'alex@quickserve.com', avatar: '' }, usersCount: 8, dealsCount: 45, revenue: 124800, createdAt: '2026-01-10T10:00:00Z' },
  { id: 'b11', name: 'Northwind Traders', email: 'admin@northwind.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u11', name: 'Mark Thompson', email: 'mark@northwind.com', avatar: '' }, usersCount: 25, dealsCount: 112, revenue: 1893400, createdAt: '2026-02-28T10:00:00Z' },
  { id: 'b12', name: 'Pacific Rim Imports', email: 'admin@pacificrim.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u12', name: 'Wei Zhang', email: 'wei@pacificrim.com', avatar: '' }, usersCount: 52, dealsCount: 278, revenue: 5342100, createdAt: '2025-10-05T10:00:00Z' },
  { id: 'b13', name: 'Quantum Dynamics Inc.', email: 'admin@quantumdyn.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u13', name: 'Elena Rostova', email: 'elena@quantumdyn.com', avatar: '' }, usersCount: 64, dealsCount: 310, revenue: 6210000, createdAt: '2025-09-12T10:00:00Z' },
  { id: 'b14', name: 'BlueSky Logistics Ltd.', email: 'admin@blueskylog.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u14', name: 'Marcus Brody', email: 'marcus@blueskylog.com', avatar: '' }, usersCount: 30, dealsCount: 180, revenue: 2890000, createdAt: '2025-11-01T10:00:00Z' },
  { id: 'b15', name: 'Vertex Manufacturing', email: 'admin@vertexmfg.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u15', name: 'Clara Oswald', email: 'clara@vertexmfg.com', avatar: '' }, usersCount: 45, dealsCount: 220, revenue: 3780000, createdAt: '2025-12-18T10:00:00Z' },
  { id: 'b16', name: 'Zenith Cloud Solutions', email: 'admin@zenithcloud.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u16', name: 'Liam Foster', email: 'liam@zenithcloud.com', avatar: '' }, usersCount: 36, dealsCount: 195, revenue: 3150000, createdAt: '2026-01-14T10:00:00Z' },
  { id: 'b17', name: 'Omnitech Global', email: 'admin@omnitech.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u17', name: 'Natasha Roman', email: 'natasha@omnitech.com', avatar: '' }, usersCount: 70, dealsCount: 390, revenue: 7450000, createdAt: '2025-08-20T10:00:00Z' },
  { id: 'b18', name: 'Falcon Express Freight', email: 'admin@falconexp.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u18', name: 'Simon Bell', email: 'simon@falconexp.com', avatar: '' }, usersCount: 12, dealsCount: 65, revenue: 890000, createdAt: '2026-03-01T10:00:00Z' },
  { id: 'b19', name: 'Silverline Healthcare', email: 'admin@silverlinehealth.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u19', name: 'Dr. Aris Thorne', email: 'aris@silverlinehealth.com', avatar: '' }, usersCount: 58, dealsCount: 240, revenue: 4920000, createdAt: '2025-10-22T10:00:00Z' },
  { id: 'b20', name: 'Nova Retail Group', email: 'admin@novaretail.com', status: 'suspended', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u20', name: 'Karen Gillan', email: 'karen@novaretail.com', avatar: '' }, usersCount: 24, dealsCount: 110, revenue: 1450000, createdAt: '2026-01-05T10:00:00Z' },
  { id: 'b21', name: 'Titan Heavy Machinery', email: 'admin@titanheavy.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u21', name: 'Arthur Pendelton', email: 'arthur@titanheavy.com', avatar: '' }, usersCount: 50, dealsCount: 215, revenue: 5890000, createdAt: '2025-11-30T10:00:00Z' },
  { id: 'b22', name: 'Pulse Media Networks', email: 'admin@pulsemedia.com', status: 'pending_setup', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u22', name: 'Chloe Vance', email: 'chloe@pulsemedia.com', avatar: '' }, usersCount: 5, dealsCount: 12, revenue: 150000, createdAt: '2026-08-15T10:00:00Z' },
  { id: 'b23', name: 'Solaris Energy Corp', email: 'admin@solarisenergy.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u23', name: 'Lucas Meyer', email: 'lucas@solarisenergy.com', avatar: '' }, usersCount: 62, dealsCount: 320, revenue: 6840000, createdAt: '2025-07-19T10:00:00Z' },
  { id: 'b24', name: 'Beacon Global Trade', email: 'admin@beacontrade.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u24', name: 'Hannah Abbott', email: 'hannah@beacontrade.com', avatar: '' }, usersCount: 29, dealsCount: 142, revenue: 2230000, createdAt: '2026-02-14T10:00:00Z' },
  { id: 'b25', name: 'Nexa Financial Systems', email: 'admin@nexafin.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u25', name: 'Sanjay Kapoor', email: 'sanjay@nexafin.com', avatar: '' }, usersCount: 44, dealsCount: 205, revenue: 4310000, createdAt: '2025-12-08T10:00:00Z' },
  { id: 'b26', name: 'CoreLogic Distribution', email: 'admin@corelogicdist.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u26', name: 'Teresa Mendez', email: 'teresa@corelogicdist.com', avatar: '' }, usersCount: 33, dealsCount: 175, revenue: 2680000, createdAt: '2026-01-25T10:00:00Z' },
  { id: 'b27', name: 'Orion Aerospace Tech', email: 'admin@orionaero.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u27', name: 'Gregory Vance', email: 'gregory@orionaero.com', avatar: '' }, usersCount: 80, dealsCount: 410, revenue: 8920000, createdAt: '2025-06-10T10:00:00Z' },
  { id: 'b28', name: 'PrimeSource Commodities', email: 'admin@primesource.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u28', name: 'Zoe Saldana', email: 'zoe@primesource.com', avatar: '' }, usersCount: 14, dealsCount: 72, revenue: 1120000, createdAt: '2026-03-11T10:00:00Z' },
  { id: 'b29', name: 'AlphaBio Pharmaceuticals', email: 'admin@alphabio.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u29', name: 'Vikram Malhotra', email: 'vikram@alphabio.com', avatar: '' }, usersCount: 55, dealsCount: 260, revenue: 5400000, createdAt: '2025-09-28T10:00:00Z' },
  { id: 'b30', name: 'Frontier Robotics', email: 'admin@frontierrobotics.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u30', name: 'Oliver Queen', email: 'oliver@frontierrobotics.com', avatar: '' }, usersCount: 27, dealsCount: 130, revenue: 2410000, createdAt: '2026-02-01T10:00:00Z' },
  { id: 'b31', name: 'MetroLink Supply Chain', email: 'admin@metrolink.com', status: 'suspended', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u31', name: 'Bruce Banner', email: 'bruce@metrolink.com', avatar: '' }, usersCount: 9, dealsCount: 38, revenue: 420000, createdAt: '2026-01-18T10:00:00Z' },
  { id: 'b32', name: 'Evergreen Foods & Beverages', email: 'admin@evergreenfb.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u32', name: 'Diana Prince', email: 'diana@evergreenfb.com', avatar: '' }, usersCount: 31, dealsCount: 160, revenue: 2750000, createdAt: '2026-02-20T10:00:00Z' },
  { id: 'b33', name: 'Crestview Hospitality Group', email: 'admin@crestviewhg.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Starter', admin: { id: 'u33', name: 'Barry Allen', email: 'barry@crestviewhg.com', avatar: '' }, usersCount: 16, dealsCount: 85, revenue: 1380000, createdAt: '2026-03-15T10:00:00Z' },
  { id: 'b34', name: 'IronClad Security Systems', email: 'admin@ironcladsec.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Enterprise', admin: { id: 'u34', name: 'Clark Kent', email: 'clark@ironcladsec.com', avatar: '' }, usersCount: 49, dealsCount: 230, revenue: 4670000, createdAt: '2025-10-14T10:00:00Z' },
  { id: 'b35', name: 'Velocity Automotive Spares', email: 'admin@velocityspares.com', status: 'active', currency: 'INR', timezone: 'Asia/Kolkata', plan: 'Growth', admin: { id: 'u35', name: 'Hal Jordan', email: 'hal@velocityspares.com', avatar: '' }, usersCount: 35, dealsCount: 188, revenue: 3240000, createdAt: '2026-01-08T10:00:00Z' },
]

function getMockBusinesses(filters: BusinessListFilters): { businesses: Business[]; total: number; page: number; perPage: number; totalPages: number } {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  let filtered = [...ALL_MOCK_BUSINESSES]
  if (filters.search) {
    const q = filters.search.toLowerCase().trim()
    filtered = filtered.filter(b =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.legalName && b.legalName.toLowerCase().includes(q)) ||
      (b.slug && b.slug.toLowerCase().includes(q)) ||
      (b.domain && b.domain.toLowerCase().includes(q)) ||
      (b.admin?.name && b.admin.name.toLowerCase().includes(q)) ||
      (b.admin?.email && b.admin.email.toLowerCase().includes(q))
    )
  }
  if (filters.status && (filters.status as string) !== 'all') {
    filtered = filtered.filter(b => b.status === filters.status)
  }
  if (filters.plan && filters.plan !== 'all') {
    filtered = filtered.filter(b => Boolean(b.plan && b.plan.toLowerCase() === filters.plan?.toLowerCase()))
  }
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / reqPerPage))
  const safePage = Math.min(reqPage, totalPages)
  const start = (safePage - 1) * reqPerPage
  return {
    businesses: filtered.slice(start, start + reqPerPage),
    total,
    page: safePage,
    perPage: reqPerPage,
    totalPages,
  }
}

const MOCK_BUSINESSES = {
  businesses: ALL_MOCK_BUSINESSES.slice(0, 10),
  total: ALL_MOCK_BUSINESSES.length,
  page: 1,
  perPage: 10,
  totalPages: Math.ceil(ALL_MOCK_BUSINESSES.length / 10),
}

const MOCK_BUSINESS_DETAIL: BusinessDetail = {
  id: 'b1',
  name: 'Apex Distribution Co.',
  legalName: 'Apex Distribution Corporation',
  email: 'admin@apexdist.com',
  phone: '+1-555-0123',
  website: 'https://apexdist.com',
  industry: 'Technology',
  status: 'active',
  logo: '',
  primaryColor: '#4f46e5',
  currency: 'INR',
  timezone: 'America/New_York',
  plan: 'Enterprise',
  admin: { id: 'u1', name: 'John Mitchell', email: 'john@apexdist.com', avatar: '' },
  usersCount: 48,
  dealsCount: 342,
  revenue: 487230,
  createdAt: '2025-11-15T10:00:00Z',
  address: {
    line1: '123 Business Ave',
    city: 'New York',
    state: 'NY',
    country: 'US',
    postalCode: '10001',
  },
  subscription: {
    plan: 'Enterprise',
    status: 'active',
    nextBillingDate: '2026-10-15T00:00:00Z',
  },
  health: {
    overallScore: 87,
    systemUsage: 92,
    userActivity: 85,
    dealActivity: 78,
    riskLevel: 'low',
  },
}

const MOCK_BUSINESS_PERFORMANCE: BusinessPerformanceKpis = {
  totalDeals: 342,
  revenue: 487230,
  customers: 89,
  activeUsers: 44,
  conversionRate: 34.2,
}

const MOCK_BUSINESS_ACTIVITY: BusinessActivity[] = [
  { id: 'ba1', actor: 'John Mitchell', action: 'Updated approval rules', target: 'Configuration', timestamp: '2026-09-05T09:15:00Z', type: 'configuration' },
  { id: 'ba2', actor: 'Sarah Lee', action: 'Created quotation', target: 'Q-2026-000892', timestamp: '2026-09-05T08:30:00Z', type: 'deal' },
  { id: 'ba3', actor: 'Admin', action: 'Invited team member', target: 'newuser@apexdist.com', timestamp: '2026-09-04T16:45:00Z', type: 'user' },
  { id: 'ba4', actor: 'Mike Johnson', action: 'Confirmed deal', target: 'Deal #1247', timestamp: '2026-09-04T14:20:00Z', type: 'deal' },
  { id: 'ba5', actor: 'Emily Chen', action: 'Updated business settings', target: 'Configuration', timestamp: '2026-09-04T11:00:00Z', type: 'configuration' },
]

const MOCK_DEAL_TREND: DealTrendPoint[] = [
  { date: '2026-04-01', count: 28, value: 42000 },
  { date: '2026-05-01', count: 32, value: 48000 },
  { date: '2026-06-01', count: 35, value: 52000 },
  { date: '2026-07-01', count: 31, value: 46000 },
  { date: '2026-08-01', count: 38, value: 58000 },
  { date: '2026-09-01', count: 29, value: 44000 },
]

const MOCK_REVENUE_TREND: RevenueTrendPoint[] = [
  { date: '2026-04-01', revenue: 68000 },
  { date: '2026-05-01', revenue: 72000 },
  { date: '2026-06-01', revenue: 81000 },
  { date: '2026-07-01', revenue: 78000 },
  { date: '2026-08-01', revenue: 92000 },
  { date: '2026-09-01', revenue: 85000 },
]

// ─── Business Users ───────────────────────────────────────

export async function fetchBusinessUsers(id: string, filters: BusinessUserFilters = {}): Promise<{ users: BusinessUser[]; total: number; page: number; perPage: number; totalPages: number }> {
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
      users: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return getMockBusinessUsers(filters)
  }
}

export async function fetchBusinessUserKpis(id: string): Promise<BusinessUserKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/users/overview`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user KPIs')
    return json.data
  } catch {
    return MOCK_USER_KPIS
  }
}

// ─── Business Deals ───────────────────────────────────────

export async function fetchBusinessDeals(id: string, filters: BusinessDealFilters = {}): Promise<{ deals: BusinessDeal[]; total: number; page: number; perPage: number; totalPages: number }> {
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
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/deals/list${qs ? `?${qs}` : ''}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch deals')
    return {
      deals: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return getMockBusinessDeals(filters)
  }
}

export async function fetchBusinessDealKpis(id: string): Promise<BusinessDealKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/deals/kpis`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch deal KPIs')
    return json.data
  } catch {
    return MOCK_DEAL_KPIS
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
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue KPIs')
    return json.data
  } catch {
    return MOCK_REVENUE_KPIS
  }
}

export async function fetchBusinessRevenueTrendData(id: string, period: RevenuePeriod): Promise<RevenueTrendData[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/trend?period=${period}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue trend')
    return json.data
  } catch {
    return MOCK_REVENUE_TREND_DATA[period]
  }
}

export async function fetchBusinessRevenueBreakdown(id: string): Promise<RevenueBreakdown> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/breakdown`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue breakdown')
    return json.data
  } catch {
    return MOCK_REVENUE_BREAKDOWN
  }
}

export async function fetchBusinessRevenueByProduct(id: string): Promise<RevenueByProduct[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/by-product`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue by product')
    return json.data
  } catch {
    return MOCK_REVENUE_BY_PRODUCT
  }
}

export async function fetchBusinessRevenueByCustomer(id: string): Promise<RevenueByCustomer[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/by-customer`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue by customer')
    return json.data
  } catch {
    return MOCK_REVENUE_BY_CUSTOMER
  }
}

export async function fetchBusinessRevenueTransactions(id: string, page = 1, perPage = 10): Promise<{ transactions: RevenueTransaction[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(page) || 1)
  const reqPerPage = Math.max(1, Number(perPage) || 10)
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/revenue/transactions?page=${reqPage}&per_page=${reqPerPage}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch transactions')
    return {
      transactions: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || reqPage,
      perPage: json.meta?.per_page || reqPerPage,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return getMockRevenueTransactions(reqPage, reqPerPage)
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
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch usage overview')
    return json.data
  } catch {
    return MOCK_USAGE_OVERVIEW
  }
}

export async function fetchBusinessUserActivity(id: string): Promise<UserActivityData> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/user-activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user activity')
    return json.data
  } catch {
    return MOCK_USER_ACTIVITY
  }
}

export async function fetchBusinessDealUsage(id: string): Promise<DealUsageData> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/deal-usage`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch deal usage')
    return json.data
  } catch {
    return MOCK_DEAL_USAGE
  }
}

export async function fetchBusinessFeatureUsage(id: string): Promise<FeatureUsageItem[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/features`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch feature usage')
    return json.data
  } catch {
    return MOCK_FEATURE_USAGE
  }
}

export async function fetchBusinessUsageTrend(id: string, days = 30): Promise<UsageTrendPoint[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/usage/trend?days=${days}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch usage trend')
    return json.data
  } catch {
    return MOCK_USAGE_TREND
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
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch health score')
    return json.data
  } catch {
    return MOCK_HEALTH_SCORE
  }
}

export async function fetchBusinessActivityHealth(id: string): Promise<BusinessActivityHealth> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/activity`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch activity health')
    return json.data
  } catch {
    return MOCK_ACTIVITY_HEALTH
  }
}

export async function fetchBusinessPerformanceIndicators(id: string): Promise<PerformanceIndicators> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/performance`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch performance indicators')
    return json.data
  } catch {
    return MOCK_PERFORMANCE_INDICATORS
  }
}

export async function fetchBusinessRiskIndicators(id: string): Promise<RiskIndicators> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/risks`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch risk indicators')
    return json.data
  } catch {
    return MOCK_RISK_INDICATORS
  }
}

export async function fetchBusinessHealthAlerts(id: string): Promise<HealthAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/platform/businesses/${id}/health/alerts`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch health alerts')
    return json.data
  } catch {
    return MOCK_HEALTH_ALERTS
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
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch configuration')
    return json.data
  } catch {
    return MOCK_CONFIGURATION
  }
}

export async function updateBusinessConfiguration(id: string, config: Partial<BusinessConfiguration>): Promise<void> {
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

// ─── Mock Data: Users ─────────────────────────────────────

const MOCK_USER_KPIS: BusinessUserKpis = {
  totalUsers: 48,
  activeUsers: 42,
  pendingInvitations: 3,
  inactiveUsers: 3,
}

const ALL_MOCK_BUSINESS_USERS: BusinessUser[] = [
  { id: 'u1', name: 'John Mitchell', email: 'john@apexdist.com', role: 'business_admin', team: 'Executive', status: 'active', lastActive: '2026-09-05T09:15:00Z', joinedAt: '2025-11-15T10:00:00Z' },
  { id: 'u2', name: 'Sarah Lee', email: 'sarah@apexdist.com', role: 'sales_manager', team: 'Sales', status: 'active', lastActive: '2026-09-05T08:30:00Z', joinedAt: '2025-12-01T10:00:00Z' },
  { id: 'u3', name: 'Mike Johnson', email: 'mike@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'active', lastActive: '2026-09-04T16:45:00Z', joinedAt: '2026-01-10T10:00:00Z' },
  { id: 'u4', name: 'Emily Chen', email: 'emily@apexdist.com', role: 'sales_rep', team: 'Operations', status: 'active', lastActive: '2026-09-04T14:20:00Z', joinedAt: '2026-02-15T10:00:00Z' },
  { id: 'u5', name: 'David Park', email: 'david@apexdist.com', role: 'viewer', team: 'Finance', status: 'active', lastActive: '2026-09-03T11:00:00Z', joinedAt: '2026-03-20T10:00:00Z' },
  { id: 'u6', name: 'Rachel Kim', email: 'rachel@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'pending', joinedAt: '2026-09-01T10:00:00Z' },
  { id: 'u7', name: 'Tom Harris', email: 'tom@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'inactive', lastActive: '2026-07-15T10:00:00Z', joinedAt: '2026-01-05T10:00:00Z' },
  { id: 'u8', name: 'Lisa Wang', email: 'lisa@apexdist.com', role: 'sales_manager', team: 'Operations', status: 'active', lastActive: '2026-09-05T07:00:00Z', joinedAt: '2025-12-10T10:00:00Z' },
  { id: 'u9', name: 'Carlos Rodriguez', email: 'carlos@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'active', lastActive: '2026-09-05T06:45:00Z', joinedAt: '2026-02-01T10:00:00Z' },
  { id: 'u10', name: 'Ananya Sharma', email: 'ananya@apexdist.com', role: 'viewer', team: 'Finance', status: 'active', lastActive: '2026-09-04T15:20:00Z', joinedAt: '2026-02-18T10:00:00Z' },
  { id: 'u11', name: 'James Patel', email: 'james.p@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'active', lastActive: '2026-09-04T12:10:00Z', joinedAt: '2026-03-01T10:00:00Z' },
  { id: 'u12', name: 'Sophie Martin', email: 'sophie@apexdist.com', role: 'sales_rep', team: 'Operations', status: 'active', lastActive: '2026-09-03T18:00:00Z', joinedAt: '2026-03-12T10:00:00Z' },
  { id: 'u13', name: 'Kevin Zhang', email: 'kevin@apexdist.com', role: 'sales_manager', team: 'Sales', status: 'active', lastActive: '2026-09-05T09:00:00Z', joinedAt: '2025-11-20T10:00:00Z' },
  { id: 'u14', name: 'Olivia Taylor', email: 'olivia@apexdist.com', role: 'viewer', team: 'Executive', status: 'active', lastActive: '2026-09-04T11:30:00Z', joinedAt: '2026-01-15T10:00:00Z' },
  { id: 'u15', name: 'Daniel Miller', email: 'daniel@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'suspended', lastActive: '2026-08-10T10:00:00Z', joinedAt: '2026-02-10T10:00:00Z' },
  { id: 'u16', name: 'Maya Lin', email: 'maya@apexdist.com', role: 'sales_rep', team: 'Operations', status: 'active', lastActive: '2026-09-05T08:15:00Z', joinedAt: '2026-04-01T10:00:00Z' },
  { id: 'u17', name: 'Robert Vance', email: 'robert.v@apexdist.com', role: 'business_admin', team: 'Executive', status: 'active', lastActive: '2026-09-04T14:00:00Z', joinedAt: '2025-11-15T10:00:00Z' },
  { id: 'u18', name: 'Priya Iyer', email: 'priya@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'active', lastActive: '2026-09-05T10:10:00Z', joinedAt: '2026-04-15T10:00:00Z' },
  { id: 'u19', name: 'Lucas Scott', email: 'lucas.s@apexdist.com', role: 'viewer', team: 'Finance', status: 'pending', joinedAt: '2026-09-02T10:00:00Z' },
  { id: 'u20', name: 'Emma Watson', email: 'emma@apexdist.com', role: 'sales_rep', team: 'Sales', status: 'active', lastActive: '2026-09-04T16:00:00Z', joinedAt: '2026-03-25T10:00:00Z' },
  { id: 'u21', name: 'Alexander Grey', email: 'alex.g@apexdist.com', role: 'sales_manager', team: 'Sales', status: 'active', lastActive: '2026-09-05T07:45:00Z', joinedAt: '2025-12-15T10:00:00Z' },
  { id: 'u22', name: 'Zoe Kravitz', email: 'zoe@apexdist.com', role: 'sales_rep', team: 'Operations', status: 'active', lastActive: '2026-09-03T13:20:00Z', joinedAt: '2026-05-01T10:00:00Z' },
]

function getMockBusinessUsers(filters: BusinessUserFilters = {}): { users: BusinessUser[]; total: number; page: number; perPage: number; totalPages: number } {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  let filtered = [...ALL_MOCK_BUSINESS_USERS]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }
  if (filters.role) {
    filtered = filtered.filter(u => u.role === filters.role)
  }
  if (filters.status) {
    filtered = filtered.filter(u => u.status === filters.status)
  }
  if (filters.team) {
    filtered = filtered.filter(u => u.team === filters.team)
  }
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / reqPerPage))
  const safePage = Math.min(reqPage, totalPages)
  const start = (safePage - 1) * reqPerPage
  return {
    users: filtered.slice(start, start + reqPerPage),
    total,
    page: safePage,
    perPage: reqPerPage,
    totalPages,
  }
}

const MOCK_BUSINESS_USERS = {
  users: ALL_MOCK_BUSINESS_USERS.slice(0, 10),
  total: ALL_MOCK_BUSINESS_USERS.length,
  page: 1,
  perPage: 10,
  totalPages: Math.ceil(ALL_MOCK_BUSINESS_USERS.length / 10),
}

// ─── Mock Data: Deals ─────────────────────────────────────

const MOCK_DEAL_KPIS: BusinessDealKpis = {
  totalDeals: 342,
  openDeals: 67,
  wonDeals: 198,
  lostDeals: 24,
  totalDealValue: 2847593,
}

const ALL_MOCK_BUSINESS_DEALS: BusinessDeal[] = [
  { id: 'd1', name: 'Enterprise License Renewal', customer: 'Acme Corp', salesRep: 'Sarah Lee', value: 125000, risk: 'low', status: 'completed', createdAt: '2026-09-01T10:00:00Z' },
  { id: 'd2', name: 'Cloud Migration Package', customer: 'TechStart Inc', salesRep: 'Mike Johnson', value: 87500, risk: 'medium', status: 'confirmed', createdAt: '2026-08-28T10:00:00Z' },
  { id: 'd3', name: 'Annual Support Contract', customer: 'Global Industries', salesRep: 'Emily Chen', value: 45000, risk: 'low', status: 'approved', createdAt: '2026-08-25T10:00:00Z' },
  { id: 'd4', name: 'Platform Integration', customer: 'DataFlow Systems', salesRep: 'Sarah Lee', value: 156000, risk: 'high', status: 'negotiation', createdAt: '2026-08-20T10:00:00Z' },
  { id: 'd5', name: 'Hardware Procurement', customer: 'BuildTech Solutions', salesRep: 'Mike Johnson', value: 68000, risk: 'low', status: 'pending', createdAt: '2026-08-18T10:00:00Z' },
  { id: 'd6', name: 'Consulting Services', customer: 'Innovate Partners', salesRep: 'Emily Chen', value: 32000, risk: 'medium', status: 'fulfillment', createdAt: '2026-08-15T10:00:00Z' },
  { id: 'd7', name: 'Software Upgrade', customer: 'NetWorks Pro', salesRep: 'Sarah Lee', value: 54000, risk: 'low', status: 'completed', createdAt: '2026-08-10T10:00:00Z' },
  { id: 'd8', name: 'Custom Development', customer: 'Apex Digital', salesRep: 'Mike Johnson', value: 198000, risk: 'critical', status: 'draft', createdAt: '2026-08-05T10:00:00Z' },
  { id: 'd9', name: 'Data Pipeline Overhaul', customer: 'Skyline Corp', salesRep: 'Carlos Rodriguez', value: 92000, risk: 'low', status: 'approved', createdAt: '2026-08-02T10:00:00Z' },
  { id: 'd10', name: 'Multi-Region Cloud Gateway', customer: 'Quantum Tech', salesRep: 'Sophie Martin', value: 215000, risk: 'medium', status: 'negotiation', createdAt: '2026-07-29T10:00:00Z' },
  { id: 'd11', name: 'Security Audit & Compliance', customer: 'FinSecure Bank', salesRep: 'Kevin Zhang', value: 135000, risk: 'low', status: 'completed', createdAt: '2026-07-24T10:00:00Z' },
  { id: 'd12', name: 'Logistics Fleet Tracking Addon', customer: 'FastLane Express', salesRep: 'James Patel', value: 48000, risk: 'low', status: 'confirmed', createdAt: '2026-07-19T10:00:00Z' },
  { id: 'd13', name: 'ERP Master Database Sync', customer: 'OmniGlobal Inc', salesRep: 'Sarah Lee', value: 178000, risk: 'high', status: 'pending', createdAt: '2026-07-14T10:00:00Z' },
  { id: 'd14', name: 'Automated Billing Portal', customer: 'ClearView Media', salesRep: 'Mike Johnson', value: 62000, risk: 'low', status: 'fulfillment', createdAt: '2026-07-10T10:00:00Z' },
  { id: 'd15', name: 'Telecom Infrastructure Upgrade', customer: 'VastNet Comms', salesRep: 'Emily Chen', value: 310000, risk: 'critical', status: 'draft', createdAt: '2026-07-05T10:00:00Z' },
  { id: 'd16', name: 'AI Forecast Module', customer: 'Predictive Labs', salesRep: 'Priya Iyer', value: 89000, risk: 'low', status: 'approved', createdAt: '2026-06-30T10:00:00Z' },
  { id: 'd17', name: 'Retail POS Modernization', customer: 'Urban Mart', salesRep: 'Carlos Rodriguez', value: 110000, risk: 'medium', status: 'confirmed', createdAt: '2026-06-25T10:00:00Z' },
  { id: 'd18', name: 'Supply Chain Sensor Suite', customer: 'AgriCorp Ltd', salesRep: 'Emma Watson', value: 74000, risk: 'low', status: 'completed', createdAt: '2026-06-20T10:00:00Z' },
  { id: 'd19', name: 'Disaster Recovery Warm Site', customer: 'CoreTrust Insurance', salesRep: 'Kevin Zhang', value: 165000, risk: 'high', status: 'negotiation', createdAt: '2026-06-15T10:00:00Z' },
  { id: 'd20', name: 'Customer 360 CRM Integration', customer: 'Zenith Brands', salesRep: 'Sarah Lee', value: 95000, risk: 'low', status: 'approved', createdAt: '2026-06-10T10:00:00Z' },
]

function getMockBusinessDeals(filters: BusinessDealFilters = {}): { deals: BusinessDeal[]; total: number; page: number; perPage: number; totalPages: number } {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  let filtered = [...ALL_MOCK_BUSINESS_DEALS]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q) || d.salesRep.toLowerCase().includes(q))
  }
  if (filters.status) {
    filtered = filtered.filter(d => d.status === filters.status)
  }
  if (filters.risk) {
    filtered = filtered.filter(d => d.risk === filters.risk)
  }
  if (filters.salesRep) {
    filtered = filtered.filter(d => d.salesRep === filters.salesRep)
  }
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / reqPerPage))
  const safePage = Math.min(reqPage, totalPages)
  const start = (safePage - 1) * reqPerPage
  return {
    deals: filtered.slice(start, start + reqPerPage),
    total,
    page: safePage,
    perPage: reqPerPage,
    totalPages,
  }
}

const MOCK_BUSINESS_DEALS = {
  deals: ALL_MOCK_BUSINESS_DEALS.slice(0, 10),
  total: ALL_MOCK_BUSINESS_DEALS.length,
  page: 1,
  perPage: 10,
  totalPages: Math.ceil(ALL_MOCK_BUSINESS_DEALS.length / 10),
}

// ─── Mock Data: Revenue ───────────────────────────────────

const MOCK_REVENUE_KPIS: RevenueKpis = {
  totalRevenue: 487230,
  monthlyRevenue: 85000,
  recurringRevenue: 312400,
  oneTimeRevenue: 174830,
  growth: 18.4,
}

const MOCK_REVENUE_TREND_DATA: Record<RevenuePeriod, RevenueTrendData[]> = {
  monthly: [
    { date: '2026-04-01', revenue: 68000 },
    { date: '2026-05-01', revenue: 72000 },
    { date: '2026-06-01', revenue: 81000 },
    { date: '2026-07-01', revenue: 78000 },
    { date: '2026-08-01', revenue: 92000 },
    { date: '2026-09-01', revenue: 85000 },
  ],
  quarterly: [
    { date: '2025-Q4', revenue: 198000 },
    { date: '2026-Q1', revenue: 221000 },
    { date: '2026-Q2', revenue: 251000 },
    { date: '2026-Q3', revenue: 255000 },
  ],
  yearly: [
    { date: '2024', revenue: 2850000 },
    { date: '2025', revenue: 3642000 },
    { date: '2026', revenue: 2918000 },
  ],
}

const MOCK_REVENUE_BREAKDOWN: RevenueBreakdown = {
  oneTime: 174830,
  subscription: 312400,
  productCategory: [
    { name: 'Enterprise Licenses', revenue: 198000 },
    { name: 'Support Plans', revenue: 114400 },
    { name: 'Professional Services', revenue: 95830 },
    { name: 'Cloud Infrastructure', revenue: 79000 },
  ],
}

const MOCK_REVENUE_BY_PRODUCT: RevenueByProduct[] = [
  { product: 'Enterprise License', revenue: 198000, orders: 42, share: 40.6 },
  { product: 'Support Plan Pro', revenue: 114400, orders: 89, share: 23.5 },
  { product: 'Consulting Hours', revenue: 95830, orders: 156, share: 19.7 },
  { product: 'Cloud Storage', revenue: 79000, orders: 234, share: 16.2 },
]

const MOCK_REVENUE_BY_CUSTOMER: RevenueByCustomer[] = [
  { customer: 'Acme Corp', revenue: 125000, orders: 18, share: 25.7 },
  { customer: 'Global Industries', revenue: 87500, orders: 12, share: 18.0 },
  { customer: 'TechStart Inc', revenue: 68000, orders: 24, share: 14.0 },
  { customer: 'DataFlow Systems', revenue: 54000, orders: 8, share: 11.1 },
  { customer: 'BuildTech Solutions', revenue: 45000, orders: 15, share: 9.2 },
  { customer: 'NetWorks Pro', revenue: 32000, orders: 31, share: 6.6 },
]

const ALL_MOCK_REVENUE_TRANSACTIONS: RevenueTransaction[] = [
  { id: 'txn1', customer: 'Acme Corp', amount: 25000, type: 'Subscription', date: '2026-09-01T10:00:00Z', status: 'completed' },
  { id: 'txn2', customer: 'Global Industries', amount: 12500, type: 'One-Time', date: '2026-08-28T10:00:00Z', status: 'completed' },
  { id: 'txn3', customer: 'TechStart Inc', amount: 8750, type: 'Subscription', date: '2026-08-25T10:00:00Z', status: 'completed' },
  { id: 'txn4', customer: 'DataFlow Systems', amount: 45000, type: 'One-Time', date: '2026-08-20T10:00:00Z', status: 'pending' },
  { id: 'txn5', customer: 'BuildTech Solutions', amount: 6800, type: 'Subscription', date: '2026-08-15T10:00:00Z', status: 'completed' },
  { id: 'txn6', customer: 'Innovate Partners', amount: 18500, type: 'One-Time', date: '2026-08-12T10:00:00Z', status: 'completed' },
  { id: 'txn7', customer: 'NetWorks Pro', amount: 32000, type: 'Subscription', date: '2026-08-10T10:00:00Z', status: 'completed' },
  { id: 'txn8', customer: 'Apex Digital', amount: 9500, type: 'One-Time', date: '2026-08-08T10:00:00Z', status: 'completed' },
  { id: 'txn9', customer: 'Skyline Corp', amount: 14200, type: 'Subscription', date: '2026-08-05T10:00:00Z', status: 'completed' },
  { id: 'txn10', customer: 'Quantum Tech', amount: 52000, type: 'One-Time', date: '2026-08-01T10:00:00Z', status: 'pending' },
  { id: 'txn11', customer: 'FinSecure Bank', amount: 28000, type: 'Subscription', date: '2026-07-28T10:00:00Z', status: 'completed' },
  { id: 'txn12', customer: 'FastLane Express', amount: 11000, type: 'One-Time', date: '2026-07-25T10:00:00Z', status: 'completed' },
  { id: 'txn13', customer: 'OmniGlobal Inc', amount: 64000, type: 'Subscription', date: '2026-07-20T10:00:00Z', status: 'completed' },
  { id: 'txn14', customer: 'ClearView Media', amount: 7800, type: 'One-Time', date: '2026-07-15T10:00:00Z', status: 'completed' },
  { id: 'txn15', customer: 'VastNet Comms', amount: 39500, type: 'Subscription', date: '2026-07-10T10:00:00Z', status: 'completed' },
  { id: 'txn16', customer: 'Predictive Labs', amount: 16500, type: 'One-Time', date: '2026-07-05T10:00:00Z', status: 'failed' },
  { id: 'txn17', customer: 'Urban Mart', amount: 22000, type: 'Subscription', date: '2026-07-01T10:00:00Z', status: 'completed' },
  { id: 'txn18', customer: 'AgriCorp Ltd', amount: 8900, type: 'One-Time', date: '2026-06-28T10:00:00Z', status: 'completed' },
  { id: 'txn19', customer: 'CoreTrust Insurance', amount: 48000, type: 'Subscription', date: '2026-06-25T10:00:00Z', status: 'completed' },
  { id: 'txn20', customer: 'Zenith Brands', amount: 19500, type: 'One-Time', date: '2026-06-20T10:00:00Z', status: 'completed' },
]

function getMockRevenueTransactions(page = 1, perPage = 10): { transactions: RevenueTransaction[]; total: number; page: number; perPage: number; totalPages: number } {
  const reqPage = Math.max(1, Number(page) || 1)
  const reqPerPage = Math.max(1, Number(perPage) || 10)
  const total = ALL_MOCK_REVENUE_TRANSACTIONS.length
  const totalPages = Math.max(1, Math.ceil(total / reqPerPage))
  const safePage = Math.min(reqPage, totalPages)
  const start = (safePage - 1) * reqPerPage
  return {
    transactions: ALL_MOCK_REVENUE_TRANSACTIONS.slice(start, start + reqPerPage),
    total,
    page: safePage,
    perPage: reqPerPage,
    totalPages,
  }
}

const MOCK_REVENUE_TRANSACTIONS = {
  transactions: ALL_MOCK_REVENUE_TRANSACTIONS.slice(0, 10),
  total: ALL_MOCK_REVENUE_TRANSACTIONS.length,
  page: 1,
  perPage: 10,
  totalPages: Math.ceil(ALL_MOCK_REVENUE_TRANSACTIONS.length / 10),
}

// ─── Mock Data: Usage ─────────────────────────────────────

const MOCK_USAGE_OVERVIEW: UsageOverview = {
  activeUsers: 42,
  activeDeals: 67,
  quotations: 124,
  orders: 89,
  apiUsage: 15420,
}

const MOCK_USER_ACTIVITY: UserActivityData = {
  dailyActiveUsers: 28,
  monthlyActiveUsers: 42,
}

const MOCK_DEAL_USAGE: DealUsageData = {
  dealsCreated: 34,
  dealsUpdated: 89,
  dealsCompleted: 22,
}

const MOCK_FEATURE_USAGE: FeatureUsageItem[] = [
  { name: 'Discount Engine', usageCount: 234, activeUsers: 18, percentage: 82 },
  { name: 'Approval Engine', usageCount: 156, activeUsers: 12, percentage: 65 },
  { name: 'Recommendations', usageCount: 89, activeUsers: 8, percentage: 45 },
  { name: 'Fulfillment', usageCount: 67, activeUsers: 6, percentage: 38 },
  { name: 'Billing', usageCount: 45, activeUsers: 4, percentage: 28 },
]

const MOCK_USAGE_TREND: UsageTrendPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
  events: Math.floor(Math.random() * 200) + 100,
  users: Math.floor(Math.random() * 30) + 15,
}))

// ─── Mock Data: Health ────────────────────────────────────

const MOCK_HEALTH_SCORE: HealthScore = {
  score: 87,
  status: 'healthy',
}

const MOCK_ACTIVITY_HEALTH: BusinessActivityHealth = {
  userActivity: { value: 85, status: 'healthy' },
  dealActivity: { value: 78, status: 'healthy' },
  customerActivity: { value: 72, status: 'healthy' },
}

const MOCK_PERFORMANCE_INDICATORS: PerformanceIndicators = {
  dealConversion: 34.2,
  approvalDelay: '2.4 days',
  fulfillmentDelay: '5.1 days',
  paymentIssues: 3,
}

const MOCK_RISK_INDICATORS: RiskIndicators = {
  highRiskDeals: 12,
  discountAnomalies: 7,
  stalledDeals: 18,
}

const MOCK_HEALTH_ALERTS: HealthAlert[] = [
  { id: 'ha1', severity: 'warning', title: 'Stalled deals approaching threshold', description: '18 deals have been in negotiation for over 30 days without activity.', timestamp: '2026-09-05T09:00:00Z' },
  { id: 'ha2', severity: 'informational', title: 'Discount usage elevated', description: 'Discount engine usage increased 15% this month. Review discount rules.', timestamp: '2026-09-04T16:00:00Z' },
  { id: 'ha3', severity: 'critical', title: 'Payment processing delay', description: '3 payments failed processing in the last 7 days.', timestamp: '2026-09-03T12:00:00Z' },
]

// ─── Mock Data: Configuration ─────────────────────────────

const MOCK_CONFIGURATION: BusinessConfiguration = {
  general: {
    businessName: 'Apex Distribution Co.',
    legalName: 'Apex Distribution Corporation',
    email: 'admin@apexdist.com',
    phone: '+1-555-0123',
    website: 'https://apexdist.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    locale: 'en-US',
  },
  branding: {
    logo: '',
    primaryColor: '#4f46e5',
    favicon: '',
    theme: 'light',
  },
  sales: {
    pricingModel: 'standard',
    discountRulesEnabled: true,
    approvalRulesEnabled: true,
  },
  operations: {
    warehouses: 3,
    shippingEnabled: true,
    fulfillmentEnabled: true,
  },
  billing: {
    billingCycle: 'monthly',
    subscriptionPlan: 'Enterprise',
    prorationEnabled: true,
  },
  security: {
    authenticationMethod: 'email_password',
    sessionDuration: '24h',
    mfaRequired: false,
    ipRestriction: '',
  },
}
