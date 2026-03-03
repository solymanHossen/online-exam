import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            type={type}
            variant="outline"
            className={cn('text-xs font-semibold uppercase tracking-widest', className)}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
