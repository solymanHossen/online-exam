import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function PaymentShow(props: any) {
    const payment = props?.payment?.data ?? props?.payment ?? null;

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payment Details</h2>}>
            <Head title="Payment Details" />

            <div className="space-y-4">
                <Link href="/admin/payments" className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Back
                </Link>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    {!payment ? (
                        <p className="text-gray-500">Payment not found.</p>
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
                </div>
            </div>
        </AdminLayout>
    );
}
