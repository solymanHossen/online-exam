import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Payments</h2>}>
            <Head title="Payments" />

            <Card className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-3">User</TableHead>
                            <TableHead className="px-4 py-3">Amount</TableHead>
                            <TableHead className="px-4 py-3">Gateway</TableHead>
                            <TableHead className="px-4 py-3">Status</TableHead>
                            <TableHead className="px-4 py-3">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={5}>No payments found.</TableCell></TableRow>
                        ) : payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell className="px-4 py-3">
                                    <div className="font-medium">{payment.user?.name ?? '-'}</div>
                                    <div className="text-xs text-muted-foreground">{payment.user?.email ?? ''}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3">{payment.amount} {payment.currency}</TableCell>
                                <TableCell className="px-4 py-3">{payment.gateway_name ?? '-'}</TableCell>
                                <TableCell className="px-4 py-3">{payment.status}</TableCell>
                                <TableCell className="px-4 py-3">
                                    <Link className="text-primary hover:text-primary/80" href={`/admin/payments/${payment.id}`}>
                                        View
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </AdminLayout>
    );
}
