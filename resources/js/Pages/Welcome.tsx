import { Head, Link } from '@inertiajs/react';

interface WelcomeProps {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <div className="mx-auto max-w-5xl px-6 py-14">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Online Exam Platform</h1>
                        <div className="flex items-center gap-3">
                            {canLogin && (
                                <Link href="/login" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                                    Login
                                </Link>
                            )}
                            {canRegister && (
                                <Link href="/register" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                                    Register
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-600">System is ready.</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded border border-gray-200 p-3 text-sm">Laravel: {laravelVersion}</div>
                            <div className="rounded border border-gray-200 p-3 text-sm">PHP: {phpVersion}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
