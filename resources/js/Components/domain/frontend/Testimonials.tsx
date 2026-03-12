import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Quote, Sparkles, Star } from 'lucide-react';

interface TestimonialsProps {
    className?: string;
}

interface TestimonialItem {
    quote: string;
    name: string;
    role: string;
    initials: string;
    avatarClassName: string;
}

interface TestimonialCardProps {
    item: TestimonialItem;
    index: number;
}

function TestimonialCard({ item, index }: TestimonialCardProps) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.06 * index, ease: 'easeOut' }}
            whileHover={{ y: -5 }}
            className="group relative mb-5 break-inside-avoid overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_22px_70px_-40px_rgba(15,23,42,0.38)] backdrop-blur-xl transition duration-300 hover:border-indigo-300/80 hover:shadow-[0_30px_90px_-42px_rgba(99,102,241,0.45)] dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40"
        >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                <div className="absolute left-4 top-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <Quote className="pointer-events-none absolute right-5 top-5 h-16 w-16 text-slate-200/80 dark:text-white/5" />

            <div className="relative">
                <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className="h-4 w-4 fill-current" />
                    ))}
                </div>

                <blockquote className="mt-5 text-base leading-8 text-slate-700 dark:text-slate-200">
                    “{item.quote}”
                </blockquote>

                <div className="mt-6 flex items-center gap-4">
                    <div
                        className={cn(
                            'inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-semibold text-white shadow-lg shadow-indigo-500/20',
                            item.avatarClassName,
                        )}
                        aria-hidden="true"
                    >
                        {item.initials}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

export function Testimonials({ className }: TestimonialsProps) {
    const { t } = useTranslation();

    const testimonials: TestimonialItem[] = [
        {
            quote: t(
                'frontend.testimonials.quote_one',
                {},
                'We replaced scattered exam workflows with one polished platform. The analytics alone helped our academic team react faster and improve student outcomes.',
            ),
            name: t('frontend.testimonials.name_one', {}, 'Dr. Ayesha Rahman'),
            role: t('frontend.testimonials.role_one', {}, 'Director of Assessment, Northbridge Academy'),
            initials: 'AR',
            avatarClassName: 'from-indigo-600 to-violet-600',
        },
        {
            quote: t(
                'frontend.testimonials.quote_two',
                {},
                'The exam experience feels premium and trustworthy. Our learners receive instant clarity, while our staff spends far less time on manual result handling.',
            ),
            name: t('frontend.testimonials.name_two', {}, 'Michael Tan'),
            role: t('frontend.testimonials.role_two', {}, 'Operations Lead, Elevate Learning Group'),
            initials: 'MT',
            avatarClassName: 'from-emerald-500 to-cyan-500',
        },
        {
            quote: t(
                'frontend.testimonials.quote_three',
                {},
                'From question banks to secure delivery, every detail feels built for scale. It gave us the confidence to move high-stakes exams online.',
            ),
            name: t('frontend.testimonials.name_three', {}, 'Sara Velasquez'),
            role: t('frontend.testimonials.role_three', {}, 'Head of Digital Programs, Vertex Institute'),
            initials: 'SV',
            avatarClassName: 'from-amber-500 to-rose-500',
        },
        {
            quote: t(
                'frontend.testimonials.quote_four',
                {},
                'The reporting views make stakeholder conversations easier. We can show performance trends, rank insights, and integrity signals without extra spreadsheets.',
            ),
            name: t('frontend.testimonials.name_four', {}, 'Omar Faruk'),
            role: t('frontend.testimonials.role_four', {}, 'Examination Controller, Lumen College'),
            initials: 'OF',
            avatarClassName: 'from-fuchsia-500 to-pink-500',
        },
        {
            quote: t(
                'frontend.testimonials.quote_five',
                {},
                'It looks world-class for students and stays practical for administrators. That combination is rare, and it is exactly what our team needed.',
            ),
            name: t('frontend.testimonials.name_five', {}, 'Nadia Ibrahim'),
            role: t('frontend.testimonials.role_five', {}, 'Founder, Scholara Prep'),
            initials: 'NI',
            avatarClassName: 'from-sky-500 to-indigo-500',
        },
        {
            quote: t(
                'frontend.testimonials.quote_six',
                {},
                'The platform gave us a cleaner launch process, stronger exam confidence, and a far better student perception of our digital assessment experience.',
            ),
            name: t('frontend.testimonials.name_six', {}, 'James Okoro'),
            role: t('frontend.testimonials.role_six', {}, 'Program Manager, Aptis Certification'),
            initials: 'JO',
            avatarClassName: 'from-teal-500 to-emerald-500',
        },
    ];

    return (
        <section className={cn('relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24', className)}>
            <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_58%)]" />
            <div className="absolute left-10 top-20 -z-10 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />

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
                        {t('frontend.testimonials.badge', {}, 'Trusted by modern institutions')}
                    </div>

                    <h2 className="mt-6 text-balance text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                        {t('frontend.testimonials.heading', {}, 'Trusted by teams that take exam integrity seriously')}
                    </h2>

                    <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                        {t(
                            'frontend.testimonials.subheading',
                            {},
                            'Readable, credible, and polished feedback from institutions that rely on secure online assessments every day.',
                        )}
                    </p>
                </motion.div>

                <div className="mt-14 columns-1 gap-5 md:columns-2 xl:columns-3">
                    {testimonials.map((item, index) => (
                        <TestimonialCard key={`${item.name}-${index}`} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
