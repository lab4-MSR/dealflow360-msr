// ============================================================
// FINANCE API SERVICE
// Base URL: /api/v1
// ============================================================

const API_BASE = '/api/v1'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('supabase_token') || ''}`,
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// Export types
export * from '../types/finance.types'

// FINANCE DASHBOARD
export async function getFinanceDashboard(params?: { date_from?: string; date_to?: string }) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/analytics/finance${query}`)
}

export async function getFinanceAlerts() {
  return apiFetch('/notifications?type=billing&unread=true')
}

// HIGH RISK DEALS
export async function getHighRiskDeals(params?: { risk_level?: string; page?: number; per_page?: number }) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/risk/high-risk-deals${query}`)
}

export async function getRiskKpis() {
  return apiFetch('/risk/overview')
}

// FINANCIAL REVIEW
export async function getFinancialReview(quotationId: string) {
  return apiFetch(`/quotations/${quotationId}/financial-review`)
}

export async function submitApprovalDecision(input: {
  quotation_id: string
  decision: 'approved' | 'rejected' | 'returned'
  reason?: string
  comment?: string
}) {
  return apiFetch('/quotations/approval-decision', { method: 'POST', body: JSON.stringify(input) })
}

export async function addFinancialNote(input: { quotation_id: string; note: string }) {
  return apiFetch('/quotations/financial-notes', { method: 'POST', body: JSON.stringify(input) })
}

// BILLING OVERVIEW
export async function getBillingOverview(params?: { date_from?: string; date_to?: string }) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/billing/overview${query}`)
}

// INVOICES
export async function getInvoices(params?: {
  status?: string; customer_id?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/invoices${query}`)
}

export async function getInvoice(id: string) { return apiFetch(`/invoices/${id}`) }
export async function getInvoiceKpis() { return apiFetch('/invoices/kpis') }
export async function voidInvoice(id: string) { return apiFetch(`/invoices/${id}/void`, { method: 'POST' }) }
export async function sendInvoice(id: string) { return apiFetch(`/invoices/${id}/send`, { method: 'POST' }) }

// PAYMENTS
export async function getPayments(params?: {
  status?: string; customer_id?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/payments${query}`)
}

export async function getPayment(id: string) { return apiFetch(`/payments/${id}`) }
export async function getPaymentKpis() { return apiFetch('/payments/kpis') }
export async function recordPayment(input: { invoice_id: string; amount: number; method: string; reference?: string }) {
  return apiFetch('/payments', { method: 'POST', body: JSON.stringify(input) })
}
export async function refundPayment(input: { payment_id: string; amount: number; reason: string }) {
  return apiFetch(`/payments/${input.payment_id}/refund`, { method: 'POST', body: JSON.stringify(input) })
}
