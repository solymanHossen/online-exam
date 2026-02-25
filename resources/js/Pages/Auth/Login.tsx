import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
    appEnv = 'local', // CodeCanyon Demo Setup: Assumes 'appEnv' is passed from HandleInertiaRequests or the Controller
}: {
    status?: string;
    canResetPassword: boolean;
    appEnv?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>

            {/* Task 4: Login Demo Credentials */}
            {(appEnv === 'demo' || appEnv === 'local') && (
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-4 text-center uppercase tracking-wider">
                        One-Click Demo Access
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => { setData('email', 'admin@example.com'); setData('password', 'password'); }}
                            type="button"
                            className="rounded-md bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                            Admin
                        </button>
                        <button
                            onClick={() => { setData('email', 'teacher@example.com'); setData('password', 'password'); }}
                            type="button"
                            className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                            Teacher
                        </button>
                        <button
                            onClick={() => { setData('email', 'student@example.com'); setData('password', 'password'); }}
                            type="button"
                            className="rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                            Student
                        </button>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}
