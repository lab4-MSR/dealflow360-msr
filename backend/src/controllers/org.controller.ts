import type { Request, Response } from 'express';
import { envelope } from '../lib/envelope';
import { getAuth } from '../lib/context';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import * as orgSvc from '../services/org.service';
import {
  profileSchema,
  brandingSchema,
  localizationSchema,
  currencyTaxSchema,
  settingsSchema,
  createTeamSchema,
  updateTeamSchema,
  createRoleSchema,
  updateRolePermissionsSchema,
} from '../validators/org';
import { inviteUserSchema, updateUserSchema } from '../validators/users';

function tenantOf(req: Request): string {
  const { businessId } = getAuth(req);
  if (!businessId) {
    throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'This route requires a tenant business context.' });
  }
  return businessId;
}

// --- Org ---
export const getOrg = async (req: Request, res: Response) => {
  const data = await orgSvc.getOrgProfile(tenantOf(req));
  res.json(envelope.ok(data));
};

export const getBranding = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getOrgBranding(tenantOf(req))));
};

export const getLocalization = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getOrgLocalization(tenantOf(req))));
};

export const getCurrencyTax = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getOrgCurrencyTax(tenantOf(req))));
};

export const getSettings = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getOrgSettings(tenantOf(req))));
};

export const patchProfile = async (req: Request, res: Response) => {
  const body = profileSchema.parse(req.body ?? {});
  const data = await orgSvc.patchOrgProfile(tenantOf(req), body);
  res.json(envelope.ok(data));
};

export const patchBranding = async (req: Request, res: Response) => {
  const body = brandingSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.patchOrgBranding(tenantOf(req), body)));
};

export const patchLocalization = async (req: Request, res: Response) => {
  const body = localizationSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.patchOrgLocalization(tenantOf(req), body)));
};

export const patchCurrencyTax = async (req: Request, res: Response) => {
  const body = currencyTaxSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.patchOrgCurrencyTax(tenantOf(req), body)));
};

export const patchSettings = async (req: Request, res: Response) => {
  const body = settingsSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.patchOrgSettings(tenantOf(req), body)));
};

// --- Users ---
export const listUsers = async (req: Request, res: Response) => {
  res.json(envelope.okList(await orgSvc.listUsers(tenantOf(req))));
};

export const inviteUser = async (req: Request, res: Response) => {
  const body = inviteUserSchema.parse(req.body ?? {});
  const data = await orgSvc.inviteUser(tenantOf(req), body);
  res.status(201).json(envelope.ok(data));
};

export const getUser = async (req: Request, res: Response) => {
  const data = await orgSvc.getOrgUser(tenantOf(req), String(req.params.id));
  res.json(envelope.ok(data));
};

export const updateUser = async (req: Request, res: Response) => {
  const body = updateUserSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.updateOrgUser(tenantOf(req), String(req.params.id), body)));
};

export const deleteUser = async (req: Request, res: Response) => {
  const data = await orgSvc.deactivateOrgUser(tenantOf(req), String(req.params.id));
  res.json(envelope.ok(data));
};

// --- Teams ---
export const listTeams = async (req: Request, res: Response) => {
  res.json(envelope.okList(await orgSvc.listTeams(tenantOf(req))));
};

export const createTeam = async (req: Request, res: Response) => {
  const body = createTeamSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await orgSvc.createTeam(tenantOf(req), body)));
};

export const getTeam = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getTeam(tenantOf(req), String(req.params.id))));
};

export const updateTeam = async (req: Request, res: Response) => {
  const body = updateTeamSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.updateTeam(tenantOf(req), String(req.params.id), body)));
};

export const deleteTeam = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.deleteTeam(tenantOf(req), String(req.params.id))));
};

// --- Roles ---
export const listRoles = async (req: Request, res: Response) => {
  res.json(envelope.okList(await orgSvc.listRoles(tenantOf(req))));
};

export const createRole = async (req: Request, res: Response) => {
  const body = createRoleSchema.parse(req.body ?? {});
  res.status(201).json(envelope.ok(await orgSvc.createRole(tenantOf(req), body)));
};

export const getRolePermissions = async (req: Request, res: Response) => {
  res.json(envelope.ok(await orgSvc.getRolePermissions(tenantOf(req), String(req.params.id))));
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  const body = updateRolePermissionsSchema.parse(req.body ?? {});
  res.json(envelope.ok(await orgSvc.setRolePermissions(tenantOf(req), String(req.params.id), body.permissions)));
};