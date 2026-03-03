import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';

export default function Migrations() {
    const { post, processing, errors } = useForm<any>({});

    useEffect(() => {
        // Automatically start migrations when the component mounts
        post(route('install.migrations.run'));
    }, []);

    return (
        <InstallerLayout
            title="Building Database"
            description="Please wait while we set up the tables and seed initial data."
            step={5}
        >
            <div className="flex flex-col items-center justify-center py-12 space-y-6">

                {errors.migration ? (
                    <div className="p-4 w-full bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        <h3 className="font-bold mb-2">Migration Failed</h3>
                        <p>{errors.migration}</p>
                        <div className="mt-4 flex justify-center">
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Try Again
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
                            <h3 className="text-xl font-medium text-foreground">Installing Schema...</h3>
                            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                This might take a minute depending on your server speed. Do not close this window.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </InstallerLayout>
    );
}
