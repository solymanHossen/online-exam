import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { ArrowRight, UserPlus } from 'lucide-react';

interface AdminFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Admin() {
    const { data, setData, post, processing, errors } = useForm<AdminFormData>({
        name: 'Administrator',
        email: 'admin@example.com',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('install.admin.process'));
    };

    const adminError = (errors as Record<string, string | undefined>).admin;

    return (
        <InstallerLayout
            title="Admin Account"
            description="Create the master administrator account for your platform."
            step={6}
        >
            <form onSubmit={submit} className="space-y-6">

                {adminError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                        {adminError}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="bg-background"
                        required
                    />
                    {errors.name && <span className="text-destructive text-xs">{errors.name}</span>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address (Login ID)</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="bg-background"
                        required
                    />
                    {errors.email && <span className="text-destructive text-xs">{errors.email}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="password">Master Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="bg-background"
                            required
                        />
                        {errors.password && <span className="text-destructive text-xs">{errors.password}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="bg-background"
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-border">
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing ? 'Creating...' : 'Create Admin & Finish'} {!processing && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </div>
            </form>
        </InstallerLayout>
    );
}
