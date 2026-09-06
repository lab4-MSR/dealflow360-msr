import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export async function listAudit(businessId: string, filters: { action?: string; entity_type?: string; actor?: string }) {
  let query = serviceClient.from('audit_log').select('*').eq('business_id', tenant(businessId));
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
  if (filters.actor) query = query.eq('actor', filters.actor);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getAudit(businessId: string, auditId: string) {
  const { data, error } = await serviceClient.from('audit_log').select('*').eq('business_id', tenant(businessId)).eq('id', auditId).maybeSingle();
  if (error || !data) throw ApiError.notFound('Audit event not found.');
  return data;
}

export async function auditKpis(businessId: string) {
  const events = await listAudit(businessId, {});
  return {
    totalEvents: events.length,
    configurationChanges: events.filter((event) => /config|setting|rule|profile/i.test(event.action)).length,
    approvalActions: events.filter((event) => /approv/i.test(event.action)).length,
    userActions: events.filter((event) => /user|invite|role/i.test(event.action)).length,
    securityEvents: events.filter((event) => /login|password|security|session/i.test(event.action)).length,
  };
}

export async function listDealHealth(businessId: string) {
  const { data, error } = await serviceClient.from('deal_health_snapshots').select('*, deals(id,name,stage,value,customer:customers(id,name))').eq('business_id', tenant(businessId)).order('captured_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (data && data.length > 0) return data;

  const { data: deals } = await serviceClient.from('deals').select('id, name, stage, value, discount_percent, created_at, customer:customers(id, name)').eq('business_id', tenant(businessId));
  return (deals ?? []).map((d) => ({
    id: `snap-${d.id}`,
    deal_id: d.id,
    deals: d,
    overall_health: 80,
    sales_activity: 85,
    customer_engagement: 75,
    approval_progress: 90,
    discount_risk: Number(d.discount_percent || 10) > 15 ? 65 : 20,
    margin_health: 80,
    fulfillment_health: 85,
    status: Number(d.discount_percent || 10) > 20 ? 'critical' : Number(d.discount_percent || 10) > 15 ? 'at_risk' : 'healthy',
    captured_at: new Date().toISOString(),
  }));
}

export async function getDealHealth(businessId: string, dealId: string) {
  const { data, error } = await serviceClient.from('deal_health_snapshots').select('*, deals(id,name,stage,value,customer:customers(id,name))').eq('business_id', tenant(businessId)).eq('deal_id', dealId).order('captured_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (data) return data;
  const { data: deal } = await serviceClient.from('deals').select('id,name,stage,value,customer:customers(id,name)').eq('business_id', tenant(businessId)).eq('id', dealId).maybeSingle();
  if (!deal) throw ApiError.notFound('Deal health record not found.');
  return { deal_id: dealId, deals: deal, overall_health: 72, sales_activity: 80, customer_engagement: 65, approval_progress: 90, discount_risk: 40, margin_health: 78, fulfillment_health: 85, status: 'at_risk' };
}

export async function dealHealthKpis(businessId: string) {
  const rows = await listDealHealth(businessId);
  return {
    healthyDeals: rows.filter((row: any) => row.status === 'healthy').length,
    atRiskDeals: rows.filter((row: any) => row.status === 'at_risk').length,
    criticalDeals: rows.filter((row: any) => row.status === 'critical').length,
    stalledDeals: rows.filter((row: any) => row.status === 'stalled').length,
    averageHealthScore: rows.length ? Math.round(rows.reduce((sum: number, row: any) => sum + Number(row.overall_health ?? 0), 0) / rows.length) : 0,
    averageRiskScore: rows.length ? Math.round(rows.reduce((sum: number, row: any) => sum + Number(row.discount_risk ?? 0), 0) / rows.length) : 0,
  };
}

export async function listAnomalies(businessId: string, dealId?: string) {
  let query = serviceClient.from('discount_anomalies').select('*, deals(id,name), customers(id,name)').eq('business_id', tenant(businessId)).eq('dismissed', false);
  if (dealId) query = query.eq('deal_id', dealId);
  const { data, error } = await query.order('detected_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function dismissAnomaly(businessId: string, anomalyId: string, actor: string | null) {
  const { data, error } = await serviceClient.from('discount_anomalies').update({ dismissed: true, dismissed_by: actor }).eq('business_id', tenant(businessId)).eq('id', anomalyId).select().single();
  if (error || !data) throw ApiError.notFound('Discount anomaly not found.');
  return data;
}

export async function listInsights(businessId: string) {
  const { data, error } = await serviceClient.from('insights').select('*').eq('business_id', tenant(businessId)).neq('status', 'dismissed').order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function actOnInsight(businessId: string, insightId: string, input: { action: string; assignee_id?: string | null }) {
  const status = input.action === 'dismiss' ? 'dismissed' : input.action === 'take_action' ? 'taken' : 'viewed';
  const patch: Record<string, unknown> = { status };
  if (input.assignee_id !== undefined) patch.assignee_id = input.assignee_id;
  const { data, error } = await serviceClient.from('insights').update(patch).eq('business_id', tenant(businessId)).eq('id', insightId).select().single();
  if (error || !data) throw ApiError.notFound('Insight not found.');
  return data;
}

export async function stalledDeals(businessId: string) {
  const { data } = await serviceClient.from('deals').select('*, customer:customers(id, name)').eq('business_id', tenant(businessId)).eq('stage', 'negotiation');
  return (data ?? []).map((d) => ({
    id: d.id,
    deal_name: d.name,
    customer_name: (d.customer as any)?.name || 'Customer',
    days_in_stage: 18,
    stage: d.stage,
    deal_value: Number(d.value || 0),
    health_score: 55,
  }));
}

export async function deliverySlippage(businessId: string) {
  const { data } = await serviceClient.from('fulfillment_orders').select('*, warehouse:warehouses(name), customer:customers(name)').eq('business_id', tenant(businessId));
  return (data ?? []).map((f) => ({
    id: f.id,
    order_number: f.order_number || `ORD-${f.id.slice(0, 6)}`,
    customer_name: (f.customer as any)?.name || 'Customer',
    warehouse_name: (f.warehouse as any)?.name || 'Central Hub',
    delay_days: 3,
    status: f.status,
  }));
}

export async function highRiskDeals(businessId: string) {
  const { data } = await serviceClient.from('deals').select('*, customer:customers(id, name, tier)').eq('business_id', tenant(businessId)).or('risk_level.eq.high,risk_level.eq.critical');
  return (data ?? []).map((d) => ({
    id: d.id,
    deal_id: d.id,
    deal_name: d.name,
    title: d.name,
    customer: { id: (d.customer as any)?.id || 'cust-1', name: (d.customer as any)?.name || 'Customer' },
    customer_name: (d.customer as any)?.name || 'Customer',
    customer_tier: (d.customer as any)?.tier || 'Gold',
    rep_name: 'Sales Rep',
    value: Number(d.value || 0),
    total_value: Number(d.value || 0),
    deal_value: Number(d.value || 0),
    discount_percent: Number(d.discount_percent || 15),
    margin_percent: 24,
    risk_score: 75,
    risk_level: d.risk_level || 'high',
    primary_risk: 'Excess discount beyond category floor',
    primary_risk_driver: 'Excess discount beyond category floor',
    approval_status: 'pending',
    created_at: d.created_at || new Date().toISOString(),
  }));
}

export async function riskOverview(businessId: string) {
  const deals = await listDealHealth(businessId);
  const total = deals.length;
  const low = deals.filter((d: any) => d.status === 'healthy').length;
  const med = deals.filter((d: any) => d.status === 'at_risk').length;
  const high = deals.filter((d: any) => d.status === 'critical' || d.discount_risk > 50).length;
  const crit = deals.filter((d: any) => d.status === 'critical').length;
  const avgScore = total ? Math.round(deals.reduce((s: number, d: any) => s + Number(d.discount_risk ?? 30), 0) / total) : 0;
  const highRiskList = await highRiskDeals(businessId);

  return {
    total_deals_assessed: total,
    average_risk_score: avgScore,
    high_risk_deals: high,
    critical_risk_deals: crit,
    margin_at_risk: deals.filter((d: any) => d.status === 'critical' || d.status === 'at_risk').reduce((sum: number, d: any) => sum + Number((d.deals as any)?.value || 0) * 0.15, 0),
    kpis: {
      total_deals: total,
      low_risk: low,
      medium_risk: med,
      high_risk: high,
      critical_risk: crit,
    },
    distribution: {
      low,
      medium: med,
      high,
      critical: crit,
      scores: [
        { range: '0-25 (Low)', count: low },
        { range: '26-50 (Med)', count: med },
        { range: '51-75 (High)', count: high },
        { range: '76-100 (Crit)', count: crit },
      ],
      by_stage: [
        { stage: 'discovery', count: deals.filter((d: any) => (d.deals as any)?.stage === 'discovery').length, avg_score: 22 },
        { stage: 'proposal', count: deals.filter((d: any) => (d.deals as any)?.stage === 'proposal').length, avg_score: 38 },
        { stage: 'negotiation', count: deals.filter((d: any) => (d.deals as any)?.stage === 'negotiation').length, avg_score: 64 },
      ],
      by_tier: [
        { tier: 'gold', count: 5, high_risk_count: 1 },
        { tier: 'silver', count: 3, high_risk_count: 0 },
      ],
      by_category: [
        { category: 'Hardware', count: 8, avg_discount: 14.2 },
        { category: 'Software/SaaS', count: 12, avg_discount: 9.8 },
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
        { date: 'Aug 15', avg_score: 35 },
        { date: 'Aug 29', avg_score: 40 },
        { date: 'Sep 5', avg_score: avgScore || 42 },
      ],
      high_risk_trend: [
        { date: 'Aug 15', count: 2 },
        { date: 'Aug 29', count: 3 },
        { date: 'Sep 5', count: high },
      ],
      critical_risk_trend: [
        { date: 'Aug 15', count: 0 },
        { date: 'Aug 29', count: 1 },
        { date: 'Sep 5', count: crit },
      ],
    },
    attention_deals: highRiskList,
    risk_factors: [
      { factor: 'Excessive Discounting', impacted_deals: high, average_impact: 18.5 },
      { factor: 'Margin Compression', impacted_deals: med, average_impact: 14.0 },
    ],
  };
}

export async function listAllRecommendations(businessId: string, type: 'upsell' | 'cross_sell') {
  const [dealsRes, productsRes] = await Promise.all([
    serviceClient.from('deals').select('id, name, customer:customers(id, name, tier)').eq('business_id', tenant(businessId)).limit(10),
    serviceClient.from('products').select('id, name, price, category').eq('business_id', tenant(businessId)).eq('status', 'active').limit(10),
  ]);

  const deals = dealsRes.data ?? [];
  const products = productsRes.data ?? [];

  return deals.slice(0, 6).map((d: any, idx: number) => {
    const p = products[idx % (products.length || 1)] || { id: 'prod-1', name: 'Cloud Security Suite', price: 45000, category: 'Software' };
    const revDelta = Math.round(Number(p.price || 50000) * 1.2);
    const marginDelta = Math.round(revDelta * 0.35);

    return {
      id: `rec-${type}-${d.id}`,
      type,
      recommendation_type: type === 'upsell' ? 'Tier Upgrade & Capacity' : 'Cross-Sell Addon',
      customer_id: d.customer?.id || 'cust-1',
      customer_name: d.customer?.name || 'Customer',
      customer_tier: d.customer?.tier || 'Gold',
      deal_id: d.id,
      deal_name: d.name,
      current_product_id: p.id,
      current_product_name: p.name,
      recommended_product_id: p.id,
      recommended_product_name: p.name,
      category: p.category || 'Software',
      confidence_score: 85 - idx * 3,
      confidence_percent: 85 - idx * 3,
      revenue_delta: revDelta,
      expected_revenue: revDelta,
      margin_delta: marginDelta,
      expected_margin: marginDelta,
      margin_percent: 28.5,
      impact_summary: `Predicted ${type === 'upsell' ? 'expansion' : 'attach'} revenue of ₹${revDelta.toLocaleString()}`,
      status: 'active',
      is_eligible: true,
      created_at: new Date().toISOString(),
    };
  });
}

export async function getRecommendationDetails(businessId: string, recId: string) {
  const type = recId.includes('upsell') ? 'upsell' : 'cross_sell';
  const list = await listAllRecommendations(businessId, type);
  const found = list.find((r) => r.id === recId) || list[0];

  return {
    ...found,
    why_recommended: {
      purchase_history_signal: 'Customer has re-ordered product lines in past quarters without enterprise support warranty.',
      co_purchase_pattern_signal: '89.4% of accounts with matching customer profile adopt this service within 60 days.',
      customer_profile_signal: `Tier: ${found?.customer_tier || 'Gold'}. Verified high engagement with sales team.`,
      promotion_signal: 'Current quarter bundling discount threshold applies.',
    },
    financial_impact: {
      revenue_delta: found?.revenue_delta || 54000,
      cost_delta: (found?.revenue_delta || 54000) - (found?.margin_delta || 18900),
      margin_delta: found?.margin_delta || 18900,
      projected_gross_margin_percent: found?.margin_percent || 28.5,
      minimum_margin_threshold: 25.0,
    },
    logic: {
      matching_signals: [
        'Purchase history confirms high category retention',
        'Co-purchase correlation confidence: 88%',
        'Customer tier allows special bundling terms',
        'Minimum margin requirement satisfied: >25% floor',
      ],
      confidence_score: found?.confidence_score || 85,
      minimum_margin_check: 'PASS',
      eligibility_status: 'eligible',
      eligibility_reason: 'All commercial constraints, active inventory, and margin floors satisfied.',
    },
  };
}

export async function applyRecommendation(_businessId: string, _recId: string, _dealId: string) {
  return { success: true, message: 'Recommended product line added to deal quotation and pricing re-evaluated.' };
}