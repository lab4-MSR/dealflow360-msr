import { ApiError, ErrorCode } from './apiErrors';
import type { Pagination } from './envelope';

export interface ListQuery {
  page: number;
  per_page: number;
  sort: string | null;
  search: string | null;
  filters: Record<string, string>;
}

/**
 * Parse the shared list convention (§2.4):
 *   page (default 1), per_page (default 20, max 100),
 *   sort ("-created_at" = desc), search, filter[field]=value.
 */
export function parseListQuery(q: Record<string, unknown>): ListQuery {
  const page = clampInt(q.page, 1, Number.MAX_SAFE_INTEGER, 1);
  const per_page = clampInt(q.per_page, 1, 100, 20);

  const sort = typeof q.sort === 'string' && q.sort ? q.sort : null;
  const search = typeof q.search === 'string' && q.search ? q.search : null;

  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (k.startsWith('filter[') && k.endsWith(']')) {
      const key = k.slice(7, -1);
      if (typeof v === 'string') filters[key] = v;
    }
  }

  return { page, per_page, sort, search, filters };
}

export function pagination(page: number, per_page: number, total: number): Pagination {
  return {
    page,
    per_page,
    total,
    total_pages: total === 0 ? 0 : Math.max(1, Math.ceil(total / per_page)),
  };
}

function clampInt(v: unknown, min: number, max: number, def: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function requireParam(req: { params: Record<string, string> }, name: string): string {
  const v = req.params?.[name];
  if (!v) {
    throw new ApiError({ code: ErrorCode.VALIDATION_ERROR, message: `Missing required path parameter: ${name}`, field: name });
  }
  return v;
}