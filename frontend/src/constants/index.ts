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
      { label: 'Quotations', path: '/quotations', icon: 'FileText' },
      { label: 'Customers', path: '/customers', icon: 'Users' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Fulfillment', path: '/fulfillment', icon: 'Truck' },
      { label: 'Warehouses', path: '/warehouses', icon: 'Warehouse' },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      { label: 'Billing', path: '/billing', icon: 'CreditCard' },
    ],
  },
  {
    section: 'ANALYTICS',
    items: [
      { label: 'Reports', path: '/reports', icon: 'BarChart3' },
      { label: 'Deal Health', path: '/deal-health', icon: 'HeartPulse' },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { label: 'Users', path: '/admin/users', icon: 'UserCog' },
      { label: 'Rules', path: '/admin/rules', icon: 'SlidersHorizontal' },
      { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
    ],
  },
]
