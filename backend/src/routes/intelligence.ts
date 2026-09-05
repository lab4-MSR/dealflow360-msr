import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/intelligence.controller';

const read = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance', 'sales_rep')] as const;
const write = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance')] as const;

export const auditRouter = Router();
auditRouter.get('/', ...read, controller.listAudit);
auditRouter.get('/kpis', ...read, controller.auditKpis);
auditRouter.get('/:id', ...read, controller.getAudit);

export const dealHealthRouter = Router();
dealHealthRouter.get('/', ...read, controller.listDealHealth);
dealHealthRouter.get('/kpis', ...read, controller.dealHealthKpis);
dealHealthRouter.get('/:id', ...read, controller.getDealHealth);
dealHealthRouter.get('/:id/anomalies', ...read, controller.listAnomalies);
dealHealthRouter.post('/discount-anomalies/:id/dismiss', ...write, controller.dismissAnomaly);

export const insightsRouter = Router();
insightsRouter.get('/', ...read, controller.listInsights);
insightsRouter.post('/:id/action', ...write, controller.actOnInsight);