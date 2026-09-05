import { createHash } from 'crypto';
import type { Request, Response } from 'express';
import type { NextFunction } from 'express';
import { serviceClient } from '../lib/supabase';
import { ApiError, ErrorCode } from '../lib/apiErrors';

const TTL_MS = 24 * 60 * 60 * 1000; // 24h idempotency life

function hashRequest(req: Request): string {
  return createHash('sha256').update(JSON.stringify(req.body ?? {})).digest('hex');
}

/**
 * Optional Idempotency-Key support (§2.7) for mutating endpoints that touch
 * money, discounts, or approvals.
 *
 *  - No header            -> process normally.
 *  - Header + stored key with same body hash -> return the original result (replay).
 *  - Header + stored key with DIFFERENT body -> 409 IDEMPOTENCY_CONFLICT.
 *  - Header + new key     -> run the handler, persist the response JSON for replay.
 */
export function idempotent(handler: (req: Request, res: Response, next: NextFunction) => void) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.headers['idempotency-key'];
    if (typeof key !== 'string' || !key.trim()) {
      return void handler(req, res, next);
    }

    const businessId = req.auth?.business_id ?? null;
    if (!businessId) {
      // Idempotency without a tenant context is unusual; process normally.
      return void handler(req, res, next);
    }

    const now = new Date();
    const { data: existing } = await serviceClient
      .from('idempotency_keys')
      .select('*')
      .eq('business_id', businessId)
      .eq('key', key)
      .maybeSingle();

    const bodyHash = hashRequest(req);

    if (existing) {
      if (existing.expires_at && new Date(existing.expires_at) < now) {
        // expired -> treat as new below
      } else if (existing.request_hash !== bodyHash) {
        return void next(
          new ApiError({
            code: ErrorCode.IDEMPOTENCY_CONFLICT,
            message: 'Idempotency-Key was already used with a different request body.',
          }),
        );
      } else if (existing.response) {
        return void res.status(200).json(existing.response);
      }
    }

    // Intercept res.json to capture the response for replay.
    const original = res.json.bind(res);
    res.json = ((body: unknown) => {
      res.json = original;
      // Persist best-effort; log and continue on failure (do not break the response).
      void (async () => {
        const { error } = await serviceClient
          .from('idempotency_keys')
          .upsert(
            {
              business_id: businessId,
              key,
              request_hash: bodyHash,
              response: body as object,
              created_at: now.toISOString(),
              expires_at: new Date(Date.now() + TTL_MS).toISOString(),
            },
            { onConflict: 'business_id,key' },
          );
        if (error) console.error('[idempotency] failed to persist:', error.message);
      })();
      return original(body);
    }) as typeof res.json;

    return void handler(req, res, next);
  };
}