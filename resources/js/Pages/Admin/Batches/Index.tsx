import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import type { PaginatedData } from '@/types';

interface BatchRow {
    id: string;
    name: string;
    class_level: string;
    year: number;
}

interface BatchesIndexProps {
    batches: PaginatedData<BatchRow>;
}

export default function BatchesIndex({ batches: batchData }: BatchesIndexProps) {
    const batches: BatchRow[] = batchData?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Batches</h2>}>
            <Head title="Batches" />

            <Card className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-3">Name</TableHead>
                            <TableHead className="px-4 py-3">Class</TableHead>
                            <TableHead className="px-4 py-3">Year</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {batches.length === 0 ? (
                            <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={3}>No batches found.</TableCell></TableRow>
                        ) : batches.map((batch) => (
                            <TableRow key={batch.id}>
                                <TableCell className="px-4 py-3">{batch.name}</TableCell>
                                <TableCell className="px-4 py-3">{batch.class_level}</TableCell>
                                <TableCell className="px-4 py-3">{batch.year}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </AdminLayout>
    );
}
