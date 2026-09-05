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

export const SIDEBAR_NAV = [
  {
    section: 'SALES',
    items: [
      { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
      { label: 'Quotations', path: '/sales/quotations', icon: 'FileText' },
      { label: 'Customers', path: '/sales/customers', icon: 'Users' },
      { label: 'Deals', path: '/sales/deals', icon: 'FileText' },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { label: 'Intelligence Command', path: '/intelligence', icon: 'Sparkles' },
      { label: 'Risk Overview', path: '/intelligence/risks', icon: 'ShieldAlert' },
      { label: 'High Risk Deals', path: '/intelligence/risks/high', icon: 'ShieldAlert' },
      { label: 'Upsell Engine', path: '/intelligence/recommendations/upsell', icon: 'Sparkles' },
      { label: 'Cross-Sell Bundles', path: '/intelligence/recommendations/cross-sell', icon: 'Sparkles' },
      { label: 'Deal Health', path: '/intelligence/health', icon: 'HeartPulse' },
      { label: 'Stalled Deals', path: '/intelligence/health/stalled', icon: 'HeartPulse' },
      { label: 'Discount Anomalies', path: '/intelligence/anomalies/discount', icon: 'ShieldAlert' },
      { label: 'Delivery Slippage', path: '/intelligence/anomalies/delivery', icon: 'Truck' },
      { label: 'Decision Insights', path: '/intelligence/insights', icon: 'Sparkles' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Operations Dashboard', path: '/operations', icon: 'BarChart3' },
      { label: 'Fulfillment Queue', path: '/operations/fulfillment', icon: 'Truck' },
      { label: 'Warehouses', path: '/operations/warehouses', icon: 'Warehouse' },
      { label: 'Inventory', path: '/operations/inventory', icon: 'Warehouse' },
      { label: 'Shipment Tracking', path: '/operations/shipping', icon: 'Truck' },
      { label: 'Backorders', path: '/operations/backorders', icon: 'Truck' },
    ],
  },
  {
    section: 'CUSTOMER PORTAL',
    items: [
      { label: 'Portal Dashboard', path: '/customer-portal', icon: 'LayoutDashboard' },
      { label: 'Portal Quotations', path: '/customer-portal/quotations', icon: 'FileText' },
      { label: 'Portal Shipments', path: '/customer-portal/shipments', icon: 'Truck' },
      { label: 'Portal Invoices', path: '/customer-portal/invoices', icon: 'CreditCard' },
      { label: 'Portal Subscriptions', path: '/customer-portal/subscriptions', icon: 'RefreshCw' },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { label: 'Settings', path: '/settings', icon: 'Settings' },
    ],
  },
]
