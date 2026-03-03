import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            variant="destructive"
            className={cn('text-xs font-semibold uppercase tracking-widest', className)}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
