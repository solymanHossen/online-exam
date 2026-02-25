import React from 'react';
import { Head, Link } from '@inertiajs/react';
import InstallerLayout from '@/Layouts/InstallerLayout';
import { Button } from '@/components/ui/button';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';

export default function Complete() {
    return (
        <InstallerLayout
            title="Installation Complete"
            description="Your Lumina LMS platform is now fully installed and ready."
            step={7}
        >
            <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">

                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Congratulations!</h3>
                    <p className="text-neutral-400 max-w-md mx-auto">
                        The installer has successfully locked the `/install` route. You can now login to your admin panel and start building your exam system.
                    </p>
                </div>

                <div className="bg-neutral-800/50 p-6 rounded-xl border border-neutral-700/50 w-full text-left space-y-4">
                    <h4 className="font-semibold text-white">Next Steps:</h4>
                    <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside">
                        <li>Login using the Admin credentials you just created.</li>
                        <li>Verify your Mail SMTP configurations in the .env file.</li>
                        <li>Start creating Subjects, Chapters, and Question Banks.</li>
                    </ul>
                </div>

                <div className="pt-4 w-full">
                    <Link href={route('login')} className="w-full">
                        <Button className="w-full gap-2" size="lg">
                            <LayoutDashboard className="w-5 h-5" /> Go to Login Panel
                        </Button>
                    </Link>
                </div>
            </div>
        </InstallerLayout>
    );
}
