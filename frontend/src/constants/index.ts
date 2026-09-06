export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning-subtle text-warning',
  approved: 'bg-success-subtle text-success',
  rejected: 'bg-danger-subtle text-danger',
  negotiation: 'bg-warning-subtle text-warning',
  confirmed: 'bg-info-subtle text-info',
  fulfillment: 'bg-info-subtle text-info',
  backorder: 'bg-warning-subtle text-warning',
  completed: 'bg-success-subtle text-success',
  failed: 'bg-danger-subtle text-danger',
}

export const RISK_COLORS: Record<string, string> = {
  low: 'bg-success-subtle text-success',
  medium: 'bg-warning-subtle text-warning',
  high: 'bg-danger-subtle text-danger',
  critical: 'bg-danger-subtle text-danger',
}

export const RISK_LABELS: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  fulfillment: 'Fulfillment',
  backorder: 'Backorder',
  completed: 'Completed',
  failed: 'Failed',
}

export interface NavItem {
  label: string
  path: string
  icon: string
  roles?: string[]
}

export interface NavSection {
  section: string
  roles?: string[]
  items: NavItem[]
}

export const SIDEBAR_NAV: NavSection[] = [
  {
    section: 'CUSTOMER PORTAL',
    roles: ['customer'],
    items: [
      { label: 'Overview', path: '/customer-portal/dashboard', icon: 'LayoutDashboard' },
      { label: 'Quotations', path: '/customer-portal/quotations', icon: 'FileText' },
      { label: 'Orders', path: '/customer-portal/orders', icon: 'Package' },
      { label: 'Shipments', path: '/customer-portal/shipments', icon: 'Truck' },
      { label: 'Invoices', path: '/customer-portal/invoices', icon: 'CreditCard' },
      { label: 'Subscriptions', path: '/customer-portal/subscriptions', icon: 'RefreshCw' },
      { label: 'Profile', path: '/customer-portal/account/profile', icon: 'User' },
      { label: 'Company', path: '/customer-portal/account/company', icon: 'Building2' },
      { label: 'Preferences', path: '/customer-portal/account/preferences', icon: 'SlidersHorizontal' },
    ],
  },
  {
    section: 'PLATFORM',
    roles: ['super_admin'],
    items: [
      { label: 'Platform Dashboard', path: '/platform/dashboard', icon: 'LayoutDashboard' },
      { label: 'All Businesses', path: '/platform/businesses', icon: 'Building2' },
      { label: 'Platform Users', path: '/platform/users', icon: 'Users' },
      { label: 'Platform Analytics', path: '/platform/analytics', icon: 'BarChart3' },
      { label: 'System Health', path: '/platform/health', icon: 'HeartPulse' },
      { label: 'Global Audit Trail', path: '/platform/audit', icon: 'Shield' },
      { label: 'Platform Settings', path: '/platform/settings', icon: 'Settings' },
    ],
  },
  {
    section: 'BUSINESS ADMIN',
    roles: ['business_admin'],
    items: [
      { label: 'Admin Dashboard', path: '/business-admin/dashboard', icon: 'LayoutDashboard' },
      { label: 'Company Profile', path: '/business-admin/organization/profile', icon: 'Building2' },
      { label: 'Users & Roles', path: '/business-admin/users', icon: 'Users' },
      { label: 'Customers', path: '/business-admin/customers', icon: 'Users' },
      { label: 'Products & Catalog', path: '/business-admin/products', icon: 'Package' },
      { label: 'Pricing & Price Lists', path: '/business-admin/pricing/lists', icon: 'IndianRupee' },
      { label: 'Discount Rules', path: '/business-admin/discounts', icon: 'Percent' },
      { label: 'Approval Chains', path: '/business-admin/approvals', icon: 'CheckCircle2' },
      { label: 'Warehouses & Shipping', path: '/business-admin/warehouses', icon: 'Warehouse' },
      { label: 'Subscription Plans', path: '/business-admin/subscriptions', icon: 'RefreshCw' },
      { label: 'Deal Health Monitor', path: '/business-admin/deal-health', icon: 'HeartPulse' },
      { label: 'Audit Trail', path: '/business-admin/audit', icon: 'Shield' },
      { label: 'Settings', path: '/business-admin/settings', icon: 'Settings' },
    ],
  },
  {
    section: 'SALES MANAGER',
    roles: ['sales_manager'],
    items: [
      { label: 'Manager Dashboard', path: '/sales-manager/dashboard', icon: 'LayoutDashboard' },
      { label: 'Approval Inbox', path: '/sales-manager/approvals', icon: 'Inbox' },
      { label: 'Team Deals', path: '/sales-manager/deals', icon: 'FileText' },
      { label: 'Team Performance', path: '/sales-manager/performance', icon: 'TrendingUp' },
      { label: 'Manager Deal Health', path: '/sales-manager/deal-health', icon: 'HeartPulse' },
      { label: 'Sales Reports', path: '/sales-manager/reports', icon: 'BarChart3' },
    ],
  },
  {
    section: 'SALES',
    roles: ['sales_rep'],
    items: [
      { label: 'Sales Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Quotations', path: '/sales/quotations', icon: 'FileText' },
      { label: 'My Deals', path: '/sales/deals', icon: 'FileText' },
      { label: 'My Customers', path: '/sales/customers', icon: 'Users' },
    ],
  },
  {
    section: 'FINANCE & BILLING',
    roles: ['finance'],
    items: [
      { label: 'Finance Dashboard', path: '/finance/dashboard', icon: 'LayoutDashboard' },
      { label: 'High-Risk Approvals', path: '/finance/approvals/high-risk', icon: 'ShieldAlert' },
      { label: 'Invoices', path: '/finance/billing/invoices', icon: 'Receipt' },
      { label: 'Payments', path: '/finance/billing/payments', icon: 'CreditCard' },
      { label: 'Failed Payments', path: '/finance/billing/failed', icon: 'CreditCard' },
      { label: 'Subscriptions', path: '/finance/subscriptions', icon: 'RefreshCw' },
      { label: 'Revenue Analytics', path: '/finance/analytics', icon: 'TrendingUp' },
      { label: 'Finance Audit', path: '/finance/audit', icon: 'Shield' },
    ],
  },
  {
    section: 'OPERATIONS & FULFILLMENT',
    roles: ['operations'],
    items: [
      { label: 'Operations Dashboard', path: '/operations', icon: 'LayoutDashboard' },
      { label: 'Fulfillment Queue', path: '/operations/fulfillment', icon: 'Truck' },
      { label: 'Warehouses', path: '/operations/warehouses', icon: 'Warehouse' },
      { label: 'Inventory & Stock', path: '/operations/inventory', icon: 'Package' },
      { label: 'Shipment Tracking', path: '/operations/shipping', icon: 'Truck' },
      { label: 'Backorders Queue', path: '/operations/backorders', icon: 'Truck' },
      { label: 'Operations Analytics', path: '/operations/analytics', icon: 'BarChart3' },
    ],
  },
  {
    section: 'INTELLIGENCE',
    roles: ['sales_manager'],
    items: [
      { label: 'Intelligence Command', path: '/intelligence', icon: 'Sparkles' },
      { label: 'Risk Overview', path: '/intelligence/risks', icon: 'ShieldAlert' },
      { label: 'High Risk Deals', path: '/intelligence/risks/high', icon: 'ShieldAlert' },
      { label: 'Upsell Engine', path: '/intelligence/recommendations/upsell', icon: 'Sparkles' },
      { label: 'Cross-Sell Bundles', path: '/intelligence/recommendations/cross-sell', icon: 'Sparkles' },
      { label: 'Deal Health', path: '/intelligence/health', icon: 'HeartPulse' },
      { label: 'Stalled Deals', path: '/intelligence/health/stalled', icon: 'HeartPulse' },
      { label: 'Decision Insights', path: '/intelligence/insights', icon: 'Sparkles' },
    ],
  },
  {
    section: 'ANALYTICS & BI',
    roles: ['sales_manager', 'finance', 'operations'],
    items: [
      { label: 'Executive Dashboard', path: '/analytics/executive', icon: 'BarChart3' },
      { label: 'Sales Analytics', path: '/analytics/sales', icon: 'TrendingUp' },
      { label: 'Revenue Analytics', path: '/analytics/revenue', icon: 'IndianRupee' },
      { label: 'Discount Analytics', path: '/analytics/discount', icon: 'Percent' },
      { label: 'Margin Analytics', path: '/analytics/margin', icon: 'BarChart3' },
      { label: 'Approval Analytics', path: '/analytics/approval', icon: 'CheckCircle2' },
      { label: 'Fulfillment Analytics', path: '/analytics/fulfillment', icon: 'Truck' },
      { label: 'Subscription Analytics', path: '/analytics/subscription', icon: 'RefreshCw' },
      { label: 'Custom Reports Hub', path: '/analytics/reports', icon: 'FileText' },
    ],
  },
]

