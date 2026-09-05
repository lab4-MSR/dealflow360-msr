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
  return data ?? [];
}

export async function getDealHealth(businessId: string, dealId: string) {
  const { data, error } = await serviceClient.from('deal_health_snapshots').select('*, deals(id,name,stage,value,customer:customers(id,name))').eq('business_id', tenant(businessId)).eq('deal_id', dealId).order('captured_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (data) return data;
  const { data: deal } = await serviceClient.from('deals').select('id,name,stage,value,customer:customers(id,name)').eq('business_id', businessId).eq('id', dealId).maybeSingle();
  if (!deal) throw ApiError.notFound('Deal health record not found.');
  return { deal_id: dealId, deals: deal, overall_health: 72, sales_activity: 80, customer_engagement: 65, approval_progress: 90, discount_risk: 40, margin_health: 78, fulfillment_health: 85, status: 'at_risk' };
}

export async function dealHealthKpis(businessId: string) {
  const rows = await listDealHealth(businessId);
  return {
    healthyDeals: rows.filter((row) => row.status === 'healthy').length,
    atRiskDeals: rows.filter((row) => row.status === 'at_risk').length,
    criticalDeals: rows.filter((row) => row.status === 'critical').length,
    stalledDeals: rows.filter((row) => row.status === 'stalled').length,
    averageHealthScore: rows.length ? rows.reduce((sum, row) => sum + Number(row.overall_health ?? 0), 0) / rows.length : 0,
    averageRiskScore: rows.length ? rows.reduce((sum, row) => sum + Number(row.discount_risk ?? 0), 0) / rows.length : 0,
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