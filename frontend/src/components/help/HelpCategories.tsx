import {
  Compass,
  Handshake,
  BadgeCheck,
  Truck,
  CreditCard,
  Repeat,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
import type { HelpCategory } from '@/types/shared'
import { HELP_CATEGORIES } from '@/constants/shared'

const CATEGORY_ICON: Record<HelpCategory, LucideIcon> = {
  'getting-started': Compass,
  sales: Handshake,
  approvals: BadgeCheck,
  fulfillment: Truck,
  billing: CreditCard,
  subscriptions: Repeat,
  account: UserCircle,
}

interface HelpCategoriesProps {
  selected: HelpCategory | 'all'
  onSelect: (category: HelpCategory | 'all') => void
}

export function HelpCategories({ selected, onSelect }: HelpCategoriesProps) {
  return (
    <div>
      <h2 className="text-h3 text-foreground mb-4">Browse by topic</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          onClick={() => onSelect('all')}
          aria-pressed={selected === 'all'}
          className={[
            'rounded-xl border bg-card p-4 text-left transition-colors',
            'hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            selected === 'all' ? 'border-primary/40 ring-1 ring-primary/30' : 'border-border',
          ].join(' ')}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-subtle text-primary mb-3">
            <Compass className="h-4 w-4" aria-hidden />
          </div>
          <p className="text-body font-medium text-foreground">All topics</p>
          <p className="text-caption text-muted-foreground mt-0.5">Everything in Help</p>
        </button>

        {HELP_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICON[category.value]
          const active = selected === category.value
          return (
            <button
              key={category.value}
              onClick={() => onSelect(category.value)}
              aria-pressed={active}
              className={[
                'rounded-xl border bg-card p-4 text-left transition-colors',
                'hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'border-primary/40 ring-1 ring-primary/30' : 'border-border',
              ].join(' ')}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground mb-3">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-body font-medium text-foreground">{category.label}</p>
              <p className="text-caption text-muted-foreground mt-0.5">{category.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}