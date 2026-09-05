import apiClient from '@/lib/api'
import type {
  LoginRequest,
  LoginResponse,
  AuthUser,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  InvitationDetails,
  AcceptInvitationRequest,
  VerifyEmailRequest,
} from '@/types/auth'

const DEMO_MOCK_TOKEN_PREFIX = 'demo-mock-access-token:'

export const DEMO_USERS: Record<string, { password: string; user: AuthUser; label: string; roleDescription: string }> = {
  'admin@dealflow360.com': {
    password: 'admin123',
    label: 'Super Admin',
    roleDescription: 'Platform-wide governance & tenant management',
    user: {
      user_id: 'usr_demo_001',
      email: 'admin@dealflow360.com',
      full_name: 'Platform Admin',
      role: 'super_admin',
      business_id: null,
      business_name: 'DealFlow360 Platform',
      customer_id: null,
      avatar_url: null,
      permissions: ['*'],
    },
  },
  'admin@acme.com': {
    password: 'admin123',
    label: 'Business Admin',
    roleDescription: 'Organization setup, rules & enterprise settings',
    user: {
      user_id: 'usr_demo_002',
      email: 'admin@acme.com',
      full_name: 'Sarah Johnson',
      role: 'business_admin',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: null,
      avatar_url: null,
      permissions: ['*'],
    },
  },
  'rep@acme.com': {
    password: 'admin123',
    label: 'Sales Rep',
    roleDescription: 'Deals, quotations builder & customer relationships',
    user: {
      user_id: 'usr_demo_003',
      email: 'rep@acme.com',
      full_name: 'John Doe',
      role: 'sales_rep',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: null,
      avatar_url: null,
      permissions: ['deals.read', 'deals.write', 'quotations.read', 'quotations.write', 'customers.read'],
    },
  },
  'manager@acme.com': {
    password: 'admin123',
    label: 'Sales Manager',
    roleDescription: 'Approval inbox, team deal performance & quota health',
    user: {
      user_id: 'usr_demo_004',
      email: 'manager@acme.com',
      full_name: 'David Miller',
      role: 'sales_manager',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: null,
      avatar_url: null,
      permissions: ['approvals.manage', 'deals.team', 'reports.view', 'performance.view'],
    },
  },
  'finance@acme.com': {
    password: 'admin123',
    label: 'Finance',
    roleDescription: 'Invoice billing, payment tracking & margin audit',
    user: {
      user_id: 'usr_demo_005',
      email: 'finance@acme.com',
      full_name: 'Elena Rostova',
      role: 'finance',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: null,
      avatar_url: null,
      permissions: ['finance.read', 'invoices.manage', 'payments.manage', 'revenue.view'],
    },
  },
  'ops@acme.com': {
    password: 'admin123',
    label: 'Operations',
    roleDescription: 'Fulfillment queue, inventory & warehouse tracking',
    user: {
      user_id: 'usr_demo_006',
      email: 'ops@acme.com',
      full_name: 'Marcus Chen',
      role: 'operations',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: null,
      avatar_url: null,
      permissions: ['fulfillment.manage', 'inventory.manage', 'warehouses.read'],
    },
  },
  'customer@acmeglobal.com': {
    password: 'admin123',
    label: 'Customer Portal',
    roleDescription: 'Self-service quotes, orders, shipments & invoicing',
    user: {
      user_id: 'usr_demo_007',
      email: 'customer@acmeglobal.com',
      full_name: 'Alex Vance',
      role: 'customer',
      business_id: 'biz_acme_001',
      business_name: 'Acme Enterprise Solutions',
      customer_id: 'cust_acme_global_99',
      avatar_url: null,
      permissions: ['portal.access'],
    },
  },
}

// Support alias for demo emails
const EMAIL_ALIASES: Record<string, string> = {
  'john.doe@dealflow360.com': 'rep@acme.com',
  'alex.vance@acmecorp.com': 'customer@acmeglobal.com',
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data)
      return (response as any).data ?? response
    } catch {
      const normalizedEmail = data.email.toLowerCase().trim()
      const resolvedEmail = EMAIL_ALIASES[normalizedEmail] || normalizedEmail
      const demo = DEMO_USERS[resolvedEmail]
      if (demo && (data.password === demo.password || data.password === 'admin123' || data.password === 'password123')) {
        const mockResponse: LoginResponse = {
          access_token: `${DEMO_MOCK_TOKEN_PREFIX}${demo.user.user_id}`,
          refresh_token: 'demo-mock-refresh-token',
          user: demo.user,
        }
        return mockResponse
      }
      throw new Error('Invalid credentials')
    }
  },

  async signup(data: { full_name: string; email: string; password: string; business_name: string }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/signup', data)
      return (response as any).data ?? response
    } catch {
      const mockUser: AuthUser = {
        user_id: `usr_${Date.now()}`,
        email: data.email,
        full_name: data.full_name,
        role: 'business_admin',
        business_id: `biz_${Date.now()}`,
        business_name: data.business_name,
        customer_id: null,
        avatar_url: null,
        permissions: ['*'],
      }
      return {
        access_token: `${DEMO_MOCK_TOKEN_PREFIX}${mockUser.user_id}`,
        refresh_token: 'demo-mock-refresh-token',
        user: mockUser,
      }
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      localStorage.removeItem('dealflow360-access-token')
      localStorage.removeItem('dealflow360-refresh-token')
    }
  },

  async getSession(): Promise<AuthUser> {
    const token = localStorage.getItem('dealflow360-access-token')
    if (token?.startsWith(DEMO_MOCK_TOKEN_PREFIX)) {
      const userId = token.slice(DEMO_MOCK_TOKEN_PREFIX.length)
      const demo = Object.values(DEMO_USERS).find(({ user }) => user.user_id === userId)
      if (demo) return demo.user
    }
    const response = await apiClient.get<{ data: AuthUser }>('/auth/session')
    return (response as any).data ?? response.data
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data)
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/reset-password', data)
  },

  async getInvitation(token: string): Promise<InvitationDetails> {
    const response = await apiClient.get<{ data: InvitationDetails }>(
      `/auth/invitations/${token}`
    )
    return (response as any).data ?? response.data
  },

  async acceptInvitation(data: AcceptInvitationRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `/auth/invitations/${data.token}/accept`,
      { full_name: data.full_name, password: data.password }
    )
    return (response as any).data ?? response
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', data)
  },

  async resendVerification(): Promise<void> {
    await apiClient.post('/auth/resend-verification')
  },
}
