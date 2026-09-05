import dotenv from 'dotenv';
dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',

  port: Number(process.env.PORT ?? 5000),

  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
} as const;

/** Fail fast with a clear message if required env vars are missing. */
export function assertEnv(): void {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push('SUPABASE_URL');
  if (!env.supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  if (!env.supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    console.error(
      `[config] Missing required environment variables: ${missing.join(', ')}.\n` +
        `Copy backend/.env.example to backend/.env and fill in your Supabase project values.`,
    );
  }
}