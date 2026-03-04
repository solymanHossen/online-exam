import { AuthBrandButton } from '@/Components/domain/auth/AuthBrandButton';
import { AuthStandaloneLayout } from '@/Components/domain/auth/AuthStandaloneLayout';
import { AuthTextField } from '@/Components/domain/auth/AuthTextField';
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
                description="This is a secure area of the application. Please confirm your password before continuing."
            >
                <form onSubmit={submit} className="flex flex-col space-y-6">
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
                        Confirm Access
                    </AuthBrandButton>
                </form>
            </AuthStandaloneLayout>
        </>
    );
}
