import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-[400px]">
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-body font-bold text-primary-foreground">DF</span>
              </div>
              <span className="text-h3 font-semibold text-foreground">DealFlow360</span>
            </Link>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-[400px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <span className="text-caption text-muted-foreground">
              © 2026 DealFlow360
            </span>
            <div className="flex items-center gap-4 sm:gap-6">
              <a href="#" className="text-caption text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-caption text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-caption text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
