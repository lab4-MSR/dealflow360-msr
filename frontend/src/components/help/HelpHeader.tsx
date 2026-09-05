import { LifeBuoy, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface HelpHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  onContactSupport: () => void
}

export function HelpHeader({ search, onSearchChange, onContactSupport }: HelpHeaderProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-h1 text-foreground flex items-center gap-2.5">
          <LifeBuoy className="h-6 w-6 text-primary" aria-hidden />
          Help Center
        </h1>
        <p className="text-body text-muted-foreground mt-1">How can we help?</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Help-specific search (not global search) */}
        <div className="relative flex-1 sm:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search guides, FAQs and tutorials..."
            aria-label="Search help content"
            className="pl-9 pr-9 h-11 text-body"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear help search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button variant="outline" className="sm:w-auto w-full h-11" onClick={onContactSupport}>
          Contact Support
        </Button>
      </div>
    </div>
  )
}