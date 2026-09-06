import { randomUUID } from 'crypto';
import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

/** Return only the given keys from an object (undefined values dropped). */
function pick(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** Fetch the caller's tenant `businesses` row by business_id claim. */
export async function getBusiness(businessId: string): Promise<Record<string, unknown>> {
  const { data, error } = await serviceClient.from('businesses').select('*').eq('id', businessId).maybeSingle();
  if (error || !data) throw ApiError.notFound('Business not found for this tenant.');
  return data as Record<string, unknown>;
}

/** Map the businesses row -> the §7 public org object. */
function toPublic(b: Record<string, unknown>): Record<string, unknown> {
  return {
    id: b.id,
    name: b.name,
    legal_name: b.legal_name ?? null,
    industry: b.industry ?? null,
    plan: b.plan ?? null,
    currency: b.currency ?? 'INR',
    timezone: b.timezone ?? 'UTC',
    language: b.language ?? 'en',
    date_format: b.date_format ?? 'YYYY-MM-DD',
    address: b.address ?? {},
    tax_config: b.tax_config ?? {},
    branding: b.branding ?? {},
    settings: b.settings ?? {},
    status: b.status ?? 'pending_setup',
    created_at: b.created_at ?? null,
  };
}

/** Safe partial update on a businesses row. */
async function updateBusiness(businessId: string, patch: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await serviceClient.from('businesses').update(patch).eq('id', businessId).select().single();
  if (error || !data) {
    throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error?.message ?? 'Failed to update business.' });
  }
  return data as Record<string, unknown>;
}

export async function getOrgProfile(businessId: string) {
  return toPublic(await getBusiness(businessId));
}

export async function getOrgBranding(businessId: string) {
  const business = await getBusiness(businessId);
  return business.branding ?? {};
}

export async function getOrgLocalization(businessId: string) {
  const business = await getBusiness(businessId);
  return {
    language: business.language ?? 'en',
    timezone: business.timezone ?? 'UTC',
    date_format: business.date_format ?? 'YYYY-MM-DD',
  };
}

export async function getOrgCurrencyTax(businessId: string) {
  const business = await getBusiness(businessId);
  return {
    currency: business.currency ?? 'INR',
    tax_config: business.tax_config ?? {},
  };
}

export async function getOrgSettings(businessId: string) {
  const business = await getBusiness(businessId);
  return business.settings ?? {};
}

export async function patchOrgProfile(businessId: string, patch: Record<string, unknown>) {
  const clean = pick(patch, ['name', 'legal_name', 'industry', 'address']);
  return toPublic(await updateBusiness(businessId, clean));
}

export async function patchOrgBranding(businessId: string, patch: Record<string, unknown>) {
  const biz = await getBusiness(businessId);
  const branding = { ...(biz.branding as object), ...pick(patch, ['logo_url', 'primary_color', 'favicon_url']) };
  return toPublic(await updateBusiness(businessId, { branding }));
}

export async function patchOrgLocalization(businessId: string, patch: Record<string, unknown>) {
  return toPublic(await updateBusiness(businessId, pick(patch, ['language', 'timezone', 'date_format'])));
}

export async function patchOrgCurrencyTax(businessId: string, patch: Record<string, unknown>) {
  return toPublic(await updateBusiness(businessId, pick(patch, ['currency', 'tax_config'])));
}

export async function patchOrgSettings(businessId: string, patch: Record<string, unknown>) {
  const settings = patch.settings as object | undefined;
  return toPublic(await updateBusiness(businessId, settings ? { settings } : {}));
}
// ---------------------------------------------------------------------------
// Users (§7 /users)
// ---------------------------------------------------------------------------
export async function listUsers(businessId: string) {
  const { data, error } = await serviceClient
    .from('users')
    .select('id, full_name, email, role, status, team_id, avatar_url, created_at')
    .eq('business_id', businessId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function getOrgUser(businessId: string, userId: string) {
  const { data, error } = await serviceClient
    .from('users')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('User not found in this tenant.');
  return data;
}

export async function updateOrgUser(businessId: string, userId: string, patch: Record<string, unknown>) {
  const allowed = ['role', 'status', 'team_id', 'phone', 'job_title', 'full_name'];
  const { data, error } = await serviceClient
    .from('users')
    .update(pick(patch, allowed))
    .eq('business_id', businessId)
    .eq('id', userId)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') throw ApiError.notFound('User not found in this tenant.');
    throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  }
  return data;
}

export async function deactivateOrgUser(businessId: string, userId: string) {
  const { data, error } = await serviceClient
    .from('users')
    .update({ status: 'suspended' })
    .eq('business_id', businessId)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}
export async function inviteUser(
  businessId: string,
  input: { full_name: string; email: string; role: string; team_id?: string | null },
) {
  const { data: created, error: createErr } = await serviceClient.auth.admin.createUser({
    email: input.email,
    password: 'TempPass' + randomUUID().slice(0, 8),
    email_confirm: false,
    user_metadata: { full_name: input.full_name },
    app_metadata: { business_id: businessId, role: input.role, customer_id: null },
  });
  if (createErr) throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: createErr.message });

  const uid = created.user!.id;
  const { data: row, error } = await serviceClient
    .from('users')
    .insert({
      id: uid,
      business_id: businessId,
      auth_user_id: uid,
      email: input.email,
      full_name: input.full_name,
      role: input.role ?? 'sales_rep',
      status: 'invited',
      team_id: input.team_id ?? null,
    })
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return row;
}

// ---------------------------------------------------------------------------
// Teams (§7 /teams)
// ---------------------------------------------------------------------------
export async function listTeams(businessId: string) {
  const { data, error } = await serviceClient
    .from('teams')
    .select('id, name, description, created_at, users(id, full_name, email, role, status)')
    .eq('business_id', businessId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createTeam(businessId: string, input: { name: string; description?: string | null }) {
  const { data, error } = await serviceClient
    .from('teams')
    .insert({ business_id: businessId, name: input.name, description: input.description ?? null })
    .select()
    .single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}
export async function getTeam(businessId: string, teamId: string) {
  const { data, error } = await serviceClient
    .from('teams')
    .select('id, name, description, created_at, users(id, full_name, email, role, status)')
    .eq('business_id', businessId)
    .eq('id', teamId)
    .maybeSingle();
  if (error || !data) throw ApiError.notFound('Team not found in this tenant.');
  return data;
}

export async function updateTeam(businessId: string, teamId: string, patch: Record<string, unknown>) {
  const { data, error } = await serviceClient
    .from('teams')
    .update(pick(patch, ['name', 'description']))
    .eq('business_id', businessId)
    .eq('id', teamId)
    .select()
    .single();
  if (error || !data) throw ApiError.notFound('Team not found in this tenant.');
  return data;
}

export async function deleteTeam(businessId: string, teamId: string) {
  const { error } = await serviceClient.from('teams').delete().eq('business_id', businessId).eq('id', teamId);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return { id: teamId, deleted: true };
}

// ---------------------------------------------------------------------------
// Roles (§7 /roles)
// ---------------------------------------------------------------------------
export async function listRoles(businessId: string) {
  const { data, error } = await serviceClient
    .from('roles')
    .select('id, name, is_custom, business_id')
    .or(`business_id.eq.${businessId},business_id.is.null`);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function createRole(businessId: string, input: { name: string; permissions?: string[] }) {
  const { data, error } = await serviceClient
    .from('roles')
    .insert({ business_id: businessId, name: input.name, is_custom: true })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'A role with this name already exists.' });
    throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  }
  if (input.permissions?.length) {
    await serviceClient.from('role_permissions').insert(
      input.permissions.map((p) => ({ business_id: businessId, role_id: data.id, permission: p })),
    );
  }
  return data;
}
export async function getRolePermissions(businessId: string, roleId: string) {
  const { data, error } = await serviceClient
    .from('role_permissions')
    .select('permission')
    .eq('role_id', roleId)
    .or(`business_id.eq.${businessId},business_id.is.null`);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return { role_id: roleId, permissions: (data ?? []).map((r) => r.permission) };
}

export async function setRolePermissions(businessId: string, roleId: string, permissions: string[]) {
  await serviceClient.from('role_permissions').delete().eq('role_id', roleId).eq('business_id', businessId);
  if (permissions.length) {
    const { error } = await serviceClient.from('role_permissions').insert(
      permissions.map((p) => ({ business_id: businessId, role_id: roleId, permission: p })),
    );
    if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  }
  return { role_id: roleId, permissions };
}