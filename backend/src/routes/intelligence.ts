import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/intelligence.controller';

const read = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance', 'sales_rep', 'super_admin', 'operations')] as const;
const write = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance', 'super_admin')] as const;

export const auditRouter = Router();
auditRouter.get('/', ...read, controller.listAudit);
auditRouter.get('/kpis', ...read, controller.auditKpis);
auditRouter.get('/:id', ...read, controller.getAudit);

export const dealHealthRouter = Router();
dealHealthRouter.get('/', ...read, controller.listDealHealth);
dealHealthRouter.get('/overview', ...read, controller.dealHealthKpis);
dealHealthRouter.get('/kpis', ...read, controller.dealHealthKpis);
dealHealthRouter.get('/stalled', ...read, controller.stalledDeals);
dealHealthRouter.get('/stalled-deals', ...read, controller.stalledDeals);
dealHealthRouter.get('/delivery-slippage', ...read, controller.deliverySlippage);
dealHealthRouter.get('/high-risk', ...read, controller.highRiskDeals);
dealHealthRouter.get('/anomalies', ...read, controller.listAnomalies);
dealHealthRouter.get('/discount-anomalies', ...read, controller.listAnomalies);
dealHealthRouter.post('/discount-anomalies/:id/dismiss', ...write, controller.dismissAnomaly);
dealHealthRouter.get('/:id/anomalies', ...read, controller.listAnomalies);
dealHealthRouter.get('/:id', ...read, controller.getDealHealth);

export const insightsRouter = Router();
insightsRouter.get('/', ...read, controller.listInsights);
insightsRouter.post('/:id/action', ...write, controller.actOnInsight);

export const riskRouter = Router();
riskRouter.get('/overview', ...read, controller.riskOverview);
riskRouter.get('/high-risk-deals', ...read, controller.highRiskDeals);
riskRouter.get('/:id', ...read, controller.getDealHealth);

export const recommendationsRouter = Router();
recommendationsRouter.get('/upsell', ...read, controller.listUpsellRecommendations);
recommendationsRouter.get('/cross-sell', ...read, controller.listCrossSellRecommendations);
recommendationsRouter.get('/:id', ...read, controller.getRecommendationDetails);
recommendationsRouter.post('/:id/apply', ...write, controller.applyRecommendation);