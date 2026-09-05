export type Theme = 'light' | 'dark' | 'system'

export type Status = 'draft' | 'pending' | 'approved' | 'rejected' | 'negotiation' | 'confirmed' | 'fulfillment' | 'backorder' | 'completed' | 'failed'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Tenant {
  id: string
  name: string
  logo?: string
  primaryColor?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  tenantId: string
}

export type UserRole = 'super_admin' | 'business_admin' | 'sales_rep' | 'sales_manager' | 'finance' | 'operations' | 'customer'
