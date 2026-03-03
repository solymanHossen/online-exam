import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            className={cn('text-xs font-semibold uppercase tracking-widest', className)}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
