import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

/**
 * Format an ISO timestamp as a relative, human friendly string.
 * Falls back to a formatted absolute timestamp for empty/invalid values so the
 * UI never renders "NaN" or "Invalid Date".
 */
export function formatRelativeTime(value?: string | null): string {
  if (!value) return '—'
  const date = parseISO(value)
  if (!isValid(date)) return '—'
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * Format an ISO timestamp in the given IANA timezone using the browser locale,
 * applying the user's preferred date format where known.
 */
export function formatInTimezone(
  value: string | null | undefined,
  timezone: string,
  dateFormat: string,
  includeTime = true,
): string {
  if (!value) return '—'
  const date = parseISO(value)
  if (!isValid(date)) return '—'

  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone && timezone !== 'UTC' ? timezone : undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }
    return new Intl.DateTimeFormat(undefined, options).format(date)
  } catch {
    // Unknown timezone — fall back to default formatting.
    return format(date, dateFormat || 'MM/dd/yyyy')
  }
}

export function fullTimestamp(value?: string | null): string {
  if (!value) return '—'
  const date = parseISO(value)
  if (!isValid(date)) return '—'
  return format(date, 'PPP p')
}