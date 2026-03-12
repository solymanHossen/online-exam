import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowUpRight,
    BarChart3,
    BrainCircuit,
    FileStack,
    Shield,
    Sparkles,
    TimerReset,
} from 'lucide-react';

interface FeaturesSectionProps {
    className?: string;
}

interface FeatureCard {
    title: string;
    description: string;
    icon: LucideIcon;
    accentClassName: string;
    iconClassName: string;
    stats?: Array<{
        label: string;
        value: string;
    }>;
    bullets?: string[];
    eyebrow?: string;
    highlightedValue?: string;
}

interface FeatureCardItemProps {
    card: FeatureCard;
    className?: string;
    delay?: number;
}

function FeatureCardItem({ card, className, delay = 0 }: FeatureCardItemProps) {
    const Icon = card.icon;

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
            whileHover={{ y: -6 }}
            className={cn(
                'group relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_70px_-38px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 hover:border-indigo-300/80 hover:shadow-[0_30px_90px_-38px_rgba(99,102,241,0.45)] dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                    <div className={cn('inline-flex rounded-2xl bg-gradient-to-br p-3 shadow-lg shadow-indigo-500/10', card.accentClassName)}>
                        <Icon className={cn('h-5 w-5', card.iconClassName)} />
                    </div>

                    {card.highlightedValue ? (
                        <div className="rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            {card.highlightedValue}
                        </div>
                    ) : null}
                </div>

                {card.eyebrow ? (
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-indigo-500">
                        {card.eyebrow}
                    </p>
                ) : null}

                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {card.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {card.description}
                </p>

                {card.stats && card.stats.length > 0 ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        {card.stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
                            >
                                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                ) : null}

                {card.bullets && card.bullets.length > 0 ? (
                    <ul className="mt-6 space-y-3">
                        {card.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </span>
                                <span className="leading-6">{bullet}</span>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </motion.article>
    );
}

export function FeaturesSection({ className }: FeaturesSectionProps) {
    const { t } = useTranslation();

    const analyticsCard: FeatureCard = {
        title: t('frontend.features.analytics_title', {}, 'Advanced analytics dashboard'),
        description: t(
            'frontend.features.analytics_description',
            {},
            'Track student performance, detect weak topics, and monitor exam integrity with executive-grade reporting designed for schools, academies, and enterprise certification teams.',
        ),
        icon: BarChart3,
        accentClassName: 'from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20',
        iconClassName: 'text-indigo-600 dark:text-indigo-300',
        eyebrow: t('frontend.features.analytics_eyebrow', {}, 'Insight engine'),
        highlightedValue: t('frontend.features.analytics_highlight', {}, 'Live trends'),
        stats: [
            {
                label: t('frontend.features.analytics_stat_one', {}, 'Avg. score lift'),
                value: '+24%',
            },
            {
                label: t('frontend.features.analytics_stat_two', {}, 'Cheating alerts'),
                value: '08',
            },
            {
                label: t('frontend.features.analytics_stat_three', {}, 'Realtime sync'),
                value: '1.2s',
            },
        ],
        bullets: [
            t('frontend.features.analytics_bullet_one', {}, 'Leaderboard, subject mastery, and hardest-question visibility in one workspace.'),
            t('frontend.features.analytics_bullet_two', {}, 'Actionable trend cards help administrators respond faster during high-stakes sessions.'),
        ],
    };

    const featureCards: FeatureCard[] = [
        {
            title: t('frontend.features.proctoring_title', {}, 'Live proctoring'),
            description: t(
                'frontend.features.proctoring_description',
                {},
                'Protect every assessment with suspicious activity monitoring, session awareness, and transparent exam-room controls.',
            ),
            icon: Shield,
            accentClassName: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/20',
            iconClassName: 'text-emerald-600 dark:text-emerald-300',
            highlightedValue: t('frontend.features.proctoring_highlight', {}, 'Secure by design'),
            bullets: [
                t('frontend.features.proctoring_bullet_one', {}, 'Visibility into focus loss, flags, and exam-state anomalies.'),
                t('frontend.features.proctoring_bullet_two', {}, 'Built for confident invigilation without overwhelming the candidate experience.'),
            ],
        },
        {
            title: t('frontend.features.results_title', {}, 'Instant results'),
            description: t(
                'frontend.features.results_description',
                {},
                'Publish outcomes fast with automated evaluation flows, ranking views, and student-ready summaries right after submission.',
            ),
            icon: TimerReset,
            accentClassName: 'from-amber-500/20 via-orange-500/15 to-rose-500/20',
            iconClassName: 'text-amber-600 dark:text-amber-300',
            highlightedValue: t('frontend.features.results_highlight', {}, 'No manual delay'),
            bullets: [
                t('frontend.features.results_bullet_one', {}, 'Auto-calculated scores and rank positions reduce administrative workload.'),
                t('frontend.features.results_bullet_two', {}, 'Give learners instant clarity on performance and next steps.'),
            ],
        },
        {
            title: t('frontend.features.banks_title', {}, 'Custom question banks'),
            description: t(
                'frontend.features.banks_description',
                {},
                'Organize reusable question libraries by subject, chapter, and difficulty so every exam feels tailored and scalable.',
            ),
            icon: FileStack,
            accentClassName: 'from-sky-500/20 via-blue-500/15 to-indigo-500/20',
            iconClassName: 'text-sky-600 dark:text-sky-300',
            highlightedValue: t('frontend.features.banks_highlight', {}, 'Built to scale'),
            bullets: [
                t('frontend.features.banks_bullet_one', {}, 'Create rich pools for practice tests, mocks, admissions, and certification rounds.'),
                t('frontend.features.banks_bullet_two', {}, 'Maintain consistency while still personalizing each exam setup.'),
            ],
        },
        {
            title: t('frontend.features.automation_title', {}, 'Smart automation'),
            description: t(
                'frontend.features.automation_description',
                {},
                'Reduce repetitive admin work with automated scheduling, payment-aware access, and reliable exam lifecycle controls.',
            ),
            icon: BrainCircuit,
            accentClassName: 'from-violet-500/20 via-fuchsia-500/15 to-pink-500/20',
            iconClassName: 'text-violet-600 dark:text-violet-300',
            highlightedValue: t('frontend.features.automation_highlight', {}, 'Ops friendly'),
            bullets: [
                t('frontend.features.automation_bullet_one', {}, 'Connect enrollment, payments, and assignment workflows into one premium system.'),
                t('frontend.features.automation_bullet_two', {}, 'Keep teams aligned with predictable, repeatable delivery from setup to result.'),
            ],
        },
    ];

    return (
        <section className={cn('relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>
            <div className="absolute inset-x-0 top-10 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_58%)]" />
            <div className="absolute right-0 top-24 -z-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-500/20 dark:bg-white/5 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        {t('frontend.features.badge', {}, 'Platform capabilities')}
                    </div>

                    <h2 className="mt-6 text-balance text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                        {t('frontend.features.heading', {}, 'Everything you need to run secure exams')}
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                        {t(
                            'frontend.features.subheading',
                            {},
                            'A premium examination stack built for performance, integrity, and beautiful operations at every stage of the assessment journey.',
                        )}
                    </p>
                </motion.div>

                <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:auto-rows-fr">
                    <FeatureCardItem card={analyticsCard} className="lg:col-span-2 lg:min-h-[420px]" delay={0.05} />

                    {featureCards.map((card, index) => (
                        <FeatureCardItem
                            key={card.title}
                            card={card}
                            className={cn(index === 3 ? 'lg:col-span-2' : '')}
                            delay={0.1 + index * 0.07}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
