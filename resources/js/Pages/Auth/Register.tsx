import { AuthCredentialsPanels } from '@/features/auth/components/AuthCredentialsPanels';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <AuthCredentialsPanels rightPanelActive />
        </>
    );
}
