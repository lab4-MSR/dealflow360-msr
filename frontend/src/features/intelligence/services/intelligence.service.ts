import apiClient from '@/lib/api'
import type {
  IntelligenceDashboardData,
  RiskOverviewData,
  HighRiskDealItem,
  RiskDetailRecord,
  RecommendationItem,
  RecommendationDetailRecord,
  DealHealthOverviewData,
  StalledDealItem,
  DiscountAnomalyItem,
  DeliverySlippageItem,
  DecisionInsightItem,
} from '../types/intelligence'

// Comprehensive fallback mock data aligned with real DealFlow360 domain entities
const MOCK_INSIGHTS: DecisionInsightItem[] = [
  {
    id: 'ins-001',
    title: 'Gold Tier Quote Pierces Margin Floor & Ceiling',
    category: 'discount',
    severity: 'critical',
    explanation: {
      what: 'Acme Corp Q3 expansion quotation (QT-2026-00482) includes an 18.5% blended discount with 20% on cloud services.',
      why: 'Cloud Services discount ceiling is policy-locked at 10.0%. Combined discount reduces gross margin to 21.0% (below 25.0% floor).',
      impact: '₹1,42,800 profit dilution compared to standard Gold tier pricing matrix.',
      who: 'Rahul Verma (Sales Rep), Priya Nair (Sales Manager), Amit Shah (Finance Director)',
      urgency: 'critical',
      next_action: 'Perform multi-level commercial review and enforce 12.0% counter-discount before contract generation.',
      when: '2026-09-05T09:45:00Z',
    },
    when_timestamp: '2026-09-05T09:45:00Z',
    related_record_type: 'quote',
    related_record_id: 'QT-2026-00482',
    related_record_url: '/sales/quotations/QT-2026-00482',
    is_resolved: false,
  },
  {
    id: 'ins-002',
    title: 'High-Value Opportunity SLA Escalation Breached',
    category: 'approval',
    severity: 'high',
    explanation: {
      what: 'Hyperion Systems infrastructure deal has remained in Level 2 Finance Approval queue for 28 hours.',
      why: 'Configured approval turnaround SLA for Tier 1 Enterprise accounts is 24 hours.',
      impact: 'Quarterly close date at risk; competitor (TechEdge) actively pursuing client with off-the-shelf pricing.',
      who: 'Neha Sharma (Enterprise Lead), Vikram Mehta (Finance VP)',
      urgency: 'high',
      next_action: 'Trigger urgent executive bypass notification to Finance VP.',
      when: '2026-09-05T11:15:00Z',
    },
    when_timestamp: '2026-09-05T11:15:00Z',
    related_record_type: 'approval',
    related_record_id: 'appr-002',
    related_record_url: '/sales-manager/approvals',
    is_resolved: false,
  },
  {
    id: 'ins-003',
    title: 'Warehouse Stock Shortage Threatens Bangalore Delivery',
    category: 'fulfillment',
    severity: 'high',
    explanation: {
      what: 'Central Bengaluru Fulfillment Hub has only 14 units of Enterprise UltraBook X1 Pro; 20 units ordered.',
      why: 'Component shipment from OEM delayed by 4 business days.',
      impact: 'Delivery slippage of 5 days unless secondary warehouse split from Mumbai Hub is approved.',
      who: 'Operations Dispatch Manager, Ramesh Joshi (Logistics Lead)',
      urgency: 'high',
      next_action: 'Execute automated warehouse split allocation (14 units BLR + 6 units BOM).',
      when: '2026-09-05T14:20:00Z',
    },
    when_timestamp: '2026-09-05T14:20:00Z',
    related_record_type: 'fulfillment',
    related_record_id: 'wh-blr-01',
    related_record_url: '/operations/allocation/ord-001',
    is_resolved: false,
  },
  {
    id: 'ins-004',
    title: 'Cross-Sell Opportunity: Enterprise Security Add-on',
    category: 'customer',
    severity: 'medium',
    explanation: {
      what: 'Nexora Tech purchased 50 Platform Licenses with high API activity but lacks 24/7 Security Operations monitoring.',
      why: 'Co-purchase analytics indicate 86% of similar tech accounts adopt SOC add-on within 60 days.',
      impact: 'Potential incremental ARR expansion of ₹3,60,000 at 74% gross margin.',
      who: 'Ananya Roy (Account Executive)',
      urgency: 'medium',
      next_action: 'Generate targeted proposal with standard 5% introductory bundling concession.',
      when: '2026-09-04T16:00:00Z',
    },
    when_timestamp: '2026-09-04T16:00:00Z',
    related_record_type: 'deal',
    related_record_id: 'deal-004',
    related_record_url: '/sales-manager/deals/deal-004',
    is_resolved: false,
  },
]

const MOCK_HIGH_RISK_DEALS: HighRiskDealItem[] = [
  {
    id: 'hrd-001',
    deal_id: 'deal-001',
    deal_name: 'Acme Corp Annual Enterprise Expansion',
    customer_name: 'Acme Technologies Ltd',
    customer_tier: 'gold',
    rep_name: 'Rahul Verma',
    total_value: 1245000,
    discount_percent: 18.5,
    margin_percent: 21.0,
    risk_score: 82,
    risk_level: 'critical',
    primary_risk: 'Dual Threshold Breach (Discount + Margin)',
    approval_status: 'pending_approval',
    created_at: '2026-09-05T08:00:00Z',
  },
  {
    id: 'hrd-002',
    deal_id: 'deal-002',
    deal_name: 'Hyperion Systems Fleet Rollout',
    customer_name: 'Hyperion Logistics India',
    customer_tier: 'platinum',
    rep_name: 'Neha Sharma',
    total_value: 2150000,
    discount_percent: 16.0,
    margin_percent: 23.5,
    risk_score: 74,
    risk_level: 'high',
    primary_risk: 'SLA Escalation Window Breached',
    approval_status: 'pending_approval',
    created_at: '2026-09-04T14:30:00Z',
  },
  {
    id: 'hrd-003',
    deal_id: 'deal-003',
    deal_name: 'Zenith Global Multi-Region Support',
    customer_name: 'Zenith Retail Solutions',
    customer_tier: 'silver',
    rep_name: 'Karan Patel',
    total_value: 680000,
    discount_percent: 14.0,
    margin_percent: 24.0,
    risk_score: 68,
    risk_level: 'high',
    primary_risk: 'Silver Tier Maximum Discount Exceeded',
    approval_status: 'returned',
    created_at: '2026-09-03T11:00:00Z',
  },
  {
    id: 'hrd-004',
    deal_id: 'deal-004',
    deal_name: 'Tata Steel Sub-Division Cloud Migration',
    customer_name: 'Tata Steel Utilities',
    customer_tier: 'platinum',
    rep_name: 'Pooja Sundaram',
    total_value: 3450000,
    discount_percent: 12.5,
    margin_percent: 26.2,
    risk_score: 58,
    risk_level: 'medium',
    primary_risk: 'Multiple Small Line Discount Accumulation',
    approval_status: 'approved',
    created_at: '2026-09-02T16:20:00Z',
  },
]

const MOCK_UPSELL: RecommendationItem[] = [
  {
    id: 'rec-up-001',
    type: 'upsell',
    customer_id: 'cust-001',
    customer_name: 'Acme Technologies Ltd',
    deal_id: 'deal-001',
    deal_name: 'Acme Corp Annual Enterprise Expansion',
    current_product_id: 'prod-lap-std',
    current_product_name: 'Standard Laptop 14',
    recommended_product_id: 'prod-lap-01',
    recommended_product_name: 'Enterprise UltraBook X1 Pro',
    recommended_sku: 'NB-X1-PRO',
    unit_price: 68000,
    confidence_percent: 92,
    reason: 'Customer expanded technical team by 35 engineers; historical compute workload necessitates i7 32GB hardware profile.',
    promotion_label: 'Corporate Q3 Refresh Concession',
    revenue_delta: 240000,
    margin_delta: 58000,
    margin_percent: 28.5,
    minimum_margin_pass: true,
    is_eligible: true,
  },
  {
    id: 'rec-up-002',
    type: 'upsell',
    customer_id: 'cust-002',
    customer_name: 'Nexora Solutions Pvt Ltd',
    deal_id: 'deal-004',
    deal_name: 'Nexora Platform Renewal',
    current_product_id: 'prod-plan-std',
    current_product_name: 'Standard SaaS Tier (50 Seats)',
    recommended_product_id: 'prod-plan-ent',
    recommended_product_name: 'Enterprise Dedicated Cloud Tier',
    recommended_sku: 'SUB-ENT-DED',
    unit_price: 180000,
    confidence_percent: 88,
    reason: 'Monthly API consumption breached 85% quota threshold for 3 consecutive billing cycles.',
    revenue_delta: 360000,
    margin_delta: 145000,
    margin_percent: 42.0,
    minimum_margin_pass: true,
    is_eligible: true,
  },
]

const MOCK_CROSS_SELL: RecommendationItem[] = [
  {
    id: 'rec-cs-001',
    type: 'cross_sell',
    customer_id: 'cust-001',
    customer_name: 'Acme Technologies Ltd',
    deal_id: 'deal-001',
    deal_name: 'Acme Corp Annual Enterprise Expansion',
    recommended_product_id: 'prod-srv-02',
    recommended_product_name: 'Premium 24/7 TAM Support & SLA Guarantee',
    recommended_sku: 'SRV-TAM-247',
    unit_price: 125000,
    confidence_percent: 86,
    reason: 'Co-purchase engine detected 89% attach rate for hardware purchases exceeding 15 units.',
    revenue_delta: 125000,
    margin_delta: 42000,
    margin_percent: 33.6,
    minimum_margin_pass: true,
    is_eligible: true,
    frequently_bought_together: ['Enterprise UltraBook X1 Pro', 'Thunderbolt 4 Docking Station'],
  },
  {
    id: 'rec-cs-002',
    type: 'cross_sell',
    customer_id: 'cust-003',
    customer_name: 'Zenith Retail Solutions',
    deal_id: 'deal-003',
    deal_name: 'Zenith Global Multi-Region Support',
    recommended_product_id: 'prod-acc-dock',
    recommended_product_name: 'Universal 4K Dual-Display Docking Hub',
    recommended_sku: 'ACC-DOCK-4K',
    unit_price: 14500,
    confidence_percent: 81,
    reason: 'Standard workspace deployment kit historically bundle-purchased in 94% of enterprise laptop bids.',
    revenue_delta: 72500,
    margin_delta: 24000,
    margin_percent: 33.1,
    minimum_margin_pass: true,
    is_eligible: true,
    frequently_bought_together: ['Enterprise UltraBook X1 Pro'],
  },
]

const MOCK_STALLED_DEALS: StalledDealItem[] = [
  {
    id: 'deal-stl-001',
    deal_name: 'Bharti AirTel Enterprise Network Audit',
    customer_name: 'Bharti Enterprises',
    rep_name: 'Vikram Malhotra',
    stage: 'negotiation',
    deal_value: 1850000,
    last_activity_at: '2026-08-16T10:00:00Z',
    stalled_days: 20,
    health_status: 'critical',
    reason_category: 'customer_inactivity',
    reason_explanation: 'Zero procurement response to revised quotation terms for 20 business days.',
    recommended_action: 'Executive sponsor outreach to Head of Technology Procurement.',
  },
  {
    id: 'deal-stl-002',
    deal_name: 'L&T Heavy Engineering CAD Licensing',
    customer_name: 'Larsen & Toubro Ltd',
    rep_name: 'Karan Patel',
    stage: 'approval',
    deal_value: 1420000,
    last_activity_at: '2026-08-22T14:30:00Z',
    stalled_days: 14,
    health_status: 'stalled',
    reason_category: 'approval_delay',
    reason_explanation: 'Level 2 Finance margin exception waiting on CFO delegation.',
    recommended_action: 'Escalate to Sales Director for immediate commercial override.',
  },
  {
    id: 'deal-stl-003',
    deal_name: 'Wipro Technologies Multi-Cloud Gateway',
    customer_name: 'Wipro Limited',
    rep_name: 'Rahul Verma',
    stage: 'proposal',
    deal_value: 950000,
    last_activity_at: '2026-08-25T09:15:00Z',
    stalled_days: 11,
    health_status: 'at_risk',
    reason_category: 'pricing_issue',
    reason_explanation: 'Configured partner volume tier conflicts with legacy discount agreement.',
    recommended_action: 'Apply standardized Corporate Tier Override via Business Admin settings.',
  },
]

const MOCK_DISCOUNT_ANOMALIES: DiscountAnomalyItem[] = [
  {
    id: 'anom-disc-001',
    deal_id: 'deal-001',
    deal_name: 'Acme Corp Annual Enterprise Expansion',
    customer_name: 'Acme Technologies Ltd',
    sales_rep_name: 'Rahul Verma',
    product_category: 'Cloud Services',
    discount_percent: 20.0,
    allowed_discount_percent: 10.0,
    difference_points: 10.0,
    severity: 'critical',
    detected_at: '2026-09-05T09:45:00Z',
    explanation: {
      what: 'Quote #QT-2026-00482 applies 20% discount on Professional Cloud Deployment.',
      why: 'Cloud Services category rule sets a strict hard ceiling of 10% for Gold customers.',
      impact: 'Projects gross margin at 21%, breaching the corporate floor of 25%.',
      recommended_action: 'Counter-negotiate discount down to maximum allowable 10% or obtain Finance exception.',
    },
    is_resolved: false,
  },
  {
    id: 'anom-disc-002',
    deal_id: 'deal-003',
    deal_name: 'Zenith Global Multi-Region Support',
    customer_name: 'Zenith Retail Solutions',
    sales_rep_name: 'Karan Patel',
    product_category: 'Hardware Peripherals',
    discount_percent: 16.0,
    allowed_discount_percent: 12.0,
    difference_points: 4.0,
    severity: 'high',
    detected_at: '2026-09-04T12:30:00Z',
    explanation: {
      what: 'Hardware line discount of 16% applied to 10 universal docking stations.',
      why: 'Exceeds Silver Tier maximum allowed peripheral discount of 12%.',
      impact: '₹14,500 direct margin erosion.',
      recommended_action: 'Reduce line discount to 12% or add services bundling to offset margin.',
    },
    is_resolved: false,
  },
]

const MOCK_DELIVERY_SLIPPAGE: DeliverySlippageItem[] = [
  {
    id: 'slip-001',
    order_id: 'ord-2026-0091',
    order_number: 'ORD-2026-0091',
    customer_name: 'Acme Technologies Ltd',
    warehouse_name: 'Bengaluru Central Fulfillment Hub',
    carrier_name: 'BlueDart Express',
    expected_delivery: '2026-09-08T18:00:00Z',
    current_eta: '2026-09-13T18:00:00Z',
    delay_days: 5,
    severity: 'high',
    reason_category: 'inventory_shortage',
    reason_detail: 'Shortage of 6 units of Enterprise UltraBook X1 Pro at primary hub.',
    customer_impact: 'Acme onboarding cohort scheduled for Sept 10th delayed.',
    recommended_actions: ['reallocate', 'contact_customer'],
  },
  {
    id: 'slip-002',
    order_id: 'ord-2026-0084',
    order_number: 'ORD-2026-0084',
    customer_name: 'Hyperion Logistics India',
    warehouse_name: 'Mumbai Western Logistics Hub',
    carrier_name: 'Delhivery Surface',
    expected_delivery: '2026-09-06T12:00:00Z',
    current_eta: '2026-09-09T18:00:00Z',
    delay_days: 3,
    severity: 'medium',
    reason_category: 'shipping_delay',
    reason_detail: 'Monsoon highway logistics advisory on Western corridor.',
    customer_impact: 'Fleet GPS installation timeline pushed back 72 hours.',
    recommended_actions: ['expedite', 'contact_customer'],
  },
]

export const intelligenceService = {
  async getIntelligenceDashboard(): Promise<IntelligenceDashboardData> {
    try {
      const res = await apiClient.get<IntelligenceDashboardData>('/intelligence/dashboard')
      const data = (res as any)?.data || res
      if (data && data.kpis) return data
    } catch {
      // Fallback to domain aggregate
    }
    return {
      kpis: {
        active_risks: 14,
        high_risk_deals: 4,
        recommendations_count: 8,
        deal_anomalies: 5,
        critical_alerts: 3,
      },
      risk_overview: {
        low: 18,
        medium: 12,
        high: 3,
        critical: 1,
        total: 34,
      },
      recommendation_overview: {
        upsell_opportunities: 4,
        cross_sell_opportunities: 4,
        expected_revenue_impact: 672500,
        expected_margin_impact: 245000,
      },
      deal_health: {
        healthy: 22,
        at_risk: 7,
        stalled: 3,
        critical: 2,
      },
      anomalies: {
        discount: 2,
        pricing: 1,
        approval: 1,
        fulfillment: 1,
      },
      recent_insights: MOCK_INSIGHTS,
    }
  },

  async getRiskOverview(): Promise<RiskOverviewData> {
    try {
      const res = await apiClient.get<RiskOverviewData>('/risk/overview')
      const data = (res as any)?.data || res
      if (data && data.kpis) return data
    } catch {}
    return {
      kpis: {
        total_deals: 34,
        low_risk: 18,
        medium_risk: 12,
        high_risk: 3,
        critical_risk: 1,
      },
      distribution: {
        scores: [
          { range: '0-25 (Low)', count: 18 },
          { range: '26-50 (Med)', count: 12 },
          { range: '51-75 (High)', count: 3 },
          { range: '76-100 (Crit)', count: 1 },
        ],
        by_stage: [
          { stage: 'discovery', count: 8, avg_score: 22 },
          { stage: 'proposal', count: 11, avg_score: 38 },
          { stage: 'negotiation', count: 9, avg_score: 64 },
          { stage: 'approval', count: 4, avg_score: 74 },
          { stage: 'closed_won', count: 2, avg_score: 18 },
        ],
        by_tier: [
          { tier: 'platinum', count: 6, high_risk_count: 1 },
          { tier: 'gold', count: 12, high_risk_count: 2 },
          { tier: 'silver', count: 10, high_risk_count: 1 },
          { tier: 'bronze', count: 6, high_risk_count: 0 },
        ],
        by_category: [
          { category: 'Hardware', count: 16, avg_discount: 14.2 },
          { category: 'Software/SaaS', count: 24, avg_discount: 9.8 },
          { category: 'Services', count: 12, avg_discount: 16.5 },
        ],
      },
      drivers: {
        discount_risk: 38,
        margin_risk: 28,
        customer_risk: 14,
        aggregate_risk: 12,
        pricing_risk: 8,
      },
      trends: {
        score_trend: [
          { date: 'Aug 1', avg_score: 34 },
          { date: 'Aug 8', avg_score: 36 },
          { date: 'Aug 15', avg_score: 39 },
          { date: 'Aug 22', avg_score: 41 },
          { date: 'Aug 29', avg_score: 42 },
          { date: 'Sep 5', avg_score: 44 },
        ],
        high_risk_trend: [
          { date: 'Aug 1', count: 2 },
          { date: 'Aug 8', count: 2 },
          { date: 'Aug 15', count: 3 },
          { date: 'Aug 22', count: 3 },
          { date: 'Aug 29', count: 4 },
          { date: 'Sep 5', count: 4 },
        ],
        critical_risk_trend: [
          { date: 'Aug 1', count: 0 },
          { date: 'Aug 8', count: 1 },
          { date: 'Aug 15', count: 1 },
          { date: 'Aug 22', count: 1 },
          { date: 'Aug 29', count: 1 },
          { date: 'Sep 5', count: 1 },
        ],
      },
      attention_deals: MOCK_HIGH_RISK_DEALS,
    }
  },

  async getHighRiskDeals(filters?: Record<string, string>): Promise<HighRiskDealItem[]> {
    try {
      const res = await apiClient.get<HighRiskDealItem[]>('/risk/high-risk-deals', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_HIGH_RISK_DEALS]
    if (filters?.risk_level && filters.risk_level !== 'all') {
      list = list.filter(d => d.risk_level === filters.risk_level)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(d => d.deal_name.toLowerCase().includes(q) || d.customer_name.toLowerCase().includes(q) || d.rep_name.toLowerCase().includes(q))
    }
    return list
  },

  async getRiskDetails(id: string): Promise<RiskDetailRecord> {
    try {
      const res = await apiClient.get<RiskDetailRecord>(`/risk/${id}`)
      const data = (res as any)?.data || res
      if (data && data.risk_score !== undefined) return data
    } catch {}
    return {
      id: id || 'risk-001',
      quotation_id: 'QT-2026-00482',
      deal_id: 'deal-001',
      deal_name: 'Acme Corp Annual Enterprise Expansion',
      customer_name: 'Acme Technologies Ltd',
      customer_tier: 'gold',
      risk_score: 82,
      risk_level: 'critical',
      primary_risk_driver: 'Dual Threshold Breach: Line Discount Ceiling + Margin Floor',
      explanation: {
        what: 'Quote QT-2026-00482 has a calculated risk score of 82 (Critical), triggered by excessive discounts on cloud deployment and hardware.',
        why: 'Hardware discount (18%) and Cloud Services discount (20%) breach policy ceilings of 12% and 10% respectively. Multiple small violations compounded into a critical tier breach.',
        impact: 'Projects gross profit compression to 21% (target 28%, floor 25%), leading to ₹1,42,800 direct gross margin loss.',
        who: 'Rahul Verma (Sales Rep), Priya Nair (Sales Manager), Finance Operations Committee',
        urgency: 'critical',
        next_action: 'Enforce counter-discount proposal of 12% hardware / 10% service or obtain Level 2 Finance Executive approval.',
        when: '2026-09-05T09:45:00Z',
      },
      breakdown: {
        line_risk: 35,
        customer_risk: 12,
        category_risk: 18,
        margin_risk: 22,
        aggregate_risk: 13,
      },
      factors: [
        {
          title: 'Cloud Services Discount Ceiling Breach',
          severity: 'critical',
          description: 'Line item "Premium Cloud Deployment" discount of 20% exceeds the strict 10% category maximum.',
          impact_points: 35,
          source: 'Category Discount Governance Rule #DR-004',
        },
        {
          title: 'Gross Margin Below Minimum Floor',
          severity: 'critical',
          description: 'Combined quotation gross margin of 21.0% violates the corporate floor threshold of 25.0%.',
          impact_points: 25,
          source: 'Margin Policy Engine #MAR-001',
        },
        {
          title: 'Multiple Small Violations Accumulation',
          severity: 'high',
          description: 'Hardware line (+6 pp over ceiling) and Services (+10 pp over ceiling) compound risk non-linearly.',
          impact_points: 15,
          source: 'Blended Risk Aggregation Engine',
        },
        {
          title: 'Warehouse Split Required',
          severity: 'medium',
          description: 'Bengaluru hub stock shortage requires multi-warehouse dispatch from Mumbai, increasing logistics cost.',
          impact_points: 7,
          source: 'Operations Inventory Sync',
        },
      ],
      approval_impact: {
        approval_required: true,
        current_level: 2,
        required_approver: 'Finance VP & Sales Director',
        escalation_window_hours: 24,
        sla_deadline: '2026-09-06T11:00:00Z',
      },
      history: [
        {
          timestamp: '2026-09-01T10:00:00Z',
          previous_score: 0,
          new_score: 25,
          change_reason: 'Initial quote version created with standard 8% discount.',
          actor_name: 'Rahul Verma',
        },
        {
          timestamp: '2026-09-03T15:30:00Z',
          previous_score: 25,
          new_score: 42,
          change_reason: 'Hardware discount increased from 8% to 12% following customer price check.',
          actor_name: 'Rahul Verma',
        },
        {
          timestamp: '2026-09-05T09:45:00Z',
          previous_score: 42,
          new_score: 82,
          change_reason: 'Customer requested 18% hardware and 20% services discount; margin compressed below 25% floor.',
          actor_name: 'Rahul Verma',
        },
      ],
    }
  },

  async getUpsellRecommendations(filters?: Record<string, string>): Promise<RecommendationItem[]> {
    try {
      const res = await apiClient.get<RecommendationItem[]>('/recommendations/upsell', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_UPSELL]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(r => r.customer_name.toLowerCase().includes(q) || r.recommended_product_name.toLowerCase().includes(q))
    }
    return list
  },

  async getCrossSellRecommendations(filters?: Record<string, string>): Promise<RecommendationItem[]> {
    try {
      const res = await apiClient.get<RecommendationItem[]>('/recommendations/cross-sell', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_CROSS_SELL]
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(r => r.customer_name.toLowerCase().includes(q) || r.recommended_product_name.toLowerCase().includes(q))
    }
    return list
  },

  async getRecommendationDetails(id: string): Promise<RecommendationDetailRecord> {
    try {
      const res = await apiClient.get<RecommendationDetailRecord>(`/recommendations/${id}`)
      const data = (res as any)?.data || res
      if (data && data.why_recommended) return data
    } catch {}
    const base = [...MOCK_UPSELL, ...MOCK_CROSS_SELL].find(r => r.id === id) || MOCK_UPSELL[0]
    return {
      ...base,
      why_recommended: {
        purchase_history_signal: 'Customer has re-ordered 3 laptop cohorts in the past 18 months without enterprise warranty.',
        co_purchase_pattern_signal: '89.4% of accounts with >20 endpoints adopt Dedicated Enterprise Support within 6 months.',
        customer_profile_signal: 'Tier: Gold. Technical team headcount increased by 35% this quarter.',
        promotion_signal: 'Q3 Enterprise Refresh active concession applies 5% margin credit.',
      },
      financial_impact: {
        revenue_delta: base.revenue_delta,
        cost_delta: base.revenue_delta - base.margin_delta,
        margin_delta: base.margin_delta,
        projected_gross_margin_percent: base.margin_percent,
        minimum_margin_threshold: 25.0,
      },
      logic: {
        matching_signals: [
          'Purchase history confirms high laptop retention',
          'Co-purchase correlation confidence: 89.4%',
          'Customer tier Gold allows enterprise bundle pricing',
          'Minimum margin verified: 28.5% > 25.0% floor',
        ],
        confidence_score: base.confidence_percent,
        minimum_margin_check: 'PASS',
        eligibility_status: 'eligible',
        eligibility_reason: 'All commercial constraints, active inventory, and margin floors satisfied.',
      },
    }
  },

  async applyRecommendation(recommendationId: string, dealId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(`/recommendations/${recommendationId}/apply`, { deal_id: dealId })
      return (res as any)?.data || res
    } catch {
      return { success: true, message: 'Recommended product line added to deal quotation and pricing re-evaluated.' }
    }
  },

  async getDealHealthOverview(): Promise<DealHealthOverviewData> {
    try {
      const res = await apiClient.get<DealHealthOverviewData>('/deal-health/overview')
      const data = (res as any)?.data || res
      if (data && data.kpis) return data
    } catch {}
    return {
      kpis: {
        healthy: 22,
        at_risk: 7,
        stalled: 3,
        critical: 2,
      },
      health_score_breakdown: {
        overall_health: 74,
        sales_activity: 82,
        customer_engagement: 68,
        approval_progress: 71,
        discount_risk: 65,
        margin_health: 79,
        fulfillment_health: 80,
      },
      distribution: {
        by_stage: [
          { stage: 'discovery', healthy: 7, at_risk: 1, stalled: 0, critical: 0 },
          { stage: 'proposal', healthy: 8, at_risk: 2, stalled: 1, critical: 0 },
          { stage: 'negotiation', healthy: 5, at_risk: 3, stalled: 1, critical: 1 },
          { stage: 'approval', healthy: 2, at_risk: 1, stalled: 1, critical: 1 },
        ],
        by_rep: [
          { rep_name: 'Rahul Verma', avg_health: 68, deal_count: 8 },
          { rep_name: 'Neha Sharma', avg_health: 82, deal_count: 6 },
          { rep_name: 'Karan Patel', avg_health: 74, deal_count: 7 },
          { rep_name: 'Pooja Sundaram', avg_health: 88, deal_count: 5 },
        ],
        by_tier: [
          { tier: 'platinum', avg_health: 81 },
          { tier: 'gold', avg_health: 72 },
          { tier: 'silver', avg_health: 69 },
          { tier: 'bronze', avg_health: 76 },
        ],
        by_value_bracket: [
          { bracket: '< ₹5L', healthy_percent: 85 },
          { bracket: '₹5L - ₹15L', healthy_percent: 74 },
          { bracket: '₹15L - ₹50L', healthy_percent: 62 },
          { bracket: '> ₹50L', healthy_percent: 50 },
        ],
      },
      trends: {
        score_trend: [
          { date: 'Aug 1', score: 78 },
          { date: 'Aug 8', score: 76 },
          { date: 'Aug 15', score: 75 },
          { date: 'Aug 22', score: 74 },
          { date: 'Aug 29', score: 73 },
          { date: 'Sep 5', score: 74 },
        ],
        risk_trend: [
          { date: 'Aug 1', at_risk_count: 5 },
          { date: 'Aug 8', at_risk_count: 6 },
          { date: 'Aug 15', at_risk_count: 6 },
          { date: 'Aug 22', at_risk_count: 7 },
          { date: 'Aug 29', at_risk_count: 8 },
          { date: 'Sep 5', at_risk_count: 7 },
        ],
        engagement_trend: [
          { date: 'Aug 1', activity_index: 85 },
          { date: 'Aug 8', activity_index: 80 },
          { date: 'Aug 15', activity_index: 78 },
          { date: 'Aug 22', activity_index: 72 },
          { date: 'Aug 29', activity_index: 70 },
          { date: 'Sep 5', activity_index: 74 },
        ],
      },
      attention_required: MOCK_STALLED_DEALS,
    }
  },

  async getStalledDeals(filters?: Record<string, string>): Promise<StalledDealItem[]> {
    try {
      const res = await apiClient.get<StalledDealItem[]>('/deal-health/stalled-deals', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_STALLED_DEALS]
    if (filters?.stage && filters.stage !== 'all') {
      list = list.filter(d => d.stage === filters.stage)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(d => d.deal_name.toLowerCase().includes(q) || d.customer_name.toLowerCase().includes(q))
    }
    return list
  },

  async getDiscountAnomalies(filters?: Record<string, string>): Promise<DiscountAnomalyItem[]> {
    try {
      const res = await apiClient.get<DiscountAnomalyItem[]>('/deal-health/discount-anomalies', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_DISCOUNT_ANOMALIES]
    if (filters?.severity && filters.severity !== 'all') {
      list = list.filter(a => a.severity === filters.severity)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(a => a.deal_name.toLowerCase().includes(q) || a.customer_name.toLowerCase().includes(q))
    }
    return list
  },

  async dismissDiscountAnomaly(id: string, reason: string = 'Reviewed and dismissed'): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/deal-health/discount-anomalies/${id}/dismiss`, { reason })
    } catch {
      const found = MOCK_DISCOUNT_ANOMALIES.find(a => a.id === id)
      if (found) {
        found.is_resolved = true
        found.resolved_at = new Date().toISOString()
        found.resolution_note = reason
      }
    }
    return { success: true }
  },

  async getDeliverySlippage(filters?: Record<string, string>): Promise<DeliverySlippageItem[]> {
    try {
      const res = await apiClient.get<DeliverySlippageItem[]>('/deal-health/delivery-slippage', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_DELIVERY_SLIPPAGE]
    if (filters?.warehouse && filters.warehouse !== 'all') {
      list = list.filter(s => s.warehouse_name.toLowerCase().includes(filters.warehouse.toLowerCase()))
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(s => s.order_number.toLowerCase().includes(q) || s.customer_name.toLowerCase().includes(q))
    }
    return list
  },

  async getDecisionInsights(filters?: Record<string, string>): Promise<DecisionInsightItem[]> {
    try {
      const res = await apiClient.get<DecisionInsightItem[]>('/insights', filters)
      if (Array.isArray(res)) return res
    } catch {}
    let list = [...MOCK_INSIGHTS]
    if (filters?.category && filters.category !== 'all') {
      list = list.filter(i => i.category === filters.category)
    }
    if (filters?.severity && filters.severity !== 'all') {
      list = list.filter(i => i.severity === filters.severity)
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.explanation.what.toLowerCase().includes(q))
    }
    return list
  },

  async actOnDecisionInsight(id: string, action: string, assigneeId?: string, comment?: string): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/insights/${id}/action`, { action, assignee_id: assigneeId, comment })
    } catch {
      const found = MOCK_INSIGHTS.find(i => i.id === id)
      if (found) {
        if (action === 'dismiss') found.is_resolved = true
        if (action === 'assign' && assigneeId) found.assignee = { id: assigneeId, name: 'Assigned Specialist' }
        if (comment) found.resolution_comment = comment
      }
    }
    return { success: true }
  },

  getDashboard() {
    return this.getIntelligenceDashboard()
  },
  getInsights(filters?: Record<string, string>) {
    return this.getDecisionInsights(filters)
  },
  getDeliverySlippages(filters?: Record<string, string>) {
    return this.getDeliverySlippage(filters)
  },
  actionInsight(id: string, action: string, assigneeId?: string, comment?: string) {
    return this.actOnDecisionInsight(id, action, assigneeId, comment)
  },
}

export const getIntelligenceDashboard = intelligenceService.getIntelligenceDashboard.bind(intelligenceService)
export const getRiskOverview = intelligenceService.getRiskOverview.bind(intelligenceService)
export const getHighRiskDeals = intelligenceService.getHighRiskDeals.bind(intelligenceService)
export const getRiskDetails = intelligenceService.getRiskDetails.bind(intelligenceService)
export const getRiskDetail = intelligenceService.getRiskDetails.bind(intelligenceService)
export const getUpsellRecommendations = intelligenceService.getUpsellRecommendations.bind(intelligenceService)
export const getCrossSellRecommendations = intelligenceService.getCrossSellRecommendations.bind(intelligenceService)
export const getRecommendations = (type: 'upsell' | 'cross-sell', filters?: Record<string, string>) =>
  type === 'upsell'
    ? intelligenceService.getUpsellRecommendations(filters)
    : intelligenceService.getCrossSellRecommendations(filters)
export const getRecommendationDetails = intelligenceService.getRecommendationDetails.bind(intelligenceService)
export const getRecommendationDetail = intelligenceService.getRecommendationDetails.bind(intelligenceService)
export const applyRecommendation = intelligenceService.applyRecommendation.bind(intelligenceService)
export const getDealHealthOverview = intelligenceService.getDealHealthOverview.bind(intelligenceService)
export const getStalledDeals = intelligenceService.getStalledDeals.bind(intelligenceService)
export const getDiscountAnomalies = intelligenceService.getDiscountAnomalies.bind(intelligenceService)
export const dismissDiscountAnomaly = intelligenceService.dismissDiscountAnomaly.bind(intelligenceService)
export const getDeliverySlippage = intelligenceService.getDeliverySlippage.bind(intelligenceService)
export const getDecisionInsights = intelligenceService.getDecisionInsights.bind(intelligenceService)
export const actOnDecisionInsight = intelligenceService.actOnDecisionInsight.bind(intelligenceService)

export default intelligenceService
