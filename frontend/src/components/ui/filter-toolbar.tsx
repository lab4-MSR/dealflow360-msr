import * as React from 'react'
import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FilterToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: React.ReactNode
  actions?: React.ReactNode
  bordered?: boolean
}

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters,
  actions,
  bordered = true,
  className,
  children,
  ...props
}: FilterToolbarProps) {
  const showSearch = onSearchChange !== undefined

  return (
    <Card className={cn(!bordered && 'border-none shadow-none bg-transparent', className)} {...props}>
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
            {showSearch && (
              <div className="relative w-full sm:max-w-xs md:max-w-sm shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={search ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 h-9 text-xs sm:text-sm bg-surface"
                />
              </div>
            )}
            {filters && <div className="flex flex-wrap items-center gap-2 min-w-0">{filters}</div>}
          </div>

          {(actions || children) && (
            <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
              {actions}
              {children}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
