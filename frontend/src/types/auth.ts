export interface AuthUser {
  user_id: string
  email: string
  full_name: string
  role: AuthRole
  business_id: string | null
  business_name: string | null
  customer_id: string | null
  avatar_url: string | null
  permissions: string[]
}

export type AuthRole =
  | 'super_admin'
  | 'business_admin'
  | 'sales_rep'
  | 'sales_manager'
  | 'finance'
  | 'operations'
  | 'customer'

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: AuthUser
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface InvitationDetails {
  token: string
  email: string
  role: string
  business_name: string
  invited_by: string
  expires_at: string
  status: 'pending' | 'expired' | 'accepted'
}

export interface AcceptInvitationRequest {
  token: string
  full_name: string
  password: string
}

export interface VerifyEmailRequest {
  token: string
}

export const ROLE_DASHBOARD_MAP: Record<AuthRole, string> = {
  super_admin: '/platform/dashboard',
  business_admin: '/business-admin/dashboard',
  sales_rep: '/dashboard',
  sales_manager: '/dashboard',
  finance: '/dashboard',
  operations: '/operations',
  customer: '/dashboard',
}

export const ROLE_LABELS: Record<AuthRole, string> = {
  super_admin: 'Super Admin',
  business_admin: 'Business Admin',
  sales_rep: 'Sales Representative',
  sales_manager: 'Sales Manager',
  finance: 'Finance',
  operations: 'Operations',
  customer: 'Customer',
}
