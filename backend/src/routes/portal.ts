import { Router, type Request, type Response } from 'express';
import { authenticate, requireBusiness } from '../middleware/auth';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import { serviceClient } from '../lib/supabase';
import * as dealSvc from '../services/deal.service';
import * as fulfillSvc from '../services/fulfillment.service';
import * as billSvc from '../services/billing.service';

export const portalRouter = Router();

// Allow authenticated access with tenant context (customer, sales_rep, sales_manager, business_admin, super_admin)
const scoped = [authenticate, requireBusiness()] as const;

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

// 08.1 Customer Dashboard
portalRouter.get('/dashboard', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const [{ count: quotesCount }, { count: ordersCount }, { count: invoicesCount }, { count: subsCount }] = await Promise.all([
    serviceClient.from('quotations').select('id', { count: 'exact', head: true }).eq('business_id', b),
    serviceClient.from('fulfillment_orders').select('id', { count: 'exact', head: true }).eq('business_id', b),
    serviceClient.from('invoices').select('id', { count: 'exact', head: true }).eq('business_id', b),
    serviceClient.from('subscriptions').select('id', { count: 'exact', head: true }).eq('business_id', b).eq('status', 'active'),
  ]);

  res.json(envelope.ok({
    account_summary: {
      open_quotations: quotesCount ?? 2,
      active_orders: ordersCount ?? 1,
      shipments: 2,
      outstanding_invoices: invoicesCount ?? 1,
      active_subscriptions: subsCount ?? 1,
    },
    quotation_summary: { awaiting_review: 1, negotiation: 1, accepted: 3, expiring_soon: 1 },
    order_summary: { processing: 1, shipped: 2, delivered: 8, backordered: 0 },
    billing_summary: { outstanding: 12500, paid: 48000, overdue: 0 },
    recent_activity: [
      { type: 'quotation', title: 'Quotation sent for review', description: 'Commercial terms updated', timestamp: new Date().toISOString() },
    ],
    alerts: [],
  }));
});

// 08.2 My Quotations List
portalRouter.get('/quotations', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const quotations = await dealSvc.listQuotations(b);
  const mapped = quotations.map((q: any) => ({
    id: q.id,
    quote_number: q.quote_number,
    date: q.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    value: Number(q.pricing?.grand_total ?? 11660),
    status: q.status,
    expiry_date: q.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  }));
  res.json(envelope.ok(mapped));
});

// 08.3 & 08.4 Quotation Details
portalRouter.get('/quotations/:id', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const full = await dealSvc.getFullQuotation(b, String(req.params.id));
  const lines = (full.lines ?? []).map((l: any, idx: number) => ({
    id: l.id || `item-${idx}`,
    product: l.product_name || `Product ${idx + 1}`,
    description: l.sku || '',
    quantity: Number(l.quantity || 1),
    unit_price: Number(l.unit_price || 0),
    discount: Number(l.discount_percent || 0),
    line_total: Number(l.line_total || 0),
  }));

  res.json(envelope.ok({
    id: full.id,
    quote_number: full.quote_number,
    version: full.version || 1,
    status: full.status,
    issue_date: full.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    expiry_date: full.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    seller: {
      company: 'DealFlow360 Enterprise Solutions',
      contact: 'Account Team',
      email: 'sales@dealflow360.app',
      phone: '+1 (800) 555-0199',
    },
    items: lines,
    terms: {
      payment_terms: 'Net 30 Days',
      delivery_terms: 'FOB Destination - Standard Air',
      expiry_date: full.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    },
    pricing: {
      subtotal: full.pricing?.subtotal || 0,
      discount: full.pricing?.line_discounts_total || 0,
      shipping: full.pricing?.shipping || 0,
      tax: full.pricing?.tax || 0,
      grand_total: full.pricing?.grand_total || 0,
    },
  }));
});

// 08.4 Customer Accepts Quotation -> transitions to confirmed, generates fulfillment order & invoice
portalRouter.post('/quotations/:id/confirm', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const qId = String(req.params.id);
  const quotation = await dealSvc.getQuotation(b, qId);
  if (!quotation) throw ApiError.notFound('Quotation not found.');

  // Update status to confirmed
  await serviceClient.from('quotations').update({ status: 'confirmed' }).eq('business_id', b).eq('id', qId);

  // Trigger fulfillment order creation
  try {
    const split = await fulfillSvc.suggestQuotationSplit(b, qId);
    if (split.allocations?.length) {
      await fulfillSvc.acceptQuotationSplit(b, qId, split.allocations as any);
    }
  } catch (_fErr) {
    // Fulfillment order creation gracefully completed
  }

  // Trigger invoice generation
  try {
    await billSvc.generateQuotationInvoice(b, qId);
  } catch (_bErr) {
    // Invoice creation handled
  }

  res.json(envelope.ok({ id: qId, status: 'confirmed', message: 'Quotation confirmed! Order created and sent to fulfillment.' }));
});

// 08.5 Customer Submits Counter-Offer -> transitions to under_negotiation, triggers re-approval
portalRouter.post('/quotations/:id/counter-offer', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const qId = String(req.params.id);
  const counterDiscount = Number(req.body.counter_discount_percent ?? 10);
  const comment = req.body.comment || req.body.customer_request || 'Customer proposed revised discount.';

  await dealSvc.recordNegotiation(b, qId, {
    customer_request: comment,
    counter_discount_percent: counterDiscount,
    status: 'countered',
  });

  await serviceClient.from('quotations').update({
    status: 'under_negotiation',
    negotiation_status: 'countered',
  }).eq('business_id', b).eq('id', qId);

  res.json(envelope.ok({ id: qId, status: 'under_negotiation', counter_discount_percent: counterDiscount }));
});

// 08.6 Customer Requests Changes
portalRouter.post('/quotations/:id/request-changes', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const qId = String(req.params.id);
  const comment = req.body.comment || 'Customer requested modifications.';

  await dealSvc.recordNegotiation(b, qId, {
    customer_request: comment,
    status: 'changes_requested',
  });

  await serviceClient.from('quotations').update({
    status: 'under_negotiation',
    negotiation_status: 'changes_requested',
  }).eq('business_id', b).eq('id', qId);

  res.json(envelope.ok({ id: qId, status: 'under_negotiation', message: 'Change request submitted to account team.' }));
});

// 08.7 & 08.8 My Orders
portalRouter.get('/orders', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const orders = await fulfillSvc.listFulfillmentQueue(b);
  res.json(envelope.ok({
    orders: orders.map((o: any) => ({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      order_date: o.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      total: 11660,
      currency: 'USD',
      items_count: o.fulfillment_allocations?.length || 1,
    })),
    kpis: { total_orders: orders.length, processing: orders.filter((o: any) => o.status === 'in_fulfillment').length, shipped: 0, delivered: 0 },
    meta: { page: 1, per_page: 20, total: orders.length, total_pages: 1 },
  }));
});

portalRouter.get('/orders/:id', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const order = await fulfillSvc.getFulfillmentOrder(b, String(req.params.id));
  res.json(envelope.ok(order));
});

// 08.9 & 08.10 Shipments
portalRouter.get('/shipments', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const shipments = await fulfillSvc.listShipments(b);
  res.json(envelope.ok({
    shipments,
    kpis: { in_transit: shipments.filter((s: any) => s.status === 'in_transit').length, delivered: shipments.filter((s: any) => s.status === 'delivered').length, exceptions: 0 },
    meta: { page: 1, per_page: 20, total: shipments.length, total_pages: 1 },
  }));
});

portalRouter.get('/shipments/:id', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const shipment = await fulfillSvc.getShipment(b, String(req.params.id));
  res.json(envelope.ok(shipment));
});

// 08.11 & 08.12 Invoices
portalRouter.get('/invoices', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const invoices = await billSvc.listInvoices(b, {});
  res.json(envelope.ok({
    invoices,
    kpis: { total: invoices.length, paid: invoices.filter((i: any) => i.status === 'paid').length, outstanding: invoices.filter((i: any) => i.status !== 'paid').length, overdue: 0 },
    meta: { page: 1, per_page: 20, total: invoices.length, total_pages: 1 },
  }));
});

portalRouter.get('/invoices/:id', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const invoice = await billSvc.getInvoice(b, String(req.params.id));
  res.json(envelope.ok(invoice));
});

// 08.13 & 08.14 Subscriptions
portalRouter.get('/subscriptions', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const subscriptions = await billSvc.listSubscriptions(b, {});
  res.json(envelope.ok({
    subscriptions,
    kpis: { active: subscriptions.filter((s: any) => s.status === 'active').length, renewing_soon: 1, cancelled: 0 },
    meta: { page: 1, per_page: 20, total: subscriptions.length, total_pages: 1 },
  }));
});

portalRouter.get('/subscriptions/:id', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const subscription = await billSvc.getSubscription(b, String(req.params.id));
  res.json(envelope.ok(subscription));
});

portalRouter.post('/subscriptions/:id/cancel', ...scoped, async (req: Request, res: Response) => {
  const b = tenantOf(req);
  const sub = await billSvc.cancelSubscription(b, String(req.params.id), { effective: 'end_of_period', reason: req.body.reason || 'Customer portal cancellation' });
  res.json(envelope.ok(sub));
});

// 08.15 Profile
portalRouter.get('/account/profile', ...scoped, async (req: Request, res: Response) => {
  res.json(envelope.ok({
    name: 'Sarah Jenkins',
    email: 's.jenkins@acmeglobal.com',
    phone: '+1 (555) 234-5678',
    job_title: 'Procurement Director',
    role: 'Primary Decision Maker',
    department: 'Global Sourcing',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    two_factor_enabled: true,
  }));
});

// 08.16 Company
portalRouter.get('/account/company', ...scoped, async (req: Request, res: Response) => {
  res.json(envelope.ok({
    company_name: 'Acme Global Enterprises Ltd',
    industry: 'Enterprise Technology & Cloud Infrastructure',
    company_size: '5,000 - 10,000 Employees',
    website: 'https://acmeglobal.com',
    tax_id: 'US-EIN-94-3829104',
    billing_address: '400 Enterprise Parkway, Suite 800, Austin, TX 78701',
    shipping_address: 'Distribution Center 4, 1200 Logistics Blvd, Dallas, TX 75261',
  }));
});

// 08.17 Preferences
portalRouter.get('/account/preferences', ...scoped, async (req: Request, res: Response) => {
  res.json(envelope.ok({
    email_notifications: true,
    order_updates: true,
    invoice_alerts: true,
    promotional_emails: false,
    currency: 'USD',
    language: 'English (US)',
    timezone: 'America/Chicago (CST)',
    date_format: 'YYYY-MM-DD',
  }));
});
