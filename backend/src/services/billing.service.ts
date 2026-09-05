import { randomUUID } from 'crypto';
import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export async function listSubscriptionPlans(businessId: string) {
  const { data, error } = await serviceClient.from('subscription_plans').select('*').eq('business_id', tenant(businessId)).is('deleted_at', null).order('created_at');
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createSubscriptionPlan(businessId: string, input: Record<string, unknown>) {
  const { data, error } = await serviceClient.from('subscription_plans').insert({
    business_id: tenant(businessId), name: input.name, type: input.type ?? null, price: input.price ?? 0,
    currency: input.currency ?? 'USD', billing_cycle: input.billing_cycle ?? 'monthly', features: input.features ?? [],
    usage_limits: input.usage_limits ?? {}, included_products: input.included_products ?? [], trial_config: input.trial_config ?? {},
    proration: input.proration ?? {}, cancellation_policy: input.cancellation_policy ?? {}, refund_policy: input.refund_policy ?? {},
  }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getSubscriptionPlan(businessId: string, planId: string) {
  const { data, error } = await serviceClient.from('subscription_plans').select('*').eq('business_id', tenant(businessId)).eq('id', planId).is('deleted_at', null).maybeSingle();
  if (error || !data) throw ApiError.notFound('Subscription plan not found.');
  const { count } = await serviceClient.from('subscriptions').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('plan_id', planId).eq('status', 'active');
  return { ...data, subscriber_metrics: { active_subscribers: count ?? 0, new_subscribers: 0, churned_subscribers: 0, revenue: 0 } };
}

export async function updateSubscriptionPlan(businessId: string, planId: string, input: Record<string, unknown>) {
  await getSubscriptionPlan(businessId, planId);
  const allowed = ['name', 'type', 'price', 'currency', 'billing_cycle', 'features', 'usage_limits', 'included_products', 'trial_config', 'proration', 'cancellation_policy', 'refund_policy', 'status'];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) if (input[key] !== undefined) patch[key] = input[key];
  const { data, error } = await serviceClient.from('subscription_plans').update(patch).eq('business_id', businessId).eq('id', planId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function listBillingCycles(businessId: string) {
  const { data, error } = await serviceClient.from('billing_cycles').select('*').eq('business_id', tenant(businessId)).order('cycle');
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function updateBillingCycle(businessId: string, input: Record<string, unknown>) {
  const id = tenant(businessId);
  const patch = { business_id: id, ...input };
  const { data, error } = await serviceClient.from('billing_cycles').upsert(patch, { onConflict: 'business_id,cycle' }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getProrationRules(businessId: string) {
  const { data, error } = await serviceClient.from('proration_rules').select('*').eq('business_id', tenant(businessId)).maybeSingle();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? { business_id: businessId, cancellation_rule: 'end_of_period', notice_period_days: 0, refund_rule: 'none' };
}

export async function updateProrationRules(businessId: string, input: Record<string, unknown>) {
  const id = tenant(businessId);
  const { data: existing } = await serviceClient.from('proration_rules').select('id').eq('business_id', id).maybeSingle();
  const query = existing
    ? serviceClient.from('proration_rules').update(input).eq('business_id', id).eq('id', existing.id)
    : serviceClient.from('proration_rules').insert({ business_id: id, ...input });
  const { data, error } = await query.select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function testProration(businessId: string, input: { current_plan_id: string; new_plan_id: string; change_date: string }) {
  const id = tenant(businessId);
  const { data: plans, error } = await serviceClient.from('subscription_plans').select('id,price,currency').eq('business_id', id).in('id', [input.current_plan_id, input.new_plan_id]);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  const current = plans?.find((plan) => plan.id === input.current_plan_id);
  const next = plans?.find((plan) => plan.id === input.new_plan_id);
  if (!current || !next) throw ApiError.notFound('Both subscription plans are required for proration.');
  const changeDate = new Date(input.change_date);
  if (Number.isNaN(changeDate.getTime())) throw ApiError.validation('change_date must be a valid date.');
  const daysInPeriod = new Date(changeDate.getFullYear(), changeDate.getMonth() + 1, 0).getDate();
  const usedDays = Math.min(daysInPeriod, Math.max(0, changeDate.getDate() - 1));
  const remainingDays = daysInPeriod - usedDays;
  const credit = Number((Number(current.price) * remainingDays / daysInPeriod).toFixed(2));
  const charge = Number((Number(next.price) * remainingDays / daysInPeriod).toFixed(2));
  return { remaining_days: remainingDays, used_days: usedDays, credit, charge, final_adjustment: Number((charge - credit).toFixed(2)), currency: next.currency };
}

export async function listSubscriptions(businessId: string, filters: { status?: string; plan_id?: string; customer_id?: string }) {
  let query = serviceClient.from('subscriptions').select('*, subscription_plans(id,name,price,billing_cycle), customers(id,name)').eq('business_id', tenant(businessId));
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.plan_id) query = query.eq('plan_id', filters.plan_id);
  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getSubscription(businessId: string, subscriptionId: string) {
  const { data, error } = await serviceClient.from('subscriptions').select('*, subscription_plans(*), customers(id,name), subscription_billing_history(*), subscription_proration_ledger(*)').eq('business_id', tenant(businessId)).eq('id', subscriptionId).maybeSingle();
  if (error || !data) throw ApiError.notFound('Subscription not found.');
  return data;
}

export async function changeSubscriptionPlan(businessId: string, subscriptionId: string, input: { new_plan_id: string; quantity?: number }) {
  const id = tenant(businessId);
  const subscription = await getSubscription(id, subscriptionId);
  const result = await testProration(id, { current_plan_id: subscription.plan_id, new_plan_id: input.new_plan_id, change_date: new Date().toISOString().slice(0, 10) });
  const { data, error } = await serviceClient.from('subscriptions').update({ plan_id: input.new_plan_id, quantity: input.quantity ?? subscription.quantity }).eq('business_id', id).eq('id', subscriptionId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  const { error: ledgerError } = await serviceClient.from('subscription_proration_ledger').insert({
    business_id: id, subscription_id: subscriptionId, old_plan_id: subscription.plan_id, new_plan_id: input.new_plan_id,
    change_date: new Date().toISOString().slice(0, 10), remaining_days: result.remaining_days, used_days: result.used_days,
    credit: result.credit, charge: result.charge, final_adjustment: result.final_adjustment, currency: result.currency,
  });
  if (ledgerError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: ledgerError.message });
  return { subscription: data, proration: result };
}

export async function cancelSubscription(businessId: string, subscriptionId: string, input: { effective: 'immediate' | 'end_of_period'; reason: string }) {
  const id = tenant(businessId);
  await getSubscription(id, subscriptionId);
  const patch = input.effective === 'immediate'
    ? { status: 'cancelled', cancel_at_period_end: false, cancellation_reason: input.reason }
    : { cancel_at_period_end: true, cancellation_reason: input.reason };
  const { data, error } = await serviceClient.from('subscriptions').update(patch).eq('business_id', id).eq('id', subscriptionId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getSubscriptionProration(businessId: string, subscriptionId: string) {
  await getSubscription(businessId, subscriptionId);
  const { data, error } = await serviceClient.from('subscription_proration_ledger').select('*').eq('business_id', businessId).eq('subscription_id', subscriptionId).order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function listInvoices(businessId: string, filters: { status?: string; customer_id?: string }) {
  let query = serviceClient.from('invoices').select('*, customers(id,name)').eq('business_id', tenant(businessId));
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getInvoice(businessId: string, invoiceId: string) {
  const { data, error } = await serviceClient.from('invoices').select('*, customers(id,name), invoice_line_items(*), payments(*)').eq('business_id', tenant(businessId)).eq('id', invoiceId).maybeSingle();
  if (error || !data) throw ApiError.notFound('Invoice not found.');
  return data;
}

export async function voidInvoice(businessId: string, invoiceId: string) {
  const invoice = await getInvoice(businessId, invoiceId);
  if (['paid', 'void'].includes(invoice.status)) throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'This invoice cannot be voided.' });
  const { data, error } = await serviceClient.from('invoices').update({ status: 'void' }).eq('business_id', businessId).eq('id', invoiceId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function listPayments(businessId: string, filters: { status?: string; customer_id?: string }) {
  let query = serviceClient.from('payments').select('*, invoices(invoice_number), customers(id,name)').eq('business_id', tenant(businessId));
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.customer_id) query = query.eq('customer_id', filters.customer_id);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function recordPayment(businessId: string, input: Record<string, unknown>) {
  const id = tenant(businessId);
  let customerId = input.customer_id ?? null;
  let currency = 'USD';
  if (input.invoice_id) {
    const invoice = await getInvoice(id, String(input.invoice_id));
    customerId = invoice.customer_id;
    currency = invoice.currency;
  }
  const { data, error } = await serviceClient.from('payments').insert({ business_id: id, invoice_id: input.invoice_id ?? null, customer_id: customerId, amount: input.amount, currency, status: 'succeeded', method: input.method ?? null, reference: input.reference ?? null, paid_at: new Date().toISOString() }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (input.invoice_id) await serviceClient.from('invoices').update({ status: 'paid' }).eq('business_id', id).eq('id', input.invoice_id);
  return data;
}

export async function retryPayment(businessId: string, paymentId: string) {
  const { data: payment, error: lookupError } = await serviceClient.from('payments').select('*').eq('business_id', tenant(businessId)).eq('id', paymentId).maybeSingle();
  if (lookupError || !payment) throw ApiError.notFound('Payment not found.');
  const { data, error } = await serviceClient.from('payments').update({ status: 'succeeded', paid_at: new Date().toISOString() }).eq('business_id', businessId).eq('id', paymentId).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (payment.invoice_id) await serviceClient.from('invoices').update({ status: 'paid' }).eq('business_id', businessId).eq('id', payment.invoice_id);
  return data;
}

export async function issueCreditNote(businessId: string, invoiceId: string, input: { amount: number; reason: string }, actor: string | null) {
  const invoice = await getInvoice(businessId, invoiceId);
  if (invoice.status === 'void') throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'Cannot credit a void invoice.' });
  if (input.amount > Number(invoice.total)) throw ApiError.validation('Credit note cannot exceed invoice total.');
  const { data, error } = await serviceClient.from('credit_notes').insert({ business_id: businessId, invoice_id: invoiceId, amount: input.amount, currency: invoice.currency, reason: input.reason, issued_by: actor }).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getQuotationBilling(businessId: string, quotationId: string) {
  const id = tenant(businessId);
  const { data: quotation, error: quotationError } = await serviceClient
    .from('quotations')
    .select('id, customer_id, currency, quotation_lines(*), subscriptions(*, subscription_plans(name,billing_cycle,price,currency))')
    .eq('business_id', id)
    .eq('id', quotationId)
    .maybeSingle();
  if (quotationError || !quotation) throw ApiError.notFound('Quotation not found.');
  const oneTimeLines = ((quotation.quotation_lines ?? []) as Array<Record<string, unknown>>).map((line) => ({
    product_id: line.product_id,
    description: line.product_name ?? null,
    quantity: Number(line.quantity),
    amount: Number(line.line_total ?? 0),
    currency: line.currency ?? quotation.currency,
  }));
  const recurringLines = ((quotation.subscriptions ?? []) as Array<Record<string, unknown>>).map((subscription) => ({
    plan_id: subscription.plan_id,
    billing_cycle: (subscription.subscription_plans as Record<string, unknown> | null)?.billing_cycle ?? null,
    amount: Number(subscription.quantity ?? 1) * Number((subscription.subscription_plans as Record<string, unknown> | null)?.price ?? 0),
    next_billing_date: subscription.next_billing_date ?? null,
  }));
  return {
    one_time_lines: oneTimeLines,
    recurring_lines: recurringLines,
    upcoming_schedule: recurringLines.filter((line) => line.next_billing_date).map((line) => ({ date: line.next_billing_date, amount: line.amount, type: 'recurring' })),
    pending_proration: null,
  };
}

export async function generateQuotationInvoice(businessId: string, quotationId: string) {
  const id = tenant(businessId);
  const { data: quotation, error: quotationError } = await serviceClient
    .from('quotations')
    .select('id, customer_id, status, currency, quotation_lines(*)')
    .eq('business_id', id)
    .eq('id', quotationId)
    .maybeSingle();
  if (quotationError || !quotation) throw ApiError.notFound('Quotation not found.');
  if (!['approved', 'confirmed', 'sent'].includes(quotation.status)) throw new ApiError({ code: ErrorCode.QUOTATION_LOCKED, message: 'Only approved quotations can generate an invoice.' });
  const lines = (quotation.quotation_lines ?? []) as Array<Record<string, unknown>>;
  const subtotal = lines.reduce((sum, line) => sum + Number(line.line_total ?? 0), 0);
  const tax = lines.reduce((sum, line) => sum + Number(line.tax_amount ?? 0), 0);
  const { data: invoice, error: invoiceError } = await serviceClient.from('invoices').insert({
    business_id: id,
    customer_id: quotation.customer_id,
    invoice_number: `INV-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    status: 'draft',
    currency: quotation.currency ?? 'USD',
    subtotal,
    tax,
    total: subtotal + tax,
  }).select().single();
  if (invoiceError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: invoiceError.message });
  if (lines.length) {
    const { error: lineError } = await serviceClient.from('invoice_line_items').insert(lines.map((line) => ({
      business_id: id,
      invoice_id: invoice.id,
      kind: 'one_time',
      description: line.product_name ?? null,
      product_id: line.product_id ?? null,
      quantity: line.quantity,
      unit_price: line.net_price ?? line.unit_price ?? 0,
      amount: line.line_total ?? 0,
      currency: line.currency ?? quotation.currency ?? 'USD',
    })));
    if (lineError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: lineError.message });
  }
  return getInvoice(id, invoice.id);
}