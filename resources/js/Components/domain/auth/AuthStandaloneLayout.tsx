import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AuthStandaloneLayoutProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthStandaloneLayout({ title, description, children }: AuthStandaloneLayoutProps) {
  return (
    <div className="auth-page">
      <Card className={cn('w-full max-w-[560px] rounded-3xl border-0 bg-card text-card-foreground shadow-2xl')}>
        <CardHeader className="pb-2 text-center">
          <CardTitle className="text-[32px] font-bold text-foreground">{title}</CardTitle>
          <CardDescription className="text-[13px] text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-10 pb-10">{children}</CardContent>
      </Card>
    </div>
  )
}
