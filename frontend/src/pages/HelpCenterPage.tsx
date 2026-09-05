import * as React from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { HelpHeader, HelpCategories, Articles, Support, Resources } from '@/components/help'
import { sharedApi } from '@/lib/shared-api'
import { getErrorMessage } from '@/lib/errors'
import type { HelpCategory, SupportTicket, CreateTicketPayload } from '@/types/shared'

export function HelpCenterPage() {
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [category, setCategory] = React.useState<HelpCategory | 'all'>('all')
  const [submittedTicket, setSubmittedTicket] = React.useState<SupportTicket | null>(null)
  const [ticketError, setTicketError] = React.useState<string | null>(null)
  const supportRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const articlesQuery = useQuery({
    queryKey: ['help-articles'],
    queryFn: () => sharedApi.helpArticles(),
  })

  const createTicket = useMutation({
    mutationFn: (payload: CreateTicketPayload) => sharedApi.createSupportTicket(payload),
    onSuccess: (ticket) => {
      setSubmittedTicket(ticket)
      setTicketError(null)
      toast.success('Support ticket submitted')
    },
    onError: (err) => setTicketError(getErrorMessage(err)),
  })

  const handleContactSupport = () => {
    supportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    supportRef.current?.focus()
  }

  return (
    <div className="space-y-8">
      <HelpHeader
        search={search}
        onSearchChange={setSearch}
        onContactSupport={handleContactSupport}
      />

      <section aria-label="Help categories">
        <HelpCategories selected={category} onSelect={setCategory} />
      </section>

      <section aria-label="Articles">
        <Articles
          articles={articlesQuery.data ?? []}
          loading={articlesQuery.isLoading}
          error={articlesQuery.error ? getErrorMessage(articlesQuery.error) : null}
          onRetry={() => articlesQuery.refetch()}
          query={debouncedSearch}
          category={category}
        />
      </section>

      <div
        aria-label="Support"
        ref={supportRef}
        tabIndex={-1}
        className="focus:outline-none"
      >
        <Support
          onContactSupport={handleContactSupport}
          onCreateTicket={(payload) => createTicket.mutateAsync(payload)}
          submittedTicket={submittedTicket}
          ticketError={ticketError}
          submitting={createTicket.isPending}
        />
      </div>

      <section aria-label="Resources">
        <Resources />
      </section>
    </div>
  )
}