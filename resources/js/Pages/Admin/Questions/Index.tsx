import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface QuestionRow {
    id: string;
    question_text: string;
    difficulty: string;
    marks: number;
}

export default function QuestionsIndex(props: any) {
    const questions: QuestionRow[] = props?.questions?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Questions</h2>}>
            <Head title="Questions" />

            <Card>
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">Question Bank</h3>
                    <div className="flex items-center gap-2">
                        <Button asChild><Link href="/admin/questions/create">New Question</Link></Button>
                        <Button asChild variant="outline"><Link href="/admin/questions/statistics">Statistics</Link></Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-3">Question</TableHead>
                                <TableHead className="px-4 py-3">Difficulty</TableHead>
                                <TableHead className="px-4 py-3">Marks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {questions.length === 0 ? (
                                <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={3}>No questions found.</TableCell></TableRow>
                            ) : questions.map((question) => (
                                <TableRow key={question.id}>
                                    <TableCell className="px-4 py-3">{question.question_text}</TableCell>
                                    <TableCell className="px-4 py-3">{question.difficulty}</TableCell>
                                    <TableCell className="px-4 py-3">{question.marks}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </AdminLayout>
    );
}
