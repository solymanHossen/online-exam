import { Link } from "@inertiajs/react"
import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface AuthSplitLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
  panelTitle: string
  panelDescription: string
  panelActionText: string
  panelActionHref: string
}

export function AuthSplitLayout({
  children,
  title,
  subtitle,
  panelTitle,
  panelDescription,
  panelActionText,
  panelActionHref,
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-5xl overflow-hidden border-border/60 shadow-lg">
        <CardContent className="grid p-0 lg:grid-cols-2">
          <section className="p-6 sm:p-10">
            <div className="mb-8 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </section>

          <aside className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-center">
            <h2 className="text-3xl font-semibold tracking-tight">{panelTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/90">
              {panelDescription}
            </p>
            <Link
              href={panelActionHref}
              className="mt-8 inline-flex h-10 w-fit items-center justify-center rounded-md border border-primary-foreground px-6 text-sm font-medium transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              {panelActionText}
            </Link>
          </aside>
        </CardContent>
      </Card>
    </div>
  )
}
