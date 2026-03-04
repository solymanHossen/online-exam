import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AuthSocialIconProps {
  children: ReactNode
  className?: string
}

export function AuthSocialIcon({ children, className }: AuthSocialIconProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-border bg-card text-sm font-bold text-foreground transition duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow',
        className,
      )}
      aria-label="social-login"
    >
      {children}
    </button>
  )
}
