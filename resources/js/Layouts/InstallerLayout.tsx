import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Compass, Database, Key, Server, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InstallerLayoutProps {
    title: string;
    description: string;
    step: number;
    children: React.ReactNode;
}

const steps = [
    { id: 1, name: 'Welcome', icon: Compass },
    { id: 2, name: 'Requirements', icon: Server },
    { id: 3, name: 'Permissions', icon: ShieldCheck },
    { id: 4, name: 'Database', icon: Database },
    { id: 5, name: 'Migrations', icon: Database }, // Skipped visually, combined conceptually
    { id: 6, name: 'Admin Setup', icon: Key },
    { id: 7, name: 'Complete', icon: CheckCircle2 },
];

export default function InstallerLayout({ title, description, step, children }: InstallerLayoutProps) {
    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
            <Head title={`Setup - ${title}`} />

            <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar Setup Steps */}
                <div className="w-full md:w-64 bg-neutral-900 p-6 border-b md:border-b-0 md:border-r border-neutral-800 hidden md:block">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            L
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Lumina LMS</span>
                    </div>

                    <nav className="space-y-4">
                        {steps.filter(s => s.id !== 5).map((s) => {
                            const Icon = s.icon;
                            // Since 5 is skipped dynamically, 6 maps to 5 visually
                            let displayId = s.id > 5 ? s.id - 1 : s.id;
                            let activeStep = step > 5 ? step - 1 : step;

                            const isActive = activeStep === displayId;
                            const isCompleted = activeStep > displayId;

                            return (
                                <div key={s.id} className="flex items-center">
                                    <div className={`p-2 rounded-lg mr-3 transition-colors ${isActive ? 'bg-primary/20 text-primary' :
                                            isCompleted ? 'bg-green-500/20 text-green-500' :
                                                'bg-neutral-800 text-neutral-500'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'text-white' :
                                            isCompleted ? 'text-green-500' :
                                                'text-neutral-500'
                                        }`}>
                                        {s.name}
                                    </span>
                                </div>
                            );
                        })}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 sm:p-12 relative">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                            <p className="text-neutral-400 mt-2 text-sm">{description}</p>
                        </div>
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </div>

            </div>

            <div className="mt-8 text-neutral-500 text-xs">
                Copyright © {new Date().getFullYear()} Lumina LMS. All rights reserved.
            </div>
        </div>
    );
}
