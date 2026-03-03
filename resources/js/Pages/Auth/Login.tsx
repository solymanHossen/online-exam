import { AuthCredentialsPanels } from '@/features/auth/components/AuthCredentialsPanels';
import { Head } from '@inertiajs/react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    return (
        <>
            <Head title="Log in" />
            <AuthCredentialsPanels status={status} canResetPassword={canResetPassword} />
        </>
    );
}
