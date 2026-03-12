import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, CalendarRange, Clock3, ShieldCheck, Stars } from 'lucide-react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import type { StudentStorefrontExam } from '@/types/models';

interface ExamPricingGridProps {
    exams: StudentStorefrontExam[];
    purchasedExamIds: string[];
    onBuy: (exam: StudentStorefrontExam) => void;
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date?: string | null) {
    if (!date) {
        return null;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

export function ExamPricingGrid({ exams, purchasedExamIds, onBuy }: ExamPricingGridProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {t('student.payments.pricing_title', {}, 'Purchase premium exams')}
                </h3>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    {t('student.payments.pricing_description', {}, 'Unlock paid exams with a storefront designed to feel secure, clear, and high-converting. Compare duration, scoring, and access details before checkout.')}
                </p>
            </div>

            {exams.length === 0 ? (
                <Card className="rounded-[28px] border-dashed border-border/70 bg-white/70 shadow-sm">
                    <CardContent className="flex min-h-64 items-center justify-center p-8 text-center text-muted-foreground">
                        {t('student.payments.pricing_empty', {}, 'No paid exams are available for purchase right now.')}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {exams.map((exam, index) => {
                        const isPurchased = purchasedExamIds.includes(exam.id);
                        const amount = Number(exam.price ?? 0);
                        const accent = index % 3 === 0
                            ? 'from-violet-500/15 via-indigo-500/10 to-transparent'
                            : index % 3 === 1
                                ? 'from-emerald-500/15 via-green-500/10 to-transparent'
                                : 'from-amber-500/15 via-orange-500/10 to-transparent';

                        return (
                            <Card key={exam.id} className="relative overflow-hidden rounded-[32px] border-border/60 bg-white/90 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.35)]">
                                <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${accent}`} />
                                <CardContent className="relative flex h-full flex-col p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <Badge className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-slate-700 shadow-none">
                                            <Stars className="mr-1 h-3.5 w-3.5 text-amber-500" />
                                            {t('student.payments.premium_exam', {}, 'Premium exam')}
                                        </Badge>
                                        {isPurchased ? (
                                            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-none">
                                                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                                                {t('student.payments.purchased', {}, 'Purchased')}
                                            </Badge>
                                        ) : null}
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div>
                                            <h4 className="text-2xl font-semibold tracking-tight text-foreground">{exam.title}</h4>
                                            <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">
                                                {exam.description ?? t('student.payments.exam_description_fallback', {}, 'Professional exam access with guided checkout and transaction records.')}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between gap-4 rounded-[24px] border border-white/70 bg-white/90 px-4 py-4 shadow-sm">
                                            <div>
                                                <p className="text-sm text-muted-foreground">{t('student.payments.price_label', {}, 'Price')}</p>
                                                <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
                                                    {formatCurrency(amount, 'USD')}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs leading-5 text-muted-foreground">
                                                <p>{t('student.payments.secure_by', {}, 'Protected by trusted gateways')}</p>
                                                <p>{t('student.payments.instant_unlock', {}, 'Instant access after confirmation')}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-3">
                                            {[
                                                {
                                                    icon: Clock3,
                                                    label: t('student.payments.duration', {}, 'Duration'),
                                                    value: `${exam.duration_minutes} ${t('student.payments.minutes', {}, 'min')}`,
                                                },
                                                {
                                                    icon: ShieldCheck,
                                                    label: t('student.payments.total_marks', {}, 'Total marks'),
                                                    value: `${exam.total_marks}`,
                                                },
                                                {
                                                    icon: CalendarRange,
                                                    label: t('student.payments.starts_at', {}, 'Starts at'),
                                                    value: formatDate(exam.start_time) ?? t('student.payments.flexible', {}, 'Flexible access'),
                                                },
                                            ].map((feature) => {
                                                const Icon = feature.icon;

                                                return (
                                                    <div key={feature.label} className="flex items-center justify-between rounded-2xl border border-border/60 bg-slate-50/80 px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="rounded-xl bg-white p-2 shadow-sm">
                                                                <Icon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <span className="text-sm font-medium text-foreground">{feature.label}</span>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">{feature.value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        {isPurchased ? (
                                            <Button asChild className="h-11 flex-1 rounded-2xl">
                                                <Link href={route('student.exams.room', exam.id)}>
                                                    {t('student.payments.open_exam', {}, 'Open Exam')}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button className="h-11 flex-1 rounded-2xl" onClick={() => onBuy(exam)}>
                                                {t('student.payments.buy_now', {}, 'Buy Now')}
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
