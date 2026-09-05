import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  side?: 'left' | 'right'
  className?: string
}

function Drawer({ open, onClose, title, description, children, side = 'right', className }: DrawerProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/45 duration-200 animate-in fade-in-0 motion-reduce:animate-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Drawer'}
        className={cn(
          'fixed z-50 inset-y-0 flex flex-col bg-card shadow-elevation-4 transition-transform duration-300 ease-out motion-reduce:transition-none',
          side === 'right' && 'right-0 w-full max-w-[100vw] sm:max-w-[560px] border-l border-border',
          side === 'left' && 'left-0 w-full max-w-[100vw] sm:max-w-[560px] border-r border-border',
          side === 'right' && (open ? 'translate-x-0' : 'translate-x-full'),
          side === 'left' && (open ? 'translate-x-0' : '-translate-x-full'),
          !open && 'pointer-events-none',
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-border">
            <div className="space-y-1">
              {title && <h2 className="text-h3 font-semibold">{title}</h2>}
              {description && <p className="text-body-small text-muted-foreground">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </>
  )
}

export { Drawer }
