import { InertiaLinkProps, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={cn(
                'flex w-full items-start border-l-4 py-2 pe-4 ps-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                active
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
                className,
            )}
        >
            {children}
        </Link>
    );
}
