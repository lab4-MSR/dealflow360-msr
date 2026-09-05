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

/** Unwrap the ApiResponse envelope and normalize failures through getErrorMessage. */
async function unwrapOrThrow<T>(call: Promise<ApiResponse<T>>, fallback: T): Promise<T> {
  try {
    return unwrap(await call, fallback)
  } catch (error) {
    throw new Error(getErrorMessage(error))
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
  kpis?: Record<string, number | null>
  insights?: Record<string, unknown>[]
}

/** GET /analytics/sales — pipeline, revenue, deals, win rate, stages/velocity, performance, funnel. */
export interface SalesAnalytics {
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
  gross_margin?: number | null
  margin_percent?: number | null
  margin_at_risk?: number | null
  breakdown?: Record<string, unknown>[]
  risk_buckets?: Record<string, unknown>[]
  trend?: Record<string, unknown>[]
}

/** GET /analytics/approvals — volume, average approval time, rates, distribution, bottlenecks/SLA. */
export interface ApprovalAnalytics {
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
  fulfillment_rate?: number | null
  backorder_rate?: number | null
  on_time_delivery_rate?: number | null
  warehouses?: Record<string, unknown>[]
  shipping?: Record<string, unknown>
}

/** GET /analytics/subscriptions — active subs, MRR/ARR, churn, renewal rate, growth, behavior. */
export interface SubscriptionAnalytics {
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
/* §18 endpoint functions (one per contract row)                       */
/* ------------------------------------------------------------------ */

/** GET /analytics/executive */
export async function getExecutiveAnalytics(filters: AnalyticsFilters = {}): Promise<ExecutiveAnalytics> {
  return analyticsGet('/analytics/executive', filters, {})
}

/** GET /analytics/sales */
export async function getSalesAnalytics(filters: AnalyticsFilters = {}): Promise<SalesAnalytics> {
  return analyticsGet('/analytics/sales', filters, {})
}

/** GET /analytics/revenue */
export async function getRevenueAnalytics(filters: AnalyticsFilters = {}): Promise<RevenueAnalytics> {
  return analyticsGet('/analytics/revenue', filters, {})
}

/** GET /analytics/discounts */
export async function getDiscountAnalytics(filters: AnalyticsFilters = {}): Promise<DiscountAnalytics> {
  return analyticsGet('/analytics/discounts', filters, {})
}

/** GET /analytics/margin */
export async function getMarginAnalytics(filters: AnalyticsFilters = {}): Promise<MarginAnalytics> {
  return analyticsGet('/analytics/margin', filters, {})
}

/** GET /analytics/approvals */
export async function getApprovalAnalytics(filters: AnalyticsFilters = {}): Promise<ApprovalAnalytics> {
  return analyticsGet('/analytics/approvals', filters, {})
}

/** GET /analytics/fulfillment */
export async function getFulfillmentAnalytics(filters: AnalyticsFilters = {}): Promise<FulfillmentAnalytics> {
  return analyticsGet('/analytics/fulfillment', filters, {})
}

/** GET /analytics/subscriptions */
export async function getSubscriptionAnalytics(filters: AnalyticsFilters = {}): Promise<SubscriptionAnalytics> {
  return analyticsGet('/analytics/subscriptions', filters, {})
}

/** GET /analytics/reports — list saved custom reports. */
export async function listCustomReports(filters: AnalyticsFilters = {}): Promise<SavedReport[]> {
  return analyticsGet('/analytics/reports', filters, [])
}

/** POST /analytics/reports — create a custom report config. */
export async function createCustomReport(payload: CreateCustomReportPayload): Promise<SavedReport> {
  return unwrapOrThrow(api.post<ApiResponse<SavedReport>>('/analytics/reports', payload), {} as SavedReport)
}

/** GET /analytics/reports/{id} — run/fetch a saved report's data. */
export async function runCustomReport(id: string, filters: AnalyticsFilters = {}): Promise<CustomReportRunResult> {
  return unwrapOrThrow(api.get<ApiResponse<CustomReportRunResult>>(`/analytics/reports/${id}${toQuery(filters)}`), {})
}

/** POST /analytics/reports/{id}/export — `{ format }` → signed download URL. */
export async function exportCustomReport(id: string, payload: ReportExportPayload): Promise<ReportExportResult> {
  return unwrapOrThrow(api.post<ApiResponse<ReportExportResult>>(`/analytics/reports/${id}/export`, payload), {})
}

/** POST /analytics/reports/{id}/schedule — recurring delivery config. */
export async function scheduleCustomReport(id: string, config: ReportScheduleConfig): Promise<ReportScheduleResult> {
  return unwrapOrThrow(api.post<ApiResponse<ReportScheduleResult>>(`/analytics/reports/${id}/schedule`, config), {})
}

