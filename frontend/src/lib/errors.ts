import { isAxiosError } from 'axios'
import { toast } from 'sonner'

/** Friendly explanations for known DealFlow360 business error codes (§19). */
const CODE_DESCRIPTIONS: Record<string, string> = {
  VALIDATION_ERROR: 'Submitted data is invalid. Please review highlighted fields.',
  ROLE_NOT_ALLOWED: 'You do not have permission to perform this action.',
  TENANT_MISMATCH: 'Access denied: Record belongs to another organization.',
  RESOURCE_NOT_FOUND: 'The requested record could not be found.',
  DISCOUNT_LIMIT_EXCEEDED: 'The proposed discount exceeds your authorized approval limit.',
  MARGIN_BELOW_MINIMUM: 'Deal margin falls below the minimum required profitability threshold.',
  APPROVAL_ALREADY_DECIDED: 'This approval step has already been processed and decided.',
  QUOTATION_LOCKED: 'Quotation is locked because it is finalized or under active approval.',
  INSUFFICIENT_STOCK: 'Insufficient inventory stock for one or more quotation line items.',
  RE_APPROVAL_REQUIRED: 'Modifications require re-submitting this quotation for approval.',
  PLAN_CHANGE_INVALID: 'Selected subscription plan change is not permitted.',
  PAYMENT_FAILED: 'Payment processing failed. Please check payment credentials and retry.',
  IDEMPOTENCY_CONFLICT: 'A record with this identifier, name, or code already exists.',
  RATE_LIMITED: 'Too many requests. Please wait a few moments before trying again.',
  INTERNAL_ERROR: 'An unexpected server error occurred. Please try again shortly.',
}

/** HTTP status code fallback explanations. */
const STATUS_DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid request. Please check the entered information.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  408: 'Request timed out. Please try again.',
  409: 'Operation conflict: The record may have already been updated or exists.',
  413: 'The uploaded file or payload exceeds the allowed size limit.',
  422: 'Validation error: Please verify your form entries.',
  429: 'Too many attempts. Please pause a moment before retrying.',
  500: 'Server encountered an issue processing your request. Please try again.',
  502: 'Service gateway is temporarily unreachable. Please retry shortly.',
  503: 'DealFlow360 service is currently unavailable. Please try again in a moment.',
  504: 'Server response timed out. Please try again.',
}

interface ApiEnvelopeError {
  code?: string
  message?: string
  field?: string
  details?: {
    messages?: string[]
    issues?: Array<{ path?: Array<string | number>; message?: string }>
    detail?: string
    [key: string]: unknown
  }
}

/**
 * Extract a readable, exact, human-friendly error message from any error shape.
 * Never displays raw technical stack traces, HTTP codes, or generic "An unexpected error occurred".
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!error) return fallback

  // 1. Axios HTTP Errors
  if (isAxiosError(error)) {
    // Network / timeout failure without response
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Network connection error — unable to reach DealFlow360 servers. Please check your internet connection.'
    }
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      return 'The request timed out. The server took too long to respond. Please try again.'
    }

    const res = error.response
    const data = res?.data as
      | {
          error?: ApiEnvelopeError | string
          message?: string
          error_description?: string
          msg?: string
          detail?: string
          title?: string
          errors?: string[] | Record<string, string | string[]>
        }
      | string
      | undefined

    // Handle string body (e.g. HTML 502/504 error from nginx/gateway)
    if (typeof data === 'string') {
      if (data.includes('<!DOCTYPE') || data.includes('<html')) {
        return STATUS_DESCRIPTIONS[res.status] || `Server error (${res.status}). Please try again later.`
      }
      if (data.trim()) return data.trim()
    }

    if (data && typeof data === 'object') {
      // 1.1 DealFlow360 Envelope Error Object: { error: { message, code, field, details } }
      if (data.error && typeof data.error === 'object') {
        const envErr = data.error

        // Check for specific validation messages list
        if (Array.isArray(envErr.details?.messages) && envErr.details.messages.length > 0) {
          return envErr.details.messages.join('; ')
        }

        // Check for Zod issues
        if (Array.isArray(envErr.details?.issues) && envErr.details.issues.length > 0) {
          const formatted = envErr.details.issues
            .map((iss) => {
              const path = iss.path?.filter((p) => p !== undefined).join('.')
              if (!path) return iss.message
              return `"${path.replace(/_/g, ' ')}": ${iss.message}`
            })
            .filter(Boolean)
          if (formatted.length > 0) return formatted.join('; ')
        }

        // If specific message exists
        if (envErr.message && typeof envErr.message === 'string' && envErr.message.trim()) {
          const cleanMsg = cleanTechnicalMessage(envErr.message)
          if (envErr.field && !cleanMsg.toLowerCase().includes(envErr.field.toLowerCase())) {
            return `"${envErr.field.replace(/_/g, ' ')}": ${cleanMsg}`
          }
          return cleanMsg
        }

        // Fallback to error code description
        if (envErr.code && CODE_DESCRIPTIONS[envErr.code]) {
          return CODE_DESCRIPTIONS[envErr.code]
        }
      }

      // 1.2 Direct string error: { error: "Invalid credentials" }
      if (typeof data.error === 'string' && data.error.trim()) {
        return cleanTechnicalMessage(data.error.trim())
      }

      // 1.3 Direct message: { message: "Quotation is locked" }
      if (typeof data.message === 'string' && data.message.trim()) {
        return cleanTechnicalMessage(data.message.trim())
      }

      // 1.4 Supabase Auth / OAuth: { error_description: "Invalid login credentials" }
      if (typeof data.error_description === 'string' && data.error_description.trim()) {
        return cleanTechnicalMessage(data.error_description.trim())
      }

      // 1.5 Alternative message keys: { msg: "..." } or { detail: "..." }
      if (typeof data.msg === 'string' && data.msg.trim()) {
        return cleanTechnicalMessage(data.msg.trim())
      }
      if (typeof data.detail === 'string' && data.detail.trim()) {
        return cleanTechnicalMessage(data.detail.trim())
      }
      if (typeof data.title === 'string' && data.title.trim()) {
        return cleanTechnicalMessage(data.title.trim())
      }

      // 1.6 Errors dictionary / array
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map(String).join('; ')
      }
      if (data.errors && typeof data.errors === 'object') {
        const parts = Object.entries(data.errors).map(([key, val]) => {
          const valStr = Array.isArray(val) ? val.join(', ') : String(val)
          return `"${key.replace(/_/g, ' ')}": ${valStr}`
        })
        if (parts.length > 0) return parts.join('; ')
      }
    }

    // 1.7 HTTP status fallback
    if (res.status && STATUS_DESCRIPTIONS[res.status]) {
      return STATUS_DESCRIPTIONS[res.status]
    }

    // Filter out unhelpful Axios raw message e.g. "Request failed with status code 400"
    if (error.message && !error.message.startsWith('Request failed with status code')) {
      return cleanTechnicalMessage(error.message)
    }

    return fallback
  }

  // 2. Standard JavaScript Error
  if (error instanceof Error) {
    if (error.message) {
      return cleanTechnicalMessage(error.message)
    }
    return fallback
  }

  // 3. String error
  if (typeof error === 'string' && error.trim()) {
    return cleanTechnicalMessage(error.trim())
  }

  // 4. Arbitrary object with message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = String((error as { message?: unknown }).message)
    if (msg.trim()) return cleanTechnicalMessage(msg.trim())
  }

  return fallback
}

/** Sanitize raw technical database jargon into clean, plain-English messages. */
function cleanTechnicalMessage(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()

  // Postgres unique violation
  if (trimmed.includes('duplicate key value violates unique constraint')) {
    const match = trimmed.match(/Key \((.+?)\)=\((.+?)\) already exists/i)
    if (match) {
      return `A record with ${match[1].replace(/_/g, ' ')} "${match[2]}" already exists.`
    }
    return 'A record with this identifier or name already exists.'
  }

  // Postgres foreign key violation
  if (trimmed.includes('violates foreign key constraint')) {
    return 'This record cannot be deleted or modified because other items depend on it.'
  }

  // Postgres not-null violation
  if (trimmed.includes('violates not-null constraint')) {
    const match = trimmed.match(/column "(.+?)"/i)
    if (match) {
      return `Field "${match[1].replace(/_/g, ' ')}" is required and cannot be empty.`
    }
    return 'A required field cannot be empty.'
  }

  // Network fetch error
  if (trimmed.toLowerCase().includes('failed to fetch')) {
    return 'Unable to reach the server. Please check your internet connection.'
  }

  // JSON parsing error
  if (trimmed.toLowerCase().includes('unexpected token') || trimmed.toLowerCase().includes('syntaxerror')) {
    return 'Invalid response format received from server.'
  }

  // Remove "Error: " prefix if present
  return trimmed.replace(/^Error:\s*/i, '')
}

/**
 * Format error with an action context prefix.
 * e.g., formatError(err, 'Failed to update approval rule')
 * -> "Failed to update approval rule: Rule is assigned to 2 quotations."
 */
export function formatError(error: unknown, actionPrefix?: string): string {
  const message = getErrorMessage(error)
  if (!actionPrefix) return message
  if (message.toLowerCase().startsWith(actionPrefix.toLowerCase())) return message
  return `${actionPrefix}: ${message}`
}

/**
 * Display a readable dual-line error toast via Sonner.
 * Shows the action as the bold title and the exact server reason as the description.
 */
export function showErrorToast(error: unknown, defaultTitle = 'Action failed'): void {
  const exactMessage = getErrorMessage(error)
  if (exactMessage && exactMessage !== defaultTitle) {
    toast.error(defaultTitle, { description: exactMessage })
  } else {
    toast.error(defaultTitle)
  }
}

export const extractApiError = getErrorMessage
