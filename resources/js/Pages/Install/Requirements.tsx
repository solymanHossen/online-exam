import React from 'react';
import { Head, Link } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
    requirements: Record<string, boolean>;
    allPassed: boolean;
}

export default function Requirements({ requirements, allPassed }: Props) {
    return (
        <InstallerLayout
            title="Server Requirements"
            description="Checking if your server meets the minimum architectural requirements."
            step={2}
        >
            <div className="space-y-6 relative">
                <div className="space-y-3">
                    {Object.entries(requirements).map(([name, passed]) => (
                        <div key={name} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                            <span className="font-medium text-foreground">{name}</span>
                            {passed ? (
                                <div className="flex items-center text-primary gap-2">
                                    <span className="text-sm">Extended</span>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="flex items-center text-destructive gap-2">
                                    <span className="text-sm">Missing</span>
                                    <XCircle className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!allPassed && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-4 text-destructive text-sm">
                        <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        <p>
                            Your server does not meet all the minimum requirements. Please install or enable the missing PHP extensions and refresh this page to continue.
                        </p>
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    <Link href={route('install.welcome')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                    {allPassed ? (
                        <Link href={route('install.permissions')}>
                            <Button className="gap-2">
                                Check Permissions <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Button disabled className="gap-2 opacity-50">
                            Resolve Errors to Continue
                        </Button>
                    )}
                </div>
            </div>
        </InstallerLayout>
    );
}
