import { AuthCredentialsPanels } from '@/Components/domain/auth/AuthCredentialsPanels';
import { Head } from '@inertiajs/react';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <AuthCredentialsPanels rightPanelActive />
        </>
    );
}
