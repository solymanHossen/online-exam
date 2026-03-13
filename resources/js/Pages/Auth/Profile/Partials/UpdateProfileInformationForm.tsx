import InputError from '@/Components/forms/InputError';
import { Alert, AlertDescription } from '@/Components/ui/Alert';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useTranslation } from '@/hooks/useTranslation';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, MailCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;
    const { t } = useTranslation();

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {t('profile.info.title', {}, 'Profile information')}
                </h2>

                <p className="text-sm leading-6 text-muted-foreground">
                    {t(
                        'profile.info.description',
                        {},
                        'Update your display name and email address to keep your account information accurate.',
                    )}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <Label htmlFor="name">{t('profile.fields.name', {}, 'Name')}</Label>

                    <Input
                        id="name"
                        className="mt-2 h-11 rounded-2xl"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                        autoFocus
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <Label htmlFor="email">{t('profile.fields.email', {}, 'Email')}</Label>

                    <Input
                        id="email"
                        type="email"
                        className="mt-2 h-11 rounded-2xl"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="space-y-3">
                        <Alert className="rounded-2xl border-amber-200 bg-amber-50 text-amber-900">
                            <MailCheck className="h-4 w-4 text-amber-700" />
                            <AlertDescription>
                                {t('profile.verify.notice', {}, 'Your email address is not verified yet.')}{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
                                >
                                    {t('profile.verify.action', {}, 'Send a new verification email')}
                                </Link>
                            </AlertDescription>
                        </Alert>

                        {status === 'verification-link-sent' && (
                            <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900">
                                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                <AlertDescription>
                                    {t(
                                        'profile.verify.sent',
                                        {},
                                        'A new verification link has been sent to your email address.',
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button disabled={processing} className="rounded-2xl px-5">
                        {t('common.save', {}, 'Save')}
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">{t('common.saved', {}, 'Saved.')}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
