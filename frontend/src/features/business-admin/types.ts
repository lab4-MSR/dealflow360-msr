/* eslint-disable @typescript-eslint/no-explicit-any */

// Base type with index signature for generic Table compatibility
interface BaseEntity {
  id: string
  [key: string]: any
}

// ─── Dashboard ────────────────────────────────────────────

export interface BusinessDashboardKpis {
  totalCustomers: number
  totalProducts: number
  activeDeals: number
  pendingApprovals: number
  revenue: number
  activeSubscriptions: number
}

export interface SalesOverview extends BaseEntity {
  totalDeals: number
  wonDeals: number
  lostDeals: number
  dealConversion: number
  dealTrend: { date: string; count: number; value: number }[]
}

export interface RevenueOverview extends BaseEntity {
  totalRevenue: number
  oneTimeRevenue: number
  recurringRevenue: number
  revenueGrowth: number
  revenueTrend: { date: string; amount: number }[]
}

export interface ApprovalOverview extends BaseEntity {
  pendingApprovals: number
  highRiskDeals: number
  averageApprovalTime: string
  approvalTrend: { date: string; count: number }[]
}

export interface InventoryOverview extends BaseEntity {
  totalStock: number
  lowStock: number
  outOfStock: number
  backorders: number
  warehouseStatus: string
}

export interface DealHealthOverview extends BaseEntity {
  healthyDeals: number
  atRisk: number
  stalled: number
  discountAnomalies: number
  deliverySlippage: number
}

export interface RecentDeal extends BaseEntity {
  name: string
  customer: string
  salesRep: string
  value: number
  risk: string
  status: string
  updatedAt: string
}

export interface ActivityItem extends BaseEntity {
  actor: string
  action: string
  resource: string
  resourceType: string
  timestamp: string
  category: string
  severity: string
}

export interface DashboardAlert extends BaseEntity {
  title: string
  description: string
  severity: string
  timestamp: string
  actionLabel: string
  actionPath: string
}

// ─── Company / Settings ───────────────────────────────────

export interface CompanyProfile extends BaseEntity {
  name: string
  legalName?: string
  businessType?: string
  industry?: string
  registrationNumber?: string
  taxId?: string
  email?: string
  phone?: string
  website?: string
  supportEmail?: string
  address?: any
  primaryContact?: any
  status?: string
}

export type CompanyProfileUpdate = Partial<CompanyProfile>

export interface BrandingConfig extends BaseEntity {
  logoUrl?: string
  faviconUrl?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  companyName?: string
  tagline?: string
}

export type BrandingUpdate = Partial<BrandingConfig>

export interface LocalizationConfig extends BaseEntity {
  defaultLocale?: string
  supportedLocales?: string[]
  dateFormat?: string
  timeFormat?: string
  timezone?: string
  firstDayOfWeek?: number
}

export type LocalizationUpdate = Partial<LocalizationConfig>

export interface TaxRate extends BaseEntity {
  name: string
  rate: number
  type?: string
  country?: string
}

export interface CurrencyTaxConfig extends BaseEntity {
  defaultCurrency?: string
  supportedCurrencies?: string[]
  taxEnabled?: boolean
  taxRates?: TaxRate[]
}

export type CurrencyTaxUpdate = Partial<CurrencyTaxConfig>

export interface BusinessSettings extends BaseEntity {
  invoicingEnabled?: boolean
  quotesExpiryDays?: number
  defaultPaymentTerms?: string
  autoApproveThreshold?: number
  dealStaleDays?: number
}

export type BusinessSettingsUpdate = Partial<BusinessSettings>

// ─── Users ────────────────────────────────────────────────

export interface BusinessUser extends BaseEntity {
  name: string
  email: string
  role: string
  status: string
  lastActive?: string
  teamId?: string
}

export interface BusinessUserKpis {
  totalUsers: number
  activeUsers: number
  pendingInvites: number
}

export interface BusinessUserFilters {
  search?: string
  role?: string
  status?: string
  teamId?: string
  page?: number
  perPage?: number
}

export interface InviteUserInput {
  email: string
  name?: string
  role: string
}

// ─── Teams ────────────────────────────────────────────────

export interface Team extends BaseEntity {
  name: string
  description?: string
  memberCount?: number
  status?: string
  lead?: string
}

export interface TeamDetail extends Team {
  members?: BusinessUser[]
}

export interface TeamKpis {
  totalTeams: number
  activeTeams: number
}

export interface TeamFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

// ─── Roles ────────────────────────────────────────────────

export interface Role extends BaseEntity {
  name: string
  description?: string
  displayName?: string
  permissionCount?: number
  userCount?: number
  status?: string
}

export interface RoleDetail extends Role {
  permissions?: Record<string, string[]>
}

export interface RoleKpis {
  totalRoles: number
  customRoles: number
}

export interface RoleFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

// ─── Customers ────────────────────────────────────────────

export interface Customer extends BaseEntity {
  name: string
  email?: string
  company?: string
  status?: string
  totalOrders?: number
  lifetimeValue?: number
}

export interface CustomerKpis {
  totalCustomers: number
  activeCustomers: number
  churnedCustomers: number
}

export interface CustomerFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

export interface CustomerDetail extends Customer {
  phone?: string
  address?: string
  notes?: string
}

export interface CustomerCreateInput {
  name: string
  email?: string
  company?: string
  phone?: string
}

// ─── Products ─────────────────────────────────────────────

export interface Product extends BaseEntity {
  name: string
  sku?: string
  price?: number
  status?: string
  category?: string
  stock?: number
}

export interface ProductKpis {
  totalProducts: number
  activeProducts: number
  lowStock: number
}

export interface ProductFilters {
  search?: string
  status?: string
  category?: string
  page?: number
  perPage?: number
}

export interface ProductDetail extends Product {
  description?: string
  cost?: number
  weight?: number
  dimensions?: string
}

export interface ProductCreateInput {
  name: string
  sku?: string
  price?: number
  category?: string
  description?: string
}

// ─── Categories ───────────────────────────────────────────

export interface Category extends BaseEntity {
  name: string
  parentId?: string
  productCount?: number
  status?: string
  description?: string
  sortOrder?: number
}

export interface CategoryKpis {
  totalCategories: number
}

export interface CategoryFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[]
}

// ─── Price Lists ──────────────────────────────────────────

export interface PriceList extends BaseEntity {
  name: string
  currency?: string
  status?: string
  itemCount?: number
}

export interface PriceListKpis {
  totalLists: number
  activeLists: number
}

export interface PriceListFilters {
  search?: string
  status?: string
  currency?: string
  page?: number
  perPage?: number
}

export interface PriceListDetail extends PriceList {
  description?: string
  items?: PriceListItem[]
}

export interface PriceListItem extends BaseEntity {
  productId: string
  productName?: string
  price: number
  currency?: string
}

export interface PriceListCreateInput {
  name: string
  currency?: string
  description?: string
  items?: PriceListItem[]
}

// ─── Customer Pricing ─────────────────────────────────────

export interface CustomerPricingOverride extends BaseEntity {
  customerId: string
  productId: string
  price: number
  currency?: string
}

export interface CustomerPricingInspection {
  customer: { id: string; name: string; tier?: string; tierDisplayName?: string }
  priceList?: { id: string; name: string; currency?: string }
  products: any[]
}

export type CustomerPricingOverrideInput = Omit<CustomerPricingOverride, 'id'>

// ─── Volume Pricing ───────────────────────────────────────

export interface VolumePricingTier extends BaseEntity {
  minQuantity: number
  maxQuantity?: number
  price: number
}

export interface VolumePricingTierItem {
  minQuantity: number
  maxQuantity?: number
  price: number
}

export interface VolumePricingRule extends BaseEntity {
  name: string
  productId?: string
  productName?: string
  tiers: VolumePricingTier[]
  status?: string
}

export interface VolumePricingKpis {
  totalRules: number
  activeRules: number
}

export interface VolumePricingFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

// ─── Pricing History ──────────────────────────────────────

export interface PricingHistoryEntry extends BaseEntity {
  entityType: string
  entityId: string
  entityName?: string
  action: string
  changedBy?: string
  changedAt?: string
  details?: string
}

export interface PricingHistoryFilters {
  search?: string
  entityType?: string
  page?: number
  perPage?: number
}

// ─── Discount Rules ───────────────────────────────────────

export interface DiscountRule extends BaseEntity {
  name: string
  description?: string
  type?: string
  value?: number
  maxDiscountPercent?: number
  minOrderValue?: number
  status?: string
  priority?: number
  scope?: string
  orderLevel?: string
  productLevel?: string
  categoryLevel?: string
}

export interface DiscountRuleDetail extends DiscountRule {
  conditions?: string
  changelog?: any[]
}

export interface DiscountRuleKpis {
  totalRules: number
  activeRules: number
}

export interface DiscountRuleFilters {
  search?: string
  status?: string
  type?: string
  page?: number
  perPage?: number
}

export interface DiscountRuleCreateInput {
  name: string
  description?: string
  type?: string
  value?: number
  maxDiscountPercent?: number
  scope?: string
  status?: string
}

// ─── Customer Tiers ───────────────────────────────────────

export interface CustomerTierConfig extends BaseEntity {
  name: string
  displayName?: string
  discountPercent?: number
  minRevenue?: number
  customerCount?: number
  status?: string
}

export interface CustomerTierKpis {
  totalTiers: number
}

// ─── Discount Simulator ──────────────────────────────────

export interface DiscountSimulatorRequest {
  customerId?: string
  productId?: string
  quantity?: number
  orderValue?: number
  tier?: string
}

export interface DiscountSimulatorResponse {
  eligible: boolean
  appliedDiscounts?: any[]
  finalPrice?: number
  savings?: number
}

// ─── Category Discount Rules ─────────────────────────────

export interface CategoryDiscountRule extends BaseEntity {
  categoryId: string
  categoryName?: string
  discountPercent?: number
  status?: string
}

export interface CategoryDiscountRuleKpis {
  totalRules: number
  activeRules: number
}

// ─── Margin Rules ─────────────────────────────────────────

export interface MarginRule extends BaseEntity {
  name: string
  description?: string
  type?: string
  targetMarginPercent?: number
  minimumMarginPercent?: number
  scope?: string
  status?: string
  priority?: number
}

export interface MarginRuleDetail extends MarginRule {
  conditions?: string
}

export interface MarginRuleKpis {
  totalRules: number
  activeRules: number
}

export interface MarginRuleFilters {
  search?: string
  status?: string
  type?: string
  page?: number
  perPage?: number
}

export interface MarginSimulationRequest {
  dealValue?: number
  discountPercent?: number
  costBase?: number
  ruleId?: string
}

export interface MarginSimulationResponse {
  marginPercent: number
  marginAmount: number
  passesThreshold: boolean
  warnings?: string[]
}

// ─── Approval Rules ───────────────────────────────────────

export interface ApprovalRule extends BaseEntity {
  name: string
  description?: string
  type?: string
  triggerType?: string
  triggerConfig?: any
  approvalLevel?: any[]
  threshold?: number
  status?: string
  priority?: number
}

export interface ApprovalRuleDetail extends ApprovalRule {
  conditions?: string
}

export interface ApprovalRuleKpis {
  totalRules: number
  activeRules: number
  highRiskRules?: number
}

export interface ApprovalRuleFilters {
  search?: string
  status?: string
  type?: string
  triggerType?: string
  page?: number
  perPage?: number
}

// ─── Approval Chains ──────────────────────────────────────

export interface ApprovalChain extends BaseEntity {
  name: string
  description?: string
  triggerDescription?: string
  logic?: string
  steps?: any[]
  totalSteps?: number
  levels?: number
  status?: string
}

export interface ApprovalChainDetail extends ApprovalChain {
  steps?: { level: number; approverRole: string; required: boolean }[]
}

export interface ApprovalChainKpis {
  totalChains: number
  activeChains: number
  totalSteps?: number
}

export interface ApprovalChainFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

// ─── Approval Thresholds ─────────────────────────────────

export interface ApprovalThresholds extends BaseEntity {
  autoApproveBelow?: number
  managerApprovalAbove?: number
  executiveApprovalAbove?: number
}

// ─── Approval Simulator ──────────────────────────────────

export interface ApprovalSimulatorRequest {
  dealValue?: number
  discountPercent?: number
  customerId?: string
}

export interface ApprovalSimulatorResponse {
  requiresApproval: boolean
  approvalLevel?: string
  estimatedTime?: string
  chain?: string
}

// ─── Warehouses ───────────────────────────────────────────

export interface Warehouse extends BaseEntity {
  name: string
  location?: string
  status?: string
  capacity?: number
  utilization?: number
}

export interface WarehouseDetail extends Warehouse {
  description?: string
  manager?: string
  phone?: string
}

export interface WarehouseKpis {
  totalWarehouses: number
  activeWarehouses: number
  lowStockItems: number
}

export interface WarehouseFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

export interface WarehouseStockMovementFilters {
  warehouseId?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

export interface WarehouseCreateInput {
  name: string
  location?: string
  capacity?: number
  description?: string
}

// ─── Shipping Rules ───────────────────────────────────────

export interface ShippingRule extends BaseEntity {
  name: string
  description?: string
  carrier?: string
  destination?: string
  method?: string
  shippingMethod?: string
  baseRate?: number
  status?: string
  priority?: number
  allocationStrategy?: string
  isDefault?: boolean
}

export interface ShippingRuleKpis {
  totalRules: number
  activeRules: number
}

export interface ShippingRuleFilters {
  search?: string
  status?: string
  priority?: string
  destinationCountry?: string
  warehouseId?: string
  page?: number
  perPage?: number
}

// ─── Subscription Plans ──────────────────────────────────

export interface SubscriptionPlan extends BaseEntity {
  name: string
  description?: string
  price?: number
  currency?: string
  billingCycle?: string
  billingFrequency?: string
  status?: string
  subscriberCount?: number
  features?: PlanFeature[] | string[]
  usageLimits?: PlanUsageLimit[]
  trialEnabled?: boolean
  trialDuration?: number
  prorationUpgradeRule?: string
  prorationDowngradeRule?: string
  prorationBehavior?: string
  cancellationPolicy?: string
  refundPolicy?: string
  effectiveDate?: string
  planType?: string
  createdAt?: string
  updatedAt?: string
}

export interface SubscriptionPlanKpis {
  totalPlans: number
  activePlans: number
  totalSubscribers: number
}

export interface SubscriptionPlanFilters {
  search?: string
  status?: string
  page?: number
  perPage?: number
}

// ─── Billing Cycles ──────────────────────────────────────

export interface BillingCycle extends BaseEntity {
  name: string
  description?: string
  duration: string
  durationDays: number
  billingDate: string
  renewalBehavior: string
  automaticRenewal: boolean
  gracePeriod: number
  failedPaymentBehavior: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface BillingCycleKpis {
  totalCycles: number
  activeCycles: number
  monthlySubscribers: number
  annualSubscribers: number
}

export interface BillingCycleFilters {
  search?: string
  status?: string
  duration?: string
  page?: number
  perPage?: number
}

export interface BillingCycleCreateInput {
  name: string
  description?: string
  duration: string
  durationDays: number
  billingDate: string
  renewalBehavior: string
  automaticRenewal: boolean
  gracePeriod: number
  failedPaymentBehavior: string
  status: string
}

// ─── Proration & Cancellation Rules ──────────────────────

export interface ProrationRule extends BaseEntity {
  name: string
  description?: string
  upgradeRule: string
  downgradeRule: string
  midCycleChange: string
  remainingPeriod: string
  billingAdjustment: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface ProrationCalculationInput {
  currentPlanId: string
  newPlanId: string
  effectiveDate: string
  billingCycle: string
}

export interface ProrationCalculationResult {
  currentPlanValue: number
  newPlanValue: number
  remainingDays: number
  usedDays: number
  credit: number
  charge: number
  finalAdjustment: number
  explanation: string
}

// ─── Reports ─────────────────────────────────────────────

export interface ReportKpis {
  totalRevenue: number
  oneTimeRevenue: number
  recurringRevenue: number
  revenueGrowth: number
  totalDeals: number
  wonDeals: number
  lostDeals: number
  conversionRate: number
  averageDealValue: number
  averageApprovalTime: number
  fulfillmentRate: number
  backorderRate: number
  averageMargin: number
  discountUsage: number
  discountExceptions: number
}

export interface ReportFilters {
  dateRange?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
  productId?: string
  salesRepId?: string
  page?: number
  perPage?: number
}

export interface SalesReportData {
  date: string
  dealsCreated: number
  dealsWon: number
  dealsLost: number
  revenue: number
  conversionRate: number
}

export interface RevenueReportData {
  date: string
  totalRevenue: number
  oneTimeRevenue: number
  recurringRevenue: number
}

export interface DiscountReportData {
  date: string
  discountUsage: number
  discountExceptions: number
  averageDiscount: number
}

export interface MarginReportData {
  date: string
  averageMargin: number
  lowMarginDeals: number
  highMarginDeals: number
}

export interface ApprovalReportData {
  date: string
  approvalVolume: number
  averageApprovalTime: number
  rejections: number
  escalations: number
}

export interface FulfillmentReportData {
  date: string
  fulfillmentRate: number
  backorders: number
  averageDeliveryTime: number
  warehousePerformance: number
}

// ─── Deal Health ─────────────────────────────────────────

export interface DealHealthItem extends BaseEntity {
  dealName: string
  customer: string
  salesRep: string
  value: number
  healthScore: number
  healthStatus: 'healthy' | 'at_risk' | 'critical' | 'stalled'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  engagementScore: number
  approvalDelay: number
  fulfillmentStatus: string
  lastActivity: string
  anomalies: DealAnomaly[]
  recommendedActions: string[]
}

export interface DealAnomaly {
  type: 'discount' | 'margin' | 'approval' | 'delivery' | 'engagement'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  impact: string
  recommendedAction: string
}

// ─── Audit Trail ─────────────────────────────────────────

export interface AuditEvent extends BaseEntity {
  timestamp: string
  actor: string
  actorRole: string
  action: string
  resource: string
  resourceType: string
  module: string
  status: 'success' | 'failure' | 'warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  reason?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export interface AuditKpis {
  totalEvents: number
  configurationChanges: number
  approvalActions: number
  userActions: number
  securityEvents: number
}

export interface AuditFilters {
  search?: string
  userId?: string
  action?: string
  resource?: string
  module?: string
  severity?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

// ─── Notification Settings ───────────────────────────────

export interface NotificationSettings extends BaseEntity {
  emailNotifications: boolean
  approvalNotifications: boolean
  dealAlerts: boolean
  inventoryAlerts: boolean
  billingAlerts: boolean
  systemAlerts: boolean
  dailyDigest: boolean
  weeklyReport: boolean
}

// ─── Security Settings ───────────────────────────────────

export interface SecuritySettings extends BaseEntity {
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecialChars: boolean
  passwordExpiryDays: number
  sessionDuration: number
  idleTimeout: number
  maxConcurrentSessions: number
  mfaRequired: boolean
  ipRestriction: boolean
  allowedIps: string[]
}

// ─── Integration Settings ────────────────────────────────

export interface IntegrationSettings extends BaseEntity {
  emailProvider: string
  emailConfigured: boolean
  paymentProvider: string
  paymentConfigured: boolean
  shippingProvider: string
  shippingConfigured: boolean
  externalServices: string[]
}

// ─── Data Privacy Settings ───────────────────────────────

export interface DataPrivacySettings extends BaseEntity {
  dataRetentionDays: number
  autoDeleteInactive: boolean
  exportEnabled: boolean
  anonymizeData: boolean
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  gdprCompliant: boolean
}

// ─── Extended Business Settings ──────────────────────────

export interface PlanFeature {
  name: string
  enabled: boolean
  description?: string
}

export interface PlanUsageLimit {
  name: string
  value: number
  unit: string
}

export interface SubscriptionPlanCreateInput {
  name: string
  description?: string
  price: number
  currency: string
  billingCycle: string
  billingFrequency?: string
  features?: PlanFeature[]
  usageLimits?: PlanUsageLimit[]
  trialEnabled?: boolean
  trialDuration?: number
  prorationUpgradeRule?: string
  prorationDowngradeRule?: string
  prorationBehavior?: string
  cancellationPolicy?: string
  refundPolicy?: string
  effectiveDate?: string
  planType?: string
}

export interface DealHealthKpis {
  healthyDeals: number
  atRiskDeals: number
  criticalDeals: number
  stalledDeals: number
  averageHealthScore: number
  averageRiskScore: number
}

export interface DealHealthFilters {
  search?: string
  healthStatus?: string
  riskLevel?: string
  salesRepId?: string
  customerId?: string
  page?: number
  perPage?: number
}

export interface CancellationRule extends BaseEntity {
  name: string
  description?: string
  cancellationPolicy: string
  refundPolicy: string
  effectiveDate: string
  noticePeriod: number
  eligibility: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface RefundRule extends BaseEntity {
  name: string
  description?: string
  refundEligible: boolean
  fullRefundPeriod: number
  partialRefundPolicy: string
  noRefundAfter: number
  refundCalculation: string
  status: string
  createdAt?: string
  updatedAt?: string
}
