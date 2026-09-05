import { api, type ApiResponse } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'

function unwrap<T>(response: ApiResponse<T>, fallback: T): T {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return (response as ApiResponse<T>).data ?? fallback
  }
  return (response as unknown as T) ?? fallback
}

async function unwrapOrThrow<T>(call: Promise<ApiResponse<T>>, fallback: T): Promise<T> {
  try { return unwrap(await call, fallback) } catch (error) { throw new Error(getErrorMessage(error)) }
}

async function portalGet<T>(path: string, fallback: T): Promise<T> {
  return unwrapOrThrow(api.get<ApiResponse<T>>(`/portal${path}`), fallback)
}

async function portalPost<T>(path: string, data: unknown, fallback: T): Promise<T> {
  return unwrapOrThrow(api.post<ApiResponse<T>>(`/portal${path}`, data), fallback)
}

export interface CustomerDashboard {
  account_summary?: { open_quotations?: number; active_orders?: number; shipments?: number; outstanding_invoices?: number; active_subscriptions?: number }
  quotation_summary?: { awaiting_review?: number; negotiation?: number; accepted?: number; expiring_soon?: number }
  order_summary?: { processing?: number; shipped?: number; delivered?: number; backordered?: number }
  billing_summary?: { outstanding?: number; paid?: number; overdue?: number }
  recent_activity?: Array<{ type?: string; title?: string; description?: string; timestamp?: string }>
  alerts?: Array<{ type?: string; title?: string; message?: string }>
}

export interface CustomerQuotation {
  id: string; quote_number: string; date: string; value: number; status: string; expiry_date: string
}

export interface QuotationLineItem { product?: string; description?: string; quantity?: number; unit_price?: number; discount?: number; line_total?: number }
export interface QuotationTerms { payment_terms?: string; delivery_terms?: string; expiry_date?: string }
export interface SellerInfo { company?: string; contact?: string; email?: string; phone?: string }

export interface CustomerQuotationDetail {
  id: string; quote_number?: string; status?: string; issue_date?: string; expiry_date?: string
  seller?: SellerInfo; items?: QuotationLineItem[]; terms?: QuotationTerms
  pricing?: { subtotal?: number; discount?: number; tax?: number; shipping?: number; grand_total?: number }
}

export async function getCustomerDashboard(): Promise<CustomerDashboard> { return portalGet('/dashboard', {}) }
export async function getCustomerQuotations(): Promise<CustomerQuotation[]> { return portalGet('/quotations', []) }
export async function getCustomerQuotationDetail(id: string): Promise<CustomerQuotationDetail> { return portalGet(`/quotations/${id}`, {} as CustomerQuotationDetail) }
export async function confirmQuotation(id: string): Promise<unknown> { return portalPost(`/quotations/${id}/confirm`, {}, {}) }
export async function requestChanges(id: string, payload: { line_id?: string; comment: string }): Promise<unknown> { return portalPost(`/quotations/${id}/request-changes`, payload, {}) }
export async function submitCounterOffer(id: string, payload: { counter_discount_percent: number; comment?: string }): Promise<unknown> { return portalPost(`/quotations/${id}/counter-offer`, payload, {}) }