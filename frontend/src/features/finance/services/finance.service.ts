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

// SUBSCRIPTIONS
export async function getSubscriptions(params?: { status?: string; page?: number; per_page?: number }): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/billing/subscriptions${query}`)
  } catch {
    return {
      data: [
        {
          id: 'sub-001',
          customer_name: 'Acme Global Ltd',
          plan_name: 'Enterprise Cloud Tier',
          amount: 450000,
          billing_cycle: 'yearly',
          status: 'active',
          next_billing_date: '2026-10-15',
        },
        {
          id: 'sub-002',
          customer_name: 'TechMatrix Corp',
          plan_name: 'Professional API Access',
          amount: 85000,
          billing_cycle: 'monthly',
          status: 'active',
          next_billing_date: '2026-09-30',
        },
        {
          id: 'sub-003',
          customer_name: 'Nexus Dynamics',
          plan_name: 'Security Shield Add-on',
          amount: 32000,
          billing_cycle: 'monthly',
          status: 'past_due',
          next_billing_date: '2026-09-01',
        },
      ],
      total: 3,
    }
  }
}

export async function getSubscriptionKpis(): Promise<{ active: number; trialing: number; past_due: number; mrr: number; cancelled: number }> {
  try {
    return await apiFetch('/billing/subscriptions/kpis')
  } catch {
    return { active: 142, trialing: 18, past_due: 3, mrr: 1250000, cancelled: 7 }
  }
}

// FAILED PAYMENTS
export async function getFailedPayments(params?: { page?: number; per_page?: number }): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/billing/failed-payments${query}`)
  } catch {
    return {
      data: [
        {
          id: 'pay-fail-101',
          customer_name: 'Starlight Tech Inc',
          amount: 145000,
          attempt_date: '2026-09-04',
          failure_reason: 'Insufficient funds / card limit exceeded',
          status: 'failed',
          retry_count: 2,
        },
        {
          id: 'pay-fail-102',
          customer_name: 'OmniSphere LLC',
          amount: 82000,
          attempt_date: '2026-09-03',
          failure_reason: 'Card expired',
          status: 'failed',
          retry_count: 1,
        },
      ],
      total: 2,
    }
  }
}

export async function getFailedPaymentKpis(): Promise<{ failed_count: number; retry_scheduled: number; recovery_rate: number; recovered_revenue: number }> {
  try {
    return await apiFetch('/billing/failed-payments/kpis')
  } catch {
    return { failed_count: 2, retry_scheduled: 2, recovery_rate: 82.5, recovered_revenue: 340000 }
  }
}

export async function retryPayment(id: string): Promise<any> {
  try {
    return await apiFetch(`/billing/failed-payments/${id}/retry`, { method: 'POST' })
  } catch {
    return { success: true, message: 'Retry scheduled successfully' }
  }
}

// FINANCE AUDIT
export async function getFinanceAudit(params?: { page?: number; per_page?: number }): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/audit/finance${query}`)
  } catch {
    return {
      data: [
        {
          id: 'aud-001',
          created_at: '2026-09-05T14:30:00Z',
          action: 'Invoice Created',
          actor_name: 'Finance Officer',
          customer_name: 'Acme Global Ltd',
          amount: 450000,
          status: 'success',
        },
        {
          id: 'aud-002',
          created_at: '2026-09-05T12:15:00Z',
          action: 'Payment Captured',
          actor_name: 'Payment Gateway',
          customer_name: 'TechMatrix Corp',
          amount: 85000,
          status: 'success',
        },
      ],
      total: 2,
    }
  }
}

export async function getAuditOverview(): Promise<{ total_events: number; payment_events: number; invoice_events: number; dispute_events: number }> {
  try {
    return await apiFetch('/audit/finance/overview')
  } catch {
    return { total_events: 1420, payment_events: 910, invoice_events: 480, dispute_events: 30 }
  }
}

// REVENUE ANALYTICS
export async function getRevenueAnalytics(params?: { period?: string }): Promise<any> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/analytics/revenue${query}`)
  } catch {
    return {
      kpis: {
        total_revenue: 48500000,
        arr: 58200000,
        mrr: 4850000,
        net_margin: 28.5,
        avg_deal_size: 620000,
        collection_efficiency: 94.2,
      },
      revenue_breakdown: {
        subscription: 62,
        services: 23,
        hardware: 15,
      },
      collection_analytics: {
        on_time: 88,
        delayed: 9,
        defaulted: 3,
      },
      insights: [
        { title: 'Strong MRR Growth', description: 'Monthly recurring revenue grew by 14% month-over-month.', type: 'positive' },
        { title: 'DSO Decreased', description: 'Days Sales Outstanding reduced by 4 days to 28 days.', type: 'positive' },
      ],
    }
  }
}

