import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

interface BatchRow {
    id: string;
    name: string;
    class_level: string;
    year: number;
}

export default function BatchesIndex(props: any) {
    const batches: BatchRow[] = props?.batches?.data ?? [];

    return (
        <AdminLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Batches</h2>}>
            <Head title="Batches" />

            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Class</th>
                            <th className="px-4 py-3 text-left">Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.length === 0 ? (
                            <tr><td className="px-4 py-6 text-gray-500" colSpan={3}>No batches found.</td></tr>
                        ) : batches.map((batch) => (
                            <tr key={batch.id} className="border-t">
                                <td className="px-4 py-3">{batch.name}</td>
                                <td className="px-4 py-3">{batch.class_level}</td>
                                <td className="px-4 py-3">{batch.year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
