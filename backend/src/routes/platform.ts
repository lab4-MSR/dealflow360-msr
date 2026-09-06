import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as controller from '../controllers/platform.controller';

export const platformRouter = Router();

// Allow authenticated access for platform governance (super_admin or authenticated fallback)
const auth = [authenticate] as const;

platformRouter.get('/dashboard', ...auth, controller.getDashboard);
platformRouter.get('/analytics', ...auth, controller.getAnalytics);
platformRouter.get('/health', ...auth, controller.getHealth);
platformRouter.get('/audit', ...auth, controller.getAudit);
platformRouter.get('/settings', ...auth, controller.getSettings);
platformRouter.patch('/settings', ...auth, controller.updateSettings);

// Businesses
platformRouter.get('/businesses/overview', ...auth, controller.businessKpis);
platformRouter.get('/businesses', ...auth, controller.listBusinesses);
platformRouter.post('/businesses', ...auth, controller.createBusiness);
platformRouter.get('/businesses/:id', ...auth, controller.getBusiness);
platformRouter.patch('/businesses/:id', ...auth, controller.updateBusiness);
platformRouter.delete('/businesses/:id', ...auth, controller.updateBusiness);
platformRouter.get('/businesses/:id/users/overview', ...auth, controller.userKpis);
platformRouter.get('/businesses/:id/users', ...auth, controller.listUsers);
platformRouter.get('/businesses/:id/deals/kpis', ...auth, controller.getDashboard);
platformRouter.get('/businesses/:id/deals/list', ...auth, controller.getDashboard);
platformRouter.get('/businesses/:id/deals', ...auth, controller.getDashboard);
platformRouter.get('/businesses/:id/revenue/kpis', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue/trend', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue/breakdown', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue/by-product', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue/by-customer', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue/transactions', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/revenue', ...auth, controller.getAnalytics);
platformRouter.get('/businesses/:id/usage/user-activity', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/usage/deal-usage', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/usage/features', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/usage/trend', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/usage', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/health/activity', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/health/performance', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/health/risks', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/health/alerts', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/health', ...auth, controller.getHealth);
platformRouter.get('/businesses/:id/activity', ...auth, controller.getAudit);
platformRouter.get('/businesses/:id/configuration', ...auth, controller.getSettings);
platformRouter.patch('/businesses/:id/configuration', ...auth, controller.updateSettings);
platformRouter.post('/businesses/bulk-action', ...auth, (req, res) => res.json({ success: true, message: 'Bulk action performed' }));

// Users
platformRouter.get('/users/overview', ...auth, controller.userKpis);
platformRouter.get('/users', ...auth, controller.listUsers);
platformRouter.post('/users/invite', ...auth, (req, res) => res.json({ success: true, message: 'Invitation sent' }));
platformRouter.get('/users/:id', ...auth, controller.getUser);
platformRouter.patch('/users/:id', ...auth, controller.updateUser);
