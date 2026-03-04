import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/Components/ui/Button';
import { Loader2, Database } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Migrations() {
    const { t } = useTranslation();
    const { post, processing, errors } = useForm<Record<string, never>>({});

    useEffect(() => {
        // Automatically start migrations when the component mounts
        post(route('install.migrations.run'));
    }, []);

    return (
        <InstallerLayout
            title={t('install.migrations.title', {}, 'Building Database')}
            description={t('install.migrations.description', {}, 'Please wait while we set up the tables and seed initial data.')}
            step={5}
        >
            <div className="flex flex-col items-center justify-center py-12 space-y-6">

                {errors.migration ? (
                    <div className="p-4 w-full bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        <h3 className="font-bold mb-2">{t('install.migrations.failed', {}, 'Migration Failed')}</h3>
                        <p>{errors.migration}</p>
                        <div className="mt-4 flex justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                {t('common.try_again', {}, 'Try Again')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                <Database className="w-8 h-8 text-primary" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-medium text-foreground">{t('install.migrations.installing_schema', {}, 'Installing Schema...')}</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                {t('install.migrations.wait_message', {}, 'This might take a minute depending on your server speed. Do not close this window.')}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </InstallerLayout>
    );
}
