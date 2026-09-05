import { Link } from 'react-router-dom'
import { Layers3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DealFlowLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  showBadge?: boolean
  subtitle?: string
  href?: string | null
  className?: string
}

export function DealFlowLogo({
  size = 'md',
  showText = true,
  showBadge = true,
  subtitle,
  href = '/',
  className,
}: DealFlowLogoProps) {
  const sizeConfig = {
    sm: {
      box: 'h-8 w-8 rounded-lg',
      icon: 'h-4 w-4',
      dot: 'h-2 w-2 -right-0.5 -top-0.5 border-1.5',
      text: 'text-lg',
    },
    md: {
      box: 'h-10 w-10 rounded-xl',
      icon: 'h-5 w-5',
      dot: 'h-2.5 w-2.5 -right-1 -top-1 border-2',
      text: 'text-xl sm:text-2xl',
    },
    lg: {
      box: 'h-12 w-12 rounded-2xl',
      icon: 'h-6 w-6',
      dot: 'h-3 w-3 -right-1 -top-1 border-2',
      text: 'text-2xl sm:text-3xl',
    },
  }

  const current = sizeConfig[size]

  const content = (
    <div className={cn('flex items-center gap-3 group select-none', className)}>
      <span
        className={cn(
          'relative flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-elevation-1 transition-transform group-hover:scale-105',
          current.box
        )}
      >
        <Layers3 className={current.icon} />
        {showBadge && (
          <span
            className={cn(
              'absolute rounded-full border-background bg-success',
              current.dot
            )}
          />
        )}
      </span>

      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-extrabold tracking-tight text-foreground leading-none', current.text)}>
            DealFlow<span className="text-primary">360</span>
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground font-semibold mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link to={href} aria-label="DealFlow360 Home" className="w-fit inline-block">
        {content}
      </Link>
    )
  }

  return content
}
