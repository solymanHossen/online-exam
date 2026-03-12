import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    LoaderCircle,
    LockKeyhole,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/Dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { StudentStorefrontExam } from '@/types/models';

interface CheckoutModalProps {
    exam: StudentStorefrontExam | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type GatewayOption = 'stripe' | 'paypal';

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function CheckoutModal({ exam, open, onOpenChange }: CheckoutModalProps) {
    const { t } = useTranslation();
    const [gateway, setGateway] = useState<GatewayOption>('stripe');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const gatewayOptions = useMemo(() => ([
        {
            key: 'stripe' as const,
            title: t('student.payments.gateway_stripe', {}, 'Stripe'),
            description: t('student.payments.gateway_stripe_description', {}, 'Pay securely using cards with instant confirmation.'),
            icon: CreditCard,
            accent: 'from-indigo-500/10 via-violet-500/10 to-transparent border-indigo-200',
        },
        {
            key: 'paypal' as const,
            title: t('student.payments.gateway_paypal', {}, 'PayPal'),
            description: t('student.payments.gateway_paypal_description', {}, 'Checkout with PayPal balance or linked funding source.'),
            icon: WalletCards,
            accent: 'from-sky-500/10 via-cyan-500/10 to-transparent border-sky-200',
        },
    ]), [t]);

    if (!exam) {
        return null;
    }

    const amount = Number(exam.price ?? 0);

    const handleContinue = () => {
        setIsSubmitting(true);
        router.post(route('student.payments.checkout'), {
            gateway,
            exam_id: exam.id,
            type: 'exam_fee',
            description: exam.title,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isSubmitting && onOpenChange(nextOpen)}>
            <DialogContent className="max-w-2xl rounded-[32px] border-white/70 bg-white/95 p-0 shadow-[0_32px_90px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="overflow-hidden rounded-[32px]">
                    <div className="border-b border-border/60 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,1)_0%,_rgba(248,250,252,0.98)_100%)] px-6 py-6 sm:px-8">
                        <Badge className="mb-4 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-none">
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            {t('student.payments.secure_checkout', {}, 'Secure checkout')}
                        </Badge>
                        <DialogHeader className="space-y-3 text-left">
                            <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">
                                {t('student.payments.checkout_title', {}, 'Complete your exam purchase')}
                            </DialogTitle>
                            <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
                                {t('student.payments.checkout_description', {}, 'Choose a trusted payment gateway to unlock this exam instantly. Your transaction is processed over encrypted connections.')}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('student.payments.select_method', {}, 'Select payment method')}
                                </p>
                                <div className="space-y-3">
                                    {gatewayOptions.map((option) => {
                                        const Icon = option.icon;
                                        const isActive = gateway === option.key;

                                        return (
                                            <label
                                                key={option.key}
                                                className={cn(
                                                    'relative flex cursor-pointer items-start gap-4 rounded-[24px] border bg-gradient-to-br p-4 transition-all duration-200',
                                                    option.accent,
                                                    isActive
                                                        ? 'border-primary shadow-[0_20px_50px_-28px_rgba(79,70,229,0.55)] ring-2 ring-primary/15'
                                                        : 'border-border/60 hover:border-primary/30 hover:bg-slate-50',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="gateway"
                                                    value={option.key}
                                                    checked={isActive}
                                                    onChange={() => setGateway(option.key)}
                                                    className="sr-only"
                                                />
                                                <div className={cn(
                                                    'grid h-12 w-12 shrink-0 place-items-center rounded-2xl border bg-white/90',
                                                    isActive ? 'border-primary text-primary' : 'border-border/60 text-muted-foreground',
                                                )}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="font-semibold text-foreground">{option.title}</p>
                                                        {isActive ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{option.description}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-border/60 bg-slate-50/90 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                                        <LockKeyhole className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {t('student.payments.trust_title', {}, 'Why this checkout feels safe')}
                                        </p>
                                        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                                            <li>{t('student.payments.trust_encryption', {}, '256-bit encrypted payment communication.')}</li>
                                            <li>{t('student.payments.trust_confirmation', {}, 'Instant payment status confirmation from the gateway.')}</li>
                                            <li>{t('student.payments.trust_receipt', {}, 'Clear transaction history and downloadable invoice records.')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-border/60 bg-slate-50/80 p-5 shadow-inner">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                {t('student.payments.order_summary', {}, 'Order summary')}
                            </p>
                            <div className="mt-4 rounded-[24px] border border-white/80 bg-white p-5 shadow-sm">
                                <p className="text-lg font-semibold text-foreground">{exam.title}</p>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {exam.description ?? t('student.payments.order_summary_fallback', {}, 'Premium exam access with secure payment unlock.')}
                                </p>

                                <div className="mt-5 space-y-3 border-t border-dashed border-border/60 pt-4 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{t('student.payments.duration', {}, 'Duration')}</span>
                                        <span className="font-medium text-foreground">{exam.duration_minutes} {t('student.payments.minutes', {}, 'min')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{t('student.payments.total_marks', {}, 'Total marks')}</span>
                                        <span className="font-medium text-foreground">{exam.total_marks}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{t('student.payments.pass_marks', {}, 'Pass marks')}</span>
                                        <span className="font-medium text-foreground">{exam.pass_marks}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 rounded-[24px] bg-slate-950 px-5 py-4 text-white shadow-lg">
                                <div className="flex items-center justify-between text-sm text-white/70">
                                    <span>{t('student.payments.total_due', {}, 'Total due')}</span>
                                    <span>{t('student.payments.tax_notice', {}, 'Taxes included')}</span>
                                </div>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">
                                    {formatCurrency(amount, 'USD')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/60 bg-white/90 px-6 py-5 sm:px-8">
                        <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            {t('student.payments.cancel', {}, 'Cancel')}
                        </Button>
                        <Button className="rounded-2xl" onClick={handleContinue} disabled={isSubmitting}>
                            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                            {t('student.payments.pay_now', {}, 'Pay now')}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
