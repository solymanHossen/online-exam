import { AuthBrandButton } from '@/Components/domain/auth/AuthBrandButton';
import { AuthSplitLayout } from '@/Components/domain/auth/AuthSplitLayout';
import { AuthTextField } from '@/Components/domain/auth/AuthTextField';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />

            <AuthSplitLayout
                title="Create New Password"
                subtitle="Set your new password to secure your account and continue."
                panelTitle="Changed your mind?"
                panelDescription="Return to the login screen securely."
                panelActionText="Log In"
                panelActionHref={route('login')}
            >
                <form onSubmit={submit} className="flex flex-col space-y-5 mt-4">
                    <AuthTextField
                        id="email"
                        type="email"
                        label="Email Address"
                        value={data.email}
                        autoComplete="username"
                        onChange={(value) => setData('email', value)}
                        error={errors.email}
                        inputClassName="auth-input"
                    />

                    <AuthTextField
                        id="password"
                        type="password"
                        label="New Password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(value) => setData('password', value)}
                        error={errors.password}
                        inputClassName="auth-input"
                    />

                    <AuthTextField
                        id="password_confirmation"
                        type="password"
                        label="Confirm New Password"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(value) =>
                            setData('password_confirmation', value)
                        }
                        error={errors.password_confirmation}
                        inputClassName="auth-input"
                    />

                    <div className="pt-2">
                        <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                            Reset Password
                        </AuthBrandButton>
                    </div>
                </form>
            </AuthSplitLayout>
        </>
    );
}
