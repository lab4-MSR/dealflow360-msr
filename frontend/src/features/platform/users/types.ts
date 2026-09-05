export type PlatformUserRole = 'super_admin' | 'business_admin' | 'sales_manager' | 'sales_rep' | 'viewer'
export type PlatformUserStatus = 'active' | 'inactive' | 'pending' | 'suspended'

export interface PlatformUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: PlatformUserRole
  businessId?: string
  businessName?: string
  status: PlatformUserStatus
  lastActive?: string
  createdAt: string
  permissions?: string[]
}

export interface PlatformUserKpis {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
}

export interface PlatformUserFilters {
  search?: string
  role?: PlatformUserRole
  businessId?: string
  status?: PlatformUserStatus
  page?: number
  perPage?: number
}

export interface PlatformUserDetail extends PlatformUser {
  phone?: string
  loginActivity?: { timestamp: string; ip?: string; device?: string }[]
  recentActivity?: { id: string; action: string; target: string; timestamp: string }[]
  accessScope: 'platform' | 'business'
}

export interface InvitePlatformUserInput {
  fullName: string
  email: string
  role: PlatformUserRole
  businessId?: string
  message?: string
  expiresInDays?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta: { page: number; per_page: number; total: number; total_pages: number } | null
  error: { code: string; message: string; field?: string; details?: Record<string, unknown> } | null
}
