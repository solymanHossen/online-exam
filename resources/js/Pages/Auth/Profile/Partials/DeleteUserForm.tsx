import InputError from '@/Components/forms/InputError';
import Modal from '@/Components/shared/Modal';
import { Button } from '@/Components/ui/Button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/Dialog';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { useTranslation } from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const { t } = useTranslation();
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    {t('profile.delete.title', {}, 'Delete account')}
                </h2>

                <p className="text-sm leading-6 text-muted-foreground">
                    {t(
                        'profile.delete.description',
                        {},
                        'This action permanently removes your account and related data. Review this carefully before continuing.',
                    )}
                </p>
            </header>

            <Button variant="destructive" onClick={confirmUserDeletion} className="rounded-2xl">
                {t('profile.delete.action', {}, 'Delete account')}
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="space-y-6 p-6">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle>
                            {t('profile.delete.confirm_title', {}, 'Confirm account deletion')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'profile.delete.confirm_description',
                                {},
                                'Enter your password to permanently delete this account and all associated resources.',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div>
                        <Label htmlFor="password">{t('profile.delete.password', {}, 'Password')}</Label>

                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-2 h-11 rounded-2xl"
                            autoFocus
                            placeholder={t('profile.delete.password_placeholder', {}, 'Password')}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={closeModal} className="rounded-2xl">
                            {t('common.cancel', {}, 'Cancel')}
                        </Button>

                        <Button variant="destructive" className="rounded-2xl" disabled={processing}>
                            {t('profile.delete.action', {}, 'Delete account')}
                        </Button>
                    </DialogFooter>
                </form>
            </Modal>
        </section>
    );
}
