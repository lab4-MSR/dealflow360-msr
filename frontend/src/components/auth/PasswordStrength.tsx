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
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

function getStrengthLevel(password: string): { score: number; label: string; color: string } {
  const passed = REQUIREMENTS.filter((r) => r.test(password)).length
  if (passed <= 1) return { score: 1, label: 'Weak', color: 'bg-danger' }
  if (passed <= 2) return { score: 2, label: 'Fair', color: 'bg-warning' }
  if (passed <= 3) return { score: 3, label: 'Good', color: 'bg-info' }
  return { score: 4, label: 'Strong', color: 'bg-success' }
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getStrengthLevel(password)

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-caption text-muted-foreground">Password strength</span>
          <span className="text-caption font-medium text-foreground">{strength.label}</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-200',
                level <= strength.score ? strength.color : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-1">
        {REQUIREMENTS.map((req) => {
          const passed = req.test(password)
          return (
            <div key={req.label} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-1 w-1 rounded-full',
                  passed ? 'bg-success' : 'bg-muted-foreground/40'
                )}
              />
              <span
                className={cn(
                  'text-caption',
                  passed ? 'text-foreground' : 'text-muted-foreground'
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
