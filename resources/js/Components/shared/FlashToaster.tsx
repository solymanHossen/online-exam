import { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { PageProps } from '@/types';

interface ToastItem {
    id: number;
    type: 'success' | 'error';
    message: string;
}

export function FlashToaster() {
    const { t } = useTranslation();
    const { flash, errors } = usePage<PageProps>().props;
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const lastSignature = useRef<string>('');

    const firstError = useMemo(() => {
        if (!errors) {
            return null;
        }

        const values = Object.values(errors as Record<string, unknown>)
            .flatMap((value) => {
                if (typeof value === 'string') {
                    return [value];
                }

                if (Array.isArray(value)) {
                    return value.filter((item: unknown): item is string => typeof item === 'string');
                }

                return [];
            })
            .filter((value) => value.length > 0);

        return values[0] ?? null;
    }, [errors]);

    useEffect(() => {
        const nextMessages: Array<Omit<ToastItem, 'id'>> = [];

        if (flash?.success) {
            nextMessages.push({ type: 'success', message: flash.success });
        }

        if (flash?.error) {
            nextMessages.push({ type: 'error', message: flash.error });
        }

        if (!flash?.error && firstError) {
            nextMessages.push({ type: 'error', message: firstError });
        }

        if (nextMessages.length === 0) {
            return;
        }

        const signature = JSON.stringify(nextMessages);
        if (signature === lastSignature.current) {
            return;
        }

        lastSignature.current = signature;
        const createdAt = Date.now();

        setToasts((current) => [
            ...current,
            ...nextMessages.map((item, index) => ({
                ...item,
                id: createdAt + index,
            })),
        ]);
    }, [firstError, flash?.error, flash?.success]);

    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setToasts((current) => current.slice(1));
        }, 4200);

        return () => window.clearTimeout(timeout);
    }, [toasts]);

    const dismissToast = (id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    };

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
            {toasts.map((toast) => {
                const isSuccess = toast.type === 'success';

                return (
                    <div
                        key={toast.id}
                        className={cn(
                            'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur',
                            isSuccess
                                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
                                : 'border-destructive/20 bg-background/95 text-foreground',
                        )}
                        role="status"
                        aria-live="polite"
                    >
                        <div className={cn('mt-0.5 rounded-full p-1', isSuccess ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive')}>
                            {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">
                                {isSuccess ? t('common.success', {}, 'Success') : t('common.error', {}, 'Error')}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-muted-foreground">{toast.message}</p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => dismissToast(toast.id)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">{t('common.dismiss', {}, 'Dismiss')}</span>
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
