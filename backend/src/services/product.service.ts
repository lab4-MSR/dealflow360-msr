import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(b: string | null): string {
  if (!b) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return b;
}

const prodSel = '*, product_variants(*), categories(id, name)';

export async function listProducts(b: string, opts: { category_id?: string; status?: string } = {}) {
  let q = serviceClient.from('products').select(prodSel).eq('business_id', b);
  if (opts.category_id) q = q.eq('category_id', opts.category_id);
  if (opts.status) q = q.eq('status', opts.status);
  const { data, error } = await q;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createProduct(b: string, input: Record<string, unknown>) {
  const biz = tenant(b);
  const { data, error } = await serviceClient
    .from('products')
    .insert({
      business_id: biz, name: input.name, sku: input.sku ?? null, category_id: input.category_id ?? null,
      price: input.price, currency: input.currency ?? 'USD', unit: input.unit ?? null,
      tax_percent: input.tax_percent ?? 0, description: input.description ?? null, image_url: input.image_url ?? null,
      status: input.status ?? 'active',
    })
    .select(prodSel).single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (input.variants) {
    const rows = (input.variants as Array<Record<string, unknown>>).map((v) => ({
      business_id: biz, product_id: data.id, attribute: v.attribute, values: v.values, extra_price: v.extra_price ?? 0,
    }));
    if (rows.length) await serviceClient.from('product_variants').insert(rows);
  }
  const { data: reload } = await serviceClient.from('products').select(prodSel).eq('id', data.id).single();
  return reload;
}

export async function getProduct(b: string, id: string) {
  const { data, error } = await serviceClient.from('products').select(prodSel).eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Product not found.');
  return data;
}

export async function updateProduct(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['name','sku','category_id','price','currency','unit','tax_percent','description','image_url','status'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  const { data, error } = await serviceClient.from('products').update(patch).eq('business_id', b).eq('id', id).select(prodSel).single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Product not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}

export async function listCategories(b: string) {
  const { data, error } = await serviceClient.from('categories').select('*').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createCategory(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('categories').insert({ business_id: tenant(b), name: input.name, parent_id: input.parent_id ?? null }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function updateCategory(b: string, id: string, input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.parent_id !== undefined) patch.parent_id = input.parent_id;
  const { data, error } = await serviceClient.from('categories').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Category not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}
export async function listPriceLists(b: string) {
  const { data, error } = await serviceClient.from('price_lists').select('*, price_list_items(*)').eq('business_id', b);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createPriceList(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('price_lists').insert({ business_id: tenant(b), name: input.name, currency: input.currency ?? 'USD', tier_scope: input.tier_scope ?? null }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function updatePriceList(b: string, id: string, input: Record<string, unknown>) {
  const allowed = ['name','currency','tier_scope'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k] !== undefined) patch[k] = input[k];
  const { data, error } = await serviceClient.from('price_lists').update(patch).eq('business_id', b).eq('id', id).select().single();
  if (error) { if (error.code === 'PGRST116') throw ApiError.notFound('Price list not found.'); throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message }); }
  return data;
}

export async function setPriceListItems(b: string, id: string, items: Array<{ product_id: string; unit_price: number }>) {
  await serviceClient.from('price_list_items').delete().eq('business_id', b).eq('price_list_id', id);
  if (!items.length) return [];
  const rows = items.map((i) => ({ business_id: b, price_list_id: id, product_id: i.product_id, unit_price: i.unit_price, currency: 'USD' }));
  const { data, error } = await serviceClient.from('price_list_items').insert(rows).select();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createCustomerPricing(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('customer_pricing').insert({ business_id: tenant(b), customer_id: input.customer_id, product_id: input.product_id, unit_price: input.unit_price, currency: 'USD' }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function listCustomerPricing(b: string, customerId?: string) {
  let query = serviceClient.from('customer_pricing').select('*').eq('business_id', b);
  if (customerId) query = query.eq('customer_id', customerId);
  const { data, error } = await query;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createVolumePricing(b: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('volume_pricing').insert({ business_id: tenant(b), product_id: input.product_id, min_qty: input.min_qty, price: input.price, currency: 'USD' }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function listVolumePricing(b: string, productId?: string) {
  let query = serviceClient.from('volume_pricing').select('*').eq('business_id', b);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query.order('product_id').order('min_qty');
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function listPricingHistory(b: string, productId?: string) {
  let query = serviceClient.from('pricing_history').select('*').eq('business_id', b);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function resolvePrice(b: string, productId: string, customerId: string, quantity: number) {
  const { data: product } = await serviceClient.from('products').select('price,currency').eq('business_id', b).eq('id', productId).maybeSingle();
  if (!product) throw ApiError.notFound('Product not found.');
  const base = Number(product.price);
  let resolved = base;
  let source = 'base_price';
  let ruleId: string | null = null;
  const { data: vol } = await serviceClient.from('volume_pricing').select('*').eq('product_id', productId).lte('min_qty', quantity).order('min_qty', { ascending: false }).limit(1).maybeSingle();
  if (vol && Number(vol.price) < resolved) { resolved = Number(vol.price); source = 'volume_pricing'; ruleId = vol.id; }
  const { data: co } = await serviceClient.from('customer_pricing').select('*').eq('business_id', b).eq('customer_id', customerId).eq('product_id', productId).maybeSingle();
  if (co) { resolved = Number(co.unit_price); source = 'customer_pricing'; ruleId = co.id; }
  return { product_id: productId, base_price: base, resolved_price: resolved, currency: product.currency, source, applied_rule_id: ruleId };
}

export async function getPriceList(b: string, id: string) {
  const { data, error } = await serviceClient.from('price_lists').select('*, price_list_items(*)').eq('business_id', b).eq('id', id).maybeSingle();
  if (error || !data) throw ApiError.notFound('Price list not found.');
  return data;
}

export async function getPriceListItems(b: string, id: string) {
  const { data, error } = await serviceClient.from('price_list_items').select('*').eq('business_id', b).eq('price_list_id', id);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}