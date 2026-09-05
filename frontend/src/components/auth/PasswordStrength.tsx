import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
}

interface StrengthCheck {
  label: string
  test: (password: string) => boolean
}

const REQUIREMENTS: StrengthCheck[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'One number (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrengthLevel(password: string): { score: number; label: string; color: string; badgeBg: string; badgeText: string } {
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', badgeBg: 'bg-red-500/10', badgeText: 'text-red-500' }
  if (passed <= 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-500' }
  if (passed <= 4) return { score: 3, label: 'Good', color: 'bg-sky-500', badgeBg: 'bg-sky-500/10', badgeText: 'text-sky-500' }
  return { score: 4, label: 'Very Strong', color: 'bg-emerald-500', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-500' }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getStrengthLevel(password)

  return (
    <div className="space-y-2.5 rounded-xl border border-border/70 bg-surface-muted/40 p-3 text-xs transition-all animate-in fade-in">
      {/* Strength bar & status */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-caption">
          <span className="text-muted-foreground font-medium">Security strength</span>
          <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase', strength.badgeBg, strength.badgeText)}>
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-full flex-1 rounded-full transition-all duration-300',
                level <= strength.score ? strength.color : 'bg-muted/70'
              )}
            />
          ))}
        </div>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-border/50">
        {REQUIREMENTS.map((req) => {
          const passed = req.test(password)
          return (
            <div key={req.label} className="flex items-center gap-1.5 text-[11px]">
              {passed ? (
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              ) : (
                <Circle className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0 ml-0.5" />
              )}
              <span
                className={cn(
                  'transition-colors',
                  passed ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {req.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
