import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage } from '@inertiajs/react';
import { CreditCard, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PageProps } from '@/types';

interface Payment {
    id: string;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    transaction_id: string | null;
    type: string;
    description: string;
    created_at: string;
}

export default function PaymentsHistory() {
    const user = usePage<PageProps>().props.auth.user;

    // Mock payments
    const payments: Payment[] = [
        {
            id: '1', amount: '49.99', currency: 'USD', status: 'completed',
            transaction_id: 'tx_123456789', type: 'subscription', description: 'Pro Plan - 1 Month', created_at: '2026-02-23T10:00:00Z'
        },
        {
            id: '2', amount: '15.00', currency: 'USD', status: 'pending',
            transaction_id: null, type: 'exam_fee', description: 'Advanced Physics Exam Entry', created_at: '2026-02-22T14:30:00Z'
        },
        {
            id: '3', amount: '25.00', currency: 'USD', status: 'failed',
            transaction_id: 'tx_987654321', type: 'exam_fee', description: 'Mathematics Olympiad', created_at: '2026-02-20T09:15:00Z'
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="text-green-500" size={18} />;
            case 'failed': return <XCircle className="text-red-500" size={18} />;
            default: return <Clock className="text-yellow-500" size={18} />;
        }
    };

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Payment History</h2>}>
            <Head title="Payment History" />

            <div className="max-w-6xl mx-auto py-6">

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Spent</p>
                                <p className="text-2xl font-bold text-slate-800">$49.99</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-medium text-slate-800">Recent Transactions</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{payment.description}</div>
                                            <div className="text-xs text-slate-500">{payment.transaction_id || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-800">
                                                {payment.amount} {payment.currency}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(payment.status)}
                                                <span className="text-sm text-slate-700 capitalize">{payment.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {payment.status === 'completed' && (
                                                <button className="text-indigo-600 hover:text-indigo-900 transition flex items-center justify-end gap-1 w-full">
                                                    <Download size={16} /> Receipt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
