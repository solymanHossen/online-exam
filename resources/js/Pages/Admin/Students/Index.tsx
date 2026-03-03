import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StudentRow {
    id: string;
    roll_number: string;
    status: string;
    user?: { name?: string; email?: string };
    batch?: { name?: string };
}

export default function StudentsIndex(props: any) {
    const students: StudentRow[] = props?.students?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-foreground leading-tight">Students</h2>}>
            <Head title="Students" />

            <Card className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-4 py-3">Student</TableHead>
                            <TableHead className="px-4 py-3">Roll</TableHead>
                            <TableHead className="px-4 py-3">Batch</TableHead>
                            <TableHead className="px-4 py-3">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow><TableCell className="px-4 py-6 text-muted-foreground" colSpan={4}>No students found.</TableCell></TableRow>
                        ) : students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="px-4 py-3">
                                    <div className="font-medium">{student.user?.name ?? '-'}</div>
                                    <div className="text-xs text-muted-foreground">{student.user?.email ?? ''}</div>
                                </TableCell>
                                <TableCell className="px-4 py-3">{student.roll_number}</TableCell>
                                <TableCell className="px-4 py-3">{student.batch?.name ?? '-'}</TableCell>
                                <TableCell className="px-4 py-3">{student.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </AdminLayout>
    );
}
