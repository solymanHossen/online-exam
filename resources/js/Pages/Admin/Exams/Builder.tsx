import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookMarked,
    CalendarClock,
    CheckCircle2,
    Clock3,
    DollarSign,
    GraduationCap,
    Sparkles,
    Target,
    Users2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ExamQuestionSelector } from '@/Components/domain/exams/ExamQuestionSelector';
import { ExamWizardStepper, type ExamWizardStep } from '@/Components/domain/exams/ExamWizardStepper';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Checkbox } from '@/Components/ui/Checkbox';
import { Input } from '@/Components/ui/Input';
import { ScrollArea } from '@/Components/ui/ScrollArea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { Textarea } from '@/Components/ui/Textarea';
import { useTranslation } from '@/hooks/useTranslation';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';
import type { Batch, ExamBuilderExam, ExamBuilderQuestion, ExamStatus, StudentListItem } from '@/types/models';

interface ExamBuilderProps {
    batches: Batch[];
    students: StudentListItem[];
    questions: ExamBuilderQuestion[];
    exam?: ExamBuilderExam;
}

interface ExamBuilderFormData {
    title: string;
    description: string;
    duration_minutes: number;
    pass_marks: number;
    price: number | '';
    total_marks: number;
    start_time: string;
    end_time: string;
    auto_submit: boolean;
    negative_enabled: boolean;
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_result_immediately: boolean;
    status: ExamStatus;
    batch_id: string;
    question_ids: string[];
    batch_ids: string[];
    student_ids: string[];
}

type StepErrorMap = Partial<Record<keyof ExamBuilderFormData | 'timeline' | 'questions', string>>;

const STEPS: ExamWizardStep[] = [
    {
        id: 1,
        title: 'Basic info',
        description: 'Title, overview, duration, pass marks, and pricing.',
    },
    {
        id: 2,
        title: 'Settings',
        description: 'Publishing window, auto-submit, and marking behavior.',
    },
    {
        id: 3,
        title: 'Assignment',
        description: 'Target batches, learners, and attach exam questions.',
    },
];

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function toggleId(ids: string[], id: string) {
    return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function moveItem(ids: string[], id: string, direction: 'up' | 'down') {
    const index = ids.indexOf(id);
    if (index === -1) {
        return ids;
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= ids.length) {
        return ids;
    }

    const next = [...ids];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    return next;
}

export default function ExamBuilder({ batches, students, questions, exam }: ExamBuilderProps) {
    const { t } = useTranslation();
    const isEditing = Boolean(exam);

    const [currentStep, setCurrentStep] = useState(1);
    const [clientErrors, setClientErrors] = useState<StepErrorMap>({});
    const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(() => (exam?.batch_id ? [exam.batch_id] : []));
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(exam?.selected_students ?? []);
    const [studentSearch, setStudentSearch] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');
    const [questionSubjectId, setQuestionSubjectId] = useState('');
    const [questionChapterId, setQuestionChapterId] = useState('');

    const { data, setData, post, put, processing, errors, transform } = useForm<ExamBuilderFormData>({
        title: exam?.title ?? '',
        description: exam?.description ?? '',
        duration_minutes: exam?.duration_minutes ?? 60,
        pass_marks: exam?.pass_marks ?? 40,
        price: exam?.price ?? '',
        total_marks: exam?.total_marks ?? 0,
        start_time: exam?.start_time ?? '',
        end_time: exam?.end_time ?? '',
        auto_submit: true,
        negative_enabled: exam?.negative_enabled ?? false,
        shuffle_questions: exam?.shuffle_questions ?? true,
        shuffle_options: exam?.shuffle_options ?? true,
        show_result_immediately: exam?.show_result_immediately ?? false,
        status: exam?.status ?? 'draft',
        batch_id: exam?.batch_id ?? '',
        question_ids: exam?.question_ids ?? [],
        batch_ids: exam?.batch_id ? [exam.batch_id] : [],
        student_ids: exam?.selected_students ?? [],
    });

    useEffect(() => {
        setData('batch_ids', selectedBatchIds);
        setData('batch_id', selectedBatchIds[0] ?? '');
    }, [selectedBatchIds, setData]);

    useEffect(() => {
        setData('student_ids', selectedStudentIds);
    }, [selectedStudentIds, setData]);

    const subjects = useMemo(() => {
        const map = new Map<string, NonNullable<ExamBuilderQuestion['subject']>>();

        questions.forEach((question) => {
            if (question.subject) {
                map.set(question.subject.id, question.subject);
            }
        });

        return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
    }, [questions]);

    const chapters = useMemo(() => {
        const map = new Map<string, NonNullable<ExamBuilderQuestion['chapter']>>();

        questions.forEach((question) => {
            if (question.chapter) {
                map.set(question.chapter.id, question.chapter);
            }
        });

        return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
    }, [questions]);

    const selectedQuestions = useMemo(() => {
        const questionMap = new Map(questions.map((question) => [question.id, question]));

        return data.question_ids
            .map((questionId) => questionMap.get(questionId))
            .filter((question): question is ExamBuilderQuestion => Boolean(question));
    }, [data.question_ids, questions]);

    const totalMarks = useMemo(() => {
        return selectedQuestions.reduce((sum, question) => sum + Number(question.marks ?? 0), 0);
    }, [selectedQuestions]);

    const filteredStudents = useMemo(() => {
        const query = studentSearch.trim().toLowerCase();

        return students.filter((student) => {
            const matchesBatch = selectedBatchIds.length === 0 || selectedBatchIds.includes(student.batch_id);
            if (!matchesBatch) {
                return false;
            }

            if (!query) {
                return true;
            }

            const haystack = `${student.user?.name ?? ''} ${student.user?.email ?? ''} ${student.roll_number} ${student.batch?.name ?? ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [selectedBatchIds, studentSearch, students]);

    const batchStudentCount = useMemo(() => {
        if (selectedBatchIds.length === 0) {
            return students.length;
        }

        return students.filter((student) => selectedBatchIds.includes(student.batch_id)).length;
    }, [selectedBatchIds, students]);

    const validateStep = (step: number) => {
        const nextErrors: StepErrorMap = {};

        if (step === 1) {
            if (!data.title.trim()) {
                nextErrors.title = t('admin.exams.validation.title', {}, 'Exam title is required.');
            }
            if (data.duration_minutes <= 0) {
                nextErrors.duration_minutes = t('admin.exams.validation.duration', {}, 'Duration must be greater than zero.');
            }
            if (data.pass_marks < 0) {
                nextErrors.pass_marks = t('admin.exams.validation.pass_marks', {}, 'Pass marks cannot be negative.');
            }
            if (data.price !== '' && Number(data.price) < 0) {
                nextErrors.price = t('admin.exams.validation.price', {}, 'Price cannot be negative.');
            }
        }

        if (step === 2) {
            if (!data.start_time || !data.end_time) {
                nextErrors.timeline = t('admin.exams.validation.timeline_required', {}, 'Start and end time are required.');
            } else if (new Date(data.end_time).getTime() <= new Date(data.start_time).getTime()) {
                nextErrors.timeline = t('admin.exams.validation.timeline_order', {}, 'End time must be after start time.');
            }
        }

        if (step === 3) {
            if (selectedBatchIds.length === 0) {
                nextErrors.batch_id = t('admin.exams.validation.batch', {}, 'Select at least one batch.');
            }
            if (data.question_ids.length === 0) {
                nextErrors.questions = t('admin.exams.validation.questions', {}, 'Assign at least one question to the exam.');
            }
        }

        setClientErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNextStep = () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setCurrentStep((step) => Math.min(step + 1, STEPS.length));
    };

    const handlePreviousStep = () => {
        setCurrentStep((step) => Math.max(step - 1, 1));
    };

    const handleBatchToggle = (batchId: string) => {
        setSelectedBatchIds((current) => toggleId(current, batchId));
    };

    const handleStudentToggle = (studentId: string) => {
        setSelectedStudentIds((current) => toggleId(current, studentId));
    };

    const handleAddQuestion = (questionId: string) => {
        if (data.question_ids.includes(questionId)) {
            return;
        }

        const nextIds = [...data.question_ids, questionId];
        setData('question_ids', nextIds);
        setData('total_marks', questions.filter((question) => nextIds.includes(question.id)).reduce((sum, question) => sum + Number(question.marks ?? 0), 0));
    };

    const handleRemoveQuestion = (questionId: string) => {
        const nextIds = data.question_ids.filter((id) => id !== questionId);
        setData('question_ids', nextIds);
        setData('total_marks', questions.filter((question) => nextIds.includes(question.id)).reduce((sum, question) => sum + Number(question.marks ?? 0), 0));
    };

    const handleMoveQuestion = (questionId: string, direction: 'up' | 'down') => {
        setData('question_ids', moveItem(data.question_ids, questionId, direction));
    };

    const handleAddAllFiltered = () => {
        const filteredIds = questions
            .filter((question) => {
                if (data.question_ids.includes(question.id)) {
                    return false;
                }

                if (questionSubjectId && question.subject?.id !== questionSubjectId) {
                    return false;
                }

                if (questionChapterId && question.chapter?.id !== questionChapterId) {
                    return false;
                }

                if (!questionSearch.trim()) {
                    return true;
                }

                const haystack = `${stripHtml(question.question_text)} ${question.subject?.name ?? ''} ${question.chapter?.name ?? ''}`.toLowerCase();
                return haystack.includes(questionSearch.trim().toLowerCase());
            })
            .map((question) => question.id);

        const nextIds = [...data.question_ids, ...filteredIds];
        setData('question_ids', nextIds);
        setData('total_marks', questions.filter((question) => nextIds.includes(question.id)).reduce((sum, question) => sum + Number(question.marks ?? 0), 0));
    };

    const handleClearQuestions = () => {
        setData('question_ids', []);
        setData('total_marks', 0);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateStep(3)) {
            setCurrentStep(3);
            return;
        }

        const payload = {
            ...data,
            batch_id: selectedBatchIds[0] ?? '',
            batch_ids: selectedBatchIds,
            student_ids: selectedStudentIds,
            total_marks: totalMarks,
            price: data.price === '' ? null : Number(data.price),
        };

        if (isEditing && exam) {
            transform(() => payload);
            put(route('admin.exams.update', exam.id), {
                preserveScroll: true,
            });
            return;
        }

        transform(() => payload);
        post(route('admin.exams.store'), {
            preserveScroll: true,
        });
    };

    const timelineSummary = data.start_time && data.end_time
        ? `${new Date(data.start_time).toLocaleString()} → ${new Date(data.end_time).toLocaleString()}`
        : t('admin.exams.timeline_placeholder', {}, 'Set the availability window');

    return (
        <AdminLayout header={<span>{isEditing ? t('admin.exams.edit', {}, 'Edit Exam') : t('admin.exams.create', {}, 'Create Exam')}</span>}>
            <Head title={isEditing ? t('admin.exams.edit', {}, 'Edit Exam') : t('admin.exams.create', {}, 'Create Exam')} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            {t('admin.exams.hero.badge', {}, 'Exam Assignment Studio')}
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {isEditing
                                ? t('admin.exams.hero.edit_heading', {}, 'Refine your exam experience')
                                : t('admin.exams.hero.create_heading', {}, 'Build a polished exam assignment flow')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.exams.hero.description', {}, 'Configure exam metadata, timeline behavior, audience targeting, and curate the exact question paper from your question bank.')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="rounded-full px-3 py-1">
                            {data.status}
                        </Badge>
                        <Badge className="rounded-full px-3 py-1">
                            {totalMarks} {t('admin.exams.hero.total_marks', {}, 'total marks')}
                        </Badge>
                    </div>
                </div>

                <ExamWizardStepper steps={STEPS.map((step) => ({
                    ...step,
                    title: t(`admin.exams.steps.${step.id}.title`, {}, step.title),
                    description: t(`admin.exams.steps.${step.id}.description`, {}, step.description),
                }))} currentStep={currentStep} onStepChange={setCurrentStep} />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        {currentStep === 1 ? (
                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.exams.basic_info.title', {}, 'Basic exam information')}</CardTitle>
                                    <CardDescription>{t('admin.exams.basic_info.description', {}, 'Give the exam a clear identity with commercial and grading basics.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.title', {}, 'Title')}</label>
                                            <Input
                                                value={data.title}
                                                onChange={(event) => setData('title', event.target.value)}
                                                placeholder={t('admin.exams.placeholders.title', {}, 'Midterm Physics Assessment')}
                                                className="rounded-xl"
                                            />
                                            {clientErrors.title || errors.title ? <p className="text-sm text-destructive">{clientErrors.title || errors.title}</p> : null}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.description', {}, 'Description')}</label>
                                            <Textarea
                                                value={data.description}
                                                onChange={(event) => setData('description', event.target.value)}
                                                placeholder={t('admin.exams.placeholders.description', {}, 'Add exam instructions, purpose, or candidate notes...')}
                                                className="min-h-[140px] rounded-2xl"
                                            />
                                            {errors.description ? <p className="text-sm text-destructive">{errors.description}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.duration', {}, 'Duration (minutes)')}</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={data.duration_minutes}
                                                onChange={(event) => setData('duration_minutes', Number(event.target.value))}
                                                className="rounded-xl"
                                            />
                                            {clientErrors.duration_minutes || errors.duration_minutes ? <p className="text-sm text-destructive">{clientErrors.duration_minutes || errors.duration_minutes}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.pass_marks', {}, 'Pass marks')}</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.5"
                                                value={data.pass_marks}
                                                onChange={(event) => setData('pass_marks', Number(event.target.value))}
                                                className="rounded-xl"
                                            />
                                            {clientErrors.pass_marks || errors.pass_marks ? <p className="text-sm text-destructive">{clientErrors.pass_marks || errors.pass_marks}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.price', {}, 'Price')}</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={data.price}
                                                onChange={(event) => setData('price', event.target.value === '' ? '' : Number(event.target.value))}
                                                className="rounded-xl"
                                            />
                                            {clientErrors.price || errors.price ? <p className="text-sm text-destructive">{clientErrors.price || errors.price}</p> : null}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.status', {}, 'Status')}</label>
                                            <Select value={data.status} onValueChange={(value: ExamStatus) => setData('status', value)}>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">{t('admin.exams.status.draft', {}, 'Draft')}</SelectItem>
                                                    <SelectItem value="published">{t('admin.exams.status.published', {}, 'Published')}</SelectItem>
                                                    <SelectItem value="completed">{t('admin.exams.status.completed', {}, 'Completed')}</SelectItem>
                                                    <SelectItem value="cancelled">{t('admin.exams.status.cancelled', {}, 'Cancelled')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.status ? <p className="text-sm text-destructive">{errors.status}</p> : null}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {currentStep === 2 ? (
                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.exams.settings.title', {}, 'Exam settings')}</CardTitle>
                                    <CardDescription>{t('admin.exams.settings.description', {}, 'Control the exam window, auto submission, and feedback behavior.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.start_time', {}, 'Start time')}</label>
                                            <Input
                                                type="datetime-local"
                                                value={data.start_time}
                                                onChange={(event) => setData('start_time', event.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">{t('admin.exams.fields.end_time', {}, 'End time')}</label>
                                            <Input
                                                type="datetime-local"
                                                value={data.end_time}
                                                onChange={(event) => setData('end_time', event.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    {clientErrors.timeline || errors.start_time || errors.end_time ? (
                                        <p className="text-sm text-destructive">{clientErrors.timeline || errors.start_time || errors.end_time}</p>
                                    ) : null}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[
                                            {
                                                key: 'auto_submit',
                                                title: t('admin.exams.toggles.auto_submit', {}, 'Auto-submit on timeout'),
                                                description: t('admin.exams.toggles.auto_submit_description', {}, 'Automatically submit the attempt when the duration ends.'),
                                            },
                                            {
                                                key: 'negative_enabled',
                                                title: t('admin.exams.toggles.negative', {}, 'Negative marking'),
                                                description: t('admin.exams.toggles.negative_description', {}, 'Apply negative marks based on the attached question settings.'),
                                            },
                                            {
                                                key: 'shuffle_questions',
                                                title: t('admin.exams.toggles.shuffle_questions', {}, 'Shuffle questions'),
                                                description: t('admin.exams.toggles.shuffle_questions_description', {}, 'Randomize question order for each attempt.'),
                                            },
                                            {
                                                key: 'show_result_immediately',
                                                title: t('admin.exams.toggles.show_results', {}, 'Show result immediately'),
                                                description: t('admin.exams.toggles.show_results_description', {}, 'Reveal the score immediately after submission.'),
                                            },
                                        ].map((item) => {
                                            const checked = data[item.key as keyof ExamBuilderFormData] as boolean;

                                            return (
                                                <div key={item.key} className="rounded-2xl border border-border/60 bg-muted/10 p-4 transition-colors hover:border-primary/20 hover:bg-primary/5">
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={checked}
                                                            onCheckedChange={(value) => setData(item.key as keyof ExamBuilderFormData, Boolean(value) as never)}
                                                            className="mt-1"
                                                        />
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                                            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {currentStep === 3 ? (
                            <div className="space-y-6">
                                <Card className="rounded-3xl border-border/60 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>{t('admin.exams.audience.title', {}, 'Assign to batches and students')}</CardTitle>
                                        <CardDescription>{t('admin.exams.audience.description', {}, 'Select the batches this exam targets, then optionally narrow it down to specific learners.')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="text-sm font-medium text-foreground">{t('admin.exams.audience.batches', {}, 'Batches')}</label>
                                                {clientErrors.batch_id || errors.batch_id ? <p className="text-sm text-destructive">{clientErrors.batch_id || errors.batch_id}</p> : null}
                                            </div>
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {batches.map((batch) => {
                                                    const active = selectedBatchIds.includes(batch.id);

                                                    return (
                                                        <button
                                                            key={batch.id}
                                                            type="button"
                                                            onClick={() => handleBatchToggle(batch.id)}
                                                            className={cn(
                                                                'rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5',
                                                                active
                                                                    ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/10'
                                                                    : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/20',
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-foreground">{batch.name}</p>
                                                                    <p className="mt-1 text-xs text-muted-foreground">{[batch.class_level, batch.year].filter(Boolean).join(' • ') || t('admin.exams.audience.batch_fallback', {}, 'Academic cohort')}</p>
                                                                </div>
                                                                {active ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedBatchIds.length > 1 ? (
                                                <p className="text-xs text-muted-foreground">{t('admin.exams.audience.primary_batch_hint', {}, 'The first selected batch is used as the primary saved batch for the current backend schema.')}</p>
                                            ) : null}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <label className="text-sm font-medium text-foreground">{t('admin.exams.audience.students', {}, 'Students')}</label>
                                                    <p className="text-sm text-muted-foreground">{t('admin.exams.audience.students_hint', {}, 'Optionally target specific students inside the chosen batches.')}</p>
                                                </div>
                                                <div className="w-full sm:w-72">
                                                    <Input
                                                        value={studentSearch}
                                                        onChange={(event) => setStudentSearch(event.target.value)}
                                                        placeholder={t('admin.exams.audience.student_search', {}, 'Search students by name, email, or roll')}
                                                        className="rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <ScrollArea className="h-[320px] rounded-3xl border border-border/60 bg-muted/10 p-3">
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                                                        const active = selectedStudentIds.includes(student.id);

                                                        return (
                                                            <button
                                                                key={student.id}
                                                                type="button"
                                                                onClick={() => handleStudentToggle(student.id)}
                                                                className={cn(
                                                                    'rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5',
                                                                    active
                                                                        ? 'border-primary/30 bg-primary/5 shadow-sm shadow-primary/10'
                                                                        : 'border-border/60 bg-background hover:border-primary/20 hover:bg-muted/20',
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-foreground">{student.user?.name ?? student.roll_number}</p>
                                                                        <p className="mt-1 text-xs text-muted-foreground">{student.user?.email ?? student.roll_number}</p>
                                                                        <p className="mt-2 text-xs text-muted-foreground">{student.batch?.name ?? t('admin.exams.audience.batch_fallback', {}, 'Academic cohort')}</p>
                                                                    </div>
                                                                    <Checkbox checked={active} className="mt-1" />
                                                                </div>
                                                            </button>
                                                        );
                                                    }) : (
                                                        <div className="col-span-full flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/80 px-6 text-center">
                                                            <Users2 className="mb-3 h-8 w-8 text-muted-foreground" />
                                                            <p className="text-sm font-semibold text-foreground">{t('admin.exams.audience.empty_students_title', {}, 'No students found')}</p>
                                                            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{t('admin.exams.audience.empty_students_description', {}, 'Pick a batch or broaden the search to reveal matching students.')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-3xl border-border/60 shadow-sm">
                                    <CardHeader>
                                        <CardTitle>{t('admin.exams.questions.title', {}, 'Exam question selector')}</CardTitle>
                                        <CardDescription>{t('admin.exams.questions.description', {}, 'Move questions into the exam paper and reorder them before saving.')}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {clientErrors.questions ? <p className="text-sm text-destructive">{clientErrors.questions}</p> : null}
                                        <ExamQuestionSelector
                                            questions={questions}
                                            subjects={subjects}
                                            chapters={chapters}
                                            selectedQuestionIds={data.question_ids}
                                            search={questionSearch}
                                            selectedSubjectId={questionSubjectId}
                                            selectedChapterId={questionChapterId}
                                            onSearchChange={setQuestionSearch}
                                            onSubjectChange={(value) => {
                                                setQuestionSubjectId(value);
                                                setQuestionChapterId('');
                                            }}
                                            onChapterChange={setQuestionChapterId}
                                            onAddQuestion={handleAddQuestion}
                                            onRemoveQuestion={handleRemoveQuestion}
                                            onMoveQuestion={handleMoveQuestion}
                                            onAddAllFiltered={handleAddAllFiltered}
                                            onClearAll={handleClearQuestions}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.visit(route('admin.exams.index'))}>
                                {t('common.cancel', {}, 'Cancel')}
                            </Button>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button type="button" variant="outline" className="rounded-xl" onClick={handlePreviousStep} disabled={currentStep === 1}>
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('common.previous', {}, 'Previous')}
                                </Button>
                                {currentStep < STEPS.length ? (
                                    <Button type="button" className="rounded-xl" onClick={handleNextStep}>
                                        {t('common.next', {}, 'Next')}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" className="rounded-xl" disabled={processing}>
                                        {processing
                                            ? t('admin.exams.saving', {}, 'Saving exam...')
                                            : isEditing
                                                ? t('admin.exams.save_changes', {}, 'Save changes')
                                                : t('admin.exams.save_exam', {}, 'Create exam')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 xl:sticky xl:top-24">
                        <Card className="rounded-3xl border-border/60 shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('admin.exams.summary.title', {}, 'Live summary')}</CardTitle>
                                <CardDescription>{t('admin.exams.summary.description', {}, 'A quick snapshot of the exam configuration as you build.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                    {[
                                        {
                                            icon: BookMarked,
                                            label: t('admin.exams.summary.questions', {}, 'Questions'),
                                            value: data.question_ids.length,
                                        },
                                        {
                                            icon: Target,
                                            label: t('admin.exams.summary.total_marks', {}, 'Total marks'),
                                            value: totalMarks,
                                        },
                                        {
                                            icon: Clock3,
                                            label: t('admin.exams.summary.duration', {}, 'Duration'),
                                            value: `${data.duration_minutes} ${t('admin.exams.summary.minutes', {}, 'mins')}`,
                                        },
                                        {
                                            icon: Users2,
                                            label: t('admin.exams.summary.audience', {}, 'Audience'),
                                            value: selectedStudentIds.length > 0 ? selectedStudentIds.length : batchStudentCount,
                                        },
                                    ].map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div key={item.label} className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                                                        <p className="mt-1 text-lg font-semibold text-foreground">{item.value}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                                    <div className="flex items-center gap-3">
                                        <CalendarClock className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.exams.summary.timeline', {}, 'Timeline')}</p>
                                            <p className="mt-1 text-sm font-medium leading-6 text-foreground">{timelineSummary}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.exams.summary.primary_batch', {}, 'Primary batch')}</p>
                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {batches.find((batch) => batch.id === selectedBatchIds[0])?.name ?? t('admin.exams.summary.unassigned', {}, 'Not assigned yet')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.exams.summary.commercial', {}, 'Commercial')}</p>
                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {data.price === '' ? t('admin.exams.summary.free', {}, 'Free exam') : `${Number(data.price).toFixed(2)}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('admin.exams.tips.title', {}, 'UX notes')}</CardTitle>
                                <CardDescription>{t('admin.exams.tips.description', {}, 'A few quality checks before publishing the exam.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                                <p>{t('admin.exams.tips.balance', {}, 'Balance pass marks against the live total marks so the threshold remains realistic.')}</p>
                                <p>{t('admin.exams.tips.window', {}, 'Use a clear start and end window to avoid confusion for time-boxed live exams.')}</p>
                                <p>{t('admin.exams.tips.selector', {}, 'Curate a question flow that starts easy, builds confidence, and then ramps up in difficulty.')}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
