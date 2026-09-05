import * as React from 'react'
import { BookOpen, Scale, Sparkles, ArrowUpRight } from 'lucide-react'
import { RESOURCE_LINKS } from '@/constants/shared'

const RESOURCE_ICON: Record<string, React.ElementType> = {
  documentation: BookOpen,
  'business-rules': Scale,
  'release-notes': Sparkles,
}

export function Resources() {
  return (
    <div>
      <h2 className="text-h3 text-foreground mb-4">Resources</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_LINKS.map((resource) => {
          const Icon = RESOURCE_ICON[resource.id] ?? BookOpen
          return (
            <a
              key={resource.id}
              href={resource.url}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
              </div>
              <p className="mt-3 text-body font-medium text-foreground">{resource.label}</p>
              <p className="text-caption text-muted-foreground mt-0.5">{resource.description}</p>
            </a>
          )
        })}
      </div>
    </div>
  )
}