import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, FilePlus2, Sparkles, UsersRound } from 'lucide-react';

interface HowItWorksProps {
    className?: string;
}

interface StepItem {
    step: string;
    title: string;
    description: string;
    icon: LucideIcon;
    accentClassName: string;
    iconClassName: string;
}

interface StepCardProps {
    item: StepItem;
    index: number;
}

function StepCard({ item, index }: StepCardProps) {
    const Icon = item.icon;

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.08 * index, ease: 'easeOut' }}
            whileHover={{ y: -4 }}
            className="group relative z-10 rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_25px_70px_-42px_rgba(15,23,42,0.4)] backdrop-blur-xl transition duration-300 hover:border-indigo-300/80 hover:shadow-[0_30px_90px_-45px_rgba(99,102,241,0.45)] dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40"
        >
            <div className="pointer-events-none absolute inset-0 rounded-[30px] opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                <div className="absolute right-2 top-2 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="relative flex items-start gap-4">
                <div className={cn('inline-flex rounded-2xl bg-gradient-to-br p-3 shadow-lg shadow-indigo-500/10', item.accentClassName)}>
                    <Icon className={cn('h-5 w-5', item.iconClassName)} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                        {item.step}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                        {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {item.description}
                    </p>
                </div>
            </div>
        </motion.article>
    );
}

export function HowItWorks({ className }: HowItWorksProps) {
    const { t } = useTranslation();

    const steps: StepItem[] = [
        {
            step: t('frontend.how_it_works.step_one_label', {}, 'Step 01'),
            title: t('frontend.how_it_works.step_one_title', {}, 'Create exam'),
            description: t(
                'frontend.how_it_works.step_one_description',
                {},
                'Design polished exams with flexible scheduling, question banks, instructions, and integrity rules tailored to your institution.',
            ),
            icon: FilePlus2,
            accentClassName: 'from-indigo-500/20 via-violet-500/15 to-fuchsia-500/20',
            iconClassName: 'text-indigo-600 dark:text-indigo-300',
        },
        {
            step: t('frontend.how_it_works.step_two_label', {}, 'Step 02'),
            title: t('frontend.how_it_works.step_two_title', {}, 'Assign students'),
            description: t(
                'frontend.how_it_works.step_two_description',
                {},
                'Invite the right learners, connect batches, and open secure access so every participant enters the correct assessment flow.',
            ),
            icon: UsersRound,
            accentClassName: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/20',
            iconClassName: 'text-emerald-600 dark:text-emerald-300',
        },
        {
            step: t('frontend.how_it_works.step_three_label', {}, 'Step 03'),
            title: t('frontend.how_it_works.step_three_title', {}, 'Get analytics'),
            description: t(
                'frontend.how_it_works.step_three_description',
                {},
                'Monitor live progress, review rankings, and uncover subject-level insights through beautiful dashboards built for decisive action.',
            ),
            icon: BarChart3,
            accentClassName: 'from-amber-500/20 via-orange-500/15 to-rose-500/20',
            iconClassName: 'text-amber-600 dark:text-amber-300',
        },
    ];

    return (
        <section className={cn('relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>
            <div className="absolute left-1/2 top-16 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 -z-10 h-[360px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_58%)]" />

            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur dark:border-indigo-500/20 dark:bg-white/5 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        {t('frontend.how_it_works.badge', {}, 'Simple launch flow')}
                    </div>

                    <h2 className="mt-6 text-balance text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                        {t('frontend.how_it_works.heading', {}, 'Create Exam → Assign Students → Get Analytics')}
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                        {t(
                            'frontend.how_it_works.subheading',
                            {},
                            'A frictionless assessment journey that helps your team launch secure exams quickly while staying in complete control.',
                        )}
                    </p>
                </motion.div>

                <div className="relative mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="pointer-events-none absolute left-1/2 top-14 hidden h-px w-[calc(100%-12rem)] -translate-x-1/2 lg:block">
                        <div className="h-full w-full border-t border-dashed border-indigo-300/80 dark:border-indigo-400/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent blur-sm" />
                    </div>

                    {steps.map((item, index) => (
                        <StepCard key={item.step} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
