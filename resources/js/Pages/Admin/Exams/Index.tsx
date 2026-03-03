import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExamRow {
    id: string;
    title: string;
    status: string;
    duration_minutes: number;
    total_marks: number;
}

export default function ExamsIndex(props: any) {
    const exams: ExamRow[] = props?.exams?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Exams</h2>}>
            <Head title="Exams" />

            <Card>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">All Exams</h3>
                    <Button asChild>
                        <Link href="/admin/exams/create">Create Exam</Link>
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-3">Title</TableHead>
                                <TableHead className="px-4 py-3">Status</TableHead>
                                <TableHead className="px-4 py-3">Duration</TableHead>
                                <TableHead className="px-4 py-3">Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.length === 0 ? (
                                <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={4}>No exams found.</TableCell></TableRow>
                            ) : exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="px-4 py-3">{exam.title}</TableCell>
                                    <TableCell className="px-4 py-3">{exam.status}</TableCell>
                                    <TableCell className="px-4 py-3">{exam.duration_minutes} min</TableCell>
                                    <TableCell className="px-4 py-3">{exam.total_marks}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </AdminLayout>
    );
}
