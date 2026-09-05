// ============================================================
// FINANCE MODULE TYPES
// Source of Truth: apicontract.md §14, §15, §17, §18
// ============================================================

// ENUMS & STATUS TYPES
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partially_paid' | 'overdue' | 'void'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'
export type BillingCycle = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ApprovalDecision = 'approved' | 'rejected' | 'returned' | 'pending'

// FINANCE DASHBOARD KPIs
export interface FinanceDashboardKpis {
  total_revenue: number
  one_time_revenue: number
  recurring_revenue: number
  outstanding_amount: number
  collected_amount: number
  overdue_amount: number
  high_risk_deals: number
  pending_financial_review: number
  approved_count: number
  rejected_count: number
  sla_breached: number
  total_invoices: number
  paid_invoices: number
  pending_invoices: number
  overdue_invoices: number
  failed_invoices: number
  active_subscriptions: number
  mrr: number
  arr: number
  renewals: number
  cancellations: number
}

export interface RevenueTrendPoint {
  date: string
  revenue: number
  one_time: number
  recurring: number
  growth?: number
}

export interface CollectionTrendPoint {
  date: string
  collected: number
  outstanding: number
  overdue: number
}

export interface FinanceAlert {
  id: string
  type: 'failed_payment' | 'overdue_invoice' | 'high_risk_deal' | 'subscription_issue'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  related_record?: { type: string; id: string }
  created_at: string
}

// HIGH RISK DEALS
export interface RiskDeal {
  id: string
  quotation_id: string
  quote_number: string
  deal_name: string
  deal_value: number
  customer: { id: string; name: string; tier: string }
  sales_rep: { id: string; name: string }
  discount: { requested: number; allowed: number; excess: number }
  margin: { value: number; percentage: number }
  risk_score: number
  risk_level: RiskLevel
  risk_factors: string[]
  submitted_at: string
  sla_deadline: string
  sla_remaining_hours?: number
}

export interface RiskKpis {
  critical: number
  high: number
  medium: number
  pending: number
  sla_breached: number
}

// FINANCIAL REVIEW
export interface FinancialReview {
  id: string
  quotation_id: string
  quote_number: string
  version: number
  deal_name: string
  customer: { id: string; name: string; tier: string }
  sales_rep: { id: string; name: string }
  deal_value: number
  risk: { score: number; level: RiskLevel; factors: RiskFactor[] }
  approval_status: ApprovalDecision
  created_at: string
}

export interface RiskFactor {
  category: 'financial' | 'margin' | 'discount' | 'customer'
  description: string
  impact: 'low' | 'medium' | 'high'
}

export interface FinancialSummary {
  gross_revenue: number
  discount: number
  net_revenue: number
  cost?: number
  gross_margin?: number
  margin_percentage?: number
}

export interface DiscountReview {
  requested_percent: number
  allowed_percent: number
  excess_percentage: number
  impact_amount: number
  violated_rules: string[]
}

export interface PaymentTerms {
  payment_terms: string
  credit_limit: number
  customer_exposure: number
  outstanding_balance: number
  exposure_status: 'healthy' | 'near_limit' | 'exceeded'
}

export interface BillingStructure {
  one_time: BillingLineItem[]
  recurring: RecurringLineItem[]
  billing_cycle?: BillingCycle
  subscription?: { plan_id: string; plan_name: string }
  proration?: ProrationDetails
}

export interface BillingLineItem {
  product_id: string
  name: string
  quantity: number
  unit_price: number
  discount: number
  tax: number
  amount: number
}

export interface RecurringLineItem {
  plan_id: string
  plan_name: string
  quantity: number
  amount: number
  billing_cycle: BillingCycle
}

export interface FinancialImpact {
  revenue_impact: number
  margin_impact: number
  cash_flow_impact: number
  recurring_revenue_impact: number
}

export interface ApprovalHistoryEntry {
  actor: string
  actor_name: string
  action: ApprovalDecision
  reason?: string
  timestamp: string
  version?: number
}

export interface ProrationDetails {
  current_plan: string
  new_plan: string
  remaining_days: number
  used_days: number
  credit: number
  charge: number
  final_adjustment: number
}
