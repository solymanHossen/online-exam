import { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    FileQuestion,
    GraduationCap,
    Menu,
    LogOut,
    Sun,
    Moon,
    User as UserIcon,
    ChevronRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    children: ReactNode;
    header?: ReactNode;
}

const SIDEBAR_NAV = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Academic', href: '/admin/subjects', icon: BookOpen }, // Reusing subjects as Academic per previous routing
    { title: 'Question Bank', href: '/admin/questions', icon: FileQuestion },
    { title: 'Exams', href: '/admin/exams', icon: GraduationCap },
    { title: 'Students', href: '/admin/students', icon: Users },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, header }: Props) {
    const { user } = usePage<PageProps>().props.auth;
    const { url } = usePage();

    // Theme state (simple implementation, ideally managed via Context)
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
        <div className="space-y-1">
            {SIDEBAR_NAV.map((item) => {
                const isActive = url.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative ${isActive
                                ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                    >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span className="text-sm">{item.title}</span>
                        {isActive && !mobile && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-background rounded-l-full" />
                        )}
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-col border-r bg-card shadow-sm z-10 transition-all duration-300">
                <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <div className="flex items-center gap-2 text-primary">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">ExamOS</span>
                    </div>
                </div>

                <ScrollArea className="flex-1 py-6 px-4">
                    <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Main Menu
                    </div>
                    <NavLinks />
                </ScrollArea>

                <div className="p-4 border-t border-border/50 mt-auto bg-card">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                            <AvatarFallback>{getInitials(user?.name || 'Admin')}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{user?.name}</span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="shrink-0">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle navigation menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                                    <SheetHeader className="h-16 border-b px-6 flex items-start justify-center">
                                        <div className="flex items-center gap-2 text-primary">
                                            <div className="bg-primary/10 p-1.5 rounded-md">
                                                <GraduationCap className="h-5 w-5" />
                                            </div>
                                            <SheetTitle className="font-bold tracking-tight text-lg">ExamOS</SheetTitle>
                                        </div>
                                    </SheetHeader>
                                    <ScrollArea className="flex-1 py-6 px-4">
                                        <NavLinks mobile />
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Breadcrumbs / Page Title */}
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <span className="hidden sm:inline-block">Admin</span>
                            {header && (
                                <>
                                    <ChevronRight className="h-4 w-4 mx-2 hidden sm:inline-block text-muted-foreground/50" />
                                    <span className="text-foreground font-semibold text-base sm:text-sm tracking-tight">{header}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9 bg-background">
                            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <Avatar className="h-9 w-9 border border-border shadow-sm">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
                                        <AvatarFallback>{getInitials(user?.name || 'A')}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center w-full cursor-pointer">
                                        <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings" className="flex items-center w-full cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('logout')} method="post" as="button" className="flex items-center w-full text-destructive focus:text-destructive cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
