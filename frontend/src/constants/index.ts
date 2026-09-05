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
    section: 'PLATFORM (SUPER ADMIN)',
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
    roles: ['business_admin', 'super_admin'],
    items: [
      { label: 'Admin Dashboard', path: '/business-admin/dashboard', icon: 'LayoutDashboard' },
      { label: 'Users & Roles', path: '/business-admin/users', icon: 'Users' },
      { label: 'Customers', path: '/business-admin/customers', icon: 'Users' },
      { label: 'Products & Catalog', path: '/business-admin/products', icon: 'Package' },
      { label: 'Pricing & Price Lists', path: '/business-admin/pricing/lists', icon: 'DollarSign' },
      { label: 'Discount Rules', path: '/business-admin/discounts', icon: 'Percent' },
      { label: 'Approval Chains', path: '/business-admin/approvals', icon: 'CheckCircle2' },
      { label: 'Warehouses & Shipping', path: '/business-admin/warehouses', icon: 'Warehouse' },
      { label: 'Subscription Plans', path: '/business-admin/subscriptions', icon: 'RefreshCw' },
      { label: 'Deal Health Monitor', path: '/business-admin/deal-health', icon: 'HeartPulse' },
      { label: 'Audit Trail', path: '/business-admin/audit', icon: 'Shield' },
      { label: 'Company Profile', path: '/business-admin/organization/profile', icon: 'Settings' },
    ],
  },
  {
    section: 'SALES MANAGER',
    roles: ['sales_manager', 'business_admin', 'super_admin'],
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
    roles: ['sales_rep', 'sales_manager', 'business_admin', 'super_admin'],
    items: [
      { label: 'Sales Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Quotations', path: '/sales/quotations', icon: 'FileText' },
      { label: 'My Customers', path: '/sales/customers', icon: 'Users' },
      { label: 'My Deals', path: '/sales/deals', icon: 'FileText' },
    ],
  },
  {
    section: 'FINANCE & BILLING',
    roles: ['finance', 'business_admin', 'super_admin'],
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
    roles: ['operations', 'business_admin', 'super_admin'],
    items: [
      { label: 'Operations Dashboard', path: '/operations', icon: 'LayoutDashboard' },
      { label: 'Fulfillment Queue', path: '/operations/fulfillment', icon: 'Truck' },
      { label: 'Warehouses', path: '/operations/warehouses', icon: 'Warehouse' },
      { label: 'Inventory & Stock', path: '/operations/inventory', icon: 'Package' },
      { label: 'Shipment Tracking', path: '/operations/shipping', icon: 'Truck' },
      { label: 'Backorders Queue', path: '/operations/backorders', icon: 'Truck' },
    ],
  },
  {
    section: 'INTELLIGENCE',
    roles: ['sales_rep', 'sales_manager', 'finance', 'operations', 'business_admin', 'super_admin'],
    items: [
      { label: 'Intelligence Command', path: '/intelligence', icon: 'Sparkles' },
      { label: 'Risk Overview', path: '/intelligence/risks', icon: 'ShieldAlert' },
      { label: 'High Risk Deals', path: '/intelligence/risks/high', icon: 'ShieldAlert' },
      { label: 'Upsell Engine', path: '/intelligence/recommendations/upsell', icon: 'Sparkles' },
      { label: 'Cross-Sell Bundles', path: '/intelligence/recommendations/cross-sell', icon: 'Sparkles' },
      { label: 'Deal Health', path: '/intelligence/health', icon: 'HeartPulse' },
      { label: 'Stalled Deals', path: '/intelligence/health/stalled', icon: 'HeartPulse' },
      { label: 'Discount Anomalies', path: '/intelligence/anomalies/discount', icon: 'Percent' },
      { label: 'Delivery Slippage', path: '/intelligence/anomalies/delivery', icon: 'Truck' },
      { label: 'Decision Insights', path: '/intelligence/insights', icon: 'Sparkles' },
    ],
  },
  {
    section: 'ANALYTICS & BI',
    roles: ['sales_manager', 'finance', 'business_admin', 'super_admin'],
    items: [
      { label: 'Executive Dashboard', path: '/analytics/executive', icon: 'BarChart3' },
      { label: 'Sales Analytics', path: '/analytics/sales', icon: 'TrendingUp' },
      { label: 'Revenue Analytics', path: '/analytics/revenue', icon: 'DollarSign' },
      { label: 'Discount Analytics', path: '/analytics/discount', icon: 'Percent' },
      { label: 'Margin Analytics', path: '/analytics/margin', icon: 'BarChart3' },
      { label: 'Approval Analytics', path: '/analytics/approval', icon: 'CheckCircle2' },
      { label: 'Fulfillment Analytics', path: '/analytics/fulfillment', icon: 'Truck' },
      { label: 'Subscription Analytics', path: '/analytics/subscription', icon: 'RefreshCw' },
      { label: 'Custom Reports Hub', path: '/analytics/reports', icon: 'FileText' },
    ],
  },
  {
    section: 'CUSTOMER PORTAL',
    roles: ['customer'],
    items: [
      { label: 'Portal Dashboard', path: '/customer-portal', icon: 'LayoutDashboard' },
      { label: 'Portal Quotations', path: '/customer-portal/quotations', icon: 'FileText' },
      { label: 'Portal Orders', path: '/customer-portal/orders', icon: 'Package' },
      { label: 'Portal Shipments', path: '/customer-portal/shipments', icon: 'Truck' },
      { label: 'Portal Invoices', path: '/customer-portal/invoices', icon: 'CreditCard' },
      { label: 'Portal Subscriptions', path: '/customer-portal/subscriptions', icon: 'RefreshCw' },
    ],
  },
  {
    section: 'WORKSPACE',
    roles: ['sales_rep', 'sales_manager', 'finance', 'operations', 'business_admin', 'super_admin'],
    items: [
      { label: 'Global Search', path: '/search', icon: 'Sparkles' },
      { label: 'Notifications', path: '/notifications', icon: 'Bell' },
      { label: 'My Profile', path: '/profile', icon: 'User' },
      { label: 'Preferences', path: '/preferences', icon: 'SlidersHorizontal' },
      { label: 'Help Center', path: '/help', icon: 'HelpCircle' },
      { label: 'System Settings', path: '/settings', icon: 'Settings' },
    ],
  },
]
