import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import * as service from '../services/platform.service';

export async function getDashboard(_req: Request, res: Response) {
  const data = await service.getPlatformDashboard();
  res.json(envelope.ok(data));
}

export async function listBusinesses(req: Request, res: Response) {
  const { businesses, total, page, perPage, totalPages } = await service.listPlatformBusinesses({
    search: String(req.query.search ?? '') || undefined,
    status: String(req.query.status ?? '') || undefined,
    plan: String(req.query.plan ?? '') || undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    perPage: req.query.per_page ? Number(req.query.per_page) : 10,
  });
  res.json(envelope.okList(businesses, { page, per_page: perPage, total, total_pages: totalPages }));
}

export async function businessKpis(_req: Request, res: Response) {
  const data = await service.getPlatformBusinessKpis();
  res.json(envelope.ok(data));
}

export async function getBusiness(req: Request, res: Response) {
  const data = await service.getPlatformBusinessById(String(req.params.id));
  res.json(envelope.ok(data));
}

export async function createBusiness(req: Request, res: Response) {
  const data = await service.createPlatformBusiness(req.body ?? {});
  res.status(201).json(envelope.ok(data));
}

export async function updateBusiness(req: Request, res: Response) {
  const data = await service.updatePlatformBusiness(String(req.params.id), req.body ?? {});
  res.json(envelope.ok(data));
}

export async function listUsers(req: Request, res: Response) {
  const { users, total, page, perPage, totalPages } = await service.listPlatformUsers({
    search: String(req.query.search ?? '') || undefined,
    role: String(req.query.role ?? '') || undefined,
    businessId: String(req.query.business_id ?? '') || undefined,
    status: String(req.query.status ?? '') || undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    perPage: req.query.per_page ? Number(req.query.per_page) : 10,
  });
  res.json(envelope.okList(users, { page, per_page: perPage, total, total_pages: totalPages }));
}

export async function userKpis(_req: Request, res: Response) {
  const data = await service.getPlatformUserKpis();
  res.json(envelope.ok(data));
}

export async function getUser(req: Request, res: Response) {
  const data = await service.getPlatformUserById(String(req.params.id));
  res.json(envelope.ok(data));
}

export async function updateUser(req: Request, res: Response) {
  const data = await service.updatePlatformUser(String(req.params.id), req.body ?? {});
  res.json(envelope.ok(data));
}

export async function getAnalytics(_req: Request, res: Response) {
  const data = await service.getPlatformAnalytics();
  res.json(envelope.ok(data));
}

export async function getHealth(_req: Request, res: Response) {
  const data = await service.getPlatformHealth();
  res.json(envelope.ok(data));
}

export async function getAudit(_req: Request, res: Response) {
  const data = await service.getPlatformAudit();
  res.json(envelope.ok(data));
}

export async function getSettings(_req: Request, res: Response) {
  const data = await service.getPlatformSettings();
  res.json(envelope.ok(data));
}

export async function updateSettings(req: Request, res: Response) {
  res.json(envelope.ok({ ...req.body, updated: true }));
}
