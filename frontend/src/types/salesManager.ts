import type { RiskLevel } from './index'

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type ApprovalPriority = 'urgent' | 'high' | 'medium' | 'normal'
export type ApprovalDecision = 'approved' | 'rejected' | 'returned'
export type DealStage = 'discovery' | 'proposal' | 'negotiation' | 'approval' | 'closed_won' | 'closed_lost'
export type HealthStatus = 'healthy' | 'at_risk' | 'stalled' | 'critical'

export interface CustomerContext {
  id: string
  name: string
  tier: CustomerTier
  industry?: string
  lifetime_value: number
  open_deals: number
  payment_rating: 'excellent' | 'good' | 'fair' | 'poor'
  discount_history_avg: number
  contact_name: string
  contact_email: string
}

export interface RepSummary {
  id: string
  name: string
  email: string
  avatar?: string
  team: string
  quota?: number
  quota_attainment_percent?: number
}

export interface ApprovalLineItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  category: string
  quantity: number
  unit_price: number
  list_price: number
  requested_discount_percent: number
  tier_ceiling_percent: number
  category_ceiling_percent: number
  product_ceiling_percent?: number | null
  allowed_discount_percent: number
  excess_discount_percent: number
  net_price: number
  line_total: number
  cost: number
  margin_percent: number
  line_risk_score: number
  violation_reasons: string[]
  discount_percent?: number
  max_allowed_discount?: number
  net_total?: number
}

export interface ApprovalDiscountAnalysis {
  what: string
  why: string
  impact: string
  next_action: string
  revenue_delta: number
  margin_delta: number
}

export interface ApprovalRiskBreakdown {
  blended_score: number
  level: RiskLevel
  line_risks: Array<{
    line_id: string
    product_name: string
    score: number
    reason: string
  }>
  margin_risk: 'low' | 'medium' | 'high'
  customer_risk: 'low' | 'medium' | 'high'
  aggregate_note: string
}

export interface ApprovalBusinessImpact {
  revenue_delta: number
  gross_profit_delta: number
  commission_impact: number
  split_fulfillment_required: boolean
  delivery_eta_days: number
}

export interface ApprovalAiRecommendation {
  id: string
  type: 'approval_condition' | 'counter_recommendation' | 'risk_mitigation'
  text: string
  suggested_action: string
  expected_outcome: string
  confidence?: number
  recommendation?: string
}

export interface ApprovalStepItem {
  step_number: number
  role: string
  role_display: string
  assignee_name: string
  status: 'completed' | 'in_progress' | 'pending' | 'skipped' | 'approved' | string
  decision: ApprovalDecision | null
  decided_at: string | null
  sla_hours: number
  comments: string | null
  level?: number | string
  role_name?: string
}

export interface VersionChangeItem {
  field: string
  old_value: string
  new_value: string
  delta: string
}

export interface ApprovalQueueItem {
  id: string
  quotation_id: string
  quote_number: string
  version: number
  deal_id: string
  deal_name: string
  customer: CustomerContext
  rep: RepSummary
  deal_value: number
  subtotal: number
  net_price: number
  currency: string
  requested_discount_percent: number
  allowed_discount_percent: number
  excess_discount_percent: number
  margin_percent: number
  target_margin_percent: number
  blended_risk_score: number
  risk_level: RiskLevel
  status: 'pending' | 'approved' | 'rejected' | 'returned'
  approval_level: 'sales_manager' | 'finance' | 'sales_manager_then_finance'
  current_step: number
  total_steps: number
  sla_expires_at: string
  created_at: string
  submitted_at: string
  priority: ApprovalPriority
  rep_notes: string
  lines_count: number
}

export interface ApprovalDetailData extends ApprovalQueueItem {
  total_value?: number
  sla_deadline?: string
  sla_breached?: boolean
  reasons?: string[]
  lines: ApprovalLineItem[]
  discount_analysis: ApprovalDiscountAnalysis
  risk_breakdown: ApprovalRiskBreakdown
  business_impact: ApprovalBusinessImpact
  recommendations: ApprovalAiRecommendation[]
  approval_chain: ApprovalStepItem[]
  version_history: {
    current_version: number
    previous_version: number | null
    changes: VersionChangeItem[]
    revision_reason?: string
  }
}

export interface ApprovalHistoryItem {
  id: string
  approval_id: string
  quotation_id: string
  quote_number: string
  deal_name: string
  customer_name: string
  customer_tier: CustomerTier
  rep_name: string
  deal_value: number
  total_value?: number
  currency: string
  discount_percent: number
  margin_percent: number
  risk_score: number
  risk_level: RiskLevel
  decision: ApprovalDecision
  decided_by: string
  decided_at: string
  sla_hours_taken: number
  sla_allocated_hours: number
  sla_status: 'met' | 'breached'
  reason_or_notes: string
  comment?: string
  step_level: string
}

export interface CoachingNote {
  id: string
  author_name: string
  author_role: string
  text: string
  created_at: string
}

export interface TeamDeal {
  id: string
  title: string
  name?: string
  customer?: string
  rep?: string
  total_value?: number
  win_probability?: number
  expected_close?: string
  active_quotation_id?: string
  customer_id: string
  customer_name: string
  customer_tier: CustomerTier
  rep_id: string
  rep_name: string
  rep_avatar?: string
  team_name: string
  stage: DealStage
  deal_value: number
  currency: string
  expected_close_date: string
  created_at: string
  health_score: number
  health_status: HealthStatus
  risk_level: RiskLevel
  days_in_stage: number
  last_activity: string
  linked_quotations_count: number
  active_quote_number?: string
  coaching_notes?: CoachingNote[]
  deal_summary?: string
  target_products?: string[]
}

export interface DealTimelineEvent {
  id: string
  deal_id: string
  title: string
  description: string
  category: 'milestone' | 'approval' | 'quotation' | 'customer' | 'system'
  event_type?: string
  timestamp: string
  actor: {
    name: string
    role: string
    avatar?: string
  }
  metadata?: Record<string, any>
}

export interface TeamPerformanceRep {
  rep_id: string
  id?: string
  name: string
  email: string
  avatar?: string
  team: string
  quota: number
  closed_revenue: number
  closed_amount?: number
  attainment_percent: number
  active_pipeline: number
  pipeline_amount?: number
  open_deals_count: number
  win_rate_percent: number
  win_rate?: number
  avg_discount_percent: number
  avg_discount?: number
  discount_violations_count: number
  stalled_deals_count: number
  health_index: number
  trend_direction: 'up' | 'down' | 'neutral'
}

export interface DealHealthFactors {
  sales_activity: number
  customer_engagement: number
  approval_progress: number
  discount_risk: number
  margin_health: number
  fulfillment_health: number
}

export interface FlaggedDealItem {
  id: string
  name: string
  customer_name: string
  rep_name: string
  value: number
  status: string
  reasons: string[]
}

export interface DealHealthOverview {
  healthy_count: number
  at_risk_count: number
  stalled_count: number
  critical_count: number
  counts?: { healthy: number; at_risk: number; stalled: number; critical: number }
  avg_health_score?: number
  factors?: DealHealthFactors
  discount_anomalies?: DiscountAnomaly[]
  stalled_deals?: StalledDeal[]
  delivery_slippage?: DeliverySlippage[]
  flagged_deals: FlaggedDealItem[]
}

export interface DiscountAnomaly {
  id: string
  deal_id: string
  deal_name: string
  customer: string
  rep: string
  discount_percent: number
  allowed_percent: number
  excess_percent: number
  severity: RiskLevel
  detected_at: string
  explanation: {
    what: string
    why: string
    impact: string
    next_action: string
  }
}

export interface StalledDeal {
  id: string
  deal_id: string
  deal_name: string
  customer: string
  rep: string
  stage: DealStage
  days_stalled: number
  deal_value: number
  reason: 'customer_inactivity' | 'approval_delay' | 'negotiation_delay' | 'pricing_issue' | 'fulfillment_issue'
  reason_display: string
  last_touch: string
}

export interface DeliverySlippage {
  id: string
  deal_id: string
  order_id: string
  customer: string
  warehouse: string
  expected_delivery: string
  current_eta: string
  delay_days: number
  severity: RiskLevel
  reason: 'inventory_shortage' | 'warehouse_delay' | 'shipping_delay' | 'backorder'
  reason_display: string
}

export interface DecisionInsight {
  id: string
  title: string
  category: 'discount' | 'approval' | 'margin' | 'stalled_deal' | 'sla'
  severity: 'low' | 'medium' | 'high' | 'critical'
  what: string
  why: string
  impact: string
  who: string
  when: string
  next_action: string
  target_link?: string
  action_label?: string
}

export interface SalesManagerDashboardKpis {
  total_team_deals: number
  team_pipeline_value: number
  team_win_rate: number
  deals_requiring_approval: number
  team_discount_variance: number
  team_margin_health: number
  stalled_deals_count: number
  sla_breach_risk_count: number
  // Approval sub-KPIs
  avg_approval_time_hours: number
  approval_rate_percent: number
  rejection_rate_percent: number
  return_rate_percent: number
  // Trends
  pipeline_trend_percent: number
  win_rate_trend_percent: number
}

export interface ScheduledReportConfig {
  id?: string
  report_type: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week?: string
  time: string
  recipients: string[]
  format: 'pdf' | 'xlsx' | 'csv'
  status: 'active' | 'paused'
}
