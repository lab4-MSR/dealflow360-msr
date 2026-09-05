import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArticleType, HelpArticle, HelpCategory } from '@/types/shared'
import { ARTICLE_TYPE_LABELS, ARTICLE_TYPE_VARIANT } from '@/constants/shared'

type TypeFilter = 'all' | ArticleType

const TYPE_TABS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'guide', label: 'Guides' },
  { value: 'faq', label: 'FAQs' },
  { value: 'tutorial', label: 'Tutorials' },
]

interface ArticlesProps {
  articles: HelpArticle[]
  loading: boolean
  error: string | null
  onRetry: () => void
  query: string
  category: HelpCategory | 'all'
}

export function Articles({ articles, loading, error, onRetry, query, category }: ArticlesProps) {
  const [type, setType] = React.useState<TypeFilter>('all')

  React.useEffect(() => {
    setType('all')
  }, [category])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles.filter((article) => {
      if (category !== 'all' && article.category !== category) return false
      if (type !== 'all' && article.type !== type) return false
      if (q) {
        const haystack = `${article.title} ${article.summary ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [articles, category, type, query])

  const visible = query.trim() || category !== 'all' || type !== 'all'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3 text-foreground">Articles</h2>
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface-muted p-1">
          {TYPE_TABS.map((tab) => {
            const active = type === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                aria-pressed={active}
                className={cn(
                  'rounded-md px-3 py-1.5 text-label font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Unable to load help content"
          description={error}
          action={
            <button
              onClick={onRetry}
              className="rounded-lg bg-primary px-4 py-2 text-label font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Try Again
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No articles found"
          description={visible ? 'No articles match your search or filters.' : 'No help articles are available yet.'}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((article) => (
            <li key={article.id}>
              <a
                href={article.url ?? '#'}
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body font-medium text-foreground">{article.title}</p>
                  <Badge variant={ARTICLE_TYPE_VARIANT[article.type] ?? 'default'}>
                    {ARTICLE_TYPE_LABELS[article.type] ?? article.type}
                  </Badge>
                </div>
                {article.summary && (
                  <p className="mt-1 text-body-small text-muted-foreground">{article.summary}</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}