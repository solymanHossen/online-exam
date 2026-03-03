import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { PageProps, User } from '@/types';

type DashboardUser = User & {
    role?: {
        name?: string;
    };
    role_name?: string;
};

type DashboardPageProps = PageProps & {
    auth: {
        user: DashboardUser;
    };
};

export default function Dashboard() {
    const { auth } = usePage<DashboardPageProps>().props;
    const roleName = auth.user.role?.name ?? auth.user.role_name ?? 'user';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome back.</CardTitle>
                            <CardDescription>
                                Role: {String(roleName)}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href="/profile">Open Profile</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/student/exams">Student Exams</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/admin/subjects">Admin Subjects</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
