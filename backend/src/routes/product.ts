import { Router } from 'express';
import { authenticate, requireBusiness, requireRole } from '../middleware/auth';
import {
  listProducts, createProduct, getProduct, updateProduct,
  listCategories, createCategory, updateCategory,
  listPriceLists, createPriceList, updatePriceList, setPriceListItems, getPriceList, getPriceListItems,
  listCustomerPricing, createCustomerPricing, listVolumePricing, createVolumePricing, listPricingHistory, resolvePrice,
} from '../controllers/product.controller';

const scoped = [authenticate, requireBusiness()] as const;
const write = [...scoped, requireRole('business_admin')] as const;
const read = [...scoped, requireRole('business_admin', 'sales_rep', 'sales_manager')] as const;

export const productsRouter = Router();
productsRouter.get('/', ...read, listProducts);
productsRouter.post('/', ...write, createProduct);
productsRouter.get('/:id', ...read, getProduct);
productsRouter.patch('/:id', ...write, updateProduct);

export const categoriesRouter = Router();
categoriesRouter.get('/', ...read, listCategories);
categoriesRouter.post('/', ...write, createCategory);
categoriesRouter.patch('/:id', ...write, updateCategory);

export const priceListsRouter = Router();
priceListsRouter.get('/', ...read, listPriceLists);
priceListsRouter.post('/', ...write, createPriceList);
priceListsRouter.get('/:id', ...read, getPriceList);
priceListsRouter.patch('/:id', ...write, updatePriceList);
priceListsRouter.get('/:id/items', ...read, getPriceListItems);
priceListsRouter.post('/:id/items', ...write, setPriceListItems);

export const customerPricingRouter = Router();
customerPricingRouter.get('/', ...read, listCustomerPricing);
customerPricingRouter.post('/', ...write, createCustomerPricing);

export const volumePricingRouter = Router();
volumePricingRouter.get('/', ...read, listVolumePricing);
volumePricingRouter.post('/', ...write, createVolumePricing);

export const pricingRouter = Router();
pricingRouter.get('/resolve', ...read, resolvePrice);

export const pricingHistoryRouter = Router();
pricingHistoryRouter.get('/', ...read, listPricingHistory);