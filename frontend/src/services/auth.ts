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

const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  'admin@dealflow360.com': {
    password: 'admin123',
    user: {
      user_id: 'usr_demo_001',
      email: 'admin@dealflow360.com',
      full_name: 'Demo Admin',
      role: 'super_admin',
      business_id: null,
      business_name: null,
      customer_id: null,
      avatar_url: null,
      permissions: ['*'],
    },
  },
  'admin@acme.com': {
    password: 'admin123',
    user: {
      user_id: 'usr_demo_002',
      email: 'admin@acme.com',
      full_name: 'Sarah Johnson',
      role: 'business_admin',
      business_id: 'biz_acme_001',
      business_name: 'Acme Corp',
      customer_id: null,
      avatar_url: null,
      permissions: ['deals.manage', 'users.manage', 'reports.view'],
    },
  },
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data)
      return response.data
    } catch {
      const demo = DEMO_USERS[data.email.toLowerCase()]
      if (demo && data.password === demo.password) {
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
    return response.data.data
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
    return response.data.data
  },

  async acceptInvitation(data: AcceptInvitationRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `/auth/invitations/${data.token}/accept`,
      { full_name: data.full_name, password: data.password }
    )
    return response.data
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', data)
  },

  async resendVerification(): Promise<void> {
    await apiClient.post('/auth/resend-verification')
  },
}
