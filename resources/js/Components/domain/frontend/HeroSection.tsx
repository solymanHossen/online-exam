import { Button } from '@/Components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import {
    ArrowRight,
    BarChart3,
    CircleCheckBig,
    Play,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';

interface HeroSectionProps {
    primaryHref?: string;
    secondaryHref?: string;
    institutionsCount?: number;
    className?: string;
}

interface InstitutionLogoProps {
    label: string;
}

function InstitutionLogo({ label }: InstitutionLogoProps) {
    return (
        <div className="flex min-w-[170px] items-center justify-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4 text-slate-500 shadow-sm backdrop-blur grayscale transition duration-300 hover:grayscale-0 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
                <rect x="6" y="8" width="36" height="32" rx="10" className="fill-current opacity-15" />
                <path
                    d="M14 29L20 19L25 25L29 21L34 29"
                    className="stroke-current"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="18" cy="17" r="2.5" className="fill-current" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">{label}</span>
        </div>
    );
}

function DashboardMockup() {
    const { t } = useTranslation();

    const metricCards = [
        {
            icon: Users,
            label: t('frontend.hero.mockup_active', {}, 'Active students'),
            value: '12.4k',
            accent: 'from-sky-500/20 to-cyan-500/10 text-sky-600 dark:text-sky-300',
        },
        {
            icon: ShieldCheck,
            label: t('frontend.hero.mockup_security', {}, 'Integrity score'),
            value: '99.2%',
            accent: 'from-emerald-500/20 to-green-500/10 text-emerald-600 dark:text-emerald-300',
        },
        {
            icon: BarChart3,
            label: t('frontend.hero.mockup_completion', {}, 'Completion rate'),
            value: '94.8%',
            accent: 'from-violet-500/20 to-fuchsia-500/10 text-violet-600 dark:text-violet-300',
        },
    ];

    const chartBars = [72, 88, 61, 93, 78, 84, 69];

    return (
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div
                aria-hidden="true"
                className="absolute inset-x-10 top-10 h-48 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.38),_transparent_65%)] blur-3xl"
                animate={{ opacity: [0.45, 0.75, 0.45], scale: [0.98, 1.04, 0.98] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 48 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, delay: 0.18, ease: 'easeOut' }}
                className="relative"
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="overflow-hidden rounded-[34px] border border-white/70 bg-white/85 shadow-[0_45px_120px_-42px_rgba(15,23,42,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/75"
                >
                    <div className="border-b border-slate-200/80 px-6 py-4 dark:border-white/10 sm:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
                                    {t('frontend.hero.mockup_badge', {}, 'Live command center')}
                                </p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">
                                    {t('frontend.hero.mockup_title', {}, 'Exam operations dashboard')}
                                </h3>
                            </div>
                            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {t('frontend.hero.mockup_live', {}, 'All systems stable')}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
                        <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-3">
                                {metricCards.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.label}
                                            className="rounded-3xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/5"
                                        >
                                            <div className={cn('mb-3 inline-flex rounded-2xl bg-gradient-to-br p-2.5', item.accent)}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                                            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="rounded-[28px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                            {t('frontend.hero.mockup_performance', {}, 'Weekly assessment performance')}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {t('frontend.hero.mockup_performance_body', {}, 'Real-time pass trends across all managed institutions.')}
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        +18.4%
                                    </div>
                                </div>

                                <div className="mt-6 flex h-44 items-end gap-3">
                                    {chartBars.map((height, index) => (
                                        <motion.div
                                            key={`${height}-${index}`}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${height}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: 0.08 * index, ease: 'easeOut' }}
                                            className="flex-1 rounded-t-[18px] bg-gradient-to-t from-indigo-600 via-violet-500 to-fuchsia-400 shadow-lg shadow-indigo-500/20"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    {t('frontend.hero.mockup_live_exam', {}, 'Live exam health')}
                                </p>
                                <div className="mt-5 space-y-4">
                                    {[
                                        {
                                            label: t('frontend.hero.mockup_uptime', {}, 'Platform uptime'),
                                            value: '99.99%',
                                        },
                                        {
                                            label: t('frontend.hero.mockup_sync', {}, 'Auto-save sync'),
                                            value: '1.2s',
                                        },
                                        {
                                            label: t('frontend.hero.mockup_flagged', {}, 'Flagged sessions'),
                                            value: '07',
                                        },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                                            <span className="text-sm font-semibold text-slate-950 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-5 text-white shadow-[0_24px_60px_-30px_rgba(79,70,229,0.7)]">
                                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
                                    <CircleCheckBig className="h-4 w-4" />
                                    {t('frontend.hero.mockup_ai', {}, 'AI-powered evaluation ready')}
                                </div>
                                <p className="mt-4 text-2xl font-semibold tracking-tight">
                                    {t('frontend.hero.mockup_ai_title', {}, 'Publish, monitor, and evaluate every exam from one premium workspace.')}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-indigo-100/80">
                                    {t('frontend.hero.mockup_ai_body', {}, 'From admissions to certification programs, orchestrate secure exam delivery with deep analytics and enterprise-grade reliability.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export function HeroSection({
    primaryHref = route('register'),
    secondaryHref = '/#demo',
    institutionsCount = 500,
    className,
}: HeroSectionProps) {
    const { t } = useTranslation();

    const logos = [
        t('frontend.hero.logo_one', {}, 'Northbridge'),
        t('frontend.hero.logo_two', {}, 'Elevate'),
        t('frontend.hero.logo_three', {}, 'Scholara'),
        t('frontend.hero.logo_four', {}, 'Vertex'),
        t('frontend.hero.logo_five', {}, 'Aptis'),
        t('frontend.hero.logo_six', {}, 'Lumen'),
    ];

    const marqueeItems = [...logos, ...logos];

    return (
        <section
            className={cn(
                'relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 lg:pt-16',
                className,
            )}
        >
            <div className="absolute inset-x-0 top-0 -z-10 h-[540px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_52%)]" />
            <div className="absolute left-1/2 top-16 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-500/20 dark:bg-white/5 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        {t('frontend.hero.badge', {}, 'Enterprise-grade online examination platform')}
                    </div>

                    <h1 className="mt-8 text-balance text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                        {t('frontend.hero.heading_prefix', {}, 'Master Your')}{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                            {t('frontend.hero.heading_highlight', {}, 'Assessments')}
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
                        {t('frontend.hero.subheading', {}, 'Launch secure, beautifully designed online exams with instant analytics, trusted payment workflows, and a premium experience for every student and institution.')}
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <motion.div
                            animate={{ y: [0, -5, 0], boxShadow: ['0 18px 50px -20px rgba(79,70,229,0.7)', '0 24px 60px -18px rgba(79,70,229,0.8)', '0 18px 50px -20px rgba(79,70,229,0.7)'] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            className="rounded-full"
                        >
                            <Button
                                asChild
                                className="h-12 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-7 text-base text-white hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500"
                            >
                                <Link href={primaryHref}>
                                    {t('frontend.hero.primary_cta', {}, 'Start Free Trial')}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>

                        <Button
                            asChild
                            variant="outline"
                            className="h-12 rounded-full border-slate-300 bg-white/80 px-7 text-base text-slate-900 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                            <Link href={secondaryHref}>
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                                </span>
                                {t('frontend.hero.secondary_cta', {}, 'View Demo')}
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                <div className="mt-16 sm:mt-20">
                    <DashboardMockup />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                    className="mt-14 space-y-6"
                >
                    <div className="text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                            {t('frontend.hero.trusted', { count: institutionsCount }, `Trusted by ${institutionsCount}+ institutions`)}
                        </p>
                    </div>

                    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                        <motion.div
                            className="flex w-max gap-4"
                            animate={{ x: ['0%', '-50%'] }}
                            transition={{ duration: 26, ease: 'linear', repeat: Infinity }}
                        >
                            {marqueeItems.map((logo, index) => (
                                <InstitutionLogo key={`${logo}-${index}`} label={logo} />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
