import { AuthBrandButton } from '@/Components/domain/auth/AuthBrandButton';
import { AuthStandaloneLayout } from '@/Components/domain/auth/AuthStandaloneLayout';
import { AuthTextField } from '@/Components/domain/auth/AuthTextField';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

            <AuthStandaloneLayout
                title="Forgot Password"
                description="No problem. Enter your email and we’ll send you a secure reset link."
            >
                {status ? (
                    <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                        {status}
                    </div>
                ) : null}

                <form onSubmit={submit} className="space-y-4">
                    <AuthTextField
                        id="email"
                        type="email"
                        label="Email"
                        value={data.email}
                        onChange={(value) => setData('email', value)}
                        error={errors.email}
                        inputClassName="auth-input"
                    />

                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Email Password Reset Link
                    </AuthBrandButton>
                </form>
            </AuthStandaloneLayout>
        </>
    );
}
