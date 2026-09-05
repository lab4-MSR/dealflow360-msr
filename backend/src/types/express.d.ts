// Global type augmentation so handlers can read the decoded JWT claims.
declare global {
  namespace Express {
    interface Request {
      /** Raw Supabase JWT payload set by authenticate middleware. */
      auth?: Record<string, unknown> | null;
      /** Fully-typed claims (see lib/context.ts getAuth). */
      user?: import('../lib/context').AuthContext;
    }
  }
}

export {};