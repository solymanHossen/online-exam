import { AuthBrandButton } from '@/features/auth/components/AuthBrandButton';
import { AuthStandaloneLayout } from '@/features/auth/components/AuthStandaloneLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email Verification" />

            <AuthStandaloneLayout
                title="Verify Email"
                description="Please verify your email address before getting started."
            >
                <p className="text-sm text-muted-foreground">
                    Thanks for signing up! Check your inbox and click the verification link. If you didn&apos;t receive it, request another one below.
                </p>

                {status === 'verification-link-sent' && (
                    <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                        A new verification link has been sent to your email address.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-3">
                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Resend Verification Email
                    </AuthBrandButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full text-center text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                    >
                        Log Out
                    </Link>
                </form>
            </AuthStandaloneLayout>
        </>
    );
}
