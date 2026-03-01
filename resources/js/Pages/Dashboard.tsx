import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard() {
    const page = usePage();
    const auth = (page.props as any).auth;
    const roleName = auth?.user?.role?.name ?? auth?.user?.role_name ?? 'user';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 space-y-4">
                            <p className="font-medium">Welcome back.</p>
                            <p className="text-sm text-gray-600">Role: {String(roleName)}</p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Link href="/profile" className="inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                                    Open Profile
                                </Link>
                                <Link href="/student/exams" className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Student Exams
                                </Link>
                                <Link href="/admin/subjects" className="inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Admin Subjects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
