import { AuthBrandButton } from '@/features/auth/components/AuthBrandButton';
import { AuthStandaloneLayout } from '@/features/auth/components/AuthStandaloneLayout';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirm Password" />

            <AuthStandaloneLayout
                title="Confirm Password"
                description="This is a secure area. Confirm your password to continue."
            >
                <form onSubmit={submit} className="space-y-4">
                    <AuthTextField
                        id="password"
                        type="password"
                        label="Password"
                        value={data.password}
                        onChange={(value) => setData('password', value)}
                        error={errors.password}
                        inputClassName="auth-input"
                    />

                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Confirm
                    </AuthBrandButton>
                </form>
            </AuthStandaloneLayout>
        </>
    );
}
