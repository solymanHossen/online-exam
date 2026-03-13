import { Button } from '@/Components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type BillingCycle = 'monthly' | 'yearly';

interface PricingSectionProps {
    className?: string;
}

interface PlanFeature {
    key: string;
    label: string;
    included: boolean;
}

interface PricingPlan {
    key: string;
    name: string;
    description: string;
    monthlyPrice: string;
    yearlyPrice: string;
    ctaLabel: string;
    isPopular?: boolean;
    features: PlanFeature[];
}

interface PricingCardProps {
    plan: PricingPlan;
    billingCycle: BillingCycle;
    yearlySuffix: string;
    monthlySuffix: string;
}

function PricingCard({ plan, billingCycle, yearlySuffix, monthlySuffix }: PricingCardProps) {
    const isPopular = Boolean(plan.isPopular);
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    const suffix = billingCycle === 'yearly' ? yearlySuffix : monthlySuffix;

    if (isPopular) {
        return (
            <motion.article
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.65, ease: 'easeOut', delay: 0.08 }}
                whileHover={{ y: -7 }}
                className="relative h-full rounded-[34px] p-[1px] lg:-translate-y-2"
            >
                <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[34px] bg-[linear-gradient(125deg,rgba(99,102,241,0.95),rgba(168,85,247,0.95),rgba(236,72,153,0.92),rgba(99,102,241,0.95))]"
                    style={{ backgroundSize: '220% 220%' }}
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                <div className="group relative flex h-full flex-col overflow-hidden rounded-[33px] border border-white/40 bg-slate-950 px-6 pb-6 pt-7 text-white shadow-[0_36px_100px_-44px_rgba(79,70,229,0.85)] backdrop-blur-xl sm:px-7 sm:pb-7">
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-indigo-400/25 blur-3xl" />

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
                            <Sparkles className="h-3.5 w-3.5" />
                            Most Popular
                        </div>

                        <h3 className="mt-5 text-2xl font-semibold tracking-tight">{plan.name}</h3>
                        <p className="mt-3 text-sm leading-7 text-indigo-100/85">{plan.description}</p>

                        <div className="mt-6 flex items-end gap-2">
                            <p className="text-5xl font-black tracking-tight">{price}</p>
                            <p className="pb-1 text-sm text-indigo-100/80">{suffix}</p>
                        </div>
                    </div>

                    <ul className="relative mt-7 space-y-3">
                        {plan.features.map((feature) => (
                            <li key={`${plan.key}-${feature.key}`} className="flex items-start gap-3 text-sm leading-6">
                                {feature.included ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                                ) : (
                                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                                )}
                                <span className={feature.included ? 'text-slate-100' : 'text-slate-400'}>{feature.label}</span>
                            </li>
                        ))}
                    </ul>

                    <Button className="relative mt-8 h-12 w-full rounded-2xl bg-white text-slate-900 hover:bg-slate-100">
                        {plan.ctaLabel}
                    </Button>
                </div>
            </motion.article>
        );
    }

    return (
        <motion.article
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -6 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/85 px-6 pb-6 pt-7 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-xl transition duration-300 hover:border-indigo-300/80 hover:shadow-[0_32px_90px_-42px_rgba(99,102,241,0.42)] dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40 sm:px-7 sm:pb-7"
        >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                <div className="absolute right-2 top-3 h-28 w-28 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="relative">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{plan.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.description}</p>

                <div className="mt-6 flex items-end gap-2">
                    <p className="text-5xl font-black tracking-tight text-slate-950 dark:text-white">{price}</p>
                    <p className="pb-1 text-sm text-slate-500 dark:text-slate-400">{suffix}</p>
                </div>
            </div>

            <ul className="relative mt-7 space-y-3">
                {plan.features.map((feature) => (
                    <li key={`${plan.key}-${feature.key}`} className="flex items-start gap-3 text-sm leading-6">
                        {feature.included ? (
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        ) : (
                            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                        )}
                        <span className={feature.included ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>{feature.label}</span>
                    </li>
                ))}
            </ul>

            <Button
                variant="outline"
                className="relative mt-8 h-12 w-full rounded-2xl border-slate-300 bg-white/85 text-slate-900 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
                {plan.ctaLabel}
            </Button>
        </motion.article>
    );
}

export function PricingSection({ className }: PricingSectionProps) {
    const { t } = useTranslation();
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

    const plans = useMemo<PricingPlan[]>(
        () => [
            {
                key: 'starter',
                name: t('frontend.pricing.starter_name', {}, 'Starter'),
                description: t('frontend.pricing.starter_description', {}, 'Perfect for small coaching teams launching secure exams with confidence.'),
                monthlyPrice: '$19',
                yearlyPrice: '$15',
                ctaLabel: t('frontend.pricing.starter_cta', {}, 'Start Starter'),
                features: [
                    { key: 'users_200', label: t('frontend.pricing.feature_users_200', {}, 'Up to 200 active students'), included: true },
                    { key: 'exam_builder', label: t('frontend.pricing.feature_exam_builder', {}, 'Visual exam builder'), included: true },
                    { key: 'results', label: t('frontend.pricing.feature_results', {}, 'Instant result publishing'), included: true },
                    { key: 'live_proctoring', label: t('frontend.pricing.feature_live_proctoring', {}, 'Live proctoring tools'), included: false },
                    { key: 'white_label', label: t('frontend.pricing.feature_white_label', {}, 'White-label experience'), included: false },
                ],
            },
            {
                key: 'professional',
                name: t('frontend.pricing.professional_name', {}, 'Professional'),
                description: t('frontend.pricing.professional_description', {}, 'Built for fast-growing institutions needing stronger control and analytics depth.'),
                monthlyPrice: '$49',
                yearlyPrice: '$39',
                ctaLabel: t('frontend.pricing.professional_cta', {}, 'Choose Professional'),
                isPopular: true,
                features: [
                    { key: 'users_2000', label: t('frontend.pricing.feature_users_2000', {}, 'Up to 2,000 active students'), included: true },
                    { key: 'advanced_analytics', label: t('frontend.pricing.feature_advanced_analytics', {}, 'Advanced analytics dashboard'), included: true },
                    { key: 'live_proctoring', label: t('frontend.pricing.feature_live_proctoring', {}, 'Live proctoring tools'), included: true },
                    { key: 'question_banks', label: t('frontend.pricing.feature_question_banks', {}, 'Custom question banks'), included: true },
                    { key: 'priority_support', label: t('frontend.pricing.feature_priority_support', {}, 'Priority support'), included: true },
                ],
            },
            {
                key: 'enterprise',
                name: t('frontend.pricing.enterprise_name', {}, 'Enterprise'),
                description: t('frontend.pricing.enterprise_description', {}, 'For universities and certification bodies with strict governance requirements.'),
                monthlyPrice: '$99',
                yearlyPrice: '$79',
                ctaLabel: t('frontend.pricing.enterprise_cta', {}, 'Contact Sales'),
                features: [
                    { key: 'users_unlimited', label: t('frontend.pricing.feature_users_unlimited', {}, 'Unlimited active students'), included: true },
                    { key: 'sso', label: t('frontend.pricing.feature_sso', {}, 'SSO & access governance'), included: true },
                    { key: 'white_label', label: t('frontend.pricing.feature_white_label', {}, 'White-label experience'), included: true },
                    { key: 'sla', label: t('frontend.pricing.feature_sla', {}, 'Dedicated SLA support'), included: true },
                    { key: 'onboarding', label: t('frontend.pricing.feature_onboarding', {}, 'Enterprise onboarding specialist'), included: true },
                ],
            },
        ],
        [t],
    );

    return (
        <section id="pricing" className={cn('relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>
            <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_58%)]" />
            <div className="absolute left-1/2 top-16 -z-10 h-60 w-60 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

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
                        {t('frontend.pricing.badge', {}, 'Flexible plans')}
                    </div>

                    <h2 className="mt-6 text-balance text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                        {t('frontend.pricing.heading', {}, 'Pricing that scales with your exam growth')}
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                        {t(
                            'frontend.pricing.subheading',
                            {},
                            'Choose monthly flexibility or save more annually while delivering a premium exam experience for every learner.',
                        )}
                    </p>
                </motion.div>

                <div className="mt-10 flex justify-center">
                    <div className="relative inline-flex rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                        <motion.div
                            aria-hidden="true"
                            className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 shadow-[0_16px_36px_-18px_rgba(79,70,229,0.8)]"
                            animate={{ x: billingCycle === 'monthly' ? 0 : '100%' }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                        />

                        <button
                            type="button"
                            onClick={() => setBillingCycle('monthly')}
                            className={cn(
                                'relative z-10 min-w-36 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors',
                                billingCycle === 'monthly' ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                            )}
                        >
                            {t('frontend.pricing.monthly', {}, 'Monthly')}
                        </button>

                        <button
                            type="button"
                            onClick={() => setBillingCycle('yearly')}
                            className={cn(
                                'relative z-10 inline-flex min-w-36 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors',
                                billingCycle === 'yearly' ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                            )}
                        >
                            <span>{t('frontend.pricing.yearly', {}, 'Yearly')}</span>
                            <span className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]',
                                billingCycle === 'yearly'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                            )}>
                                {t('frontend.pricing.save', {}, 'Save 20%')}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
                    {plans.map((plan) => (
                        <PricingCard
                            key={plan.key}
                            plan={plan}
                            billingCycle={billingCycle}
                            monthlySuffix={t('frontend.pricing.monthly_suffix', {}, '/month')}
                            yearlySuffix={t('frontend.pricing.yearly_suffix', {}, '/month, billed yearly')}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
