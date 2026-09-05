import { useTheme } from '@/providers/ThemeProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Search,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-small text-muted-foreground">
        <span className="text-foreground font-medium">Dashboard</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Global Search */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex items-center gap-2 text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-small">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-surface-muted px-1.5 text-caption font-medium text-muted-foreground md:flex">
            <span className="text-[10px]">Ctrl</span>
            <span className="text-[10px]">K</span>
          </kbd>
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* User Profile */}
        <div className="ml-2 flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent cursor-pointer transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-small font-medium leading-none">John Doe</p>
            <p className="text-caption text-muted-foreground leading-none mt-1">Sales Rep</p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
        </div>
      </div>
    </header>
  )
}
