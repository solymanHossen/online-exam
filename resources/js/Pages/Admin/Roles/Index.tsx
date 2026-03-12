import { Head } from '@inertiajs/react';
import { KeyRound, Layers3, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { RolePermissionCard } from '@/Components/domain/roles/RolePermissionCard';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import AdminLayout from '@/Layouts/AdminLayout';
import type { RoleListItem, RolePermissionGroup } from '@/types/models';

interface RolesIndexProps {
    roles: RoleListItem[];
    permissionCatalog: RolePermissionGroup[];
}

function createDefaultPermissions(roleName: string, permissionCatalog: RolePermissionGroup[]) {
    const normalized = roleName.toLowerCase();
    const defaults: Record<string, boolean> = {};

    permissionCatalog.forEach((group) => {
        group.permissions.forEach((permission) => {
            defaults[permission.key] = normalized === 'admin'
                ? true
                : normalized === 'student'
                    ? permission.key.startsWith('reports.') === false && permission.key.startsWith('users.') === false
                    : permission.key.endsWith('.view') || permission.key.endsWith('.manage');
        });
    });

    return defaults;
}

export default function RolesIndex({ roles, permissionCatalog }: RolesIndexProps) {
    const { t } = useTranslation();
    const [permissionState, setPermissionState] = useState<Record<string, Record<string, boolean>>>(() => {
        return roles.reduce<Record<string, Record<string, boolean>>>((accumulator, role) => {
            accumulator[role.id] = createDefaultPermissions(role.name, permissionCatalog);
            return accumulator;
        }, {});
    });

    const metrics = useMemo(() => {
        const allPermissions = permissionCatalog.flatMap((group) => group.permissions);
        return {
            roles: roles.length,
            permissions: allPermissions.length,
            activeRules: Object.values(permissionState).reduce((sum, rolePermissions) => sum + Object.values(rolePermissions).filter(Boolean).length, 0),
        };
    }, [permissionCatalog, permissionState, roles.length]);

    return (
        <AdminLayout header={<span>{t('admin.roles.index.breadcrumb', {}, 'Roles')}</span>}>
            <Head title={t('admin.roles.index.title', {}, 'Role Management')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.roles.index.heading', {}, 'Role management')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.roles.index.description', {}, 'Review operational roles and tune permission presets with clean switch-based controls.')}
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                        {t('admin.roles.index.badge', {}, 'Frontend permission presets')}
                    </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.roles.metrics.roles', {}, 'Roles')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.roles}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><KeyRound className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.roles.metrics.permissions', {}, 'Permission rules')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.permissions}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600"><Layers3 className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.roles.metrics.active_rules', {}, 'Enabled switches')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.activeRules}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                    {roles.map((role) => (
                        <RolePermissionCard
                            key={role.id}
                            role={role}
                            permissionGroups={permissionCatalog}
                            permissionState={permissionState[role.id] ?? {}}
                            onToggle={(permissionKey, checked) => {
                                setPermissionState((current) => ({
                                    ...current,
                                    [role.id]: {
                                        ...(current[role.id] ?? {}),
                                        [permissionKey]: checked,
                                    },
                                }));
                            }}
                        />
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
