import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as svc from '../services/product.service';
import {
  createProductSchema, updateProductSchema, createCategorySchema, updateCategorySchema,
  createPriceListSchema, updatePriceListSchema, priceListItemSchema, createCustomerPricingSchema, createVolumePricingSchema,
} from '../validators/product';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

export const listProducts = async (req: Request, res: Response) => {
  const { category_id, status } = req.query as Record<string, string>;
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.per_page ?? 20);
  const data = await svc.listProducts(tenantOf(req), { category_id, status });
  res.json(envelope.okList(data, { page, per_page: perPage, total: data.length, total_pages: Math.max(1, Math.ceil(data.length / (perPage || 20))) }));
};
export const createProduct = async (req: Request, res: Response) => {
  const body = createProductSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createProduct(tenantOf(req), body)));
};
export const getProduct = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.getProduct(tenantOf(req), String(req.params.id))));
};
export const updateProduct = async (req: Request, res: Response) => {
  const body = updateProductSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateProduct(tenantOf(req), String(req.params.id), body)));
};

export const listCategories = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.per_page ?? 20);
  const data = await svc.listCategories(tenantOf(req));
  res.json(envelope.okList(data, { page, per_page: perPage, total: data.length, total_pages: Math.max(1, Math.ceil(data.length / (perPage || 20))) }));
};
export const createCategory = async (req: Request, res: Response) => {
  const body = createCategorySchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createCategory(tenantOf(req), body)));
};
export const updateCategory = async (req: Request, res: Response) => {
  const body = updateCategorySchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updateCategory(tenantOf(req), String(req.params.id), body)));
};

export const listPriceLists = async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.per_page ?? 20);
  const data = await svc.listPriceLists(tenantOf(req));
  res.json(envelope.okList(data, { page, per_page: perPage, total: data.length, total_pages: Math.max(1, Math.ceil(data.length / (perPage || 20))) }));
};
export const createPriceList = async (req: Request, res: Response) => {
  const body = createPriceListSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createPriceList(tenantOf(req), body)));
};
export const updatePriceList = async (req: Request, res: Response) => {
  const body = updatePriceListSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.updatePriceList(tenantOf(req), String(req.params.id), body)));
};
export const getPriceList = async (req: Request, res: Response) => {
  res.json(envelope.ok(await svc.getPriceList(tenantOf(req), String(req.params.id))));
};
export const getPriceListItems = async (req: Request, res: Response) => {
  res.json(envelope.okList(await svc.getPriceListItems(tenantOf(req), String(req.params.id))));
};
export const setPriceListItems = async (req: Request, res: Response) => {
  const body = priceListItemSchema.parse(req.body ?? {});
  res.json(envelope.ok(await svc.setPriceListItems(tenantOf(req), String(req.params.id), body.items)));
};

export const createCustomerPricing = async (req: Request, res: Response) => {
  const body = createCustomerPricingSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createCustomerPricing(tenantOf(req), body)));
};
export const listCustomerPricing = async (req: Request, res: Response) => {
  res.json(envelope.okList(await svc.listCustomerPricing(tenantOf(req), String(req.query.customer_id ?? '') || undefined)));
};
export const createVolumePricing = async (req: Request, res: Response) => {
  const body = createVolumePricingSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await svc.createVolumePricing(tenantOf(req), body)));
};
export const listVolumePricing = async (req: Request, res: Response) => {
  res.json(envelope.okList(await svc.listVolumePricing(tenantOf(req), String(req.query.product_id ?? '') || undefined)));
};
export const listPricingHistory = async (req: Request, res: Response) => {
  res.json(envelope.okList(await svc.listPricingHistory(tenantOf(req), String(req.query.product_id ?? '') || undefined)));
};
export const resolvePrice = async (req: Request, res: Response) => {
  const { product_id, customer_id, quantity } = req.query as Record<string, string>;
  res.json(envelope.ok(await svc.resolvePrice(tenantOf(req), product_id, customer_id, Number(quantity || 1))));
};