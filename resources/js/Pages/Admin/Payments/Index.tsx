import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface PaymentRow {
    id: string;
    amount: string | number;
    currency: string;
    status: string;
    gateway_name: string | null;
    user?: { name?: string; email?: string };
}

export default function PaymentsIndex(props: any) {
    const payments: PaymentRow[] = props?.payments?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Payments</h2>}>
            <Head title="Payments" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Gateway</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>No payments found.</td></tr>
                        ) : payments.map((payment) => (
                            <tr key={payment.id} className="border-t">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{payment.user?.name ?? '-'}</div>
                                    <div className="text-xs text-gray-500">{payment.user?.email ?? ''}</div>
                                </td>
                                <td className="px-4 py-3">{payment.amount} {payment.currency}</td>
                                <td className="px-4 py-3">{payment.gateway_name ?? '-'}</td>
                                <td className="px-4 py-3">{payment.status}</td>
                                <td className="px-4 py-3">
                                    <Link className="text-indigo-600 hover:text-indigo-800" href={`/admin/payments/${payment.id}`}>
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
