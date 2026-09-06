import type { PlatformDashboardData, ApiResponse } from '../types'

const EMPTY_DASHBOARD_DATA: PlatformDashboardData = {
  kpis: {
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalUsers: 0,
    totalDeals: 0,
    totalRevenue: 0,
    platformHealth: 'healthy',
    currency: 'INR',
  },
  businessOverview: {
    total: 0,
    active: 0,
    suspended: 0,
    pendingSetup: 0,
    newThisPeriod: 0,
    growthTrend: [],
  },
  dealOverview: {
    total: 0,
    pendingApprovals: 0,
    highRisk: 0,
    completed: 0,
    trend: [],
  },
  revenueOverview: {
    total: 0,
    currency: 'INR',
    trend: [],
    byBusiness: [],
  },
  recentActivity: [],
  systemHealth: {
    overallStatus: 'healthy',
    uptimePercent: 99.9,
    services: [
      { name: 'API Server', status: 'healthy', latencyMs: 25, lastChecked: new Date().toISOString() },
      { name: 'Database', status: 'healthy', latencyMs: 15, lastChecked: new Date().toISOString() },
      { name: 'Storage', status: 'healthy', latencyMs: 30, lastChecked: new Date().toISOString() },
    ],
  },
  alerts: [],
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
  } catch (err) {
    console.error('Failed to fetch platform dashboard:', err)
    return EMPTY_DASHBOARD_DATA
  }
}
