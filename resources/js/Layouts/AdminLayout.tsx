import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { LayoutDashboard, Users, BookOpen, Settings } from 'lucide-react';

interface Props {
    children: ReactNode;
    header?: ReactNode;
}

export default function AdminLayout({ children, header }: Props) {
    const user = usePage<PageProps>().props.auth.user;

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tight text-indigo-400">ExamOS</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                        <Users size={20} /> Users & Roles
                    </Link>
                    <Link href="/admin/subjects" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                        <BookOpen size={20} /> Academics
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 transition">
                        <Settings size={20} /> Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="font-semibold text-xl text-gray-800 leading-tight">{header}</div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
