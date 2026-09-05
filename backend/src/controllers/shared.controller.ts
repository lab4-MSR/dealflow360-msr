import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as service from '../services/shared.service';

function auth(req: Request) { const context = getAuth(req); if (!context.businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' }); return context; }
export const notifications = async (req: Request, res: Response) => res.json(envelope.okList(await service.listNotifications(auth(req).businessId!, auth(req).userId)));
export const readNotification = async (req: Request, res: Response) => res.json(envelope.ok(await service.markNotificationRead(auth(req).businessId!, auth(req).userId, String(req.params.id))));
export const readAllNotifications = async (req: Request, res: Response) => res.json(envelope.ok(await service.markAllNotificationsRead(auth(req).businessId!, auth(req).userId)));
export const profile = async (req: Request, res: Response) => res.json(envelope.ok(await service.getProfile(auth(req).businessId!, auth(req).userId)));
export const updateProfile = async (req: Request, res: Response) => res.json(envelope.ok(await service.updateProfile(auth(req).businessId!, auth(req).userId, req.body ?? {})));
export const preferences = async (req: Request, res: Response) => res.json(envelope.ok(await service.getPreferences(auth(req).businessId!, auth(req).userId)));
export const updatePreferences = async (req: Request, res: Response) => res.json(envelope.ok(await service.updatePreferences(auth(req).businessId!, auth(req).userId, req.body ?? {})));
export const sessions = async (req: Request, res: Response) => res.json(envelope.okList(await service.listSessions(auth(req).businessId!, auth(req).userId)));
export const revokeSession = async (req: Request, res: Response) => res.json(envelope.ok(await service.revokeSession(auth(req).businessId!, auth(req).userId, String(req.params.id))));
export const search = async (req: Request, res: Response) => res.json(envelope.okList(await service.search(auth(req).businessId!, String(req.query.q ?? ''))));