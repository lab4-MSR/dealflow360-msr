import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import type { CreateCustomerInput, UpdateCustomerInput } from '../validators/customer';

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

/** Upsert (replace-all) the contacts array for a customer. */
async function syncContacts(businessId: string, customerId: string, contacts: CreateCustomerInput['contacts']): Promise<void> {
  const { error: delErr } = await serviceClient.from('customer_contacts').delete().eq('business_id', businessId).eq('customer_id', customerId);
  if (delErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: delErr.message });
  if (!contacts.length) return;
  const rows = contacts.map((c, i) => ({
    business_id: businessId,
    customer_id: customerId,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    is_primary: c.is_primary ?? i === 0,
  }));
  const { error } = await serviceClient.from('customer_contacts').insert(rows);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
}

export async function listCustomers(businessId: string, opts: { tier?: string; status?: string; owner_id?: string } = {}) {
  let q = serviceClient.from('customers').select('*').eq('business_id', businessId);
  if (opts.tier) q = q.eq('tier', opts.tier);
  if (opts.status) q = q.eq('status', opts.status);
  if (opts.owner_id) q = q.eq('owner_id', opts.owner_id);
  const { data, error } = await q;
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createCustomer(businessId: string, input: CreateCustomerInput) {
  const bizId = tenant(businessId);
  const { data, error } = await serviceClient
    .from('customers')
    .insert({
      business_id: bizId,
      name: input.name,
      tier: input.tier ?? 'bronze',
      default_price_list_id: input.default_price_list_id ?? null,
      owner_id: input.owner_id ?? null,
      status: input.status ?? 'active',
      billing_address: input.billing_address ?? {},
    })
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });

  await syncContacts(bizId, data.id, input.contacts ?? []);

  const { data: reload } = await serviceClient
    .from('customers')
    .select('*, customer_contacts(*)')
    .eq('id', data.id)
    .single();
  return reload;
}

export async function getCustomer(businessId: string, customerId: string, include: { contacts?: string[] } = {}) {
  const bizId = tenant(businessId);
  const { data, error } = await serviceClient
    .from('customers')
    .select('*, customer_contacts(*)')
    .eq('business_id', bizId)
    .eq('id', customerId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('Customer not found in this tenant.');

  const out: Record<string, unknown> = { ...(data as object) };
  if (include.contacts?.includes('deals')) {
    const { data: deals } = await serviceClient.from('deals').select('id, name, stage, status, created_at').eq('customer_id', customerId);
    out.deals = deals ?? [];
  }
  if (include.contacts?.includes('orders')) {
    const { data: orders } = await serviceClient
      .from('fulfillment_orders')
      .select('id, order_number, status, created_at, quotation_id')
      .eq('business_id', bizId)
      .in('quotation_id.quotation.customer_id', [customerId]);
    out.orders = orders ?? [];
  }
  if (include.contacts?.includes('invoices')) {
    const { data: inv } = await serviceClient
      .from('invoices')
      .select('*')
      .eq('business_id', bizId)
      .eq('customer_id', customerId);
    out.invoices = inv ?? [];
  }
  return out;
}

export async function updateCustomer(businessId: string, customerId: string, input: UpdateCustomerInput) {
  const bizId = tenant(businessId);
  const allowed = ['name', 'tier', 'default_price_list_id', 'owner_id', 'status', 'billing_address'];
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (input[k as keyof typeof input] !== undefined) patch[k] = input[k as keyof typeof input];

  const { data, error } = await serviceClient
    .from('customers')
    .update(patch)
    .eq('business_id', bizId)
    .eq('id', customerId)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') throw ApiError.notFound('Customer not found in this tenant.');
    throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  }
  if (input.contacts) await syncContacts(bizId, customerId, input.contacts);

  const { data: reload } = await serviceClient.from('customers').select('*, customer_contacts(*)').eq('id', customerId).single();
  return reload;
}

export async function customerDeals(businessId: string, customerId: string) {
  const { data, error } = await serviceClient.from('deals').select('*').eq('business_id', businessId).eq('customer_id', customerId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function customerBillingSummary(businessId: string, customerId: string) {
  const { data: invoices, error } = await serviceClient
    .from('invoices')
    .select('status, total')
    .eq('business_id', businessId)
    .eq('customer_id', customerId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  const summary = { total_invoices: invoices?.length ?? 0, outstanding: 0, paid: 0 };
  for (const inv of invoices ?? []) {
    if (inv.status === 'paid') summary.paid += Number(inv.total) || 0;
    else if (['issued', 'overdue', 'partially_paid'].includes(inv.status)) summary.outstanding += Number(inv.total) || 0;
  }
  return summary;
}