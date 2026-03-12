import { Head, router } from '@inertiajs/react';
import { Filter, ShieldCheck, UserPlus, Users2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AcademicDataTable, type AcademicTableColumn } from '@/Components/domain/academic/AcademicDataTable';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { useNavigationProgress } from '@/hooks/useNavigationProgress';
import { useTranslation } from '@/hooks/useTranslation';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PaginatedData, User } from '@/types';
import type { RoleListItem } from '@/types/models';

interface UsersIndexProps {
    users: PaginatedData<User>;
    roles: RoleListItem[];
}

type RoleFilter = 'all' | string;

function getInitials(name: string) {
    return name
        .split(' ')
        .map((segment) => segment[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export default function UsersIndex({ users, roles }: UsersIndexProps) {
    const { t } = useTranslation();
    const isNavigating = useNavigationProgress();
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

    const metrics = useMemo(() => {
        const rows = users.data ?? [];

        return {
            total: rows.length,
            active: rows.filter((user) => user.is_active).length,
            admins: rows.filter((user) => user.role?.name?.toLowerCase() === 'admin').length,
        };
    }, [users.data]);

    const columns: AcademicTableColumn<User>[] = [
        {
            id: 'name',
            header: t('admin.users.table.name', {}, 'User'),
            sortable: true,
            sortValue: (user) => user.name.toLowerCase(),
            cell: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-border shadow-sm">
                        <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                        <AvatarFallback className="text-sm font-semibold">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            id: 'role',
            header: t('admin.users.table.role', {}, 'Role'),
            sortable: true,
            sortValue: (user) => user.role?.name?.toLowerCase() ?? '',
            cell: (user) => (
                <Badge variant="outline" className="rounded-full px-3 py-1 capitalize">
                    {user.role?.name ?? t('admin.users.table.no_role', {}, 'No role')}
                </Badge>
            ),
        },
        {
            id: 'status',
            header: t('admin.users.table.status', {}, 'Status'),
            sortable: true,
            sortValue: (user) => (user.is_active ? 1 : 0),
            cell: (user) => (
                <Badge variant={user.is_active ? 'secondary' : 'outline'} className="rounded-full px-3 py-1">
                    {user.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Inactive')}
                </Badge>
            ),
        },
        {
            id: 'last_login_at',
            header: t('admin.users.table.last_login', {}, 'Last login'),
            sortable: true,
            sortValue: (user) => user.last_login_at ?? '',
            cell: (user) => (
                <div className="text-sm text-muted-foreground">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}
                </div>
            ),
        },
        {
            id: 'created_at',
            header: t('admin.users.table.created', {}, 'Created'),
            sortable: true,
            sortValue: (user) => user.created_at ?? '',
            cell: (user) => (
                <div className="text-sm text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                </div>
            ),
        },
    ];

    return (
        <AdminLayout header={<span>{t('admin.users.index.breadcrumb', {}, 'Users')}</span>}>
            <Head title={t('admin.users.index.title', {}, 'User Management')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.users.index.heading', {}, 'User management')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.users.index.description', {}, 'Review platform users, monitor account activity, and quickly scan role distribution across the system.')}
                        </p>
                    </div>
                    <Button className="rounded-xl shadow-sm">
                        <UserPlus className="h-4 w-4" />
                        {t('admin.users.index.create', {}, 'Add user')}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Users2 className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.users.metrics.total', {}, 'Visible users')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.users.metrics.active', {}, 'Active accounts')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600"><Filter className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.users.metrics.admins', {}, 'Admin accounts')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.admins}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AcademicDataTable
                    data={users}
                    columns={columns}
                    title={t('admin.users.table.title', {}, 'Account directory')}
                    description={t('admin.users.table.description', {}, 'Search through registered users and inspect account roles at a glance.')}
                    searchPlaceholder={t('admin.users.table.search', {}, 'Search by name or email')}
                    searchPredicate={(user, search) => {
                        const roleMatches = roleFilter === 'all' || user.role?.id === roleFilter;
                        const haystack = `${user.name} ${user.email} ${user.role?.name ?? ''}`.toLowerCase();
                        return roleMatches && haystack.includes(search);
                    }}
                    loading={isNavigating}
                    emptyTitle={t('admin.users.table.empty_title', {}, 'No users found')}
                    emptyDescription={t('admin.users.table.empty_description', {}, 'User accounts will appear here once they are created.')}
                    filterSlot={
                        <Select
                            value={roleFilter}
                            onValueChange={(value) => {
                                setRoleFilter(value);
                                router.get(route('admin.users.index'), value === 'all' ? {} : { role_id: value }, { preserveState: true, preserveScroll: true, replace: true });
                            }}
                        >
                            <SelectTrigger className="w-full rounded-xl sm:w-[200px]">
                                <SelectValue placeholder={t('admin.users.filter.role', {}, 'Filter by role')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all', {}, 'All')}</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                />
            </div>
        </AdminLayout>
    );
}
