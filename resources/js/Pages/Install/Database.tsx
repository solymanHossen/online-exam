import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, DatabaseZap } from 'lucide-react';

export default function Database() {
    const { data, setData, post, processing, errors } = useForm<any>({
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

    return (
        <InstallerLayout
            title="Database Configuration"
            description="Enter your MySQL database credentials. The installer will write these to the .env file."
            step={4}
        >
            <form onSubmit={submit} className="space-y-6">

                {errors.connection && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {errors.connection}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="db_host" className="text-neutral-300">Database Host</Label>
                        <Input
                            id="db_host"
                            value={data.db_host}
                            onChange={(e) => setData('db_host', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                            required
                        />
                        {errors.db_host && <span className="text-red-500 text-xs">{errors.db_host}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="db_port" className="text-neutral-300">Database Port</Label>
                        <Input
                            id="db_port"
                            value={data.db_port}
                            onChange={(e) => setData('db_port', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                            required
                        />
                        {errors.db_port && <span className="text-red-500 text-xs">{errors.db_port}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="db_database" className="text-neutral-300">Database Name</Label>
                    <Input
                        id="db_database"
                        value={data.db_database}
                        onChange={(e) => setData('db_database', e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                        required
                    />
                    <p className="text-xs text-neutral-500">Must be pre-created in cPanel/MySQL.</p>
                    {errors.db_database && <span className="text-red-500 text-xs">{errors.db_database}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="db_username" className="text-neutral-300">Database Username</Label>
                        <Input
                            id="db_username"
                            value={data.db_username}
                            onChange={(e) => setData('db_username', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                            required
                        />
                        {errors.db_username && <span className="text-red-500 text-xs">{errors.db_username}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="db_password" className="text-neutral-300">Database Password</Label>
                        <Input
                            id="db_password"
                            type="password"
                            value={data.db_password}
                            onChange={(e) => setData('db_password', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                        />
                        {errors.db_password && <span className="text-red-500 text-xs">{errors.db_password}</span>}
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-neutral-800">
                    <Link href={route('install.permissions')}>
                        <Button type="button" variant="outline" className="text-white border-neutral-700 bg-neutral-800 hover:bg-neutral-700">Back</Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing ? 'Connecting...' : 'Save & Connect'} {!processing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </InstallerLayout>
    );
}
