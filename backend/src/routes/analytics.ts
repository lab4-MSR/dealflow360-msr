import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/analytics.controller';

const read = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_manager', 'finance')] as const;

export const analyticsRouter = Router();
analyticsRouter.get('/executive', ...read, controller.executive);
analyticsRouter.get('/sales', ...read, controller.sales);
analyticsRouter.get('/revenue', ...read, controller.revenue);
analyticsRouter.get('/approvals', ...read, controller.approvals);
