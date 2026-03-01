import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Exams</h2>}>
            <Head title="Exams" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">All Exams</h3>
                    <Link href="/admin/exams/create" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Create Exam
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Duration</th>
                                <th className="px-4 py-3 text-left">Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No exams found.</td></tr>
                            ) : exams.map((exam) => (
                                <tr key={exam.id} className="border-t">
                                    <td className="px-4 py-3">{exam.title}</td>
                                    <td className="px-4 py-3">{exam.status}</td>
                                    <td className="px-4 py-3">{exam.duration_minutes} min</td>
                                    <td className="px-4 py-3">{exam.total_marks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
