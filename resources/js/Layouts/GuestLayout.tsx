import ApplicationLogo from '@/Components/ApplicationLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-background px-4 py-6 sm:justify-center sm:py-0">
            <div>
                <Link href="/" aria-label="Go to home">
                    <ApplicationLogo className="h-20 w-20 fill-current text-muted-foreground" />
                </Link>
            </div>

            <Card className="mt-6 w-full max-w-md">
                <CardContent className="p-6">{children}</CardContent>
            </Card>
        </div>
    );
}
