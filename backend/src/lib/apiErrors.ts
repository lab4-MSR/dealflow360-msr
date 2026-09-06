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

/** Convert an unknown thrown value into an ApiError, preserving known codes and human readability. */
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => {
      const pathStr = issue.path.filter((p) => typeof p === 'string' || typeof p === 'number').join('.');
      if (!pathStr) return issue.message;
      if (issue.message.toLowerCase() === 'required') {
        return `"${pathStr.replace(/_/g, ' ')}" is required`;
      }
      return `"${pathStr.replace(/_/g, ' ')}": ${issue.message}`;
    });
    const mainMessage = formatted[0] || 'Validation failed. Please check the entered data.';
    const firstField = err.issues[0]?.path?.filter((p) => typeof p === 'string' || typeof p === 'number').join('.') || undefined;
    return ApiError.validation(mainMessage, firstField, {
      issues: err.issues,
      messages: formatted,
    });
  }

  // Handle PostgREST and PostgreSQL error codes
  if (typeof err === 'object' && err !== null) {
    const pgErr = err as {
      code?: string;
      message?: string;
      detail?: string;
      details?: string;
      column?: string;
      table?: string;
    };

    if (pgErr.code === 'PGRST116') {
      return ApiError.notFound('The requested record could not be found.');
    }

    if (pgErr.code === '23505') {
      const match = (pgErr.detail || pgErr.message || '').match(/Key \((.+?)\)=\((.+?)\) already exists/);
      const msg = match
        ? `A record with ${match[1].replace(/_/g, ' ')} "${match[2]}" already exists.`
        : 'A record with this identifier or name already exists.';
      return new ApiError({
        code: ErrorCode.IDEMPOTENCY_CONFLICT,
        message: msg,
        field: match ? match[1] : undefined,
        status: 409,
        details: { detail: pgErr.detail },
      });
    }

    if (pgErr.code === '23503') {
      return new ApiError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'The referenced record does not exist or has been deleted.',
        status: 422,
        details: { detail: pgErr.detail },
      });
    }

    if (pgErr.code === '23502') {
      const col = pgErr.column ? `"${pgErr.column.replace(/_/g, ' ')}"` : 'Required field';
      return ApiError.validation(`${col} cannot be empty.`, pgErr.column);
    }

    if (pgErr.code === '22P02') {
      return ApiError.validation('Invalid format or identifier provided.');
    }
  }

  if (err instanceof Error) {
    if (err.message.includes('duplicate key value violates unique constraint')) {
      const match = err.message.match(/Key \((.+?)\)=\((.+?)\) already exists/);
      const msg = match
        ? `A record with ${match[1].replace(/_/g, ' ')} "${match[2]}" already exists.`
        : 'A record with this identifier already exists.';
      return new ApiError({
        code: ErrorCode.IDEMPOTENCY_CONFLICT,
        message: msg,
        status: 409,
      });
    }
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