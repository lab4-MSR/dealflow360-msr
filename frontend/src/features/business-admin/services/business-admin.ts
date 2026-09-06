import type {
  BusinessDashboardKpis,
  SalesOverview,
  RevenueOverview,
  ApprovalOverview,
  InventoryOverview,
  DealHealthOverview,
  RecentDeal,
  ActivityItem,
  DashboardAlert,
  CompanyProfile,
  CompanyProfileUpdate,
  BrandingConfig,
  BrandingUpdate,
  LocalizationConfig,
  LocalizationUpdate,
  CurrencyTaxConfig,
  CurrencyTaxUpdate,
  TaxRate,
  BusinessSettings,
  BusinessSettingsUpdate,
  BusinessUser,
  BusinessUserKpis,
  BusinessUserFilters,
  InviteUserInput,
  Team,
  TeamDetail,
  TeamKpis,
  TeamFilters,
  Role,
  RoleDetail,
  RoleKpis,
  RoleFilters,
  Customer,
  CustomerKpis,
  CustomerFilters,
  CustomerDetail,
  CustomerCreateInput,
  Product,
  ProductKpis,
  ProductFilters,
  ProductDetail,
  ProductCreateInput,
  Category,
  CategoryKpis,
  CategoryFilters,
  CategoryTreeNode,
  PriceList,
  PriceListKpis,
  PriceListFilters,
  PriceListDetail,
  PriceListCreateInput,
  CustomerPricingOverride,
  CustomerPricingInspection,
  VolumePricingTier,
  VolumePricingRule,
  VolumePricingKpis,
  VolumePricingFilters,
  PricingHistoryEntry,
  PricingHistoryFilters,
  DiscountRule,
  DiscountRuleDetail,
  DiscountRuleKpis,
  DiscountRuleFilters,
  DiscountRuleCreateInput,
  CustomerTierConfig,
  CustomerTierKpis,
  DiscountSimulatorRequest,
  DiscountSimulatorResponse,
  CategoryDiscountRule,
  CategoryDiscountRuleKpis,
  MarginRule,
  MarginRuleDetail,
  MarginRuleKpis,
  MarginRuleFilters,
  MarginSimulationRequest,
  MarginSimulationResponse,
  ApprovalRule,
  ApprovalRuleDetail,
  ApprovalRuleKpis,
  ApprovalRuleFilters,
  ApprovalChain,
  ApprovalChainDetail,
  ApprovalChainKpis,
  ApprovalChainFilters,
  ApprovalThresholds,
  ApprovalSimulatorRequest,
  ApprovalSimulatorResponse,
  Warehouse,
  WarehouseDetail,
  WarehouseKpis,
  WarehouseFilters,
  WarehouseCreateInput,
  WarehouseStockMovementFilters,
  ShippingRule,
  ShippingRuleKpis,
  ShippingRuleFilters,
  SubscriptionPlan,
  SubscriptionPlanKpis,
  SubscriptionPlanFilters,
  BillingCycle,
  BillingCycleKpis,
  BillingCycleFilters,
  BillingCycleCreateInput,
  ProrationRule,
  ProrationRuleKpis,
  ProrationCalculationInput,
  ProrationCalculationResult,
  CancellationRule,
  CancellationRuleKpis,
  RefundRule,
  RefundRuleKpis,
  ReportKpis,
  ReportFilters,
  SalesReportData,
  RevenueReportData,
  DiscountReportData,
  MarginReportData,
  ApprovalReportData,
  FulfillmentReportData,
  DealHealthItem,
  DealHealthKpis,
  DealHealthFilters,
  DealAnomaly,
  AuditEvent,
  AuditKpis,
  AuditFilters,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings,
  DataPrivacySettings,
  SubscriptionPlanCreateInput,
} from '../types'

const API_BASE = '/api/v1'

function getAuthHeaders(): Record<string, string> {
  const token =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('dealflow360-access-token') ||
        localStorage.getItem('access_token'))) ||
    ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ─── Data Normalizers ─────────────────────────────────────

export function normalizeBusinessUser(raw: any): BusinessUser {
  if (!raw) return {} as BusinessUser
  return {
    id: String(raw.id ?? ''),
    fullName: String(raw.fullName ?? raw.full_name ?? raw.name ?? raw.email?.split('@')[0] ?? 'User'),
    email: String(raw.email ?? ''),
    role: String(raw.role ?? 'sales_rep'),
    teamId: raw.teamId ?? raw.team_id ?? undefined,
    teamName: raw.teamName ?? raw.team_name ?? (raw.teams?.name ? String(raw.teams.name) : undefined),
    status: (raw.status ?? 'active') as any,
    lastActive: raw.lastActive ?? raw.last_active ?? raw.updated_at ?? raw.created_at,
    joinedAt: raw.joinedAt ?? raw.joined_at ?? raw.created_at ?? '',
    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? undefined,
    phone: raw.phone ?? undefined,
    permissions: Array.isArray(raw.permissions) ? raw.permissions : ['deals.view'],
  }
}

export function normalizeTeam(raw: any): Team {
  if (!raw) return {} as Team
  const users = Array.isArray(raw.users) ? raw.users : []
  const leadUser = users.find((u: any) => u.role === 'sales_manager' || u.role === 'business_admin') ?? users[0]
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    memberCount: Number(raw.memberCount ?? users.length),
    status: String(raw.status ?? 'active'),
    lead: leadUser
      ? {
          id: String(leadUser.id),
          fullName: String(leadUser.fullName ?? leadUser.full_name ?? leadUser.name ?? leadUser.email?.split('@')[0] ?? 'Team Lead'),
          email: String(leadUser.email ?? ''),
          role: String(leadUser.role ?? 'sales_manager'),
          status: String(leadUser.status ?? 'active'),
        }
      : undefined,
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  }
}

export function normalizeRole(raw: any): Role {
  if (!raw) return {} as Role
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    displayName: String(raw.displayName ?? raw.display_name ?? raw.name ?? ''),
    description: String(raw.description ?? ''),
    permissionCount: Number(raw.permissionCount ?? raw.permissions_count ?? 0),
    userCount: Number(raw.userCount ?? raw.user_count ?? 0),
    status: String(raw.status ?? 'active'),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ''),
  }
}

export function normalizeCustomer(raw: any): Customer {
  if (!raw) return {} as Customer
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'Unnamed Customer'),
    email: raw.email ?? raw.contacts?.[0]?.email ?? '',
    tier: raw.tier ?? 'bronze',
    status: raw.status ?? 'active',
    ownerId: raw.ownerId ?? raw.owner_id ?? undefined,
    ownerName: raw.ownerName ?? raw.owner_name ?? raw.owner?.name ?? undefined,
    contacts: Array.isArray(raw.contacts) ? raw.contacts : Array.isArray(raw.customer_contacts) ? raw.customer_contacts : [],
    billingAddress: raw.billingAddress ?? raw.billing_address ?? raw.address ?? undefined,
    totalDeals: Number(raw.totalDeals ?? raw.total_deals ?? 0),
    totalRevenue: Number(raw.totalRevenue ?? raw.total_revenue ?? 0),
    lastActivity: raw.lastActivity ?? raw.last_activity ?? raw.updated_at ?? raw.created_at ?? '',
    createdAt: raw.createdAt ?? raw.created_at ?? '',
  }
}

export function normalizeProduct(raw: any): Product {
  if (!raw) return {} as Product
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'Unnamed Product'),
    sku: String(raw.sku ?? raw.id ?? ''),
    category: String(raw.category ?? raw.category_name ?? 'General'),
    unitPrice: Number(raw.unitPrice ?? raw.unit_price ?? raw.price ?? 0),
    currency: String(raw.currency ?? 'INR'),
    unit: String(raw.unit ?? 'item'),
    status: String(raw.status ?? 'active'),
    stock: Number(raw.stock ?? raw.stock_quantity ?? 0),
    lowStockThreshold: Number(raw.lowStockThreshold ?? raw.low_stock_threshold ?? 10),
    hasVariants: Boolean(raw.hasVariants ?? raw.has_variants ?? false),
    variantCount: Number(raw.variantCount ?? raw.variant_count ?? 0),
    salesCount: Number(raw.salesCount ?? raw.sales_count ?? 0),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  }
}

// ─── Dashboard ────────────────────────────────────────────

export async function fetchDashboardKpis(): Promise<BusinessDashboardKpis> {
  try {
    const response = await fetch(`${API_BASE}/analytics/executive`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch dashboard KPIs')
    const k = json.data?.kpis || {}
    return {
      totalCustomers: k.customers ?? k.totalCustomers ?? 0,
      totalProducts: k.products ?? k.totalProducts ?? 0,
      activeDeals: k.deals ?? k.activeDeals ?? 0,
      pendingApprovals: k.quotations ?? k.pendingApprovals ?? 0,
      revenue: k.revenue ?? 0,
      activeSubscriptions: k.active_subscriptions ?? k.activeSubscriptions ?? 0,
    }
  } catch (err) {
    console.error('Failed to fetch dashboard KPIs:', err)
    return { totalCustomers: 0, totalProducts: 0, activeDeals: 0, pendingApprovals: 0, revenue: 0, activeSubscriptions: 0 }
  }
}

export async function fetchSalesOverview(): Promise<SalesOverview> {
  try {
    const response = await fetch(`${API_BASE}/analytics/sales`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch sales overview')
    const d = json.data || {}
    return {
      totalDeals: d.deals?.total ?? d.totalDeals ?? 0,
      wonDeals: d.deals?.won ?? d.wonDeals ?? 0,
      lostDeals: d.deals?.lost ?? d.lostDeals ?? 0,
      dealConversion: Math.round(d.win_rate ?? d.dealConversion ?? 0),
      dealTrend: Array.isArray(d.dealTrend) ? d.dealTrend : [],
    }
  } catch (err) {
    console.error('Failed to fetch sales overview:', err)
    return { totalDeals: 0, wonDeals: 0, lostDeals: 0, dealConversion: 0, dealTrend: [] }
  }
}

export async function fetchRevenueOverview(): Promise<RevenueOverview> {
  try {
    const response = await fetch(`${API_BASE}/analytics/revenue`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch revenue overview')
    const d = json.data || {}
    const r = d.revenue || {}
    return {
      totalRevenue: r.total ?? d.totalRevenue ?? 0,
      oneTimeRevenue: r.one_time ?? d.oneTimeRevenue ?? 0,
      recurringRevenue: r.recurring ?? d.recurringRevenue ?? 0,
      revenueGrowth: d.revenueGrowth ?? 0,
      revenueTrend: Array.isArray(d.revenueTrend) ? d.revenueTrend : [],
    }
  } catch (err) {
    console.error('Failed to fetch revenue overview:', err)
    return { totalRevenue: 0, oneTimeRevenue: 0, recurringRevenue: 0, revenueGrowth: 0, revenueTrend: [] }
  }
}

export async function fetchApprovalOverview(): Promise<ApprovalOverview> {
  try {
    const response = await fetch(`${API_BASE}/analytics/approvals`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval overview')
    const d = json.data || {}
    return {
      pendingApprovals: d.pendingApprovals ?? d.pending ?? 0,
      highRiskDeals: d.highRiskDeals ?? 0,
      averageApprovalTime: d.averageApprovalTime ?? '—',
      approvalTrend: Array.isArray(d.approvalTrend) ? d.approvalTrend : [],
    }
  } catch (err) {
    console.error('Failed to fetch approval overview:', err)
    return { pendingApprovals: 0, highRiskDeals: 0, averageApprovalTime: '—', approvalTrend: [] }
  }
}

export async function fetchInventoryOverview(): Promise<InventoryOverview> {
  try {
    const response = await fetch(`${API_BASE}/analytics/executive`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch inventory overview')
    const d = json.data?.inventory ?? json.data ?? {}
    return {
      totalStock: d.totalStock ?? d.total_stock ?? 0,
      lowStock: d.lowStock ?? d.low_stock ?? 0,
      outOfStock: d.outOfStock ?? d.out_of_stock ?? 0,
      backorders: d.backorders ?? 0,
      warehouseStatus: d.warehouseStatus ?? 'healthy',
    }
  } catch (err) {
    console.error('Failed to fetch inventory overview:', err)
    return { totalStock: 0, lowStock: 0, outOfStock: 0, backorders: 0, warehouseStatus: 'healthy' }
  }
}

export async function fetchDealHealth(): Promise<DealHealthOverview> {
  try {
    const response = await fetch(`${API_BASE}/deal-health/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch deal health')
    return {
      healthyDeals: json.data?.healthyDeals ?? 0,
      atRisk: json.data?.atRiskDeals ?? 0,
      stalled: json.data?.stalledDeals ?? 0,
      discountAnomalies: json.data?.discountAnomalies ?? 0,
      deliverySlippage: json.data?.deliverySlippage ?? 0,
    }
  } catch (err) {
    console.error('Failed to fetch deal health:', err)
    return { healthyDeals: 0, atRisk: 0, stalled: 0, discountAnomalies: 0, deliverySlippage: 0 }
  }
}

export async function fetchRecentDeals(): Promise<RecentDeal[]> {
  try {
    const response = await fetch(`${API_BASE}/deals?sort=-updated_at&per_page=5`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch recent deals')
    return (json.data ?? []).map((deal: Record<string, unknown>) => ({
      id: String(deal.id),
      name: String(deal.name ?? deal.title ?? 'Untitled deal'),
      customer: typeof deal.customer === 'object' && deal.customer !== null ? String((deal.customer as Record<string, unknown>).name ?? '—') : String(deal.customer ?? '—'),
      salesRep: String(deal.sales_rep_name ?? deal.owner_name ?? '—'),
      value: Number(deal.value ?? deal.amount ?? 0),
      risk: String(deal.risk ?? 'low'),
      status: String(deal.status ?? deal.stage ?? 'draft'),
      updatedAt: String(deal.updated_at ?? deal.updatedAt ?? ''),
    }))
  } catch (err) {
    console.error('Failed to fetch recent deals:', err)
    return []
  }
}

export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  try {
    const response = await fetch(`${API_BASE}/audit?sort=-timestamp&per_page=10`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch activity')
    return (json.data ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      actor: String(item.actor_name ?? item.actor ?? 'System'),
      action: String(item.action ?? 'updated'),
      resource: String(item.entity_name ?? item.entity_id ?? 'Record'),
      resourceType: String(item.entity_type ?? 'system'),
      timestamp: String(item.timestamp ?? item.created_at ?? ''),
      category: String(item.category ?? item.entity_type ?? 'system'),
      severity: String(item.severity ?? 'info'),
    }))
  } catch (err) {
    console.error('Failed to fetch activity:', err)
    return []
  }
}

export async function fetchDashboardAlerts(): Promise<DashboardAlert[]> {
  try {
    const response = await fetch(`${API_BASE}/insights`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch alerts')
    return (json.data ?? []).map((item: Record<string, unknown>) => ({
      id: String(item.id),
      title: String(item.title ?? 'Operational insight'),
      description: String(item.description ?? item.message ?? ''),
      severity: String(item.severity ?? item.priority ?? 'attention'),
      timestamp: String(item.created_at ?? item.timestamp ?? ''),
      actionLabel: item.actionLabel ? String(item.actionLabel) : '',
      actionPath: item.actionPath ? String(item.actionPath) : '',
    }))
  } catch (err) {
    console.error('Failed to fetch alerts:', err)
    return []
  }
}

// ─── Local Storage Persistence Helpers ────────────────────
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return fallback
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: 'biz-1', name: 'Acme Corp', legalName: 'Acme Corporation Pvt. Ltd.', businessType: 'Private Limited',
  industry: 'Technology', registrationNumber: 'U72200KA2021PTC150892', taxId: '29AACCA1234F1Z5',
  email: 'info@acmecorp.com', phone: '+91 80 4567 8900', website: 'https://acmecorp.com',
  supportEmail: 'support@acmecorp.com',
  address: { line1: '123 Business Park', line2: '4th Floor, Tower B', city: 'Bangalore', state: 'Karnataka', country: 'India', postalCode: '560102' },
  primaryContact: { name: 'Rajesh Kumar', email: 'rajesh@acmecorp.com', phone: '+91 98765 43210' },
  status: 'active', createdAt: '2024-01-15T00:00:00Z',
}

const DEFAULT_BRANDING: BrandingConfig = {
  id: 'brand-1', brandName: 'Acme Corp', primaryColor: '#4F46E5', primaryHover: '#4338CA',
  primarySubtle: '#EEF2FF', secondaryColor: '#64748B',
}

const DEFAULT_LOCALIZATION: LocalizationConfig = {
  id: 'loc-1', language: 'en', availableLanguages: ['en', 'hi', 'es', 'fr', 'de'],
  timezone: 'Asia/Kolkata', dateFormat: 'dd MMM yyyy', timeFormat: 'HH:mm',
  decimalSeparator: '.', thousandsSeparator: ',', decimalPrecision: 2,
  country: 'IN', region: 'Karnataka', locale: 'en-IN',
}

const DEFAULT_CURRENCY_TAX: CurrencyTaxConfig = {
  id: 'ct-1', defaultCurrency: 'INR', supportedCurrencies: ['INR'],
  currencySymbol: '₹', decimalPrecision: 2, taxEnabled: true, defaultTax: 'GST 18%',
  taxRates: [
    { id: 'tr-1', name: 'GST 18%', rate: 18, category: 'Standard', status: 'active', effectiveDate: '2024-01-01' },
    { id: 'tr-2', name: 'GST 12%', rate: 12, category: 'Reduced', status: 'active', effectiveDate: '2024-01-01' },
    { id: 'tr-3', name: 'GST 5%', rate: 5, category: 'Reduced', status: 'active', effectiveDate: '2024-01-01' },
    { id: 'tr-4', name: 'GST 0%', rate: 0, category: 'Exempt', status: 'active', effectiveDate: '2024-01-01' },
  ],
  taxCategories: [
    { id: 'tc-1', name: 'Standard', description: 'Standard rate goods and services' },
    { id: 'tc-2', name: 'Reduced', description: 'Reduced rate items' },
    { id: 'tc-3', name: 'Exempt', description: 'Tax exempt items' },
  ],
  taxInclusive: false, invoiceTaxDisplay: 'separate', invoiceTaxCalculation: 'exclusive',
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: 'set-1',
  general: { businessName: 'Acme Corp', defaultCurrency: 'INR', defaultTimezone: 'Asia/Kolkata', defaultLanguage: 'en' },
  sales: { quoteValidityDays: 30, defaultPaymentTerms: 'Net 30', defaultPriceList: 'Standard', salesConfiguration: {} },
  discount: { discountCalculation: 'line_item', maximumDiscountBehavior: 'require_approval', discountApproval: true },
  approval: {
    approvalRequired: true,
    approvalSequence: [
      { id: 'step-1', role: 'Sales Manager', order: 1 },
      { id: 'step-2', role: 'Finance', order: 2 },
    ],
    approvalNotifications: true,
  },
  fulfillment: { defaultWarehouse: 'Main Warehouse', allocationStrategy: 'nearest', backorderBehavior: 'auto_backorder' },
  billing: { invoicePrefix: 'INV', invoiceNextNumber: 1001, paymentTerms: 'Net 30', subscriptionBilling: 'monthly' },
}

// ─── Company Profile ──────────────────────────────────────

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  try {
    const response = await fetch(`${API_BASE}/org/profile`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch company profile')
    setLocalItem('dealflow360_company_profile', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_company_profile', DEFAULT_COMPANY_PROFILE)
  }
}

export async function updateCompanyProfile(data: CompanyProfileUpdate): Promise<CompanyProfile> {
  try {
    const response = await fetch(`${API_BASE}/org/profile`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_company_profile', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_company_profile', DEFAULT_COMPANY_PROFILE)
  const updated: CompanyProfile = {
    ...current,
    ...data,
    address: { ...(current.address || {}), ...(data.address || {}) },
    primaryContact: { ...(current.primaryContact || {}), ...(data.primaryContact || {}) },
  }
  setLocalItem('dealflow360_company_profile', updated)
  return updated
}

// ─── Branding ─────────────────────────────────────────────

export async function fetchBranding(): Promise<BrandingConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/branding`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch branding')
    setLocalItem('dealflow360_branding', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_branding', DEFAULT_BRANDING)
  }
}

export async function updateBranding(data: BrandingUpdate): Promise<BrandingConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/branding`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_branding', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_branding', DEFAULT_BRANDING)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_branding', updated)
  return updated
}

export async function resetBranding(): Promise<BrandingConfig> {
  try {
    await fetch(`${API_BASE}/org/branding`, {
      method: 'PATCH', headers: getAuthHeaders(),
      body: JSON.stringify(DEFAULT_BRANDING),
    })
  } catch {}
  setLocalItem('dealflow360_branding', DEFAULT_BRANDING)
  return DEFAULT_BRANDING
}

// ─── Localization ─────────────────────────────────────────

export async function fetchLocalization(): Promise<LocalizationConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/localization`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch localization')
    setLocalItem('dealflow360_localization', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_localization', DEFAULT_LOCALIZATION)
  }
}

export async function updateLocalization(data: LocalizationUpdate): Promise<LocalizationConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/localization`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_localization', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_localization', DEFAULT_LOCALIZATION)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_localization', updated)
  return updated
}

// ─── Currency & Tax ───────────────────────────────────────

export async function fetchCurrencyTax(): Promise<CurrencyTaxConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/currency-tax`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch currency & tax')
    setLocalItem('dealflow360_currency_tax', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_currency_tax', DEFAULT_CURRENCY_TAX)
  }
}

export async function updateCurrencyTax(data: CurrencyTaxUpdate): Promise<CurrencyTaxConfig> {
  try {
    const response = await fetch(`${API_BASE}/org/currency-tax`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_currency_tax', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_currency_tax', DEFAULT_CURRENCY_TAX)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_currency_tax', updated)
  return updated
}

export async function addTaxRate(rate: Omit<TaxRate, 'id'>): Promise<TaxRate> {
  try {
    const response = await fetch(`${API_BASE}/org/currency-tax/tax-rates`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(rate),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) return json.data
    }
  } catch {}
  const current = getLocalItem('dealflow360_currency_tax', DEFAULT_CURRENCY_TAX)
  const newRate: TaxRate = {
    ...rate,
    id: `tr-${Date.now()}`,
  }
  const updated = {
    ...current,
    taxRates: [...(current.taxRates || []), newRate],
  }
  setLocalItem('dealflow360_currency_tax', updated)
  return newRate
}

// ─── Business Settings ────────────────────────────────────

export async function fetchBusinessSettings(): Promise<BusinessSettings> {
  try {
    const response = await fetch(`${API_BASE}/org/settings`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch business settings')
    setLocalItem('dealflow360_biz_settings', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_biz_settings', DEFAULT_BUSINESS_SETTINGS)
  }
}

export async function updateBusinessSettings(data: BusinessSettingsUpdate): Promise<BusinessSettings> {
  try {
    const response = await fetch(`${API_BASE}/org/settings`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_biz_settings', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_biz_settings', DEFAULT_BUSINESS_SETTINGS)
  const updated: BusinessSettings = {
    ...current,
    ...data,
    general: { ...(current.general || {}), ...(data.general || {}) },
    sales: { ...(current.sales || {}), ...(data.sales || {}) },
    discount: { ...(current.discount || {}), ...(data.discount || {}) },
    approval: { ...(current.approval || {}), ...(data.approval || {}) },
    fulfillment: { ...(current.fulfillment || {}), ...(data.fulfillment || {}) },
    billing: { ...(current.billing || {}), ...(data.billing || {}) },
  }
  setLocalItem('dealflow360_biz_settings', updated)
  return updated
}

// ─── Users ────────────────────────────────────────────────

export async function fetchUsers(filters: BusinessUserFilters = {}): Promise<{ users: BusinessUser[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.role) params.set('filter[role]', filters.role)
    if (filters.team) params.set('filter[team]', filters.team)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/users${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch users')
    const rawList = Array.isArray(json.data) ? json.data : []
    const users = rawList.map(normalizeBusinessUser)
    return {
      users,
      total: json.meta?.total ?? users.length,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return { users: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchUserKpis(): Promise<BusinessUserKpis> {
  try {
    const response = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user KPIs')
    const rawList = Array.isArray(json.data) ? json.data : []
    const users = rawList.map(normalizeBusinessUser)
    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      pendingInvitations: users.filter((u) => u.status === 'pending' || (u.status as any) === 'invited').length,
      inactiveUsers: users.filter((u) => u.status !== 'active' && u.status !== 'pending' && (u.status as any) !== 'invited').length,
    }
  } catch (err) {
    console.error('Failed to fetch user KPIs:', err)
    return { totalUsers: 0, activeUsers: 0, pendingInvitations: 0, inactiveUsers: 0 }
  }
}

export async function fetchUserById(id: string): Promise<BusinessUser> {
  const response = await fetch(`${API_BASE}/users/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch user')
  return normalizeBusinessUser(json.data)
}

export async function inviteUser(input: InviteUserInput): Promise<BusinessUser> {
  const response = await fetch(`${API_BASE}/users/invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to invite user')
  return normalizeBusinessUser(json.data)
}

export async function updateUser(id: string, data: Partial<Pick<BusinessUser, 'role' | 'status' | 'teamId'>>): Promise<BusinessUser> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to update user')
  return normalizeBusinessUser(json.data)
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

// ─── Teams ────────────────────────────────────────────────

export async function fetchTeams(filters: TeamFilters = {}): Promise<{ teams: Team[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/teams${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch teams')
    const rawList = Array.isArray(json.data) ? json.data : []
    const teams = rawList.map(normalizeTeam)
    return {
      teams,
      total: json.meta?.total ?? teams.length,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch teams:', err)
    return { teams: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchTeamKpis(): Promise<TeamKpis> {
  try {
    const response = await fetch(`${API_BASE}/teams`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch team KPIs')
    const rawList = Array.isArray(json.data) ? json.data : []
    const teams = rawList.map(normalizeTeam)
    return {
      totalTeams: teams.length,
      activeTeams: teams.filter((t) => t.status === 'active').length,
      totalMembers: teams.reduce((sum, t) => sum + (t.memberCount ?? 0), 0),
    }
  } catch (err) {
    console.error('Failed to fetch team KPIs:', err)
    return { totalTeams: 0, totalMembers: 0, activeTeams: 0 }
  }
}

export async function fetchTeamById(id: string): Promise<TeamDetail> {
  const response = await fetch(`${API_BASE}/teams/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch team')
  const team = normalizeTeam(json.data)
  return {
    ...team,
    members: Array.isArray(json.data?.users) ? json.data.users.map(normalizeBusinessUser) : [],
  }
}

export async function createTeam(data: { name: string; description?: string; leadId?: string }): Promise<Team> {
  const response = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to create team')
  return normalizeTeam(json.data)
}

export async function updateTeam(id: string, data: Partial<Pick<Team, 'name' | 'description' | 'lead' | 'status'>>): Promise<Team> {
  const response = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to update team')
  return normalizeTeam(json.data)
}

export async function deleteTeam(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

// ─── Roles ────────────────────────────────────────────────

export async function fetchRoles(filters: RoleFilters = {}): Promise<{ roles: Role[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/roles${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch roles')
    const rawList = Array.isArray(json.data) ? json.data : []
    const roles = rawList.map(normalizeRole)
    return {
      roles,
      total: json.meta?.total ?? roles.length,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch roles:', err)
    return { roles: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchRoleKpis(): Promise<RoleKpis> {
  try {
    const response = await fetch(`${API_BASE}/roles`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch role KPIs')
    const rawList = Array.isArray(json.data) ? json.data : []
    return {
      totalRoles: rawList.length,
      customRoles: rawList.filter((r: any) => r.is_custom).length,
      systemRoles: rawList.filter((r: any) => !r.is_custom).length,
    }
  } catch (err) {
    console.error('Failed to fetch role KPIs:', err)
    return { totalRoles: 0, customRoles: 0, systemRoles: 0 }
  }
}

export async function fetchRoleById(id: string): Promise<RoleDetail> {
  const response = await fetch(`${API_BASE}/roles/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch role')
  return {
    ...normalizeRole(json.data),
    permissions: json.data?.permissions ?? {},
  }
}

export async function createRole(data: { name: string; displayName: string; description?: string }): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to create role')
  return normalizeRole(json.data)
}

export async function updateRole(id: string, data: Partial<Pick<Role, 'displayName' | 'description' | 'status'>>): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to update role')
  return normalizeRole(json.data)
}

export async function updateRolePermissions(id: string, permissions: string[]): Promise<RoleDetail> {
  const response = await fetch(`${API_BASE}/roles/${id}/permissions`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ permissions }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to update permissions')
  return {
    ...normalizeRole(json.data),
    permissions: json.data?.permissions ?? permissions,
  }
}

export async function duplicateRole(id: string, data: { name: string; displayName: string }): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to duplicate role')
  return normalizeRole(json.data)
}

export async function deleteRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

// ─── Customers ────────────────────────────────────────────

export async function fetchCustomers(filters: CustomerFilters = {}): Promise<{ customers: Customer[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.tier) params.set('filter[tier]', filters.tier)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.ownerId) params.set('filter[owner_id]', filters.ownerId)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/customers${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch customers')
    const rawList = Array.isArray(json.data) ? json.data : []
    const customers = rawList.map(normalizeCustomer)
    return {
      customers,
      total: json.meta?.total ?? customers.length,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch customers:', err)
    return { customers: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchCustomerKpis(): Promise<CustomerKpis> {
  try {
    const response = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch customer KPIs')
    const list = Array.isArray(json.data) ? json.data : []
    const totalRev = list.reduce((acc: number, c: any) => acc + Number(c.total_revenue || c.totalRevenue || 0), 0)
    return {
      totalCustomers: list.length,
      activeCustomers: list.filter((c: any) => c.status === 'active').length,
      totalRevenue: totalRev,
      averageDealSize: list.length ? Math.round(totalRev / list.length) : 0,
    }
  } catch (err) {
    console.error('Failed to fetch customer KPIs:', err)
    return { totalCustomers: 0, activeCustomers: 0, totalRevenue: 0, averageDealSize: 0 }
  }
}

export async function fetchCustomerById(id: string): Promise<CustomerDetail> {
  const response = await fetch(`${API_BASE}/customers/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch customer')
  const base = normalizeCustomer(json.data)
  return {
    ...base,
    deals: Array.isArray(json.data?.deals) ? json.data.deals : [],
    orders: Array.isArray(json.data?.orders) ? json.data.orders : [],
    billing: json.data?.billing ?? { outstandingBalance: 0, totalInvoiced: 0, totalPaid: 0, lastInvoiceDate: '', paymentTerms: 'Net 30' },
    recentActivity: Array.isArray(json.data?.recentActivity) ? json.data.recentActivity : [],
  }
}

export async function createCustomer(data: CustomerCreateInput): Promise<Customer> {
  const response = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to create customer')
  return normalizeCustomer(json.data)
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to update customer')
  return normalizeCustomer(json.data)
}

export async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

// ─── Products ─────────────────────────────────────────────

export async function fetchProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('filter[category]', filters.category)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/products${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch products')
    const rawList = Array.isArray(json.data) ? json.data : []
    const products = rawList.map(normalizeProduct)
    return {
      products,
      total: json.meta?.total ?? products.length,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return { products: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchProductKpis(): Promise<ProductKpis> {
  try {
    const response = await fetch(`${API_BASE}/products`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch product KPIs')
    const list = Array.isArray(json.data) ? json.data : []
    return {
      totalProducts: list.length,
      activeProducts: list.filter((p: any) => p.status === 'active').length,
      lowStock: list.filter((p: any) => Number(p.stock_quantity ?? p.stock ?? 0) <= Number(p.low_stock_threshold ?? p.lowStockThreshold ?? 10)).length,
      totalValue: list.reduce((sum: number, p: any) => sum + (Number(p.price || p.unit_price || p.unitPrice || 0) * Number(p.stock_quantity || p.stock || 0)), 0),
    }
  } catch (err) {
    console.error('Failed to fetch product KPIs:', err)
    return { totalProducts: 0, activeProducts: 0, lowStock: 0, totalValue: 0 }
  }
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  const response = await fetch(`${API_BASE}/products/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch product')
  return {
    ...normalizeProduct(json.data),
    variants: Array.isArray(json.data?.variants) ? json.data.variants : [],
    priceLists: Array.isArray(json.data?.priceLists) ? json.data.priceLists : [],
  }
}

export async function createProduct(data: ProductCreateInput): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create product')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update product')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Categories ───────────────────────────────────────────

export async function fetchCategories(filters: CategoryFilters = {}): Promise<{ categories: Category[]; total: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.parentId) params.set('filter[parent_id]', filters.parentId)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/categories${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch categories')
    return { categories: json.data, total: json.meta?.total || 0 }
  } catch {
    return {
      categories: [
        { id: 'cat1', name: 'Software', description: 'Software products and licenses', productCount: 45, subcategoryCount: 3, status: 'active', sortOrder: 1, createdAt: '2024-01-20' },
        { id: 'cat2', name: 'Services', description: 'Professional services and support', productCount: 22, subcategoryCount: 2, status: 'active', sortOrder: 2, createdAt: '2024-01-20' },
        { id: 'cat3', name: 'Hardware', description: 'Physical products and equipment', productCount: 15, subcategoryCount: 2, status: 'active', sortOrder: 3, createdAt: '2024-02-01' },
        { id: 'cat4', name: 'Subscriptions', description: 'Recurring subscription products', productCount: 7, subcategoryCount: 0, status: 'active', sortOrder: 4, createdAt: '2024-03-01' },
      ],
      total: 4,
    }
  }
}

export async function fetchCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    const response = await fetch(`${API_BASE}/categories/tree`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch category tree')
    return json.data
  } catch {
    return [
      { id: 'cat1', name: 'Software', description: 'Software products and licenses', productCount: 45, subcategoryCount: 3, status: 'active', sortOrder: 1, createdAt: '2024-01-20', children: [
        { id: 'cat1a', name: 'CRM Modules', parentId: 'cat1', parentName: 'Software', productCount: 12, subcategoryCount: 0, status: 'active', sortOrder: 1, createdAt: '2024-01-20', children: [] },
        { id: 'cat1b', name: 'ERP Modules', parentId: 'cat1', parentName: 'Software', productCount: 18, subcategoryCount: 0, status: 'active', sortOrder: 2, createdAt: '2024-01-20', children: [] },
        { id: 'cat1c', name: 'Analytics Tools', parentId: 'cat1', parentName: 'Software', productCount: 15, subcategoryCount: 0, status: 'active', sortOrder: 3, createdAt: '2024-02-01', children: [] },
      ]},
      { id: 'cat2', name: 'Services', description: 'Professional services and support', productCount: 22, subcategoryCount: 2, status: 'active', sortOrder: 2, createdAt: '2024-01-20', children: [
        { id: 'cat2a', name: 'Implementation', parentId: 'cat2', parentName: 'Services', productCount: 8, subcategoryCount: 0, status: 'active', sortOrder: 1, createdAt: '2024-01-20', children: [] },
        { id: 'cat2b', name: 'Support Plans', parentId: 'cat2', parentName: 'Services', productCount: 14, subcategoryCount: 0, status: 'active', sortOrder: 2, createdAt: '2024-01-20', children: [] },
      ]},
      { id: 'cat3', name: 'Hardware', description: 'Physical products and equipment', productCount: 15, subcategoryCount: 2, status: 'active', sortOrder: 3, createdAt: '2024-02-01', children: [
        { id: 'cat3a', name: 'Servers', parentId: 'cat3', parentName: 'Hardware', productCount: 8, subcategoryCount: 0, status: 'active', sortOrder: 1, createdAt: '2024-02-01', children: [] },
        { id: 'cat3b', name: 'Networking', parentId: 'cat3', parentName: 'Hardware', productCount: 7, subcategoryCount: 0, status: 'active', sortOrder: 2, createdAt: '2024-02-01', children: [] },
      ]},
      { id: 'cat4', name: 'Subscriptions', description: 'Recurring subscription products', productCount: 7, subcategoryCount: 0, status: 'active', sortOrder: 4, createdAt: '2024-03-01', children: [] },
    ]
  }
}

export async function fetchCategoryKpis(): Promise<CategoryKpis> {
  try {
    const response = await fetch(`${API_BASE}/categories?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch category KPIs')
    return json.data.kpis
  } catch {
    return { totalCategories: 4, totalSubcategories: 9, totalProducts: 89 }
  }
}

export async function createCategory(data: { name: string; description?: string; parentId?: string }): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create category')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateCategory(id: string, data: Partial<Pick<Category, 'name' | 'description' | 'status' | 'sortOrder'>>): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update category')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Price Lists ──────────────────────────────────────────

export async function fetchPriceLists(filters: PriceListFilters = {}): Promise<{ priceLists: PriceList[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.currency) params.set('filter[currency]', filters.currency)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/price-lists${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch price lists')
    return {
      priceLists: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      priceLists: [
        { id: 'pl1', name: 'Standard Pricing', description: 'Default pricing for all customers', currency: 'INR', status: 'active', scope: 'all', itemCount: 6, createdAt: '2024-01-20', updatedAt: '2026-08-15' },
        { id: 'pl2', name: 'Enterprise Pricing', description: 'Discounted pricing for enterprise tier customers', currency: 'INR', status: 'active', scope: 'tier', tierScope: 'platinum', itemCount: 6, createdAt: '2024-03-01', updatedAt: '2026-09-01' },
        { id: 'pl3', name: 'Partner Pricing', description: 'Special pricing for partner accounts', currency: 'INR', status: 'draft', scope: 'customer', itemCount: 3, createdAt: '2026-08-01', updatedAt: '2026-08-01' },
      ],
      total: 3, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchPriceListKpis(): Promise<PriceListKpis> {
  try {
    const response = await fetch(`${API_BASE}/price-lists?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch price list KPIs')
    return json.data.kpis
  } catch {
    return { totalLists: 3, activeLists: 2, draftLists: 1, totalItems: 15 }
  }
}

export async function fetchPriceListById(id: string): Promise<PriceListDetail> {
  try {
    const response = await fetch(`${API_BASE}/price-lists/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch price list')
    return json.data
  } catch {
    return {
      id, name: 'Standard Pricing', description: 'Default pricing for all customers', currency: 'INR', status: 'active', scope: 'all', itemCount: 6, createdAt: '2024-01-20', updatedAt: '2026-08-15',
      items: [
        { id: 'pli1', productId: 'p1', productName: 'Enterprise Suite', productSku: 'ENT-001', unitPrice: 5000, currency: 'INR' },
        { id: 'pli2', productId: 'p2', productName: 'Professional Suite', productSku: 'PRO-001', unitPrice: 2500, currency: 'INR' },
        { id: 'pli3', productId: 'p3', productName: 'Starter Pack', productSku: 'STR-001', unitPrice: 500, currency: 'INR' },
        { id: 'pli4', productId: 'p4', productName: 'Premium Support', productSku: 'SUP-001', unitPrice: 12000, currency: 'INR' },
        { id: 'pli5', productId: 'p5', productName: 'Onboarding Package', productSku: 'OBP-001', unitPrice: 3000, currency: 'INR' },
        { id: 'pli6', productId: 'p6', productName: 'Legacy Module', productSku: 'LEG-001', unitPrice: 800, currency: 'INR' },
      ],
    }
  }
}

export async function createPriceList(data: PriceListCreateInput): Promise<PriceList> {
  try {
    const response = await fetch(`${API_BASE}/price-lists`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create price list')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updatePriceList(id: string, data: Partial<PriceList>): Promise<PriceList> {
  try {
    const response = await fetch(`${API_BASE}/price-lists/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update price list')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deletePriceList(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/price-lists/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Customer Pricing ─────────────────────────────────────

export async function fetchCustomerPricing(customerId: string): Promise<CustomerPricingInspection> {
  try {
    const response = await fetch(`${API_BASE}/customer-pricing?filter[customer_id]=${customerId}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch customer pricing')
    return json.data
  } catch {
    return {
      customer: { id: customerId, name: 'Acme Corp', tier: 'gold', tierDisplayName: 'Gold' },
      priceList: { id: 'pl1', name: 'Standard Pricing', currency: 'INR' },
      products: [
        { productId: 'p1', productName: 'Enterprise Suite', productSku: 'ENT-001', standardPrice: 5000, priceListPrice: 4500, volumePrice: null, customerOverride: null, effectivePrice: 4500, currency: 'INR', priceSource: 'price_list', hasOverride: false },
        { productId: 'p2', productName: 'Professional Suite', productSku: 'PRO-001', standardPrice: 2500, priceListPrice: 2250, volumePrice: null, customerOverride: 2100, effectivePrice: 2100, currency: 'INR', priceSource: 'override', hasOverride: true },
        { productId: 'p3', productName: 'Starter Pack', productSku: 'STR-001', standardPrice: 500, priceListPrice: 475, volumePrice: 450, customerOverride: null, effectivePrice: 450, currency: 'INR', priceSource: 'volume', hasOverride: false },
        { productId: 'p4', productName: 'Premium Support', productSku: 'SUP-001', standardPrice: 12000, priceListPrice: null, volumePrice: null, customerOverride: null, effectivePrice: 12000, currency: 'INR', priceSource: 'standard', hasOverride: false },
      ],
    }
  }
}

export async function createCustomerPricingOverride(data: Omit<CustomerPricingOverride, 'id'>): Promise<CustomerPricingOverride> {
  try {
    const response = await fetch(`${API_BASE}/customer-pricing`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create override')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteCustomerPricingOverride(customerId: string, productId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/customer-pricing/${customerId}/overrides/${productId}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (json && json.success === false) throw new Error(json.error?.message || 'Failed to delete override')
  } catch (err) {
    throw err
  }
}

// ─── Volume Pricing ───────────────────────────────────────

export async function fetchVolumePricingRules(filters: VolumePricingFilters = {}): Promise<{ rules: VolumePricingRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/volume-pricing${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch volume pricing')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      rules: [
        { id: 'vp1', productId: 'p1', productName: 'Enterprise Suite', productSku: 'ENT-001', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-08-15', tiers: [
          { id: 't1', minQuantity: 1, maxQuantity: 9, unitPrice: 5000, currency: 'INR' },
          { id: 't2', minQuantity: 10, maxQuantity: 49, unitPrice: 4500, discountPercent: 10, currency: 'INR' },
          { id: 't3', minQuantity: 50, maxQuantity: 99, unitPrice: 4000, discountPercent: 20, currency: 'INR' },
          { id: 't4', minQuantity: 100, unitPrice: 3500, discountPercent: 30, currency: 'INR' },
        ]},
        { id: 'vp2', productId: 'p2', productName: 'Professional Suite', productSku: 'PRO-001', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-09-01', tiers: [
          { id: 't5', minQuantity: 1, maxQuantity: 19, unitPrice: 2500, currency: 'INR' },
          { id: 't6', minQuantity: 20, maxQuantity: 99, unitPrice: 2200, discountPercent: 12, currency: 'INR' },
          { id: 't7', minQuantity: 100, unitPrice: 1900, discountPercent: 24, currency: 'INR' },
        ]},
        { id: 'vp3', productId: 'p3', productName: 'Starter Pack', productSku: 'STR-001', status: 'inactive', createdAt: '2024-05-01', updatedAt: '2026-07-01', tiers: [
          { id: 't8', minQuantity: 1, maxQuantity: 49, unitPrice: 500, currency: 'INR' },
          { id: 't9', minQuantity: 50, unitPrice: 425, discountPercent: 15, currency: 'INR' },
        ]},
      ],
      total: 3, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchVolumePricingKpis(): Promise<VolumePricingKpis> {
  try {
    const response = await fetch(`${API_BASE}/volume-pricing?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch volume pricing KPIs')
    return json.data.kpis
  } catch {
    return { totalRules: 3, activeRules: 2, totalTiers: 9, productsCovered: 3 }
  }
}

export async function createVolumePricingRule(data: { productId: string; tiers: Omit<VolumePricingTier, 'id'>[] }): Promise<VolumePricingRule> {
  try {
    const response = await fetch(`${API_BASE}/volume-pricing`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create volume pricing')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateVolumePricingRule(id: string, data: { tiers?: Omit<VolumePricingTier, 'id'>[]; status?: string }): Promise<VolumePricingRule> {
  try {
    const response = await fetch(`${API_BASE}/volume-pricing/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update volume pricing')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteVolumePricingRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/volume-pricing/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Pricing History ──────────────────────────────────────

export async function fetchPricingHistory(filters: PricingHistoryFilters = {}): Promise<{ entries: PricingHistoryEntry[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.entityType) params.set('filter[entity_type]', filters.entityType)
    if (filters.entityId) params.set('filter[entity_id]', filters.entityId)
    if (filters.actor) params.set('filter[actor]', filters.actor)
    if (filters.dateFrom) params.set('filter[date_from]', filters.dateFrom)
    if (filters.dateTo) params.set('filter[date_to]', filters.dateTo)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/pricing-history${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch pricing history')
    return {
      entries: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      entries: [
        { id: 'ph1', entityType: 'price_list', entityId: 'pl1', entityName: 'Standard Pricing', field: 'status', previousValue: 'draft', newValue: 'active', actor: 'John Doe', actorRole: 'Business Admin', reason: 'Initial activation', timestamp: '2026-08-15T10:00:00Z' },
        { id: 'ph2', entityType: 'product', entityId: 'p1', entityName: 'Enterprise Suite', field: 'unit_price', previousValue: '4800', newValue: '5000', actor: 'Jane Smith', actorRole: 'Business Admin', timestamp: '2026-09-01T14:30:00Z' },
        { id: 'ph3', entityType: 'customer_pricing', entityId: 'cp1', entityName: 'Acme Corp — Professional Suite', field: 'override_price', previousValue: '2300', newValue: '2100', actor: 'John Doe', actorRole: 'Business Admin', reason: 'Contract renewal discount', timestamp: '2026-09-03T09:15:00Z' },
        { id: 'ph4', entityType: 'volume_pricing', entityId: 'vp1', entityName: 'Enterprise Suite — Volume Tiers', field: 'tiers', previousValue: '3 tiers', newValue: '4 tiers', actor: 'Jane Smith', actorRole: 'Business Admin', reason: 'Added enterprise volume tier', timestamp: '2026-09-04T11:00:00Z' },
        { id: 'ph5', entityType: 'discount_rule', entityId: 'dr1', entityName: 'Gold Tier Ceiling', field: 'max_discount_percent', previousValue: '12', newValue: '15', actor: 'John Doe', actorRole: 'Business Admin', reason: 'Increased gold tier allowance', timestamp: '2026-09-05T08:00:00Z' },
      ],
      total: 5, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

// ─── Discount Rules ───────────────────────────────────────

export async function fetchDiscountRules(filters: DiscountRuleFilters = {}): Promise<{ rules: DiscountRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('filter[type]', filters.type)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.customerTier) params.set('filter[customer_tier]', filters.customerTier)
    if (filters.categoryId) params.set('filter[category_id]', filters.categoryId)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/discount-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch discount rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      rules: [
        { id: 'dr1', name: 'Gold Tier Ceiling', description: 'Maximum discount allowed for Gold tier customers', type: 'customer_tier', priority: 10, scope: { customerTier: 'gold' }, maxDiscountPercent: 15, minMarginPercent: 20, conditions: {}, approvalRequired: true, approvalLevel: 'sales_manager', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-09-05' },
        { id: 'dr2', name: 'Platinum Tier Ceiling', description: 'Maximum discount for Platinum tier customers', type: 'customer_tier', priority: 10, scope: { customerTier: 'platinum' }, maxDiscountPercent: 20, minMarginPercent: 18, conditions: {}, approvalRequired: true, approvalLevel: 'sales_manager_then_finance', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-08-15' },
        { id: 'dr3', name: 'Software Category Cap', description: 'Category-level discount cap for all software products', type: 'category', priority: 20, scope: { categoryId: 'cat1' }, maxDiscountPercent: 10, lineDiscountPercent: 10, conditions: {}, approvalRequired: true, approvalLevel: 'sales_manager', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-08-01' },
        { id: 'dr4', name: 'Services Category Cap', description: 'Category-level discount cap for services', type: 'category', priority: 20, scope: { categoryId: 'cat2' }, maxDiscountPercent: 8, lineDiscountPercent: 8, minMarginPercent: 30, conditions: {}, approvalRequired: true, approvalLevel: 'finance', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-08-01' },
        { id: 'dr5', name: 'Minimum Margin Guard', description: 'Global minimum margin protection across all products', type: 'margin', priority: 5, scope: { isGlobal: true }, maxDiscountPercent: 25, minMarginPercent: 15, marginThreshold: 10, riskBehavior: 'require_approval', conditions: {}, approvalRequired: true, approvalLevel: 'finance', status: 'active', createdAt: '2024-01-15', updatedAt: '2026-07-01' },
        { id: 'dr6', name: 'Large Deal Override', description: 'Additional discount allowance for deals above ₹100K', type: 'global', priority: 30, scope: { isGlobal: true }, maxDiscountPercent: 22, conditions: { minDealValue: 100000 }, approvalRequired: true, approvalLevel: 'sales_manager_then_finance', status: 'active', createdAt: '2024-06-01', updatedAt: '2026-09-01' },
      ],
      total: 6, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchDiscountRuleKpis(): Promise<DiscountRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch discount rule KPIs')
    return json.data.kpis
  } catch {
    return { totalRules: 6, activeRules: 6, customerRules: 2, categoryRules: 2, marginRules: 1 }
  }
}

export async function fetchDiscountRuleById(id: string): Promise<DiscountRuleDetail> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch discount rule')
    return json.data
  } catch {
    return {
      id, name: 'Gold Tier Ceiling', description: 'Maximum discount allowed for Gold tier customers',
      type: 'customer_tier', priority: 10, scope: { customerTier: 'gold' },
      maxDiscountPercent: 15, minMarginPercent: 20, conditions: {},
      approvalRequired: true, approvalLevel: 'sales_manager', status: 'active',
      createdAt: '2024-03-01', updatedAt: '2026-09-05',
      changeLog: [
        { id: 'cl1', actor: 'John Doe', action: 'created', field: 'status', oldValue: '', newValue: 'active', timestamp: '2024-03-01T00:00:00Z' },
        { id: 'cl2', actor: 'Jane Smith', action: 'updated', field: 'max_discount_percent', oldValue: '12', newValue: '15', reason: 'Increased gold tier allowance per Q3 policy', timestamp: '2026-09-05T08:00:00Z' },
      ],
    }
  }
}

export async function createDiscountRule(data: DiscountRuleCreateInput): Promise<DiscountRule> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create discount rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateDiscountRule(id: string, data: Partial<DiscountRule>): Promise<DiscountRule> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update discount rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteDiscountRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Customer Tiers ───────────────────────────────────────

export async function fetchCustomerTiers(): Promise<CustomerTierConfig[]> {
  try {
    const response = await fetch(`${API_BASE}/customer-tiers`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch customer tiers')
    return json.data
  } catch {
    return [
      { id: 'ct-bronze', tier: 'bronze', displayName: 'Bronze', maxDiscountPercent: 5, defaultPriceListId: 'pl1', defaultPriceListName: 'Standard Pricing', minMarginPercent: 30, approvalRequired: false, customerCount: 45, status: 'active', updatedAt: '2026-08-01' },
      { id: 'ct-silver', tier: 'silver', displayName: 'Silver', maxDiscountPercent: 10, defaultPriceListId: 'pl1', defaultPriceListName: 'Standard Pricing', minMarginPercent: 25, approvalRequired: false, customerCount: 32, status: 'active', updatedAt: '2026-08-01' },
      { id: 'ct-gold', tier: 'gold', displayName: 'Gold', maxDiscountPercent: 15, defaultPriceListId: 'pl2', defaultPriceListName: 'Enterprise Pricing', minMarginPercent: 20, approvalRequired: true, approvalLevel: 'sales_manager', customerCount: 18, status: 'active', updatedAt: '2026-09-05' },
      { id: 'ct-platinum', tier: 'platinum', displayName: 'Platinum', maxDiscountPercent: 20, defaultPriceListId: 'pl2', defaultPriceListName: 'Enterprise Pricing', minMarginPercent: 15, approvalRequired: true, approvalLevel: 'sales_manager_then_finance', customerCount: 8, status: 'active', updatedAt: '2026-08-15' },
    ]
  }
}

export async function updateCustomerTier(id: string, data: Partial<CustomerTierConfig>): Promise<CustomerTierConfig> {
  try {
    const response = await fetch(`${API_BASE}/customer-tiers/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update customer tier')
    return json.data
  } catch (err) {
    throw err
  }
}

// ─── Discount Simulator ───────────────────────────────────

export async function simulateDiscount(data: DiscountSimulatorRequest): Promise<DiscountSimulatorResponse> {
  try {
    const response = await fetch(`${API_BASE}/discount-simulator`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to simulate discount')
    return json.data
  } catch {
    return {
      lines: [
        { productId: 'p1', productName: 'Enterprise Suite', customerTierCeiling: 15, categoryCeiling: 10, productCeiling: null, requestedDiscountPercent: 18, allowedDiscountPercent: 10, excessPercent: 8, violatedRuleIds: ['dr1', 'dr3'] },
      ],
      orderLevel: { requestedDiscountPercent: 14.2, allowedDiscountPercent: 15, excessPercent: 0 },
      finalCeiling: 10,
      overallRisk: 'high',
      approvalRequired: true,
      approvalLevel: 'sales_manager_then_finance',
    }
  }
}

// ─── Category Discount Rules ──────────────────────────────

export async function fetchCategoryDiscountRules(): Promise<CategoryDiscountRule[]> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules?filter[type]=category`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch category rules')
    return json.data
  } catch {
    return [
      { id: 'cdr1', categoryId: 'cat1', categoryName: 'Software', categoryPath: 'Software', maxDiscountPercent: 10, lineDiscountPercent: 10, minMarginPercent: 25, approvalRequired: true, approvalLevel: 'sales_manager', priority: 20, conflictHandling: 'highest_priority', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-08-01' },
      { id: 'cdr2', categoryId: 'cat2', categoryName: 'Services', categoryPath: 'Services', maxDiscountPercent: 8, lineDiscountPercent: 8, minMarginPercent: 30, approvalRequired: true, approvalLevel: 'finance', priority: 20, conflictHandling: 'highest_priority', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-08-01' },
      { id: 'cdr3', categoryId: 'cat3', categoryName: 'Hardware', categoryPath: 'Hardware', maxDiscountPercent: 12, lineDiscountPercent: 12, minMarginPercent: 22, approvalRequired: true, approvalLevel: 'sales_manager', priority: 20, conflictHandling: 'highest_priority', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-07-15' },
      { id: 'cdr4', categoryId: 'cat4', categoryName: 'Subscriptions', categoryPath: 'Subscriptions', maxDiscountPercent: 15, lineDiscountPercent: 15, minMarginPercent: 20, approvalRequired: true, approvalLevel: 'sales_manager_then_finance', priority: 20, conflictHandling: 'highest_priority', status: 'active', createdAt: '2024-05-01', updatedAt: '2026-09-01' },
    ]
  }
}

export async function fetchCategoryDiscountRuleKpis(): Promise<CategoryDiscountRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules?filter[type]=category&per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch category rule KPIs')
    return json.data.kpis
  } catch {
    return { totalRules: 4, activeRules: 4, categoriesCovered: 4, averageMaxDiscount: 11.25 }
  }
}

export async function createCategoryDiscountRule(data: Omit<CategoryDiscountRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CategoryDiscountRule> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ ...data, type: 'category' }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create category rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateCategoryDiscountRule(id: string, data: Partial<CategoryDiscountRule>): Promise<CategoryDiscountRule> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update category rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteCategoryDiscountRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/discount-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Margin Rules ─────────────────────────────────────────

export async function fetchMarginRules(filters: MarginRuleFilters = {}): Promise<{ rules: MarginRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('filter[type]', filters.type)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/margin-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch margin rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      rules: [
        { id: 'mr1', name: 'Global Minimum Margin', description: 'Global margin protection across all products', type: 'global', scope: { isGlobal: true }, minimumMarginPercent: 15, targetMarginPercent: 25, criticalMarginPercent: 10, riskBehavior: 'require_approval', status: 'active', createdAt: '2024-01-15', updatedAt: '2026-08-01' },
        { id: 'mr2', name: 'Software Margin Guard', description: 'Minimum margin for all software products', type: 'category', scope: { categoryId: 'cat1', categoryName: 'Software' }, minimumMarginPercent: 20, targetMarginPercent: 30, criticalMarginPercent: 15, riskBehavior: 'block', status: 'active', createdAt: '2024-02-01', updatedAt: '2026-07-15' },
        { id: 'mr3', name: 'Services Margin Floor', description: 'Minimum margin for services category', type: 'category', scope: { categoryId: 'cat2', categoryName: 'Services' }, minimumMarginPercent: 30, targetMarginPercent: 40, criticalMarginPercent: 25, riskBehavior: 'require_approval', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-09-01' },
        { id: 'mr4', name: 'Enterprise Suite Floor', description: 'Product-specific margin rule for Enterprise Suite', type: 'product', scope: { productId: 'p1', productName: 'Enterprise Suite', productSku: 'ENT-001' }, minimumMarginPercent: 18, targetMarginPercent: 28, criticalMarginPercent: 12, riskBehavior: 'require_approval', status: 'active', createdAt: '2024-04-01', updatedAt: '2026-08-15' },
        { id: 'mr5', name: 'Platinum Tier Margin', description: 'Margin rule for platinum tier customers', type: 'customer_tier', scope: { customerTier: 'platinum' }, minimumMarginPercent: 12, targetMarginPercent: 20, criticalMarginPercent: 8, riskBehavior: 'flag', status: 'active', createdAt: '2024-05-01', updatedAt: '2026-09-05' },
      ],
      total: 5, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchMarginRuleKpis(): Promise<MarginRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/margin-rules?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch margin rule KPIs')
    return json.data.kpis
  } catch {
    return { totalRules: 5, activeRules: 5, globalRules: 1, productRules: 1, categoryRules: 2 }
  }
}

export async function fetchMarginRuleById(id: string): Promise<MarginRuleDetail> {
  try {
    const response = await fetch(`${API_BASE}/margin-rules/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch margin rule')
    return json.data
  } catch {
    return {
      id, name: 'Global Minimum Margin', description: 'Global margin protection across all products',
      type: 'global', scope: { isGlobal: true },
      minimumMarginPercent: 15, targetMarginPercent: 25, criticalMarginPercent: 10,
      riskBehavior: 'require_approval', status: 'active',
      createdAt: '2024-01-15', updatedAt: '2026-08-01',
      changeLog: [
        { id: 'cl1', actor: 'John Doe', action: 'created', field: 'status', oldValue: '', newValue: 'active', timestamp: '2024-01-15T00:00:00Z' },
        { id: 'cl2', actor: 'Jane Smith', action: 'updated', field: 'minimum_margin_percent', oldValue: '12', newValue: '15', reason: 'Raised minimum margin per Q3 policy', timestamp: '2026-08-01T10:00:00Z' },
      ],
    }
  }
}

export async function createMarginRule(data: Omit<MarginRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarginRule> {
  try {
    const response = await fetch(`${API_BASE}/margin-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create margin rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateMarginRule(id: string, data: Partial<MarginRule>): Promise<MarginRule> {
  try {
    const response = await fetch(`${API_BASE}/margin-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update margin rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteMarginRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/margin-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

export async function simulateMargin(data: MarginSimulationRequest): Promise<MarginSimulationResponse> {
  try {
    const response = await fetch(`${API_BASE}/margin-simulator`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to simulate margin')
    return json.data
  } catch {
    const sellingPrice = data.sellingPrice
    const costPrice = data.costPrice ?? sellingPrice * 0.65
    const grossProfit = sellingPrice - costPrice
    const grossMarginPercent = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0
    return {
      sellingPrice, costPrice, grossProfit, grossMarginPercent,
      minimumMarginPercent: 15, marginStatus: grossMarginPercent >= 25 ? 'healthy' : grossMarginPercent >= 15 ? 'warning' : 'critical',
      riskBehavior: 'require_approval', approvalRequired: grossMarginPercent < 20,
      violatedRuleIds: grossMarginPercent < 20 ? ['mr1'] : [],
    }
  }
}

// ─── Approval Rules ───────────────────────────────────────

export async function fetchApprovalRules(filters: ApprovalRuleFilters = {}): Promise<{ rules: ApprovalRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.triggerType) params.set('filter[trigger_type]', filters.triggerType)
    if (filters.approvalLevel) params.set('filter[approval_level]', filters.approvalLevel)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/approval-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      rules: [
        { id: 'ar1', name: 'High Discount Approval', description: 'Require finance approval for discounts above 15%', priority: 10, triggerType: 'discount_threshold', triggerConfig: { discountThreshold: 15 }, approvalLevel: 'finance', chainId: 'ac1', chainName: 'Finance Approval', sla: { approvalTimeMinutes: 1440, escalationTimeMinutes: 2880 }, status: 'active', createdAt: '2024-01-15', updatedAt: '2026-08-01' },
        { id: 'ar2', name: 'Large Deal Approval', description: 'Sales manager approval for deals above ₹100K', priority: 20, triggerType: 'deal_value', triggerConfig: { dealValueMin: 100000 }, approvalLevel: 'sales_manager', chainId: 'ac2', chainName: 'Manager Approval', sla: { approvalTimeMinutes: 480, escalationTimeMinutes: 1440 }, status: 'active', createdAt: '2024-02-01', updatedAt: '2026-07-15' },
        { id: 'ar3', name: 'Critical Margin Approval', description: 'Multi-level approval when margin is critically low', priority: 5, triggerType: 'margin', triggerConfig: { marginMax: 15 }, approvalLevel: 'multi_level', chainId: 'ac3', chainName: 'Critical Margin Chain', sla: { approvalTimeMinutes: 720, escalationTimeMinutes: 1440 }, status: 'active', createdAt: '2024-03-01', updatedAt: '2026-09-01' },
        { id: 'ar4', name: 'Platinum Tier Approval', description: 'Special approval chain for platinum tier high-value deals', priority: 15, triggerType: 'compound', triggerConfig: { customerTier: 'platinum', dealValueMin: 50000, discountThreshold: 10 }, approvalLevel: 'multi_level', chainId: 'ac3', chainName: 'Critical Margin Chain', sla: { approvalTimeMinutes: 480, escalationTimeMinutes: 960 }, status: 'active', createdAt: '2024-04-01', updatedAt: '2026-09-05' },
        { id: 'ar5', name: 'High Risk Deal Flag', description: 'Flag high-risk deals for review', priority: 25, triggerType: 'risk_score', triggerConfig: { riskScoreMin: 70 }, approvalLevel: 'sales_manager', sla: { approvalTimeMinutes: 240, escalationTimeMinutes: 480 }, status: 'inactive', createdAt: '2024-05-01', updatedAt: '2026-06-01' },
      ],
      total: 5, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchApprovalRuleKpis(): Promise<ApprovalRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/approval-rules?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval rule KPIs')
    return json.data.kpis
  } catch {
    return { totalRules: 5, activeRules: 4, highRiskRules: 2 }
  }
}

export async function fetchApprovalRuleById(id: string): Promise<ApprovalRuleDetail> {
  try {
    const response = await fetch(`${API_BASE}/approval-rules/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval rule')
    return json.data
  } catch {
    return {
      id, name: 'High Discount Approval', description: 'Require finance approval for discounts above 15%',
      priority: 10, triggerType: 'discount_threshold', triggerConfig: { discountThreshold: 15 },
      approvalLevel: 'finance', chainId: 'ac1', chainName: 'Finance Approval',
      sla: { approvalTimeMinutes: 1440, escalationTimeMinutes: 2880 },
      status: 'active', createdAt: '2024-01-15', updatedAt: '2026-08-01',
      changeLog: [
        { id: 'cl1', actor: 'John Doe', action: 'created', field: 'status', oldValue: '', newValue: 'active', timestamp: '2024-01-15T00:00:00Z' },
      ],
    }
  }
}

export async function createApprovalRule(data: Omit<ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApprovalRule> {
  try {
    const response = await fetch(`${API_BASE}/approval-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create approval rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateApprovalRule(id: string, data: Partial<ApprovalRule>): Promise<ApprovalRule> {
  try {
    const response = await fetch(`${API_BASE}/approval-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update approval rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteApprovalRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/approval-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Approval Chains ──────────────────────────────────────

export async function fetchApprovalChains(filters: ApprovalChainFilters = {}): Promise<{ chains: ApprovalChain[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/approval-chains${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval chains')
    return {
      chains: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      chains: [
        { id: 'ac1', name: 'Finance Approval', description: 'Single-step finance approval', triggerDescription: 'Discount > 15%', steps: [
          { id: 'acs1', order: 1, approverType: 'role', approverId: 'r4', approverName: 'Sarah Lee', approverRole: 'Finance', slaMinutes: 1440, escalationToId: 'u1', escalationToName: 'John Doe' },
        ], logic: 'sequential', status: 'active', createdAt: '2024-01-15', updatedAt: '2026-08-01' },
        { id: 'ac2', name: 'Manager Approval', description: 'Sales manager approval for medium deals', triggerDescription: 'Deal value > ₹100K', steps: [
          { id: 'acs2', order: 1, approverType: 'role', approverId: 'r2', approverName: 'Jane Smith', approverRole: 'Sales Manager', slaMinutes: 480, escalationToId: 'u1', escalationToName: 'John Doe' },
        ], logic: 'sequential', status: 'active', createdAt: '2024-02-01', updatedAt: '2026-07-15' },
        { id: 'ac3', name: 'Critical Margin Chain', description: 'Multi-level approval for critical margin situations', triggerDescription: 'Margin < 15% or compound triggers', steps: [
          { id: 'acs3', order: 1, approverType: 'role', approverId: 'r2', approverName: 'Jane Smith', approverRole: 'Sales Manager', slaMinutes: 240, escalationToId: 'u1', escalationToName: 'John Doe' },
          { id: 'acs4', order: 2, approverType: 'role', approverId: 'r4', approverName: 'Sarah Lee', approverRole: 'Finance', slaMinutes: 480, escalationToId: 'u1', escalationToName: 'John Doe' },
        ], logic: 'sequential', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-09-01' },
      ],
      total: 3, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchApprovalChainKpis(): Promise<ApprovalChainKpis> {
  try {
    const response = await fetch(`${API_BASE}/approval-chains?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval chain KPIs')
    return json.data.kpis
  } catch {
    return { totalChains: 3, activeChains: 3, totalSteps: 4 }
  }
}

export async function fetchApprovalChainById(id: string): Promise<ApprovalChainDetail> {
  try {
    const response = await fetch(`${API_BASE}/approval-chains/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval chain')
    return json.data
  } catch {
    return {
      id: 'ac3', name: 'Critical Margin Chain', description: 'Multi-level approval for critical margin situations',
      triggerDescription: 'Margin < 15% or compound triggers',
      steps: [
        { id: 'acs3', order: 1, approverType: 'role', approverId: 'r2', approverName: 'Jane Smith', approverRole: 'Sales Manager', slaMinutes: 240, escalationToId: 'u1', escalationToName: 'John Doe' },
        { id: 'acs4', order: 2, approverType: 'role', approverId: 'r4', approverName: 'Sarah Lee', approverRole: 'Finance', slaMinutes: 480, escalationToId: 'u1', escalationToName: 'John Doe' },
      ],
      logic: 'sequential', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-09-01',
      rulesUsing: [{ id: 'ar3', name: 'Critical Margin Approval' }, { id: 'ar4', name: 'Platinum Tier Approval' }],
    }
  }
}

export async function createApprovalChain(data: Omit<ApprovalChain, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApprovalChain> {
  try {
    const response = await fetch(`${API_BASE}/approval-chains`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create approval chain')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateApprovalChain(id: string, data: Partial<ApprovalChain>): Promise<ApprovalChain> {
  try {
    const response = await fetch(`${API_BASE}/approval-chains/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update approval chain')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteApprovalChain(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/approval-chains/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// ─── Approval Thresholds ──────────────────────────────────

export async function fetchApprovalThresholds(): Promise<ApprovalThresholds> {
  try {
    const response = await fetch(`${API_BASE}/approval-thresholds`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch approval thresholds')
    return json.data
  } catch {
    return {
      id: 'at-1',
      dealValue: [
        { id: 'dv1', label: 'Low Value', min: 0, max: 25000 },
        { id: 'dv2', label: 'Medium Value', min: 25001, max: 100000 },
        { id: 'dv3', label: 'High Value', min: 100001, max: null },
      ],
      discount: [
        { id: 'dc1', label: 'Safe', min: 0, max: 10, unit: '%' },
        { id: 'dc2', label: 'Review', min: 10.01, max: 20, unit: '%' },
        { id: 'dc3', label: 'Escalation', min: 20.01, max: null, unit: '%' },
      ],
      risk: [
        { id: 'rk1', label: 'Low Risk', min: 0, max: 30 },
        { id: 'rk2', label: 'Medium Risk', min: 31, max: 60 },
        { id: 'rk3', label: 'High Risk', min: 61, max: 80 },
        { id: 'rk4', label: 'Critical Risk', min: 81, max: 100 },
      ],
      margin: [
        { id: 'mg1', label: 'Healthy', min: 25, max: null, unit: '%' },
        { id: 'mg2', label: 'Warning', min: 15, max: 24.99, unit: '%' },
        { id: 'mg3', label: 'Critical', min: 0, max: 14.99, unit: '%' },
      ],
      mappings: [
        { id: 'tm1', thresholdCategory: 'deal_value', thresholdLabel: 'Low Value', approverRole: 'sales_manager', chainId: 'ac2', chainName: 'Manager Approval' },
        { id: 'tm2', thresholdCategory: 'deal_value', thresholdLabel: 'High Value', approverRole: 'finance', chainId: 'ac1', chainName: 'Finance Approval' },
        { id: 'tm3', thresholdCategory: 'discount', thresholdLabel: 'Review', approverRole: 'sales_manager', chainId: 'ac2', chainName: 'Manager Approval' },
        { id: 'tm4', thresholdCategory: 'discount', thresholdLabel: 'Escalation', approverRole: 'finance', chainId: 'ac1', chainName: 'Finance Approval' },
        { id: 'tm5', thresholdCategory: 'risk', thresholdLabel: 'High Risk', approverRole: 'sales_manager', chainId: 'ac2', chainName: 'Manager Approval' },
        { id: 'tm6', thresholdCategory: 'risk', thresholdLabel: 'Critical Risk', approverRole: 'multi_level', chainId: 'ac3', chainName: 'Critical Margin Chain' },
        { id: 'tm7', thresholdCategory: 'margin', thresholdLabel: 'Warning', approverRole: 'sales_manager', chainId: 'ac2', chainName: 'Manager Approval' },
        { id: 'tm8', thresholdCategory: 'margin', thresholdLabel: 'Critical', approverRole: 'multi_level', chainId: 'ac3', chainName: 'Critical Margin Chain' },
      ],
      updatedAt: '2026-09-01',
    }
  }
}

export async function updateApprovalThresholds(data: Partial<ApprovalThresholds>): Promise<ApprovalThresholds> {
  try {
    const response = await fetch(`${API_BASE}/approval-thresholds`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update approval thresholds')
    return json.data
  } catch (err) {
    throw err
  }
}

// ─── Approval Simulator ───────────────────────────────────

export async function simulateApproval(data: ApprovalSimulatorRequest): Promise<ApprovalSimulatorResponse> {
  try {
    const response = await fetch(`${API_BASE}/approval-simulator`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to simulate approval')
    return json.data
  } catch {
    const hasHighDiscount = data.discountPercent > 15
    const hasLowMargin = (data.marginPercent ?? 25) < 15
    const hasHighValue = data.dealValue > 100000
    const approvalRequired = hasHighDiscount || hasLowMargin || hasHighValue
    return {
      approvalRequired,
      approvalLevel: approvalRequired ? (hasLowMargin ? 'multi_level' : hasHighDiscount ? 'finance' : 'sales_manager') : null,
      approvalChain: approvalRequired ? (hasLowMargin ? [
        { step: 1, approverName: 'Jane Smith', role: 'Sales Manager', slaMinutes: 240 },
        { step: 2, approverName: 'Sarah Lee', role: 'Finance', slaMinutes: 480 },
      ] : hasHighDiscount ? [
        { step: 1, approverName: 'Sarah Lee', role: 'Finance', slaMinutes: 1440 },
      ] : [
        { step: 1, approverName: 'Jane Smith', role: 'Sales Manager', slaMinutes: 480 },
      ]) : [],
      triggeredRules: [
        ...(hasHighDiscount ? [{ id: 'ar1', name: 'High Discount Approval', reason: `Discount ${data.discountPercent}% exceeds 15% threshold` }] : []),
        ...(hasLowMargin ? [{ id: 'ar3', name: 'Critical Margin Approval', reason: `Margin ${data.marginPercent ?? 25}% below 15% threshold` }] : []),
        ...(hasHighValue ? [{ id: 'ar2', name: 'Large Deal Approval', reason: `Deal value ₹${data.dealValue.toLocaleString()} exceeds ₹100,000` }] : []),
      ],
      escalation: approvalRequired ? { slaMinutes: hasLowMargin ? 1440 : 480, escalationPath: 'Auto-escalate to Business Admin' } : null,
      decision: approvalRequired ? 'approval_required' : 'auto_approve',
      decisionReason: approvalRequired
        ? `Approval required: ${hasLowMargin ? 'margin below critical threshold' : hasHighDiscount ? 'discount exceeds ceiling' : 'high deal value'}.`
        : 'All thresholds within acceptable range.',
      recommendedAction: approvalRequired
        ? (hasLowMargin ? 'Reduce discount to improve margin, or submit for multi-level approval.' : 'Submit for approval before proceeding.')
        : 'Deal can proceed without additional approval.',
    }
  }
}

// ─── Warehouses ───────────────────────────────────────────

export async function fetchWarehouses(filters: WarehouseFilters = {}): Promise<{ warehouses: Warehouse[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.type) params.set('filter[type]', filters.type)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/warehouses${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch warehouses')
    return {
      warehouses: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      warehouses: [
        { id: 'wh1', name: 'Main Distribution Center', code: 'MDC-001', type: 'distribution', address: { line1: '100 Industrial Park', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' }, managerName: 'Tom Wilson', managerEmail: 'tom@acme.com', storageCapacity: 50000, currentCapacity: 32000, capacityThreshold: 45000, totalProducts: 45, totalInventory: 8500, lowStockItems: 3, pendingShipments: 12, isDefault: true, allocationPriority: 1, shippingCost: 50, shipmentPriority: 'high', status: 'active', createdAt: '2024-01-15', updatedAt: '2026-09-05' },
        { id: 'wh2', name: 'West Coast Fulfillment', code: 'WCF-002', type: 'fulfillment', address: { line1: '200 Logistics Drive', city: 'Pune', state: 'Maharashtra', country: 'India', postalCode: '411001' }, managerName: 'Lisa Park', managerEmail: 'lisa@acme.com', storageCapacity: 35000, currentCapacity: 28000, capacityThreshold: 30000, totalProducts: 32, totalInventory: 5200, lowStockItems: 5, pendingShipments: 8, isDefault: false, allocationPriority: 2, shippingCost: 75, shipmentPriority: 'normal', status: 'active', createdAt: '2024-03-01', updatedAt: '2026-08-15' },
        { id: 'wh3', name: 'Returns Processing Center', code: 'RPC-003', type: 'returns', address: { line1: '50 Service Lane', city: 'Bangalore', state: 'Karnataka', country: 'India', postalCode: '560102' }, managerName: 'Mike Chen', managerEmail: 'mike@acme.com', storageCapacity: 15000, currentCapacity: 4200, capacityThreshold: 12000, totalProducts: 18, totalInventory: 780, lowStockItems: 0, pendingShipments: 2, isDefault: false, allocationPriority: 3, shippingCost: 100, shipmentPriority: 'low', status: 'active', createdAt: '2024-06-01', updatedAt: '2026-07-01' },
      ],
      total: 3, page: 1, perPage: 25, totalPages: 1,
    }
  }
}

export async function fetchWarehouseKpis(): Promise<WarehouseKpis> {
  try {
    const response = await fetch(`${API_BASE}/warehouses?per_page=1`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch warehouse KPIs')
    return json.data.kpis
  } catch {
    return { totalWarehouses: 3, activeWarehouses: 3, totalInventory: 14480, lowStockItems: 8 }
  }
}

export async function fetchWarehouseById(id: string): Promise<WarehouseDetail> {
  try {
    const response = await fetch(`${API_BASE}/warehouses/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch warehouse')
    return json.data
  } catch {
    return {
      id, name: 'Main Distribution Center', code: 'MDC-001', type: 'distribution',
      address: { line1: '100 Industrial Park', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400001' },
      managerName: 'Tom Wilson', managerEmail: 'tom@acme.com', managerPhone: '+91 98765 43210',
      storageCapacity: 50000, currentCapacity: 32000, capacityThreshold: 45000,
      totalProducts: 45, totalInventory: 8500, lowStockItems: 3, pendingShipments: 12,
      isDefault: true, allocationPriority: 1, shippingCost: 50, shipmentPriority: 'high',
      status: 'active', createdAt: '2024-01-15', updatedAt: '2026-09-05',
      inventory: [
        { id: 'wi1', productId: 'p1', productName: 'Enterprise Suite', productSku: 'ENT-001', available: 120, reserved: 15, reorderLevel: 20, stockStatus: 'in_stock', lastUpdated: '2026-09-05' },
        { id: 'wi2', productId: 'p2', productName: 'Professional Suite', productSku: 'PRO-001', available: 85, reserved: 10, reorderLevel: 15, stockStatus: 'in_stock', lastUpdated: '2026-09-05' },
        { id: 'wi3', productId: 'p3', productName: 'Starter Pack', productSku: 'STR-001', available: 8, reserved: 5, reorderLevel: 20, stockStatus: 'low_stock', lastUpdated: '2026-09-05' },
        { id: 'wi4', productId: 'p4', productName: 'Premium Support', productSku: 'SUP-001', available: 50, reserved: 8, reorderLevel: 10, stockStatus: 'in_stock', lastUpdated: '2026-09-05' },
        { id: 'wi5', productId: 'p5', productName: 'Onboarding Package', productSku: 'OBP-001', available: 0, reserved: 3, reorderLevel: 5, stockStatus: 'out_of_stock', lastUpdated: '2026-09-05' },
      ],
      stockMovements: [
        { id: 'sm1', productId: 'p1', productName: 'Enterprise Suite', type: 'incoming', quantity: 50, reference: 'PO-2026-001', reason: 'Quarterly restock', actor: 'Tom Wilson', timestamp: '2026-09-01T10:00:00Z' },
        { id: 'sm2', productId: 'p2', productName: 'Professional Suite', type: 'outgoing', quantity: 25, reference: 'SO-2026-089', actor: 'Lisa Park', timestamp: '2026-09-03T14:30:00Z' },
        { id: 'sm3', productId: 'p3', productName: 'Starter Pack', type: 'outgoing', quantity: 40, reference: 'SO-2026-091', actor: 'Mike Chen', timestamp: '2026-09-04T09:15:00Z' },
        { id: 'sm4', productId: 'p4', productName: 'Premium Support', type: 'transfer', quantity: 10, reference: 'TR-2026-003', reason: 'Transfer to WCF-002', actor: 'Tom Wilson', timestamp: '2026-09-05T08:00:00Z' },
      ],
      shipments: [
        { id: 'sh1', orderNumber: 'INV-2026-089', customerName: 'Acme Corp', itemCount: 5, status: 'shipped', trackingNumber: 'TRK-001234', estimatedDelivery: '2026-09-10', createdAt: '2026-09-03', updatedAt: '2026-09-04' },
        { id: 'sh2', orderNumber: 'INV-2026-091', customerName: 'TechStart Inc', itemCount: 3, status: 'processing', estimatedDelivery: '2026-09-12', createdAt: '2026-09-04', updatedAt: '2026-09-05' },
        { id: 'sh3', orderNumber: 'INV-2026-092', customerName: 'GlobalNet Solutions', itemCount: 8, status: 'pending', createdAt: '2026-09-05', updatedAt: '2026-09-05' },
      ],
    }
  }
}

export async function createWarehouse(data: WarehouseCreateInput): Promise<Warehouse> {
  try {
    const response = await fetch(`${API_BASE}/warehouses`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create warehouse')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
  try {
    const response = await fetch(`${API_BASE}/warehouses/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update warehouse')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteWarehouse(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/warehouses/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

export async function fetchShippingRules(filters: ShippingRuleFilters = {}): Promise<{ rules: ShippingRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.priority) params.set('filter[priority]', filters.priority)
    if (filters.destinationCountry) params.set('filter[destination_country]', filters.destinationCountry)
    if (filters.warehouseId) params.set('filter[warehouse_id]', filters.warehouseId)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/shipping-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch shipping rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return {
      rules: [],
      total: 0, page: 1, perPage: 25, totalPages: 0,
    }
  }
}

export async function fetchShippingRuleKpis(): Promise<ShippingRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/shipping-rules/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch shipping rule KPIs')
    return json.data
  } catch {
    return { totalRules: 0, activeRules: 0 }
  }
}

export async function createShippingRule(data: Omit<ShippingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingRule> {
  try {
    const response = await fetch(`${API_BASE}/shipping-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create shipping rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateShippingRule(id: string, data: Partial<Pick<ShippingRule, 'name' | 'description' | 'status' | 'priority' | 'allocationStrategy' | 'shippingMethod' | 'isDefault'>>): Promise<ShippingRule> {
  try {
    const response = await fetch(`${API_BASE}/shipping-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update shipping rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteShippingRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/shipping-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

export async function fetchSubscriptionPlans(filters: SubscriptionPlanFilters = {}): Promise<{ plans: SubscriptionPlan[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.planType) params.set('filter[plan_type]', filters.planType)
    if (filters.status) params.set('filter[status]', filters.status)
    if (filters.priceRange) {
      params.set('filter[price_min]', String(filters.priceRange[0]))
      params.set('filter[price_max]', String(filters.priceRange[1]))
    }
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/subscription-plans${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch subscription plans')
    return {
      plans: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return { plans: [], total: 0, page: 1, perPage: 25, totalPages: 0 }
  }
}

export async function fetchSubscriptionPlanKpis(): Promise<SubscriptionPlanKpis> {
  try {
    const response = await fetch(`${API_BASE}/subscription-plans/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch subscription plan KPIs')
    return json.data
  } catch {
    return { totalPlans: 0, activePlans: 0, totalSubscribers: 0 }
  }
}

export async function createSubscriptionPlan(data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
  try {
    const response = await fetch(`${API_BASE}/subscription-plans`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create subscription plan')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateSubscriptionPlan(id: string, data: Partial<Pick<SubscriptionPlan, 'name' | 'description' | 'price' | 'billingCycle' | 'billingFrequency' | 'status' | 'features' | 'usageLimits'>>): Promise<SubscriptionPlan> {
  try {
    const response = await fetch(`${API_BASE}/subscription-plans/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update subscription plan')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/subscription-plans/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

async function fetchProrationRulesPage(filters: { search?: string; page?: number; perPage?: number } = {}): Promise<{ rules: ProrationRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/proration-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch proration rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return { rules: [], total: 0, page: 1, perPage: 25, totalPages: 0 }
  }
}

export async function fetchProrationRuleKpis(): Promise<ProrationRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch proration rule KPIs')
    return json.data
  } catch {
    return { totalRules: 0, activeRules: 0 }
  }
}

export async function createProrationRule(data: Omit<ProrationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProrationRule> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create proration rule')
    return json.data
  } catch (err) {
    throw err
  }
}

// NOTE: fetchProrationRulesPage (paginated) and fetchProrationRules (legacy list) hit the
// same endpoint. Field names below are aligned with the ProrationRule type
// (upgradeRule/downgradeRule) — not upgradeProration/downgradeProration.
export async function updateProrationRule(id: string, data: Partial<Pick<ProrationRule, 'name' | 'description' | 'upgradeRule' | 'downgradeRule' | 'midCycleChange' | 'remainingPeriod' | 'billingAdjustment' | 'status'>>): Promise<ProrationRule> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update proration rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteProrationRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

async function fetchCancellationRulesPage(filters: { search?: string; page?: number; perPage?: number } = {}): Promise<{ rules: CancellationRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/cancellation-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch cancellation rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return { rules: [], total: 0, page: 1, perPage: 25, totalPages: 0 }
  }
}

export async function fetchCancellationRuleKpis(): Promise<CancellationRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch cancellation rule KPIs')
    return json.data
  } catch {
    return { totalRules: 0, immediateCancellations: 0, endOfPeriodCancellations: 0 }
  }
}

export async function createCancellationRule(data: Omit<CancellationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<CancellationRule> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create cancellation rule')
    return json.data
  } catch (err) {
    throw err
  }
}

// NOTE: fetchCancellationRulesPage (paginated) and fetchCancellationRules (legacy list) hit
// the same endpoint. Field names below are aligned with the CancellationRule type
// (cancellationPolicy/refundPolicy/noticePeriod/eligibility).
export async function updateCancellationRule(id: string, data: Partial<Pick<CancellationRule, 'name' | 'description' | 'cancellationPolicy' | 'refundPolicy' | 'effectiveDate' | 'noticePeriod' | 'eligibility' | 'status'>>): Promise<CancellationRule> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update cancellation rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteCancellationRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

export async function fetchRefundRules(filters: { search?: string; page?: number; perPage?: number } = {}): Promise<{ rules: RefundRule[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.perPage) params.set('per_page', String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/refund-rules${qs ? `?${qs}` : ''}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch refund rules')
    return {
      rules: json.data,
      total: json.meta?.total || 0,
      page: json.meta?.page || 1,
      perPage: json.meta?.per_page || 25,
      totalPages: json.meta?.total_pages || 1,
    }
  } catch {
    return { rules: [], total: 0, page: 1, perPage: 25, totalPages: 0 }
  }
}

export async function fetchRefundRuleKpis(): Promise<RefundRuleKpis> {
  try {
    const response = await fetch(`${API_BASE}/refund-rules/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to fetch refund rule KPIs')
    return json.data
  } catch {
    return { totalRules: 0, eligibleRefunds: 0, partialRefunds: 0, noRefunds: 0 }
  }
}

export async function createRefundRule(data: Omit<RefundRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefundRule> {
  try {
    const response = await fetch(`${API_BASE}/refund-rules`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to create refund rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateRefundRule(id: string, data: Partial<Pick<RefundRule, 'name' | 'description' | 'refundEligible' | 'fullRefund' | 'partialRefund' | 'noRefund' | 'calculationMethod' | 'calculationPercentage' | 'calculationAmount'>>): Promise<RefundRule> {
  try {
    const response = await fetch(`${API_BASE}/refund-rules/${id}`, {
      method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || 'Failed to update refund rule')
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteRefundRule(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/refund-rules/${id}`, {
      method: 'DELETE', headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// --- Billing Cycles --------------------------------------

export async function fetchBillingCycles(filters?: BillingCycleFilters): Promise<{ cycles: BillingCycle[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set("search", filters.search)
    if (filters?.status) params.set("status", filters.status)
    if (filters?.duration) params.set("duration", filters.duration)
    if (filters?.page) params.set("page", String(filters.page))
    if (filters?.perPage) params.set("per_page", String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/billing-cycles${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch billing cycles")
    return { cycles: json.data, total: json.meta?.total || 0, page: json.meta?.page || 1, perPage: json.meta?.per_page || 25, totalPages: json.meta?.total_pages || 1 }
  } catch {
    return { cycles: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchSubscriptionPlanById(id: string): Promise<SubscriptionPlan> {
  const response = await fetch(`${API_BASE}/subscription-plans/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const json = await response.json()
  if (!json.success) throw new Error(json.error?.message || 'Failed to fetch subscription plan')
  return json.data
}

export async function fetchBillingCycleKpis(): Promise<BillingCycleKpis> {
  try {
    const response = await fetch(`${API_BASE}/billing-cycles/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch billing cycle KPIs")
    return json.data
  } catch {
    return { totalCycles: 0, activeCycles: 0, monthlySubscribers: 0, annualSubscribers: 0 }
  }
}

export async function fetchBillingCycleById(id: string): Promise<BillingCycle | null> {
  try {
    const response = await fetch(`${API_BASE}/billing-cycles/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch billing cycle")
    return json.data
  } catch {
    return null
  }
}

export async function createBillingCycle(data: BillingCycleCreateInput): Promise<BillingCycle> {
  try {
    const response = await fetch(`${API_BASE}/billing-cycles`, {
      method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to create billing cycle")
    return json.data
  } catch (err) {
    throw err
  }
}

export async function updateBillingCycle(id: string, data: Partial<BillingCycleCreateInput>): Promise<BillingCycle> {
  try {
    const response = await fetch(`${API_BASE}/billing-cycles/${id}`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to update billing cycle")
    return json.data
  } catch (err) {
    throw err
  }
}

export async function deleteBillingCycle(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/billing-cycles/${id}`, {
      method: "DELETE", headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  } catch (err) {
    throw err
  }
}

// --- Proration & Cancellation Rules ----------------------

export async function fetchProrationRules(): Promise<ProrationRule[]> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch proration rules")
    return Array.isArray(json.data) ? json.data : json.data?.rules ?? []
  } catch {
    return []
  }
}

export async function updateProrationRules(id: string, data: Partial<ProrationRule>): Promise<ProrationRule> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules/${id}`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to update proration rules")
    return json.data
  } catch (err) {
    throw err
  }
}

export async function calculateProration(data: ProrationCalculationInput): Promise<ProrationCalculationResult> {
  try {
    const response = await fetch(`${API_BASE}/proration-rules/calculate`, {
      method: "POST", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to calculate proration")
    return json.data
  } catch {
    return { currentPlanValue: 0, newPlanValue: 0, remainingDays: 0, usedDays: 0, credit: 0, charge: 0, finalAdjustment: 0, explanation: "Backend calculation not available" }
  }
}

export async function fetchCancellationRules(): Promise<CancellationRule[]> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch cancellation rules")
    return Array.isArray(json.data) ? json.data : json.data?.rules ?? []
  } catch {
    return []
  }
}

export async function updateCancellationRules(id: string, data: Partial<CancellationRule>): Promise<CancellationRule> {
  try {
    const response = await fetch(`${API_BASE}/cancellation-rules/${id}`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to update cancellation rules")
    return json.data
  } catch (err) {
    throw err
  }
}

// --- Reports ---------------------------------------------

export async function fetchReportKpis(filters?: ReportFilters): Promise<ReportKpis> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    if (filters?.dateRange) params.set("date_range", filters.dateRange)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/kpis${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch report KPIs")
    return json.data
  } catch {
    return { totalRevenue: 0, oneTimeRevenue: 0, recurringRevenue: 0, revenueGrowth: 0, totalDeals: 0, wonDeals: 0, lostDeals: 0, conversionRate: 0, averageDealValue: 0, averageApprovalTime: 0, fulfillmentRate: 0, backorderRate: 0, averageMargin: 0, discountUsage: 0, discountExceptions: 0 }
  }
}

export async function fetchSalesReport(filters?: ReportFilters): Promise<SalesReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/sales${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch sales report")
    return json.data
  } catch {
    return []
  }
}

export async function fetchRevenueReport(filters?: ReportFilters): Promise<RevenueReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/revenue${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch revenue report")
    return json.data
  } catch {
    return []
  }
}

export async function fetchDiscountReport(filters?: ReportFilters): Promise<DiscountReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/discount${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch discount report")
    return json.data
  } catch {
    return []
  }
}

export async function fetchMarginReport(filters?: ReportFilters): Promise<MarginReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/margin${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch margin report")
    return json.data
  } catch {
    return []
  }
}

export async function fetchApprovalReport(filters?: ReportFilters): Promise<ApprovalReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/approval${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch approval report")
    return json.data
  } catch {
    return []
  }
}

export async function fetchFulfillmentReport(filters?: ReportFilters): Promise<FulfillmentReportData[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/reports/fulfillment${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch fulfillment report")
    return json.data
  } catch {
    return []
  }
}

// --- Deal Health -----------------------------------------

export async function fetchDealHealthKpis(): Promise<DealHealthKpis> {
  try {
    const response = await fetch(`${API_BASE}/deal-health/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch deal health KPIs")
    return json.data
  } catch {
    return { healthyDeals: 0, atRiskDeals: 0, criticalDeals: 0, stalledDeals: 0, averageHealthScore: 0, averageRiskScore: 0 }
  }
}

export async function fetchDealHealthItems(filters?: DealHealthFilters): Promise<{ items: DealHealthItem[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set("search", filters.search)
    if (filters?.healthStatus) params.set("health_status", filters.healthStatus)
    if (filters?.riskLevel) params.set("risk_level", filters.riskLevel)
    if (filters?.salesRepId) params.set("sales_rep_id", filters.salesRepId)
    if (filters?.customerId) params.set("customer_id", filters.customerId)
    if (filters?.page) params.set("page", String(filters.page))
    if (filters?.perPage) params.set("per_page", String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/deal-health${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch deal health items")
    return { items: json.data, total: json.meta?.total || 0, page: json.meta?.page || 1, perPage: json.meta?.per_page || 25, totalPages: json.meta?.total_pages || 1 }
  } catch {
    return { items: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchDealHealthItem(id: string): Promise<DealHealthItem | null> {
  try {
    const response = await fetch(`${API_BASE}/deal-health/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch deal health item")
    return json.data
  } catch {
    return null
  }
}

export async function fetchDealAnomalies(id: string): Promise<DealAnomaly[]> {
  try {
    const response = await fetch(`${API_BASE}/deal-health/${id}/anomalies`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch deal anomalies")
    return json.data
  } catch {
    return []
  }
}

// --- Audit Trail -----------------------------------------

export async function fetchAuditKpis(): Promise<AuditKpis> {
  try {
    const response = await fetch(`${API_BASE}/audit/kpis`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch audit KPIs")
    return json.data
  } catch {
    return { totalEvents: 0, configurationChanges: 0, approvalActions: 0, userActions: 0, securityEvents: 0 }
  }
}

export async function fetchAuditEvents(filters?: AuditFilters): Promise<{ events: AuditEvent[]; total: number; page: number; perPage: number; totalPages: number }> {
  try {
    const params = new URLSearchParams()
    if (filters?.search) params.set("search", filters.search)
    if (filters?.userId) params.set("user_id", filters.userId)
    if (filters?.action) params.set("action", filters.action)
    if (filters?.resource) params.set("resource", filters.resource)
    if (filters?.module) params.set("module", filters.module)
    if (filters?.severity) params.set("severity", filters.severity)
    if (filters?.status) params.set("status", filters.status)
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom)
    if (filters?.dateTo) params.set("date_to", filters.dateTo)
    if (filters?.page) params.set("page", String(filters.page))
    if (filters?.perPage) params.set("per_page", String(filters.perPage))
    const qs = params.toString()
    const response = await fetch(`${API_BASE}/audit${qs ? `?${qs}` : ""}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch audit events")
    return { events: json.data, total: json.meta?.total || 0, page: json.meta?.page || 1, perPage: json.meta?.per_page || 25, totalPages: json.meta?.total_pages || 1 }
  } catch {
    return { events: [], total: 0, page: 1, perPage: 25, totalPages: 1 }
  }
}

export async function fetchAuditEvent(id: string): Promise<AuditEvent | null> {
  try {
    const response = await fetch(`${API_BASE}/audit/${id}`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch audit event")
    return json.data
  } catch {
    return null
  }
}

// --- Notification Settings -------------------------------

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true, inAppNotifications: true, slackAlerts: false, digestFrequency: 'daily',
}

export async function fetchNotificationSettings(): Promise<NotificationSettings | null> {
  try {
    const response = await fetch(`${API_BASE}/settings/notifications`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch notification settings")
    setLocalItem('dealflow360_notification_settings', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_notification_settings', DEFAULT_NOTIFICATION_SETTINGS)
  }
}

export async function updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
  try {
    const response = await fetch(`${API_BASE}/settings/notifications`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_notification_settings', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_notification_settings', DEFAULT_NOTIFICATION_SETTINGS)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_notification_settings', updated)
  return updated
}

// --- Security Settings -----------------------------------

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorRequired: false, sessionTimeoutMinutes: 60, passwordRotationDays: 90, ipWhitelistEnabled: false,
}

export async function fetchSecuritySettings(): Promise<SecuritySettings | null> {
  try {
    const response = await fetch(`${API_BASE}/settings/security`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch security settings")
    setLocalItem('dealflow360_security_settings', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_security_settings', DEFAULT_SECURITY_SETTINGS)
  }
}

export async function updateSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
  try {
    const response = await fetch(`${API_BASE}/settings/security`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_security_settings', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_security_settings', DEFAULT_SECURITY_SETTINGS)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_security_settings', updated)
  return updated
}

// --- Integration Settings --------------------------------

const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
  crmSyncEnabled: true, accountingSyncEnabled: true, webhookUrl: '', apiRateLimit: 1000,
}

export async function fetchIntegrationSettings(): Promise<IntegrationSettings | null> {
  try {
    const response = await fetch(`${API_BASE}/settings/integrations`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch integration settings")
    setLocalItem('dealflow360_integration_settings', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_integration_settings', DEFAULT_INTEGRATION_SETTINGS)
  }
}

export async function updateIntegrationSettings(data: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
  try {
    const response = await fetch(`${API_BASE}/settings/integrations`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_integration_settings', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_integration_settings', DEFAULT_INTEGRATION_SETTINGS)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_integration_settings', updated)
  return updated
}

// --- Data Privacy Settings -------------------------------

const DEFAULT_DATA_PRIVACY_SETTINGS: DataPrivacySettings = {
  gdprCompliance: true, auditLogRetentionMonths: 24, anonymizeDeletedUsers: true,
}

export async function fetchDataPrivacySettings(): Promise<DataPrivacySettings | null> {
  try {
    const response = await fetch(`${API_BASE}/settings/data-privacy`, { headers: getAuthHeaders() })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    if (!json.success) throw new Error(json.error?.message || "Failed to fetch data privacy settings")
    setLocalItem('dealflow360_data_privacy_settings', json.data)
    return json.data
  } catch {
    return getLocalItem('dealflow360_data_privacy_settings', DEFAULT_DATA_PRIVACY_SETTINGS)
  }
}

export async function updateDataPrivacySettings(data: Partial<DataPrivacySettings>): Promise<DataPrivacySettings> {
  try {
    const response = await fetch(`${API_BASE}/settings/data-privacy`, {
      method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify(data),
    })
    if (response.ok) {
      const json = await response.json()
      if (json.success) {
        setLocalItem('dealflow360_data_privacy_settings', json.data)
        return json.data
      }
    }
  } catch {}
  const current = getLocalItem('dealflow360_data_privacy_settings', DEFAULT_DATA_PRIVACY_SETTINGS)
  const updated = { ...current, ...data }
  setLocalItem('dealflow360_data_privacy_settings', updated)
  return updated
}
