import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/Button';
import { Card } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import type { PaginatedData } from '@/types';
import { Plus } from 'lucide-react';
import { Badge } from '@/Components/ui/Badge';

interface ExamRow {
    id: string;
    title: string;
    status: string;
    duration_minutes: number;
    total_marks: number;
}

interface ExamsIndexProps {
    exams: PaginatedData<ExamRow>;
}

export default function ExamsIndex({ exams: examData }: ExamsIndexProps) {
    const exams: ExamRow[] = examData?.data ?? [];

    return (
        <AdminLayout>
            <Head title="Exams" />

            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="auth-font text-3xl font-bold tracking-tight text-foreground">Exams</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage and configure your system's examinations.</p>
                </div>
                <Button className="auth-primary-button rounded-xl h-11 px-6 shadow-glow" asChild>
                    <Link href="/admin/exams/create">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Exam
                    </Link>
                </Button>
            </div>

            <Card className="rounded-[28px] border-border/60 shadow-xl overflow-hidden bg-card">
                <div className="p-6 border-b border-border/50 bg-muted/10">
                    <h3 className="font-semibold text-lg">All Exams</h3>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="px-6 py-4 text-xs tracking-wider uppercase text-muted-foreground font-semibold">Title</TableHead>
                                <TableHead className="px-6 py-4 text-xs tracking-wider uppercase text-muted-foreground font-semibold">Status</TableHead>
                                <TableHead className="px-6 py-4 text-xs tracking-wider uppercase text-muted-foreground font-semibold">Duration</TableHead>
                                <TableHead className="px-6 py-4 text-xs tracking-wider uppercase text-muted-foreground font-semibold text-right">Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.length === 0 ? (
                                <TableRow>
                                    <TableCell className="px-6 py-12 text-center text-muted-foreground" colSpan={4}>
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="rounded-full bg-muted/20 p-3">
                                                <Plus className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p>No exams found. Create your first exam to get started.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : exams.map((exam) => (
                                <TableRow key={exam.id} className="group transition-colors hover:bg-muted/20">
                                    <TableCell className="px-6 py-4 font-medium">{exam.title}</TableCell>
                                    <TableCell className="px-6 py-4">
                                        <Badge variant={exam.status === 'published' ? 'default' : 'secondary'} className="rounded-full px-3 py-1 text-xs font-medium">
                                            {exam.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-muted-foreground">{exam.duration_minutes} min</TableCell>
                                    <TableCell className="px-6 py-4 text-right font-medium">{exam.total_marks}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </AdminLayout>
    );
}
