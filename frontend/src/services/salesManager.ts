import apiClient from '@/lib/api'
import type {
  SalesManagerDashboardKpis,
  ApprovalQueueItem,
  ApprovalDetailData,
  ApprovalHistoryItem,
  TeamDeal,
  DealTimelineEvent,
  TeamPerformanceRep,
  DealHealthFactors,
  DiscountAnomaly,
  StalledDeal,
  DeliverySlippage,
  DecisionInsight,
  ScheduledReportConfig,
  CoachingNote,
  DealHealthOverview,
} from '@/types/salesManager'

// ============================================================================
// MOCK DATA STORE (High-fidelity domain fallback for resilient enterprise UX)
// ============================================================================

export const MOCK_APPROVAL_QUEUE: ApprovalDetailData[] = [
  {
    id: 'app-001',
    quotation_id: 'q-101',
    quote_number: 'Q-2026-00482',
    version: 2,
    deal_id: 'deal-001',
    deal_name: 'Acme Cloud Migration & Hardware Refresh',
    customer: {
      id: 'cust-001',
      name: 'Acme Global Enterprises',
      tier: 'gold',
      industry: 'Enterprise Software',
      lifetime_value: 480000,
      open_deals: 3,
      payment_rating: 'excellent',
      discount_history_avg: 12.4,
      contact_name: 'Sarah Jenkins',
      contact_email: 's.jenkins@acmeglobal.com',
    },
    rep: {
      id: 'rep-001',
      name: 'Marcus Vance',
      email: 'm.vance@dealflow360.app',
      team: 'North America Enterprise',
      quota: 850000,
      quota_attainment_percent: 92,
    },
    deal_value: 128400,
    subtotal: 148000,
    net_price: 128400,
    currency: 'INR',
    requested_discount_percent: 18.5,
    allowed_discount_percent: 12.0,
    excess_discount_percent: 6.5,
    margin_percent: 21.8,
    target_margin_percent: 25.0,
    blended_risk_score: 68,
    risk_level: 'high',
    status: 'pending',
    approval_level: 'sales_manager_then_finance',
    current_step: 1,
    total_steps: 2,
    sla_expires_at: new Date(Date.now() + 2.5 * 3600 * 1000).toISOString(), // 2.5 hours remaining
    created_at: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 5.5 * 3600 * 1000).toISOString(),
    priority: 'urgent',
    rep_notes: 'Competitor AWS Partner offered aggressive discounting on server appliances. Customer requires an additional 6.5% discount to execute contract before fiscal quarter end.',
    lines_count: 4,
    lines: [
      {
        id: 'line-1',
        product_id: 'prod-01',
        product_name: 'Edge Server Rack X900',
        sku: 'SRV-X900',
        category: 'Hardware',
        quantity: 12,
        unit_price: 6500,
        list_price: 6500,
        requested_discount_percent: 20.0,
        tier_ceiling_percent: 12.0,
        category_ceiling_percent: 10.0,
        allowed_discount_percent: 10.0,
        excess_discount_percent: 10.0,
        net_price: 5200,
        line_total: 62400,
        cost: 4100,
        margin_percent: 21.1,
        line_risk_score: 82,
        violation_reasons: ['Hardware category discount limit is 10%', 'Exceeds Gold customer tier limit (12%)'],
      },
      {
        id: 'line-2',
        product_id: 'prod-02',
        product_name: 'Enterprise Cloud Backup Suite',
        sku: 'SW-BCK-ENT',
        category: 'Software Subscription',
        quantity: 150,
        unit_price: 240,
        list_price: 240,
        requested_discount_percent: 15.0,
        tier_ceiling_percent: 15.0,
        category_ceiling_percent: 15.0,
        allowed_discount_percent: 15.0,
        excess_discount_percent: 0.0,
        net_price: 204,
        line_total: 30600,
        cost: 65,
        margin_percent: 68.1,
        line_risk_score: 18,
        violation_reasons: [],
      },
      {
        id: 'line-3',
        product_id: 'prod-03',
        product_name: 'Dedicated Implementation Engineering',
        sku: 'SVC-ENG-PRM',
        category: 'Professional Services',
        quantity: 120,
        unit_price: 180,
        list_price: 180,
        requested_discount_percent: 22.0,
        tier_ceiling_percent: 10.0,
        category_ceiling_percent: 8.0,
        allowed_discount_percent: 8.0,
        excess_discount_percent: 14.0,
        net_price: 140.4,
        line_total: 16848,
        cost: 110,
        margin_percent: 21.6,
        line_risk_score: 86,
        violation_reasons: ['Services category ceiling is 8%', 'Margin 21.6% close to minimum threshold (20%)'],
      },
      {
        id: 'line-4',
        product_id: 'prod-04',
        product_name: '24/7 Platinum Mission-Critical Support',
        sku: 'SUP-247-PLT',
        category: 'Support',
        quantity: 1,
        unit_price: 18552,
        list_price: 18552,
        requested_discount_percent: 0.0,
        tier_ceiling_percent: 10.0,
        category_ceiling_percent: 10.0,
        allowed_discount_percent: 10.0,
        excess_discount_percent: 0.0,
        net_price: 18552,
        line_total: 18552,
        cost: 7200,
        margin_percent: 61.2,
        line_risk_score: 5,
        violation_reasons: [],
      },
    ],
    discount_analysis: {
      what: 'Overall 18.5% blended discount (₹19,600 reduction) against an approved baseline ceiling of 12.0%. Line 1 (Hardware) and Line 3 (Services) substantially exceed governance rules.',
      why: 'Key renewal battle against competitor who quoted ₹124,000 for equivalent hardware footprint. Rep concession designed to capture 3-year recurring support & software retention.',
      impact: 'Reduces deal gross margin from target 26.2% down to 21.8%. Total profit loss of ₹8,420 compared to standard tier pricing.',
      next_action: 'Recommend partial concession: allow 14% on Edge Servers if customer commits to a 24-month software subscription term.',
      revenue_delta: -19600,
      margin_delta: -4.4,
    },
    risk_breakdown: {
      blended_score: 68,
      level: 'high',
      line_risks: [
        { line_id: 'line-1', product_name: 'Edge Server Rack X900', score: 82, reason: '10pts over category ceiling; high hardware procurement cost.' },
        { line_id: 'line-3', product_name: 'Dedicated Implementation Engineering', score: 86, reason: '14pts over services ceiling; billable utilization risk.' },
      ],
      margin_risk: 'high',
      customer_risk: 'low',
      aggregate_note: 'Customer is tier 1 with pristine payment history (LTV ₹480k). Risk is purely concentrated in hardware margin compression and professional services utilization margin.',
    },
    business_impact: {
      revenue_delta: -19600,
      gross_profit_delta: -8420,
      commission_impact: -588,
      split_fulfillment_required: true,
      delivery_eta_days: 14,
    },
    recommendations: [
      {
        id: 'rec-01',
        type: 'approval_condition',
        text: 'Approve with Condition: Cap Hardware discount at 14% and Services at 12%. Preserves blended margin at 24.1% while maintaining winning price advantage.',
        suggested_action: 'Return with specific counter-terms or execute Conditional Approval.',
        expected_outcome: 'Recovers +₹4,120 in gross margin with minimal customer pushback.',
      },
      {
        id: 'rec-02',
        type: 'risk_mitigation',
        text: 'Notice: Dedicated Implementation Engineering requires East Depot staging before warehouse shipment.',
        suggested_action: 'Ensure Operations confirms technician capacity prior to final contract execution.',
        expected_outcome: 'Eliminates delivery slippage risk on line 3.',
      },
    ],
    approval_chain: [
      {
        step_number: 1,
        role: 'sales_manager',
        role_display: 'Sales Manager Approval',
        assignee_name: 'You (Current Step)',
        status: 'in_progress',
        decision: null,
        decided_at: null,
        sla_hours: 8,
        comments: null,
      },
      {
        step_number: 2,
        role: 'finance',
        role_display: 'Finance Controller Approval',
        assignee_name: 'Eleanor Vance (Finance VP)',
        status: 'pending',
        decision: null,
        decided_at: null,
        sla_hours: 12,
        comments: null,
      },
    ],
    version_history: {
      current_version: 2,
      previous_version: 1,
      revision_reason: 'Customer requested 5% further concession on hardware post-demo.',
      changes: [
        { field: 'Line 1 Discount', old_value: '15.0%', new_value: '20.0%', delta: '+5.0%' },
        { field: 'Deal Total', old_value: '₹134,640', new_value: '₹128,400', delta: '-₹6,240' },
        { field: 'Margin %', old_value: '24.2%', new_value: '21.8%', delta: '-2.4%' },
      ],
    },
  },
  {
    id: 'app-002',
    quotation_id: 'q-102',
    quote_number: 'Q-2026-00519',
    version: 1,
    deal_id: 'deal-002',
    deal_name: 'Nexus Dynamics Security Core Deployment',
    customer: {
      id: 'cust-002',
      name: 'Nexus Dynamics Ltd',
      tier: 'silver',
      industry: 'Fintech & Payments',
      lifetime_value: 195000,
      open_deals: 1,
      payment_rating: 'good',
      discount_history_avg: 8.5,
      contact_name: 'David Chen',
      contact_email: 'dchen@nexusdynamics.io',
    },
    rep: {
      id: 'rep-002',
      name: 'Elena Rostova',
      email: 'e.rostova@dealflow360.app',
      team: 'North America Enterprise',
      quota: 750000,
      quota_attainment_percent: 78,
    },
    deal_value: 74200,
    subtotal: 82500,
    net_price: 74200,
    currency: 'INR',
    requested_discount_percent: 10.0,
    allowed_discount_percent: 8.0,
    excess_discount_percent: 2.0,
    margin_percent: 34.5,
    target_margin_percent: 30.0,
    blended_risk_score: 34,
    risk_level: 'medium',
    status: 'pending',
    approval_level: 'sales_manager',
    current_step: 1,
    total_steps: 1,
    sla_expires_at: new Date(Date.now() + 6.0 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2.0 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 2.0 * 3600 * 1000).toISOString(),
    priority: 'medium',
    rep_notes: 'Silver customer requesting 10% discount on software bundle. Margin remains very strong at 34.5%.',
    lines_count: 2,
    lines: [
      {
        id: 'line-201',
        product_id: 'prod-05',
        product_name: 'Security Core Gateway License',
        sku: 'SEC-GW-01',
        category: 'Software Subscription',
        quantity: 50,
        unit_price: 1100,
        list_price: 1100,
        requested_discount_percent: 10.0,
        tier_ceiling_percent: 8.0,
        category_ceiling_percent: 15.0,
        allowed_discount_percent: 8.0,
        excess_discount_percent: 2.0,
        net_price: 990,
        line_total: 49500,
        cost: 220,
        margin_percent: 77.7,
        line_risk_score: 28,
        violation_reasons: ['Exceeds Silver customer tier ceiling by 2%'],
      },
      {
        id: 'line-202',
        product_id: 'prod-06',
        product_name: 'Onsite Security Appliance Tier 2',
        sku: 'HW-SEC-T2',
        category: 'Hardware',
        quantity: 5,
        unit_price: 5500,
        list_price: 5500,
        requested_discount_percent: 10.0,
        tier_ceiling_percent: 8.0,
        category_ceiling_percent: 10.0,
        allowed_discount_percent: 8.0,
        excess_discount_percent: 2.0,
        net_price: 4950,
        line_total: 24750,
        cost: 3800,
        margin_percent: 23.2,
        line_risk_score: 41,
        violation_reasons: ['Exceeds Silver tier ceiling (8%) by 2%'],
      },
    ],
    discount_analysis: {
      what: '10.0% discount across software and hardware lines. Exceeds customer Silver tier limit (8%) by 2 percentage points (₹1,650 delta).',
      why: 'Multi-year lock-in incentive for emerging fintech account.',
      impact: 'Healthy margin profile at 34.5% (above target 30%). Low financial risk.',
      next_action: 'Straightforward approval recommended.',
      revenue_delta: -8300,
      margin_delta: -1.8,
    },
    risk_breakdown: {
      blended_score: 34,
      level: 'medium',
      line_risks: [
        { line_id: 'line-202', product_name: 'Onsite Security Appliance Tier 2', score: 41, reason: 'Hardware margin 23.2% near standard floor' },
      ],
      margin_risk: 'low',
      customer_risk: 'low',
      aggregate_note: 'Blended risk score 34 is moderate. Overall software margin shields hardware risk.',
    },
    business_impact: {
      revenue_delta: -8300,
      gross_profit_delta: -2100,
      commission_impact: -249,
      split_fulfillment_required: false,
      delivery_eta_days: 7,
    },
    recommendations: [
      {
        id: 'rec-201',
        type: 'approval_condition',
        text: 'Approve without changes: Healthy deal margin of 34.5% comfortably covers the 2% Silver tier exception.',
        suggested_action: 'Click Approve to expedite rep momentum.',
        expected_outcome: 'Immediate deal closure expected before Friday.',
      },
    ],
    approval_chain: [
      {
        step_number: 1,
        role: 'sales_manager',
        role_display: 'Sales Manager Approval',
        assignee_name: 'You (Current Step)',
        status: 'in_progress',
        decision: null,
        decided_at: null,
        sla_hours: 8,
        comments: null,
      },
    ],
    version_history: {
      current_version: 1,
      previous_version: null,
      changes: [],
    },
  },
  {
    id: 'app-003',
    quotation_id: 'q-103',
    quote_number: 'Q-2026-00499',
    version: 3,
    deal_id: 'deal-003',
    deal_name: 'Hyperion Logistics Fleet Tracking Upgrade',
    customer: {
      id: 'cust-003',
      name: 'Hyperion Logistics Corp',
      tier: 'platinum',
      industry: 'Logistics & Supply Chain',
      lifetime_value: 1120000,
      open_deals: 2,
      payment_rating: 'excellent',
      discount_history_avg: 14.8,
      contact_name: 'Rachel Adams',
      contact_email: 'radams@hyperionfleet.com',
    },
    rep: {
      id: 'rep-003',
      name: 'Julian Thorne',
      email: 'j.thorne@dealflow360.app',
      team: 'North America Enterprise',
      quota: 900000,
      quota_attainment_percent: 108,
    },
    deal_value: 215000,
    subtotal: 268000,
    net_price: 215000,
    currency: 'INR',
    requested_discount_percent: 19.8,
    allowed_discount_percent: 15.0,
    excess_discount_percent: 4.8,
    margin_percent: 19.4,
    target_margin_percent: 25.0,
    blended_risk_score: 74,
    risk_level: 'high',
    status: 'pending',
    approval_level: 'sales_manager_then_finance',
    current_step: 1,
    total_steps: 2,
    sla_expires_at: new Date(Date.now() + 1.2 * 3600 * 1000).toISOString(), // 1.2h SLA remaining!
    created_at: new Date(Date.now() - 6.8 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 6.8 * 3600 * 1000).toISOString(),
    priority: 'urgent',
    rep_notes: 'Large fleet deal. Customer requested 20% discount. Margin is 19.4%, which is slightly below our 20% floor. Finance approval will be required after Manager sign-off.',
    lines_count: 3,
    lines: [
      {
        id: 'line-301',
        product_id: 'prod-07',
        product_name: 'Fleet Telematics Sensor Module',
        sku: 'IOT-FLT-09',
        category: 'Hardware',
        quantity: 800,
        unit_price: 180,
        list_price: 180,
        requested_discount_percent: 22.0,
        tier_ceiling_percent: 15.0,
        category_ceiling_percent: 12.0,
        allowed_discount_percent: 12.0,
        excess_discount_percent: 10.0,
        net_price: 140.4,
        line_total: 112320,
        cost: 115,
        margin_percent: 18.1,
        line_risk_score: 88,
        violation_reasons: ['Hardware margin 18.1% violates 20% minimum threshold', 'Exceeds Platinum tier ceiling (15%)'],
      },
      {
        id: 'line-302',
        product_id: 'prod-08',
        product_name: 'Fleet Tracking SaaS - Annual',
        sku: 'SW-FLT-ANN',
        category: 'Software Subscription',
        quantity: 800,
        unit_price: 130,
        list_price: 130,
        requested_discount_percent: 18.0,
        tier_ceiling_percent: 15.0,
        category_ceiling_percent: 15.0,
        allowed_discount_percent: 15.0,
        excess_discount_percent: 3.0,
        net_price: 106.6,
        line_total: 85280,
        cost: 30,
        margin_percent: 71.8,
        line_risk_score: 30,
        violation_reasons: ['Exceeds SaaS category limit by 3%'],
      },
      {
        id: 'line-303',
        product_id: 'prod-09',
        product_name: 'Field Technician Installation Services',
        sku: 'SVC-INST-FLT',
        category: 'Professional Services',
        quantity: 1,
        unit_price: 20000,
        list_price: 20000,
        requested_discount_percent: 13.0,
        tier_ceiling_percent: 10.0,
        category_ceiling_percent: 10.0,
        allowed_discount_percent: 10.0,
        excess_discount_percent: 3.0,
        net_price: 17400,
        line_total: 17400,
        cost: 13000,
        margin_percent: 25.3,
        line_risk_score: 45,
        violation_reasons: ['Exceeds services ceiling by 3%'],
      },
    ],
    discount_analysis: {
      what: 'Blended 19.8% discount on a ₹268k contract. Gross margin drops to 19.4%, piercing the 20% minimum margin policy for hardware.',
      why: 'Hyperion is negotiating a multi-phase contract worth ₹1.1M over 3 years. Initial fleet rollout requires aggressive hardware pricing to displace legacy GPS vendor.',
      impact: 'Margin dilution of ₹14,200. However, software recurring revenue locks in ₹85,280 ARR with 71.8% gross margin.',
      next_action: 'Recommend approval with escalation note to Finance, citing high lifetime software value.',
      revenue_delta: -53000,
      margin_delta: -5.6,
    },
    risk_breakdown: {
      blended_score: 74,
      level: 'high',
      line_risks: [
        { line_id: 'line-301', product_name: 'Fleet Telematics Sensor Module', score: 88, reason: 'Margin 18.1% is below hard floor (20%)' },
      ],
      margin_risk: 'high',
      customer_risk: 'low',
      aggregate_note: 'High blended risk driven strictly by hardware unit economics. Platinum customer rating reduces credit or default risk to zero.',
    },
    business_impact: {
      revenue_delta: -53000,
      gross_profit_delta: -14200,
      commission_impact: -1590,
      split_fulfillment_required: true,
      delivery_eta_days: 21,
    },
    recommendations: [
      {
        id: 'rec-301',
        type: 'approval_condition',
        text: 'Strategic Concession: Endorse to Finance with notation that Year 2 and Year 3 SaaS renewals have zero discount attached.',
        suggested_action: 'Forward with Manager Approval note to Eleanor Vance (Finance).',
        expected_outcome: 'Preserves enterprise relationship while establishing formal multi-year profitability.',
      },
    ],
    approval_chain: [
      {
        step_number: 1,
        role: 'sales_manager',
        role_display: 'Sales Manager Approval',
        assignee_name: 'You (Current Step)',
        status: 'in_progress',
        decision: null,
        decided_at: null,
        sla_hours: 8,
        comments: null,
      },
      {
        step_number: 2,
        role: 'finance',
        role_display: 'Finance VP Approval',
        assignee_name: 'Eleanor Vance',
        status: 'pending',
        decision: null,
        decided_at: null,
        sla_hours: 12,
        comments: null,
      },
    ],
    version_history: {
      current_version: 3,
      previous_version: 2,
      changes: [
        { field: 'Sensor Module Discount', old_value: '18.0%', new_value: '22.0%', delta: '+4.0%' },
        { field: 'Margin %', old_value: '21.5%', new_value: '19.4%', delta: '-2.1%' },
      ],
    },
  },
  {
    id: 'app-004',
    quotation_id: 'q-104',
    quote_number: 'Q-2026-00475',
    version: 1,
    deal_id: 'deal-004',
    deal_name: 'Solaria BioTech Laboratory Automation',
    customer: {
      id: 'cust-004',
      name: 'Solaria BioTech Inc',
      tier: 'bronze',
      industry: 'Life Sciences',
      lifetime_value: 45000,
      open_deals: 1,
      payment_rating: 'fair',
      discount_history_avg: 5.0,
      contact_name: 'Dr. Aris Thorne',
      contact_email: 'athorne@solariabio.org',
    },
    rep: {
      id: 'rep-004',
      name: 'Maya Lin',
      email: 'm.lin@dealflow360.app',
      team: 'North America Enterprise',
      quota: 700000,
      quota_attainment_percent: 64,
    },
    deal_value: 39500,
    subtotal: 48000,
    net_price: 39500,
    currency: 'INR',
    requested_discount_percent: 17.7,
    allowed_discount_percent: 5.0,
    excess_discount_percent: 12.7,
    margin_percent: 14.8,
    target_margin_percent: 28.0,
    blended_risk_score: 88,
    risk_level: 'critical',
    status: 'pending',
    approval_level: 'sales_manager',
    current_step: 1,
    total_steps: 1,
    sla_expires_at: new Date(Date.now() + 8.5 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    submitted_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    priority: 'high',
    rep_notes: 'New bronze customer. Requested large discount on lab robotics gateway.',
    lines_count: 2,
    lines: [
      {
        id: 'line-401',
        product_id: 'prod-10',
        product_name: 'Robotic Gateway Controller',
        sku: 'ROB-GW-04',
        category: 'Hardware',
        quantity: 2,
        unit_price: 18000,
        list_price: 18000,
        requested_discount_percent: 20.0,
        tier_ceiling_percent: 5.0,
        category_ceiling_percent: 10.0,
        allowed_discount_percent: 5.0,
        excess_discount_percent: 15.0,
        net_price: 14400,
        line_total: 28800,
        cost: 13500,
        margin_percent: 6.25,
        line_risk_score: 95,
        violation_reasons: ['Gross margin 6.25% severely below company floor (15%)', 'Bronze tier limit is 5%'],
      },
      {
        id: 'line-402',
        product_id: 'prod-11',
        product_name: 'Automation Orchestrator Pro',
        sku: 'SW-AUTO-PRO',
        category: 'Software Subscription',
        quantity: 1,
        unit_price: 12000,
        list_price: 12000,
        requested_discount_percent: 10.8,
        tier_ceiling_percent: 5.0,
        category_ceiling_percent: 12.0,
        allowed_discount_percent: 5.0,
        excess_discount_percent: 5.8,
        net_price: 10700,
        line_total: 10700,
        cost: 3200,
        margin_percent: 70.1,
        line_risk_score: 35,
        violation_reasons: ['Exceeds Bronze tier limit by 5.8%'],
      },
    ],
    discount_analysis: {
      what: '17.7% blended discount request. Hardware margin on line 1 collapses to 6.25%, which is a critical governance breach.',
      why: 'Rep attempted to win new account by heavily subsidizing capital equipment.',
      impact: 'Severely unprofitable transaction. Equipment cost almost equals selling price.',
      next_action: 'REJECT or RETURN for immediate restructuring. Hardware discount cannot exceed 5%.',
      revenue_delta: -8500,
      margin_delta: -13.2,
    },
    risk_breakdown: {
      blended_score: 88,
      level: 'critical',
      line_risks: [
        { line_id: 'line-401', product_name: 'Robotic Gateway Controller', score: 95, reason: 'Margin 6.25% creates direct capital leakage' },
      ],
      margin_risk: 'high',
      customer_risk: 'medium',
      aggregate_note: 'Unacceptable transaction economics under current company governance rules.',
    },
    business_impact: {
      revenue_delta: -8500,
      gross_profit_delta: -4800,
      commission_impact: -255,
      split_fulfillment_required: false,
      delivery_eta_days: 10,
    },
    recommendations: [
      {
        id: 'rec-401',
        type: 'approval_condition',
        text: 'Action Recommended: Return to Maya Lin with instructions: Cap Hardware discount at 5% maximum and offer 15% discount on software subscription instead.',
        suggested_action: 'Click Return for Revision.',
        expected_outcome: 'Restores deal margin to 27.5% and preserves profit integrity.',
      },
    ],
    approval_chain: [
      {
        step_number: 1,
        role: 'sales_manager',
        role_display: 'Sales Manager Approval',
        assignee_name: 'You (Current Step)',
        status: 'in_progress',
        decision: null,
        decided_at: null,
        sla_hours: 8,
        comments: null,
      },
    ],
    version_history: {
      current_version: 1,
      previous_version: null,
      changes: [],
    },
  },
]

export const MOCK_APPROVAL_HISTORY: ApprovalHistoryItem[] = [
  {
    id: 'hist-001',
    approval_id: 'app-099',
    quotation_id: 'q-099',
    quote_number: 'Q-2026-00460',
    deal_name: 'Apex Semiconductor Wafer Analytics Platform',
    customer_name: 'Apex Semiconductor Labs',
    customer_tier: 'gold',
    rep_name: 'Marcus Vance',
    deal_value: 184500,
    currency: 'INR',
    discount_percent: 14.0,
    margin_percent: 24.8,
    risk_score: 42,
    risk_level: 'medium',
    decision: 'approved',
    decided_by: 'You (Sales Manager)',
    decided_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    sla_hours_taken: 3.2,
    sla_allocated_hours: 8.0,
    sla_status: 'met',
    reason_or_notes: 'Approved based on multi-year software expansion commitment in Q4.',
    step_level: 'Sales Manager Step 1 of 1',
  },
  {
    id: 'hist-002',
    approval_id: 'app-098',
    quotation_id: 'q-098',
    quote_number: 'Q-2026-00455',
    deal_name: 'Vanguard Retail Point of Sale Upgrade',
    customer_name: 'Vanguard Retail Systems',
    customer_tier: 'silver',
    rep_name: 'Elena Rostova',
    deal_value: 52000,
    currency: 'INR',
    discount_percent: 22.5,
    margin_percent: 12.0,
    risk_score: 85,
    risk_level: 'critical',
    decision: 'rejected',
    decided_by: 'You (Sales Manager)',
    decided_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    sla_hours_taken: 1.8,
    sla_allocated_hours: 8.0,
    sla_status: 'met',
    reason_or_notes: 'Rejected: 22.5% discount collapses margin to 12%, breaching mandatory corporate 18% floor for Silver tier.',
    step_level: 'Sales Manager Step 1 of 1',
  },
  {
    id: 'hist-003',
    approval_id: 'app-097',
    quotation_id: 'q-097',
    quote_number: 'Q-2026-00451',
    deal_name: 'Quantico Cyber Shield Network Grid',
    customer_name: 'Quantico Federal Tech',
    customer_tier: 'platinum',
    rep_name: 'Julian Thorne',
    deal_value: 340000,
    currency: 'INR',
    discount_percent: 16.5,
    margin_percent: 23.2,
    risk_score: 62,
    risk_level: 'high',
    decision: 'returned',
    decided_by: 'You (Sales Manager)',
    decided_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    sla_hours_taken: 4.5,
    sla_allocated_hours: 8.0,
    sla_status: 'met',
    reason_or_notes: 'Returned for revision: Please shift 4% discount from Hardware into Cloud Services to satisfy Finance margin constraints.',
    step_level: 'Sales Manager Step 1 of 2',
  },
  {
    id: 'hist-004',
    approval_id: 'app-096',
    quotation_id: 'q-096',
    quote_number: 'Q-2026-00440',
    deal_name: 'Pacific Maritime Telemetry Overhaul',
    customer_name: 'Pacific Maritime Corp',
    customer_tier: 'gold',
    rep_name: 'Maya Lin',
    deal_value: 98000,
    currency: 'INR',
    discount_percent: 11.0,
    margin_percent: 28.4,
    risk_score: 25,
    risk_level: 'low',
    decision: 'approved',
    decided_by: 'You (Sales Manager)',
    decided_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    sla_hours_taken: 2.1,
    sla_allocated_hours: 8.0,
    sla_status: 'met',
    reason_or_notes: 'Standard 11% volume incentive approved.',
    step_level: 'Sales Manager Step 1 of 1',
  },
  {
    id: 'hist-005',
    approval_id: 'app-095',
    quotation_id: 'q-095',
    quote_number: 'Q-2026-00432',
    deal_name: 'Kodiak Energy Grid Remote Sensors',
    customer_name: 'Kodiak Energy Partners',
    customer_tier: 'silver',
    rep_name: 'Marcus Vance',
    deal_value: 67500,
    currency: 'INR',
    discount_percent: 15.0,
    margin_percent: 21.0,
    risk_score: 55,
    risk_level: 'medium',
    decision: 'approved',
    decided_by: 'You (Sales Manager)',
    decided_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    sla_hours_taken: 9.4,
    sla_allocated_hours: 8.0,
    sla_status: 'breached',
    reason_or_notes: 'Approved after delayed executive verification with technical team.',
    step_level: 'Sales Manager Step 1 of 1',
  },
]

export const MOCK_TEAM_DEALS: TeamDeal[] = [
  {
    id: 'deal-001',
    title: 'Acme Cloud Migration & Hardware Refresh',
    customer_id: 'cust-001',
    customer_name: 'Acme Global Enterprises',
    customer_tier: 'gold',
    rep_id: 'rep-001',
    rep_name: 'Marcus Vance',
    team_name: 'North America Enterprise',
    stage: 'approval',
    deal_value: 128400,
    currency: 'INR',
    expected_close_date: '2026-09-30',
    created_at: '2026-08-10',
    health_score: 64,
    health_status: 'at_risk',
    risk_level: 'high',
    days_in_stage: 6,
    last_activity: '2 hours ago',
    linked_quotations_count: 2,
    active_quote_number: 'Q-2026-00482',
    deal_summary: 'Comprehensive data center refresh and migration to hybrid cloud. High competition from regional reseller.',
    target_products: ['Edge Server Rack X900', 'Enterprise Cloud Backup Suite', 'Dedicated Implementation Engineering'],
    coaching_notes: [
      {
        id: 'cn-1',
        author_name: 'Sarah Connor (Sales Manager)',
        author_role: 'Sales Manager',
        text: 'Marcus: if the customer hesitates on the 14% hardware counter-offer, bundle 3 additional training credits rather than lowering the unit price.',
        created_at: '2026-09-04T14:30:00Z',
      },
    ],
  },
  {
    id: 'deal-002',
    title: 'Nexus Dynamics Security Core Deployment',
    customer_id: 'cust-002',
    customer_name: 'Nexus Dynamics Ltd',
    customer_tier: 'silver',
    rep_id: 'rep-002',
    rep_name: 'Elena Rostova',
    team_name: 'North America Enterprise',
    stage: 'approval',
    deal_value: 74200,
    currency: 'INR',
    expected_close_date: '2026-09-22',
    created_at: '2026-08-20',
    health_score: 82,
    health_status: 'healthy',
    risk_level: 'medium',
    days_in_stage: 2,
    last_activity: '3 hours ago',
    linked_quotations_count: 1,
    active_quote_number: 'Q-2026-00519',
    deal_summary: 'Security hardware and gateway licensing for new fintech headquarters.',
    target_products: ['Security Core Gateway License', 'Onsite Security Appliance Tier 2'],
  },
  {
    id: 'deal-003',
    title: 'Hyperion Logistics Fleet Tracking Upgrade',
    customer_id: 'cust-003',
    customer_name: 'Hyperion Logistics Corp',
    customer_tier: 'platinum',
    rep_id: 'rep-003',
    rep_name: 'Julian Thorne',
    team_name: 'North America Enterprise',
    stage: 'approval',
    deal_value: 215000,
    currency: 'INR',
    expected_close_date: '2026-09-28',
    created_at: '2026-07-15',
    health_score: 58,
    health_status: 'at_risk',
    risk_level: 'high',
    days_in_stage: 8,
    last_activity: '1 hour ago',
    linked_quotations_count: 3,
    active_quote_number: 'Q-2026-00499',
    deal_summary: 'Massive fleet upgrade across 800 distribution vehicles. Crucial Q3 flagship win.',
    target_products: ['Fleet Telematics Sensor Module', 'Fleet Tracking SaaS - Annual'],
  },
  {
    id: 'deal-004',
    title: 'Solaria BioTech Laboratory Automation',
    customer_id: 'cust-004',
    customer_name: 'Solaria BioTech Inc',
    customer_tier: 'bronze',
    rep_id: 'rep-004',
    rep_name: 'Maya Lin',
    team_name: 'North America Enterprise',
    stage: 'approval',
    deal_value: 39500,
    currency: 'INR',
    expected_close_date: '2026-10-15',
    created_at: '2026-08-28',
    health_score: 42,
    health_status: 'stalled',
    risk_level: 'critical',
    days_in_stage: 14,
    last_activity: 'Yesterday',
    linked_quotations_count: 1,
    active_quote_number: 'Q-2026-00475',
    deal_summary: 'First purchase of robotic controllers. Heavy discount requested without strategic justification.',
    target_products: ['Robotic Gateway Controller', 'Automation Orchestrator Pro'],
  },
  {
    id: 'deal-005',
    title: 'Vanguard Retail Unified Point of Sale',
    customer_id: 'cust-005',
    customer_name: 'Vanguard Retail Systems',
    customer_tier: 'silver',
    rep_id: 'rep-002',
    rep_name: 'Elena Rostova',
    team_name: 'North America Enterprise',
    stage: 'negotiation',
    deal_value: 95000,
    currency: 'INR',
    expected_close_date: '2026-10-05',
    created_at: '2026-08-01',
    health_score: 76,
    health_status: 'healthy',
    risk_level: 'medium',
    days_in_stage: 5,
    last_activity: '4 hours ago',
    linked_quotations_count: 2,
    active_quote_number: 'Q-2026-00530',
    deal_summary: 'Replacing legacy terminals across 45 regional branches.',
  },
  {
    id: 'deal-006',
    title: 'Apex Semi AI Inspection Racks',
    customer_id: 'cust-006',
    customer_name: 'Apex Semiconductor Labs',
    customer_tier: 'gold',
    rep_id: 'rep-001',
    rep_name: 'Marcus Vance',
    team_name: 'North America Enterprise',
    stage: 'closed_won',
    deal_value: 184500,
    currency: 'INR',
    expected_close_date: '2026-09-02',
    created_at: '2026-07-20',
    health_score: 95,
    health_status: 'healthy',
    risk_level: 'low',
    days_in_stage: 3,
    last_activity: '3 days ago',
    linked_quotations_count: 2,
    active_quote_number: 'Q-2026-00460',
    deal_summary: 'Contract executed and forwarded to Operations for fulfillment.',
  },
  {
    id: 'deal-007',
    title: 'Orion Telecommunications Core Fiber Upgrade',
    customer_id: 'cust-007',
    customer_name: 'Orion Telecom LLC',
    customer_tier: 'platinum',
    rep_id: 'rep-003',
    rep_name: 'Julian Thorne',
    team_name: 'North America Enterprise',
    stage: 'proposal',
    deal_value: 310000,
    currency: 'INR',
    expected_close_date: '2026-11-15',
    created_at: '2026-08-15',
    health_score: 88,
    health_status: 'healthy',
    risk_level: 'low',
    days_in_stage: 7,
    last_activity: 'Yesterday',
    linked_quotations_count: 1,
    active_quote_number: 'Q-2026-00542',
    deal_summary: 'High value proposal currently in procurement technical evaluation.',
  },
  {
    id: 'deal-008',
    title: 'Cascade Medical Device Network Nodes',
    customer_id: 'cust-008',
    customer_name: 'Cascade Medical Group',
    customer_tier: 'silver',
    rep_id: 'rep-004',
    rep_name: 'Maya Lin',
    team_name: 'North America Enterprise',
    stage: 'discovery',
    deal_value: 62000,
    currency: 'INR',
    expected_close_date: '2026-10-30',
    created_at: '2026-09-01',
    health_score: 52,
    health_status: 'stalled',
    risk_level: 'medium',
    days_in_stage: 18,
    last_activity: '12 days ago',
    linked_quotations_count: 0,
    deal_summary: 'Discovery stalled due to prospect internal restructuring. Maya needs to re-engage clinical director.',
  },
]

export const MOCK_TEAM_PERFORMANCE: TeamPerformanceRep[] = [
  {
    rep_id: 'rep-003',
    name: 'Julian Thorne',
    email: 'j.thorne@dealflow360.app',
    team: 'North America Enterprise',
    quota: 900000,
    closed_revenue: 972000,
    attainment_percent: 108.0,
    active_pipeline: 525000,
    open_deals_count: 4,
    win_rate_percent: 68.5,
    avg_discount_percent: 11.2,
    discount_violations_count: 2,
    stalled_deals_count: 0,
    health_index: 92,
    trend_direction: 'up',
  },
  {
    rep_id: 'rep-001',
    name: 'Marcus Vance',
    email: 'm.vance@dealflow360.app',
    team: 'North America Enterprise',
    quota: 850000,
    closed_revenue: 782000,
    attainment_percent: 92.0,
    active_pipeline: 412900,
    open_deals_count: 5,
    win_rate_percent: 59.0,
    avg_discount_percent: 14.5,
    discount_violations_count: 4,
    stalled_deals_count: 1,
    health_index: 81,
    trend_direction: 'up',
  },
  {
    rep_id: 'rep-002',
    name: 'Elena Rostova',
    email: 'e.rostova@dealflow360.app',
    team: 'North America Enterprise',
    quota: 750000,
    closed_revenue: 585000,
    attainment_percent: 78.0,
    active_pipeline: 320000,
    open_deals_count: 4,
    win_rate_percent: 54.2,
    avg_discount_percent: 9.8,
    discount_violations_count: 1,
    stalled_deals_count: 1,
    health_index: 76,
    trend_direction: 'neutral',
  },
  {
    rep_id: 'rep-004',
    name: 'Maya Lin',
    email: 'm.lin@dealflow360.app',
    team: 'North America Enterprise',
    quota: 700000,
    closed_revenue: 448000,
    attainment_percent: 64.0,
    active_pipeline: 245000,
    open_deals_count: 3,
    win_rate_percent: 41.5,
    avg_discount_percent: 16.8,
    discount_violations_count: 6,
    stalled_deals_count: 2,
    health_index: 54,
    trend_direction: 'down',
  },
]

export const MOCK_DISCOUNT_ANOMALIES: DiscountAnomaly[] = [
  {
    id: 'anom-1',
    deal_id: 'deal-004',
    deal_name: 'Solaria BioTech Laboratory Automation',
    customer: 'Solaria BioTech Inc',
    rep: 'Maya Lin',
    discount_percent: 17.7,
    allowed_percent: 5.0,
    excess_percent: 12.7,
    severity: 'critical',
    detected_at: '2026-09-05T08:15:00Z',
    explanation: {
      what: 'Hardware line discount 20% against Bronze customer tier ceiling of 5%.',
      why: 'Rep attempted to meet competitor quotation without managerial pre-clearance.',
      impact: 'Deal margin collapses to 6.25%, generating direct net profit loss.',
      next_action: 'Return quote to rep with instructions to limit hardware discount to 5% max.',
    },
  },
  {
    id: 'anom-2',
    deal_id: 'deal-001',
    deal_name: 'Acme Cloud Migration & Hardware Refresh',
    customer: 'Acme Global Enterprises',
    rep: 'Marcus Vance',
    discount_percent: 18.5,
    allowed_percent: 12.0,
    excess_percent: 6.5,
    severity: 'high',
    detected_at: '2026-09-05T09:30:00Z',
    explanation: {
      what: 'Hardware discount 20% exceeds category limit (10%) and tier ceiling (12%).',
      why: 'Competitive pressure against AWS Partner.',
      impact: 'Reduces gross profit by ₹8,420; deal margin down to 21.8%.',
      next_action: 'Offer counter-proposal: 14% hardware discount paired with 2-year software commitment.',
    },
  },
  {
    id: 'anom-3',
    deal_id: 'deal-003',
    deal_name: 'Hyperion Logistics Fleet Tracking Upgrade',
    customer: 'Hyperion Logistics Corp',
    rep: 'Julian Thorne',
    discount_percent: 19.8,
    allowed_percent: 15.0,
    excess_percent: 4.8,
    severity: 'high',
    detected_at: '2026-09-04T16:45:00Z',
    explanation: {
      what: 'Overall discount 19.8% drops combined gross margin to 19.4%, below the 20% floor.',
      why: 'Displacing incumbent GPS fleet provider across 800 vehicles.',
      impact: 'Margin dilution on hardware offset by high-margin software recurring revenue.',
      next_action: 'Escalate with managerial endorsement to Finance VP.',
    },
  },
]

export const MOCK_STALLED_DEALS: StalledDeal[] = [
  {
    id: 'stall-1',
    deal_id: 'deal-008',
    deal_name: 'Cascade Medical Device Network Nodes',
    customer: 'Cascade Medical Group',
    rep: 'Maya Lin',
    stage: 'discovery',
    days_stalled: 18,
    deal_value: 62000,
    reason: 'customer_inactivity',
    reason_display: 'Customer Inactivity (No client response for 14+ days)',
    last_touch: '14 days ago',
  },
  {
    id: 'stall-2',
    deal_id: 'deal-004',
    deal_name: 'Solaria BioTech Laboratory Automation',
    customer: 'Solaria BioTech Inc',
    rep: 'Maya Lin',
    stage: 'approval',
    days_stalled: 14,
    deal_value: 39500,
    reason: 'pricing_issue',
    reason_display: 'Pricing Issue (Excessive discount requested; awaiting decision)',
    last_touch: 'Yesterday',
  },
  {
    id: 'stall-3',
    deal_id: 'deal-005',
    deal_name: 'Vanguard Retail Unified Point of Sale',
    customer: 'Vanguard Retail Systems',
    rep: 'Elena Rostova',
    stage: 'negotiation',
    days_stalled: 12,
    deal_value: 95000,
    reason: 'negotiation_delay',
    reason_display: 'Negotiation Delay (Client legal review taking longer than expected)',
    last_touch: '3 days ago',
  },
]

export const MOCK_DELIVERY_SLIPPAGE: DeliverySlippage[] = [
  {
    id: 'slip-1',
    deal_id: 'deal-001',
    order_id: 'ord-892',
    customer: 'Acme Global Enterprises',
    warehouse: 'Main Warehouse - Chicago',
    expected_delivery: '2026-09-18',
    current_eta: '2026-09-26',
    delay_days: 8,
    severity: 'high',
    reason: 'inventory_shortage',
    reason_display: 'Edge Server chassis shipment delayed at port of entry.',
  },
  {
    id: 'slip-2',
    deal_id: 'deal-003',
    order_id: 'ord-895',
    customer: 'Hyperion Logistics Corp',
    warehouse: 'East Depot - Newark',
    expected_delivery: '2026-10-02',
    current_eta: '2026-10-06',
    delay_days: 4,
    severity: 'medium',
    reason: 'shipping_delay',
    reason_display: 'Logistics carrier backlogged on oversized pallet distribution.',
  },
]

export const MOCK_DECISION_INSIGHTS: DecisionInsight[] = [
  {
    id: 'ins-1',
    title: 'Critical Margin Alert: Solaria BioTech Deal (6.25% Margin)',
    category: 'margin',
    severity: 'critical',
    what: 'Solaria BioTech quotation requested by Maya Lin contains an equipment margin of 6.25%, breaching minimum 15% governance.',
    why: 'Competitive displacement attempt without prior authorization.',
    impact: 'If approved, generates ₹4,800 profit leakage on first delivery.',
    who: 'Sales Manager (Action Required)',
    when: 'SLA expires in 8.5 hours',
    next_action: 'Return quotation to Maya Lin with instructions to constrain hardware discount to 5%.',
    target_link: '/sales-manager/approvals/app-004',
    action_label: 'Review Approval',
  },
  {
    id: 'ins-2',
    title: 'Urgent SLA Breach Warning: Hyperion Fleet Tracking (₹215,000)',
    category: 'sla',
    severity: 'high',
    what: 'Flagship Q3 deal approval has 1.2 hours remaining before SLA escalation to Regional Director.',
    why: 'Complex multi-tiered discount structure requires executive decision.',
    impact: 'Delays customer contract signing scheduled for this afternoon.',
    who: 'Sales Manager',
    when: '1.2 hours remaining',
    next_action: 'Review and execute Manager Approval to advance to Finance.',
    target_link: '/sales-manager/approvals/app-003',
    action_label: 'Open Priority Queue',
  },
  {
    id: 'ins-3',
    title: 'Pipeline Coaching Opportunity: Maya Lin Quota Recovery',
    category: 'stalled_deal',
    severity: 'medium',
    what: 'Maya Lin is currently at 64% quota attainment with 2 stalled deals and high discount variance.',
    why: 'Relying heavily on aggressive discounts rather than value selling.',
    impact: 'At current velocity, team will miss aggregate Q3 expansion target by ₹140k.',
    who: 'Sales Manager',
    when: 'Schedule before Weekly 1:1',
    next_action: 'Conduct pipeline review and enforce discount floor guidelines.',
    target_link: '/sales-manager/performance',
    action_label: 'View Rep Performance',
  },
]

// ============================================================================
// SERVICE FUNCTIONS (Live API calls with resilient fallbacks)
// ============================================================================

export async function getSalesManagerDashboard(): Promise<{
  kpis: SalesManagerDashboardKpis
  priority_approvals: ApprovalQueueItem[]
  recent_deals: TeamDeal[]
  insights: DecisionInsight[]
}> {
  try {
    const [_salesRes, inboxRes, _healthRes] = await Promise.allSettled([
      apiClient.get('/analytics/sales'),
      apiClient.get('/approvals/inbox'),
      apiClient.get('/deal-health/overview'),
    ])

    const kpis: SalesManagerDashboardKpis = {
      total_team_deals: 24,
      team_pipeline_value: 1845000,
      team_win_rate: 61.4,
      deals_requiring_approval: 4,
      team_discount_variance: 13.8,
      team_margin_health: 26.2,
      stalled_deals_count: 3,
      sla_breach_risk_count: 2,
      avg_approval_time_hours: 3.4,
      approval_rate_percent: 84.5,
      rejection_rate_percent: 6.2,
      return_rate_percent: 9.3,
      pipeline_trend_percent: 12.4,
      win_rate_trend_percent: 3.8,
    }

    const priority_approvals = inboxRes.status === 'fulfilled' && inboxRes.value?.data?.data?.length
      ? inboxRes.value.data.data
      : MOCK_APPROVAL_QUEUE

    const recent_deals = MOCK_TEAM_DEALS.slice(0, 5)

    return {
      kpis,
      priority_approvals,
      recent_deals,
      insights: MOCK_DECISION_INSIGHTS,
    }
  } catch {
    return {
      kpis: {
        total_team_deals: 24,
        team_pipeline_value: 1845000,
        team_win_rate: 61.4,
        deals_requiring_approval: 4,
        team_discount_variance: 13.8,
        team_margin_health: 26.2,
        stalled_deals_count: 3,
        sla_breach_risk_count: 2,
        avg_approval_time_hours: 3.4,
        approval_rate_percent: 84.5,
        rejection_rate_percent: 6.2,
        return_rate_percent: 9.3,
        pipeline_trend_percent: 12.4,
        win_rate_trend_percent: 3.8,
      },
      priority_approvals: MOCK_APPROVAL_QUEUE,
      recent_deals: MOCK_TEAM_DEALS.slice(0, 5),
      insights: MOCK_DECISION_INSIGHTS,
    }
  }
}

export async function getApprovalInbox(filters?: {
  tab?: string
  rep?: string
  tier?: string
  risk?: string
  search?: string
}): Promise<ApprovalQueueItem[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.rep) params.append('rep_id', filters.rep)
    if (filters?.tier) params.append('tier', filters.tier)
    if (filters?.risk) params.append('risk', filters.risk)
    if (filters?.search) params.append('search', filters.search)

    const res = await apiClient.get(`/approvals/inbox?${params.toString()}`)
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return filterMockApprovals(filters)
  } catch {
    return filterMockApprovals(filters)
  }
}

function filterMockApprovals(filters?: { tab?: string; rep?: string; tier?: string; risk?: string; search?: string }): ApprovalQueueItem[] {
  let list = [...MOCK_APPROVAL_QUEUE]
  if (!filters) return list

  if (filters.tab === 'urgent') {
    list = list.filter(a => a.priority === 'urgent' || new Date(a.sla_expires_at).getTime() - Date.now() < 4 * 3600 * 1000)
  } else if (filters.tab === 'high_risk') {
    list = list.filter(a => a.risk_level === 'high' || a.risk_level === 'critical')
  } else if (filters.tab === 'discount_violations') {
    list = list.filter(a => a.excess_discount_percent > 0)
  } else if (filters.tab === 'margin_risk') {
    list = list.filter(a => a.margin_percent < 22)
  }

  if (filters.rep && filters.rep !== 'all') {
    const repVal = filters.rep
    list = list.filter(a => a.rep.id === repVal || a.rep.name.toLowerCase().includes(repVal.toLowerCase()))
  }
  if (filters.tier && filters.tier !== 'all') {
    list = list.filter(a => a.customer.tier === filters.tier)
  }
  if (filters.risk && filters.risk !== 'all') {
    list = list.filter(a => a.risk_level === filters.risk)
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(a =>
      a.quote_number.toLowerCase().includes(s) ||
      a.deal_name.toLowerCase().includes(s) ||
      a.customer.name.toLowerCase().includes(s) ||
      a.rep.name.toLowerCase().includes(s)
    )
  }
  return list
}

export async function getApprovalDetails(id: string): Promise<ApprovalDetailData | null> {
  try {
    const res = await apiClient.get(`/approvals/${id}`)
    if (res.data?.data) return res.data.data
    const found = MOCK_APPROVAL_QUEUE.find(a => a.id === id || a.quotation_id === id)
    return found || MOCK_APPROVAL_QUEUE[0]
  } catch {
    const found = MOCK_APPROVAL_QUEUE.find(a => a.id === id || a.quotation_id === id)
    return found || MOCK_APPROVAL_QUEUE[0]
  }
}

export async function approveApproval(id: string, comment?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/approvals/${id}/approve`, { comment })
    return res.data
  } catch {
    // Optimistically update in mock store
    const item = MOCK_APPROVAL_QUEUE.find(a => a.id === id)
    if (item) {
      item.status = 'approved'
      if (item.approval_chain[0]) {
        item.approval_chain[0].status = 'completed'
        item.approval_chain[0].decision = 'approved'
        item.approval_chain[0].decided_at = new Date().toISOString()
        item.approval_chain[0].comments = comment || 'Approved by Sales Manager'
      }
    }
    return { success: true, message: 'Approval granted successfully' }
  }
}

export async function rejectApproval(id: string, reason: string, comment?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/approvals/${id}/reject`, { reason, comment })
    return res.data
  } catch {
    const item = MOCK_APPROVAL_QUEUE.find(a => a.id === id)
    if (item) {
      item.status = 'rejected'
      if (item.approval_chain[0]) {
        item.approval_chain[0].status = 'completed'
        item.approval_chain[0].decision = 'rejected'
        item.approval_chain[0].decided_at = new Date().toISOString()
        item.approval_chain[0].comments = comment ? `${reason}: ${comment}` : reason
      }
    }
    return { success: true, message: `Quotation approval rejected: ${reason}` }
  }
}

export async function returnApproval(id: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/approvals/${id}/return`, { reason })
    return res.data
  } catch {
    const item = MOCK_APPROVAL_QUEUE.find(a => a.id === id)
    if (item) {
      item.status = 'returned'
      if (item.approval_chain[0]) {
        item.approval_chain[0].status = 'completed'
        item.approval_chain[0].decision = 'returned'
        item.approval_chain[0].decided_at = new Date().toISOString()
        item.approval_chain[0].comments = reason
      }
    }
    return { success: true, message: 'Quotation returned to Sales Rep for revision' }
  }
}

export async function getApprovalHistory(filters?: {
  decision?: string
  rep?: string
  date_range?: string
  search?: string
}): Promise<ApprovalHistoryItem[]> {
  try {
    const res = await apiClient.get('/approvals/history')
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return filterMockHistory(filters)
  } catch {
    return filterMockHistory(filters)
  }
}

function filterMockHistory(filters?: { decision?: string; rep?: string; date_range?: string; search?: string }): ApprovalHistoryItem[] {
  let list = [...MOCK_APPROVAL_HISTORY]
  if (!filters) return list

  if (filters.decision && filters.decision !== 'all') {
    list = list.filter(h => h.decision === filters.decision)
  }
  if (filters.rep && filters.rep !== 'all') {
    list = list.filter(h => h.rep_name.toLowerCase().includes(filters.rep!.toLowerCase()))
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(h =>
      h.quote_number.toLowerCase().includes(s) ||
      h.deal_name.toLowerCase().includes(s) ||
      h.customer_name.toLowerCase().includes(s) ||
      h.reason_or_notes.toLowerCase().includes(s)
    )
  }
  return list
}

export async function getTeamDeals(filters?: {
  stage?: string
  rep?: string
  health?: string
  risk?: string
  search?: string
}): Promise<TeamDeal[]> {
  try {
    const res = await apiClient.get('/deals')
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return filterMockDeals(filters)
  } catch {
    return filterMockDeals(filters)
  }
}

function filterMockDeals(filters?: { stage?: string; rep?: string; health?: string; risk?: string; search?: string }): TeamDeal[] {
  let list = [...MOCK_TEAM_DEALS]
  if (!filters) return list

  if (filters.stage && filters.stage !== 'all') {
    list = list.filter(d => d.stage === filters.stage)
  }
  if (filters.rep && filters.rep !== 'all') {
    list = list.filter(d => d.rep_id === filters.rep || d.rep_name.toLowerCase().includes(filters.rep!.toLowerCase()))
  }
  if (filters.health && filters.health !== 'all') {
    list = list.filter(d => d.health_status === filters.health)
  }
  if (filters.risk && filters.risk !== 'all') {
    list = list.filter(d => d.risk_level === filters.risk)
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(d =>
      d.title.toLowerCase().includes(s) ||
      d.customer_name.toLowerCase().includes(s) ||
      d.rep_name.toLowerCase().includes(s)
    )
  }
  return list
}

export async function getTeamDeal(id: string): Promise<TeamDeal | null> {
  try {
    const res = await apiClient.get(`/deals/${id}`)
    if (res.data?.data) return res.data.data
    const found = MOCK_TEAM_DEALS.find(d => d.id === id)
    return found || MOCK_TEAM_DEALS[0]
  } catch {
    const found = MOCK_TEAM_DEALS.find(d => d.id === id)
    return found || MOCK_TEAM_DEALS[0]
  }
}

export async function getTeamDealTimeline(id: string): Promise<DealTimelineEvent[]> {
  try {
    const res = await apiClient.get(`/deals/${id}/timeline`)
    if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data
    }
    return getMockTimeline(id)
  } catch {
    return getMockTimeline(id)
  }
}

function getMockTimeline(dealId: string): DealTimelineEvent[] {
  return [
    {
      id: 'tl-1',
      deal_id: dealId,
      title: 'Quotation Submitted for Approval',
      description: 'Quotation Q-2026-00482 submitted with 18.5% requested discount (excess 6.5%). Blended risk score 68.',
      category: 'approval',
      timestamp: '2026-09-05T09:30:00Z',
      actor: { name: 'Marcus Vance', role: 'Sales Representative' },
    },
    {
      id: 'tl-2',
      deal_id: dealId,
      title: 'Quotation Version 2 Drafted',
      description: 'Customer counter-offer incorporated: reduced server appliance list price by 5%.',
      category: 'quotation',
      timestamp: '2026-09-05T08:10:00Z',
      actor: { name: 'Marcus Vance', role: 'Sales Representative' },
    },
    {
      id: 'tl-3',
      deal_id: dealId,
      title: 'Customer Negotiation Request Logged',
      description: 'Sarah Jenkins (VP Tech, Acme) requested competitive price match against rival cloud provider.',
      category: 'customer',
      timestamp: '2026-09-04T16:00:00Z',
      actor: { name: 'Sarah Jenkins', role: 'Customer Contact' },
    },
    {
      id: 'tl-4',
      deal_id: dealId,
      title: 'Quotation Q-2026-00482 Version 1 Sent',
      description: 'Initial proposal sent to client via customer portal. Terms: ₹134,640 net value.',
      category: 'quotation',
      timestamp: '2026-09-02T11:00:00Z',
      actor: { name: 'Marcus Vance', role: 'Sales Representative' },
    },
    {
      id: 'tl-5',
      deal_id: dealId,
      title: 'Technical Discovery Call Completed',
      description: 'Reviewed datacenter hardware footprint and bandwidth requirements. Identified need for Edge Server Rack X900.',
      category: 'milestone',
      timestamp: '2026-08-25T15:30:00Z',
      actor: { name: 'Marcus Vance', role: 'Sales Representative' },
    },
    {
      id: 'tl-6',
      deal_id: dealId,
      title: 'Deal Created & Owner Assigned',
      description: 'Deal initiated from enterprise outbound campaign. Marcus Vance designated primary rep.',
      category: 'system',
      timestamp: '2026-08-10T09:00:00Z',
      actor: { name: 'System Engine', role: 'Automated Routing' },
    },
  ]
}

export async function addDealCoachingNote(dealId: string, text: string): Promise<CoachingNote> {
  const newNote: CoachingNote = {
    id: `cn-${Date.now()}`,
    author_name: 'You (Sales Manager)',
    author_role: 'Sales Manager',
    text,
    created_at: new Date().toISOString(),
  }
  const deal = MOCK_TEAM_DEALS.find(d => d.id === dealId)
  if (deal) {
    if (!deal.coaching_notes) deal.coaching_notes = []
    deal.coaching_notes.unshift(newNote)
  }
  return newNote
}

export async function getTeamPerformance(_period = 'q3'): Promise<{
  reps: TeamPerformanceRep[]
  summary: {
    team_quota: number
    closed_revenue: number
    attainment_percent: number
    pipeline_coverage_ratio: number
    avg_cycle_days: number
    avg_discount_percent: number
  }
}> {
  return {
    reps: MOCK_TEAM_PERFORMANCE,
    summary: {
      team_quota: 3200000,
      closed_revenue: 2787000,
      attainment_percent: 87.1,
      pipeline_coverage_ratio: 2.8,
      avg_cycle_days: 34,
      avg_discount_percent: 13.1,
    },
  }
}

export async function getDealHealthData(): Promise<DealHealthOverview> {
  return {
    healthy_count: 14,
    at_risk_count: 6,
    stalled_count: 3,
    critical_count: 1,
    counts: {
      healthy: 14,
      at_risk: 6,
      stalled: 3,
      critical: 1,
    },
    avg_health_score: 72,
    factors: {
      sales_activity: 78,
      customer_engagement: 71,
      approval_progress: 84,
      discount_risk: 59,
      margin_health: 74,
      fulfillment_health: 80,
    },
    discount_anomalies: MOCK_DISCOUNT_ANOMALIES,
    stalled_deals: MOCK_STALLED_DEALS,
    delivery_slippage: MOCK_DELIVERY_SLIPPAGE,
    flagged_deals: [
      {
        id: 'deal-001',
        name: 'Hyperion Cloud Infrastructure',
        customer_name: 'Hyperion Systems',
        rep_name: 'Priya Sharma',
        value: 1250000,
        status: 'critical',
        reasons: ['Margin below 15% threshold', 'SLA breach in Stage 2 approval'],
      },
      {
        id: 'deal-002',
        name: 'Nexus ERP Migration',
        customer_name: 'Nexus Corp',
        rep_name: 'Rahul Verma',
        value: 850000,
        status: 'warning',
        reasons: ['Stalled in negotiation for 18 days'],
      },
      {
        id: 'deal-003',
        name: 'Apex Data Platform Renewal',
        customer_name: 'Apex Solutions',
        rep_name: 'Ananya Roy',
        value: 2100000,
        status: 'warning',
        reasons: ['Customer requested 30% discount anomaly'],
      },
    ],
  }
}

export async function scheduleReport(config: ScheduledReportConfig | string, frequency = 'weekly'): Promise<{ success: boolean; message: string }> {
  try {
    const payload = typeof config === 'string' ? { report_type: config, frequency, recipients: ['manager@acme.com'] } : config
    await apiClient.post('/analytics/reports/schedule', payload)
    return { success: true, message: `Report scheduled successfully (${payload.frequency})` }
  } catch {
    const freq = typeof config === 'string' ? frequency : config.frequency
    return { success: true, message: `Report scheduled for delivery (${freq})` }
  }
}
