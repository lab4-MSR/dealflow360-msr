import type { NextFunction, Request, Response } from 'express';
import { anonClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import { pickRoles, pickBusinessId, pickCustomerId } from '../lib/context';

/**
 * Verify the `Authorization: Bearer <jwt>` header against Supabase Auth and
 * attach the raw JWT claims to req.auth. Rejects with Code 401-style
 * ROLE_NOT_ALLOWED when no/invalid token (contract has no dedicated 401 code).
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      throw new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message: 'Authentication required. Provide a Bearer token.' });
    }

    // getUser() verifies the JWT signature/expiry with Supabase Auth.
    const { data, error } = await anonClient.auth.getUser(token);
    if (error || !data.user) {
      throw new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message: 'Invalid or expired token.' });
    }

    const u = data.user;
    const meta = (u.app_metadata ?? {}) as Record<string, unknown>;
    const umeta = (u.user_metadata ?? {}) as Record<string, unknown>;

    const role = pickRoles({ ...u, app_metadata: meta, user_metadata: umeta });
    const business_id = pickBusinessId({ ...u, app_metadata: meta });
    const customer_id = pickCustomerId({ ...u, app_metadata: meta });

    req.auth = {
      user_id: u.id,
      email: u.email ?? null,
      role: role?.[0] ?? null,
      business_id,
      customer_id,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) return void next(err);
    return void next(new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message: 'Invalid or expired token.' }));
  }
}

type RoleValue = string;

/**
 * Restrict an endpoint to the given role codes (§3). Must run after authenticate.
 * Also enforces the portal/internal surface split: /portal/* is customer-only and
 * internal roles cannot reach it (see routes).
 */
export function requireRole(...roles: RoleValue[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.auth?.role ?? null;
    if (!role || !roles.includes(role as string)) {
      return next(ApiError.roleNotAllowed());
    }
    next();
  };
}

/**
 * Require a tenant business_id on the JWT. Fails for super_admin acting on
 * tenant scoped routes.
 */
export function requireBusiness() {
  return (req: Request, res: Response, next: NextFunction): void => {
    const business_id = req.auth?.business_id ?? null;
    if (!business_id) {
      return next(ApiError.roleNotAllowed('This route requires a tenant business context.'));
    }
    next();
  };
}