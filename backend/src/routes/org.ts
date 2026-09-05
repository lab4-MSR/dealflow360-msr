import { Router } from 'express';
import { authenticate, requireRole, requireBusiness } from '../middleware/auth';
import {
  getOrg,
  getBranding,
  getLocalization,
  getCurrencyTax,
  getSettings,
  patchProfile,
  patchBranding,
  patchLocalization,
  patchCurrencyTax,
  patchSettings,
  listUsers,
  inviteUser,
  getUser,
  updateUser,
  deleteUser,
  listTeams,
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  listRoles,
  createRole,
  getRolePermissions,
  updateRolePermissions,
} from '../controllers/org.controller';

const admin = [authenticate, requireBusiness(), requireRole('business_admin')] as const;

export const orgRouter = Router();
export const usersRouter = Router();
export const teamsRouter = Router();
export const rolesRouter = Router();

// ---- /org ----
orgRouter.get('/profile', ...admin, getOrg);
orgRouter.patch('/profile', ...admin, patchProfile);
orgRouter.get('/branding', ...admin, getBranding);
orgRouter.patch('/branding', ...admin, patchBranding);
orgRouter.get('/localization', ...admin, getLocalization);
orgRouter.patch('/localization', ...admin, patchLocalization);
orgRouter.get('/currency-tax', ...admin, getCurrencyTax);
orgRouter.patch('/currency-tax', ...admin, patchCurrencyTax);
orgRouter.get('/settings', ...admin, getSettings);
orgRouter.patch('/settings', ...admin, patchSettings);

// ---- /users ----
usersRouter.get('/', ...admin, listUsers);
usersRouter.post('/invite', ...admin, inviteUser);
usersRouter.get('/:id', ...admin, getUser);
usersRouter.patch('/:id', ...admin, updateUser);
usersRouter.delete('/:id', ...admin, deleteUser);

// ---- /teams ----
teamsRouter.get('/', ...admin, listTeams);
teamsRouter.post('/', ...admin, createTeam);
teamsRouter.get('/:id', ...admin, getTeam);
teamsRouter.patch('/:id', ...admin, updateTeam);
teamsRouter.delete('/:id', ...admin, deleteTeam);

// ---- /roles ----
rolesRouter.get('/', ...admin, listRoles);
rolesRouter.post('/', ...admin, createRole);
rolesRouter.get('/:id/permissions', ...admin, getRolePermissions);
rolesRouter.patch('/:id/permissions', ...admin, updateRolePermissions);