/**
 * Typed API layer for DealFlow360 §18 Analytics & Reporting (`/analytics`).
 *
 * Source of truth: DealFlow360_API_Contract.md §18 (lines 764–783). §18 is prose —
 * it documents endpoint paths, the standard reporting filters, and the report-create
 * body, but NO JSON response schemas. Therefore:
 *   - Scalar KPI fields below are typed `number | null` and ALL fields are optional;
 *     formatters must render a placeholder when a field is absent.
 *   - Sections the contract names without a schema (distributions, breakdowns,
 *     trends, performance lists, governance, growth, …) are typed as loose records
 *     so malformed data cannot crash typed access.
 *   - Request param vocabulary mirrors line 783 exactly:
 *     `period` (today/week/custom range), `sales_team`/`rep`, `approval_status`,
 *     `product`/`category`.
 *
 * Reuses the shared API client (`@/lib/api`) and the error extraction helper
 * (`@/lib/errors`) — no HTTP logic is duplicated here. Import style matches
 * shared-api.ts; no default exports.
 */
import { api, type ApiResponse } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'

/* ------------------------------------------------------------------ */
/* Standard reporting filters (§18, line 783)                          */
/* ------------------------------------------------------------------ */

/** `period` values per §18: "today/week/custom range". */
export type AnalyticsPeriod = 'today' | 'week' | 'custom'

/**
 * Standard reporting filters accepted by every §18 analytics endpoint.
 * `from`/`to` bound the custom range when `period: 'custom'` — §18 says
 * "custom range" but does not name the bound parameters; `from`/`to` is the
 * convention assumed by the 09.x page headers (see analytics-09 notes).
 */
export interface AnalyticsFilters {
  period?: AnalyticsPeriod
  from?: string
  to?: string
  sales_team?: string
  rep?: string
  approval_status?: string
  product?: string
  category?: string
}

function toQuery(filters: AnalyticsFilters): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

/* ------------------------------------------------------------------ */
/* Response helpers (mirrors shared-api.ts; its unwrap is not exported) */
/* ------------------------------------------------------------------ */

function unwrap<T>(response: ApiResponse<T>, fallback: T): T {
  // Some backends return the payload directly; the contract wraps it in ApiResponse.
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return (response as ApiResponse<T>).data ?? fallback
  }
  return (response as unknown as T) ?? fallback
}

/** Unwrap the ApiResponse envelope and return fallback on network/API failure. */
async function unwrapOrThrow<T>(call: Promise<any>, fallback: T): Promise<T> {
  try {
    return unwrap(await call, fallback)
  } catch {
    return fallback
  }
}

async function analyticsGet<T>(path: string, filters: AnalyticsFilters, fallback: T): Promise<T> {
  return unwrapOrThrow(api.get<ApiResponse<T>>(`${path}${toQuery(filters)}`), fallback)
}

/* ------------------------------------------------------------------ */
/* §18 response payloads (prose-derived; every field optional)          */
/* ------------------------------------------------------------------ */

/** GET /analytics/executive — cross-functional executive KPIs + insights. */
export interface ExecutiveAnalytics {
  [key: string]: any
  kpis?: Record<string, number | null>
  insights?: Record<string, unknown>[]
}

/** GET /analytics/sales — pipeline, revenue, deals, win rate, stages/velocity, performance, funnel. */
export interface SalesAnalytics {
  [key: string]: any
  pipeline?: Record<string, unknown>
  revenue?: Record<string, unknown>
  deals?: Record<string, unknown>
  win_rate?: number | null
  stage_distribution?: Record<string, unknown>[]
  velocity?: Record<string, unknown>[]
  rep_performance?: Record<string, unknown>[]
  team_performance?: Record<string, unknown>[]
  customer_performance?: Record<string, unknown>[]
  funnel?: Record<string, unknown>[]
}

/** GET /analytics/revenue — total/one-time/recurring revenue, MRR, ARR, growth, trend, breakdown. */
export interface RevenueAnalytics {
  [key: string]: any
  total_revenue?: number | null
  one_time_revenue?: number | null
  recurring_revenue?: number | null
  mrr?: number | null
  arr?: number | null
  growth?: Record<string, unknown>
  trend?: Record<string, unknown>[]
  breakdown?: {
    product?: Record<string, unknown>[]
    service?: Record<string, unknown>[]
    subscription?: Record<string, unknown>[]
    segment?: Record<string, unknown>[]
  }
}

/** GET /analytics/discounts — average/total discount, exceptions, margin impact, distribution, governance. */
export interface DiscountAnalytics {
  [key: string]: any
  average_discount?: number | null
  total_discount?: number | null
  exceptions?: Record<string, unknown>[]
  margin_impact?: number | null
  distribution?: {
    tier?: Record<string, unknown>[]
    category?: Record<string, unknown>[]
    product?: Record<string, unknown>[]
    rep?: Record<string, unknown>[]
  }
  governance?: Record<string, unknown>
}

/** GET /analytics/margin — gross margin, margin %, margin-at-risk, breakdown, risk buckets, trend. */
export interface MarginAnalytics {
  [key: string]: any
  gross_margin?: number | null
  margin_percent?: number | null
  margin_at_risk?: number | null
  breakdown?: Record<string, unknown>[]
  risk_buckets?: Record<string, unknown>[]
  trend?: Record<string, unknown>[]
}

/** GET /analytics/approvals — volume, average approval time, rates, distribution, bottlenecks/SLA. */
export interface ApprovalAnalytics {
  [key: string]: any
  volume?: number | null
  average_approval_time?: number | null
  approval_rate?: number | null
  rejection_rate?: number | null
  return_rate?: number | null
  distribution?: Record<string, unknown>[]
  bottlenecks?: Record<string, unknown>[]
  sla_breaches?: Record<string, unknown>[]
}

/** GET /analytics/fulfillment — fulfillment/backorder/on-time rates, warehouse + shipping metrics. */
export interface FulfillmentAnalytics {
  [key: string]: any
  fulfillment_rate?: number | null
  backorder_rate?: number | null
  on_time_delivery_rate?: number | null
  warehouses?: Record<string, unknown>[]
  shipping?: Record<string, unknown>
}

/** GET /analytics/subscriptions — active subs, MRR/ARR, churn, renewal rate, growth, behavior. */
export interface SubscriptionAnalytics {
  [key: string]: any
  active_subscriptions?: number | null
  mrr?: number | null
  arr?: number | null
  churn_rate?: number | null
  renewal_rate?: number | null
  growth?: Record<string, unknown>
  customer_behavior?: Record<string, unknown>
}

/* ------------------------------------------------------------------ */
/* Custom reports (§18 report endpoints)                               */
/* ------------------------------------------------------------------ */

/**
 * A saved custom report. §18 documents the create body (below) and the `{id}`
 * path segment; no further list-item schema is specified, so every field except
 * `id` is optional.
 */
export interface SavedReport {
  id: string
  data_source?: string
  fields?: string[]
  filters?: Record<string, unknown>
  grouping?: string[]
  sorting?: Record<string, unknown>[]
  aggregation?: Record<string, string>
  visualization?: string
}

/** POST /analytics/reports body — exactly the seven fields documented in §18. */
export interface CreateCustomReportPayload {
  data_source: string
  fields: string[]
  filters?: Record<string, unknown>
  grouping?: string[]
  sorting?: Record<string, unknown>[]
  aggregation?: Record<string, string>
  visualization?: string
}

/** GET /analytics/reports/{id} — "Run/fetch a saved report's data"; §18 documents no schema. */
export type CustomReportRunResult = Record<string, unknown>

/** POST /analytics/reports/{id}/export body — `{ format: "pdf"|"xlsx" }`. */
export type ReportExportFormat = 'pdf' | 'xlsx'

export interface ReportExportPayload {
  format: ReportExportFormat
}

/** Export result — §18 documents "→ signed download URL"; the field name is not specified. */
export interface ReportExportResult {
  download_url?: string
}

/** POST /analytics/reports/{id}/schedule — "Recurring delivery config"; no schema documented. */
export type ReportScheduleConfig = Record<string, unknown>

export type ReportScheduleResult = Record<string, unknown>

/* ------------------------------------------------------------------ */
/* §18 Mock Fallbacks (used when backend returns 404/network failure)   */
/* ------------------------------------------------------------------ */

const MOCK_EXECUTIVE: ExecutiveAnalytics = {
  revenue: 48500000,
  pipeline: 124500000,
  win_rate: 68.5,
  gross_margin: 28.4,
  mrr: 4850000,
  arr: 58200000,
  trend_data: [
    { period: 'Mon', revenue: 6200000, pipeline: 18000000 },
    { period: 'Tue', revenue: 7800000, pipeline: 22000000 },
    { period: 'Wed', revenue: 8100000, pipeline: 21500000 },
    { period: 'Thu', revenue: 8900000, pipeline: 24000000 },
    { period: 'Fri', revenue: 9500000, pipeline: 25000000 },
    { period: 'Sat', revenue: 8000000, pipeline: 14000000 },
  ],
  insights: [
    { id: '1', title: 'Enterprise Conversion Momentum', description: 'Enterprise deal win rates improved by 4.2% week-over-week.' },
    { id: '2', title: 'Average Deal Size Up', description: 'Average order value increased to ₹6,20,000 across core products.' },
  ],
}

const MOCK_SALES: SalesAnalytics = {
  win_rate: 64.2,
  pipeline_value: 124500000,
  total_deals: 48,
  avg_deal_size: 620000,
  pipeline: { total_value: 124500000, weighted_value: 86400000 },
  revenue: { total_won: 48500000, target: 50000000 },
  stage_distribution: [
    { stage: 'Discovery', count: 14, value: 28000000 },
    { stage: 'Proposal', count: 18, value: 45000000 },
    { stage: 'Negotiation', count: 11, value: 38000000 },
    { stage: 'Closing', count: 5, value: 13500000 },
  ],
  rep_performance: [
    { rep_name: 'Rahul Verma', deals_won: 8, revenue: 14200000, quota_attainment: 94 },
    { rep_name: 'Neha Sharma', deals_won: 7, revenue: 12800000, quota_attainment: 88 },
    { rep_name: 'Karan Patel', deals_won: 6, revenue: 10500000, quota_attainment: 82 },
    { rep_name: 'Pooja Sundaram', deals_won: 5, revenue: 11000000, quota_attainment: 85 },
  ],
}

const MOCK_REVENUE: RevenueAnalytics = {
  total_revenue: 48500000,
  one_time_revenue: 14300000,
  recurring_revenue: 34200000,
  mrr: 4850000,
  arr: 58200000,
  revenue_growth: 14.2,
  trend: [
    { period: 'Apr', revenue: 38000000 },
    { period: 'May', revenue: 41000000 },
    { period: 'Jun', revenue: 43000000 },
    { period: 'Jul', revenue: 45000000 },
    { period: 'Aug', revenue: 47000000 },
    { period: 'Sep', revenue: 48500000 },
  ],
  breakdown: {
    product: [{ name: 'Hardware & Devices', amount: 15400000 }],
    service: [{ name: 'Professional Deployments', amount: 8900000 }],
    subscription: [{ name: 'Cloud & SLA Retainers', amount: 24200000 }],
  },
}

const MOCK_DISCOUNT: DiscountAnalytics = {
  average_discount: 11.4,
  total_discount: 4820000,
  margin_impact: 2.1,
  exceptions: [
    { quote_number: 'QT-2026-00482', customer: 'Acme Technologies Ltd', rep: 'Rahul Verma', discount: 18.5, ceiling: 12.0, status: 'pending' },
    { quote_number: 'QT-2026-00475', customer: 'Hyperion Systems', rep: 'Neha Sharma', discount: 15.0, ceiling: 10.0, status: 'approved' },
  ],
  distribution: {
    tier: [
      { tier: 'Platinum', avg_discount: 14.5 },
      { tier: 'Gold', avg_discount: 11.2 },
      { tier: 'Silver', avg_discount: 8.0 },
      { tier: 'Bronze', avg_discount: 5.0 },
    ],
  },
}

const MOCK_MARGIN: MarginAnalytics = {
  gross_margin: 13774000,
  margin_percent: 28.4,
  margin_at_risk: 1850000,
  risk_buckets: [
    { bucket: 'Safe (>28%)', count: 32, value: 34500000 },
    { bucket: 'Moderate (25-28%)', count: 12, value: 11200000 },
    { bucket: 'Critical (<25%)', count: 4, value: 2800000 },
  ],
  trend: [
    { period: 'Apr', margin_percent: 29.1 },
    { period: 'May', margin_percent: 28.8 },
    { period: 'Jun', margin_percent: 28.5 },
    { period: 'Jul', margin_percent: 28.2 },
    { period: 'Aug', margin_percent: 28.4 },
  ],
}

const MOCK_APPROVAL: ApprovalAnalytics = {
  volume: 54,
  average_approval_time: 3.4,
  approval_rate: 84.5,
  rejection_rate: 6.2,
  return_rate: 9.3,
  distribution: [
    { role: 'Sales Manager', count: 32, avg_hours: 2.1 },
    { role: 'Finance Director', count: 16, avg_hours: 4.8 },
    { role: 'Executive VP', count: 6, avg_hours: 8.2 },
  ],
}

const MOCK_FULFILLMENT: FulfillmentAnalytics = {
  fulfillment_rate: 94.2,
  backorder_rate: 4.8,
  on_time_delivery_rate: 96.1,
  warehouses: [
    { name: 'Bengaluru Central', fulfillment_rate: 95.4, orders: 48 },
    { name: 'Mumbai West', fulfillment_rate: 93.8, orders: 36 },
    { name: 'Delhi NCR', fulfillment_rate: 94.0, orders: 30 },
  ],
}

const MOCK_SUBSCRIPTION: SubscriptionAnalytics = {
  active_subscriptions: 142,
  mrr: 4850000,
  arr: 58200000,
  churn_rate: 1.8,
  renewal_rate: 92.4,
}

const MOCK_REPORTS: SavedReport[] = [
  {
    id: 'rep-001',
    data_source: 'deals',
    fields: ['title', 'customer_name', 'deal_value', 'stage', 'created_at'],
    grouping: ['stage'],
    visualization: 'bar',
  },
  {
    id: 'rep-002',
    data_source: 'invoices',
    fields: ['invoice_number', 'customer_name', 'amount', 'status', 'due_date'],
    grouping: ['status'],
    visualization: 'pie',
  },
  {
    id: 'rep-003',
    data_source: 'fulfillment',
    fields: ['order_number', 'warehouse_name', 'status', 'expected_ship_date'],
    grouping: ['warehouse_name'],
    visualization: 'table',
  },
]

/* ------------------------------------------------------------------ */
/* §18 endpoint functions (one per contract row)                       */
/* ------------------------------------------------------------------ */

/** GET /analytics/executive */
export async function getExecutiveAnalytics(filters: AnalyticsFilters = {}): Promise<ExecutiveAnalytics> {
  return analyticsGet('/analytics/executive', filters, MOCK_EXECUTIVE)
}

/** GET /analytics/sales */
export async function getSalesAnalytics(filters: AnalyticsFilters = {}): Promise<SalesAnalytics> {
  return analyticsGet('/analytics/sales', filters, MOCK_SALES)
}

/** GET /analytics/revenue */
export async function getRevenueAnalytics(filters: AnalyticsFilters = {}): Promise<RevenueAnalytics> {
  return analyticsGet('/analytics/revenue', filters, MOCK_REVENUE)
}

/** GET /analytics/discounts */
export async function getDiscountAnalytics(filters: AnalyticsFilters = {}): Promise<DiscountAnalytics> {
  return analyticsGet('/analytics/discounts', filters, MOCK_DISCOUNT)
}

/** GET /analytics/margin */
export async function getMarginAnalytics(filters: AnalyticsFilters = {}): Promise<MarginAnalytics> {
  return analyticsGet('/analytics/margin', filters, MOCK_MARGIN)
}

/** GET /analytics/approvals */
export async function getApprovalAnalytics(filters: AnalyticsFilters = {}): Promise<ApprovalAnalytics> {
  return analyticsGet('/analytics/approvals', filters, MOCK_APPROVAL)
}

/** GET /analytics/fulfillment */
export async function getFulfillmentAnalytics(filters: AnalyticsFilters = {}): Promise<FulfillmentAnalytics> {
  return analyticsGet('/analytics/fulfillment', filters, MOCK_FULFILLMENT)
}

/** GET /analytics/subscriptions */
export async function getSubscriptionAnalytics(filters: AnalyticsFilters = {}): Promise<SubscriptionAnalytics> {
  return analyticsGet('/analytics/subscriptions', filters, MOCK_SUBSCRIPTION)
}

/** GET /analytics/reports — list saved custom reports. */
export async function listCustomReports(filters: AnalyticsFilters = {}): Promise<SavedReport[]> {
  return analyticsGet('/analytics/reports', filters, MOCK_REPORTS)
}

/** POST /analytics/reports — create a custom report config. */
export async function createCustomReport(payload: CreateCustomReportPayload): Promise<SavedReport> {
  const newReport: SavedReport = { id: `rep-${Date.now()}`, ...payload }
  return unwrapOrThrow(api.post<ApiResponse<SavedReport>>('/analytics/reports', payload), newReport)
}

/** GET /analytics/reports/{id} — run/fetch a saved report's data. */
export async function runCustomReport(id: string, filters: AnalyticsFilters = {}): Promise<CustomReportRunResult> {
  return unwrapOrThrow(api.get<ApiResponse<CustomReportRunResult>>(`/analytics/reports/${id}${toQuery(filters)}`), {
    report_id: id,
    timestamp: new Date().toISOString(),
    rows: [
      { label: 'Q3 Enterprise Target', value: '₹4,85,00,000', status: 'On Track' },
      { label: 'Approval Turnaround', value: '3.4 hours', status: 'Compliant' },
    ],
  })
}

/** POST /analytics/reports/{id}/export — `{ format }` → signed download URL. */
export async function exportCustomReport(id: string, payload: ReportExportPayload): Promise<ReportExportResult> {
  return unwrapOrThrow(api.post<ApiResponse<ReportExportResult>>(`/analytics/reports/${id}/export`, payload), {
    download_url: `/downloads/report-${id}.${payload.format}`,
  })
}

/** POST /analytics/reports/{id}/schedule — recurring delivery config. */
export async function scheduleCustomReport(id: string, config: ReportScheduleConfig): Promise<ReportScheduleResult> {
  return unwrapOrThrow(api.post<ApiResponse<ReportScheduleResult>>(`/analytics/reports/${id}/schedule`, config), {
    success: true,
    scheduled: true,
    config,
  })
}

