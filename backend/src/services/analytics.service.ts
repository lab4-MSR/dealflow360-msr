import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

type Row = Record<string, unknown>;

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

async function rows(table: string, businessId: string): Promise<Row[]> {
  const { data, error } = await (serviceClient as any).from(table).select('*').eq('business_id', tenant(businessId));
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return (data ?? []) as Row[];
}

function number(row: Row, ...keys: string[]): number {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
}

function dateValue(row: Row): string {
  return String(row.created_at ?? row.updated_at ?? row.date ?? '');
}

function monthKey(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 7);
}

function trend<T extends Row>(items: T[], value: (item: T) => number): Array<{ date: string; count: number; value?: number }> {
  const grouped = new Map<string, { count: number; value: number }>();
  for (const item of items) {
    const date = monthKey(dateValue(item));
    if (!date) continue;
    const current = grouped.get(date) ?? { count: 0, value: 0 };
    current.count += 1;
    current.value += value(item);
    grouped.set(date, current);
  }
  return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, item]) => ({ date, ...item }));
}

export async function executive(businessId: string) {
  const [customers, products, deals, approvals, subscriptions, invoices, inventory, backorders] = await Promise.all([
    rows('customers', businessId), rows('products', businessId), rows('deals', businessId),
    rows('approval_instances', businessId), rows('subscriptions', businessId), rows('invoices', businessId),
    rows('warehouse_inventory', businessId), rows('backorders', businessId),
  ]);
  const revenue = invoices.reduce((sum, invoice) => sum + number(invoice, 'grand_total', 'total', 'amount', 'total_amount'), 0);
  const availableStock = inventory.reduce((sum, item) => sum + number(item, 'available_qty', 'available_stock', 'on_hand_qty'), 0);
  const reservedStock = inventory.reduce((sum, item) => sum + number(item, 'reserved_qty', 'reserved_stock'), 0);
  const lowStock = inventory.filter((item) => number(item, 'available_qty', 'available_stock', 'on_hand_qty') <= number(item, 'reorder_level')).length;
  const outOfStock = inventory.filter((item) => number(item, 'available_qty', 'available_stock', 'on_hand_qty') <= 0).length;
  return { kpis: {
    totalCustomers: customers.length,
    totalProducts: products.length,
    activeDeals: deals.filter((deal) => !['won', 'lost', 'closed'].includes(String(deal.stage ?? deal.status).toLowerCase())).length,
    pendingApprovals: approvals.filter((approval) => String(approval.status).toLowerCase() === 'pending').length,
    revenue,
    activeSubscriptions: subscriptions.filter((subscription) => String(subscription.status).toLowerCase() === 'active').length,
  }, inventory: {
    totalStock: availableStock + reservedStock,
    availableStock,
    reservedStock,
    lowStock,
    outOfStock,
    backorders: backorders.length,
    warehouseStatus: lowStock || outOfStock ? 'warning' : 'healthy',
  }};
}

export async function sales(businessId: string) {
  const deals = await rows('deals', businessId);
  const won = deals.filter((deal) => ['won', 'closed_won'].includes(String(deal.stage ?? deal.status).toLowerCase())).length;
  const lost = deals.filter((deal) => ['lost', 'closed_lost'].includes(String(deal.stage ?? deal.status).toLowerCase())).length;
  const total = deals.length;
  return { totalDeals: total, wonDeals: won, lostDeals: lost, dealConversion: total ? Math.round((won / total) * 100) : 0,
    dealTrend: trend(deals, (deal) => number(deal, 'value', 'amount')) };
}

export async function revenue(businessId: string) {
  const [invoices, subscriptions] = await Promise.all([rows('invoices', businessId), rows('subscriptions', businessId)]);
  const totalRevenue = invoices.reduce((sum, invoice) => sum + number(invoice, 'grand_total', 'total', 'amount', 'total_amount'), 0);
  const recurringRevenue = subscriptions.filter((subscription) => String(subscription.status).toLowerCase() === 'active')
    .reduce((sum, subscription) => sum + number(subscription, 'price', 'amount', 'mrr'), 0);
  const oneTimeRevenue = Math.max(0, totalRevenue - recurringRevenue);
  return { totalRevenue, oneTimeRevenue, recurringRevenue, revenueGrowth: 0,
    revenueTrend: trend(invoices, (invoice) => number(invoice, 'grand_total', 'total', 'amount', 'total_amount')).map(({ date, value }) => ({ date, amount: value ?? 0 })) };
}

export async function approvals(businessId: string) {
  const items = await rows('approval_instances', businessId);
  const pending = items.filter((item) => String(item.status).toLowerCase() === 'pending').length;
  const decided = items.filter((item) => ['approved', 'rejected', 'returned'].includes(String(item.status).toLowerCase()));
  const durations = decided.map((item) => new Date(String(item.decided_at ?? item.updated_at ?? '')).getTime() - new Date(String(item.created_at ?? '')).getTime()).filter(Number.isFinite).filter((value) => value >= 0);
  const averageApprovalTime = durations.length ? `${(durations.reduce((sum, value) => sum + value, 0) / durations.length / 3600000).toFixed(1)} hours` : '—';
  return { pendingApprovals: pending, highRiskDeals: 0, averageApprovalTime, approvalTrend: trend(items, () => 0) };
}
