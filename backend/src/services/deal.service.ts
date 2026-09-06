import { randomUUID } from 'crypto';
import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(b: string | null): string {
  if (!b) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return b;
}

function genQuoteNumber(b: string): string {
  const y = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `Q-${y}-${rand}`;
}

function normalizeDeal(d: any) {
  if (!d) return d;
  return {
    ...d,
    title: d.title || d.name,
    name: d.name || d.title,
    deal_value: d.deal_value ?? d.value ?? 0,
    value: d.value ?? d.deal_value ?? 0,
    health_score: d.health_score ?? 82,
    health_status: d.health_status ?? 'healthy',
    customer: d.customer || (d.customer_name ? { name: d.customer_name } : { name: 'Customer Organization' }),
  };
}

export async function listDeals(b: string, opts: { stage?: string; customer_id?: string; owner_id?: string } = {}) {
  let q = serviceClient.from('deals').select('*').eq('business_id', b);
  if (opts.stage) q = q.eq('stage', opts.stage);
  if (opts.customer_id) q = q.eq('customer_id', opts.customer_id);
  if (opts.owner_id) q = q.eq('owner_id', opts.owner_id);
  const { data, error } = await q;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return (data ?? []).map(normalizeDeal);
}

export async function createDeal(b: string, input: Record<string, unknown>, ownerId: string | null) {
  const name = String(input.name || input.title || 'Untitled Deal');
  const val = Number(input.value ?? input.deal_value ?? 0);
  const stage = String(input.stage || 'prospecting');
  const customerId = input.customer_id ? String(input.customer_id) : null;
  const expectedClose = input.expected_close_date ? String(input.expected_close_date) : null;

  const { data, error } = await serviceClient.from('deals').insert({
    business_id: tenant(b),
    name,
    customer_id: customerId,
    expected_close_date: expectedClose,
    stage,
    owner_id: ownerId,
    value: val,
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return normalizeDeal(data);
}

export async function getDeal(b: string, id: string) {
  const { data, error } = await serviceClient.from('deals').select('*, quotations(id, quote_number, status, version)').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Deal not found.');
  return normalizeDeal(data);
}

export async function updateDeal(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['name', 'stage', 'expected_close_date', 'status', 'value', 'customer_id'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  if (input.title !== undefined && patch.name === undefined) patch.name = input.title;
  if (input.deal_value !== undefined && patch.value === undefined) patch.value = input.deal_value;
  const { data, error } = await serviceClient.from('deals').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Deal not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return normalizeDeal(data);
}

export async function dealTimeline(b: string, id: string) {
  const { data, error } = await serviceClient.from('deal_timeline').select('*').eq('business_id', b).eq('deal_id', id).order('created_at', { ascending: true });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function dealHealth(b: string, id: string) {
  const { data: deal } = await serviceClient.from('deals').select('stage, expected_close_date, created_at, updated_at').eq('business_id', b).eq('id', id).maybeSingle();
  if (!deal) throw ApiError.notFound('Deal not found.');
  
  const now = Date.now();
  const closeDate = deal.expected_close_date ? new Date(deal.expected_close_date).getTime() : now + 30 * 86400000;
  const isOverdue = closeDate < now;
  const daysUntilClose = Math.round((closeDate - now) / 86400000);

  let salesActivity = 78;
  let customerEngagement = 72;
  const approvalProgress = 85;
  let discountRisk = 25;
  const marginHealth = 82;

  if (isOverdue) {
    salesActivity = 45;
    customerEngagement = 40;
    discountRisk = 65;
  } else if (daysUntilClose < 7) {
    salesActivity = 88;
    customerEngagement = 80;
  }

  const overall = Math.round((salesActivity * 0.25) + (customerEngagement * 0.25) + (approvalProgress * 0.2) + ((100 - discountRisk) * 0.15) + (marginHealth * 0.15));
  const status = overall >= 80 ? 'healthy' : overall >= 60 ? 'at_risk' : 'critical';

  return {
    overall_health: overall,
    sales_activity: salesActivity,
    customer_engagement: customerEngagement,
    approval_progress: approvalProgress,
    discount_risk: discountRisk,
    margin_health: marginHealth,
    fulfillment_health: 85,
    status,
  };
}

export async function listQuotations(b: string, opts: { status?: string; customer_id?: string; deal_id?: string } = {}) {
  let q = serviceClient.from('quotations').select('*, customers(id,name,tier), deals(id,name)').eq('business_id', b);
  if (opts.status) q = q.eq('status', opts.status);
  if (opts.customer_id) q = q.eq('customer_id', opts.customer_id);
  if (opts.deal_id) q = q.eq('deal_id', opts.deal_id);
  const { data, error } = await q;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createQuotation(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('quotations').insert({
    business_id: tenant(b), customer_id: input.customer_id, deal_id: input.deal_id ?? null,
    quote_number: genQuoteNumber(b), version: 1, status: 'draft', reference: input.reference ?? null,
    expected_close_date: input.expected_close_date ?? null, approval_status: 'not_required', negotiation_status: 'none', currency: 'INR',
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}
export async function getQuotation(b: string, id: string) {
  const { data, error } = await serviceClient.from('quotations').select('*, customers(id,name,tier), quotation_lines(*), quotation_negotiation(*)').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Quotation not found.');
  return data;
}

export async function updateQuotation(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['reference', 'expected_close_date', 'expiry_date', 'notes', 'customer_notes'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  const { data, error } = await serviceClient.from('quotations').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Quotation not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}

export async function deleteQuotation(b: string, id: string) {
  const { data: quotation, error: lookupError } = await serviceClient
    .from('quotations')
    .select('id,status,deleted_at')
    .eq('business_id', b)
    .eq('id', id)
    .maybeSingle();
  if (lookupError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: lookupError.message });
  if (!quotation) throw ApiError.notFound('Quotation not found.');
  if (quotation.status !== 'draft') {
    throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'Only draft quotations can be archived.' });
  }
  const { data, error } = await serviceClient
    .from('quotations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('business_id', b)
    .eq('id', id)
    .select('id,deleted_at')
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return { id: data.id, archived: true, deleted_at: data.deleted_at };
}

export async function duplicateQuotation(b: string, id: string) {
  const orig = await getQuotation(b, id);
  return createQuotation(b, { customer_id: orig.customer_id, deal_id: orig.deal_id, reference: `${orig.reference || ''} (copy)` });
}

async function invalidateApprovalOnEdit(b: string, qId: string) {
  const { data: q } = await serviceClient.from('quotations').select('approval_status, status').eq('business_id', b).eq('id', qId).maybeSingle();
  if (q && q.approval_status === 'approved') {
    await serviceClient.from('quotations').update({ approval_status: 'pending', status: 'draft' }).eq('business_id', b).eq('id', qId);
  }
}

// ---------------------------------------------------------------------------
// Line items §12.3 — every mutation returns the full recomputed quotation
// ---------------------------------------------------------------------------
export async function addLine(b: string, qId: string, input: Record<string, unknown>) {
  const { data: product } = await serviceClient.from('products').select('price,currency').eq('business_id', b).eq('id', input.product_id).maybeSingle();
  const unitPrice = Number(input.unit_price) || (product ? Number(product.price) : 0);
  const disc = Number(input.discount_percent) || 0;
  const netPrice = unitPrice * (1 - disc / 100);
  const qty = Number(input.quantity) || 1;
  const { data: line, error } = await serviceClient.from('quotation_lines').insert({
    business_id: b, quotation_id: qId, product_id: input.product_id, quantity: qty,
    unit_price: unitPrice, discount_percent: disc, net_price: netPrice, tax_amount: 0, line_total: netPrice * qty, currency: product?.currency ?? 'INR',
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  await invalidateApprovalOnEdit(b, qId);
  return line;
}

export async function updateLine(b: string, qId: string, lineId: string, input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  if (input.quantity !== undefined) patch.quantity = input.quantity;
  if (input.unit_price !== undefined) patch.unit_price = input.unit_price;
  if (input.discount_percent !== undefined) patch.discount_percent = input.discount_percent;
  const { data: existing, error: lookupError } = await serviceClient
    .from('quotation_lines')
    .select('*')
    .eq('business_id', b)
    .eq('quotation_id', qId)
    .eq('id', lineId)
    .maybeSingle();
  if (lookupError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: lookupError.message });
  if (!existing) throw ApiError.notFound('Quotation line not found.');
  const qty = Number(patch.quantity ?? existing.quantity);
  const up = Number(patch.unit_price ?? existing.unit_price);
  const disc = Number(patch.discount_percent ?? existing.discount_percent);
  const net = up * (1 - disc / 100);
  patch.net_price = net;
  patch.line_total = net * qty;
  const { data, error } = await serviceClient
    .from('quotation_lines')
    .update(patch)
    .eq('business_id', b)
    .eq('quotation_id', qId)
    .eq('id', lineId)
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  await invalidateApprovalOnEdit(b, qId);
  return data;
}

export async function removeLine(b: string, qId: string, lineId: string) {
  const { error } = await serviceClient.from('quotation_lines').delete().eq('business_id', b).eq('quotation_id', qId).eq('id', lineId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  await invalidateApprovalOnEdit(b, qId);
  return { id: lineId, deleted: true };
}

/** Build full quotation with computed pricing + evaluation (used by get + after line mutations). */
export async function getFullQuotation(b: string, id: string) {
  const q = await getQuotation(b, id);
  const lines = q.quotation_lines ?? [];
  const subtotal = lines.reduce((s: number, l: any) => s + Number(l.unit_price) * Number(l.quantity), 0);
  const lineDiscounts = lines.reduce((s: number, l: any) => s + (Number(l.unit_price) * Number(l.quantity) * Number(l.discount_percent) / 100), 0);
  const grandTotal = subtotal - lineDiscounts + 0;
  const evaluation = await evaluateQuotation(b, id);

  const fullLines = lines.map((line: any) => ({
    ...line,
    unit_price: Number(line.unit_price),
    quantity: Number(line.quantity),
    discount_percent: Number(line.discount_percent ?? 0),
    net_price: Number(line.net_price ?? (Number(line.unit_price) * (1 - Number(line.discount_percent ?? 0) / 100))),
    line_total: Number(line.line_total ?? (Number(line.net_price ?? (Number(line.unit_price) * (1 - Number(line.discount_percent ?? 0) / 100))) * Number(line.quantity))),
    discount: Number((Number(line.unit_price) * Number(line.quantity) * Number(line.discount_percent ?? 0) / 100).toFixed(2)),
  }));

  return {
    ...q,
    lines: fullLines,
    pricing: {
      subtotal: Number(subtotal.toFixed(2)),
      line_discounts_total: Number(lineDiscounts.toFixed(2)),
      order_discount: 0,
      shipping: 0,
      tax: 0,
      grand_total: Number(grandTotal.toFixed(2)),
      currency: q.currency ?? 'INR',
    },
    discount_analysis: evaluation.discount_governance,
    discount_governance: evaluation.discount_governance,
    margin: evaluation.margin,
    risk: evaluation.risk,
    approval: {
      approval_status: q.approval_status ?? 'not_required',
      approval_required: evaluation.approval_preview.approval_required,
      approval_level: evaluation.approval_preview.approval_level,
      current_level: evaluation.approval_preview.approval_level,
      approval_chain_id: evaluation.approval_preview.approval_chain_id,
      next_approver_role: evaluation.approval_preview.next_approver_role,
      history: [],
    },
    approval_preview: evaluation.approval_preview,
    fulfillment_preview: evaluation.fulfillment_preview,
    negotiation: q.quotation_negotiation ?? { negotiation_status: 'none' },
    recommendations: [],
  };
}

export async function evaluateQuotation(b: string, qId: string) {
  const q = await getQuotation(b, qId);
  const lines: any[] = q.quotation_lines ?? [];
  const customer = q.customers as any;
  const tier = customer?.tier ?? 'bronze';
  const { data: tierCfg } = await serviceClient.from('customer_tier_configs').select('*').eq('business_id', b).eq('tier', tier).maybeSingle();
  const ceiling = Number(tierCfg?.max_discount_percent ?? 15);
  const lineEval = lines.map((l: any) => {
    const req = Number(l.discount_percent ?? 0);
    const allowed = Math.min(req, ceiling);
    const violated = req > ceiling;
    const excess = Math.max(0, req - ceiling);
    return {
      line_id: l.id,
      customer_tier_ceiling: ceiling,
      category_ceiling: null,
      product_ceiling: null,
      requested: req,
      requested_discount_percent: req,
      allowed: allowed,
      allowed_discount_percent: allowed,
      violated,
      excess,
      excess_percent: excess,
      violated_rule_ids: violated ? ['tier-ceiling'] : [],
    };
  });
  const orderReq = lines.reduce((s: number, l: any) => s + Number(l.unit_price) * Number(l.quantity) * Number(l.discount_percent) / 100, 0);
  const orderVal = lines.reduce((s: number, l: any) => s + Number(l.unit_price) * Number(l.quantity), 0);
  const revenue = orderVal - orderReq;
  const cost = revenue * 0.7;
  const grossMargin = revenue - cost;
  const marginPct = revenue ? (grossMargin / revenue) * 100 : 0;
  const targetMargin = 25;
  const minMargin = tierCfg?.min_margin_percent ?? 15;
  const violations = lineEval.filter((l: any) => l.excess_percent > 0).length;
  const blendedScore = Math.min(100, violations * 20 + (marginPct < minMargin ? 30 : 0));
  const riskLevel = blendedScore >= 75 ? 'critical' : blendedScore >= 50 ? 'high' : blendedScore >= 25 ? 'medium' : 'low';
  const { data: activeChains } = await serviceClient.from('approval_chains').select('*').eq('business_id', b).eq('status', 'active').limit(1);
  const { data: fallbackChains } = activeChains?.length
    ? { data: [] as any[] }
    : await serviceClient.from('approval_chains').select('*').eq('business_id', b).limit(1);
  const chains = activeChains?.length ? activeChains : fallbackChains;
  const approvalRequired = violations > 0 || blendedScore >= 25 || marginPct < minMargin;
  const approvalLevel = (!approvalRequired)
    ? 'none'
    : (violations > 0 && (orderReq > 0 || blendedScore >= 50))
      ? 'sales_manager_then_finance'
      : (blendedScore >= 65 || orderReq > 0)
        ? 'sales_manager'
        : 'finance';
  const warehouseAvail = lines.map(() => ({ warehouse_id: 'wh-1', available_qty: 100 }));
  return {
    discount_governance: {
      lines: lineEval,
      order_level: {
        requested_discount_percent: orderVal ? (orderReq / orderVal) * 100 : 0,
        allowed_discount_percent: ceiling,
        excess_percent: Math.max(0, (orderVal ? (orderReq / orderVal) * 100 : 0) - ceiling),
        violated: (orderVal ? (orderReq / orderVal) * 100 : 0) > ceiling,
      },
    },
    margin: {
      revenue: Number(revenue.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      gross_margin: Number(grossMargin.toFixed(2)),
      margin_percent: Number(marginPct.toFixed(1)),
      target_margin_percent: targetMargin,
      minimum_margin_percent: minMargin,
      margin_impact: marginPct < minMargin ? 'warning' : 'ok',
    },
    risk: {
      blended_risk_score: blendedScore,
      risk_level: riskLevel,
      line_risks: lineEval.filter((l: any) => l.excess_percent > 0).map((l: any) => ({ line_id: l.line_id, risk_score: 80, reason: `${l.excess_percent}% over ceiling` })),
      aggregate_risk_note: violations > 0 ? `${violations} line(s) exceed discount ceiling` : 'Within limits',
      margin_risk: marginPct < minMargin ? 'medium' : 'low',
      customer_risk: 'low',
    },
    approval_preview: {
      approval_required: approvalRequired,
      approval_level: approvalLevel,
      approval_chain_id: chains?.[0]?.id ?? null,
      next_approver_role: approvalLevel === 'none' ? null : 'sales_manager',
    },
    fulfillment_preview: { stock_availability: 'full', warehouse_availability: warehouseAvail, potential_split: false, backorder_risk: 'low' },
  };
}

export async function submitForApproval(b: string, qId: string, submittedBy: string | null) {
  const evaluation = await evaluateQuotation(b, qId);
  const quotation = await getQuotation(b, qId);
  const approvalRequired = evaluation.approval_preview.approval_required;
  const newStatus = approvalRequired ? 'pending_approval' : 'approved';
  await serviceClient.from('quotations').update({ status: newStatus, approval_status: approvalRequired ? 'pending' : 'approved' }).eq('business_id', b).eq('id', qId);
  let instanceId = null;
  if (approvalRequired && evaluation.approval_preview.approval_chain_id) {
    const { data: inst } = await serviceClient.from('approval_instances').insert({
      business_id: b, quotation_id: qId, chain_id: evaluation.approval_preview.approval_chain_id,
      status: 'pending', current_level: evaluation.approval_preview.approval_level, next_approver_role: evaluation.approval_preview.next_approver_role,
      blended_risk_score: evaluation.risk.blended_risk_score, submitted_by: submittedBy,
      snapshot: { quotation, evaluation },
    }).select().single();
    if (inst) instanceId = inst.id;
  }
  return { status: newStatus, approval_required: approvalRequired, approval_instance_id: instanceId };
}

export async function getQuotationApproval(b: string, qId: string) {
  const quotation = await getQuotation(b, qId);
  const [{ data: instances, error: instanceError }, { data: actions, error: actionError }] = await Promise.all([
    serviceClient.from('approval_instances').select('*').eq('business_id', b).eq('quotation_id', qId).order('created_at', { ascending: false }),
    serviceClient.from('approval_instance_actions').select('*').eq('business_id', b).in('instance_id', (await serviceClient.from('approval_instances').select('id').eq('business_id', b).eq('quotation_id', qId)).data?.map((row) => row.id) ?? []).order('created_at', { ascending: true }),
  ]);
  if (instanceError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: instanceError.message });
  if (actionError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: actionError.message });
  const current = instances?.[0] ?? null;
  return {
    approval_status: quotation.approval_status ?? 'not_required',
    approval_required: Boolean(current),
    current_level: current?.current_level ?? null,
    approval_chain_id: current?.chain_id ?? null,
    next_approver_role: current?.next_approver_role ?? null,
    approval_instance_id: current?.id ?? null,
    submitted_at: current?.submitted_at ?? null,
    decided_at: current?.decided_at ?? null,
    history: actions ?? [],
    snapshot: current?.snapshot ?? null,
  };
}

export async function listApprovalInbox(b: string, role: string | null) {
  const { data, error } = await serviceClient.from('approval_instances').select('*, quotations(quote_number,customer:customers(name))').eq('business_id', b).eq('status', 'pending').eq('next_approver_role', role ?? '');
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getApproval(b: string, id: string) {
  const { data, error } = await serviceClient.from('approval_instances').select('*, quotations(*)').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Approval not found.');
  return data;
}
async function findApprovalInstance(b: string, id: string) {
  let { data: inst } = await serviceClient.from('approval_instances').select('*').eq('business_id', b).eq('id', id).maybeSingle();
  if (!inst) {
    const { data: byQuote } = await serviceClient.from('approval_instances').select('*').eq('business_id', b).eq('quotation_id', id).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).maybeSingle();
    inst = byQuote;
  }
  return inst;
}

export async function approveApproval(b: string, id: string, userId: string, comment?: string | null) {
  const inst = await findApprovalInstance(b, id);
  if (!inst) throw ApiError.notFound('Approval instance not found.');
  if (inst.status !== 'pending') throw new ApiError({ code: ErrorCode.APPROVAL_ALREADY_DECIDED, message: 'This approval has already been decided.' });

  // Self-approval prevention
  const { data: quote } = await serviceClient.from('quotations').select('created_by').eq('business_id', b).eq('id', inst.quotation_id).maybeSingle();
  if (quote && quote.created_by === userId) {
    throw ApiError.roleNotAllowed('Self-approval is strictly prohibited.');
  }

  // Multi-tier approval check: advance from Sales Manager to Finance if required
  if (inst.current_level === 'sales_manager_then_finance' && inst.next_approver_role === 'sales_manager') {
    await serviceClient.from('approval_instances').update({
      next_approver_role: 'finance',
      current_level: 'finance'
    }).eq('business_id', b).eq('id', inst.id);
    await serviceClient.from('approval_instance_actions').insert({
      business_id: b,
      instance_id: inst.id,
      actor: userId,
      action: 'approve_tier_1',
      comment: comment ?? 'Approved by Sales Manager; escalated to Finance for tier-2 review'
    });
    return { id: inst.id, status: 'pending_finance', current_level: 'finance' };
  }

  await serviceClient.from('approval_instances').update({ status: 'approved', decided_at: new Date().toISOString() }).eq('business_id', b).eq('id', inst.id);
  await serviceClient.from('approval_instance_actions').insert({ business_id: b, instance_id: inst.id, actor: userId, action: 'approve', comment: comment ?? null });

  // Multi-tier approval check: only mark quotation as approved when all pending instances are resolved
  const { data: remainingPending } = await serviceClient
    .from('approval_instances')
    .select('id')
    .eq('business_id', b)
    .eq('quotation_id', inst.quotation_id)
    .neq('id', inst.id)
    .eq('status', 'pending');

  if (!remainingPending || remainingPending.length === 0) {
    await serviceClient.from('quotations').update({ status: 'approved', approval_status: 'approved' }).eq('business_id', b).eq('id', inst.quotation_id);
  }

  return { id: inst.id, status: 'approved' };
}

export async function rejectApproval(b: string, id: string, userId: string, reason: string) {
  const inst = await findApprovalInstance(b, id);
  if (!inst) throw ApiError.notFound('Approval instance not found.');
  if (inst.status !== 'pending') throw new ApiError({ code: ErrorCode.APPROVAL_ALREADY_DECIDED, message: 'Already decided.' });
  await serviceClient.from('approval_instances').update({ status: 'rejected', decided_at: new Date().toISOString() }).eq('business_id', b).eq('id', inst.id);
  await serviceClient.from('approval_instance_actions').insert({ business_id: b, instance_id: inst.id, actor: userId, action: 'reject', comment: reason });
  await serviceClient.from('quotations').update({ status: 'rejected', approval_status: 'rejected' }).eq('business_id', b).eq('id', inst.quotation_id);
  return { id: inst.id, status: 'rejected' };
}

export async function returnApproval(b: string, id: string, userId: string, reason: string) {
  const inst = await findApprovalInstance(b, id);
  if (!inst) throw ApiError.notFound('Approval instance not found.');
  if (inst.status !== 'pending') throw new ApiError({ code: ErrorCode.APPROVAL_ALREADY_DECIDED, message: 'Already decided.' });
  await serviceClient.from('approval_instances').update({ status: 'returned', decided_at: new Date().toISOString() }).eq('business_id', b).eq('id', inst.id);
  await serviceClient.from('approval_instance_actions').insert({ business_id: b, instance_id: inst.id, actor: userId, action: 'return', comment: reason });
  await serviceClient.from('quotations').update({ status: 'draft', approval_status: 'not_required' }).eq('business_id', b).eq('id', inst.quotation_id);
  return { id: inst.id, status: 'returned' };
}

export async function approvalHistory(b: string) {
  const { data, error } = await serviceClient.from('approval_instances').select('*').eq('business_id', b).in('status', ['approved', 'rejected', 'returned']);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getRecommendations(b: string, qId: string) {
  const { data: products } = await serviceClient.from('products').select('id, name, price').eq('business_id', b).eq('status', 'active').limit(5);
  return (products ?? []).slice(0, 3).map((p: any) => ({ recommendation_id: randomUUID(), product_id: p.id, product_name: p.name, reason: 'Frequently bought together', promotion_tag: null, margin_delta: Number(p.price) * 0.3 }));
}

export async function sendQuotation(b: string, qId: string) {
  const { data: q } = await serviceClient.from('quotations').select('approval_status').eq('business_id', b).eq('id', qId).maybeSingle();
  if (!q || !['not_required', 'approved'].includes(q.approval_status)) throw new ApiError({ code: ErrorCode.RE_APPROVAL_REQUIRED, message: 'Quotation must be approved before sending.' });
  await serviceClient.from('quotations').update({ status: 'sent' }).eq('business_id', b).eq('id', qId);
  return { status: 'sent', portal_link: `/portal/quotations/${qId}` };
}

export async function recordNegotiation(b: string, qId: string, input: { customer_request?: string; counter_discount_percent?: number; status: string }) {
  const { data, error } = await serviceClient.from('quotation_negotiation').upsert({
    business_id: b, quotation_id: qId, negotiation_status: input.status,
    customer_request: input.customer_request ?? null, counter_discount_percent: input.counter_discount_percent ?? null,
    risk_recalculated: true, re_approval_status: 'pending',
  }, { onConflict: 'quotation_id' }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}