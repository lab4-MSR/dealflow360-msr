import type { RiskLevel, UserRole } from './index'

export type QuotationStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'returned'
  | 'rejected'
  | 'sent'
  | 'under_negotiation'
  | 'confirmed'
  | 'accepted'
  | 'expired'
  | 'cancelled'
  | 'archived'

export type ApprovalState =
  | 'not_required'
  | 'pending'
  | 'approved'
  | 'returned'
  | 'rejected'
  | 'expired'

export type NegotiationStatus =
  | 'not_started'
  | 'requested'
  | 'counter_offer'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'closed'

export type InventoryStatus =
  | 'in_stock'
  | 'partial_stock'
  | 'out_of_stock'
  | 'reserved'
  | 'unavailable'

export type FulfillmentStatus =
  | 'not_started'
  | 'ready'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'backordered'
  | 'shipped'
  | 'delivered'

export type BillingType = 'one_time' | 'recurring' | 'mixed'
export type BillingCycle = 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
export type PaymentStatus = 'not_billed' | 'pending' | 'paid' | 'partially_paid' | 'failed' | 'overdue'

export interface QuotationLineItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  category: string
  quantity: number
  unit_price: number
  price_type: 'standard' | 'price_list' | 'custom' | 'override'
  discount_percent: number
  discount_amount: number
  net_price: number
  tax_rate: number
  tax_amount: number
  line_total: number
  cost?: number
  margin_percent?: number
  inventory_status?: InventoryStatus
  available_stock?: number
  is_recurring?: boolean
  billing_cycle?: BillingCycle
}

export interface QuotationPricingSummary {
  subtotal: number
  line_discounts_total: number
  order_discount: number
  order_discount_percent: number
  shipping: number
  tax: number
  grand_total: number
  currency: string
}

export interface ViolatedRule {
  id: string
  rule_name: string
  rule_type: 'customer_tier' | 'category_ceiling' | 'product_ceiling' | 'minimum_margin' | 'deal_size'
  description: string
  severity: 'warning' | 'critical'
  threshold_value: number
  actual_value: number
}

export interface DiscountAnalysisData {
  customer_tier_limit: number
  customer_tier_name: string
  category_limit: number
  category_name: string
  product_limit: number | null
  requested_discount: number
  allowed_discount: number
  excess_discount: number
  excess_discount_amount: number
  governing_rule_name: string
  violated_rules: ViolatedRule[]
  explanation: {
    what: string
    why: string
    impact: string
    next_action: string
  }
}

export interface MarginData {
  revenue: number
  cost: number | null // restricted for roles without financial visibility
  gross_margin: number | null
  margin_percent: number
  target_margin: number
  minimum_margin: number
  margin_impact: 'healthy' | 'warning' | 'critical'
  explanation: string
  baseline_margin: number
  margin_drop_pp: number
}

export interface LineRiskFactor {
  line_id: string
  product_name: string
  risk_score: number
  risk_level: RiskLevel
  reason: string
}

export interface RiskData {
  blended_risk_score: number
  risk_level: RiskLevel
  line_level_risks: LineRiskFactor[]
  aggregate_risk_note: string
  margin_risk: 'healthy' | 'warning' | 'critical'
  customer_risk: 'low' | 'medium' | 'high'
  risk_explanation: {
    why: string
    contributing_factors: string[]
    impact: string
    recommended_action: string
  }
}

export interface RecommendationItem {
  id: string
  type: 'upsell' | 'cross_sell'
  product_id: string
  product_name: string
  sku: string
  unit_price: number
  available_stock: number
  reason: string
  promotion: string | null
  margin_delta: number
  margin_delta_pp: number
  added?: boolean
}

export interface ApprovalChainStep {
  step_number: number
  level_name: string
  approver_role: UserRole
  approver_name: string
  approver_avatar?: string
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'skipped'
  action_timestamp?: string
  comments?: string
  sla_hours: number
  elapsed_time?: string
  is_current?: boolean
}

export interface ApprovalHistoryItem {
  id: string
  actor: string
  actor_role: string
  action: 'submitted' | 'approved' | 'rejected' | 'returned' | 'escalated' | 'invalidated'
  timestamp: string
  level: string
  reason?: string
}

export interface ApprovalData {
  approval_status: ApprovalState
  approval_required: boolean
  approval_required_reason?: string
  current_level: string | null
  current_level_index: number
  total_levels: number
  current_approver: {
    name: string
    role: string
    email?: string
    sla_status: string
    pending_duration: string
  } | null
  approval_chain: ApprovalChainStep[]
  approval_history: ApprovalHistoryItem[]
  rejection_reason?: string | null
  return_reason?: string | null
}

export interface VersionDiffItem {
  field: string
  label: string
  old_value: string | number
  new_value: string | number
  delta?: string | number
  impact_severity?: 'positive' | 'neutral' | 'negative' | 'critical'
}

export interface QuotationVersionComparison {
  base_version: number
  target_version: number
  diffs: VersionDiffItem[]
  risk_recalculated: boolean
  previous_risk: number
  new_risk: number
  re_approval_required: boolean
  re_approval_reason: string
}

export interface NegotiationData {
  negotiation_status: NegotiationStatus
  customer_request: string
  counter_discount: {
    original_percent: number
    requested_percent: number
    current_counter_percent: number
  }
  quantity_change: {
    product_name: string
    old_qty: number
    new_qty: number
    delta: number
  } | null
  price_change: {
    previous_total: number
    new_total: number
    delta: number
  }
  quote_version: string
  version_comparison: QuotationVersionComparison
  risk_recalculation: {
    previous_score: number
    new_score: number
    changed_factors: string[]
  }
  re_approval_status: {
    required: boolean
    invalidated_version: number
    new_approval_version: number
    reason: string
  }
}

export interface WarehouseAllocationItem {
  warehouse_id: string
  warehouse_name: string
  warehouse_code: string
  product_id: string
  product_name: string
  allocated_quantity: number
  available_quantity: number
  shipping_cost: number
  priority: number
}

export interface FulfillmentData {
  inventory_status: InventoryStatus
  warehouse_allocation: WarehouseAllocationItem[]
  warehouse_split: {
    is_split: boolean
    split_details: Array<{ warehouse_name: string; units: number }>
    split_reason: string
  }
  shipment_count: number
  shipping_cost: number
  fulfilled_quantity: number
  ordered_quantity: number
  backordered_quantity: number
  fulfillment_status: FulfillmentStatus
  is_preview: boolean // explicitly separates preview allocation from actual fulfillment
}

export interface RecurringBillingItem {
  product_id: string
  product_name: string
  plan_name: string
  recurring_price: number
  billing_cycle: BillingCycle
  next_billing_date: string
}

export interface OneTimeBillingItem {
  product_id: string
  product_name: string
  amount: number
}

export interface SubscriptionDetail {
  subscription_id: string
  plan: string
  status: 'active' | 'pending' | 'draft' | 'cancelled'
  start_date: string
  renewal_date: string
}

export interface ProrationDetail {
  current_plan: string
  new_plan: string
  remaining_days: number
  used_days: number
  credit: number
  charge: number
  final_adjustment: number
}

export interface InvoiceDetail {
  invoice_number: string
  status: 'draft' | 'pending' | 'paid' | 'partially_paid' | 'failed' | 'overdue'
  amount: number
  due_date: string
  invoice_url?: string
}

export interface BillingData {
  billing_type: BillingType
  one_time_items: OneTimeBillingItem[]
  recurring_items: RecurringBillingItem[]
  billing_cycle: BillingCycle
  subscription: SubscriptionDetail | null
  proration: ProrationDetail | null
  invoice: InvoiceDetail | null
  payment_status: PaymentStatus
}

export type AuditEventCategory =
  | 'created'
  | 'edited'
  | 'discount_changes'
  | 'approval_events'
  | 'customer_events'
  | 'negotiation_events'
  | 'fulfillment_events'
  | 'billing_events'

export interface AuditEventItem {
  id: string
  category: AuditEventCategory
  event_type: string
  title: string
  description: string
  actor: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  timestamp: string
  reason?: string
  metadata?: Record<string, unknown>
}

export interface QuotationOverviewData {
  quote_number: string
  status: QuotationStatus
  currency: string
  version: number
  total_versions: number
  quote_type?: string
  payment_terms: string
  shipping_terms: string
  company_name: string
  customer_id: string
  customer_tier: string
  customer_health: 'healthy' | 'at_risk' | 'churned'
  primary_contact: string
  customer_email: string
  customer_phone: string
  customer_address: string
  price_list: string
  deal_id: string
  deal_name: string
  deal_stage: string
  deal_value: number
  sales_rep_name: string
  sales_rep_id: string
  sales_rep_avatar?: string
  expected_close_date: string
  created_by_name: string
  created_by_role: string
  created_by_avatar?: string
  created_date: string
  expiry_date: string
  remaining_days: number
  is_expired: boolean
  current_version_summary: string
  last_updated_at: string
}

export interface QuotationCompleteDetails {
  id: string
  quote_number: string
  version: number
  total_versions: number
  available_versions: number[]
  status: QuotationStatus
  total_value: number
  currency: string
  overview: QuotationOverviewData
  line_items: QuotationLineItem[]
  pricing: QuotationPricingSummary
  discount_analysis: DiscountAnalysisData
  margin: MarginData
  risk: RiskData
  recommendations: RecommendationItem[]
  approval: ApprovalData
  negotiation: NegotiationData
  fulfillment: FulfillmentData
  billing: BillingData
  audit: AuditEventItem[]
  permissions: {
    can_edit: boolean
    can_validate: boolean
    can_submit_approval: boolean
    can_send_to_customer: boolean
    can_approve: boolean
    can_reject: boolean
    can_return: boolean
    can_create_version: boolean
    can_view_cost: boolean
    can_view_margin: boolean
    can_override_split: boolean
    can_counter_negotiate: boolean
  }
}
