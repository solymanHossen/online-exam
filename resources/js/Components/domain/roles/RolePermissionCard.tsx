import { ShieldCheck, Users2 } from 'lucide-react';

import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Switch } from '@/Components/ui/Switch';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { RoleListItem, RolePermissionGroup } from '@/types/models';

interface RolePermissionCardProps {
    role: RoleListItem;
    permissionGroups: RolePermissionGroup[];
    permissionState: Record<string, boolean>;
    onToggle: (permissionKey: string, checked: boolean) => void;
}

export function RolePermissionCard({ role, permissionGroups, permissionState, onToggle }: RolePermissionCardProps) {
    const { t } = useTranslation();

    const enabledCount = Object.values(permissionState).filter(Boolean).length;
    const totalCount = Object.keys(permissionState).length;

    return (
        <Card className="rounded-3xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                        <CardDescription>
                            {t('admin.roles.card.description', {}, 'Tune granular access for this operational role.')}
                        </CardDescription>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                        {enabledCount}/{totalCount} {t('admin.roles.card.enabled', {}, 'enabled')}
                    </Badge>
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                        <Users2 className="mr-1 h-3.5 w-3.5" />
                        {role.users_count ?? 0} {t('admin.roles.card.users', {}, 'users')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
                {permissionGroups.map((group) => (
                    <div key={group.group} className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-border/60" />
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group.group}</p>
                            <div className="h-px flex-1 bg-border/60" />
                        </div>
                        <div className="space-y-2">
                            {group.permissions.map((permission) => {
                                const checked = permissionState[permission.key] ?? false;

                                return (
                                    <div
                                        key={permission.key}
                                        className={cn(
                                            'flex items-center justify-between gap-4 rounded-2xl border p-3 transition-colors',
                                            checked
                                                ? 'border-primary/20 bg-primary/5'
                                                : 'border-border/60 bg-background hover:border-primary/10 hover:bg-muted/20',
                                        )}
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{permission.label}</p>
                                            <p className="text-xs text-muted-foreground">{permission.key}</p>
                                        </div>
                                        <Switch
                                            checked={checked}
                                            onCheckedChange={(value) => onToggle(permission.key, value)}
                                            aria-label={permission.label}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
