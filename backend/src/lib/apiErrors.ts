import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * Single source of truth for every machine-readable error code (§19).
 * Do not add codes that are not in the contract.
 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ROLE_NOT_ALLOWED: 'ROLE_NOT_ALLOWED',
  TENANT_MISMATCH: 'TENANT_MISMATCH',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DISCOUNT_LIMIT_EXCEEDED: 'DISCOUNT_LIMIT_EXCEEDED',
  MARGIN_BELOW_MINIMUM: 'MARGIN_BELOW_MINIMUM',
  APPROVAL_ALREADY_DECIDED: 'APPROVAL_ALREADY_DECIDED',
  QUOTATION_LOCKED: 'QUOTATION_LOCKED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  RE_APPROVAL_REQUIRED: 'RE_APPROVAL_REQUIRED',
  PLAN_CHANGE_INVALID: 'PLAN_CHANGE_INVALID',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/** HTTP status -> contract code mapping (§19). */
export const HTTP_STATUS_BY_CODE: Record<ErrorCodeValue, number> = {
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.ROLE_NOT_ALLOWED]: 403,
  [ErrorCode.TENANT_MISMATCH]: 403,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.DISCOUNT_LIMIT_EXCEEDED]: 409,
  [ErrorCode.MARGIN_BELOW_MINIMUM]: 409,
  [ErrorCode.APPROVAL_ALREADY_DECIDED]: 409,
  [ErrorCode.QUOTATION_LOCKED]: 409,
  [ErrorCode.INSUFFICIENT_STOCK]: 409,
  [ErrorCode.RE_APPROVAL_REQUIRED]: 409,
  [ErrorCode.PLAN_CHANGE_INVALID]: 422,
  [ErrorCode.PAYMENT_FAILED]: 402,
  [ErrorCode.IDEMPOTENCY_CONFLICT]: 409,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

interface ApiErrorOptions {
  code: ErrorCodeValue;
  message: string;
  /** Dot-path to the offending field, e.g. "lines[1].discount_percent". */
  field?: string;
  details?: Record<string, unknown>;
  status?: number;
}

/** Contract error shape: { code, message, field?, details? }. */
export class ApiError extends Error {
  readonly code: ErrorCodeValue;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
  readonly status: number;

  constructor(opts: ApiErrorOptions) {
    super(opts.message);
    this.name = 'ApiError';
    this.code = opts.code;
    this.field = opts.field;
    this.details = opts.details;
    this.status = opts.status ?? HTTP_STATUS_BY_CODE[opts.code];
  }

  static notFound(message = 'Resource not found.'): ApiError {
    return new ApiError({ code: ErrorCode.RESOURCE_NOT_FOUND, message });
  }
  static tenantMismatch(message = 'Resource belongs to a different business.'): ApiError {
    return new ApiError({ code: ErrorCode.TENANT_MISMATCH, message });
  }
  static roleNotAllowed(message = 'Your role is not allowed to perform this action.'): ApiError {
    return new ApiError({ code: ErrorCode.ROLE_NOT_ALLOWED, message });
  }
  static validation(message: string, field?: string, details?: Record<string, unknown>): ApiError {
    return new ApiError({ code: ErrorCode.VALIDATION_ERROR, message, field, details });
  }
}

/** Convert an unknown thrown value into an ApiError, preserving known codes. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return ApiError.validation(
      first?.message ?? 'Request body failed schema validation.',
      first ? first.path.join('.') : undefined,
      { issues: err.issues },
    );
  }
  if (err instanceof Error) {
    return new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: err.message });
  }
  return new ApiError({ code: ErrorCode.INTERNAL_ERROR, message: 'An unexpected error occurred.' });
}

// Express 5 handles async handlers' rejected promises automatically, but we
// attach this helper for clarity and to allow wrapping where needed.
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;