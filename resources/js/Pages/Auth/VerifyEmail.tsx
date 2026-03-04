import { AuthBrandButton } from '@/Components/domain/auth/AuthBrandButton';
import { AuthSplitLayout } from '@/Components/domain/auth/AuthSplitLayout';
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

            <AuthSplitLayout
                title="Verify Your Email"
                subtitle="Please verify your email address before getting started."
                panelTitle="Wrong Account?"
                panelDescription="If you accidentally signed up with the wrong email, you can log out and register again."
                panelActionText="Log Out"
                panelActionHref={route('logout')}
                panelActionMethod="post"
            >
                <div className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    Thanks for signing up! Check your inbox and click the verification link. If you didn't receive it, request another one below.
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary backdrop-blur-sm">
                        A new verification link has been sent to your email address.
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col space-y-4">
                    <AuthBrandButton className="w-full" type="submit" disabled={processing}>
                        Resend Verification Email
                    </AuthBrandButton>

                    <div className="text-center pt-2 lg:hidden">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                        >
                            Log Out
                        </Link>
                    </div>
                </form>
            </AuthSplitLayout>
        </>
    );
}
