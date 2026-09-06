import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { CustomerPortalLayout } from '@/layouts/CustomerPortalLayout'
import { ProtectedRoute, GuestRoute, RoleRoute } from '@/routes/guards'
import { useAuth } from '@/providers/AuthProvider'

function RootLanding() {
  const { user, getDashboardPath } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={getDashboardPath()} replace />
}

function LegacyBusinessAdminRedirect({ to }: { to: string }) {
  const params = useParams()
  const target = to.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => params[key] ?? '')
  return <Navigate to={target} replace />
}

// Auth Pages (00. Public / Auth)
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import CompanyRegistrationPage from '@/pages/auth/CompanyRegistrationPage'
import { LandingPage } from '@/pages/LandingPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import AcceptInvitationPage from '@/pages/auth/AcceptInvitationPage'
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage'
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage'
import NotFoundPage from '@/pages/auth/NotFoundPage'
import SystemErrorPage from '@/pages/auth/SystemErrorPage'

// Workspace Core Pages
import { DashboardPage } from '@/pages/DashboardPage'
import { GlobalSearchPage } from '@/pages/GlobalSearchPage'
import { NotificationCenterPage } from '@/pages/NotificationCenterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { SettingsPage } from '@/pages/SettingsPage'

// Platform / Super Admin (01.x)
import {
  SuperAdminDashboardPage,
  AllBusinessesPage,
  CreateBusinessPage,
  BusinessDetailsLayout,
  BusinessDetailsOverviewPage,
  BusinessUsersPage,
  BusinessDealsPage,
  BusinessRevenuePage,
  BusinessUsagePage,
  BusinessHealthPage,
  BusinessConfigurationPage,
  BusinessActivityPage,
  PlatformUsersPage,
  PlatformInviteUserPage,
  PlatformUserDetailsPage,
  PlatformAnalyticsPage,
  PlatformAuditPage,
  PlatformHealthPage,
  PlatformSettingsPage,
} from '@/features/platform'

// Business Admin (02.x)
import {
  BusinessAdminDashboard,
  CompanyProfilePage,
  BrandingPage,
  LocalizationPage,
  CurrencyTaxPage,
  BusinessSettingsFullPage,
  BusinessSettingsPage,
  UsersPage as BusinessUsersListPage,
  InviteUserPage as BusinessInviteUserPage,
  UserDetailsPage as BusinessUserDetailsPage,
  TeamsPage,
  RolesPage,
  RoleDetailsPage,
  CustomersPage as BusinessCustomersPage,
  CreateCustomerPage as BusinessCreateCustomerPage,
  CustomerDetailsPage as BusinessCustomerDetailsPage,
  ProductsPage,
  CreateProductPage,
  ProductDetailsPage,
  CategoriesPage,
  PriceListsPage,
  CreatePriceListPage,
  PriceListDetailsPage,
  CustomerPricingPage,
  VolumePricingPage,
  PricingHistoryPage,
  DiscountRulesPage,
  CreateDiscountRulePage,
  DiscountRuleDetailsPage,
  CustomerTierRulesPage,
  CategoryRulesPage,
  MarginRulesPage,
  DiscountRuleSimulatorPage,
  ApprovalRulesPage,
  CreateApprovalRulePage,
  ApprovalChainsPage,
  ApprovalThresholdsPage,
  ApprovalSimulatorPage,
  WarehouseListPage,
  CreateWarehousePage,
  WarehouseDetailsPage,
  ShippingRulesListPage,
  CreateShippingRulePage,
  SubscriptionPlansListPage,
  CreateSubscriptionPlanPage,
  SubscriptionPlanDetailsPage,
  BillingCyclesPage,
  ProrationCancellationPage,
  ReportsPage as BusinessReportsPage,
  DealHealthPage as BusinessDealHealthPage,
  AuditTrailPage as BusinessAuditTrailPage,
} from '@/features/business-admin'

// Sales (03.x)
import { MyCustomersPage } from '@/pages/MyCustomersPage'
import { CustomerDetailsPage } from '@/pages/CustomerDetailsPage'
import { MyDealsPage } from '@/pages/MyDealsPage'
import { DealDetailsPage } from '@/pages/DealDetailsPage'
import { DealTimelinePage } from '@/pages/DealTimelinePage'
import { DealHealthPage } from '@/pages/DealHealthPage'
import { AllQuotationsPage } from '@/pages/AllQuotationsPage'
import { CreateQuotationPage } from '@/pages/CreateQuotationPage'
import { QuotationBuilderPage } from '@/pages/QuotationBuilderPage'
import { QuotationDetailsPage } from '@/pages/QuotationDetailsPage'

// Sales Manager (04.x)
import {
  SalesManagerDashboardPage,
  ApprovalInboxPage,
  ApprovalDetailsPage,
  ApprovalHistoryPage,
  TeamDealListPage,
  TeamDealDetailsPage,
  TeamDealTimelinePage,
  TeamPerformancePage,
  DealHealthManagerPage,
  SalesManagerReportsPage,
} from '@/features/sales-manager/index'

// Finance (05.x)
import {
  FinanceDashboardPage,
  HighRiskDealsPage as FinanceHighRiskDealsPage,
  InvoicesPage as FinanceInvoicesPage,
  FinanceInvoiceDetailsPage,
  PaymentsPage as FinancePaymentsPage,
  FailedPaymentsPage as FinanceFailedPaymentsPage,
  SubscriptionsPage as FinanceSubscriptionsPage,
  FinanceSubscriptionDetailsPage,
  RevenueAnalyticsPage as FinanceRevenueAnalyticsPage,
  FinanceAuditPage,
} from '@/features/finance/pages'

// Operations (06.x)
import {
  AllocationPage,
  BackorderDetailsPage,
  BackorderQueuePage,
  FulfillmentDetailsPage,
  FulfillmentQueuePage,
  InventoryPage,
  OperationsAnalyticsPage,
  OperationsDashboardPage,
  ShipmentDetailsPage,
  ShipmentTrackingPage,
  StockMovementsPage,
  WarehouseOverviewPage,
} from '@/features/operations/pages/OperationsPages'

// Intelligence (07.x)
import {
  IntelligenceDashboardPage,
  RiskOverviewPage,
  HighRiskDealsPage,
  RiskDetailsPage,
  UpsellRecommendationsPage,
  CrossSellRecommendationsPage,
  RecommendationDetailsPage,
  DealHealthOverviewPage,
  StalledDealsPage,
  DiscountAnomaliesPage,
  DeliverySlippagePage,
  DecisionInsightsPage,
} from '@/features/intelligence/index'

// Customer Portal (08.x)
import {
  CustomerDashboardPage,
  MyQuotationsPage as CustomerMyQuotationsPage,
  QuotationDetailsPage as CustomerQuotationDetailsPage,
  ReviewQuotePage,
  ShipmentListPage,
  CustomerShipmentDetailsPage,
  CustomerInvoicesPage,
  CustomerInvoiceDetailsPage,
  CustomerSubscriptionsPage,
  CustomerSubscriptionDetailsPage,
  CustomerProfilePage,
  CustomerCompanyPage,
  CustomerPreferencesPage,
} from '@/pages/customer-portal/index'
import { MyOrdersPage } from '@/pages/customer-portal/MyOrdersPage'
import { OrderDetailsPage } from '@/pages/customer-portal/OrderDetailsPage'
import { CounterOfferPage } from '@/pages/customer-portal/CounterOfferPage'
import { RequestChangesPage } from '@/pages/customer-portal/RequestChangesPage'

// Analytics (09.x)
import {
  ApprovalAnalyticsPage,
  CustomReportsPage,
  DiscountAnalyticsPage,
  ExecutiveDashboardPage,
  FulfillmentAnalyticsPage,
  MarginAnalyticsPage,
  RevenueAnalyticsPage,
  SalesAnalyticsPage,
  SubscriptionAnalyticsPage,
} from '@/pages/analytics'

export function App() {
  return (
    <Routes>
      {/* ─── PUBLIC LANDING PAGE ─── */}
      <Route path="/" element={<LandingPage />} />

      {/* ─── PUBLIC ERROR ROUTES ─── */}
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/system-error" element={<SystemErrorPage />} />

      {/* ─── GUEST AUTH ROUTES ─── */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/register-company" element={<CompanyRegistrationPage />} />
        <Route path="/company-registration" element={<CompanyRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Route>

      {/* ─── PROTECTED APPLICATION ROUTES ─── */}
      <Route element={<ProtectedRoute />}>
        {/* Role-aware dynamic workspace redirection */}
        <Route path="/workspace" element={<RootLanding />} />
        <Route path="/app" element={<RootLanding />} />

        {/* Customer Portal Layout Routes (08.x) */}
        <Route element={<RoleRoute allowedRoles={['customer', 'super_admin', 'business_admin']} />}>
          <Route element={<CustomerPortalLayout />}>
            <Route path="/customer-portal" element={<CustomerDashboardPage />} />
            <Route path="/customer-portal/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer-portal/quotations" element={<CustomerMyQuotationsPage />} />
            <Route path="/customer-portal/quotations/:id" element={<CustomerQuotationDetailsPage />} />
            <Route path="/customer-portal/review/:id" element={<ReviewQuotePage />} />
            <Route path="/customer-portal/counter-offer/:id" element={<CounterOfferPage />} />
            <Route path="/customer-portal/request-changes/:id" element={<RequestChangesPage />} />
            <Route path="/customer-portal/quotations/:id/review" element={<ReviewQuotePage />} />
            <Route path="/customer-portal/quotations/:id/counter-offer" element={<CounterOfferPage />} />
            <Route path="/customer-portal/quotations/:id/request-changes" element={<RequestChangesPage />} />
            <Route path="/customer-portal/orders" element={<MyOrdersPage />} />
            <Route path="/customer-portal/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/customer-portal/shipments" element={<ShipmentListPage />} />
            <Route path="/customer-portal/shipments/:id" element={<CustomerShipmentDetailsPage />} />
            <Route path="/customer-portal/invoices" element={<CustomerInvoicesPage />} />
            <Route path="/customer-portal/invoices/:id" element={<CustomerInvoiceDetailsPage />} />
            <Route path="/customer-portal/subscriptions" element={<CustomerSubscriptionsPage />} />
            <Route path="/customer-portal/subscriptions/:id" element={<CustomerSubscriptionDetailsPage />} />
            <Route path="/customer-portal/account/profile" element={<CustomerProfilePage />} />
            <Route path="/customer-portal/account/company" element={<CustomerCompanyPage />} />
            <Route path="/customer-portal/account/preferences" element={<CustomerPreferencesPage />} />
          </Route>
        </Route>

        {/* Internal Enterprise Dashboard Layout Routes */}
        <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager', 'sales_rep', 'finance', 'operations']} />}>
          <Route element={<DashboardLayout />}>
            {/* Main Sales Dashboard */}
            <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager', 'sales_rep']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

          {/* ─── PLATFORM / SUPER ADMIN (01.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
            <Route path="/platform" element={<SuperAdminDashboardPage />} />
            <Route path="/platform/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/platform/businesses" element={<AllBusinessesPage />} />
            <Route path="/platform/businesses/create" element={<CreateBusinessPage />} />
            <Route path="/platform/businesses/:id" element={<BusinessDetailsLayout />}>
              <Route index element={<BusinessDetailsOverviewPage />} />
              <Route path="users" element={<BusinessUsersPage />} />
              <Route path="deals" element={<BusinessDealsPage />} />
              <Route path="revenue" element={<BusinessRevenuePage />} />
              <Route path="usage" element={<BusinessUsagePage />} />
              <Route path="health" element={<BusinessHealthPage />} />
              <Route path="configuration" element={<BusinessConfigurationPage />} />
              <Route path="activity" element={<BusinessActivityPage />} />
            </Route>
            <Route path="/platform/users" element={<PlatformUsersPage />} />
            <Route path="/platform/users/invite" element={<PlatformInviteUserPage />} />
            <Route path="/platform/users/:id" element={<PlatformUserDetailsPage />} />
            <Route path="/platform/analytics" element={<PlatformAnalyticsPage />} />
            <Route path="/platform/audit" element={<PlatformAuditPage />} />
            <Route path="/platform/health" element={<PlatformHealthPage />} />
            <Route path="/platform/system-health" element={<PlatformHealthPage />} />
            <Route path="/platform/deals/:id" element={<DealDetailsPage />} />
            <Route path="/platform/settings" element={<PlatformSettingsPage />} />
          </Route>

          {/* ─── BUSINESS ADMIN (02.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin']} />}>
            <Route path="/business-admin" element={<Navigate to="/business-admin/dashboard" replace />} />
            <Route path="/business-admin/dashboard" element={<BusinessAdminDashboard />} />
            {/* Organization */}
            <Route path="/business-admin/organization/profile" element={<CompanyProfilePage />} />
            <Route path="/business-admin/organization/branding" element={<BrandingPage />} />
            <Route path="/business-admin/organization/localization" element={<LocalizationPage />} />
            <Route path="/business-admin/organization/currency-tax" element={<CurrencyTaxPage />} />
            <Route path="/business-admin/organization/settings" element={<BusinessSettingsFullPage />} />
            {/* Users & Roles */}
            <Route path="/business-admin/users" element={<BusinessUsersListPage />} />
            <Route path="/business-admin/users/invite" element={<BusinessInviteUserPage />} />
            <Route path="/business-admin/users/:userId" element={<BusinessUserDetailsPage />} />
            <Route path="/business-admin/users-access/users" element={<Navigate to="/business-admin/users" replace />} />
            <Route path="/business-admin/users-access/invite" element={<Navigate to="/business-admin/users/invite" replace />} />
            <Route path="/business-admin/users-access/users/:userId" element={<LegacyBusinessAdminRedirect to="/business-admin/users/:userId" />} />
            <Route path="/business-admin/teams" element={<TeamsPage />} />
            <Route path="/business-admin/teams/:teamId" element={<TeamsPage />} />
            <Route path="/business-admin/roles" element={<RolesPage />} />
            <Route path="/business-admin/roles/:roleId" element={<RoleDetailsPage />} />
            <Route path="/business-admin/users-access/teams" element={<Navigate to="/business-admin/teams" replace />} />
            <Route path="/business-admin/users-access/teams/:teamId" element={<LegacyBusinessAdminRedirect to="/business-admin/teams/:teamId" />} />
            <Route path="/business-admin/users-access/roles" element={<Navigate to="/business-admin/roles" replace />} />
            <Route path="/business-admin/users-access/roles/:roleId" element={<LegacyBusinessAdminRedirect to="/business-admin/roles/:roleId" />} />
            {/* Customers */}
            <Route path="/business-admin/customers" element={<BusinessCustomersPage />} />
            <Route path="/business-admin/customers/create" element={<BusinessCreateCustomerPage />} />
            <Route path="/business-admin/customers/new" element={<Navigate to="/business-admin/customers/create" replace />} />
            <Route path="/business-admin/customers/:id" element={<BusinessCustomerDetailsPage />} />
            {/* Products & Catalog */}
            <Route path="/business-admin/products" element={<ProductsPage />} />
            <Route path="/business-admin/products/create" element={<CreateProductPage />} />
            <Route path="/business-admin/products/new" element={<Navigate to="/business-admin/products/create" replace />} />
            <Route path="/business-admin/products/categories" element={<CategoriesPage />} />
            <Route path="/business-admin/products/:id" element={<ProductDetailsPage />} />
            {/* Pricing */}
            <Route path="/business-admin/pricing" element={<Navigate to="/business-admin/pricing/lists" replace />} />
            <Route path="/business-admin/pricing/lists" element={<PriceListsPage />} />
            <Route path="/business-admin/pricing/lists/create" element={<CreatePriceListPage />} />
            <Route path="/business-admin/pricing/lists/:id" element={<PriceListDetailsPage />} />
            <Route path="/business-admin/pricing/price-lists" element={<Navigate to="/business-admin/pricing/lists" replace />} />
            <Route path="/business-admin/pricing/price-lists/create" element={<Navigate to="/business-admin/pricing/lists/create" replace />} />
            <Route path="/business-admin/pricing/price-lists/:id" element={<LegacyBusinessAdminRedirect to="/business-admin/pricing/lists/:id" />} />
            <Route path="/business-admin/pricing/customer-pricing" element={<CustomerPricingPage />} />
            <Route path="/business-admin/pricing/volume-pricing" element={<VolumePricingPage />} />
            <Route path="/business-admin/pricing/history" element={<PricingHistoryPage />} />
            {/* Discounts */}
            <Route path="/business-admin/discounts" element={<DiscountRulesPage />} />
            <Route path="/business-admin/discounts/create" element={<CreateDiscountRulePage />} />
            <Route path="/business-admin/discounts/customer-tier" element={<CustomerTierRulesPage />} />
            <Route path="/business-admin/discounts/category" element={<CategoryRulesPage />} />
            <Route path="/business-admin/discounts/margin" element={<MarginRulesPage />} />
            <Route path="/business-admin/discounts/simulator" element={<DiscountRuleSimulatorPage />} />
            <Route path="/business-admin/discounts/:id" element={<DiscountRuleDetailsPage />} />
            <Route path="/business-admin/discounts/:id/edit" element={<CreateDiscountRulePage />} />
            <Route path="/business-admin/discount-governance/rules" element={<Navigate to="/business-admin/discounts" replace />} />
            <Route path="/business-admin/discount-governance/rules/create" element={<Navigate to="/business-admin/discounts/create" replace />} />
            <Route path="/business-admin/discount-governance/rules/:id" element={<LegacyBusinessAdminRedirect to="/business-admin/discounts/:id" />} />
            <Route path="/business-admin/discount-governance/rules/:id/edit" element={<LegacyBusinessAdminRedirect to="/business-admin/discounts/:id/edit" />} />
            {/* Approvals */}
            <Route path="/business-admin/approvals" element={<ApprovalRulesPage />} />
            <Route path="/business-admin/approvals/create" element={<CreateApprovalRulePage />} />
            <Route path="/business-admin/approvals/chains" element={<ApprovalChainsPage />} />
            <Route path="/business-admin/approvals/thresholds" element={<ApprovalThresholdsPage />} />
            <Route path="/business-admin/approvals/simulator" element={<ApprovalSimulatorPage />} />
            <Route path="/business-admin/approval-configuration/rules" element={<Navigate to="/business-admin/approvals" replace />} />
            <Route path="/business-admin/approval-configuration/rules/create" element={<Navigate to="/business-admin/approvals/create" replace />} />
            {/* Warehouses & Shipping */}
            <Route path="/business-admin/warehouses" element={<WarehouseListPage />} />
            <Route path="/business-admin/warehouses/create" element={<CreateWarehousePage />} />
            <Route path="/business-admin/warehouses/shipping-rules" element={<ShippingRulesListPage />} />
            <Route path="/business-admin/warehouses/shipping-rules/create" element={<CreateShippingRulePage />} />
            <Route path="/business-admin/warehouses/:id" element={<WarehouseDetailsPage />} />
            <Route path="/business-admin/shipping-rules" element={<Navigate to="/business-admin/warehouses/shipping-rules" replace />} />
            <Route path="/business-admin/shipping-rules/create" element={<Navigate to="/business-admin/warehouses/shipping-rules/create" replace />} />
            <Route path="/business-admin/shipping-rules/:id" element={<Navigate to="/business-admin/warehouses/shipping-rules" replace />} />
            {/* Subscriptions */}
            <Route path="/business-admin/subscriptions" element={<SubscriptionPlansListPage />} />
            <Route path="/business-admin/subscriptions/create" element={<CreateSubscriptionPlanPage />} />
            <Route path="/business-admin/subscriptions/billing-cycles" element={<BillingCyclesPage />} />
            <Route path="/business-admin/subscriptions/proration-cancellation" element={<ProrationCancellationPage />} />
            <Route path="/business-admin/subscriptions/:id" element={<SubscriptionPlanDetailsPage />} />
            <Route path="/business-admin/subscription-plans" element={<Navigate to="/business-admin/subscriptions" replace />} />
            <Route path="/business-admin/subscription-plans/create" element={<Navigate to="/business-admin/subscriptions/create" replace />} />
            <Route path="/business-admin/subscription-plans/:id" element={<LegacyBusinessAdminRedirect to="/business-admin/subscriptions/:id" />} />
            {/* Other Admin Pages */}
            <Route path="/business-admin/deal-health" element={<BusinessDealHealthPage />} />
            <Route path="/business-admin/audit" element={<BusinessAuditTrailPage />} />
            <Route path="/business-admin/reports" element={<BusinessReportsPage />} />
            <Route path="/business-admin/settings" element={<BusinessSettingsPage />} />
          </Route>

          {/* ─── SALES (03.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager', 'sales_rep']} />}>
            <Route path="/sales/customers" element={<MyCustomersPage />} />
            <Route path="/sales/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/sales/deals" element={<MyDealsPage />} />
            <Route path="/sales/deals/create" element={<Navigate to="/sales/quotations/create" replace />} />
            <Route path="/sales/pipeline" element={<Navigate to="/sales/deals" replace />} />
            <Route path="/sales/deals/:id" element={<DealDetailsPage />} />
            <Route path="/sales/deals/:id/timeline" element={<DealTimelinePage />} />
            <Route path="/sales/deals/:id/health" element={<DealHealthPage />} />
            <Route path="/sales/quotations" element={<AllQuotationsPage />} />
            <Route path="/sales/quotations/create" element={<CreateQuotationPage />} />
            <Route path="/sales/quotations/new" element={<Navigate to="/sales/quotations/create" replace />} />
            <Route path="/sales/quotations/:id" element={<QuotationDetailsPage />} />
            <Route path="/sales/quotations/:id/builder" element={<QuotationBuilderPage />} />
          </Route>

          {/* ─── SALES MANAGER (04.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager']} />}>
            <Route path="/sales-manager" element={<SalesManagerDashboardPage />} />
            <Route path="/sales-manager/dashboard" element={<SalesManagerDashboardPage />} />
            <Route path="/sales-manager/approvals" element={<ApprovalInboxPage />} />
            <Route path="/sales-manager/approvals/:id" element={<ApprovalDetailsPage />} />
            <Route path="/sales-manager/approvals/history" element={<ApprovalHistoryPage />} />
            <Route path="/sales-manager/deals" element={<TeamDealListPage />} />
            <Route path="/sales-manager/deals/:id" element={<TeamDealDetailsPage />} />
            <Route path="/sales-manager/deals/:id/timeline" element={<TeamDealTimelinePage />} />
            <Route path="/sales-manager/performance" element={<TeamPerformancePage />} />
            <Route path="/sales-manager/deal-health" element={<DealHealthManagerPage />} />
            <Route path="/sales-manager/reports" element={<SalesManagerReportsPage />} />
          </Route>

          {/* ─── FINANCE & BILLING (05.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'finance']} />}>
            <Route path="/finance" element={<FinanceDashboardPage />} />
            <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />
            <Route path="/finance/approvals" element={<FinanceHighRiskDealsPage />} />
            <Route path="/finance/approvals/high-risk" element={<FinanceHighRiskDealsPage />} />
            <Route path="/finance/risk/high" element={<FinanceHighRiskDealsPage />} />
            <Route path="/finance/reviews/:id" element={<ApprovalDetailsPage />} />
            <Route path="/finance/approvals/:id" element={<ApprovalDetailsPage />} />
            <Route path="/finance/invoices" element={<FinanceInvoicesPage />} />
            <Route path="/finance/invoices/:id" element={<FinanceInvoiceDetailsPage />} />
            <Route path="/finance/billing/invoices" element={<FinanceInvoicesPage />} />
            <Route path="/finance/billing/invoices/:id" element={<FinanceInvoiceDetailsPage />} />
            <Route path="/finance/billing/payments" element={<FinancePaymentsPage />} />
            <Route path="/finance/payments" element={<FinancePaymentsPage />} />
            <Route path="/finance/billing/failed" element={<FinanceFailedPaymentsPage />} />
            <Route path="/finance/subscriptions" element={<FinanceSubscriptionsPage />} />
            <Route path="/finance/subscriptions/:id" element={<FinanceSubscriptionDetailsPage />} />
            <Route path="/finance/analytics" element={<FinanceRevenueAnalyticsPage />} />
            <Route path="/finance/audit" element={<FinanceAuditPage />} />
          </Route>

          {/* ─── OPERATIONS & FULFILLMENT (06.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'operations']} />}>
            <Route path="/operations" element={<OperationsDashboardPage />} />
            <Route path="/operations/dashboard" element={<OperationsDashboardPage />} />
            <Route path="/operations/fulfillment" element={<FulfillmentQueuePage />} />
            <Route path="/operations/fulfillment/:fulfillmentId" element={<FulfillmentDetailsPage />} />
            <Route path="/operations/orders" element={<FulfillmentQueuePage />} />
            <Route path="/operations/shipments/:shipmentId" element={<ShipmentDetailsPage />} />
            <Route path="/operations/warehouses" element={<WarehouseOverviewPage />} />
            <Route path="/operations/inventory" element={<InventoryPage />} />
            <Route path="/operations/inventory/movements" element={<StockMovementsPage />} />
            <Route path="/operations/allocation/:orderId" element={<AllocationPage />} />
            <Route path="/operations/backorders" element={<BackorderQueuePage />} />
            <Route path="/operations/backorders/:backorderId" element={<BackorderDetailsPage />} />
            <Route path="/operations/shipping" element={<ShipmentTrackingPage />} />
            <Route path="/operations/analytics" element={<OperationsAnalyticsPage />} />
          </Route>

          {/* ─── INTELLIGENCE (07.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager']} />}>
            <Route path="/intelligence" element={<IntelligenceDashboardPage />} />
            <Route path="/intelligence/risks" element={<RiskOverviewPage />} />
            <Route path="/intelligence/risks/high" element={<HighRiskDealsPage />} />
            <Route path="/intelligence/risks/:riskId" element={<RiskDetailsPage />} />
            <Route path="/intelligence/recommendations/upsell" element={<UpsellRecommendationsPage />} />
            <Route path="/intelligence/recommendations/cross-sell" element={<CrossSellRecommendationsPage />} />
            <Route path="/intelligence/recommendations/:recommendationId" element={<RecommendationDetailsPage />} />
            <Route path="/intelligence/health" element={<DealHealthOverviewPage />} />
            <Route path="/intelligence/health/stalled" element={<StalledDealsPage />} />
            <Route path="/intelligence/anomalies/discount" element={<DiscountAnomaliesPage />} />
            <Route path="/intelligence/anomalies/delivery" element={<DeliverySlippagePage />} />
            <Route path="/intelligence/insights" element={<DecisionInsightsPage />} />
          </Route>

          {/* ─── ANALYTICS & BI (09.x) ─── */}
          <Route element={<RoleRoute allowedRoles={['super_admin', 'business_admin', 'sales_manager', 'finance', 'operations']} />}>
            <Route path="/analytics" element={<ExecutiveDashboardPage />} />
            <Route path="/analytics/executive" element={<ExecutiveDashboardPage />} />
            <Route path="/analytics/sales" element={<SalesAnalyticsPage />} />
            <Route path="/analytics/revenue" element={<RevenueAnalyticsPage />} />
            <Route path="/analytics/discount" element={<DiscountAnalyticsPage />} />
            <Route path="/analytics/margin" element={<MarginAnalyticsPage />} />
            <Route path="/analytics/approval" element={<ApprovalAnalyticsPage />} />
            <Route path="/analytics/fulfillment" element={<FulfillmentAnalyticsPage />} />
            <Route path="/analytics/subscription" element={<SubscriptionAnalyticsPage />} />
            <Route path="/analytics/reports" element={<CustomReportsPage />} />
          </Route>

          {/* ─── WORKSPACE & SHARED ─── */}
          <Route path="/search" element={<GlobalSearchPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Alias / compatibility routes for direct entity links */}
          <Route path="/customers" element={<Navigate to="/business-admin/customers" replace />} />
          <Route path="/customers/create" element={<Navigate to="/business-admin/customers/create" replace />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />
          <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
          <Route path="/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Route>
      </Route>
    </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
