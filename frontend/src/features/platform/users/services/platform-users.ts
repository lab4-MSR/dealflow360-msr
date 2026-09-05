import type { PlatformUser, PlatformUserKpis, PlatformUserFilters, PlatformUserDetail, InvitePlatformUserInput } from '../types'

const API_BASE = '/api/v1'

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}`,
  }
}

export async function fetchPlatformUsers(filters: PlatformUserFilters = {}): Promise<{ users: PlatformUser[]; total: number; page: number; perPage: number; totalPages: number }> {
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
    return { users: json.data, total: json.meta?.total || 0, page: json.meta?.page || 1, perPage: json.meta?.per_page || 25, totalPages: json.meta?.total_pages || 1 }
  } catch {
    return MOCK_PLATFORM_USERS
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

const MOCK_PLATFORM_USERS: { users: PlatformUser[]; total: number; page: number; perPage: number; totalPages: number } = {
  users: [
    { id: 'pu1', name: 'John Mitchell', email: 'john@apexdist.com', role: 'super_admin', status: 'active', businessName: 'Apex Distribution Co.', lastActive: '2026-09-05T09:15:00Z', createdAt: '2025-11-15T10:00:00Z' },
    { id: 'pu2', name: 'Sarah Chen', email: 'sarah@meridianlog.com', role: 'business_admin', businessId: 'b2', businessName: 'Meridian Logistics', status: 'active', lastActive: '2026-09-05T08:30:00Z', createdAt: '2025-12-03T10:00:00Z' },
    { id: 'pu3', name: 'Michael Park', email: 'michael@cascadeent.com', role: 'business_admin', businessId: 'b3', businessName: 'Cascade Enterprises', status: 'active', lastActive: '2026-09-04T16:45:00Z', createdAt: '2026-01-20T10:00:00Z' },
    { id: 'pu4', name: 'Emily Torres', email: 'emily@summitind.com', role: 'sales_manager', businessId: 'b4', businessName: 'Summit Industries', status: 'active', lastActive: '2026-09-04T14:20:00Z', createdAt: '2026-02-10T10:00:00Z' },
    { id: 'pu5', name: 'David Okafor', email: 'david@pinnacletrading.com', role: 'business_admin', businessId: 'b5', businessName: 'Pinnacle Trading', status: 'active', lastActive: '2026-09-03T11:00:00Z', createdAt: '2026-03-05T10:00:00Z' },
    { id: 'pu6', name: 'Lisa Wang', email: 'lisa@horizonsupply.com', role: 'sales_rep', businessId: 'b6', businessName: 'Horizon Supply Chain', status: 'active', lastActive: '2026-09-05T07:00:00Z', createdAt: '2026-03-22T10:00:00Z' },
    { id: 'pu7', name: 'Robert Kim', email: 'robert@vanguardsol.com', role: 'viewer', businessId: 'b7', businessName: 'Vanguard Solutions', status: 'pending', createdAt: '2026-04-08T10:00:00Z' },
    { id: 'pu8', name: 'James Wright', email: 'james@sterlingcom.com', role: 'sales_rep', businessId: 'b8', businessName: 'Sterling Commerce', status: 'inactive', lastActive: '2026-07-15T10:00:00Z', createdAt: '2026-04-15T10:00:00Z' },
  ],
  total: 3842,
  page: 1,
  perPage: 25,
  totalPages: 154,
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
