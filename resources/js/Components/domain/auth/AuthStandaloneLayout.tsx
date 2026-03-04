import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AuthStandaloneLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthStandaloneLayout({ title, description, children }: AuthStandaloneLayoutProps) {
  return (
    <div className="auth-page flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className={cn('w-full max-w-[500px] rounded-[28px] border border-border/60 bg-card text-card-foreground shadow-2xl relative overflow-hidden')}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--auth-overlay-from)] to-[var(--auth-overlay-to)]"></div>
        <CardHeader className="pt-10 pb-4 text-center">
          <CardTitle className="auth-font text-[28px] font-bold tracking-tight text-foreground">{title}</CardTitle>
          <CardDescription className="text-sm mt-3 text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-10 pb-10">{children}</CardContent>
      </Card>
    </div>
  );
}
