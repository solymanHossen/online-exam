import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatRow {
    id: string;
    times_attempted: number;
    times_correct: number;
    question?: { question_text?: string };
}

export default function QuestionStatistics(props: any) {
    const stats: StatRow[] = props?.statistics?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Question Statistics</h2>}>
            <Head title="Question Statistics" />

            <Card className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-3">Question</TableHead>
                            <TableHead className="px-4 py-3">Attempts</TableHead>
                            <TableHead className="px-4 py-3">Correct</TableHead>
                            <TableHead className="px-4 py-3">Accuracy</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.length === 0 ? (
                            <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={4}>No statistics yet.</TableCell></TableRow>
                        ) : stats.map((row) => {
                            const accuracy = row.times_attempted > 0
                                ? ((row.times_correct / row.times_attempted) * 100).toFixed(2)
                                : '0.00';

                            return (
                                <TableRow key={row.id}>
                                    <TableCell className="px-4 py-3">{row.question?.question_text ?? '-'}</TableCell>
                                    <TableCell className="px-4 py-3">{row.times_attempted}</TableCell>
                                    <TableCell className="px-4 py-3">{row.times_correct}</TableCell>
                                    <TableCell className="px-4 py-3">{accuracy}%</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </AdminLayout>
    );
}
