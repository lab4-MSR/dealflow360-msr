import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  BusinessUserFilters,
  TeamFilters,
  InviteUserInput,
  CompanyProfileUpdate,
  BrandingUpdate,
  LocalizationUpdate,
  CurrencyTaxUpdate,
  BusinessSettingsUpdate,
  TaxRate,
  RoleFilters,
  CustomerFilters,
  CustomerCreateInput,
  ProductFilters,
  ProductCreateInput,
  CategoryFilters,
  PriceListFilters,
  PriceListCreateInput,
  VolumePricingFilters,
  PricingHistoryFilters,
  DiscountRuleFilters,
  DiscountRuleCreateInput,
  DiscountSimulatorRequest,
  CategoryDiscountRule,
  CustomerTierConfig,
  CustomerPricingOverride,
  VolumePricingTier,
  MarginRuleFilters,
  MarginSimulationRequest,
  ApprovalRuleFilters,
  ApprovalChainFilters,
  ApprovalSimulatorRequest,
  WarehouseFilters,
  WarehouseCreateInput,
  ShippingRuleFilters,
  ShippingRule,
  SubscriptionPlanFilters,
  SubscriptionPlan,
  BillingCycleFilters,
  BillingCycleCreateInput,
  ProrationRule,
  ProrationCalculationInput,
  CancellationRule,
  ReportFilters,
  DealHealthFilters,
  AuditFilters,
  NotificationSettings,
  SecuritySettings,
  IntegrationSettings,
  DataPrivacySettings,
} from '../types'
import {
  fetchDashboardKpis,
  fetchSalesOverview,
  fetchRevenueOverview,
  fetchApprovalOverview,
  fetchInventoryOverview,
  fetchDealHealth,
  fetchRecentDeals,
  fetchRecentActivity,
  fetchDashboardAlerts,
  fetchCompanyProfile,
  updateCompanyProfile,
  fetchBranding,
  updateBranding,
  resetBranding,
  fetchLocalization,
  updateLocalization,
  fetchCurrencyTax,
  updateCurrencyTax,
  addTaxRate,
  fetchBusinessSettings,
  updateBusinessSettings,
  fetchUsers,
  fetchUserKpis,
  fetchUserById,
  inviteUser,
  updateUser,
  deleteUser,
  fetchTeams,
  fetchTeamKpis,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchRoles,
  fetchRoleKpis,
  fetchRoleById,
  createRole,
  updateRole,
  updateRolePermissions,
  duplicateRole,
  deleteRole,
  fetchCustomers,
  fetchCustomerKpis,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchProducts,
  fetchProductKpis,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchCategoryTree,
  fetchCategoryKpis,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchPriceLists,
  fetchPriceListKpis,
  fetchPriceListById,
  createPriceList,
  updatePriceList,
  deletePriceList,
  fetchCustomerPricing,
  createCustomerPricingOverride,
  fetchVolumePricingRules,
  fetchVolumePricingKpis,
  createVolumePricingRule,
  updateVolumePricingRule,
  deleteVolumePricingRule,
  fetchPricingHistory,
  fetchDiscountRules,
  fetchDiscountRuleKpis,
  fetchDiscountRuleById,
  createDiscountRule,
  updateDiscountRule,
  deleteDiscountRule,
  fetchCustomerTiers,
  updateCustomerTier,
  simulateDiscount,
  fetchCategoryDiscountRules,
  fetchCategoryDiscountRuleKpis,
  createCategoryDiscountRule,
  updateCategoryDiscountRule,
  deleteCategoryDiscountRule,
  fetchMarginRules,
  fetchMarginRuleKpis,
  fetchMarginRuleById,
  createMarginRule,
  updateMarginRule,
  deleteMarginRule,
  simulateMargin,
  fetchApprovalRules,
  fetchApprovalRuleKpis,
  fetchApprovalRuleById,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  fetchApprovalChains,
  fetchApprovalChainKpis,
  fetchApprovalChainById,
  createApprovalChain,
  updateApprovalChain,
  deleteApprovalChain,
  fetchApprovalThresholds,
  updateApprovalThresholds,
  simulateApproval,
  fetchWarehouses,
  fetchWarehouseKpis,
  fetchWarehouseById,
  createWarehouse,
  updateWarehouse,
deleteWarehouse,
  fetchShippingRules,
  fetchShippingRuleKpis,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  fetchSubscriptionPlans,
  fetchSubscriptionPlanKpis,
  fetchSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  fetchBillingCycles,
  fetchBillingCycleKpis,
  fetchBillingCycleById,
  createBillingCycle,
  updateBillingCycle,
  deleteBillingCycle,
  fetchProrationRules,
  updateProrationRules,
  calculateProration,
  fetchCancellationRules,
  updateCancellationRules,
  fetchReportKpis,
  fetchSalesReport,
  fetchRevenueReport,
  fetchDiscountReport,
  fetchMarginReport,
  fetchApprovalReport,
  fetchFulfillmentReport,
  fetchDealHealthKpis,
  fetchDealHealthItems,
  fetchDealHealthItem,
  fetchDealAnomalies,
  fetchAuditKpis,
  fetchAuditEvents,
  fetchAuditEvent,
  fetchNotificationSettings,
  updateNotificationSettings,
  fetchSecuritySettings,
  updateSecuritySettings,
  fetchIntegrationSettings,
  updateIntegrationSettings,
  fetchDataPrivacySettings,
  updateDataPrivacySettings,
} from '../services/business-admin'
// ─── Dashboard Hooks ──────────────────────────────────────

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['ba-dashboard-kpis'],
    queryFn: fetchDashboardKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSalesOverview() {
  return useQuery({
    queryKey: ['ba-sales-overview'],
    queryFn: fetchSalesOverview,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRevenueOverview() {
  return useQuery({
    queryKey: ['ba-revenue-overview'],
    queryFn: fetchRevenueOverview,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalOverview() {
  return useQuery({
    queryKey: ['ba-approval-overview'],
    queryFn: fetchApprovalOverview,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInventoryOverview() {
  return useQuery({
    queryKey: ['ba-inventory-overview'],
    queryFn: fetchInventoryOverview,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDealHealth() {
  return useQuery({
    queryKey: ['ba-deal-health'],
    queryFn: fetchDealHealth,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentDeals() {
  return useQuery({
    queryKey: ['ba-recent-deals'],
    queryFn: fetchRecentDeals,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['ba-recent-activity'],
    queryFn: fetchRecentActivity,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDashboardAlerts() {
  return useQuery({
    queryKey: ['ba-dashboard-alerts'],
    queryFn: fetchDashboardAlerts,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Company Profile Hooks ────────────────────────────────

export function useCompanyProfile() {
  return useQuery({
    queryKey: ['ba-company-profile'],
    queryFn: fetchCompanyProfile,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompanyProfileUpdate) => updateCompanyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-company-profile'] })
    },
  })
}

// ─── Branding Hooks ───────────────────────────────────────

export function useBranding() {
  return useQuery({
    queryKey: ['ba-branding'],
    queryFn: fetchBranding,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateBranding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BrandingUpdate) => updateBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-branding'] })
    },
  })
}

export function useResetBranding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resetBranding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-branding'] })
    },
  })
}

// ─── Localization Hooks ───────────────────────────────────

export function useLocalization() {
  return useQuery({
    queryKey: ['ba-localization'],
    queryFn: fetchLocalization,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateLocalization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LocalizationUpdate) => updateLocalization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-localization'] })
    },
  })
}

// ─── Currency & Tax Hooks ─────────────────────────────────

export function useCurrencyTax() {
  return useQuery({
    queryKey: ['ba-currency-tax'],
    queryFn: fetchCurrencyTax,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateCurrencyTax() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CurrencyTaxUpdate) => updateCurrencyTax(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-currency-tax'] })
    },
  })
}

export function useAddTaxRate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rate: Omit<TaxRate, 'id'>) => addTaxRate(rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-currency-tax'] })
    },
  })
}

// ─── Business Settings Hooks ──────────────────────────────

export function useBusinessSettings() {
  return useQuery({
    queryKey: ['ba-settings'],
    queryFn: fetchBusinessSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BusinessSettingsUpdate) => updateBusinessSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-settings'] })
    },
  })
}

// ─── Users Hooks ──────────────────────────────────────────

export function useUsers(filters: BusinessUserFilters) {
  return useQuery({
    queryKey: ['ba-users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserKpis() {
  return useQuery({
    queryKey: ['ba-user-kpis'],
    queryFn: fetchUserKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: ['ba-user', id],
    queryFn: () => fetchUserById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: InviteUserInput) => inviteUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-users'] })
      queryClient.invalidateQueries({ queryKey: ['ba-user-kpis'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<import('../types').BusinessUser, 'role' | 'status' | 'teamId'>> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-users'] })
      queryClient.invalidateQueries({ queryKey: ['ba-user-kpis'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-users'] })
      queryClient.invalidateQueries({ queryKey: ['ba-user-kpis'] })
    },
  })
}

// ─── Teams Hooks ──────────────────────────────────────────

export function useTeams(filters: TeamFilters) {
  return useQuery({
    queryKey: ['ba-teams', filters],
    queryFn: () => fetchTeams(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeamKpis() {
  return useQuery({
    queryKey: ['ba-team-kpis'],
    queryFn: fetchTeamKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeamDetail(id: string) {
  return useQuery({
    queryKey: ['ba-team', id],
    queryFn: () => fetchTeamById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; leadId?: string }) => createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-teams'] })
      queryClient.invalidateQueries({ queryKey: ['ba-team-kpis'] })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<import('../types').Team, 'name' | 'description' | 'lead' | 'status'>> }) =>
      updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-teams'] })
      queryClient.invalidateQueries({ queryKey: ['ba-team-kpis'] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-teams'] })
      queryClient.invalidateQueries({ queryKey: ['ba-team-kpis'] })
    },
  })
}

// ─── Roles Hooks ──────────────────────────────────────────

export function useRoles(filters: RoleFilters) {
  return useQuery({
    queryKey: ['ba-roles', filters],
    queryFn: () => fetchRoles(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRoleKpis() {
  return useQuery({
    queryKey: ['ba-role-kpis'],
    queryFn: fetchRoleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRoleDetail(id: string) {
  return useQuery({
    queryKey: ['ba-role', id],
    queryFn: () => fetchRoleById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; displayName: string; description?: string }) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-roles'] })
      queryClient.invalidateQueries({ queryKey: ['ba-role-kpis'] })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<import('../types').Role, 'displayName' | 'description' | 'status'>> }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-roles'] })
      queryClient.invalidateQueries({ queryKey: ['ba-role-kpis'] })
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      updateRolePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-roles'] })
    },
  })
}

export function useDuplicateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; displayName: string } }) =>
      duplicateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-roles'] })
      queryClient.invalidateQueries({ queryKey: ['ba-role-kpis'] })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-roles'] })
      queryClient.invalidateQueries({ queryKey: ['ba-role-kpis'] })
    },
  })
}

// ─── Customers Hooks ──────────────────────────────────────

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ['ba-customers', filters],
    queryFn: () => fetchCustomers(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCustomerKpis() {
  return useQuery({
    queryKey: ['ba-customer-kpis'],
    queryFn: fetchCustomerKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: ['ba-customer', id],
    queryFn: () => fetchCustomerById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerCreateInput) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-customers'] })
      queryClient.invalidateQueries({ queryKey: ['ba-customer-kpis'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').Customer> }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-customers'] })
      queryClient.invalidateQueries({ queryKey: ['ba-customer-kpis'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-customers'] })
      queryClient.invalidateQueries({ queryKey: ['ba-customer-kpis'] })
    },
  })
}

// ─── Products Hooks ───────────────────────────────────────

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['ba-products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductKpis() {
  return useQuery({
    queryKey: ['ba-product-kpis'],
    queryFn: fetchProductKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['ba-product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductCreateInput) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-products'] })
      queryClient.invalidateQueries({ queryKey: ['ba-product-kpis'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').Product> }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-products'] })
      queryClient.invalidateQueries({ queryKey: ['ba-product-kpis'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-products'] })
      queryClient.invalidateQueries({ queryKey: ['ba-product-kpis'] })
    },
  })
}

// ─── Categories Hooks ─────────────────────────────────────

export function useCategories(filters: CategoryFilters) {
  return useQuery({
    queryKey: ['ba-categories', filters],
    queryFn: () => fetchCategories(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['ba-category-tree'],
    queryFn: fetchCategoryTree,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryKpis() {
  return useQuery({
    queryKey: ['ba-category-kpis'],
    queryFn: fetchCategoryKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; parentId?: string }) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-categories'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-tree'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-kpis'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<import('../types').Category, 'name' | 'description' | 'status' | 'sortOrder'>> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-categories'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-tree'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-kpis'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-categories'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-tree'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-kpis'] })
    },
  })
}

// ─── Price Lists Hooks ────────────────────────────────────

export function usePriceLists(filters: PriceListFilters) {
  return useQuery({
    queryKey: ['ba-price-lists', filters],
    queryFn: () => fetchPriceLists(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePriceListKpis() {
  return useQuery({
    queryKey: ['ba-price-list-kpis'],
    queryFn: fetchPriceListKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePriceListDetail(id: string) {
  return useQuery({
    queryKey: ['ba-price-list', id],
    queryFn: () => fetchPriceListById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreatePriceList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PriceListCreateInput) => createPriceList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-price-lists'] })
      queryClient.invalidateQueries({ queryKey: ['ba-price-list-kpis'] })
    },
  })
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').PriceList> }) =>
      updatePriceList(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-price-lists'] })
      queryClient.invalidateQueries({ queryKey: ['ba-price-list-kpis'] })
    },
  })
}

export function useDeletePriceList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePriceList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-price-lists'] })
      queryClient.invalidateQueries({ queryKey: ['ba-price-list-kpis'] })
    },
  })
}

// ─── Customer Pricing Hooks ───────────────────────────────

export function useCustomerPricing(customerId: string) {
  return useQuery({
    queryKey: ['ba-customer-pricing', customerId],
    queryFn: () => fetchCustomerPricing(customerId),
    staleTime: 5 * 60 * 1000,
    enabled: !!customerId,
  })
}

export function useCreateCustomerPricingOverride() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CustomerPricingOverride, 'id'>) => createCustomerPricingOverride(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-customer-pricing'] })
    },
  })
}

// ─── Volume Pricing Hooks ─────────────────────────────────

export function useVolumePricingRules(filters: VolumePricingFilters) {
  return useQuery({
    queryKey: ['ba-volume-pricing', filters],
    queryFn: () => fetchVolumePricingRules(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useVolumePricingKpis() {
  return useQuery({
    queryKey: ['ba-volume-pricing-kpis'],
    queryFn: fetchVolumePricingKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateVolumePricingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { productId: string; tiers: Omit<VolumePricingTier, 'id'>[] }) => createVolumePricingRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing'] })
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing-kpis'] })
    },
  })
}

export function useUpdateVolumePricingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { tiers?: Omit<VolumePricingTier, 'id'>[]; status?: string } }) =>
      updateVolumePricingRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing'] })
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing-kpis'] })
    },
  })
}

export function useDeleteVolumePricingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVolumePricingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing'] })
      queryClient.invalidateQueries({ queryKey: ['ba-volume-pricing-kpis'] })
    },
  })
}

// ─── Pricing History Hooks ────────────────────────────────

export function usePricingHistory(filters: PricingHistoryFilters) {
  return useQuery({
    queryKey: ['ba-pricing-history', filters],
    queryFn: () => fetchPricingHistory(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Discount Rules Hooks ─────────────────────────────────

export function useDiscountRules(filters: DiscountRuleFilters) {
  return useQuery({
    queryKey: ['ba-discount-rules', filters],
    queryFn: () => fetchDiscountRules(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscountRuleKpis() {
  return useQuery({
    queryKey: ['ba-discount-rule-kpis'],
    queryFn: fetchDiscountRuleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscountRuleDetail(id: string) {
  return useQuery({
    queryKey: ['ba-discount-rule', id],
    queryFn: () => fetchDiscountRuleById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DiscountRuleCreateInput) => createDiscountRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rule-kpis'] })
    },
  })
}

export function useUpdateDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').DiscountRule> }) =>
      updateDiscountRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rule-kpis'] })
    },
  })
}

export function useDeleteDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDiscountRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-discount-rule-kpis'] })
    },
  })
}

// ─── Customer Tiers Hooks ─────────────────────────────────

export function useCustomerTiers() {
  return useQuery({
    queryKey: ['ba-customer-tiers'],
    queryFn: fetchCustomerTiers,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateCustomerTier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerTierConfig> }) =>
      updateCustomerTier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-customer-tiers'] })
    },
  })
}

// ─── Discount Simulator Hooks ─────────────────────────────

export function useSimulateDiscount() {
  return useMutation({
    mutationFn: (data: DiscountSimulatorRequest) => simulateDiscount(data),
  })
}

// ─── Category Discount Rules Hooks ────────────────────────

export function useCategoryDiscountRules() {
  return useQuery({
    queryKey: ['ba-category-discount-rules'],
    queryFn: fetchCategoryDiscountRules,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCategoryDiscountRuleKpis() {
  return useQuery({
    queryKey: ['ba-category-discount-rule-kpis'],
    queryFn: fetchCategoryDiscountRuleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategoryDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CategoryDiscountRule, 'id' | 'createdAt' | 'updatedAt'>) => createCategoryDiscountRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rule-kpis'] })
    },
  })
}

export function useUpdateCategoryDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryDiscountRule> }) =>
      updateCategoryDiscountRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rule-kpis'] })
    },
  })
}

export function useDeleteCategoryDiscountRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategoryDiscountRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-category-discount-rule-kpis'] })
    },
  })
}

// ─── Margin Rules Hooks ───────────────────────────────────

export function useMarginRules(filters: MarginRuleFilters) {
  return useQuery({
    queryKey: ['ba-margin-rules', filters],
    queryFn: () => fetchMarginRules(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMarginRuleKpis() {
  return useQuery({
    queryKey: ['ba-margin-rule-kpis'],
    queryFn: fetchMarginRuleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMarginRuleDetail(id: string) {
  return useQuery({
    queryKey: ['ba-margin-rule', id],
    queryFn: () => fetchMarginRuleById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateMarginRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<import('../types').MarginRule, 'id' | 'createdAt' | 'updatedAt'>) => createMarginRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rule-kpis'] })
    },
  })
}

export function useUpdateMarginRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').MarginRule> }) =>
      updateMarginRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rule-kpis'] })
    },
  })
}

export function useDeleteMarginRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMarginRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-margin-rule-kpis'] })
    },
  })
}

export function useSimulateMargin() {
  return useMutation({
    mutationFn: (data: MarginSimulationRequest) => simulateMargin(data),
  })
}

// ─── Approval Rules Hooks ─────────────────────────────────

export function useApprovalRules(filters: ApprovalRuleFilters) {
  return useQuery({
    queryKey: ['ba-approval-rules', filters],
    queryFn: () => fetchApprovalRules(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalRuleKpis() {
  return useQuery({
    queryKey: ['ba-approval-rule-kpis'],
    queryFn: fetchApprovalRuleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalRuleDetail(id: string) {
  return useQuery({
    queryKey: ['ba-approval-rule', id],
    queryFn: () => fetchApprovalRuleById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<import('../types').ApprovalRule, 'id' | 'createdAt' | 'updatedAt'>) => createApprovalRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rule-kpis'] })
    },
  })
}

export function useUpdateApprovalRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').ApprovalRule> }) =>
      updateApprovalRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rule-kpis'] })
    },
  })
}

export function useDeleteApprovalRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApprovalRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-rule-kpis'] })
    },
  })
}

// ─── Approval Chains Hooks ────────────────────────────────

export function useApprovalChains(filters: ApprovalChainFilters) {
  return useQuery({
    queryKey: ['ba-approval-chains', filters],
    queryFn: () => fetchApprovalChains(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalChainKpis() {
  return useQuery({
    queryKey: ['ba-approval-chain-kpis'],
    queryFn: fetchApprovalChainKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalChainDetail(id: string) {
  return useQuery({
    queryKey: ['ba-approval-chain', id],
    queryFn: () => fetchApprovalChainById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateApprovalChain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<import('../types').ApprovalChain, 'id' | 'createdAt' | 'updatedAt'>) => createApprovalChain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chains'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chain-kpis'] })
    },
  })
}

export function useUpdateApprovalChain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').ApprovalChain> }) =>
      updateApprovalChain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chains'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chain-kpis'] })
    },
  })
}

export function useDeleteApprovalChain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApprovalChain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chains'] })
      queryClient.invalidateQueries({ queryKey: ['ba-approval-chain-kpis'] })
    },
  })
}

// ─── Approval Thresholds Hooks ────────────────────────────

export function useApprovalThresholds() {
  return useQuery({
    queryKey: ['ba-approval-thresholds'],
    queryFn: fetchApprovalThresholds,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateApprovalThresholds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<import('../types').ApprovalThresholds>) => updateApprovalThresholds(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-approval-thresholds'] })
    },
  })
}

// ─── Approval Simulator Hooks ─────────────────────────────

export function useSimulateApproval() {
  return useMutation({
    mutationFn: (data: ApprovalSimulatorRequest) => simulateApproval(data),
  })
}

// ─── Warehouse Hooks ──────────────────────────────────────

export function useWarehouses(filters: WarehouseFilters) {
  return useQuery({
    queryKey: ['ba-warehouses', filters],
    queryFn: () => fetchWarehouses(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useWarehouseKpis() {
  return useQuery({
    queryKey: ['ba-warehouse-kpis'],
    queryFn: fetchWarehouseKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWarehouseDetail(id: string) {
  return useQuery({
    queryKey: ['ba-warehouse', id],
    queryFn: () => fetchWarehouseById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WarehouseCreateInput) => createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-warehouses'] })
      queryClient.invalidateQueries({ queryKey: ['ba-warehouse-kpis'] })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../types').Warehouse> }) =>
      updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-warehouses'] })
      queryClient.invalidateQueries({ queryKey: ['ba-warehouse-kpis'] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-warehouses'] })
      queryClient.invalidateQueries({ queryKey: ['ba-warehouse-kpis'] })
    },
  })
}

export function useShippingRules(filters: ShippingRuleFilters = {}) {
  return useQuery({
    queryKey: ['ba-shipping-rules', filters],
    queryFn: () => fetchShippingRules(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useShippingRuleKpis() {
  return useQuery({
    queryKey: ['ba-shipping-rule-kpis'],
    queryFn: fetchShippingRuleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateShippingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<ShippingRule, 'id' | 'createdAt' | 'updatedAt'>) => createShippingRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rule-kpis'] })
    },
  })
}

export function useUpdateShippingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<ShippingRule, 'name' | 'description' | 'status' | 'priority' | 'allocationStrategy' | 'shippingMethod' | 'isDefault'>> }) =>
      updateShippingRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rule-kpis'] })
    },
  })
}

export function useDeleteShippingRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteShippingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rules'] })
      queryClient.invalidateQueries({ queryKey: ['ba-shipping-rule-kpis'] })
    },
  })
}

export function useSubscriptionPlans(filters: SubscriptionPlanFilters = {}) {
  return useQuery({
    queryKey: ['ba-subscription-plans', filters],
    queryFn: () => fetchSubscriptionPlans(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubscriptionPlanKpis() {
  return useQuery({
    queryKey: ['ba-subscription-plan-kpis'],
    queryFn: fetchSubscriptionPlanKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plan-kpis'] })
    },
  })
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<SubscriptionPlan, 'name' | 'description' | 'price' | 'billingCycle' | 'billingFrequency' | 'status' | 'features' | 'usageLimits'>> }) =>
      updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plan-kpis'] })
    },
  })
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plans'] })
      queryClient.invalidateQueries({ queryKey: ['ba-subscription-plan-kpis'] })
    },
  })
}

// --- Billing Cycles --------------------------------------

export function useBillingCycles(filters: BillingCycleFilters = {}) {
  return useQuery({
    queryKey: ["ba-billing-cycles", filters],
    queryFn: () => fetchBillingCycles(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useBillingCycleKpis() {
  return useQuery({
    queryKey: ["ba-billing-cycle-kpis"],
    queryFn: fetchBillingCycleKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useBillingCycle(id: string) {
  return useQuery({
    queryKey: ["ba-billing-cycle", id],
    queryFn: () => fetchBillingCycleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateBillingCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BillingCycleCreateInput) => createBillingCycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycles"] })
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycle-kpis"] })
    },
  })
}

export function useUpdateBillingCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BillingCycleCreateInput> }) => updateBillingCycle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycles"] })
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycle-kpis"] })
    },
  })
}

export function useDeleteBillingCycle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBillingCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycles"] })
      queryClient.invalidateQueries({ queryKey: ["ba-billing-cycle-kpis"] })
    },
  })
}

// --- Proration & Cancellation Rules ----------------------

export function useProrationRules() {
  return useQuery({
    queryKey: ["ba-proration-rules"],
    queryFn: fetchProrationRules,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProrationRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProrationRule> }) => updateProrationRules(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-proration-rules"] })
    },
  })
}

export function useCalculateProration() {
  return useMutation({
    mutationFn: (data: ProrationCalculationInput) => calculateProration(data),
  })
}

export function useCancellationRules() {
  return useQuery({
    queryKey: ["ba-cancellation-rules"],
    queryFn: fetchCancellationRules,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateCancellationRules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CancellationRule> }) => updateCancellationRules(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-cancellation-rules"] })
    },
  })
}

// --- Reports ---------------------------------------------

export function useReportKpis(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-report-kpis", filters],
    queryFn: () => fetchReportKpis(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSalesReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-sales-report", filters],
    queryFn: () => fetchSalesReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRevenueReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-revenue-report", filters],
    queryFn: () => fetchRevenueReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDiscountReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-discount-report", filters],
    queryFn: () => fetchDiscountReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMarginReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-margin-report", filters],
    queryFn: () => fetchMarginReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useApprovalReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-approval-report", filters],
    queryFn: () => fetchApprovalReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFulfillmentReport(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ["ba-fulfillment-report", filters],
    queryFn: () => fetchFulfillmentReport(filters),
    staleTime: 5 * 60 * 1000,
  })
}

// --- Deal Health -----------------------------------------

export function useDealHealthKpis() {
  return useQuery({
    queryKey: ["ba-deal-health-kpis"],
    queryFn: fetchDealHealthKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDealHealthItems(filters: DealHealthFilters = {}) {
  return useQuery({
    queryKey: ["ba-deal-health-items", filters],
    queryFn: () => fetchDealHealthItems(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useDealHealthItem(id: string) {
  return useQuery({
    queryKey: ["ba-deal-health-item", id],
    queryFn: () => fetchDealHealthItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDealAnomalies(id: string) {
  return useQuery({
    queryKey: ["ba-deal-anomalies", id],
    queryFn: () => fetchDealAnomalies(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// --- Audit Trail -----------------------------------------

export function useAuditKpis() {
  return useQuery({
    queryKey: ["ba-audit-kpis"],
    queryFn: fetchAuditKpis,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditEvents(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ["ba-audit-events", filters],
    queryFn: () => fetchAuditEvents(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAuditEvent(id: string) {
  return useQuery({
    queryKey: ["ba-audit-event", id],
    queryFn: () => fetchAuditEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// --- Notification Settings -------------------------------

export function useNotificationSettings() {
  return useQuery({
    queryKey: ["ba-notification-settings"],
    queryFn: fetchNotificationSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<NotificationSettings>) => updateNotificationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-notification-settings"] })
    },
  })
}

// --- Security Settings -----------------------------------

export function useSecuritySettings() {
  return useQuery({
    queryKey: ["ba-security-settings"],
    queryFn: fetchSecuritySettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SecuritySettings>) => updateSecuritySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-security-settings"] })
    },
  })
}

// --- Integration Settings --------------------------------

export function useIntegrationSettings() {
  return useQuery({
    queryKey: ["ba-integration-settings"],
    queryFn: fetchIntegrationSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateIntegrationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<IntegrationSettings>) => updateIntegrationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-integration-settings"] })
    },
  })
}

// --- Data Privacy Settings -------------------------------

export function useDataPrivacySettings() {
  return useQuery({
    queryKey: ["ba-data-privacy-settings"],
    queryFn: fetchDataPrivacySettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateDataPrivacySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<DataPrivacySettings>) => updateDataPrivacySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ba-data-privacy-settings"] })
    },
  })
}
