import { InertiaLinkProps, Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={cn(
                'inline-flex h-9 items-center border-b-2 px-1 text-sm font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                className,
            )}
        >
            {children}
        </Link>
    );
}
