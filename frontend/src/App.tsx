import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { CustomerPortalLayout } from '@/layouts/CustomerPortalLayout'
import { ProtectedRoute, GuestRoute } from '@/routes/guards'

// Auth Pages (00. Public / Auth)
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
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

export function App() {
  return (
    <Routes>
      {/* ─── PUBLIC ERROR ROUTES ─── */}
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/system-error" element={<SystemErrorPage />} />

      {/* ─── GUEST AUTH ROUTES ─── */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
      </Route>

      {/* ─── PROTECTED APPLICATION ROUTES ─── */}
      <Route element={<ProtectedRoute />}>
        {/* Customer Portal Layout Routes (08.x) */}
        <Route element={<CustomerPortalLayout />}>
          <Route path="/customer-portal" element={<CustomerDashboardPage />} />
          <Route path="/customer-portal/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/customer-portal/quotations" element={<CustomerMyQuotationsPage />} />
          <Route path="/customer-portal/quotations/:id" element={<CustomerQuotationDetailsPage />} />
          <Route path="/customer-portal/review/:id" element={<ReviewQuotePage />} />
          <Route path="/customer-portal/counter-offer/:id" element={<CounterOfferPage />} />
          <Route path="/customer-portal/request-changes/:id" element={<RequestChangesPage />} />
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

        {/* Internal Enterprise Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          {/* Main Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Sales (03.x) */}
          <Route path="/sales/customers" element={<MyCustomersPage />} />
          <Route path="/sales/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/sales/deals" element={<MyDealsPage />} />
          <Route path="/sales/deals/:id" element={<DealDetailsPage />} />
          <Route path="/sales/deals/:id/timeline" element={<DealTimelinePage />} />
          <Route path="/sales/deals/:id/health" element={<DealHealthPage />} />
          <Route path="/sales/quotations" element={<AllQuotationsPage />} />
          <Route path="/sales/quotations/create" element={<CreateQuotationPage />} />
          <Route path="/sales/quotations/:id" element={<QuotationDetailsPage />} />
          <Route path="/sales/quotations/:id/builder" element={<QuotationBuilderPage />} />

          {/* Sales Manager (04.x) */}
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

          {/* Operations (06.x) */}
          <Route path="/operations" element={<OperationsDashboardPage />} />
          <Route path="/operations/fulfillment" element={<FulfillmentQueuePage />} />
          <Route path="/operations/fulfillment/:fulfillmentId" element={<FulfillmentDetailsPage />} />
          <Route path="/operations/shipments/:shipmentId" element={<ShipmentDetailsPage />} />
          <Route path="/operations/warehouses" element={<WarehouseOverviewPage />} />
          <Route path="/operations/inventory" element={<InventoryPage />} />
          <Route path="/operations/inventory/movements" element={<StockMovementsPage />} />
          <Route path="/operations/allocation/:orderId" element={<AllocationPage />} />
          <Route path="/operations/backorders" element={<BackorderQueuePage />} />
          <Route path="/operations/backorders/:backorderId" element={<BackorderDetailsPage />} />
          <Route path="/operations/shipping" element={<ShipmentTrackingPage />} />
          <Route path="/operations/analytics" element={<OperationsAnalyticsPage />} />

          {/* Intelligence (07.x) */}
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

          {/* Workspace & Shared */}
          <Route path="/search" element={<GlobalSearchPage />} />
          <Route path="/notifications" element={<NotificationCenterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
