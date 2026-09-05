import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import * as controller from '../controllers/fulfillment.controller';

const scoped = [authenticate, requireBusiness(), requireRole('business_admin', 'sales_rep', 'sales_manager', 'operations')] as const;
const write = [authenticate, requireBusiness(), requireRole('business_admin', 'operations')] as const;

export const warehousesRouter = Router();
warehousesRouter.get('/', ...scoped, controller.listWarehouses);
warehousesRouter.post('/', ...write, controller.createWarehouse);
warehousesRouter.get('/:id', ...scoped, controller.getWarehouse);
warehousesRouter.patch('/:id', ...write, controller.updateWarehouse);
warehousesRouter.get('/:id/inventory', ...scoped, controller.listInventory);
warehousesRouter.post('/:id/stock-movements', ...write, controller.recordStockMovement);

export const shippingRulesRouter = Router();
shippingRulesRouter.get('/', ...scoped, controller.listShippingRules);
shippingRulesRouter.post('/', ...write, controller.createShippingRule);

export const fulfillmentRouter = Router();
fulfillmentRouter.get('/queue', ...write, controller.listFulfillmentQueue);
fulfillmentRouter.get('/:id', ...scoped, controller.getFulfillmentOrder);

export const shipmentsRouter = Router();
shipmentsRouter.get('/', ...scoped, controller.listShipments);
shipmentsRouter.get('/:id', ...scoped, controller.getShipment);

export const backordersRouter = Router();
backordersRouter.get('/', ...write, controller.listBackorders);
backordersRouter.get('/:id', ...write, controller.getBackorder);
backordersRouter.post('/:id/consolidate', ...write, controller.consolidateBackorder);