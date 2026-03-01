import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface QuestionRow {
    id: string;
    question_text: string;
    difficulty: string;
    marks: number;
}

export default function QuestionsIndex(props: any) {
    const questions: QuestionRow[] = props?.questions?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Questions</h2>}>
            <Head title="Questions" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Question Bank</h3>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/questions/create" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">New Question</Link>
                        <Link href="/admin/questions/statistics" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Statistics</Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 text-left">Question</th>
                                <th className="px-4 py-3 text-left">Difficulty</th>
                                <th className="px-4 py-3 text-left">Marks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr><td className="px-4 py-6 text-gray-500" colSpan={3}>No questions found.</td></tr>
                            ) : questions.map((question) => (
                                <tr key={question.id} className="border-t">
                                    <td className="px-4 py-3">{question.question_text}</td>
                                    <td className="px-4 py-3">{question.difficulty}</td>
                                    <td className="px-4 py-3">{question.marks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
