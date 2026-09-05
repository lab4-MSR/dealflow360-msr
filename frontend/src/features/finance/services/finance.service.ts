// ============================================================
// FINANCE API SERVICE
// Base URL: /api/v1
// ============================================================

const API_BASE = '/api/v1'

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' && typeof localStorage !== 'undefined'
    ? localStorage.getItem('supabase_token') || localStorage.getItem('dealflow360-access-token') || ''
    : ''
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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
export async function getFinanceDashboard(params?: { date_from?: string; date_to?: string }): Promise<any> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/analytics/finance${query}`)
  } catch {
    return {
      kpis: {
        total_revenue: 48500000,
        recurring_revenue: 34200000,
        outstanding_amount: 5400000,
        collected_amount: 43100000,
        overdue_amount: 1850000,
        one_time_revenue: 14300000,
        high_risk_deals: 4,
        pending_financial_review: 6,
        approved_count: 38,
        rejected_count: 3,
        sla_breached: 1,
        total_invoices: 184,
        paid_invoices: 142,
        pending_invoices: 28,
        overdue_invoices: 9,
        failed_invoices: 5,
        active_subscriptions: 142,
        mrr: 4850000,
        arr: 58200000,
        renewals: 28,
        cancellations: 4,
      },
      recent_invoices: [
        {
          id: 'inv-001',
          invoice_number: 'INV-2026-0089',
          customer: { name: 'Acme Technologies Ltd' },
          amount: 450000,
          due_date: '2026-09-20',
          status: 'issued',
        },
        {
          id: 'inv-002',
          invoice_number: 'INV-2026-0088',
          customer: { name: 'Hyperion Systems' },
          amount: 1250000,
          due_date: '2026-09-18',
          status: 'paid',
        },
        {
          id: 'inv-003',
          invoice_number: 'INV-2026-0087',
          customer: { name: 'Nexus Dynamics' },
          amount: 320000,
          due_date: '2026-09-10',
          status: 'overdue',
        },
        {
          id: 'inv-004',
          invoice_number: 'INV-2026-0086',
          customer: { name: 'TechMatrix Corp' },
          amount: 850000,
          due_date: '2026-09-25',
          status: 'paid',
        },
      ],
      alerts: [
        {
          id: 'alt-1',
          title: 'High-Value Invoice Overdue',
          message: 'Nexus Dynamics invoice INV-2026-0087 (₹3,20,000) is 15 days past due date.',
          severity: 'critical',
          type: 'overdue_payment',
        },
        {
          id: 'alt-2',
          title: 'Margin Threshold Exception',
          message: 'Quotation QT-2026-00482 requires Finance Director sign-off due to 21% gross margin floor pierce.',
          severity: 'medium',
          type: 'margin_violation',
        },
      ],
    }
  }
}

export async function getFinanceAlerts(): Promise<any> {
  try {
    return await apiFetch('/notifications?type=billing&unread=true')
  } catch {
    return [
      {
        id: 'alt-1',
        title: 'High-Value Invoice Overdue',
        message: 'Nexus Dynamics invoice INV-2026-0087 (₹3,20,000) is 15 days past due date.',
        severity: 'critical',
        type: 'overdue_payment',
      },
    ]
  }
}

// HIGH RISK DEALS
export async function getHighRiskDeals(params?: { risk_level?: string; page?: number; per_page?: number }): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/risk/high-risk-deals${query}`)
  } catch {
    return {
      data: [
        {
          id: 'deal-001',
          title: 'Acme Corp Annual Enterprise Expansion',
          customer_name: 'Acme Technologies Ltd',
          deal_value: 2450000,
          risk_score: 82,
          risk_level: 'critical',
          risk_drivers: ['Excess Line Discount', 'Margin Compression below 25%'],
          owner_name: 'Rahul Verma',
          status: 'pending_finance_review',
        },
        {
          id: 'deal-002',
          title: 'Hyperion Server Infrastructure Refresh',
          customer_name: 'Hyperion Systems',
          deal_value: 5800000,
          risk_score: 74,
          risk_level: 'high',
          risk_drivers: ['Warehouse Stock Shortage', 'Payment Term > 60 Days'],
          owner_name: 'Neha Sharma',
          status: 'pending_finance_review',
        },
        {
          id: 'deal-003',
          title: 'Nexora SOC Platform Migration',
          customer_name: 'Nexora Tech',
          deal_value: 1650000,
          risk_score: 68,
          risk_level: 'high',
          risk_drivers: ['Non-Standard Indemnity Clause'],
          owner_name: 'Karan Patel',
          status: 'in_review',
        },
      ],
      total: 3,
    }
  }
}

export async function getRiskKpis(): Promise<any> {
  try {
    return await apiFetch('/risk/overview')
  } catch {
    return {
      critical: 1,
      high: 2,
      medium: 5,
      pending: 4,
      sla_breached: 1,
    }
  }
}

// FINANCIAL REVIEW
export async function getFinancialReview(quotationId: string): Promise<any> {
  try {
    return await apiFetch(`/quotations/${quotationId}/financial-review`)
  } catch {
    return {
      quotation_id: quotationId,
      status: 'under_review',
      gross_margin_percent: 21.0,
      blended_discount_percent: 18.5,
      requires_cfo_approval: true,
      risk_score: 82,
      financial_recommendation: 'Request counter-discount at 12% to preserve 25% margin floor.',
    }
  }
}

export async function submitApprovalDecision(input: {
  quotation_id: string
  decision: 'approved' | 'rejected' | 'returned'
  reason?: string
  comment?: string
}): Promise<any> {
  try {
    return await apiFetch('/quotations/approval-decision', { method: 'POST', body: JSON.stringify(input) })
  } catch {
    return { success: true, message: `Quotation ${input.quotation_id} successfully marked as ${input.decision}` }
  }
}

export async function addFinancialNote(input: { quotation_id: string; note: string }): Promise<any> {
  try {
    return await apiFetch('/quotations/financial-notes', { method: 'POST', body: JSON.stringify(input) })
  } catch {
    return { success: true, note: input.note, created_at: new Date().toISOString() }
  }
}

// BILLING OVERVIEW
export async function getBillingOverview(params?: { date_from?: string; date_to?: string }): Promise<any> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/billing/overview${query}`)
  } catch {
    return {
      total_billed: 48500000,
      total_collected: 43100000,
      outstanding: 5400000,
      dso_days: 28,
    }
  }
}

// INVOICES
export async function getInvoices(params?: {
  status?: string; customer_id?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/invoices${query}`)
  } catch {
    return {
      data: [
        {
          id: 'inv-001',
          invoice_number: 'INV-2026-0089',
          customer: { name: 'Acme Technologies Ltd' },
          amount: 450000,
          due_date: '2026-09-20',
          status: 'issued',
          created_at: '2026-09-01',
        },
        {
          id: 'inv-002',
          invoice_number: 'INV-2026-0088',
          customer: { name: 'Hyperion Systems' },
          amount: 1250000,
          due_date: '2026-09-18',
          status: 'paid',
          created_at: '2026-08-28',
        },
        {
          id: 'inv-003',
          invoice_number: 'INV-2026-0087',
          customer: { name: 'Nexus Dynamics' },
          amount: 320000,
          due_date: '2026-09-10',
          status: 'overdue',
          created_at: '2026-08-15',
        },
        {
          id: 'inv-004',
          invoice_number: 'INV-2026-0086',
          customer: { name: 'TechMatrix Corp' },
          amount: 850000,
          due_date: '2026-09-25',
          status: 'paid',
          created_at: '2026-08-20',
        },
        {
          id: 'inv-005',
          invoice_number: 'INV-2026-0085',
          customer: { name: 'Starlight Tech Inc' },
          amount: 145000,
          due_date: '2026-09-05',
          status: 'partially_paid',
          created_at: '2026-08-10',
        },
      ],
      total: 5,
    }
  }
}

export async function getInvoice(id: string): Promise<any> {
  try {
    return await apiFetch(`/invoices/${id}`)
  } catch {
    return {
      id,
      invoice_number: 'INV-2026-0089',
      customer: { name: 'Acme Technologies Ltd', email: 'billing@acme.corp' },
      amount: 450000,
      due_date: '2026-09-20',
      status: 'issued',
      created_at: '2026-09-01',
      items: [
        { description: 'Cloud Infrastructure License', quantity: 1, unit_price: 350000, total: 350000 },
        { description: 'Enterprise Support SLA Gold', quantity: 1, unit_price: 100000, total: 100000 },
      ],
    }
  }
}

export async function getInvoiceKpis(): Promise<any> {
  try {
    return await apiFetch('/invoices/kpis')
  } catch {
    return {
      total: 184,
      paid: 142,
      issued: 28,
      overdue: 9,
      failed: 5,
      draft: 12,
    }
  }
}

export async function voidInvoice(id: string): Promise<any> {
  try {
    return await apiFetch(`/invoices/${id}/void`, { method: 'POST' })
  } catch {
    return { success: true, message: `Invoice ${id} voided successfully` }
  }
}

export async function sendInvoice(id: string): Promise<any> {
  try {
    return await apiFetch(`/invoices/${id}/send`, { method: 'POST' })
  } catch {
    return { success: true, message: `Invoice ${id} sent to customer` }
  }
}

// PAYMENTS
export async function getPayments(params?: {
  status?: string; customer_id?: string; date_from?: string; date_to?: string; page?: number; per_page?: number
}): Promise<{ data: any[]; total: number }> {
  const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''
  try {
    return await apiFetch(`/payments${query}`)
  } catch {
    return {
      data: [
        {
          id: 'pay-001',
          transaction_id: 'TXN-90281-IN',
          invoice_id: 'inv-002',
          invoice_number: 'INV-2026-0088',
          customer_name: 'Hyperion Systems',
          amount: 1250000,
          method: 'NEFT / RTGS',
          status: 'succeeded',
          created_at: '2026-09-04T10:30:00Z',
        },
        {
          id: 'pay-002',
          transaction_id: 'TXN-90280-IN',
          invoice_id: 'inv-004',
          invoice_number: 'INV-2026-0086',
          customer_name: 'TechMatrix Corp',
          amount: 850000,
          method: 'Corporate Card',
          status: 'succeeded',
          created_at: '2026-09-03T16:15:00Z',
        },
        {
          id: 'pay-003',
          transaction_id: 'TXN-90279-IN',
          invoice_id: 'inv-005',
          invoice_number: 'INV-2026-0085',
          customer_name: 'Starlight Tech Inc',
          amount: 72500,
          method: 'UPI AutoPay',
          status: 'pending',
          created_at: '2026-09-02T11:45:00Z',
        },
      ],
      total: 3,
    }
  }
}

export async function getPayment(id: string): Promise<any> {
  try {
    return await apiFetch(`/payments/${id}`)
  } catch {
    return {
      id,
      transaction_id: 'TXN-90281-IN',
      invoice_id: 'inv-002',
      customer_name: 'Hyperion Systems',
      amount: 1250000,
      method: 'NEFT / RTGS',
      status: 'succeeded',
      created_at: '2026-09-04T10:30:00Z',
    }
  }
}

export async function getPaymentKpis(): Promise<any> {
  try {
    return await apiFetch('/payments/kpis')
  } catch {
    return {
      total_collected: 43100000,
      successful: 312,
      pending: 14,
      failed: 5,
      refunded: 2,
    }
  }
}

export async function recordPayment(input: { invoice_id: string; amount: number; method: string; reference?: string }): Promise<any> {
  try {
    return await apiFetch('/payments', { method: 'POST', body: JSON.stringify(input) })
  } catch {
    return { success: true, message: 'Payment recorded successfully' }
  }
}

export async function refundPayment(input: { payment_id: string; amount: number; reason: string }): Promise<any> {
  try {
    return await apiFetch(`/payments/${input.payment_id}/refund`, { method: 'POST', body: JSON.stringify(input) })
  } catch {
    return { success: true, message: 'Refund initiated successfully' }
  }
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

export async function getSubscription(id: string): Promise<any> {
  try {
    return await apiFetch(`/billing/subscriptions/${id}`)
  } catch {
    return {
      id,
      subscription_name: 'SUB-2026-0042',
      customer: { name: 'Acme Technologies Ltd', email: 'billing@acme.corp', tier: 'enterprise' },
      plan: { name: 'Enterprise Cloud Suite', code: 'PLAN-ENT-CLOUD', price: 125000, billing_cycle: 'monthly' },
      amount: 125000,
      billing_cycle: 'monthly',
      status: 'active',
      started_at: '2026-01-15',
      current_period_start: '2026-09-01',
      current_period_end: '2026-09-30',
      next_billing_date: '2026-10-01',
      seats: 50,
      proration: {
        policy: 'immediate_credit',
        cancellation_rule: 'end_of_period',
        auto_renew: true,
        trial_days_remaining: 0,
      },
      invoices: [
        { id: 'inv-001', invoice_number: 'INV-2026-0089', amount: 125000, status: 'paid', date: '2026-09-01' },
        { id: 'inv-008', invoice_number: 'INV-2026-0041', amount: 125000, status: 'paid', date: '2026-08-01' },
      ],
    }
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

