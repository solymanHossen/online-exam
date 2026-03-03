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
      variant={variant}
      className={cn(
        'h-12 rounded-xl whitespace-nowrap px-8 text-base font-medium transition-all duration-300 active:scale-[0.98]',
        variant === 'default' && 'shadow-md hover:shadow-lg hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
