import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, UserPlus } from 'lucide-react';

export default function Admin() {
    const { data, setData, post, processing, errors } = useForm<any>({
        name: 'Administrator',
        email: 'admin@example.com',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('install.admin.process'));
    };

    return (
        <InstallerLayout
            title="Admin Account"
            description="Create the master administrator account for your platform."
            step={6}
        >
            <form onSubmit={submit} className="space-y-6">

                {errors.admin && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {errors.admin}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-300">Full Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                        required
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-300">Email Address (Login ID)</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white"
                        required
                    />
                    {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-neutral-300">Master Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                            required
                        />
                        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-neutral-300">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="bg-neutral-800 border-neutral-700 text-white"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-neutral-800">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing ? 'Creating...' : 'Create Admin & Finish'} {!processing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </InstallerLayout>
    );
}
