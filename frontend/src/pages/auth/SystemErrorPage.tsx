import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, Home, RefreshCw, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useMemo } from 'react'

interface SystemErrorPageProps {
  error?: Error | null
  resetError?: () => void
}

export default function SystemErrorPage({ error: propError, resetError }: SystemErrorPageProps) {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)

  const error = propError || null

  const errorId = useMemo(() => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `DF360-${random}`
  }, [])

  const handleTryAgain = () => {
    if (resetError) {
      resetError()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[480px] text-center space-y-8">
        {/* Illustration */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-danger-subtle">
          <AlertTriangle className="h-10 w-10 text-danger" />
        </div>

        {/* Error info */}
        <div className="space-y-3">
          <h1 className="text-display font-bold text-foreground">Error</h1>
          <h2 className="text-h2 font-semibold text-foreground">Something Went Wrong</h2>
          <p className="text-body text-muted-foreground max-w-sm mx-auto">
            We encountered an unexpected error. Our team has been notified. Please
            try again or contact support if the problem persists.
          </p>
        </div>

        {/* Error reference */}
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-caption text-muted-foreground">
            Error reference: <span className="font-mono font-medium text-foreground">{errorId}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={handleTryAgain}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Support */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="mailto:support@dealflow360.app"
            className="inline-flex items-center gap-1.5 text-small text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact Support
          </a>
        </div>

        {/* Technical details — collapsed */}
        <div className="text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1.5 text-caption text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            Technical Details
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showDetails && (
            <div className="mt-3 rounded-lg border border-border bg-surface-muted p-3 space-y-2">
              <div className="text-caption">
                <span className="text-muted-foreground">Error ID: </span>
                <span className="font-mono text-foreground">{errorId}</span>
              </div>
              {error instanceof Error && (
                <div className="text-caption">
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-mono text-foreground">{error.name || 'Error'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
