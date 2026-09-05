import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

function tenant(businessId: string | null): string {
  if (!businessId) throw new ApiError({ code: ErrorCode.TENANT_MISMATCH, message: 'Requires tenant context.' });
  return businessId;
}

async function profile(businessId: string, authUserId: string) {
  const { data, error } = await serviceClient.from('users').select('*').eq('business_id', tenant(businessId)).eq('auth_user_id', authUserId).maybeSingle();
  if (error || !data) throw ApiError.notFound('User profile not found.');
  return data;
}

export async function listNotifications(businessId: string, authUserId: string) {
  const user = await profile(businessId, authUserId);
  const { data, error } = await serviceClient.from('notifications').select('*').eq('business_id', businessId).or(`user_id.eq.${user.id},user_id.is.null`).order('created_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function markNotificationRead(businessId: string, authUserId: string, notificationId: string) {
  const user = await profile(businessId, authUserId);
  const { data, error } = await serviceClient.from('notifications').update({ read: true }).eq('business_id', businessId).eq('id', notificationId).or(`user_id.eq.${user.id},user_id.is.null`).select().maybeSingle();
  if (error || !data) throw ApiError.notFound('Notification not found.');
  return data;
}

export async function markAllNotificationsRead(businessId: string, authUserId: string) {
  const user = await profile(businessId, authUserId);
  const { error } = await serviceClient.from('notifications').update({ read: true }).eq('business_id', businessId).eq('user_id', user.id);
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return null;
}

export async function getProfile(businessId: string, authUserId: string) {
  const user = await profile(businessId, authUserId);
  const { data: preferences } = await serviceClient.from('user_preferences').select('data').eq('business_id', businessId).eq('user_id', user.id).maybeSingle();
  return { ...user, preferences: preferences?.data ?? {} };
}

export async function updateProfile(businessId: string, authUserId: string, input: Record<string, unknown>) {
  const user = await profile(businessId, authUserId);
  const patch: Record<string, unknown> = {};
  for (const key of ['full_name', 'phone', 'job_title', 'avatar_url']) if (input[key] !== undefined) patch[key] = input[key];
  const { data, error } = await serviceClient.from('users').update(patch).eq('business_id', businessId).eq('id', user.id).select().single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data;
}

export async function getPreferences(businessId: string, authUserId: string) {
  const user = await profile(businessId, authUserId);
  const { data } = await serviceClient.from('user_preferences').select('data').eq('business_id', businessId).eq('user_id', user.id).maybeSingle();
  return data?.data ?? {};
}

export async function updatePreferences(businessId: string, authUserId: string, input: Record<string, unknown>) {
  const user = await profile(businessId, authUserId);
  const { data, error } = await serviceClient.from('user_preferences').upsert({ business_id: businessId, user_id: user.id, data: input }, { onConflict: 'user_id' }).select('data').single();
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data.data;
}

export async function listSessions(businessId: string, authUserId: string) {
  const user = await profile(businessId, authUserId);
  const { data, error } = await serviceClient.from('user_sessions').select('*').eq('business_id', businessId).eq('user_id', user.id).is('revoked_at', null).order('last_seen_at', { ascending: false });
  if (error) throw new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: error.message });
  return data ?? [];
}

export async function revokeSession(businessId: string, authUserId: string, sessionId: string) {
  const user = await profile(businessId, authUserId);
  const { data, error } = await serviceClient.from('user_sessions').update({ revoked_at: new Date().toISOString() }).eq('business_id', businessId).eq('user_id', user.id).eq('id', sessionId).select().maybeSingle();
  if (error || !data) throw ApiError.notFound('Session not found.');
  return data;
}

export async function search(businessId: string, query: string) {
  const id = tenant(businessId);
  const term = `%${query}%`;
  const [customers, products, deals, quotations] = await Promise.all([
    serviceClient.from('customers').select('id,name,status').eq('business_id', id).ilike('name', term).limit(20),
    serviceClient.from('products').select('id,name,status').eq('business_id', id).ilike('name', term).limit(20),
    serviceClient.from('deals').select('id,name,stage').eq('business_id', id).ilike('name', term).limit(20),
    serviceClient.from('quotations').select('id,quote_number,status').eq('business_id', id).ilike('quote_number', term).limit(20),
  ]);
  return [
    ...(customers.data ?? []).map((row) => ({ type: 'customer', id: row.id, title: row.name, subtitle: 'Customer', status: row.status, url: `/sales/customers/${row.id}` })),
    ...(products.data ?? []).map((row) => ({ type: 'product', id: row.id, title: row.name, subtitle: 'Product', status: row.status, url: `/business-admin/products/${row.id}` })),
    ...(deals.data ?? []).map((row) => ({ type: 'deal', id: row.id, title: row.name, subtitle: 'Deal', status: row.stage, url: `/sales/deals/${row.id}` })),
    ...(quotations.data ?? []).map((row) => ({ type: 'quotation', id: row.id, title: row.quote_number, subtitle: 'Quotation', status: row.status, url: `/sales/quotations/${row.id}` })),
  ];
}