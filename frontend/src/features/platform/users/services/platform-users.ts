import type {
  PlatformUser,
  PlatformUserKpis,
  PlatformUserFilters,
  PlatformUserDetail,
  InvitePlatformUserInput,
} from '../types'

const API_BASE = '/api/v1'

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}`,
  }
}

export async function fetchPlatformUsers(
  filters: PlatformUserFilters = {},
): Promise<{ users: PlatformUser[]; total: number; page: number; perPage: number; totalPages: number }> {
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
    const response = await fetch(`${API_BASE}/platform/users${qs ? `?${qs}` : ''}`, {
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
    console.error('Failed to fetch platform users:', err)
    return {
      users: [],
      total: 0,
      page: reqPage,
      perPage: reqPerPage,
      totalPages: 1,
    }
  }
}

export async function fetchPlatformUserKpis(): Promise<PlatformUserKpis> {
  try {
    const response = await fetch(`${API_BASE}/platform/users/overview`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user KPIs')
    return json.data
  } catch (err) {
    console.error('Failed to fetch platform user KPIs:', err)
    return {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      suspendedUsers: 0,
    }
  }
}

export async function fetchPlatformUserById(id: string): Promise<PlatformUserDetail> {
  try {
    const response = await fetch(`${API_BASE}/platform/users/${id}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user')
    return json.data
  } catch (err) {
    console.error(`Failed to fetch platform user ${id}:`, err)
    return {
      id,
      name: 'User',
      email: '',
      role: 'viewer',
      status: 'active',
      accessScope: 'business',
      permissions: [],
      loginActivity: [],
      recentActivity: [],
    }
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

export async function updatePlatformUserStatus(
  id: string,
  status: 'active' | 'suspended',
): Promise<void> {
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
