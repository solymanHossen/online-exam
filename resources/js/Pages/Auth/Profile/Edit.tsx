import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Mail, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props;
    const { t } = useTranslation();
    const initials = auth.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <AuthenticatedLayout
            header={
                <div className="space-y-2">
                    <Badge className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs text-primary shadow-none">
                        <Sparkles className="mr-1 h-3 w-3" aria-hidden="true" />
                        {t('profile.badge', {}, 'Account workspace')}
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        {t('profile.title', {}, 'Profile Settings')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'profile.subtitle',
                            {},
                            'Manage your personal information, security, and account lifecycle from one place.',
                        )}
                    </p>
                </div>
            }
        >
            <Head title={t('profile.head_title', {}, 'Profile')} />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <Card className="overflow-hidden rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                        <div className="h-24 bg-gradient-to-r from-primary/90 via-violet-500/90 to-indigo-500/90" />
                        <CardContent className="relative space-y-6 p-6 pt-0">
                            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex items-end gap-4">
                                    <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1 pb-1">
                                        <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                                            {auth.user.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                                                {auth.user.email}
                                            </span>
                                            {auth.user.role?.name && (
                                                <Badge variant="outline" className="rounded-full">
                                                    {auth.user.role.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Badge className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 shadow-none">
                                    <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                                    {auth.user.email_verified_at
                                        ? t('profile.verified', {}, 'Verified account')
                                        : t('profile.unverified', {}, 'Email verification pending')}
                                </Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('profile.cards.identity', {}, 'Identity')}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        {t('profile.cards.identity_desc', {}, 'Keep your public account details current.')}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('profile.cards.security', {}, 'Security')}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        {t('profile.cards.security_desc', {}, 'Refresh your password to protect access.')}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                        {t('profile.cards.control', {}, 'Account control')}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        {t('profile.cards.control_desc', {}, 'Review the permanent deletion action carefully.')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                        <CardContent className="p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                        <CardContent className="p-6">
                            <UpdatePasswordForm />
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-destructive/20 bg-destructive/5 shadow-sm backdrop-blur">
                        <CardContent className="p-6">
                            <DeleteUserForm />
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/50 bg-white/80 shadow-sm backdrop-blur">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <UserCircle2 className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold text-foreground">
                                        {t('profile.help.title', {}, 'Account guidance')}
                                    </h3>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {t(
                                            'profile.help.description',
                                            {},
                                            'Use this page to keep your name and email accurate, rotate credentials regularly, and verify account ownership before requesting destructive actions.',
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
