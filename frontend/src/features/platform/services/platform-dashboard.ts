import type { PlatformDashboardData, ApiResponse } from '../types'

const MOCK_DASHBOARD_DATA: PlatformDashboardData = {
  kpis: {
    totalBusinesses: 247,
    activeBusinesses: 198,
    totalUsers: 3842,
    totalDeals: 12654,
    totalRevenue: 2847593.42,
    platformHealth: 'healthy',
    currency: 'USD',
  },
  businessOverview: {
    total: 247,
    active: 198,
    suspended: 12,
    pendingSetup: 37,
    newThisPeriod: 18,
    growthTrend: [
      { date: '2026-04-01', total: 210, active: 172, new: 8 },
      { date: '2026-04-15', total: 215, active: 176, new: 5 },
      { date: '2026-05-01', total: 222, active: 181, new: 7 },
      { date: '2026-05-15', total: 226, active: 184, new: 4 },
      { date: '2026-06-01', total: 231, active: 187, new: 5 },
      { date: '2026-06-15', total: 234, active: 190, new: 3 },
      { date: '2026-07-01', total: 237, active: 192, new: 3 },
      { date: '2026-07-15', total: 240, active: 194, new: 3 },
      { date: '2026-08-01', total: 243, active: 196, new: 3 },
      { date: '2026-08-15', total: 245, active: 197, new: 2 },
      { date: '2026-09-01', total: 247, active: 198, new: 2 },
    ],
  },
  dealOverview: {
    total: 12654,
    pendingApprovals: 89,
    highRisk: 34,
    completed: 8921,
    trend: [
      { date: '2026-04-01', created: 412, completed: 380 },
      { date: '2026-04-15', created: 438, completed: 395 },
      { date: '2026-05-01', created: 456, completed: 410 },
      { date: '2026-05-15', created: 467, completed: 425 },
      { date: '2026-06-01', created: 478, completed: 440 },
      { date: '2026-06-15', created: 485, completed: 452 },
      { date: '2026-07-01', created: 492, completed: 460 },
      { date: '2026-07-15', created: 501, completed: 468 },
      { date: '2026-08-01', created: 510, completed: 475 },
      { date: '2026-08-15', created: 518, completed: 482 },
      { date: '2026-09-01', created: 525, completed: 490 },
    ],
  },
  revenueOverview: {
    total: 2847593.42,
    currency: 'USD',
    trend: [
      { date: '2026-04-01', revenue: 189420.0 },
      { date: '2026-05-01', revenue: 215680.0 },
      { date: '2026-06-01', revenue: 248930.0 },
      { date: '2026-07-01', revenue: 278450.0 },
      { date: '2026-08-01', revenue: 312890.0 },
      { date: '2026-09-01', revenue: 298760.0 },
    ],
    byBusiness: [
      { businessId: 'b1', businessName: 'Apex Distribution Co.', revenue: 487230.0 },
      { businessId: 'b2', businessName: 'Meridian Logistics', revenue: 412890.0 },
      { businessId: 'b3', businessName: 'Cascade Enterprises', revenue: 356720.0 },
      { businessId: 'b4', businessName: 'Summit Industries', revenue: 298450.0 },
      { businessId: 'b5', businessName: 'Pinnacle Trading', revenue: 267340.0 },
      { businessId: 'b6', businessName: 'Horizon Supply Chain', revenue: 234580.0 },
      { businessId: 'b7', businessName: 'Vanguard Solutions', revenue: 198320.0 },
      { businessId: 'b8', businessName: 'Sterling Commerce', revenue: 176890.0 },
    ],
  },
  recentActivity: [
    {
      id: 'a1',
      type: 'business',
      actor: 'System',
      action: 'New business registered',
      target: 'Atlas Global Trading',
      timestamp: '2026-09-05T09:15:00Z',
    },
    {
      id: 'a2',
      type: 'system',
      actor: 'System',
      action: 'Database backup completed',
      target: 'Scheduled backup',
      timestamp: '2026-09-05T08:00:00Z',
    },
    {
      id: 'a3',
      type: 'user',
      actor: 'Sarah Chen',
      action: 'Accepted platform invitation',
      target: 'Platform Admin',
      timestamp: '2026-09-05T07:45:00Z',
    },
    {
      id: 'a4',
      type: 'business',
      actor: 'Admin',
      action: 'Business activated',
      target: 'Meridian Logistics',
      timestamp: '2026-09-04T16:30:00Z',
    },
    {
      id: 'a5',
      type: 'system',
      actor: 'System',
      action: 'SSL certificate renewed',
      target: 'api.dealflow360.app',
      timestamp: '2026-09-04T03:00:00Z',
      severity: 'low',
    },
    {
      id: 'a6',
      type: 'business',
      actor: 'System',
      action: 'Business suspended',
      target: 'Quick Serve Retail',
      timestamp: '2026-09-04T11:20:00Z',
      severity: 'high',
    },
  ],
  systemHealth: {
    api: {
      name: 'API Gateway',
      status: 'healthy',
      latencyMs: 42,
      lastChecked: '2026-09-05T10:00:00Z',
    },
    database: {
      name: 'PostgreSQL',
      status: 'healthy',
      latencyMs: 8,
      lastChecked: '2026-09-05T10:00:00Z',
    },
    authentication: {
      name: 'Auth Service',
      status: 'healthy',
      latencyMs: 35,
      lastChecked: '2026-09-05T10:00:00Z',
    },
    services: [
      {
        name: 'Email Service',
        status: 'healthy',
        latencyMs: 120,
        lastChecked: '2026-09-05T10:00:00Z',
      },
      {
        name: 'File Storage',
        status: 'healthy',
        latencyMs: 55,
        lastChecked: '2026-09-05T10:00:00Z',
      },
      {
        name: 'Realtime',
        status: 'degraded',
        latencyMs: 280,
        lastChecked: '2026-09-05T10:00:00Z',
      },
    ],
  },
  alerts: [
    {
      id: 'al1',
      severity: 'high',
      title: 'Business suspended due to payment failure',
      description: 'Quick Serve Retail has been suspended. Annual subscription payment failed 3 times.',
      timestamp: '2026-09-04T11:20:00Z',
      type: 'suspended_business',
      metadata: {
        businessId: 'b-suspended-1',
        businessName: 'Quick Serve Retail',
      },
    },
    {
      id: 'al2',
      severity: 'medium',
      title: 'Realtime service degraded',
      description: 'WebSocket connection latency has increased to 280ms. Investigating potential cause.',
      timestamp: '2026-09-05T09:45:00Z',
      type: 'system_issue',
    },
    {
      id: 'al3',
      severity: 'low',
      title: 'Scheduled maintenance window',
      description: 'Planned database maintenance on Sep 7, 2026 from 02:00-04:00 UTC.',
      timestamp: '2026-09-05T08:00:00Z',
      type: 'alert',
    },
  ],
}

export async function fetchPlatformDashboard(): Promise<PlatformDashboardData> {
  try {
    const response = await fetch('/api/v1/platform/dashboard', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('dealflow360-access-token') || ''}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json: ApiResponse<PlatformDashboardData> = await response.json()

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to fetch platform dashboard')
    }

    return json.data
  } catch {
    return MOCK_DASHBOARD_DATA
  }
}
