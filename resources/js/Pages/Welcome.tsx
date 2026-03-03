import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeProps {
    canLogin: boolean;
    canRegister: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export default function Welcome({ canLogin, canRegister, laravelVersion, phpVersion }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-background text-foreground">
                <div className="mx-auto max-w-5xl px-6 py-14">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Online Exam Platform</h1>
                        <div className="flex items-center gap-3">
                            {canLogin && (
                                <Button asChild variant="outline">
                                    <Link href="/login">Login</Link>
                                </Button>
                            )}
                            {canRegister && (
                                <Button asChild>
                                    <Link href="/register">Register</Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="mt-10">
                        <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">System is ready.</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded border border-border bg-muted/20 p-3 text-sm">Laravel: {laravelVersion}</div>
                            <div className="rounded border border-border bg-muted/20 p-3 text-sm">PHP: {phpVersion}</div>
                        </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
