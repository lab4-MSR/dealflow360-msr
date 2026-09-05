import { isAxiosError } from 'axios'

/**
 * Extract a safe, human-friendly message from an unknown error.
 * Never surfaces raw stack traces or backend internals.
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: { message?: string } } | undefined
    const candidate = data?.message ?? data?.error?.message
    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }
    if (error.code === 'ERR_NETWORK') return 'Network error — please check your connection and try again.'
    return fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export const extractApiError = getErrorMessage