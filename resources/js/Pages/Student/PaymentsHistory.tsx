import { Head } from '@inertiajs/react';
import { CreditCard, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

import { CheckoutModal } from '@/Components/domain/payments/CheckoutModal';
import { ExamPricingGrid } from '@/Components/domain/payments/ExamPricingGrid';
import { PaymentHistoryTable } from '@/Components/domain/payments/PaymentHistoryTable';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PaginatedData } from '@/types';
import type { PaymentRecord, StudentStorefrontExam } from '@/types/models';

interface PaymentsHistoryProps {
    payments: PaginatedData<PaymentRecord>;
    activeExams: StudentStorefrontExam[];
    purchasedExamIds: string[];
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default function PaymentsHistory({ payments, activeExams, purchasedExamIds }: PaymentsHistoryProps) {
    const { t } = useTranslation();
    const [selectedExam, setSelectedExam] = useState<StudentStorefrontExam | null>(null);

    const paymentRows = payments.data ?? [];

    const summary = useMemo(() => {
        const successful = paymentRows.filter((payment) => payment.status === 'completed');
        const pending = paymentRows.filter((payment) => payment.status === 'pending');
        const totalSpent = successful.reduce((sum, payment) => sum + Number(payment.amount), 0);

        return {
            totalSpent,
            successfulCount: successful.length,
            pendingCount: pending.length,
            availableCount: activeExams.length,
        };
    }, [activeExams.length, paymentRows]);

    const handleDownloadInvoice = (payment: PaymentRecord) => {
        const amount = formatCurrency(Number(payment.amount), payment.currency || 'USD');
        const invoice = [
            t('student.payments.invoice_title', {}, 'Invoice'),
            '========================================',
            `${t('student.payments.invoice_transaction', {}, 'Transaction')}: ${payment.transaction_id ?? payment.id}`,
            `${t('student.payments.invoice_description', {}, 'Description')}: ${payment.description || t('student.payments.no_description', {}, 'Exam purchase')}`,
            `${t('student.payments.invoice_gateway', {}, 'Gateway')}: ${payment.gateway_name || '—'}`,
            `${t('student.payments.invoice_status', {}, 'Status')}: ${payment.status}`,
            `${t('student.payments.invoice_amount', {}, 'Amount')}: ${amount}`,
            `${t('student.payments.invoice_date', {}, 'Date')}: ${payment.created_at ?? '—'}`,
        ].join('\n');

        const blob = new Blob([invoice], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${payment.transaction_id ?? payment.id}.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <Badge className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary shadow-none">
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            {t('student.payments.badge', {}, 'Secure commerce workspace')}
                        </Badge>
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('student.payments.title', {}, 'Payments & Checkout')}
                        </h2>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('student.payments.subtitle', {}, 'Purchase premium exams with confidence, review every transaction, and keep downloadable invoice records from a polished student billing dashboard.')}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={t('student.payments.head_title', {}, 'Payments & Checkout')} />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        icon: Wallet,
                        label: t('student.payments.total_spent', {}, 'Total spent'),
                        value: formatCurrency(summary.totalSpent, 'USD'),
                        tone: 'from-violet-500/15 via-indigo-500/10 to-transparent',
                    },
                    {
                        icon: ReceiptText,
                        label: t('student.payments.successful_payments', {}, 'Successful payments'),
                        value: `${summary.successfulCount}`,
                        tone: 'from-emerald-500/15 via-green-500/10 to-transparent',
                    },
                    {
                        icon: CreditCard,
                        label: t('student.payments.pending_payments', {}, 'Pending payments'),
                        value: `${summary.pendingCount}`,
                        tone: 'from-amber-500/15 via-orange-500/10 to-transparent',
                    },
                    {
                        icon: ShieldCheck,
                        label: t('student.payments.available_exams', {}, 'Paid exams available'),
                        value: `${summary.availableCount}`,
                        tone: 'from-sky-500/15 via-cyan-500/10 to-transparent',
                    },
                ].map((card) => {
                    const Icon = card.icon;

                    return (
                        <Card key={card.label} className="overflow-hidden rounded-[28px] border-border/60 bg-white/90 shadow-sm">
                            <CardContent className="relative p-6">
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.tone}`} />
                                <div className="relative flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{card.label}</p>
                                        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                                        <Icon className="h-5 w-5 text-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <ExamPricingGrid exams={activeExams} purchasedExamIds={purchasedExamIds} onBuy={setSelectedExam} />

            <PaymentHistoryTable payments={paymentRows} onDownloadInvoice={handleDownloadInvoice} />

            <CheckoutModal exam={selectedExam} open={selectedExam !== null} onOpenChange={(open) => !open && setSelectedExam(null)} />
        </AuthenticatedLayout>
    );
}
