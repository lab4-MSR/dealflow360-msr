import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: { label: string; path?: string }[]
  badge?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, breadcrumbs, badge, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-3.5', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-caption text-muted-foreground mb-1.5 overflow-x-auto whitespace-nowrap">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border">/</span>}
              {crumb.path ? (
                <a href={crumb.path} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed max-w-3xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

