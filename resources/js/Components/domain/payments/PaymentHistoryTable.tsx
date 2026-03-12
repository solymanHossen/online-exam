import { CheckCircle2, Clock3, Download, ReceiptText, XCircle } from 'lucide-react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { PaymentRecord } from '@/types/models';

interface PaymentHistoryTableProps {
    payments: PaymentRecord[];
    onDownloadInvoice: (payment: PaymentRecord) => void;
}

function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(amount);
}

function formatDate(date: string | null | undefined) {
    if (!date) {
        return '—';
    }

    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

function getStatusMeta(status: PaymentRecord['status'], t: ReturnType<typeof useTranslation>['t']) {
    switch (status) {
        case 'completed':
            return {
                icon: CheckCircle2,
                label: t('student.payments.status_success', {}, 'Success'),
                className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
            };
        case 'failed':
            return {
                icon: XCircle,
                label: t('student.payments.status_failed', {}, 'Failed'),
                className: 'border-red-200 bg-red-50 text-red-700',
            };
        default:
            return {
                icon: Clock3,
                label: t('student.payments.status_pending', {}, 'Pending'),
                className: 'border-amber-200 bg-amber-50 text-amber-700',
            };
    }
}

export function PaymentHistoryTable({ payments, onDownloadInvoice }: PaymentHistoryTableProps) {
    const { t } = useTranslation();

    return (
        <Card className="rounded-[32px] border-border/60 bg-white/90 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)]">
            <CardHeader className="flex flex-col gap-3 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                        {t('student.payments.history_title', {}, 'Payment history')}
                    </CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t('student.payments.history_description', {}, 'Review all checkout attempts, payment statuses, and invoice downloads in one trusted ledger.')}
                    </p>
                </div>
                <Badge className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary shadow-none">
                    <ReceiptText className="mr-1 h-3.5 w-3.5" />
                    {t('student.payments.history_badge', {}, 'Transaction ledger')}
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('student.payments.transaction', {}, 'Transaction')}</TableHead>
                                <TableHead>{t('student.payments.gateway', {}, 'Gateway')}</TableHead>
                                <TableHead>{t('student.payments.amount', {}, 'Amount')}</TableHead>
                                <TableHead>{t('student.payments.status', {}, 'Status')}</TableHead>
                                <TableHead>{t('student.payments.date', {}, 'Date')}</TableHead>
                                <TableHead className="text-right">{t('student.payments.invoice', {}, 'Invoice')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-14 text-center text-muted-foreground" colSpan={6}>
                                        {t('student.payments.history_empty', {}, 'No payment records found yet.')}
                                    </TableCell>
                                </TableRow>
                            ) : payments.map((payment) => {
                                const status = getStatusMeta(payment.status, t);
                                const StatusIcon = status.icon;

                                return (
                                    <TableRow key={payment.id}>
                                        <TableCell className="min-w-[280px] align-top">
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">{payment.description || t('student.payments.no_description', {}, 'Exam purchase')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.transaction_id || t('student.payments.transaction_pending', {}, 'Transaction ID pending')}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="rounded-full px-2.5 py-1 capitalize">
                                                {payment.gateway_name || '—'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground">
                                            {formatCurrency(Number(payment.amount), payment.currency || 'USD')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn('rounded-full px-2.5 py-1', status.className)}>
                                                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                onClick={() => onDownloadInvoice(payment)}
                                                disabled={payment.status !== 'completed'}
                                            >
                                                <Download className="h-4 w-4" />
                                                {t('student.payments.download', {}, 'Download')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
