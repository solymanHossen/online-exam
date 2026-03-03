import { AuthBrandButton } from '@/features/auth/components/AuthBrandButton';
import { AuthStandaloneLayout } from '@/features/auth/components/AuthStandaloneLayout';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
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

            <AuthStandaloneLayout
                title="Reset Password"
                description="Set your new password to secure your account and continue."
            >
                <form onSubmit={submit} className="space-y-4">
                    <AuthTextField
                        id="email"
                        type="email"
                        label="Email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(value) => setData('email', value)}
                        error={errors.email}
                        inputClassName="auth-input"
                    />

                    <AuthTextField
                        id="password"
                        type="password"
                        label="Password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(value) => setData('password', value)}
                        error={errors.password}
                        inputClassName="auth-input"
                    />

                    <AuthTextField
                        id="password_confirmation"
                        type="password"
                        label="Confirm Password"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(value) =>
                            setData('password_confirmation', value)
                        }
                        error={errors.password_confirmation}
                        inputClassName="auth-input"
                    />

                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Reset Password
                    </AuthBrandButton>
                </form>
            </AuthStandaloneLayout>
        </>
    );
}
