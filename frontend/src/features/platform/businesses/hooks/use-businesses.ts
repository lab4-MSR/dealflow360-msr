import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  BusinessListFilters,
  CreateBusinessInput,
  BusinessUserFilters,
  BusinessDealFilters,
  RevenuePeriod,
} from '../types'
import {
  fetchBusinesses,
  fetchBusinessKpis,
  fetchBusinessById,
  fetchBusinessPerformance,
  fetchBusinessActivity,
  fetchBusinessDealTrend,
  fetchBusinessRevenueTrend,
  createBusiness,
  updateBusinessStatus,
  bulkAction,
  fetchBusinessUsers,
  fetchBusinessUserKpis,
  fetchBusinessDeals,
  fetchBusinessDealKpis,
  fetchBusinessRevenueKpis,
  fetchBusinessRevenueTrendData,
  fetchBusinessRevenueBreakdown,
  fetchBusinessRevenueByProduct,
  fetchBusinessRevenueByCustomer,
  fetchBusinessRevenueTransactions,
  fetchBusinessUsageOverview,
  fetchBusinessUserActivity,
  fetchBusinessDealUsage,
  fetchBusinessFeatureUsage,
  fetchBusinessUsageTrend,
  fetchBusinessHealthScore,
  fetchBusinessActivityHealth,
  fetchBusinessPerformanceIndicators,
  fetchBusinessRiskIndicators,
  fetchBusinessHealthAlerts,
  fetchBusinessConfiguration,
  updateBusinessConfiguration,
} from '../services/business'

export function useBusinesses(filters: BusinessListFilters) {
  return useQuery({
    queryKey: ['platform-businesses', filters],
    queryFn: () => fetchBusinesses(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBusinessKpis() {
  return useQuery({
    queryKey: ['platform-business-kpis'],
    queryFn: fetchBusinessKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBusinessDetail(id: string) {
  return useQuery({
    queryKey: ['platform-business', id],
    queryFn: () => fetchBusinessById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessPerformance(id: string) {
  return useQuery({
    queryKey: ['platform-business-performance', id],
    queryFn: () => fetchBusinessPerformance(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessActivity(id: string) {
  return useQuery({
    queryKey: ['platform-business-activity', id],
    queryFn: () => fetchBusinessActivity(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessDealTrend(id: string) {
  return useQuery({
    queryKey: ['platform-business-deal-trend', id],
    queryFn: () => fetchBusinessDealTrend(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueTrend(id: string) {
  return useQuery({
    queryKey: ['platform-business-revenue-trend', id],
    queryFn: () => fetchBusinessRevenueTrend(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBusinessInput) => createBusiness(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] })
      queryClient.invalidateQueries({ queryKey: ['platform-business-kpis'] })
    },
  })
}

export function useUpdateBusinessStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      updateBusinessStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] })
      queryClient.invalidateQueries({ queryKey: ['platform-business-kpis'] })
    },
  })
}

export function useBulkAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: 'activate' | 'suspend' | 'export' }) =>
      bulkAction(ids, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-businesses'] })
      queryClient.invalidateQueries({ queryKey: ['platform-business-kpis'] })
    },
  })
}

// ─── Business Users Hooks ─────────────────────────────────

export function useBusinessUsers(id: string, filters: BusinessUserFilters) {
  return useQuery({
    queryKey: ['platform-business-users', id, filters],
    queryFn: () => fetchBusinessUsers(id, filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessUserKpis(id: string) {
  return useQuery({
    queryKey: ['platform-business-user-kpis', id],
    queryFn: () => fetchBusinessUserKpis(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// ─── Business Deals Hooks ─────────────────────────────────

export function useBusinessDeals(id: string, filters: BusinessDealFilters) {
  return useQuery({
    queryKey: ['platform-business-deals', id, filters],
    queryFn: () => fetchBusinessDeals(id, filters),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessDealKpis(id: string) {
  return useQuery({
    queryKey: ['platform-business-deal-kpis', id],
    queryFn: () => fetchBusinessDealKpis(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// ─── Business Revenue Hooks ───────────────────────────────

export function useBusinessRevenueKpis(id: string) {
  return useQuery({
    queryKey: ['platform-business-revenue-kpis', id],
    queryFn: () => fetchBusinessRevenueKpis(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueTrendData(id: string, period: RevenuePeriod) {
  return useQuery({
    queryKey: ['platform-business-revenue-trend-data', id, period],
    queryFn: () => fetchBusinessRevenueTrendData(id, period),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueBreakdown(id: string) {
  return useQuery({
    queryKey: ['platform-business-revenue-breakdown', id],
    queryFn: () => fetchBusinessRevenueBreakdown(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueByProduct(id: string) {
  return useQuery({
    queryKey: ['platform-business-revenue-by-product', id],
    queryFn: () => fetchBusinessRevenueByProduct(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueByCustomer(id: string) {
  return useQuery({
    queryKey: ['platform-business-revenue-by-customer', id],
    queryFn: () => fetchBusinessRevenueByCustomer(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRevenueTransactions(id: string, page: number, perPage = 10) {
  return useQuery({
    queryKey: ['platform-business-revenue-transactions', id, page, perPage],
    queryFn: () => fetchBusinessRevenueTransactions(id, page, perPage),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// ─── Business Usage Hooks ─────────────────────────────────

export function useBusinessUsageOverview(id: string) {
  return useQuery({
    queryKey: ['platform-business-usage-overview', id],
    queryFn: () => fetchBusinessUsageOverview(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessUserActivity(id: string) {
  return useQuery({
    queryKey: ['platform-business-user-activity', id],
    queryFn: () => fetchBusinessUserActivity(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessDealUsage(id: string) {
  return useQuery({
    queryKey: ['platform-business-deal-usage', id],
    queryFn: () => fetchBusinessDealUsage(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessFeatureUsage(id: string) {
  return useQuery({
    queryKey: ['platform-business-feature-usage', id],
    queryFn: () => fetchBusinessFeatureUsage(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessUsageTrend(id: string, days = 30) {
  return useQuery({
    queryKey: ['platform-business-usage-trend', id, days],
    queryFn: () => fetchBusinessUsageTrend(id, days),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// ─── Business Health Hooks ────────────────────────────────

export function useBusinessHealthScore(id: string) {
  return useQuery({
    queryKey: ['platform-business-health-score', id],
    queryFn: () => fetchBusinessHealthScore(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessActivityHealth(id: string) {
  return useQuery({
    queryKey: ['platform-business-activity-health', id],
    queryFn: () => fetchBusinessActivityHealth(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessPerformanceIndicators(id: string) {
  return useQuery({
    queryKey: ['platform-business-performance-indicators', id],
    queryFn: () => fetchBusinessPerformanceIndicators(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessRiskIndicators(id: string) {
  return useQuery({
    queryKey: ['platform-business-risk-indicators', id],
    queryFn: () => fetchBusinessRiskIndicators(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useBusinessHealthAlerts(id: string) {
  return useQuery({
    queryKey: ['platform-business-health-alerts', id],
    queryFn: () => fetchBusinessHealthAlerts(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

// ─── Business Configuration Hooks ─────────────────────────

export function useBusinessConfiguration(id: string) {
  return useQuery({
    queryKey: ['platform-business-configuration', id],
    queryFn: () => fetchBusinessConfiguration(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useUpdateBusinessConfiguration(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: Parameters<typeof updateBusinessConfiguration>[1]) =>
      updateBusinessConfiguration(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-business-configuration', id] })
    },
  })
}
