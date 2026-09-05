import type { Request } from 'express';
import { ApiError, ErrorCode } from './apiErrors';

/** The DealFlow360 JWT claims that drive tenancy + roles (§2.2). */
export interface AuthContext {
  /** supabase auth.users.id */
  userId: string;
  email: string | null;
  /** Null for super_admin / platform users. */
  businessId: string | null;
  /** One of the §3 role codes. */
  role: string | null;
  /** Only present for Customer Portal users. */
  customerId: string | null;
}

function asStringArray(v: unknown, key: string): string[] | null {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    if (!v.includes(',')) return v ? [v] : null;
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [String(v)];
}

/** Decode the caller's JWT claims into an AuthContext. Call after req.auth exists (see middleware). */
export function getAuth(req: Request): AuthContext {
  const raw = req.auth;
  if (!raw) {
    throw new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message: 'Missing or invalid authentication.' });
  }
  const s = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
  return {
    userId: s(raw.user_id) ?? '',
    email: s(raw.email),
    businessId: s(raw.business_id),
    role: s(raw.role),
    customerId: s(raw.customer_id),
  };
}

/* Helpers used by middleware to read raw claims defensively.
 *
 * Supabase JWTs always carry a top-level `role` claim of "authenticated"
 * (the postgres role for RLS). Our business `role` and `business_id`
 * live under `app_metadata`, so we MUST prefer app_metadata and only fall
 * back to the top-level `role` when no business role is present.
 */
export function pickRoles(payload: Record<string, unknown>): string[] | null {
  const am = payload.app_metadata as Record<string, unknown> | undefined;
  const role = am?.role ?? payload.role;
  return asStringArray(role, 'role');
}

export function pickBusinessId(payload: Record<string, unknown>): string | null {
  const am = payload.app_metadata as Record<string, unknown> | undefined;
  const b = payload.business_id ?? am?.business_id;
  return typeof b === 'string' && b ? b : null;
}

export function pickCustomerId(payload: Record<string, unknown>): string | null {
  const am = payload.app_metadata as Record<string, unknown> | undefined;
  const c = payload.customer_id ?? am?.customer_id;
  return typeof c === 'string' && c ? c : null;
}

/**
 * Decode+normalize a raw JWT payload into the AuthContext claims, preferring
 * app_metadata for role/business_id/customer_id (see pick* helpers above).
 */
export function normalizeClaims(payload: Record<string, unknown>): {
  userId: string;
  email: string | null;
  businessId: string | null;
  role: string | null;
  customerId: string | null;
} {
  const s = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
  return {
    userId: s(payload.sub ?? payload.user_id) ?? '',
    email: s(payload.email),
    businessId: pickBusinessId(payload),
    role: pickRoles(payload)?.[0] ?? null,
    customerId: pickCustomerId(payload),
  };
}