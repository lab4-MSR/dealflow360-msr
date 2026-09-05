import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

/**
 * Server-side Supabase clients.
 *
 * The service-role client bypasses RLS and is the primary DB/Auth access path
 * for the backend API. Auth against the anon key is used only for public
 * endpoints where the frontend/anon role is the appropriate principal
 * (e.g. sign-up / magic-link flows that Supabase expects from a user client).
 */
const supabaseUrl = env.supabaseUrl || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = env.supabaseServiceRoleKey || 'placeholder-service-role-key';
const supabaseAnonKey = env.supabaseAnonKey || 'placeholder-anon-key';

export const serviceClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Client used with a specific user JWT (respects RLS on remote calls). */
export function withAuth(jwt: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Anon client (no user JWT) for genuinely public flows. */
export const anonClient: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } },
);