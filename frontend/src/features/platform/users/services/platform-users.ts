import type { PlatformUser, PlatformUserKpis, PlatformUserFilters, PlatformUserDetail, InvitePlatformUserInput } from '../types'

const API_BASE = '/api/v1'

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}`,
  }
}

export async function fetchPlatformUsers(filters: PlatformUserFilters = {}): Promise<{ users: PlatformUser[]; total: number; page: number; perPage: number; totalPages: number }> {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.role) params.set('filter[role]', filters.role)
    if (filters.businessId) params.set('filter[business_id]', filters.businessId)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/platform/users${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch users')
    return { users: json.data, total: json.meta?.total || 0, page: json.meta?.page || reqPage, perPage: json.meta?.per_page || reqPerPage, totalPages: json.meta?.total_pages || 1 }
  } catch {
    return getMockPlatformUsers(filters)
  }
}

export async function fetchPlatformUserKpis(): Promise<PlatformUserKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/users/overview`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user KPIs')
    return json.data
  } catch {
    return MOCK_PLATFORM_USER_KPIS
  }
}

export async function fetchPlatformUserById(id: string): Promise<PlatformUserDetail> {
  try {
    const response = await fetch(`${API_BASE}/platform/users/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user')
    return json.data
  } catch {
    return MOCK_PLATFORM_USER_DETAIL
  }
}

export async function invitePlatformUser(input: InvitePlatformUserInput): Promise<void> {
  const response = await fetch(`${API_BASE}/platform/users/invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to invite user')
  }
}

export async function updatePlatformUserStatus(id: string, status: 'active' | 'suspended'): Promise<void> {
  const response = await fetch(`${API_BASE}/platform/users/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const json = await response.json()
    throw new Error(json.error?.message || 'Failed to update user')
  }
}

const MOCK_PLATFORM_USER_KPIS: PlatformUserKpis = { totalUsers: 3842, activeUsers: 3215, pendingUsers: 186, suspendedUsers: 441 }

const ALL_MOCK_PLATFORM_USERS: PlatformUser[] = [
  { id: 'pu1', name: 'John Mitchell', email: 'john@apexdist.com', role: 'super_admin', status: 'active', businessName: 'Apex Distribution Co.', lastActive: '2026-09-05T09:15:00Z', createdAt: '2025-11-15T10:00:00Z' },
  { id: 'pu2', name: 'Sarah Chen', email: 'sarah@meridianlog.com', role: 'business_admin', businessId: 'b2', businessName: 'Meridian Logistics', status: 'active', lastActive: '2026-09-05T08:30:00Z', createdAt: '2025-12-03T10:00:00Z' },
  { id: 'pu3', name: 'Michael Park', email: 'michael@cascadeent.com', role: 'business_admin', businessId: 'b3', businessName: 'Cascade Enterprises', status: 'active', lastActive: '2026-09-04T16:45:00Z', createdAt: '2026-01-20T10:00:00Z' },
  { id: 'pu4', name: 'Emily Torres', email: 'emily@summitind.com', role: 'sales_manager', businessId: 'b4', businessName: 'Summit Industries', status: 'active', lastActive: '2026-09-04T14:20:00Z', createdAt: '2026-02-10T10:00:00Z' },
  { id: 'pu5', name: 'David Okafor', email: 'david@pinnacletrading.com', role: 'business_admin', businessId: 'b5', businessName: 'Pinnacle Trading', status: 'active', lastActive: '2026-09-03T11:00:00Z', createdAt: '2026-03-05T10:00:00Z' },
  { id: 'pu6', name: 'Lisa Wang', email: 'lisa@horizonsupply.com', role: 'sales_rep', businessId: 'b6', businessName: 'Horizon Supply Chain', status: 'active', lastActive: '2026-09-05T07:00:00Z', createdAt: '2026-03-22T10:00:00Z' },
  { id: 'pu7', name: 'Robert Kim', email: 'robert@vanguardsol.com', role: 'viewer', businessId: 'b7', businessName: 'Vanguard Solutions', status: 'pending', createdAt: '2026-04-08T10:00:00Z' },
  { id: 'pu8', name: 'James Wright', email: 'james@sterlingcom.com', role: 'sales_rep', businessId: 'b8', businessName: 'Sterling Commerce', status: 'inactive', lastActive: '2026-07-15T10:00:00Z', createdAt: '2026-04-15T10:00:00Z' },
  { id: 'pu9', name: 'Elena Rostova', email: 'elena@quantumdyn.com', role: 'business_admin', businessId: 'b13', businessName: 'Quantum Dynamics Inc.', status: 'active', lastActive: '2026-09-05T08:00:00Z', createdAt: '2025-09-12T10:00:00Z' },
  { id: 'pu10', name: 'Marcus Brody', email: 'marcus@blueskylog.com', role: 'sales_manager', businessId: 'b14', businessName: 'BlueSky Logistics Ltd.', status: 'active', lastActive: '2026-09-04T17:10:00Z', createdAt: '2025-11-01T10:00:00Z' },
  { id: 'pu11', name: 'Clara Oswald', email: 'clara@vertexmfg.com', role: 'business_admin', businessId: 'b15', businessName: 'Vertex Manufacturing', status: 'active', lastActive: '2026-09-05T10:30:00Z', createdAt: '2025-12-18T10:00:00Z' },
  { id: 'pu12', name: 'Liam Foster', email: 'liam@zenithcloud.com', role: 'sales_rep', businessId: 'b16', businessName: 'Zenith Cloud Solutions', status: 'active', lastActive: '2026-09-03T16:00:00Z', createdAt: '2026-01-14T10:00:00Z' },
  { id: 'pu13', name: 'Natasha Roman', email: 'natasha@omnitech.com', role: 'super_admin', status: 'active', businessName: 'Omnitech Global', lastActive: '2026-09-05T11:00:00Z', createdAt: '2025-08-20T10:00:00Z' },
  { id: 'pu14', name: 'Simon Bell', email: 'simon@falconexp.com', role: 'viewer', businessId: 'b18', businessName: 'Falcon Express Freight', status: 'pending', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'pu15', name: 'Dr. Aris Thorne', email: 'aris@silverlinehealth.com', role: 'business_admin', businessId: 'b19', businessName: 'Silverline Healthcare', status: 'active', lastActive: '2026-09-04T12:45:00Z', createdAt: '2025-10-22T10:00:00Z' },
  { id: 'pu16', name: 'Karen Gillan', email: 'karen@novaretail.com', role: 'sales_manager', businessId: 'b20', businessName: 'Nova Retail Group', status: 'suspended', lastActive: '2026-08-20T10:00:00Z', createdAt: '2026-01-05T10:00:00Z' },
  { id: 'pu17', name: 'Arthur Pendelton', email: 'arthur@titanheavy.com', role: 'business_admin', businessId: 'b21', businessName: 'Titan Heavy Machinery', status: 'active', lastActive: '2026-09-05T09:40:00Z', createdAt: '2025-11-30T10:00:00Z' },
  { id: 'pu18', name: 'Chloe Vance', email: 'chloe@pulsemedia.com', role: 'viewer', businessId: 'b22', businessName: 'Pulse Media Networks', status: 'pending', createdAt: '2026-08-15T10:00:00Z' },
  { id: 'pu19', name: 'Lucas Meyer', email: 'lucas@solarisenergy.com', role: 'sales_rep', businessId: 'b23', businessName: 'Solaris Energy Corp', status: 'active', lastActive: '2026-09-04T15:20:00Z', createdAt: '2025-07-19T10:00:00Z' },
  { id: 'pu20', name: 'Hannah Abbott', email: 'hannah@beacontrade.com', role: 'sales_manager', businessId: 'b24', businessName: 'Beacon Global Trade', status: 'active', lastActive: '2026-09-05T08:15:00Z', createdAt: '2026-02-14T10:00:00Z' },
  { id: 'pu21', name: 'Sanjay Kapoor', email: 'sanjay@nexafin.com', role: 'business_admin', businessId: 'b25', businessName: 'Nexa Financial Systems', status: 'active', lastActive: '2026-09-05T10:00:00Z', createdAt: '2025-12-08T10:00:00Z' },
  { id: 'pu22', name: 'Teresa Mendez', email: 'teresa@corelogicdist.com', role: 'sales_rep', businessId: 'b26', businessName: 'CoreLogic Distribution', status: 'active', lastActive: '2026-09-04T13:30:00Z', createdAt: '2026-01-25T10:00:00Z' },
  { id: 'pu23', name: 'Gregory Vance', email: 'gregory@orionaero.com', role: 'super_admin', status: 'active', businessName: 'Orion Aerospace Tech', lastActive: '2026-09-05T12:00:00Z', createdAt: '2025-06-10T10:00:00Z' },
  { id: 'pu24', name: 'Zoe Saldana', email: 'zoe@primesource.com', role: 'viewer', businessId: 'b28', businessName: 'PrimeSource Commodities', status: 'active', lastActive: '2026-09-03T10:00:00Z', createdAt: '2026-03-11T10:00:00Z' },
]

function getMockPlatformUsers(filters: PlatformUserFilters = {}): { users: PlatformUser[]; total: number; page: number; perPage: number; totalPages: number } {
  const reqPage = Math.max(1, Number(filters.page) || 1)
  const reqPerPage = Math.max(1, Number(filters.perPage) || 10)
  let filtered = [...ALL_MOCK_PLATFORM_USERS]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.businessName && u.businessName.toLowerCase().includes(q))
    )
  }
  if (filters.role) {
    filtered = filtered.filter(u => u.role === filters.role)
  }
  if (filters.status) {
    filtered = filtered.filter(u => u.status === filters.status)
  }
  if (filters.businessId) {
    filtered = filtered.filter(u => u.businessId === filters.businessId)
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

const MOCK_PLATFORM_USERS = {
  users: ALL_MOCK_PLATFORM_USERS.slice(0, 10),
  total: ALL_MOCK_PLATFORM_USERS.length,
  page: 1,
  perPage: 10,
  totalPages: Math.ceil(ALL_MOCK_PLATFORM_USERS.length / 10),
}

const MOCK_PLATFORM_USER_DETAIL: PlatformUserDetail = {
  id: 'pu1',
  name: 'John Mitchell',
  email: 'john@apexdist.com',
  role: 'super_admin',
  status: 'active',
  businessName: 'Apex Distribution Co.',
  lastActive: '2026-09-05T09:15:00Z',
  createdAt: '2025-11-15T10:00:00Z',
  accessScope: 'platform',
  permissions: ['businesses.manage', 'users.manage', 'settings.manage', 'audit.view', 'analytics.view'],
  loginActivity: [
    { timestamp: '2026-09-05T09:15:00Z', ip: '192.168.1.100', device: 'Chrome on macOS' },
    { timestamp: '2026-09-04T08:30:00Z', ip: '192.168.1.100', device: 'Chrome on macOS' },
  ],
  recentActivity: [
    { id: 'ra1', action: 'Updated platform settings', target: 'Security Configuration', timestamp: '2026-09-05T09:15:00Z' },
    { id: 'ra2', action: 'Approved business registration', target: 'Atlas Global Trading', timestamp: '2026-09-04T16:00:00Z' },
  ],
}
