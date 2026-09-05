import { ApiError } from './apiErrors';

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

type Envelope = Record<string, unknown>;

/**
 * Contract §2.5/§2.6 response envelope. Every response goes through ok()/fail().
 *
 * Success (single resource / action):
 *   { success: true, data, meta: null|null, error: null }
 * Success (list):
 *   { success: true, data: [], meta: {page,per_page,total,total_pages}, error: null }
 * Error:
 *   { success: false, data: null, meta: null, error: {code, message, field?, details?} }
 */
export function buildListMeta(total: number, page = 1, perPage = 20): Pagination {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : 20;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  return { page: safePage, per_page: safePerPage, total, total_pages: totalPages };
}

export const envelope = {
  ok<T>(data: T, meta: Pagination | null = null): Envelope {
    return { success: true, data, meta, error: null };
  },

  okList<T>(data: T[], meta: Pagination | null = null): Envelope {
    const resolvedMeta = meta ?? buildListMeta(data.length);
    return { success: true, data, meta: resolvedMeta, error: null };
  },

  fail(err: ApiError): Envelope {
    const error: Record<string, unknown> = { code: err.code, message: err.message };
    if (err.field !== undefined) error.field = err.field;
    if (err.details !== undefined) error.details = err.details;
    return { success: false, data: null, meta: null, error };
  },
};