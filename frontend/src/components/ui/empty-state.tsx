import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode | React.ElementType
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const renderedIcon = React.isValidElement(Icon)
    ? Icon
    : typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)
    ? React.createElement(Icon as React.ElementType, { className: 'h-10 w-10 mx-auto' })
    : Icon

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {renderedIcon && (
        <div className="mb-4 text-muted-foreground/50">
          {renderedIcon}
        </div>
      )}
      <h3 className="text-h3 font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-body-small text-muted-foreground max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}

export { EmptyState }
