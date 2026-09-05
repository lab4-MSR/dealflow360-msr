import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(b: string | null): string {
  if (!b) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return b;
}

export async function listDiscountRules(b: string, opts: { type?: string; status?: string } = {}) {
  let q = serviceClient.from('discount_rules').select('*').eq('business_id', b);
  if (opts.type) q = q.eq('type', opts.type);
  if (opts.status) q = q.eq('status', opts.status);
  const { data, error } = await q;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createDiscountRule(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('discount_rules').insert({
    business_id: tenant(b), name: input.name, type: input.type, priority: input.priority ?? 100,
    scope: input.scope ?? {}, max_discount_percent: input.max_discount_percent ?? null,
    min_margin_percent: input.min_margin_percent ?? null, conditions: input.conditions ?? {},
    approval_required: input.approval_required ?? false, approval_level: input.approval_level ?? 'none', status: 'active',
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getDiscountRule(b: string, id: string) {
  const { data, error } = await serviceClient.from('discount_rules').select('*').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Discount rule not found.');
  return data;
}

export async function updateDiscountRule(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['name','type','priority','scope','max_discount_percent','min_margin_percent','conditions','approval_required','approval_level','status'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  const { data, error } = await serviceClient.from('discount_rules').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Discount rule not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}

export async function archiveDiscountRule(b: string, id: string) {
  const { data, error } = await serviceClient.from('discount_rules').update({ status: 'archived', deleted_at: new Date().toISOString() }).eq('business_id', b).eq('id', id).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getCustomerTiers(b: string) {
  const { data, error } = await serviceClient.from('customer_tier_configs').select('*').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  const out: Record<string, unknown> = {};
  for (const row of data ?? []) out[(row as { tier: string }).tier] = row;
  // Return defaults for any tiers not yet configured
  const defaults: Record<string, Record<string, unknown>> = {
    bronze: { tier: 'bronze', max_discount_percent: 5, min_margin_percent: 30, approval_required: false, approval_level: 'none' },
    silver: { tier: 'silver', max_discount_percent: 10, min_margin_percent: 25, approval_required: false, approval_level: 'none' },
    gold: { tier: 'gold', max_discount_percent: 15, min_margin_percent: 20, approval_required: true, approval_level: 'sales_manager' },
    platinum: { tier: 'platinum', max_discount_percent: 20, min_margin_percent: 15, approval_required: true, approval_level: 'finance' },
  };
  for (const [tier, def] of Object.entries(defaults)) {
    if (!out[tier]) out[tier] = { business_id: b, ...def, default: true };
  }
  return out;
}

export async function updateCustomerTiers(b: string, tiers: Record<string, unknown>) {
  const biz = tenant(b);
  for (const [tier, cfg] of Object.entries(tiers)) {
    const { data: existing } = await serviceClient.from('customer_tier_configs').select('id').eq('business_id', biz).eq('tier', tier).maybeSingle();
    const patch = { ...(cfg as object), tier };
    if (existing) await serviceClient.from('customer_tier_configs').update(patch).eq('id', existing.id);
    else await serviceClient.from('customer_tier_configs').insert({ business_id: biz, ...patch });
  }
  return getCustomerTiers(biz);
}
export async function runDiscountSimulator(b: string, input: Record<string, any>) {
  const custId = input.customer_id || input.customerId;
  const { data: customer } = custId
    ? await serviceClient.from('customers').select('tier').eq('business_id', b).eq('id', custId).maybeSingle()
    : { data: null };
  const tier = (customer as { tier?: string } | null)?.tier ?? input.customer_tier ?? input.customerTier ?? 'gold';
  const { data: tierCfg } = await serviceClient.from('customer_tier_configs').select('*').eq('business_id', b).eq('tier', tier).maybeSingle();
  const ceiling = (tierCfg as { max_discount_percent?: number } | null)?.max_discount_percent ?? 15;

  const rawLines: any[] = input.lines || input.products || [];
  const normalizedLines = rawLines.map((l: any, idx: number) => {
    const prodId = l.product_id || l.productId || `prod-${idx}`;
    const qty = Number(l.quantity ?? 1);
    const unitPrice = Number(l.unit_price ?? l.unitPrice ?? 0);
    const requested = Number(l.discount_percent ?? l.proposedDiscountPercent ?? 0);
    const excess = Math.max(0, requested - ceiling);
    const allowed = Math.min(requested, ceiling);
    return {
      line_index: idx,
      product_id: prodId,
      productId: prodId,
      quantity: qty,
      unit_price: unitPrice,
      requested_discount_percent: requested,
      requestedDiscountPercent: requested,
      allowed_discount_percent: allowed,
      allowedDiscountPercent: allowed,
      customer_tier_ceiling: ceiling,
      customerTierCeiling: ceiling,
      excess_percent: excess,
      excessPercent: excess,
      excess: Number(excess.toFixed(2)),
      violated: requested > ceiling,
    };
  });

  const orderDiscount = normalizedLines.reduce((sum, l) => sum + (l.unit_price * l.quantity * (l.requested_discount_percent) / 100), 0);
  const orderValue = normalizedLines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0);
  const requestedOrderPercent = orderValue ? (orderDiscount / orderValue) * 100 : 0;
  const approvalRequired = (tierCfg as { approval_required?: boolean } | null)?.approval_required ?? (requestedOrderPercent > ceiling || normalizedLines.some(l => l.violated));
  const approvalLevel = requestedOrderPercent > 20 ? 'finance' : approvalRequired ? 'sales_manager' : 'none';

  return {
    customer_tier: tier,
    customerTier: tier,
    tier_ceiling: ceiling,
    finalCeiling: ceiling,
    lines: normalizedLines,
    order_level: {
      requested_discount_percent: requestedOrderPercent,
      requestedDiscountPercent: requestedOrderPercent,
      allowed_discount_percent: ceiling,
      allowedDiscountPercent: ceiling,
      excess_percent: Math.max(0, requestedOrderPercent - ceiling),
      excessPercent: Math.max(0, requestedOrderPercent - ceiling),
      excess: Number(Math.max(0, requestedOrderPercent - ceiling).toFixed(2)),
    },
    orderLevel: {
      requestedDiscountPercent: requestedOrderPercent,
      allowedDiscountPercent: ceiling,
      excessPercent: Math.max(0, requestedOrderPercent - ceiling),
    },
    overallRisk: requestedOrderPercent > 20 ? 'critical' : requestedOrderPercent > ceiling ? 'high' : 'low',
    approval_required: approvalRequired,
    approvalRequired,
    approval_level: approvalLevel,
    approvalLevel,
  };
}