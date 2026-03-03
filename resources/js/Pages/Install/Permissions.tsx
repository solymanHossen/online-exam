import React from 'react';
import { Head, Link } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
    permissions: Record<string, boolean>;
    allPassed: boolean;
}

export default function Permissions({ permissions, allPassed }: Props) {
    return (
        <InstallerLayout
            title="Directory Permissions"
            description="Ensuring Laravel has read/write access to critical folders."
            step={3}
        >
            <div className="space-y-6">
                <div className="space-y-3">
                    {Object.entries(permissions).map(([folder, isWritable]) => (
                        <div key={folder} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-lg">
                            <span className="font-mono text-sm text-foreground">{folder}</span>
                            {isWritable ? (
                                <div className="flex items-center text-primary gap-2">
                                    <span className="text-sm font-medium">Writable (0775)</span>
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="flex items-center text-destructive gap-2">
                                    <span className="text-sm font-medium">Read Only</span>
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!allPassed && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        <h4 className="font-bold flex items-center gap-2 mb-2">
                            <ShieldAlert className="w-5 h-5" /> Permission Denied
                        </h4>
                        <p className="mb-2">Please run the following commands via terminal or adjust via cPanel File Manager:</p>
                        <pre className="bg-muted p-3 rounded border border-destructive/20 font-mono text-xs overflow-x-auto text-destructive/80">
                            chmod -R 775 storage bootstrap/cache{'\n'}
                            chown -R www-data:www-data storage bootstrap/cache
                        </pre>
                    </div>
                )}

                <div className="flex justify-between pt-4">
                    <Link href={route('install.requirements')}>
                        <Button variant="outline">Back</Button>
                    </Link>
                    {allPassed ? (
                        <Link href={route('install.database')}>
                            <Button className="gap-2">
                                Configure Database <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Button disabled className="gap-2 opacity-50">
                            Resolve Permissions to Continue
                        </Button>
                    )}
                </div>
            </div>
        </InstallerLayout>
    );
}
