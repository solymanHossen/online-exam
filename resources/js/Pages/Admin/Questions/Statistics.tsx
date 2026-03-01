import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface StatRow {
    id: string;
    times_attempted: number;
    times_correct: number;
    question?: { question_text?: string };
}

export default function QuestionStatistics(props: any) {
    const stats: StatRow[] = props?.statistics?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Question Statistics</h2>}>
            <Head title="Question Statistics" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Question</th>
                            <th className="px-4 py-3 text-left">Attempts</th>
                            <th className="px-4 py-3 text-left">Correct</th>
                            <th className="px-4 py-3 text-left">Accuracy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.length === 0 ? (
                            <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>No statistics yet.</td></tr>
                        ) : stats.map((row) => {
                            const accuracy = row.times_attempted > 0
                                ? ((row.times_correct / row.times_attempted) * 100).toFixed(2)
                                : '0.00';

                            return (
                                <tr key={row.id} className="border-t">
                                    <td className="px-4 py-3">{row.question?.question_text ?? '-'}</td>
                                    <td className="px-4 py-3">{row.times_attempted}</td>
                                    <td className="px-4 py-3">{row.times_correct}</td>
                                    <td className="px-4 py-3">{accuracy}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
