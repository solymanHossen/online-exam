import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import type { PaginatedData } from '@/types';

interface ExamRow {
    id: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
}

interface ExamsListProps {
    exams: PaginatedData<ExamRow>;
}

export default function ExamsList({ exams: examData }: ExamsListProps) {
    const exams: ExamRow[] = examData?.data ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-foreground">Available Exams</h2>}>
            <Head title="Available Exams" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-4 py-3">Title</TableHead>
                                    <TableHead className="px-4 py-3">Duration</TableHead>
                                    <TableHead className="px-4 py-3">Marks</TableHead>
                                    <TableHead className="px-4 py-3">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={4}>No active exams found.</TableCell></TableRow>
                                ) : exams.map((exam) => (
                                    <TableRow key={exam.id}>
                                        <TableCell className="px-4 py-3">{exam.title}</TableCell>
                                        <TableCell className="px-4 py-3">{exam.duration_minutes} min</TableCell>
                                        <TableCell className="px-4 py-3">{exam.total_marks}</TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Link href={`/student/exams/${exam.id}/room`} className="text-primary hover:text-primary/80">
                                                Start / Resume
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
