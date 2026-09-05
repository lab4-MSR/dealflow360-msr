import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/shared.controller';

const scoped = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_rep', 'sales_manager', 'finance', 'operations', 'customer')] as const;
export const notificationsRouter = Router();
notificationsRouter.get('/', ...scoped, controller.notifications);
notificationsRouter.post('/:id/read', ...scoped, controller.readNotification);
notificationsRouter.post('/mark-all-read', ...scoped, controller.readAllNotifications);
export const meRouter = Router();
meRouter.get('/profile', ...scoped, controller.profile);
meRouter.patch('/profile', ...scoped, controller.updateProfile);
meRouter.get('/preferences', ...scoped, controller.preferences);
meRouter.patch('/preferences', ...scoped, controller.updatePreferences);
meRouter.get('/sessions', ...scoped, controller.sessions);
meRouter.delete('/sessions/:id', ...scoped, controller.revokeSession);
export const searchRouter = Router();
searchRouter.get('/', ...scoped, controller.search);