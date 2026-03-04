import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';

interface PaymentDetails {
    id: string;
    amount: string | number;
    currency: string;
    status: string;
    gateway_name: string | null;
    transaction_id?: string | null;
    type?: string | null;
}

interface PaymentShowProps {
    payment?: PaymentDetails | { data?: PaymentDetails } | null;
}

const hasPaymentData = (value: PaymentShowProps['payment']): value is { data?: PaymentDetails } => {
    return Boolean(value && typeof value === 'object' && 'data' in value);
};

export default function PaymentShow({ payment: rawPayment }: PaymentShowProps) {
    const payment = hasPaymentData(rawPayment) ? (rawPayment.data ?? null) : (rawPayment ?? null);

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Payment Details</h2>}>
            <Head title="Payment Details" />

            <div className="space-y-4">
                <Button asChild variant="outline">
                    <Link href="/admin/payments">Back</Link>
                </Button>

                <Card>
                    <CardContent className="p-6">
                    {!payment ? (
                        <p className="text-muted-foreground">Payment not found.</p>
                    ) : (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div><dt className="font-semibold">ID</dt><dd>{payment.id}</dd></div>
                            <div><dt className="font-semibold">Amount</dt><dd>{payment.amount} {payment.currency}</dd></div>
                            <div><dt className="font-semibold">Status</dt><dd>{payment.status}</dd></div>
                            <div><dt className="font-semibold">Gateway</dt><dd>{payment.gateway_name ?? '-'}</dd></div>
                            <div><dt className="font-semibold">Transaction ID</dt><dd>{payment.transaction_id ?? '-'}</dd></div>
                            <div><dt className="font-semibold">Type</dt><dd>{payment.type ?? '-'}</dd></div>
                        </dl>
                    )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
