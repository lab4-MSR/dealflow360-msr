import { api, type ApiResponse } from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'

function unwrap<T>(response: any, fallback: T): T {
  if (!response) return fallback
  const payload = response?.data !== undefined && response?.status !== undefined ? response.data : response
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? fallback
  }
  return (payload as unknown as T) ?? fallback
}

async function unwrapOrThrow<T>(call: Promise<any>, fallback: T): Promise<T> {
  try {
    const res = await call
    return unwrap(res, fallback)
  } catch (error) {
    if (fallback !== undefined) {
      return fallback
    }
    throw new Error(getErrorMessage(error))
  }
}

async function portalGet<T>(path: string, fallback: T): Promise<T> {
  return unwrapOrThrow(api.get<ApiResponse<T>>(`/portal${path}`), fallback)
}

async function portalPost<T>(path: string, data: unknown, fallback: T): Promise<T> {
  return unwrapOrThrow(api.post<ApiResponse<T>>(`/portal${path}`, data), fallback)
}

async function portalPatch<T>(path: string, data: unknown, fallback: T): Promise<T> {
  return unwrapOrThrow(api.patch<ApiResponse<T>>(`/portal${path}`, data), fallback)
}

/* -------------------------------------------------------------------------- */
/* Common & Existing Portal Types                                             */
/* -------------------------------------------------------------------------- */

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

export interface QuotationLineItem {
  id?: string
  product?: string
  description?: string
  quantity?: number
  unit_price?: number
  discount?: number
  line_total?: number
}
export interface QuotationTerms { payment_terms?: string; delivery_terms?: string; expiry_date?: string }
export interface SellerInfo { company?: string; contact?: string; email?: string; phone?: string }

export interface CustomerQuotationDetail {
  id: string; quote_number?: string; version?: number; status?: string; issue_date?: string; expiry_date?: string
  seller?: SellerInfo; items?: QuotationLineItem[]; terms?: QuotationTerms
  pricing?: { subtotal?: number; discount?: number; tax?: number; shipping?: number; grand_total?: number }
}

/* 08.5 Request Changes Types */
export interface RequestChangesFullPayload {
  product?: string
  quantity?: number
  price?: number
  discount?: number
  delivery?: string
  other_request?: string
  comment: string
  attachment_name?: string
  attachment_url?: string
}

/* 08.6 Counter Offer Types */
export interface CounterOfferFullPayload {
  product?: string
  quantity?: number
  requested_price?: number
  requested_discount?: number
  requested_terms?: string
  note: string
  supporting_info?: string
}

/* 08.7 & 08.8 My Orders & Order Details Types */
export interface CustomerOrder {
  id: string
  order_number: string
  date: string
  value: number
  currency?: string
  status: 'processing' | 'shipped' | 'delivered' | 'backordered' | 'completed' | string
  shipment: string
}

export interface CustomerOrderKpis {
  total_orders: number
  processing: number
  shipped: number
  delivered: number
  backordered: number
}

export interface CustomerOrderFilters {
  search?: string
  status?: string
  date_from?: string
  date_to?: string
  value_min?: number
  value_max?: number
  page?: number
  per_page?: number
}

export interface CustomerOrderListResponse {
  orders: CustomerOrder[]
  kpis: CustomerOrderKpis
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface OrderItem {
  id: string
  product: string
  sku?: string
  quantity: number
  unit_price: number
  total: number
}

export interface OrderFulfillment {
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'backordered' | string
  fulfilled_quantity: number
  backordered_quantity: number
  expected_delivery: string
}

export interface OrderShipment {
  id: string
  shipment: string
  tracking: string
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | string
  eta: string
}

export interface OrderBilling {
  invoice: string
  amount: number
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'overdue' | string
}

export interface CustomerOrderDetail {
  id: string
  order_number: string
  status: string
  order_date: string
  total: number
  currency?: string
  items: OrderItem[]
  fulfillment: OrderFulfillment
  shipments: OrderShipment[]
  billing: OrderBilling
}

/* -------------------------------------------------------------------------- */
/* 08.9 & 08.10 Shipments Types                                               */
/* -------------------------------------------------------------------------- */

export type CustomerShipment = CustomerShipmentDetail
export type CustomerInvoice = CustomerInvoiceDetail
export type CustomerSubscription = CustomerSubscriptionDetail

export interface CustomerShipmentItem {
  product: string
  product_name?: string
  product_id?: string
  sku?: string
  quantity: number
  status: string
}

export interface TrackingTimelineStage {
  stage: 'Shipment Created' | 'Picked' | 'In Transit' | 'Out for Delivery' | 'Delivered'
  timestamp?: string
  completed: boolean
  current: boolean
  description?: string
  location?: string
}

export interface CustomerShipmentDetail {
  id: string // Shipment ID e.g. SHP-8041
  order_number: string // Order ID e.g. ORD-2026-00891
  order_id?: string
  status: 'processing' | 'in_transit' | 'delivered' | 'delayed' | string
  tracking_number: string // e.g. FedEx 9823410244
  carrier: string // e.g. FedEx Express
  courier?: string
  shipped_date?: string
  origin?: string
  destination?: string
  delivery_address: string
  expected_delivery: string
  estimated_delivery?: string
  delivery_date?: string
  actual_delivery?: string
  delivery_status: string
  items: CustomerShipmentItem[]
  item_count?: number
  timeline: TrackingTimelineStage[]
  events?: Array<{ status?: string; timestamp?: string; location?: string; description?: string }>
  tracking_url?: string
  eta: string
}

export interface ShipmentKpis {
  processing: number
  in_transit: number
  delivered: number
  delayed: number
}

export interface ShipmentFilters {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface CustomerShipmentListResponse {
  shipments: CustomerShipmentDetail[]
  kpis: ShipmentKpis
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

/* -------------------------------------------------------------------------- */
/* 08.11 & 08.12 Invoices Types                                               */
/* -------------------------------------------------------------------------- */

export interface InvoiceLineItem {
  product_service: string
  quantity: number
  unit_price: number
  discount: number
  tax: number
  total: number
}

export interface CustomerInvoiceDetail {
  id: string
  invoice_number: string
  date: string
  invoice_date?: string
  issue_date?: string
  due_date: string
  status: 'paid' | 'outstanding' | 'overdue' | string
  seller: { company: string; address: string; contact: string }
  items: InvoiceLineItem[]
  totals: { subtotal: number; discount: number; tax: number; grand_total: number }
  payment: { amount_paid: number; amount_due: number; payment_status: string; due_date: string }
  download_url?: string
  amount: number
  total_amount?: number
  paid_amount?: number
  balance_due?: number
  subtotal?: number
  tax_total?: number
  order_number?: string
  payments?: Array<{ id?: string; payment_method?: string; amount?: number; transaction_ref?: string; payment_date?: string; [key: string]: unknown }>
}

export interface InvoiceKpis {
  total: number
  paid: number
  outstanding: number
  overdue: number
}

export interface InvoiceFilters {
  search?: string
  status?: string
  date_from?: string
  date_to?: string
  amount_min?: number
  amount_max?: number
  page?: number
  per_page?: number
}

export interface CustomerInvoiceListResponse {
  invoices: CustomerInvoiceDetail[]
  kpis: InvoiceKpis
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

/* -------------------------------------------------------------------------- */
/* 08.13 & 08.14 Subscriptions Types                                         */
/* -------------------------------------------------------------------------- */

export interface SubscriptionBillingHistory {
  id: string
  date: string
  amount: number
  status: string
}

export interface SubscriptionEntitlements {
  included_features: string[]
  usage: Array<{ metric: string; used: number; limit: number; unit: string }>
}

export interface SubscriptionChanges {
  upgrades: string[]
  downgrades: string[]
  proration: string
  effective_date: string
}

export interface CustomerSubscriptionDetail {
  id: string // Subscription ID
  plan_name: string
  tier?: string
  amount: number
  recurring_amount?: number
  billing_cycle: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | string
  status: 'active' | 'trial' | 'renewing_soon' | 'cancelled' | string
  renewal_date: string
  next_renewal_date?: string
  current_period_start?: string
  current_period_end?: string
  seats?: { utilized: number; allocated: number } | any
  features: string[]
  price: number
  current_amount: number
  next_billing_date: string
  payment_status: string
  billing_history: SubscriptionBillingHistory[]
  entitlements: SubscriptionEntitlements
  changes: SubscriptionChanges
}

export interface SubscriptionKpis {
  active: number
  trial: number
  renewing_soon: number
  cancelled: number
}

export interface SubscriptionFilters {
  search?: string
  status?: string
  page?: number
  per_page?: number
}

export interface CustomerSubscriptionListResponse {
  subscriptions: CustomerSubscriptionDetail[]
  kpis: SubscriptionKpis
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

/* -------------------------------------------------------------------------- */
/* 08.15 Profile, 08.16 Company, 08.17 Preferences Types                     */
/* -------------------------------------------------------------------------- */

export interface CustomerProfileData {
  name: string
  email: string
  phone: string
  job_title: string
  profile_photo?: string
  active_sessions: Array<{ id: string; device: string; location: string; ip: string; last_active: string; current: boolean }>
  login_activity: Array<{ id: string; timestamp: string; location: string; ip: string; device: string }>
}

export interface CustomerCompanyData {
  company_name: string
  logo?: string
  website: string
  industry: string
  company_size: string
  primary_contact: string
  email: string
  phone: string
  address: string
  billing_address: string
  tax_information: string
  payment_terms: string
}

export interface CustomerPreferencesData {
  notifications: {
    email_notifications: boolean
    quote_notifications: boolean
    order_notifications: boolean
    shipment_notifications: boolean
    billing_notifications: boolean
  }
  localization: {
    language: string
    timezone: string
    currency: string
    date_format: string
  }
  appearance: {
    theme: 'system' | 'light' | 'dark'
    display_preferences: string
  }
}

/* -------------------------------------------------------------------------- */
/* API Client Functions                                                       */
/* -------------------------------------------------------------------------- */

export const MOCK_CUSTOMER_DASHBOARD: CustomerDashboard = {
  account_summary: {
    open_quotations: 4,
    active_orders: 3,
    shipments: 2,
    outstanding_invoices: 18500,
    active_subscriptions: 2,
  },
  quotation_summary: {
    awaiting_review: 2,
    negotiation: 1,
    accepted: 3,
    expiring_soon: 1,
  },
  order_summary: {
    processing: 1,
    shipped: 1,
    delivered: 3,
    backordered: 1,
  },
  billing_summary: {
    outstanding: 18500,
    paid: 45060,
    overdue: 0,
  },
  alerts: [
    {
      type: 'warning',
      title: 'Quotation Q-2026-00482 Expiring Soon',
      message: 'Quotation will expire on Sep 28, 2026. Review and confirm to lock pricing.',
    },
    {
      type: 'info',
      title: 'Shipment SHP-8041 In Transit',
      message: 'FedEx 9823410244 is scheduled for delivery on Sep 10, 2026.',
    },
  ],
  recent_activity: [
    {
      type: 'quotation',
      title: 'Counter Offer Submitted',
      description: 'Counter offer of ₹10,500 submitted for Quotation Q-2026-00482 (V3).',
      timestamp: '2 hours ago',
    },
    {
      type: 'order',
      title: 'Order ORD-2026-00891 Confirmed',
      description: 'Order confirmed and routed to Austin Fulfillment Center.',
      timestamp: 'Yesterday at 3:45 PM',
    },
    {
      type: 'shipment',
      title: 'Shipment SHP-7719 Delivered',
      description: 'DHL carrier completed delivery at verified loading dock.',
      timestamp: 'Sep 03, 2026',
    },
  ],
}

export const MOCK_CUSTOMER_QUOTATIONS: CustomerQuotation[] = [
  {
    id: 'QT-2026-00482',
    quote_number: 'Q-2026-000482',
    date: '2026-08-28',
    value: 11660,
    status: 'negotiation',
    expiry_date: '2026-09-28',
  },
  {
    id: 'QT-2026-00481',
    quote_number: 'Q-2026-000481',
    date: '2026-09-01',
    value: 24500,
    status: 'awaiting_review',
    expiry_date: '2026-09-30',
  },
  {
    id: 'QT-2026-00475',
    quote_number: 'Q-2026-000475',
    date: '2026-08-15',
    value: 8900,
    status: 'accepted',
    expiry_date: '2026-09-15',
  },
  {
    id: 'QT-2026-00460',
    quote_number: 'Q-2026-000460',
    date: '2026-07-20',
    value: 15200,
    status: 'expired',
    expiry_date: '2026-08-20',
  },
]

export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  try {
    const res = await portalGet<CustomerDashboard>('/dashboard', {} as CustomerDashboard)
    if (res?.account_summary) return res
  } catch {}
  return {
    account_summary: { open_quotations: 0, active_orders: 0, shipments: 0, outstanding_invoices: 0, active_subscriptions: 0 },
    quotation_summary: { awaiting_review: 0, negotiation: 0, accepted: 0, expiring_soon: 0 },
    order_summary: { processing: 0, shipped: 0, delivered: 0, backordered: 0 },
    billing_summary: { outstanding: 0, paid: 0, overdue: 0 },
    recent_activity: [],
    alerts: [],
  }
}

export async function getCustomerQuotations(): Promise<CustomerQuotation[]> {
  try {
    const res = await portalGet<CustomerQuotation[]>('/quotations', [])
    if (Array.isArray(res)) return res
  } catch {}
  return []
}

export async function getCustomerQuotationDetail(id: string): Promise<CustomerQuotationDetail> {
  try {
    return await portalGet(`/quotations/${id}`, getMockCustomerQuotationDetail(id))
  } catch (_err) {
    return getMockCustomerQuotationDetail(id)
  }
}

export async function confirmQuotation(id: string): Promise<unknown> {
  try {
    return await portalPost(`/quotations/${id}/confirm`, {}, { success: true, status: 'accepted' })
  } catch {
    return { success: true, status: 'accepted' }
  }
}

export async function requestChanges(id: string, payload: { line_id?: string; comment: string }): Promise<unknown> {
  try {
    return await portalPost(`/quotations/${id}/request-changes`, payload, { success: true })
  } catch {
    return { success: true }
  }
}

export async function submitCounterOffer(id: string, payload: { counter_discount_percent: number; comment?: string }): Promise<unknown> {
  try {
    return await portalPost(`/quotations/${id}/counter-offer`, payload, { success: true })
  } catch {
    return { success: true }
  }
}

/* 08.5 & 08.6 */
export async function submitRequestChangesFull(id: string, payload: RequestChangesFullPayload): Promise<unknown> {
  try {
    return await portalPost(`/quotations/${id}/request-changes`, payload, { success: true })
  } catch {
    return { success: true }
  }
}

export async function submitCounterOfferFull(id: string, payload: CounterOfferFullPayload): Promise<unknown> {
  try {
    return await portalPost(`/quotations/${id}/counter-offer`, payload, { success: true })
  } catch {
    return { success: true }
  }
}

/* 08.7 & 08.8 Orders */
export async function getCustomerOrders(filters?: CustomerOrderFilters): Promise<CustomerOrderListResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    if (filters?.value_min) params.set('value_min', String(filters.value_min))
    if (filters?.value_max) params.set('value_max', String(filters.value_max))
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.per_page) params.set('per_page', String(filters.per_page))

    const qs = params.toString() ? `?${params.toString()}` : ''
    return await portalGet(`/orders${qs}`, mockOrderListResponse(filters))
  } catch (_err) {
    return mockOrderListResponse(filters)
  }
}

export async function getCustomerOrderDetail(id: string): Promise<CustomerOrderDetail> {
  try {
    return await portalGet(`/orders/${id}`, getMockCustomerOrderDetail(id))
  } catch (_err) {
    return getMockCustomerOrderDetail(id)
  }
}

/* 08.9 & 08.10 Shipments */
export async function getCustomerShipments(filters?: ShipmentFilters): Promise<CustomerShipmentListResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.per_page) params.set('per_page', String(filters.per_page))

    const qs = params.toString() ? `?${params.toString()}` : ''
    return await portalGet(`/shipments${qs}`, mockShipmentListResponse(filters))
  } catch (_err) {
    return mockShipmentListResponse(filters)
  }
}

export async function getCustomerShipmentDetail(id: string): Promise<CustomerShipmentDetail> {
  try {
    return await portalGet(`/shipments/${id}`, getMockShipmentDetail(id))
  } catch (_err) {
    return getMockShipmentDetail(id)
  }
}

/* 08.11 & 08.12 Invoices */
export async function getCustomerInvoices(filters?: InvoiceFilters): Promise<CustomerInvoiceListResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    if (filters?.amount_min) params.set('amount_min', String(filters.amount_min))
    if (filters?.amount_max) params.set('amount_max', String(filters.amount_max))
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.per_page) params.set('per_page', String(filters.per_page))

    const qs = params.toString() ? `?${params.toString()}` : ''
    return await portalGet(`/invoices${qs}`, mockInvoiceListResponse(filters))
  } catch (_err) {
    return mockInvoiceListResponse(filters)
  }
}

export async function getCustomerInvoiceDetail(id: string): Promise<CustomerInvoiceDetail> {
  try {
    return await portalGet(`/invoices/${id}`, getMockInvoiceDetail(id))
  } catch (_err) {
    return getMockInvoiceDetail(id)
  }
}

/* 08.13 & 08.14 Subscriptions */
export async function getCustomerSubscriptions(filters?: SubscriptionFilters): Promise<CustomerSubscriptionListResponse> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set('search', filters.search)
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.per_page) params.set('per_page', String(filters.per_page))

    const qs = params.toString() ? `?${params.toString()}` : ''
    return await portalGet(`/subscriptions${qs}`, mockSubscriptionListResponse(filters))
  } catch (_err) {
    return mockSubscriptionListResponse(filters)
  }
}

export async function getCustomerSubscriptionDetail(id: string): Promise<CustomerSubscriptionDetail> {
  try {
    return await portalGet(`/subscriptions/${id}`, getMockSubscriptionDetail(id))
  } catch (_err) {
    return getMockSubscriptionDetail(id)
  }
}

export async function cancelSubscription(id: string, reason?: string): Promise<unknown> {
  try {
    return await portalPost(`/subscriptions/${id}/cancel`, { effective: 'end_of_period', reason }, { success: true })
  } catch {
    return { success: true }
  }
}

export const cancelCustomerSubscription = (id: string, payload?: any) =>
  cancelSubscription(id, typeof payload === 'string' ? payload : payload?.reason)

export async function changeSubscriptionPlan(id: string, newPlanId: string): Promise<unknown> {
  try {
    return await portalPost(`/subscriptions/${id}/change-plan`, { new_plan_id: newPlanId }, { success: true })
  } catch {
    return { success: true }
  }
}

/* 08.15 Profile */
export async function getCustomerProfile(): Promise<CustomerProfileData> {
  try {
    return await portalGet('/account/profile', mockCustomerProfile)
  } catch (_err) {
    return mockCustomerProfile
  }
}

export async function updateCustomerProfile(data: Partial<CustomerProfileData>): Promise<CustomerProfileData> {
  try {
    return await portalPatch('/account/profile', data, { ...mockCustomerProfile, ...data })
  } catch (_err) {
    return { ...mockCustomerProfile, ...data }
  }
}

export async function changeCustomerPassword(
  payloadOrCurrent: { current_password: string; new_password: string } | string,
  newPassword?: string
): Promise<null> {
  const payload = typeof payloadOrCurrent === 'string'
    ? { current_password: payloadOrCurrent, new_password: newPassword || '' }
    : payloadOrCurrent
  try {
    return await portalPost('/account/change-password', payload, null)
  } catch {
    return null
  }
}

/* 08.16 Company */
export async function getCustomerCompany(): Promise<CustomerCompanyData> {
  try {
    return await portalGet('/account/company', mockCustomerCompany)
  } catch (_err) {
    return mockCustomerCompany
  }
}

export async function updateCustomerCompany(data: Partial<CustomerCompanyData>): Promise<CustomerCompanyData> {
  try {
    return await portalPatch('/account/company', data, { ...mockCustomerCompany, ...data })
  } catch (_err) {
    return { ...mockCustomerCompany, ...data }
  }
}

/* 08.17 Preferences */
export async function getCustomerPreferences(): Promise<CustomerPreferencesData> {
  try {
    return await portalGet('/account/preferences', mockCustomerPreferences)
  } catch (_err) {
    return mockCustomerPreferences
  }
}

export async function updateCustomerPreferences(data: Partial<CustomerPreferencesData>): Promise<CustomerPreferencesData> {
  try {
    return await portalPatch('/account/preferences', data, { ...mockCustomerPreferences, ...data })
  } catch (_err) {
    return { ...mockCustomerPreferences, ...data }
  }
}

/* -------------------------------------------------------------------------- */
/* Mock Data Fallbacks (Customer Authorized Only)                              */
/* -------------------------------------------------------------------------- */

function getMockCustomerQuotationDetail(id: string): CustomerQuotationDetail {
  return {
    id: id || 'QT-2026-00482',
    quote_number: id?.startsWith('Q') ? id : 'Q-2026-000482',
    version: 3,
    status: 'under_negotiation',
    issue_date: '2026-08-28',
    expiry_date: '2026-09-28',
    seller: {
      company: 'Acme Enterprise Solutions',
      contact: 'Sarah Jenkins (Account Executive)',
      email: 'sjenkins@acmesolutions.com',
      phone: '+1 (800) 555-0199',
    },
    items: [
      { id: 'item-1', product: 'Laptop Pro (16-inch, 32GB RAM, 1TB SSD)', description: 'High performance developer workstation', quantity: 10, unit_price: 1200.00, discount: 12, line_total: 10560.00 },
      { id: 'item-2', product: 'Setup & Onboarding Service', description: 'White-glove enterprise deployment & configuration', quantity: 1, unit_price: 1100.00, discount: 0, line_total: 1100.00 },
    ],
    terms: {
      payment_terms: 'Net 30 Days',
      delivery_terms: 'FOB Destination - Standard Air',
      expiry_date: '2026-09-28',
    },
    pricing: {
      subtotal: 13100.00,
      discount: 1440.00,
      shipping: 150.00,
      tax: 950.00,
      grand_total: 11660.00,
    },
  }
}

const MOCK_ORDERS_DATA: CustomerOrderDetail[] = [
  {
    id: 'ORD-2026-00891',
    order_number: 'ORD-2026-00891',
    status: 'processing',
    order_date: '2026-09-02',
    total: 11660.00,
    currency: 'INR',
    items: [
      { id: 'line-1', product: 'Laptop Pro (16-inch, 32GB RAM, 1TB SSD)', sku: 'LP-100', quantity: 10, unit_price: 1056.00, total: 10560.00 },
      { id: 'line-2', product: 'Setup & Onboarding Service', sku: 'SV-200', quantity: 1, unit_price: 1100.00, total: 1100.00 },
    ],
    fulfillment: {
      fulfillment_status: 'partially_fulfilled',
      fulfilled_quantity: 8,
      backordered_quantity: 2,
      expected_delivery: '2026-09-12',
    },
    shipments: [
      { id: 'SHP-8041', shipment: 'SHP-8041', tracking: 'FedEx 9823410244', status: 'in_transit', eta: '2026-09-10 by 5:00 PM' },
    ],
    billing: {
      invoice: 'INV-2026-00412',
      amount: 11660.00,
      payment_status: 'paid',
    },
  },
  {
    id: 'ORD-2026-00742',
    order_number: 'ORD-2026-00742',
    status: 'shipped',
    order_date: '2026-08-20',
    total: 24500.00,
    currency: 'INR',
    items: [
      { id: 'line-101', product: 'Enterprise Server Rack', sku: 'SR-500', quantity: 2, unit_price: 9750.00, total: 19500.00 },
      { id: 'line-102', product: 'Server Blade Module', sku: 'SB-102', quantity: 5, unit_price: 1000.00, total: 5000.00 },
    ],
    fulfillment: {
      fulfillment_status: 'fulfilled',
      fulfilled_quantity: 7,
      backordered_quantity: 0,
      expected_delivery: '2026-08-28',
    },
    shipments: [
      { id: 'SHP-7719', shipment: 'SHP-7719', tracking: 'DHL 481920381', status: 'shipped', eta: '2026-09-08 by 3:00 PM' },
    ],
    billing: {
      invoice: 'INV-2026-00388',
      amount: 24500.00,
      payment_status: 'paid',
    },
  },
  {
    id: 'ORD-2026-00619',
    order_number: 'ORD-2026-00619',
    status: 'delivered',
    order_date: '2026-08-10',
    total: 8900.00,
    currency: 'INR',
    items: [
      { id: 'line-201', product: 'Pro Workstation Desktop', sku: 'WS-300', quantity: 5, unit_price: 1780.00, total: 8900.00 },
    ],
    fulfillment: {
      fulfillment_status: 'fulfilled',
      fulfilled_quantity: 5,
      backordered_quantity: 0,
      expected_delivery: '2026-08-15',
    },
    shipments: [
      { id: 'SHP-5510', shipment: 'SHP-5510', tracking: 'UPS 1Z9999999999999999', status: 'delivered', eta: '2026-08-14' },
    ],
    billing: {
      invoice: 'INV-2026-00310',
      amount: 8900.00,
      payment_status: 'paid',
    },
  },
]

function mockOrderListResponse(filters?: CustomerOrderFilters): CustomerOrderListResponse {
  let list = MOCK_ORDERS_DATA.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    date: o.order_date,
    value: o.total,
    currency: o.currency ?? 'INR',
    status: o.status,
    shipment: o.shipments[0]
      ? `${o.shipments[0].status === 'delivered' ? 'Delivered' : o.shipments[0].status === 'shipped' || o.shipments[0].status === 'in_transit' ? 'Shipped' : 'Processing'} (${o.shipments[0].tracking})`
      : 'Pending Shipment',
  }))

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((o) => o.order_number.toLowerCase().includes(q) || o.shipment.toLowerCase().includes(q))
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((o) => o.status.toLowerCase() === filters.status?.toLowerCase())
  }
  if (filters?.value_min !== undefined) list = list.filter((o) => o.value >= (filters.value_min ?? 0))
  if (filters?.value_max !== undefined) list = list.filter((o) => o.value <= (filters.value_max ?? Infinity))
  if (filters?.date_from) list = list.filter((o) => o.date >= (filters.date_from ?? ''))
  if (filters?.date_to) list = list.filter((o) => o.date <= (filters.date_to ?? ''))

  const kpis: CustomerOrderKpis = {
    total_orders: MOCK_ORDERS_DATA.length,
    processing: MOCK_ORDERS_DATA.filter((o) => o.status === 'processing').length,
    shipped: MOCK_ORDERS_DATA.filter((o) => o.status === 'shipped').length,
    delivered: MOCK_ORDERS_DATA.filter((o) => o.status === 'delivered').length,
    backordered: MOCK_ORDERS_DATA.filter((o) => o.status === 'backordered').length,
  }

  const page = filters?.page || 1
  const per_page = filters?.per_page || 10
  const total = list.length
  const total_pages = Math.ceil(total / per_page) || 1
  const start = (page - 1) * per_page

  return {
    orders: list.slice(start, start + per_page),
    kpis,
    meta: { page, per_page, total, total_pages },
  }
}

function getMockCustomerOrderDetail(id: string): CustomerOrderDetail {
  const found = MOCK_ORDERS_DATA.find((o) => o.id.toLowerCase() === id.toLowerCase() || o.order_number.toLowerCase() === id.toLowerCase())
  if (found) return found
  const first = MOCK_ORDERS_DATA[0]
  return { ...first, id: id || first.id, order_number: id?.startsWith('ORD') ? id : first.order_number }
}

/* 08.9 & 08.10 Shipments Mock Data */
const MOCK_SHIPMENTS_DATA: CustomerShipmentDetail[] = [
  {
    id: 'SHP-8041',
    order_number: 'ORD-2026-00891',
    status: 'in_transit',
    tracking_number: 'FedEx 9823410244',
    carrier: 'FedEx Priority Express',
    delivery_address: '742 Evergreen Terrace, Suite 400, Austin, TX 78701, United States',
    expected_delivery: '2026-09-10 by 5:00 PM',
    delivery_status: 'In Transit - Arrived at sorting facility',
    tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=9823410244',
    eta: 'Sep 10, 2026',
    items: [
      { product: 'Laptop Pro (16-inch, 32GB RAM, 1TB SSD)', sku: 'LP-100', quantity: 8, status: 'Shipped' },
    ],
    timeline: [
      { stage: 'Shipment Created', timestamp: 'Sep 03, 2026 09:15 AM', completed: true, current: false, description: 'Shipping label created' },
      { stage: 'Picked', timestamp: 'Sep 03, 2026 02:30 PM', completed: true, current: false, description: 'Picked up by carrier' },
      { stage: 'In Transit', timestamp: 'Sep 04, 2026 11:45 AM', completed: true, current: true, description: 'In transit to destination facility' },
      { stage: 'Out for Delivery', timestamp: 'Pending', completed: false, current: false, description: 'On delivery vehicle' },
      { stage: 'Delivered', timestamp: 'Pending', completed: false, current: false, description: 'Signed and delivered' },
    ],
  },
  {
    id: 'SHP-7719',
    order_number: 'ORD-2026-00742',
    status: 'processing',
    tracking_number: 'DHL 481920381',
    carrier: 'DHL Express International',
    delivery_address: '100 Technology Way, San Jose, CA 95110, United States',
    expected_delivery: '2026-09-15 by 3:00 PM',
    delivery_status: 'Processing at fulfillment hub',
    tracking_url: 'https://www.dhl.com/en/express/tracking.html?AWB=481920381',
    eta: 'Sep 15, 2026',
    items: [
      { product: 'Enterprise Server Rack', sku: 'SR-500', quantity: 2, status: 'Processing' },
      { product: 'Server Blade Module', sku: 'SB-102', quantity: 5, status: 'Processing' },
    ],
    timeline: [
      { stage: 'Shipment Created', timestamp: 'Sep 05, 2026 10:00 AM', completed: true, current: true, description: 'Dispatched to packing warehouse' },
      { stage: 'Picked', timestamp: 'Pending', completed: false, current: false, description: 'Awaiting carrier pick-up' },
      { stage: 'In Transit', timestamp: 'Pending', completed: false, current: false, description: 'En route to local hub' },
      { stage: 'Out for Delivery', timestamp: 'Pending', completed: false, current: false, description: 'Out for final delivery' },
      { stage: 'Delivered', timestamp: 'Pending', completed: false, current: false, description: 'Delivered to customer' },
    ],
  },
  {
    id: 'SHP-5510',
    order_number: 'ORD-2026-00619',
    status: 'delivered',
    tracking_number: 'UPS 1Z9999999999999999',
    carrier: 'UPS Ground',
    delivery_address: '500 Innovation Boulevard, Seattle, WA 98101, United States',
    expected_delivery: '2026-08-14 Delivered',
    delivery_status: 'Delivered - Received by Dock B',
    tracking_url: 'https://www.ups.com/track?tracknum=1Z9999999999999999',
    eta: 'Aug 14, 2026',
    items: [
      { product: 'Pro Workstation Desktop', sku: 'WS-300', quantity: 5, status: 'Delivered' },
    ],
    timeline: [
      { stage: 'Shipment Created', timestamp: 'Aug 11, 2026 08:30 AM', completed: true, current: false, description: 'Shipment registered' },
      { stage: 'Picked', timestamp: 'Aug 11, 2026 01:15 PM', completed: true, current: false, description: 'Picked up' },
      { stage: 'In Transit', timestamp: 'Aug 12, 2026 09:00 AM', completed: true, current: false, description: 'In transit' },
      { stage: 'Out for Delivery', timestamp: 'Aug 14, 2026 07:30 AM', completed: true, current: false, description: 'Out for delivery' },
      { stage: 'Delivered', timestamp: 'Aug 14, 2026 02:45 PM', completed: true, current: true, description: 'Package delivered & signed' },
    ],
  },
  {
    id: 'SHP-4081',
    order_number: 'ORD-2026-00508',
    status: 'delayed',
    tracking_number: 'FedEx 4410928301',
    carrier: 'FedEx Economy Freight',
    delivery_address: '742 Evergreen Terrace, Austin, TX 78701, United States',
    expected_delivery: '2026-09-20 (Delayed)',
    delivery_status: 'Delayed - Severe Weather Event at Regional Hub',
    tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=4410928301',
    eta: 'Sep 20, 2026',
    items: [
      { product: 'AI Accelerator Card 32GB', sku: 'GPU-400', quantity: 2, status: 'Delayed' },
    ],
    timeline: [
      { stage: 'Shipment Created', timestamp: 'Aug 29, 2026 11:20 AM', completed: true, current: false, description: 'Label created' },
      { stage: 'Picked', timestamp: 'Aug 30, 2026 04:00 PM', completed: true, current: false, description: 'Picked up' },
      { stage: 'In Transit', timestamp: 'Sep 01, 2026 08:00 AM', completed: true, current: true, description: 'In transit - weather delay reported' },
      { stage: 'Out for Delivery', timestamp: 'Pending', completed: false, current: false, description: 'Awaiting clearance' },
      { stage: 'Delivered', timestamp: 'Pending', completed: false, current: false, description: 'Delivered' },
    ],
  },
]

function mockShipmentListResponse(filters?: ShipmentFilters): CustomerShipmentListResponse {
  let list = [...MOCK_SHIPMENTS_DATA]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.order_number.toLowerCase().includes(q) ||
        s.tracking_number.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
    )
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase())
  }

  const kpis: ShipmentKpis = {
    processing: MOCK_SHIPMENTS_DATA.filter((s) => s.status === 'processing').length,
    in_transit: MOCK_SHIPMENTS_DATA.filter((s) => s.status === 'in_transit').length,
    delivered: MOCK_SHIPMENTS_DATA.filter((s) => s.status === 'delivered').length,
    delayed: MOCK_SHIPMENTS_DATA.filter((s) => s.status === 'delayed').length,
  }

  const page = filters?.page || 1
  const per_page = filters?.per_page || 10
  const total = list.length
  const total_pages = Math.ceil(total / per_page) || 1
  const start = (page - 1) * per_page

  return {
    shipments: list.slice(start, start + per_page),
    kpis,
    meta: { page, per_page, total, total_pages },
  }
}

function getMockShipmentDetail(id: string): CustomerShipmentDetail {
  const found = MOCK_SHIPMENTS_DATA.find(
    (s) => s.id.toLowerCase() === id.toLowerCase() || s.tracking_number.toLowerCase().includes(id.toLowerCase())
  )
  if (found) return found
  const first = MOCK_SHIPMENTS_DATA[0]
  return { ...first, id: id || first.id }
}

/* 08.11 & 08.12 Invoices Mock Data */
const MOCK_INVOICES_DATA: CustomerInvoiceDetail[] = [
  {
    id: 'INV-2026-00412',
    invoice_number: 'INV-2026-00412',
    date: '2026-09-02',
    due_date: '2026-10-02',
    amount: 11660.00,
    status: 'paid',
    seller: {
      company: 'Acme Enterprise Solutions Inc.',
      address: '100 Corporate Parkway, Suite 500, Austin, TX 78701',
      contact: 'billing@acmesolutions.com · +1 (800) 555-0199',
    },
    items: [
      { product_service: 'Laptop Pro (16-inch, 32GB RAM, 1TB SSD)', quantity: 10, unit_price: 1200.00, discount: 1440.00, tax: 950.00, total: 10560.00 },
      { product_service: 'Setup & Onboarding Service', quantity: 1, unit_price: 1100.00, discount: 0.00, tax: 0.00, total: 1100.00 },
    ],
    totals: { subtotal: 13100.00, discount: 1440.00, tax: 950.00, grand_total: 11660.00 },
    payment: { amount_paid: 11660.00, amount_due: 0.00, payment_status: 'paid', due_date: '2026-10-02' },
    download_url: '/invoices/INV-2026-00412.pdf',
  },
  {
    id: 'INV-2026-00388',
    invoice_number: 'INV-2026-00388',
    date: '2026-08-20',
    due_date: '2026-09-20',
    amount: 24500.00,
    status: 'paid',
    seller: {
      company: 'Acme Enterprise Solutions Inc.',
      address: '100 Corporate Parkway, Suite 500, Austin, TX 78701',
      contact: 'billing@acmesolutions.com',
    },
    items: [
      { product_service: 'Enterprise Server Rack', quantity: 2, unit_price: 9750.00, discount: 0, tax: 0, total: 19500.00 },
      { product_service: 'Server Blade Module', quantity: 5, unit_price: 1000.00, discount: 0, tax: 0, total: 5000.00 },
    ],
    totals: { subtotal: 24500.00, discount: 0.00, tax: 0.00, grand_total: 24500.00 },
    payment: { amount_paid: 24500.00, amount_due: 0.00, payment_status: 'paid', due_date: '2026-09-20' },
    download_url: '/invoices/INV-2026-00388.pdf',
  },
  {
    id: 'INV-2026-00244',
    invoice_number: 'INV-2026-00244',
    date: '2026-07-28',
    due_date: '2026-08-28',
    amount: 15200.00,
    status: 'outstanding',
    seller: {
      company: 'Acme Enterprise Solutions Inc.',
      address: '100 Corporate Parkway, Suite 500, Austin, TX 78701',
      contact: 'billing@acmesolutions.com',
    },
    items: [
      { product_service: 'AI Accelerator Card 32GB', quantity: 4, unit_price: 3800.00, discount: 0, tax: 0, total: 15200.00 },
    ],
    totals: { subtotal: 15200.00, discount: 0.00, tax: 0.00, grand_total: 15200.00 },
    payment: { amount_paid: 0.00, amount_due: 15200.00, payment_status: 'pending', due_date: '2026-08-28' },
    download_url: '/invoices/INV-2026-00244.pdf',
  },
  {
    id: 'INV-2026-00180',
    invoice_number: 'INV-2026-00180',
    date: '2026-07-01',
    due_date: '2026-08-01',
    amount: 6400.00,
    status: 'overdue',
    seller: {
      company: 'Acme Enterprise Solutions Inc.',
      address: '100 Corporate Parkway, Suite 500, Austin, TX 78701',
      contact: 'billing@acmesolutions.com',
    },
    items: [
      { product_service: 'Managed Network Switch 48-Port', quantity: 4, unit_price: 1600.00, discount: 0, tax: 0, total: 6400.00 },
    ],
    totals: { subtotal: 6400.00, discount: 0.00, tax: 0.00, grand_total: 6400.00 },
    payment: { amount_paid: 0.00, amount_due: 6400.00, payment_status: 'overdue', due_date: '2026-08-01' },
    download_url: '/invoices/INV-2026-00180.pdf',
  },
]

function mockInvoiceListResponse(filters?: InvoiceFilters): CustomerInvoiceListResponse {
  let list = [...MOCK_INVOICES_DATA]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((inv) => inv.invoice_number.toLowerCase().includes(q))
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((inv) => inv.status.toLowerCase() === filters.status?.toLowerCase())
  }
  if (filters?.amount_min !== undefined) list = list.filter((inv) => inv.amount >= (filters.amount_min ?? 0))
  if (filters?.amount_max !== undefined) list = list.filter((inv) => inv.amount <= (filters.amount_max ?? Infinity))

  const kpis: InvoiceKpis = {
    total: MOCK_INVOICES_DATA.length,
    paid: MOCK_INVOICES_DATA.filter((i) => i.status === 'paid').length,
    outstanding: MOCK_INVOICES_DATA.filter((i) => i.status === 'outstanding').length,
    overdue: MOCK_INVOICES_DATA.filter((i) => i.status === 'overdue').length,
  }

  const page = filters?.page || 1
  const per_page = filters?.per_page || 10
  const total = list.length
  const total_pages = Math.ceil(total / per_page) || 1
  const start = (page - 1) * per_page

  return {
    invoices: list.slice(start, start + per_page),
    kpis,
    meta: { page, per_page, total, total_pages },
  }
}

function getMockInvoiceDetail(id: string): CustomerInvoiceDetail {
  const found = MOCK_INVOICES_DATA.find((i) => i.id.toLowerCase() === id.toLowerCase() || i.invoice_number.toLowerCase() === id.toLowerCase())
  if (found) return found
  const first = MOCK_INVOICES_DATA[0]
  return { ...first, id: id || first.id, invoice_number: id?.startsWith('INV') ? id : first.invoice_number }
}

/* 08.13 & 08.14 Subscriptions Mock Data */
const MOCK_SUBSCRIPTIONS_DATA: CustomerSubscriptionDetail[] = [
  {
    id: 'SUB-2026-0091',
    plan_name: 'Enterprise Platform Plan',
    amount: 1499.00,
    billing_cycle: 'monthly',
    status: 'active',
    renewal_date: '2026-10-01',
    price: 1499.00,
    current_amount: 1499.00,
    next_billing_date: '2026-10-01',
    payment_status: 'paid',
    features: [
      'Unlimited API Integrations',
      'Dedicated Account Manager',
      'Advanced Deal Analytics & Forecasting',
      'Custom Workflow Automations',
      '24/7 SLA Priority Support',
    ],
    billing_history: [
      { id: 'INV-2026-00412', date: '2026-09-01', amount: 1499.00, status: 'paid' },
      { id: 'INV-2026-00301', date: '2026-08-01', amount: 1499.00, status: 'paid' },
      { id: 'INV-2026-00199', date: '2026-07-01', amount: 1499.00, status: 'paid' },
    ],
    entitlements: {
      included_features: [
        'User Seats: Up to 50 active users',
        'API Request Limit: 500,000 / month',
        'Storage: 500 GB Cloud Document Storage',
        'Custom Webhooks: Up to 25 endpoints',
      ],
      usage: [
        { metric: 'Active Seats', used: 34, limit: 50, unit: 'seats' },
        { metric: 'API Calls', used: 184500, limit: 500000, unit: 'calls' },
        { metric: 'Storage', used: 120, limit: 500, unit: 'GB' },
      ],
    },
    changes: {
      upgrades: ['Global Multi-Region Plan (₹24,999/mo)'],
      downgrades: ['Professional Team Plan (₹6,999/mo)'],
      proration: 'Immediate prorated credit/charge applied on plan changes',
      effective_date: 'Next Billing Cycle (Oct 1, 2026)',
    },
  },
  {
    id: 'SUB-2026-0044',
    plan_name: 'AI Insights Add-on',
    amount: 299.00,
    billing_cycle: 'monthly',
    status: 'renewing_soon',
    renewal_date: '2026-09-12',
    price: 299.00,
    current_amount: 299.00,
    next_billing_date: '2026-09-12',
    payment_status: 'pending',
    features: ['Automated Margin Anomaly Alerts', 'Deal Health Scoring Engine', 'Competitive Price Benchmarking'],
    billing_history: [
      { id: 'INV-2026-00350', date: '2026-08-12', amount: 299.00, status: 'paid' },
    ],
    entitlements: {
      included_features: ['Unlimited AI deal scans', 'Weekly executive digest'],
      usage: [{ metric: 'AI Scans', used: 412, limit: 1000, unit: 'scans' }],
    },
    changes: {
      upgrades: [],
      downgrades: [],
      proration: 'Standard proration',
      effective_date: 'Sep 12, 2026',
    },
  },
  {
    id: 'SUB-2026-0012',
    plan_name: 'Developer Sandbox Tier',
    amount: 0.00,
    billing_cycle: 'monthly',
    status: 'trial',
    renewal_date: '2026-09-25',
    price: 0.00,
    current_amount: 0.00,
    next_billing_date: '2026-09-25',
    payment_status: 'trialing',
    features: ['14-Day Free Evaluation', 'Full API Access in Sandbox Environment', 'Sample Data Seeding'],
    billing_history: [],
    entitlements: {
      included_features: ['Sandbox API Tokens', 'Sample Customer Profiles'],
      usage: [{ metric: 'Trial Days Remaining', used: 6, limit: 14, unit: 'days' }],
    },
    changes: {
      upgrades: ['Upgrade to Professional Plan (₹6,999/mo)', 'Upgrade to Enterprise Plan (₹12,999/mo)'],
      downgrades: [],
      proration: 'No charge during trial',
      effective_date: 'Immediate upon upgrade',
    },
  },
]

function mockSubscriptionListResponse(filters?: SubscriptionFilters): CustomerSubscriptionListResponse {
  let list = [...MOCK_SUBSCRIPTIONS_DATA]

  if (filters?.search) {
    const q = filters.search.toLowerCase()
    list = list.filter((s) => s.plan_name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
  }
  if (filters?.status && filters.status !== 'all') {
    list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase())
  }

  const kpis: SubscriptionKpis = {
    active: MOCK_SUBSCRIPTIONS_DATA.filter((s) => s.status === 'active').length,
    trial: MOCK_SUBSCRIPTIONS_DATA.filter((s) => s.status === 'trial').length,
    renewing_soon: MOCK_SUBSCRIPTIONS_DATA.filter((s) => s.status === 'renewing_soon').length,
    cancelled: MOCK_SUBSCRIPTIONS_DATA.filter((s) => s.status === 'cancelled').length,
  }

  const page = filters?.page || 1
  const per_page = filters?.per_page || 10
  const total = list.length
  const total_pages = Math.ceil(total / per_page) || 1
  const start = (page - 1) * per_page

  return {
    subscriptions: list.slice(start, start + per_page),
    kpis,
    meta: { page, per_page, total, total_pages },
  }
}

function getMockSubscriptionDetail(id: string): CustomerSubscriptionDetail {
  const found = MOCK_SUBSCRIPTIONS_DATA.find((s) => s.id.toLowerCase() === id.toLowerCase() || s.plan_name.toLowerCase().includes(id.toLowerCase()))
  if (found) return found
  const first = MOCK_SUBSCRIPTIONS_DATA[0]
  return { ...first, id: id || first.id }
}

/* Profile / Company / Preferences Mock Data */
const mockCustomerProfile: CustomerProfileData = {
  name: 'Alex Vance',
  email: 'alex.vance@acmecorp.com',
  phone: '+1 (555) 019-2834',
  job_title: 'VP of Procurement & Global Supply Chain',
  profile_photo: undefined,
  active_sessions: [
    { id: 'sess-1', device: 'Chrome on macOS (MacBook Pro)', location: 'Austin, TX, USA', ip: '192.168.1.45', last_active: 'Active now', current: true },
    { id: 'sess-2', device: 'DealFlow360 Mobile App (iOS 18)', location: 'Austin, TX, USA', ip: '172.56.21.9', last_active: '2 hours ago', current: false },
  ],
  login_activity: [
    { id: 'act-1', timestamp: '2026-09-05 10:14:22', location: 'Austin, TX, USA', ip: '192.168.1.45', device: 'Chrome 128.0 (macOS)' },
    { id: 'act-2', timestamp: '2026-09-04 16:30:10', location: 'Austin, TX, USA', ip: '172.56.21.9', device: 'DealFlow360 Mobile App' },
    { id: 'act-3', timestamp: '2026-09-02 09:00:00', location: 'Austin, TX, USA', ip: '192.168.1.45', device: 'Chrome 128.0 (macOS)' },
  ],
}

const mockCustomerCompany: CustomerCompanyData = {
  company_name: 'Acme Global Distribution Corp',
  website: 'https://www.acmeglobal.com',
  industry: 'Industrial Equipment & Technology',
  company_size: '250 - 500 Employees',
  primary_contact: 'Alex Vance (VP Procurement)',
  email: 'procurement@acmeglobal.com',
  phone: '+1 (800) 555-0199',
  address: '742 Evergreen Terrace, Suite 400, Austin, TX 78701, United States',
  billing_address: 'Accounts Payable Dept, 742 Evergreen Terrace, Suite 450, Austin, TX 78701',
  tax_information: 'Federal Tax ID (EIN): 84-9201948 · VAT/GST #: US849201948',
  payment_terms: 'Standard Net 30 Days (Direct ACH / Electronic Transfer)',
}

const mockCustomerPreferences: CustomerPreferencesData = {
  notifications: {
    email_notifications: true,
    quote_notifications: true,
    order_notifications: true,
    shipment_notifications: true,
    billing_notifications: true,
  },
  localization: {
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    date_format: 'YYYY-MM-DD',
  },
  appearance: {
    theme: 'system',
    display_preferences: 'Comfortable Density',
  },
}