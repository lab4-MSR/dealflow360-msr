import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(b: string | null): string {
  if (!b) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return b;
}

export async function listApprovalRules(b: string) {
  const { data, error } = await serviceClient.from('approval_rules').select('*').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}
export async function createApprovalRule(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('approval_rules').insert({ business_id: tenant(b), name: input.name, trigger_type: input.trigger_type, trigger_config: input.trigger_config ?? {}, chain_id: input.chain_id ?? null }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}
export async function getApprovalRule(b: string, id: string) {
  const { data, error } = await serviceClient.from('approval_rules').select('*').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Approval rule not found.');
  return data;
}
export async function updateApprovalRule(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['name','trigger_type','trigger_config','chain_id','status'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  const { data, error } = await serviceClient.from('approval_rules').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Approval rule not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}
export async function deleteApprovalRule(b: string, id: string) {
  const { error } = await serviceClient.from('approval_rules').delete().eq('business_id', b).eq('id', id);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return { id, deleted: true };
}

export async function listApprovalChains(b: string) {
  const { data, error } = await serviceClient.from('approval_chains').select('*, approval_steps(*)').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}
export async function createApprovalChain(b: string, input: { name: string; steps: Array<Record<string, unknown>> }) {
  const { data: chain, error } = await serviceClient.from('approval_chains').insert({ business_id: tenant(b), name: input.name, status: 'inactive' }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (input.steps?.length) await serviceClient.from('approval_steps').insert(input.steps.map((s, i) => ({ business_id: tenant(b), chain_id: chain.id, order_index: s.order_index ?? i, approver_role: s.approver_role, mode: s.mode ?? 'sequential', sla_hours: s.sla_hours, escalation: s.escalation ?? {}, condition: s.condition ?? {} })));
  return getApprovalChain(b, chain.id);
}
export async function getApprovalChain(b: string, id: string) {
  const { data, error } = await serviceClient.from('approval_chains').select('*, approval_steps(*)').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Approval chain not found.');
  return data;
}
export async function updateApprovalChain(b: string, id: string, input: { name?: string; steps?: Array<Record<string, unknown>> }) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  const { data, error } = await serviceClient.from('approval_chains').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Approval chain not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  if (input.steps) {
    await serviceClient.from('approval_steps').delete().eq('business_id', b).eq('chain_id', id);
    if (input.steps.length) await serviceClient.from('approval_steps').insert(input.steps.map((s, i) => ({ business_id: tenant(b), chain_id: id, order_index: s.order_index ?? i, approver_role: s.approver_role, mode: s.mode ?? 'sequential', sla_hours: s.sla_hours, escalation: s.escalation ?? {}, condition: s.condition ?? {} })));
  }
  return getApprovalChain(b, id);
}
export async function setChainStatus(b: string, id: string, status: string) {
  const { data, error } = await serviceClient.from('approval_chains').update({ status }).eq('business_id', b).eq('id', id).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getApprovalThresholds(b: string) {
  const { data, error } = await serviceClient.from('approval_thresholds').select('*').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}
export async function updateApprovalThresholds(b: string, metric: string, bands: Array<Record<string, unknown>>) {
  await serviceClient.from('approval_thresholds').delete().eq('business_id', b).eq('metric', metric);
  if (bands.length) await serviceClient.from('approval_thresholds').insert(bands.map((bn) => ({ business_id: b, metric, band_min: bn.band_min ?? null, band_max: bn.band_max ?? null, approver_role: bn.approver_role, chain_id: bn.chain_id ?? null })));
  return getApprovalThresholds(b);
}

export async function runApprovalSimulator(b: string, input: { customer_id?: string; deal_value: number; products: Array<{ product_id: string; quantity: number }>; discount_percent?: number; margin_percent?: number; risk_score?: number }) {
  const discount = Number(input.discount_percent ?? 0);
  const { data: rules } = await serviceClient.from('approval_rules').select('*').eq('business_id', b).eq('status', 'active');
  const triggered = (rules ?? []).filter((r) => {
    const cfg = (r.trigger_config ?? {}) as Record<string, unknown>;
    const threshold = Number(cfg.discount_threshold ?? cfg.deal_value_threshold ?? cfg.risk_threshold ?? cfg.margin_threshold ?? 0);
    if (cfg.discount_threshold !== undefined && discount >= threshold) return true;
    if (cfg.deal_value_threshold !== undefined && input.deal_value >= threshold) return true;
    return false;
  });
  const approval_required = discount > 10 || input.deal_value > 10000 || triggered.length > 0;
  const approval_level = discount > 25 ? 'finance' : discount > 10 ? 'sales_manager' : 'none';
  return {
    approval_required,
    approval_level,
    next_approver_role: approval_level === 'finance' ? 'finance' : 'sales_manager',
    triggered_rules: (rules ?? []).map((r) => ({ id: r.id, name: r.name, trigger_type: r.trigger_type })),
    decision_reason: approval_required ? `Discount ${discount}% exceeded threshold or deal value triggers approval.` : 'Within allowed limits.',
    recommended_action: approval_required ? 'Submit for approval.' : 'Auto-approve.',
    sla_hours: approval_level === 'finance' ? 48 : 24,
  };
}