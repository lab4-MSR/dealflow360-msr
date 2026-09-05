import type { NextFunction, Request, Response } from 'express';
import { ApiError, ErrorCode } from '../lib/apiErrors';

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 120; // §20: default 120 req/min per user
const BULK_LIMIT = 10; // §20: bulk/export endpoints 10 req/min

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter keyed by user id (or IP when unauthenticated).
 * Not for production multi-instance use, but matches the §20 defaults for a
 * single-node backend.
 */
export function rateLimit(opts: { limit?: number; keyPrefix?: string } = {}) {
  const bLimit = opts.limit ?? DEFAULT_LIMIT;
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.auth?.user_id ?? req.ip ?? 'anon';
    const key = `${opts.keyPrefix ?? ''}${userId}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > bLimit) {
      return next(
        new ApiError({
          code: ErrorCode.RATE_LIMITED,
          message: 'Too many requests. Please slow down and try again.',
          details: { limit: bLimit, window_ms: WINDOW_MS },
        }),
      );
    }
    next();
  };
}

export function bulkRateLimit() {
  return rateLimit({ limit: BULK_LIMIT, keyPrefix: 'bulk:' });
}