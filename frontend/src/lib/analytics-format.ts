/**
 * Display-only formatting helpers for the Analytics module (09).
 *
 * These helpers NEVER compute business-critical metrics; they only format values
 * already provided by the analytics API. `computeDelta` deliberately returns a null
 * percentage when the comparison value is missing or zero, so the UI can show an
 * honest "no comparison" state instead of a misleading percentage.
 */

export interface DeltaResult {
  /** Percentage change vs the comparison value, or null when insufficient data. */
  percent: number | null
  direction: 'up' | 'down' | 'flat'
  /** Absolute change, or null when insufficient data. */
  absolute: number | null
}

function isUsableNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Compact Indian-rupee amount, e.g. ₹12.4Cr / ₹84.2L — matches executive KPI style. */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Full Indian-rupee amount with no decimals, e.g. ₹12,40,000. */
export function formatCurrency(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Whole-number count, e.g. 1,284. */
export function formatCount(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return '—'
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
}

/** Compact count, e.g. 12.4K. */
export function formatCountCompact(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return '—'
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** Percentage that is already expressed in 0–100 scale, e.g. 18.4%. */
export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (!isUsableNumber(value)) return '—'
  return `${value.toFixed(digits)}%`
}

/** Duration in days, e.g. 3.2 days. */
export function formatDays(value: number | null | undefined): string {
  if (!isUsableNumber(value)) return '—'
  return `${value.toFixed(1)} days`
}

/**
 * Percentage change between two backend-provided values.
 * Returns percent: null when the comparison is unavailable (missing previous
 * period, or a zero base) so callers can render "No comparison available".
 */
export function computeDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
): DeltaResult {
  if (!isUsableNumber(current) || !isUsableNumber(previous) || previous === 0) {
    return { percent: null, direction: 'flat', absolute: null }
  }
  const absolute = current - previous
  const percent = (absolute / Math.abs(previous)) * 100
  const direction: DeltaResult['direction'] =
    Math.abs(percent) < 0.05 ? 'flat' : percent > 0 ? 'up' : 'down'
  return { percent, direction, absolute }
}

/** Signed percentage text for KPI comparison lines, e.g. "+18.4%" / "—". */
export function formatDeltaText(delta: DeltaResult, digits = 1): string {
  if (delta.percent === null) return '—'
  const sign = delta.percent > 0 ? '+' : ''
  return `${sign}${delta.percent.toFixed(digits)}%`
}

/**
 * Change values for KpiCard. Returns undefined when there is no valid comparison
 * so the card renders without a (misleading) trend indicator.
 */
export function kpiChange(
  current: number | null | undefined,
  previous: number | null | undefined,
): { value: number; direction: 'up' | 'down' | 'neutral' } | undefined {
  const delta = computeDelta(current, previous)
  if (delta.percent === null) return undefined
  return {
    value: Number(delta.percent.toFixed(1)),
    direction: delta.direction === 'flat' ? 'neutral' : delta.direction,
  }
}
