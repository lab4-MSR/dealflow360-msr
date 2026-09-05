import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  getRowId?: (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  selectedIds = [],
  onSelectionChange,
  getRowId = (row) => row.id as string,
  onRowClick,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((row) => selectedIds.includes(getRowId(row)))
  const someSelected = data.some((row) => selectedIds.includes(getRowId(row)))

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(data.map((row) => getRowId(row)))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedIds, rowId])
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId))
    }
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-body-small text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-border', className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.id} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const rowId = getRowId(row)
            const isSelected = selectedIds.includes(rowId)
            return (
              <TableRow
                key={rowId}
                data-state={isSelected ? 'selected' : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
                onClick={() => onRowClick?.(row)}
              >
                {onSelectionChange && (
                  <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectRow(rowId, !!checked)}
                      aria-label={`Select ${rowId}`}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.id} className={col.className}>
                    {col.accessorFn
                      ? col.accessorFn(row)
                      : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
