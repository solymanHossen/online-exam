import ApplicationLogo from '@/Components/shared/ApplicationLogo';
import { LanguageSwitcher } from '@/Components/shared/LanguageSwitcher';
import { Button } from '@/Components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    ArrowRight,
    Facebook,
    Github,
    Instagram,
    Menu,
    Moon,
    Send,
    SunMedium,
    X,
} from 'lucide-react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

interface FrontendLayoutProps extends PropsWithChildren {
    canLogin?: boolean;
    canRegister?: boolean;
    brandName?: string;
}

interface NavItem {
    label: string;
    href: string;
}

interface FooterLinkGroup {
    title: string;
    links: NavItem[];
}

interface ThemeToggleButtonProps {
    isDarkMode: boolean;
    onToggle: () => void;
    ariaLabel: string;
}

function ThemeToggleButton({ isDarkMode, onToggle, ariaLabel }: ThemeToggleButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="rounded-full border border-white/15 bg-white/10 text-slate-700 backdrop-blur transition hover:bg-white/20 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            aria-label={ariaLabel}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={isDarkMode ? 'dark' : 'light'}
                    initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                    className="inline-flex"
                >
                    {isDarkMode ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}

export default function FrontendLayout({
    children,
    canLogin = true,
    canRegister = true,
    brandName,
}: FrontendLayoutProps) {
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const resolvedBrandName = brandName ?? t('frontend.brand_name', {}, 'Online Exam SaaS');

    const navigationItems = useMemo<NavItem[]>(() => ([
        { label: t('frontend.nav.home', {}, 'Home'), href: '/' },
        { label: t('frontend.nav.features', {}, 'Features'), href: '/#features' },
        { label: t('frontend.nav.pricing', {}, 'Pricing'), href: '/#pricing' },
        { label: t('frontend.nav.contact', {}, 'Contact'), href: '/#contact' },
    ]), [t]);

    const footerLinkGroups = useMemo<FooterLinkGroup[]>(() => ([
        {
            title: t('frontend.footer.product', {}, 'Product'),
            links: [
                { label: t('frontend.footer.exam_builder', {}, 'Exam Builder'), href: '/#features' },
                { label: t('frontend.footer.live_proctoring', {}, 'Live Proctoring'), href: '/#features' },
                { label: t('frontend.footer.analytics', {}, 'Analytics'), href: '/#pricing' },
                { label: t('frontend.footer.integrations', {}, 'Integrations'), href: '/#contact' },
            ],
        },
        {
            title: t('frontend.footer.resources', {}, 'Resources'),
            links: [
                { label: t('frontend.footer.documentation', {}, 'Documentation'), href: '/#resources' },
                { label: t('frontend.footer.guides', {}, 'Guides'), href: '/#resources' },
                { label: t('frontend.footer.support', {}, 'Support Center'), href: '/#contact' },
                { label: t('frontend.footer.status', {}, 'Status'), href: '/#contact' },
            ],
        },
        {
            title: t('frontend.footer.legal', {}, 'Legal'),
            links: [
                { label: t('frontend.footer.privacy', {}, 'Privacy Policy'), href: '/privacy' },
                { label: t('frontend.footer.terms', {}, 'Terms of Service'), href: '/terms' },
                { label: t('frontend.footer.cookies', {}, 'Cookie Policy'), href: '/cookies' },
                { label: t('frontend.footer.security', {}, 'Security'), href: '/#security' },
            ],
        },
    ]), [t]);

    const socialLinks = useMemo(() => ([
        { label: t('frontend.social.github', {}, 'GitHub'), href: 'https://github.com', icon: Github },
        { label: t('frontend.social.facebook', {}, 'Facebook'), href: 'https://facebook.com', icon: Facebook },
        { label: t('frontend.social.instagram', {}, 'Instagram'), href: 'https://instagram.com', icon: Instagram },
        { label: t('frontend.social.contact', {}, 'Contact'), href: 'mailto:hello@example.com', icon: Send },
    ]), [t]);

    useEffect(() => {
        const updateHeaderState = () => setIsScrolled(window.scrollY > 12);
        updateHeaderState();
        window.addEventListener('scroll', updateHeaderState, { passive: true });

        return () => window.removeEventListener('scroll', updateHeaderState);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const storedTheme = window.localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const nextIsDark = storedTheme ? storedTheme === 'dark' : prefersDark;

        root.classList.toggle('dark', nextIsDark);
        setIsDarkMode(nextIsDark);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const footerYear = useMemo(() => new Date().getFullYear(), []);

    const toggleTheme = () => {
        const nextMode = !isDarkMode;
        document.documentElement.classList.toggle('dark', nextMode);
        window.localStorage.setItem('theme', nextMode ? 'dark' : 'light');
        setIsDarkMode(nextMode);
    };

    const authActions = (
        <div className="flex items-center gap-2 lg:gap-3">
            <div className="rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur dark:border-white/10 dark:bg-white/5">
                <LanguageSwitcher />
            </div>
            <ThemeToggleButton
                isDarkMode={isDarkMode}
                onToggle={toggleTheme}
                ariaLabel={t('frontend.theme.toggle', {}, 'Toggle color mode')}
            />
            {canLogin ? (
                <Button
                    asChild
                    variant="ghost"
                    className="rounded-full border border-transparent px-4 text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10"
                >
                    <Link href={route('login')}>{t('frontend.auth.login', {}, 'Log in')}</Link>
                </Button>
            ) : null}
            {canRegister ? (
                <Button
                    asChild
                    className="rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 text-white shadow-[0_16px_45px_-18px_rgba(79,70,229,0.8)] hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500"
                >
                    <Link href={route('register')}>
                        {t('frontend.cta.get_started', {}, 'Get Started')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            ) : null}
        </div>
    );

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] text-slate-950 dark:bg-[linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_100%)] dark:text-slate-50">
            <header className="sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
                <motion.div
                    animate={{
                        paddingTop: isScrolled ? 12 : 18,
                        paddingBottom: isScrolled ? 12 : 18,
                    }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={cn(
                        'mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border px-4 sm:px-6',
                        isScrolled
                            ? 'border-white/20 bg-white/65 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60'
                            : 'border-transparent bg-white/0 backdrop-blur-0 dark:bg-transparent',
                    )}
                >
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                            aria-label={t('frontend.header.home_aria', {}, 'Go to homepage')}
                        >
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 text-white shadow-lg shadow-indigo-500/25">
                                <ApplicationLogo className="h-7 w-7 fill-current" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
                                    {t('frontend.header.kicker', {}, 'ENTERPRISE EXAMS')}
                                </p>
                                <p className="text-base font-semibold text-slate-900 dark:text-white">
                                    {resolvedBrandName}
                                </p>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden items-center gap-7 lg:flex">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group relative text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                            >
                                <span>{item.label}</span>
                                <motion.span
                                    initial={false}
                                    className="absolute inset-x-0 -bottom-2 h-px origin-left scale-x-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-transform duration-300 group-hover:scale-x-100"
                                />
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center lg:flex">{authActions}</div>

                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur dark:border-white/10 dark:bg-white/5">
                            <LanguageSwitcher />
                        </div>
                        <ThemeToggleButton
                            isDarkMode={isDarkMode}
                            onToggle={toggleTheme}
                            ariaLabel={t('frontend.theme.toggle', {}, 'Toggle color mode')}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="rounded-full border border-white/15 bg-white/10 backdrop-blur dark:border-white/10 dark:bg-white/5"
                            aria-label={t('frontend.header.mobile_open', {}, 'Open mobile navigation')}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </motion.div>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] lg:hidden"
                    >
                        <motion.button
                            type="button"
                            aria-label={t('frontend.header.mobile_close', {}, 'Close mobile navigation')}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
                            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 text-white">
                                        <ApplicationLogo className="h-6 w-6 fill-current" />
                                    </div>
                                    <div>
                                        <p className="text-xs tracking-[0.22em] text-indigo-300">
                                            {t('frontend.header.kicker', {}, 'ENTERPRISE EXAMS')}
                                        </p>
                                        <p className="text-sm font-semibold">{resolvedBrandName}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                    aria-label={t('frontend.header.mobile_close', {}, 'Close mobile navigation')}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="mt-10 space-y-2">
                                {navigationItems.map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.06 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base font-medium text-white transition hover:bg-white/10"
                                        >
                                            {item.label}
                                            <ArrowRight className="h-4 w-4 text-indigo-300" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-auto space-y-3 rounded-[28px] border border-white/10 bg-white/5 p-5">
                                <p className="text-sm leading-6 text-slate-300">
                                    {t('frontend.mobile.description', {}, 'Ready to launch a premium, trusted exam experience for schools, coaching centers, and enterprises.')}
                                </p>
                                <div className="grid gap-3">
                                    {canLogin ? (
                                        <Button asChild variant="ghost" className="h-11 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10">
                                            <Link href={route('login')} onClick={() => setIsMobileMenuOpen(false)}>
                                                {t('frontend.auth.login', {}, 'Log in')}
                                            </Link>
                                        </Button>
                                    ) : null}
                                    {canRegister ? (
                                        <Button asChild className="h-11 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
                                            <Link href={route('register')} onClick={() => setIsMobileMenuOpen(false)}>
                                                {t('frontend.cta.get_started', {}, 'Get Started')}
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <main>{children}</main>

            <footer className="relative mt-24 overflow-hidden border-t border-slate-200/70 bg-slate-950 text-white dark:border-white/10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_28%)]" />

                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_120px_-40px_rgba(79,70,229,0.5)] backdrop-blur-xl sm:p-10 lg:flex lg:items-center lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                                {t('frontend.footer.cta_eyebrow', {}, 'Ready to transform your exams?')}
                            </p>
                            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                {t('frontend.footer.cta_title', {}, 'Get started today.')}
                            </h2>
                            <p className="text-sm leading-7 text-slate-300 sm:text-base">
                                {t('frontend.footer.cta_description', {}, 'Build secure assessments, automate evaluation, and deliver a premium candidate experience from one enterprise-grade platform.')}
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3 lg:mt-0">
                            {canLogin ? (
                                <Button asChild variant="ghost" className="rounded-full border border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                                    <Link href={route('login')}>{t('frontend.auth.login', {}, 'Log in')}</Link>
                                </Button>
                            ) : null}
                            {canRegister ? (
                                <Button asChild className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100">
                                    <Link href={route('register')}>
                                        {t('frontend.cta.get_started', {}, 'Get Started')}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-16 grid gap-10 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 text-white shadow-lg shadow-indigo-500/25">
                                    <ApplicationLogo className="h-7 w-7 fill-current" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold tracking-[0.22em] text-indigo-300">
                                        {t('frontend.header.kicker', {}, 'ENTERPRISE EXAMS')}
                                    </p>
                                    <p className="text-lg font-semibold text-white">{resolvedBrandName}</p>
                                </div>
                            </div>
                            <p className="max-w-md text-sm leading-7 text-slate-300">
                                {t('frontend.footer.brand_description', {}, 'Premium online examination infrastructure for institutions that need scale, trust, analytics, and world-class candidate journeys.')}
                            </p>
                            <div className="flex items-center gap-3">
                                {socialLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <motion.a
                                            key={item.label}
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                                            whileHover={{ y: -3 }}
                                            whileTap={{ scale: 0.96 }}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 hover:text-white"
                                            aria-label={item.label}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </div>

                        {footerLinkGroups.map((group) => (
                            <div key={group.title} className="space-y-5">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                                    {group.title}
                                </h3>
                                <ul className="space-y-3">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-slate-300 transition hover:text-white"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 border-t border-white/10 pt-6 text-sm text-slate-400">
                        © {footerYear} {resolvedBrandName}. {t('frontend.footer.copyright', {}, 'All rights reserved.')}
                    </div>
                </div>
            </footer>
        </div>
    );
}
