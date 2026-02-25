import React from 'react';
import { Head, Link } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Welcome() {
    return (
        <InstallerLayout
            title="Welcome to Lumina LMS"
            description="The premier CodeCanyon Online Examination Platform."
            step={1}
        >
            <div className="space-y-6">
                <div className="p-6 bg-neutral-800/50 border border-neutral-700/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Installation Wizard</h2>
                    <p className="text-neutral-400 leading-relaxed text-sm">
                        Thank you for purchasing Lumina LMS. This setup wizard will guide you through the process of configuring your environment, checking server requirements, setting up the database, and creating your initial super-admin account.
                    </p>
                    <p className="text-neutral-400 leading-relaxed text-sm mt-4">
                        The entire process takes less than 3 minutes.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Link href={route('install.requirements')}>
                        <Button className="w-full sm:w-auto gap-2">
                            Begin Setup <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </InstallerLayout>
    );
}
