// FINANCE SERVICE - Part 2 (Subscriptions, Proration, Analytics, Audit)
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

// FAILED PAYMENTS
export async function getFailedPayments(params?: {
  failure_reason?: string; customer_id?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/payments/failed${query}`)
}

export async function getFailedPaymentKpis() { return apiFetch('/payments/failed/kpis') }
export async function getFailedPaymentDetails(id: string) { return apiFetch(`/payments/failed/${id}`) }
export async function retryPayment(id: string) { return apiFetch(`/payments/${id}/retry`, { method: 'POST' }) }

// SUBSCRIPTIONS
export async function getSubscriptions(params?: {
  status?: string; plan_id?: string; customer_id?: string; page?: number; per_page?: number
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/subscriptions${query}`)
}

export async function getSubscription(id: string) { return apiFetch(`/subscriptions/${id}`) }
export async function getSubscriptionKpis() { return apiFetch('/subscriptions/kpis') }

export async function changeSubscriptionPlan(input: {
  subscription_id: string; new_plan_id: string; quantity?: number; effective_date?: string
}) {
  return apiFetch(`/subscriptions/${input.subscription_id}/change-plan`, { method: 'POST', body: JSON.stringify(input) })
}

export async function cancelSubscription(input: { subscription_id: string; effective: 'immediate' | 'end_of_period'; reason: string }) {
  return apiFetch(`/subscriptions/${input.subscription_id}/cancel`, { method: 'POST', body: JSON.stringify(input) })
}

// PRORATION
export async function getProrationPreview(params: { current_plan_id: string; new_plan_id: string; change_date?: string }) {
  return apiFetch(`/proration-rules/test-calculation?${new URLSearchParams(params)}`)
}

export async function getSubscriptionProration(subscriptionId: string) {
  return apiFetch(`/subscriptions/${subscriptionId}/proration`)
}

// REVENUE ANALYTICS
export async function getRevenueAnalytics(params?: {
  date_from?: string; date_to?: string; comparison_date_from?: string; comparison_date_to?: string
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/analytics/revenue${query}`)
}

// FINANCE AUDIT
export async function getFinanceAudit(params?: {
  actor_id?: string; action?: string; resource_type?: string; module?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}) {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  return apiFetch(`/audit?module=finance${query}`)
}

export async function getAuditOverview() { return apiFetch('/audit/overview?module=finance') }
export async function getAuditEventDetails(id: string) { return apiFetch(`/audit/${id}`) }
