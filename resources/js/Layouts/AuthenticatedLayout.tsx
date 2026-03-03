import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu } from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { PageProps } from '@/types';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage<PageProps>().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <nav className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" aria-label="Go to home">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-foreground" />
                                </Link>
                            </div>

                            <div className="hidden items-center gap-4 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        aria-label="Open user menu"
                                    >
                                        <span className="max-w-44 truncate">{user.name}</span>
                                        <ChevronDown className="size-4" aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={route('profile.edit')}>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <Sheet
                                open={showingNavigationDropdown}
                                onOpenChange={setShowingNavigationDropdown}
                            >
                                <SheetTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Open navigation menu"
                                    >
                                        <Menu className="size-5" aria-hidden="true" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[20rem] p-4">
                                    <SheetHeader className="border-b border-border pb-3 text-left">
                                        <SheetTitle>Navigation</SheetTitle>
                                        <SheetDescription>
                                            Access your account and dashboard links.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-1 pt-4">
                                        <ResponsiveNavLink
                                            href={route('dashboard')}
                                            active={route().current('dashboard')}
                                        >
                                            Dashboard
                                        </ResponsiveNavLink>
                                    </div>

                                    <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>

                                        <div className="mt-3 space-y-1">
                                            <ResponsiveNavLink href={route('profile.edit')}>
                                                Profile
                                            </ResponsiveNavLink>
                                            <ResponsiveNavLink
                                                method="post"
                                                href={route('logout')}
                                                as="button"
                                            >
                                                Log Out
                                            </ResponsiveNavLink>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

            </nav>

            {header && (
                <header className={cn('border-b border-border bg-card')}>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
