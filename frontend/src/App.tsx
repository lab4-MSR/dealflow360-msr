import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { GlobalSearchPage } from '@/pages/GlobalSearchPage'
import { NotificationCenterPage } from '@/pages/NotificationCenterPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { SettingsPage } from '@/pages/SettingsPage'

const ExecutiveDashboardPage = lazy(() => import('@/pages/analytics/ExecutiveDashboardPage').then(m => ({ default: m.ExecutiveDashboardPage })))
const SalesAnalyticsPage = lazy(() => import('@/pages/analytics/SalesAnalyticsPage').then(m => ({ default: m.SalesAnalyticsPage })))
const RevenueAnalyticsPage = lazy(() => import('@/pages/analytics/RevenueAnalyticsPage').then(m => ({ default: m.RevenueAnalyticsPage })))
const DiscountAnalyticsPage = lazy(() => import('@/pages/analytics/DiscountAnalyticsPage').then(m => ({ default: m.DiscountAnalyticsPage })))
const MarginAnalyticsPage = lazy(() => import('@/pages/analytics/MarginAnalyticsPage').then(m => ({ default: m.MarginAnalyticsPage })))
const ApprovalAnalyticsPage = lazy(() => import('@/pages/analytics/ApprovalAnalyticsPage').then(m => ({ default: m.ApprovalAnalyticsPage })))
const FulfillmentAnalyticsPage = lazy(() => import('@/pages/analytics/FulfillmentAnalyticsPage').then(m => ({ default: m.FulfillmentAnalyticsPage })))
const SubscriptionAnalyticsPage = lazy(() => import('@/pages/analytics/SubscriptionAnalyticsPage').then(m => ({ default: m.SubscriptionAnalyticsPage })))
const CustomerDashboardPage = lazy(() => import('@/pages/customer-portal/CustomerDashboardPage').then(m => ({ default: m.CustomerDashboardPage })))
const MyQuotationsPage = lazy(() => import('@/pages/customer-portal/MyQuotationsPage').then(m => ({ default: m.MyQuotationsPage })))
const QuotationDetailsPage = lazy(() => import('@/pages/customer-portal/QuotationDetailsPage').then(m => ({ default: m.QuotationDetailsPage })))
const ReviewQuotePage = lazy(() => import('@/pages/customer-portal/ReviewQuotePage').then(m => ({ default: m.ReviewQuotePage })))
const RequestChangesPage = lazy(() => import('@/pages/customer-portal/RequestChangesPage').then(m => ({ default: m.RequestChangesPage })))
const CounterOfferPage = lazy(() => import('@/pages/customer-portal/CounterOfferPage').then(m => ({ default: m.CounterOfferPage })))
const MyOrdersPage = lazy(() => import('@/pages/customer-portal/MyOrdersPage').then(m => ({ default: m.MyOrdersPage })))
const OrderDetailsPage = lazy(() => import('@/pages/customer-portal/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })))
const ShipmentListPage = lazy(() => import('@/pages/customer-portal/ShipmentListPage').then(m => ({ default: m.ShipmentListPage })))
const ShipmentDetailsPage = lazy(() => import('@/pages/customer-portal/ShipmentDetailsPage').then(m => ({ default: m.ShipmentDetailsPage })))
const InvoicesPage = lazy(() => import('@/pages/customer-portal/InvoicesPage').then(m => ({ default: m.InvoicesPage })))
const InvoiceDetailsPage = lazy(() => import('@/pages/customer-portal/InvoiceDetailsPage').then(m => ({ default: m.InvoiceDetailsPage })))
const MySubscriptionsPage = lazy(() => import('@/pages/customer-portal/MySubscriptionsPage').then(m => ({ default: m.MySubscriptionsPage })))
const SubscriptionDetailsPage = lazy(() => import('@/pages/customer-portal/SubscriptionDetailsPage').then(m => ({ default: m.SubscriptionDetailsPage })))
const CustomerProfilePage = lazy(() => import('@/pages/customer-portal/CustomerProfilePage').then(m => ({ default: m.CustomerProfilePage })))
const CustomerCompanyPage = lazy(() => import('@/pages/customer-portal/CustomerCompanyPage').then(m => ({ default: m.CustomerCompanyPage })))
const CustomerPreferencesPage = lazy(() => import('@/pages/customer-portal/CustomerPreferencesPage').then(m => ({ default: m.CustomerPreferencesPage })))
const CustomReportsPage = lazy(() => import('@/pages/analytics/CustomReportsPage').then(m => ({ default: m.CustomReportsPage })))

export function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="search" element={<GlobalSearchPage />} />
        <Route path="notifications" element={<NotificationCenterPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="help" element={<HelpCenterPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="analytics/dashboard" element={<Suspense fallback={null}><ExecutiveDashboardPage /></Suspense>} />
        <Route path="analytics/sales" element={<Suspense fallback={null}><SalesAnalyticsPage /></Suspense>} />
        <Route path="analytics/revenue" element={<Suspense fallback={null}><RevenueAnalyticsPage /></Suspense>} />
        <Route path="analytics/discounts" element={<Suspense fallback={null}><DiscountAnalyticsPage /></Suspense>} />
        <Route path="analytics/margin" element={<Suspense fallback={null}><MarginAnalyticsPage /></Suspense>} />
        <Route path="analytics/approvals" element={<Suspense fallback={null}><ApprovalAnalyticsPage /></Suspense>} />
        <Route path="analytics/fulfillment" element={<Suspense fallback={null}><FulfillmentAnalyticsPage /></Suspense>} />
        <Route path="analytics/subscriptions" element={<Suspense fallback={null}><SubscriptionAnalyticsPage /></Suspense>} />
        <Route path="customer-portal" element={<Suspense fallback={null}><CustomerDashboardPage /></Suspense>} />
        <Route path="customer-portal/quotations" element={<Suspense fallback={null}><MyQuotationsPage /></Suspense>} />
        <Route path="customer-portal/quotations/:id" element={<Suspense fallback={null}><QuotationDetailsPage /></Suspense>} />
        <Route path="customer-portal/quotations/:id/request-changes" element={<Suspense fallback={null}><RequestChangesPage /></Suspense>} />
        <Route path="customer-portal/quotations/:id/counter-offer" element={<Suspense fallback={null}><CounterOfferPage /></Suspense>} />
        <Route path="customer-portal/review/:id" element={<Suspense fallback={null}><ReviewQuotePage /></Suspense>} />
        <Route path="customer-portal/orders" element={<Suspense fallback={null}><MyOrdersPage /></Suspense>} />
        <Route path="customer-portal/orders/:id" element={<Suspense fallback={null}><OrderDetailsPage /></Suspense>} />
        <Route path="customer-portal/shipments" element={<Suspense fallback={null}><ShipmentListPage /></Suspense>} />
        <Route path="customer-portal/shipments/:id" element={<Suspense fallback={null}><ShipmentDetailsPage /></Suspense>} />
        <Route path="customer-portal/invoices" element={<Suspense fallback={null}><InvoicesPage /></Suspense>} />
        <Route path="customer-portal/invoices/:id" element={<Suspense fallback={null}><InvoiceDetailsPage /></Suspense>} />
        <Route path="customer-portal/subscriptions" element={<Suspense fallback={null}><MySubscriptionsPage /></Suspense>} />
        <Route path="customer-portal/subscriptions/:id" element={<Suspense fallback={null}><SubscriptionDetailsPage /></Suspense>} />
        <Route path="customer-portal/profile" element={<Suspense fallback={null}><CustomerProfilePage /></Suspense>} />
        <Route path="customer-portal/company" element={<Suspense fallback={null}><CustomerCompanyPage /></Suspense>} />
        <Route path="customer-portal/preferences" element={<Suspense fallback={null}><CustomerPreferencesPage /></Suspense>} />
        <Route path="analytics/reports" element={<Suspense fallback={null}><CustomReportsPage /></Suspense>} />
      </Route>
    </Routes>
  )
}

