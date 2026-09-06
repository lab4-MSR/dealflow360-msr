import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/analytics.controller';

const read = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance', 'super_admin', 'operations')] as const;
const write = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance', 'super_admin')] as const;

export const analyticsRouter = Router();
analyticsRouter.get('/executive', ...read, controller.executive);
analyticsRouter.get('/sales', ...read, controller.sales);
analyticsRouter.get('/revenue', ...read, controller.revenue);
analyticsRouter.get('/approvals', ...read, controller.approvals);
analyticsRouter.get('/discount', ...read, controller.discount);
analyticsRouter.get('/margin', ...read, controller.margin);
analyticsRouter.get('/fulfillment', ...read, controller.fulfillment);
analyticsRouter.get('/subscription', ...read, controller.subscription);
analyticsRouter.get('/reports', ...read, controller.reports);
analyticsRouter.post('/reports/schedule', ...write, controller.scheduleReport);
analyticsRouter.get('/finance', ...read, controller.finance);
