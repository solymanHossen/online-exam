import {
    Dialog,
    DialogContent,
} from '@/Components/ui/Dialog';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: () => void;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[maxWidth];

    return (
        <Dialog open={show} onOpenChange={closeable ? (open) => !open && onClose() : undefined}>
            <DialogContent
                onPointerDownOutside={closeable ? undefined : (event) => event.preventDefault()}
                onEscapeKeyDown={closeable ? undefined : (event) => event.preventDefault()}
                className={cn('p-0', maxWidthClass)}
            >
                {children}
            </DialogContent>
        </Dialog>
    );
}
