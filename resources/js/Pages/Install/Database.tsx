import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, DatabaseZap } from 'lucide-react';

interface DatabaseFormData {
    db_host: string;
    db_port: string;
    db_database: string;
    db_username: string;
    db_password: string;
}

export default function Database() {
    const { data, setData, post, processing, errors } = useForm<DatabaseFormData>({
        db_host: '127.0.0.1',
        db_port: '3306',
        db_database: 'lumina_exam',
        db_username: 'root',
        db_password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('install.database.process'));
    };

    const connectionError = (errors as Record<string, string | undefined>).connection;

    return (
        <InstallerLayout
            title="Database Configuration"
            description="Enter your MySQL database credentials. The installer will write these to the .env file."
            step={4}
        >
            <form onSubmit={submit} className="space-y-6">

                {connectionError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {connectionError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="db_host">Database Host</Label>
                        <Input
                            id="db_host"
                            value={data.db_host}
                            onChange={(e) => setData('db_host', e.target.value)}
                            className="bg-background"
                            required
                        />
                        <p className="text-xs text-muted-foreground">Use <span className="font-mono">localhost</span> on most shared hosting/cPanel servers.</p>
                        {errors.db_host && <span className="text-destructive text-xs">{errors.db_host}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="db_port">Database Port</Label>
                        <Input
                            id="db_port"
                            value={data.db_port}
                            onChange={(e) => setData('db_port', e.target.value)}
                            className="bg-background"
                            required
                        />
                        {errors.db_port && <span className="text-destructive text-xs">{errors.db_port}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="db_database">Database Name</Label>
                    <Input
                        id="db_database"
                        value={data.db_database}
                        onChange={(e) => setData('db_database', e.target.value)}
                        className="bg-background"
                        required
                    />
                    <p className="text-xs text-muted-foreground">Must be pre-created in cPanel/MySQL (often prefixed, e.g. <span className="font-mono">account_lumina_exam</span>).</p>
                    {errors.db_database && <span className="text-destructive text-xs">{errors.db_database}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="db_username">Database Username</Label>
                        <Input
                            id="db_username"
                            value={data.db_username}
                            onChange={(e) => setData('db_username', e.target.value)}
                            className="bg-background"
                            required
                        />
                        <p className="text-xs text-muted-foreground">On cPanel, username is usually prefixed too (example: <span className="font-mono">account_online_exam</span>).</p>
                        {errors.db_username && <span className="text-destructive text-xs">{errors.db_username}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="db_password">Database Password</Label>
                        <Input
                            id="db_password"
                            type="password"
                            value={data.db_password}
                            onChange={(e) => setData('db_password', e.target.value)}
                            className="bg-background"
                        />
                        {errors.db_password && <span className="text-destructive text-xs">{errors.db_password}</span>}
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-border">
                    <Link href={route('install.permissions')}>
                        <Button type="button" variant="outline">Back</Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing ? 'Connecting...' : 'Save & Connect'} {!processing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </InstallerLayout>
    );
}
