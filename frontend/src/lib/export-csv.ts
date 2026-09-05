/**
 * Browser-side CSV download utility for DealFlow360 Analytics & BI module.
 */
export function downloadCsv(filename: string, data: Record<string, any>[]) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? ''
          const escaped = String(val).replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(','),
    ),
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportToCsv(data: Record<string, any>[], filename: string) {
  downloadCsv(filename, data)
}

