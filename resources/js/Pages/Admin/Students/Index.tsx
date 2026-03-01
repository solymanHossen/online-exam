import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Students</h2>}>
            <Head title="Students" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Student</th>
                            <th className="px-4 py-3 text-left">Roll</th>
                            <th className="px-4 py-3 text-left">Batch</th>
                            <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No students found.</td></tr>
                        ) : students.map((student) => (
                            <tr key={student.id} className="border-t">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{student.user?.name ?? '-'}</div>
                                    <div className="text-xs text-gray-500">{student.user?.email ?? ''}</div>
                                </td>
                                <td className="px-4 py-3">{student.roll_number}</td>
                                <td className="px-4 py-3">{student.batch?.name ?? '-'}</td>
                                <td className="px-4 py-3">{student.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
