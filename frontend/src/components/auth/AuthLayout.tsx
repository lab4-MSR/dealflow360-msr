import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/providers/ThemeProvider'
import { Sun, Moon } from 'lucide-react'
import { BrandMark } from '@/components/common/BrandMark'

interface AuthLayoutProps {
  children: ReactNode
  wideContent?: boolean
}

export function AuthLayout({ children, wideContent = false }: AuthLayoutProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Top Bar with Brand & Theme Toggle */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <BrandMark />
          <span className="text-h4 font-bold tracking-tight text-foreground">
            DealFlow<span className="text-primary">360</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Form Center Box */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className={`w-full ${wideContent ? 'max-w-2xl' : 'max-w-[440px]'}`}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 bg-card/40">
        <div className="mx-auto max-w-[440px] px-4 text-center">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>© 2026 DealFlow360</span>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/help" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
