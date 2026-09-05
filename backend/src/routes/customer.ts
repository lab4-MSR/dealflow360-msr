import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import {
  listCustomers, createCustomer, getCustomer, updateCustomer, customerDeals, customerBilling,
} from '../controllers/customer.controller';

const scoped = [authenticate, requireBusiness()] as const;
// business_admin full CRUD; sales_rep/sales_manager read+create (rep auto-scoped to own via JWT in later modules)
const write = [...scoped, requireRole('business_admin', 'sales_rep', 'sales_manager')] as const;

export const customersRouter = Router();
customersRouter.get('/', ...scoped, listCustomers);
customersRouter.post('/', ...write, createCustomer);
customersRouter.get('/:id', ...scoped, getCustomer);
customersRouter.patch('/:id', ...write, updateCustomer);
customersRouter.get('/:id/deals', ...scoped, customerDeals);
customersRouter.get('/:id/billing', ...scoped, customerBilling);