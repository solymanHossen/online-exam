import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AuthBrandButtonProps extends ButtonProps {
  variant?: 'default' | 'outline'
  children: ReactNode
}

export function AuthBrandButton({
  className,
  variant = 'default',
  children,
  ...props
}: AuthBrandButtonProps) {
  return (
    <Button
      className={cn(
        'whitespace-nowrap focus-visible:ring-4',
        variant === 'default' ? 'auth-primary-button focus-visible:ring-purple-300' : 'auth-outline-button focus-visible:ring-purple-400',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
