import type { RiskLevel } from '@/types'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical'
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical'

export interface DecisionExplanation {
  what: string
  why: string
  impact: string
  who: string
  urgency: UrgencyLevel
  next_action: string
  when?: string
}

/* 07.1 Intelligence Dashboard */
export interface IntelligenceDashboardData {
  kpis: {
    active_risks: number
    high_risk_deals: number
    recommendations_count: number
    deal_anomalies: number
    critical_alerts: number
  }
  risk_overview: {
    low: number
    medium: number
    high: number
    critical: number
    total: number
  }
  recommendation_overview: {
    upsell_opportunities: number
    cross_sell_opportunities: number
    expected_revenue_impact: number
    expected_margin_impact: number
  }
  deal_health: {
    healthy: number
    at_risk: number
    stalled: number
    critical: number
  }
  anomalies: {
    discount: number
    pricing: number
    approval: number
    fulfillment: number
  }
  recent_insights: DecisionInsightItem[]
}

/* 07.2 & 07.3 Risk Center */
export interface RiskOverviewData {
  kpis: {
    total_deals: number
    low_risk: number
    medium_risk: number
    high_risk: number
    critical_risk: number
  }
  distribution: {
    scores: Array<{ range: string; count: number }>
    by_stage: Array<{ stage: string; count: number; avg_score: number }>
    by_tier: Array<{ tier: string; count: number; high_risk_count: number }>
    by_category: Array<{ category: string; count: number; avg_discount: number }>
  }
  drivers: {
    discount_risk: number
    margin_risk: number
    customer_risk: number
    aggregate_risk: number
    pricing_risk: number
  }
  trends: {
    score_trend: Array<{ date: string; avg_score: number }>
    high_risk_trend: Array<{ date: string; count: number }>
    critical_risk_trend: Array<{ date: string; count: number }>
  }
  attention_deals: HighRiskDealItem[]
}

export interface HighRiskDealItem {
  id: string
  deal_id: string
  deal_name: string
  customer_name: string
  customer_tier: string
  rep_name: string
  total_value: number
  discount_percent: number
  margin_percent: number
  risk_score: number
  risk_level: RiskLevel
  primary_risk: string
  approval_status: string
  created_at: string
}

/* 07.4 Risk Details */
export interface RiskDetailRecord {
  id: string
  quotation_id: string
  deal_id: string
  deal_name: string
  customer_name: string
  customer_tier: string
  risk_score: number
  risk_level: RiskLevel
  primary_risk_driver: string
  explanation: DecisionExplanation
  breakdown: {
    line_risk: number
    customer_risk: number
    category_risk: number
    margin_risk: number
    aggregate_risk: number
  }
  factors: Array<{
    title: string
    severity: RiskLevel
    description: string
    impact_points: number
    source: string
  }>
  approval_impact: {
    approval_required: boolean
    current_level: number
    required_approver: string
    escalation_window_hours: number
    sla_deadline: string
  }
  history: Array<{
    timestamp: string
    previous_score: number
    new_score: number
    change_reason: string
    actor_name: string
  }>
}

/* 07.5, 07.6, 07.7 Recommendations */
export interface RecommendationItem {
  id: string
  type: 'upsell' | 'cross_sell'
  customer_id: string
  customer_name: string
  deal_id: string
  deal_name: string
  current_product_id?: string
  current_product_name?: string
  recommended_product_id: string
  recommended_product_name: string
  recommended_sku: string
  unit_price: number
  confidence_percent: number
  reason: string
  promotion_label?: string
  revenue_delta: number
  margin_delta: number
  margin_percent: number
  minimum_margin_pass: boolean
  is_eligible: boolean
  frequently_bought_together?: string[]
}

export interface RecommendationDetailRecord extends RecommendationItem {
  why_recommended: {
    purchase_history_signal: string
    co_purchase_pattern_signal: string
    customer_profile_signal: string
    promotion_signal?: string
  }
  financial_impact: {
    revenue_delta: number
    cost_delta: number
    margin_delta: number
    projected_gross_margin_percent: number
    minimum_margin_threshold: number
  }
  logic: {
    matching_signals: string[]
    confidence_score: number
    minimum_margin_check: 'PASS' | 'FAIL'
    eligibility_status: 'eligible' | 'ineligible_margin' | 'ineligible_inventory'
    eligibility_reason: string
  }
}

/* 07.8 & 07.9 Deal Health */
export interface DealHealthOverviewData {
  kpis: {
    healthy: number
    at_risk: number
    stalled: number
    critical: number
  }
  health_score_breakdown: {
    overall_health: number
    sales_activity: number
    customer_engagement: number
    approval_progress: number
    discount_risk: number
    margin_health: number
    fulfillment_health: number
  }
  distribution: {
    by_stage: Array<{ stage: string; healthy: number; at_risk: number; stalled: number; critical: number }>
    by_rep: Array<{ rep_name: string; avg_health: number; deal_count: number }>
    by_tier: Array<{ tier: string; avg_health: number }>
    by_value_bracket: Array<{ bracket: string; healthy_percent: number }>
  }
  trends: {
    score_trend: Array<{ date: string; score: number }>
    risk_trend: Array<{ date: string; at_risk_count: number }>
    engagement_trend: Array<{ date: string; activity_index: number }>
  }
  attention_required: StalledDealItem[]
}

export interface StalledDealItem {
  id: string
  deal_name: string
  customer_name: string
  rep_name: string
  stage: string
  deal_value: number
  last_activity_at: string
  stalled_days: number
  health_status: 'stalled' | 'critical' | 'at_risk'
  reason_category: 'customer_inactivity' | 'approval_delay' | 'negotiation_delay' | 'pricing_issue' | 'fulfillment_issue'
  reason_explanation: string
  recommended_action: string
}

/* 07.10 Discount Anomalies */
export interface DiscountAnomalyItem {
  id: string
  deal_id: string
  deal_name: string
  customer_name: string
  sales_rep_name: string
  product_category: string
  discount_percent: number
  allowed_discount_percent: number
  difference_points: number
  severity: AnomalySeverity
  detected_at: string
  explanation: {
    what: string
    why: string
    impact: string
    recommended_action: string
  }
  is_resolved: boolean
  resolved_at?: string
  resolution_note?: string
}

/* 07.11 Delivery Slippage */
export interface DeliverySlippageItem {
  id: string
  order_id: string
  order_number: string
  customer_name: string
  warehouse_name: string
  carrier_name: string
  expected_delivery: string
  current_eta: string
  delay_days: number
  severity: AnomalySeverity
  reason_category: 'inventory_shortage' | 'warehouse_delay' | 'shipping_delay' | 'backorder'
  reason_detail: string
  customer_impact: string
  recommended_actions: Array<'reallocate' | 'expedite' | 'contact_customer' | 'review_fulfillment'>
}

/* 07.12 Decision Insights */
export interface DecisionInsightItem {
  id: string
  title: string
  category: 'risk' | 'discount' | 'margin' | 'approval' | 'fulfillment' | 'billing' | 'customer'
  severity: UrgencyLevel
  explanation: DecisionExplanation
  when_timestamp: string
  related_record_type: 'deal' | 'quote' | 'approval' | 'fulfillment' | 'invoice' | 'customer'
  related_record_id: string
  related_record_url: string
  assignee?: { id: string; name: string }
  is_resolved: boolean
  resolution_comment?: string
}
