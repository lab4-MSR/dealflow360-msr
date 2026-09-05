import * as React from 'react'
import { Search, X, Clock, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const RECENT_SEARCHES_KEY = 'dealflow360-recent-searches'
const MAX_RECENT_SEARCHES = 5

export interface SearchSuggestion {
  type: string
  title: string
  subtitle?: string
  id?: string
}

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onSelectSuggestion: (suggestion: SearchSuggestion) => void
  isLoading?: boolean
  suggestions?: SearchSuggestion[]
  showSuggestions?: boolean
  setShowSuggestions?: (show: boolean) => void
  placeholder?: string
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  isLoading,
  suggestions = [],
  showSuggestions = false,
  setShowSuggestions,
  placeholder = 'Search deals, customers, invoices...',
}: SearchInputProps) {
  const [recentSearches, setRecentSearches] = React.useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    }
    return []
  })

  const [showRecent, setShowRecent] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const addRecentSearch = React.useCallback((query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }
      return updated
    })
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const items = [...recentSearches, ...suggestions]
      const totalItems = items.length

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % totalItems)
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems)
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0) {
            if (highlightedIndex < recentSearches.length) {
              const query = recentSearches[highlightedIndex]
              onChange(query)
              onSubmit(query)
              addRecentSearch(query)
            } else {
              const suggestion = suggestions[highlightedIndex - recentSearches.length]
              onSelectSuggestion(suggestion)
            }
            setShowRecent(false)
            setShowSuggestions?.(false)
            setHighlightedIndex(-1)
          } else {
            onSubmit(value)
            addRecentSearch(value)
          }
          break
        case 'Escape':
          setShowRecent(false)
          setShowSuggestions?.(false)
          setHighlightedIndex(-1)
          inputRef.current?.blur()
          break
      }
    },
    [recentSearches, suggestions, highlightedIndex, value, onChange, onSubmit, onSelectSuggestion, addRecentSearch, setShowSuggestions]
  )

  const handleFocus = React.useCallback(() => {
    if (value.trim() === '' && recentSearches.length > 0) {
      setShowRecent(true)
      setHighlightedIndex(-1)
    }
  }, [value, recentSearches.length])

  const handleBlur = React.useCallback(() => {
    setTimeout(() => {
      setShowRecent(false)
      setShowSuggestions?.(false)
      setHighlightedIndex(-1)
    }, 200)
  }, [setShowSuggestions])

  const handleClear = React.useCallback(() => {
    onChange('')
    onSubmit('')
    setShowRecent(false)
    setShowSuggestions?.(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }, [onChange, onSubmit, setShowSuggestions])

  const handleSelectRecent = React.useCallback(
    (query: string) => {
      onChange(query)
      onSubmit(query)
      addRecentSearch(query)
      setShowRecent(false)
      setShowSuggestions?.(false)
      setHighlightedIndex(-1)
    },
    [onChange, onSubmit, addRecentSearch, setShowSuggestions]
  )

  const handleSelectSuggestion = React.useCallback(
    (suggestion: SearchSuggestion) => {
      onSelectSuggestion(suggestion)
      if (suggestion.title) {
        addRecentSearch(suggestion.title)
      }
      setShowRecent(false)
      setShowSuggestions?.(false)
      setHighlightedIndex(-1)
    },
    [onSelectSuggestion, addRecentSearch, setShowSuggestions]
  )

  const hasSuggestions = suggestions.length > 0
  const hasRecent = recentSearches.length > 0 && value.trim() === ''

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(value)
            addRecentSearch(value)
          }}
          placeholder={placeholder}
          className={cn('pl-11 pr-12 h-12 text-body', 'focus:ring-2 focus:ring-ring focus:ring-offset-1')}
          disabled={isLoading}
          autoComplete="off"
          role="combobox"
          aria-expanded={showRecent || hasSuggestions}
          aria-controls="search-suggestions"
          aria-activedescendant={highlightedIndex >= 0 ? `search-item-${highlightedIndex}` : undefined}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {((showRecent && hasRecent) || (showSuggestions && hasSuggestions)) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              ref={dropdownRef}
              id="search-suggestions"
              className="relative z-50"
              role="listbox"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            className="w-full max-w-2xl p-0"
            onMouseEnter={() => setHighlightedIndex(-1)}
          >
            {showRecent && hasRecent && (
              <React.Fragment>
                <DropdownMenuLabel className="px-3 py-2 text-caption font-medium text-muted-foreground">
                  Recent searches
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentSearches.map((search, index) => (
                  <DropdownMenuItem
                    key={search}
                    id={`search-item-${index}`}
                    onSelect={(e) => {
                      e.preventDefault()
                      handleSelectRecent(search)
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5',
                      highlightedIndex === index && 'bg-accent'
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-body-small flex-1 truncate">{search}</span>
                  </DropdownMenuItem>
                ))}
              </React.Fragment>
            )}

            {showSuggestions && hasSuggestions && (
              <React.Fragment>
                {(showRecent && hasRecent) && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="px-3 py-2 text-caption font-medium text-muted-foreground">
                  Suggestions
                </DropdownMenuLabel>
                {suggestions.map((suggestion, index) => {
                  const itemIndex = recentSearches.length + index
                  return (
                    <DropdownMenuItem
                      key={`${suggestion.type}-${suggestion.title}-${index}`}
                      id={`search-item-${itemIndex}`}
                      onSelect={(e) => {
                        e.preventDefault()
                        handleSelectSuggestion(suggestion)
                      }}
                      className={cn(
                        'flex items-start gap-3 px-3 py-2.5',
                        highlightedIndex === itemIndex && 'bg-accent'
                      )}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-body-small font-medium truncate">{suggestion.title}</span>
                        <span className="text-caption text-muted-foreground truncate">{suggestion.subtitle}</span>
                      </div>
                      <Badge className="ml-auto shrink-0">{suggestion.type}</Badge>
                    </DropdownMenuItem>
                  )
                })}
              </React.Fragment>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}