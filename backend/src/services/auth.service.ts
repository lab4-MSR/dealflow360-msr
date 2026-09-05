import { randomUUID } from 'crypto';
import { serviceClient, anonClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';
import { normalizeClaims } from '../lib/context';
import { signupSchema, type SignupInput, loginSchema, type LoginInput, type PortalLoginInput } from '../validators/auth';

/** Resolve a user's permission catalog from the seeded role_permissions. */
export async function resolvePermissions(businessId: string | null, role: string | null): Promise<string[]> {
  if (!role) return [];
  if (role === 'super_admin') return ['*'];

  const { data: roles } = await serviceClient
    .from('roles')
    .select('id')
    .eq('name', role)
    .is('business_id', null)
    .limit(1);
  const builtin = roles?.[0]?.id;
  if (!builtin) return [];

  const { data: rows } = await serviceClient.from('role_permissions').select('permission').eq('role_id', builtin);
  return (rows ?? []).map((r) => r.permission);
}

/** Build the session/profile object for GET /auth/session and signup response. */
async function buildSessionPayload(
  userId: string,
  email: string,
  role: string,
  businessId: string | null,
  customerId: string | null,
): Promise<Record<string, unknown>> {
  const permissions = await resolvePermissions(businessId, role);
  let businessName: string | null = null;
  if (businessId) {
    const { data: biz } = await serviceClient.from('businesses').select('name').eq('id', businessId).maybeSingle();
    businessName = biz?.name ?? null;
  }
  const { data: profile } = await serviceClient
    .from('users')
    .select('full_name, avatar_url')
    .eq('auth_user_id', userId)
    .maybeSingle();

  return {
    user_id: userId,
    email,
    full_name: profile?.full_name ?? null,
    role,
    business_id: businessId,
    business_name: businessName,
    customer_id: customerId,
    avatar_url: profile?.avatar_url ?? null,
    permissions,
  };
}

/**
 * §5 POST /auth/signup — first business admin self-signup.
 * Creates a Supabase auth user, a `businesses` row (pending_setup), and a
 * `users` row (business_admin) with JWT claims baked into app_metadata.
 */
export async function signup(input: SignupInput) {
  signupSchema.parse(input);
  const { email, password, full_name, business_name } = input;

  const { data: createdUser, error: createErr } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, business_name },
  });
  if (createErr) {
    throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: createErr.message, details: { hint: 'Email already registered?' } });
  }
  const userId = createdUser.user!.id;

  const businessId = randomUUID();
  const { error: bizErr } = await serviceClient.from('businesses').insert({
    id: businessId,
    status: 'pending_setup',
    name: business_name,
  });
  if (bizErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: `Failed to create business: ${bizErr.message}` });

  const { error: userErr } = await serviceClient.from('users').insert({
    business_id: businessId,
    auth_user_id: userId,
    email,
    full_name,
    role: 'business_admin',
    status: 'active',
  });
  if (userErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: `Failed to create user: ${userErr.message}` });

  const { error: claimsErr } = await serviceClient.auth.admin.updateUserById(userId, {
    app_metadata: { business_id: businessId, role: 'business_admin', customer_id: null },
  });
  if (claimsErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: `Failed to set claims: ${claimsErr.message}` });

  const sessionPayload = await buildSessionPayload(userId, email, 'business_admin', businessId, null);
  return { business_id: businessId, ...sessionPayload };
}

/** §5 POST /auth/login — password login via Supabase Auth. */
export async function login(input: LoginInput) {
  loginSchema.parse(input);
  const { email, password } = input;
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) {
    throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'Invalid email or password.', field: 'email' });
  }
  if (!data.session) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: 'Login failed. No session returned.' });

  const claims = normalizeClaims(interpretJwt(data.session.access_token));
  const profile = await buildSessionPayload(
    data.user.id,
    data.user.email ?? email,
    claims.role ?? 'sales_rep',
    claims.businessId,
    claims.customerId,
  );

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: profile,
  };
}
/** §5 POST /auth/portal-login — customer portal login (password or magic link). */
export async function portalLogin(input: PortalLoginInput): Promise<Record<string, unknown>> {
  if (input.magic_link_token) {
    throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'Magic link flow not yet wired. Use email + password.' });
  }
  const { email, password } = input as { email: string; password: string };
  const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'Invalid credentials.', field: 'email' });
  if (!data.session) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: 'Portal login failed.' });

  const claims = normalizeClaims(interpretJwt(data.session.access_token));
  if (claims.role !== 'customer') {
    throw new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message: 'This account is not a customer portal account.' });
  }
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
  };
}

/** §5 POST /auth/logout — invalidate (revoke) the current session. */
export async function logout(refreshToken?: string): Promise<void> {
  if (refreshToken) {
    const { error } = await serviceClient.auth.admin.signOut(refreshToken);
    if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  }
}

/** §5 POST /auth/forgot-password — trigger recovery email. */
export async function forgotPassword(email: string): Promise<{ sent: true }> {
  const redirectTo = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/reset-password`;
  const { error } = await serviceClient.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return { sent: true };
}

/** §5 POST /auth/reset-password — complete recovery token exchange. */
export async function resetPassword(token: string, newPassword: string, email?: string): Promise<{ success: true }> {
  if (email) {
    const { data, error } = await anonClient.auth.verifyOtp({ token, email, type: 'recovery' } as any);
    if (error || !data.user) {
      throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'Reset token is invalid or expired.' });
    }

    const { error: updateErr } = await serviceClient.auth.admin.updateUserById(data.user.id, { password: newPassword });
    if (updateErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: updateErr.message });
  }

  return { success: true };
}

/** §5 POST /auth/verify-email — complete signup verification. */
export async function verifyEmail(token: string, email?: string): Promise<{ verified: true; user_id?: string }> {
  if (email) {
    const { data, error } = await anonClient.auth.verifyOtp({ token, email, type: 'signup' } as any);
    if (error || !data.user) {
      throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: 'Verification token is invalid or expired.' });
    }
    return { verified: true, user_id: data.user.id };
  }

  return { verified: true };
}

/** §5 GET /auth/invitations/:token — render accept invitation page. */
export async function getInvitation(token: string): Promise<Record<string, unknown>> {
  const { data, error } = await serviceClient.from('invitations').select('*').eq('token', token).maybeSingle();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  if (!data) throw ApiError.notFound('Invitation not found.');

  return {
    token: data.token,
    email: data.email,
    full_name: data.full_name ?? null,
    role: data.role,
    business_name: data.business_name ?? null,
    invited_by: data.invited_by ?? null,
    status: data.status,
    expires_at: data.expires_at,
  };
}

/** §5 POST /auth/invitations/:token/accept — activate invited user. */
export async function acceptInvitation(token: string, input: { full_name: string; password: string }): Promise<Record<string, unknown>> {
  const { data: invitation, error: invitationError } = await serviceClient.from('invitations').select('*').eq('token', token).maybeSingle();
  if (invitationError) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: invitationError.message });
  if (!invitation) throw ApiError.notFound('Invitation not found.');

  const { data: createdUser, error: createErr } = await serviceClient.auth.admin.createUser({
    email: invitation.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
    app_metadata: { business_id: invitation.business_id, role: invitation.role, customer_id: null },
  });
  if (createErr) throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: createErr.message });

  const userId = createdUser.user?.id;
  if (!userId) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: 'User was not created.' });

  const { error: userErr } = await serviceClient.from('users').upsert({
    business_id: invitation.business_id,
    auth_user_id: userId,
    email: invitation.email,
    full_name: input.full_name,
    role: invitation.role,
    status: 'active',
    team_id: invitation.team_id ?? null,
  }, { onConflict: 'business_id,email' });
  if (userErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: userErr.message });

  const { error: inviteErr } = await serviceClient.from('invitations').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  }).eq('id', invitation.id);
  if (inviteErr) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: inviteErr.message });

  return { accepted: true, token, user_id: userId };
}

/** §5 POST /auth/session — current profile for SPA bootstrap. */
export async function session(token: string) {
  const { data: u, error } = await anonClient.auth.getUser(token);
  if (error || !u.user) throw ApiError.roleNotAllowed('Invalid token.');
  const claims = normalizeClaims(interpretJwt(token));
  return buildSessionPayload(
    u.user.id,
    u.user.email ?? claims.email ?? '',
    claims.role ?? 'sales_rep',
    claims.businessId,
    claims.customerId,
  );
}

/** Lightweight, dependency-free JWT claim decode (verification is via Supabase getUser). */
export function interpretJwt(token: string): Record<string, unknown> {
  try {
    const part = token.split('.')[1];
    if (!part) return {};
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}