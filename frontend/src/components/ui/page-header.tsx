import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  path?: string
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: BreadcrumbItem[]
  badge?: React.ReactNode
  actions?: React.ReactNode
  bordered?: boolean
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  badge,
  actions,
  bordered = true,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        bordered && 'border-b border-border/80 pb-5',
        className
      )}
      {...props}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none py-0.5"
        >
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1
            const to = crumb.href || crumb.path

            return (
              <span key={idx} className="inline-flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                )}
                {to && !isLast ? (
                  <Link
                    to={to}
                    className="hover:text-foreground transition-colors font-medium text-muted-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {badge && <div className="inline-flex items-center shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-4xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-start">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
