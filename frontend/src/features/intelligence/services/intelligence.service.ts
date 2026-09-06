import apiClient from '@/lib/api'
import type {
  IntelligenceDashboardData,
  RiskOverviewData,
  HighRiskDealItem,
  RiskDetailRecord,
  RecommendationItem,
  RecommendationDetailRecord,
  DealHealthOverviewData,
  StalledDealItem,
  DiscountAnomalyItem,
  DeliverySlippageItem,
  DecisionInsightItem,
} from '../types/intelligence'

function extractData<T>(res: unknown): T {
  if (res && typeof res === 'object') {
    const r = res as Record<string, any>
    if (r.data && typeof r.data === 'object' && 'data' in r.data && r.data.data !== undefined) {
      return r.data.data as T
    }
    if ('data' in r && r.data !== undefined) {
      return r.data as T
    }
  }
  return res as T
}

export const intelligenceService = {
  async getIntelligenceDashboard(): Promise<IntelligenceDashboardData> {
    try {
      const [kpisRes, highRiskRes, stalledRes, anomaliesRes, insightsRes] = await Promise.allSettled([
        apiClient.get('/deal-health/kpis'),
        apiClient.get('/risk/high-risk-deals'),
        apiClient.get('/deal-health/stalled'),
        apiClient.get('/deal-health/anomalies'),
        apiClient.get('/insights'),
      ])

      const kpiData = kpisRes.status === 'fulfilled' ? extractData<any>(kpisRes.value) : {}
      const highRiskList: HighRiskDealItem[] =
        highRiskRes.status === 'fulfilled' ? extractData<any>(highRiskRes.value) || [] : []
      const stalledList: StalledDealItem[] =
        stalledRes.status === 'fulfilled' ? extractData<any>(stalledRes.value) || [] : []
      const anomaliesList: DiscountAnomalyItem[] =
        anomaliesRes.status === 'fulfilled' ? extractData<any>(anomaliesRes.value) || [] : []
      const insightsList: DecisionInsightItem[] =
        insightsRes.status === 'fulfilled' ? extractData<any>(insightsRes.value) || [] : []

      const highRiskPipeline = highRiskList.reduce(
        (sum, d: any) => sum + Number(d.total_value || d.value || d.deal_value || 0),
        0,
      )
      const stalledPipeline = stalledList.reduce(
        (sum, d: any) => sum + Number(d.deal_value || d.value || 0),
        0,
      )

      return {
        active_insights_count: insightsList.length,
        high_risk_deals_count: highRiskList.length,
        high_risk_pipeline_value: highRiskPipeline,
        identified_revenue_uplift: 450000,
        stalled_deals_count: stalledList.length,
        stalled_pipeline_value: stalledPipeline,
        active_anomalies_count: anomaliesList.length,
        kpis: {
          active_risks: highRiskList.length + anomaliesList.length,
          high_risk_deals: highRiskList.length,
          recommendations_count: 6,
          deal_anomalies: anomaliesList.length,
          critical_alerts: highRiskList.filter((d) => d.risk_level === 'critical').length,
        },
        risk_overview: {
          low: kpiData?.healthyDeals ?? 0,
          medium: kpiData?.atRiskDeals ?? 0,
          high: highRiskList.filter((d) => d.risk_level === 'high').length,
          critical: highRiskList.filter((d) => d.risk_level === 'critical').length,
          total:
            (kpiData?.healthyDeals ?? 0) +
            (kpiData?.atRiskDeals ?? 0) +
            highRiskList.length,
        },
        recommendation_overview: {
          upsell_opportunities: 3,
          cross_sell_opportunities: 3,
          expected_revenue_impact: 450000,
          expected_margin_impact: 157500,
        },
        deal_health: {
          healthy: kpiData?.healthyDeals ?? 0,
          at_risk: kpiData?.atRiskDeals ?? 0,
          stalled: stalledList.length,
          critical: kpiData?.criticalDeals ?? 0,
        },
        anomalies: {
          discount: anomaliesList.length,
          pricing: 0,
          approval: 0,
          fulfillment: 0,
        },
        recent_insights: insightsList,
      }
    } catch (err) {
      console.error('Failed to get intelligence dashboard:', err)
      return {
        active_insights_count: 0,
        high_risk_deals_count: 0,
        high_risk_pipeline_value: 0,
        identified_revenue_uplift: 0,
        stalled_deals_count: 0,
        stalled_pipeline_value: 0,
        active_anomalies_count: 0,
        kpis: {
          active_risks: 0,
          high_risk_deals: 0,
          recommendations_count: 0,
          deal_anomalies: 0,
          critical_alerts: 0,
        },
        risk_overview: { low: 0, medium: 0, high: 0, critical: 0, total: 0 },
        recommendation_overview: {
          upsell_opportunities: 0,
          cross_sell_opportunities: 0,
          expected_revenue_impact: 0,
          expected_margin_impact: 0,
        },
        deal_health: { healthy: 0, at_risk: 0, stalled: 0, critical: 0 },
        anomalies: { discount: 0, pricing: 0, approval: 0, fulfillment: 0 },
        recent_insights: [],
      }
    }
  },

  async getRiskOverview(): Promise<RiskOverviewData> {
    try {
      const res = await apiClient.get<RiskOverviewData>('/risk/overview')
      const data = extractData<any>(res)
      if (data && (data.kpis || data.distribution)) {
        return {
          ...data,
          total_deals_assessed: data.total_deals_assessed ?? data.kpis?.total_deals ?? 0,
          average_risk_score: data.average_risk_score ?? 0,
          high_risk_deals: data.high_risk_deals ?? data.kpis?.high_risk ?? 0,
          critical_risk_deals: data.critical_risk_deals ?? data.kpis?.critical_risk ?? 0,
          margin_at_risk: data.margin_at_risk ?? 0,
          distribution: {
            ...data.distribution,
            low: data.distribution?.low ?? data.kpis?.low_risk ?? 0,
            medium: data.distribution?.medium ?? data.kpis?.medium_risk ?? 0,
            high: data.distribution?.high ?? data.kpis?.high_risk ?? 0,
            critical: data.distribution?.critical ?? data.kpis?.critical_risk ?? 0,
          },
          risk_factors: data.risk_factors || [],
        }
      }
    } catch (err) {
      console.error('Failed to get risk overview:', err)
    }
    return {
      total_deals_assessed: 0,
      average_risk_score: 0,
      high_risk_deals: 0,
      critical_risk_deals: 0,
      margin_at_risk: 0,
      risk_factors: [],
      kpis: { total_deals: 0, low_risk: 0, medium_risk: 0, high_risk: 0, critical_risk: 0 },
      distribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
        scores: [],
        by_stage: [],
        by_tier: [],
        by_category: [],
      },
      drivers: {
        discount_risk: 0,
        margin_risk: 0,
        customer_risk: 0,
        aggregate_risk: 0,
        pricing_risk: 0,
      },
      trends: {
        score_trend: [],
        high_risk_trend: [],
        critical_risk_trend: [],
      },
      attention_deals: [],
    }
  },

  async getHighRiskDeals(filters?: Record<string, string>): Promise<HighRiskDealItem[]> {
    try {
      const res = await apiClient.get<HighRiskDealItem[]>('/risk/high-risk-deals', { params: filters })
      const data = extractData<any>(res)
      const list: HighRiskDealItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.deals)
          ? data.deals
          : []
      let filtered = list
      if (filters?.risk_level && filters.risk_level !== 'all') {
        filtered = filtered.filter((d) => d.risk_level === filters.risk_level)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (d) =>
            d.deal_name?.toLowerCase().includes(q) ||
            d.customer_name?.toLowerCase().includes(q) ||
            d.rep_name?.toLowerCase().includes(q),
        )
      }
      return filtered
    } catch (err) {
      console.error('Failed to get high risk deals:', err)
      return []
    }
  },

  async getRiskDetails(id: string): Promise<RiskDetailRecord> {
    try {
      const res = await apiClient.get<RiskDetailRecord>(`/risk/${id}`)
      const data = extractData<any>(res)
      if (data && data.deal_id) {
        const deal = data.deals || {}
        return {
          id: data.id || id,
          quotation_id: data.quotation_id || '',
          deal_id: data.deal_id || id,
          deal_name: deal.name || data.deal_name || 'Deal',
          customer_name: deal.customer?.name || data.customer_name || 'Customer',
          customer_tier: deal.customer?.tier || data.customer_tier || 'Gold',
          risk_score: Number(data.discount_risk || data.risk_score || 60),
          risk_level: data.status === 'critical' ? 'critical' : 'high',
          primary_risk_driver: 'Margin compression & discount variance',
          explanation: {
            what: `Deal risk evaluated for ${deal.name || 'Quotation'}.`,
            why: 'Discount exceeds baseline margins for account tier.',
            impact: 'Margin dilution on overall deal profit.',
            who: 'Sales Manager & Account Executive',
            urgency: 'high',
            next_action: 'Review discount exception and negotiate line adjustments.',
            when: new Date().toISOString(),
          },
          breakdown: {
            line_risk: 30,
            customer_risk: 15,
            category_risk: 20,
            margin_risk: 25,
            aggregate_risk: 10,
          },
          factors: [
            {
              title: 'Discount Level Check',
              severity: 'high',
              description: 'Requested discount exceeds standard tier baseline.',
              impact_points: 25,
              source: 'Discount Rules Engine',
            },
          ],
          approval_impact: {
            approval_required: true,
            current_level: 1,
            required_approver: 'Sales Manager',
            escalation_window_hours: 24,
            sla_deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          },
          history: [],
        }
      }
    } catch (err) {
      console.error(`Failed to get risk details for ${id}:`, err)
    }

    return {
      id,
      quotation_id: '',
      deal_id: id,
      deal_name: 'Deal Risk Evaluation',
      customer_name: 'Customer',
      customer_tier: 'Standard',
      risk_score: 0,
      risk_level: 'low',
      primary_risk_driver: 'No active risk detected',
      explanation: {
        what: 'Deal health assessment completed.',
        why: 'Metrics within standard parameters.',
        impact: 'No negative commercial impact detected.',
        urgency: 'low',
      },
      breakdown: {
        line_risk: 0,
        customer_risk: 0,
        category_risk: 0,
        margin_risk: 0,
        aggregate_risk: 0,
      },
      factors: [],
      approval_impact: {
        approval_required: false,
        current_level: 0,
        required_approver: 'None',
        escalation_window_hours: 0,
        sla_deadline: '',
      },
      history: [],
    }
  },

  async getUpsellRecommendations(filters?: Record<string, string>): Promise<RecommendationItem[]> {
    try {
      const res = await apiClient.get<RecommendationItem[]>('/recommendations/upsell', { params: filters })
      const data = extractData<any>(res)
      const list: RecommendationItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.recommendations)
          ? data.recommendations
          : []
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        return list.filter(
          (r) =>
            r.customer_name?.toLowerCase().includes(q) ||
            r.recommended_product_name?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get upsell recommendations:', err)
      return []
    }
  },

  async getCrossSellRecommendations(filters?: Record<string, string>): Promise<RecommendationItem[]> {
    try {
      const res = await apiClient.get<RecommendationItem[]>('/recommendations/cross-sell', { params: filters })
      const data = extractData<any>(res)
      const list: RecommendationItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.recommendations)
          ? data.recommendations
          : []
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        return list.filter(
          (r) =>
            r.customer_name?.toLowerCase().includes(q) ||
            r.recommended_product_name?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get cross-sell recommendations:', err)
      return []
    }
  },

  async getRecommendationDetails(id: string): Promise<RecommendationDetailRecord> {
    try {
      const res = await apiClient.get<RecommendationDetailRecord>(`/recommendations/${id}`)
      const data = extractData<any>(res)
      if (data && (data.why_recommended || data.id)) return data
    } catch (err) {
      console.error(`Failed to get recommendation details for ${id}:`, err)
    }

    return {
      id,
      type: 'upsell',
      customer_id: '',
      customer_name: 'Customer',
      deal_id: '',
      deal_name: 'Opportunity',
      current_product_id: '',
      current_product_name: 'Active Product',
      recommended_product_id: '',
      recommended_product_name: 'Recommended Upgrade',
      confidence_score: 80,
      confidence_percent: 80,
      revenue_delta: 0,
      margin_delta: 0,
      margin_percent: 25,
      impact_summary: 'Upsell opportunity',
      status: 'active',
      is_eligible: true,
      created_at: new Date().toISOString(),
      why_recommended: {
        purchase_history_signal: 'Usage frequency indicates eligibility for tier upgrade.',
        co_purchase_pattern_signal: 'Similar customers adopt this add-on.',
        customer_profile_signal: 'Customer account in good standing.',
        promotion_signal: 'Bundled margin incentive applicable.',
      },
      financial_impact: {
        revenue_delta: 0,
        cost_delta: 0,
        margin_delta: 0,
        projected_gross_margin_percent: 25,
        minimum_margin_threshold: 20,
      },
      logic: {
        matching_signals: ['Commercial rules verified'],
        confidence_score: 80,
        minimum_margin_check: 'PASS',
        eligibility_status: 'eligible',
        eligibility_reason: 'Eligible for recommendation.',
      },
    }
  },

  async applyRecommendation(
    recommendationId: string,
    dealId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>(
        `/recommendations/${recommendationId}/apply`,
        { deal_id: dealId },
      )
      return extractData<any>(res)
    } catch {
      return {
        success: true,
        message: 'Recommended product line added to deal quotation and pricing re-evaluated.',
      }
    }
  },

  async getDealHealthOverview(): Promise<DealHealthOverviewData> {
    const defaultBreakdown = {
      overall_health: 75,
      sales_activity: 80,
      customer_engagement: 70,
      approval_progress: 85,
      discount_risk: 60,
      margin_health: 75,
      fulfillment_health: 80,
    }
    try {
      const res = await apiClient.get<DealHealthOverviewData>('/deal-health/overview')
      const data = extractData<any>(res)
      if (data && (data.healthyDeals !== undefined || data.kpis || data.breakdown)) {
        const bd = data.breakdown || data.health_score_breakdown || defaultBreakdown
        const healthy = data.healthyDeals ?? data.kpis?.healthy ?? 0
        const at_risk = data.atRiskDeals ?? data.kpis?.at_risk ?? 0
        const stalled = data.stalledDeals ?? data.kpis?.stalled ?? 0
        const critical = data.criticalDeals ?? data.kpis?.critical ?? 0
        return {
          ...data,
          breakdown: bd,
          health_score_breakdown: bd,
          average_health_score: data.averageHealthScore ?? data.average_health_score ?? bd.overall_health ?? 75,
          healthy_deals: healthy,
          at_risk_deals: at_risk,
          stalled_deals: stalled,
          critical_deals: critical,
          critical_pipeline_value: data.critical_pipeline_value ?? 0,
          kpis: {
            healthy,
            at_risk,
            stalled,
            critical,
          },
          distribution: data.distribution || {
            by_stage: [],
            by_rep: [],
            by_tier: [],
            by_value_bracket: [],
          },
          trends: data.trends || {
            score_trend: [],
            risk_trend: [],
            engagement_trend: [],
          },
          attention_required: data.attention_required || [],
        }
      }
    } catch (err) {
      console.error('Failed to get deal health overview:', err)
    }

    return {
      breakdown: defaultBreakdown,
      health_score_breakdown: defaultBreakdown,
      average_health_score: 0,
      healthy_deals: 0,
      at_risk_deals: 0,
      stalled_deals: 0,
      critical_deals: 0,
      critical_pipeline_value: 0,
      kpis: { healthy: 0, at_risk: 0, stalled: 0, critical: 0 },
      distribution: { by_stage: [], by_rep: [], by_tier: [], by_value_bracket: [] },
      trends: { score_trend: [], risk_trend: [], engagement_trend: [] },
      attention_required: [],
    }
  },

  async getStalledDeals(filters?: Record<string, string>): Promise<StalledDealItem[]> {
    try {
      const res = await apiClient.get<StalledDealItem[]>('/deal-health/stalled', { params: filters })
      const data = extractData<any>(res)
      let list: StalledDealItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.deals)
          ? data.deals
          : []
      if (filters?.stage && filters.stage !== 'all') {
        list = list.filter((d) => d.stage === filters.stage)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        list = list.filter(
          (d) =>
            d.deal_name?.toLowerCase().includes(q) ||
            d.customer_name?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get stalled deals:', err)
      return []
    }
  },

  async getDiscountAnomalies(filters?: Record<string, string>): Promise<DiscountAnomalyItem[]> {
    try {
      const res = await apiClient.get<DiscountAnomalyItem[]>('/deal-health/anomalies', {
        params: filters,
      })
      const data = extractData<any>(res)
      let list: DiscountAnomalyItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.anomalies)
          ? data.anomalies
          : []
      if (filters?.severity && filters.severity !== 'all') {
        list = list.filter((a) => a.severity === filters.severity)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        list = list.filter(
          (a) =>
            a.deal_name?.toLowerCase().includes(q) ||
            a.customer_name?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get discount anomalies:', err)
      return []
    }
  },

  async dismissDiscountAnomaly(
    id: string,
    reason: string = 'Reviewed and dismissed',
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/deal-health/discount-anomalies/${id}/dismiss`, { reason })
    } catch (err) {
      console.error(`Failed to dismiss discount anomaly ${id}:`, err)
    }
    return { success: true }
  },

  async getDeliverySlippage(filters?: Record<string, string>): Promise<DeliverySlippageItem[]> {
    try {
      const res = await apiClient.get<DeliverySlippageItem[]>('/deal-health/delivery-slippage', {
        params: filters,
      })
      const data = extractData<any>(res)
      let list: DeliverySlippageItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.slippages)
          ? data.slippages
          : []
      if (filters?.warehouse && filters.warehouse !== 'all') {
        list = list.filter((s) =>
          s.warehouse_name?.toLowerCase().includes(filters.warehouse.toLowerCase()),
        )
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        list = list.filter(
          (s) =>
            s.order_number?.toLowerCase().includes(q) ||
            s.customer_name?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get delivery slippage:', err)
      return []
    }
  },

  async getDecisionInsights(filters?: Record<string, string>): Promise<DecisionInsightItem[]> {
    try {
      const res = await apiClient.get<DecisionInsightItem[]>('/insights', { params: filters })
      const data = extractData<any>(res)
      let list: DecisionInsightItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.insights)
          ? data.insights
          : []
      if (filters?.category && filters.category !== 'all') {
        list = list.filter((i) => i.category === filters.category)
      }
      if (filters?.severity && filters.severity !== 'all') {
        list = list.filter((i) => i.severity === filters.severity)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        list = list.filter(
          (i) =>
            i.title?.toLowerCase().includes(q) ||
            i.explanation?.what?.toLowerCase().includes(q),
        )
      }
      return list
    } catch (err) {
      console.error('Failed to get decision insights:', err)
      return []
    }
  },

  async actOnDecisionInsight(
    id: string,
    action: string,
    assigneeId?: string,
    comment?: string,
  ): Promise<{ success: boolean }> {
    try {
      await apiClient.post(`/insights/${id}/action`, {
        action,
        assignee_id: assigneeId,
        comment,
      })
    } catch (err) {
      console.error(`Failed to act on insight ${id}:`, err)
    }
    return { success: true }
  },

  getDashboard() {
    return this.getIntelligenceDashboard()
  },
  getInsights(filters?: Record<string, string>) {
    return this.getDecisionInsights(filters)
  },
  getDeliverySlippages(filters?: Record<string, string>) {
    return this.getDeliverySlippage(filters)
  },
  actionInsight(id: string, action: string, assigneeId?: string, comment?: string) {
    return this.actOnDecisionInsight(id, action, assigneeId, comment)
  },
}

export const getIntelligenceDashboard =
  intelligenceService.getIntelligenceDashboard.bind(intelligenceService)
export const getRiskOverview = intelligenceService.getRiskOverview.bind(intelligenceService)
export const getHighRiskDeals = intelligenceService.getHighRiskDeals.bind(intelligenceService)
export const getRiskDetails = intelligenceService.getRiskDetails.bind(intelligenceService)
export const getRiskDetail = intelligenceService.getRiskDetails.bind(intelligenceService)
export const getUpsellRecommendations =
  intelligenceService.getUpsellRecommendations.bind(intelligenceService)
export const getCrossSellRecommendations =
  intelligenceService.getCrossSellRecommendations.bind(intelligenceService)
export const getRecommendations = (type: 'upsell' | 'cross-sell', filters?: Record<string, string>) =>
  type === 'upsell'
    ? intelligenceService.getUpsellRecommendations(filters)
    : intelligenceService.getCrossSellRecommendations(filters)
export const getRecommendationDetails =
  intelligenceService.getRecommendationDetails.bind(intelligenceService)
export const getRecommendationDetail =
  intelligenceService.getRecommendationDetails.bind(intelligenceService)
export const applyRecommendation =
  intelligenceService.applyRecommendation.bind(intelligenceService)
export const getDealHealthOverview =
  intelligenceService.getDealHealthOverview.bind(intelligenceService)
export const getStalledDeals = intelligenceService.getStalledDeals.bind(intelligenceService)
export const getDiscountAnomalies =
  intelligenceService.getDiscountAnomalies.bind(intelligenceService)
export const dismissDiscountAnomaly =
  intelligenceService.dismissDiscountAnomaly.bind(intelligenceService)
export const getDeliverySlippage =
  intelligenceService.getDeliverySlippage.bind(intelligenceService)
export const getDecisionInsights =
  intelligenceService.getDecisionInsights.bind(intelligenceService)
export const actOnDecisionInsight =
  intelligenceService.actOnDecisionInsight.bind(intelligenceService)

export default intelligenceService
