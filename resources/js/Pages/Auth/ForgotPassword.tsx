import { AuthBrandButton } from '@/Components/domain/auth/AuthBrandButton';
import { AuthSplitLayout } from '@/Components/domain/auth/AuthSplitLayout';
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

            <AuthSplitLayout
                title="Reset Password"
                subtitle="Enter your email to receive a secure reset link."
                panelTitle="Remembered it?"
                panelDescription="Securely log back into your account."
                panelActionText="Log In"
                panelActionHref={route('login')}
            >
                {status ? (
                    <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary font-medium backdrop-blur-sm">
                        {status}
                    </div>
                ) : null}

                <form onSubmit={submit} className="flex flex-col space-y-6 mt-4">
                    <AuthTextField
                        id="email"
                        type="email"
                        label="Email Address"
                        value={data.email}
                        onChange={(value) => setData('email', value)}
                        error={errors.email}
                        inputClassName="auth-input"
                    />

                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Email Password Reset Link
                    </AuthBrandButton>
                </form>
            </AuthSplitLayout>
        </>
    );
}
