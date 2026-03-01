import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ExamRow {
    id: string;
    title: string;
    duration_minutes: number;
    total_marks: number;
}

export default function ExamsList(props: any) {
    const exams: ExamRow[] = props?.exams?.data ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Available Exams</h2>}>
            <Head title="Available Exams" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Duration</th>
                                    <th className="px-4 py-3 text-left">Marks</th>
                                    <th className="px-4 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No active exams found.</td></tr>
                                ) : exams.map((exam) => (
                                    <tr key={exam.id} className="border-t">
                                        <td className="px-4 py-3">{exam.title}</td>
                                        <td className="px-4 py-3">{exam.duration_minutes} min</td>
                                        <td className="px-4 py-3">{exam.total_marks}</td>
                                        <td className="px-4 py-3">
                                            <Link href={`/student/exams/${exam.id}/room`} className="text-indigo-600 hover:text-indigo-800">
                                                Start / Resume
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
