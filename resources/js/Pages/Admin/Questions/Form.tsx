import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import {
    CheckCircle2,
    Circle,
    GripVertical,
    ImagePlus,
    Layers3,
    Plus,
    Save,
    ShieldCheck,
    Sparkles,
    Target,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { MaterialDropzone, type MaterialUploadItem } from '@/Components/domain/questions/MaterialDropzone';
import { QuestionTypeBadgePicker } from '@/Components/domain/questions/QuestionTypeBadgePicker';
import { RichTextEditor } from '@/Components/domain/questions/RichTextEditor';
import { Button } from '@/Components/ui/Button';
import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/Form';
import { Input } from '@/Components/ui/Input';
import { Checkbox } from '@/Components/ui/Checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { Textarea } from '@/Components/ui/Textarea';
import { cn } from '@/lib/utils';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Question, QuestionDifficulty, QuestionType } from '@/types/models';

const fileSchema = z.custom<File | undefined>(
    (value) => value === undefined || value instanceof File,
    'Invalid file input',
);

interface SubjectOption {
    id: string;
    name: string;
    code?: string;
    chapters?: ChapterOption[];
}

interface ChapterOption {
    id: string;
    name: string;
    subject_id: string;
}

interface QuestionOptionInput {
    id?: string;
    option_text: string;
    is_correct: boolean;
    option_image?: string | null;
    option_image_path?: string | null;
}

interface QuestionBuilderProps {
    subjects: SubjectOption[];
    chapters: ChapterOption[];
    question?: Question;
}

interface QuestionFormOption {
    id?: string;
    option_text: string;
    is_correct: boolean;
    option_image?: File | undefined;
    existing_option_image?: string | null;
}

const QUESTION_TYPE_SINGLE_SELECT: Record<QuestionType, boolean> = {
    mcq: true,
    true_false: true,
    fill_blank: false,
};

const DIFFICULTY_OPTIONS: Array<{ value: QuestionDifficulty; label: string; tone: 'default' | 'secondary' | 'destructive' | 'outline' }> = [
    { value: 'easy', label: 'Easy', tone: 'secondary' },
    { value: 'medium', label: 'Medium', tone: 'outline' },
    { value: 'hard', label: 'Hard', tone: 'destructive' },
];

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function createEmptyOption(): QuestionFormOption {
    return {
        option_text: '',
        is_correct: false,
        option_image: undefined,
        existing_option_image: null,
    };
}

function createTrueFalseOptions(correctIndex = 0, trueLabel = 'True', falseLabel = 'False'): QuestionFormOption[] {
    return [
        {
            option_text: trueLabel,
            is_correct: correctIndex === 0,
            option_image: undefined,
            existing_option_image: null,
        },
        {
            option_text: falseLabel,
            is_correct: correctIndex === 1,
            option_image: undefined,
            existing_option_image: null,
        },
    ];
}

const questionSchema = z.object({
    subject_id: z.string().min(1, 'Subject is required'),
    chapter_id: z.string().min(1, 'Chapter is required'),
    question_type: z.enum(['mcq', 'true_false', 'fill_blank']),
    question_text: z.string().refine((value) => stripHtml(value).length >= 5, {
        message: 'Question text must be at least 5 characters',
    }),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    marks: z.coerce.number().min(0),
    negative_marks: z.coerce.number().min(0),
    question_image: fileSchema.optional(),
    existing_question_image: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    options: z
        .array(
            z.object({
                id: z.string().optional(),
                option_text: z.string().min(1, 'Option text is required'),
                is_correct: z.boolean().default(false),
                option_image: fileSchema.optional(),
                existing_option_image: z.string().nullable().optional(),
            }),
        )
        .min(2, 'At least two options are required')
        .refine((options) => options.some((option) => option.is_correct), {
            message: 'Mark at least one correct answer',
        }),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function QuestionBuilder({ subjects, chapters, question }: QuestionBuilderProps) {
    const { t } = useTranslation();
    const isEditing = !!question;
    const trueOptionLabel = t('admin.questions.true_option', {}, 'True');
    const falseOptionLabel = t('admin.questions.false_option', {}, 'False');

    const defaultOptions = useMemo<QuestionFormOption[]>(() => {
        if (question?.options && question.options.length > 0) {
            return question.options.map((option) => ({
                id: option.id,
                option_text: option.option_text ?? '',
                is_correct: Boolean(option.is_correct),
                option_image: undefined,
                existing_option_image: option.option_image_path ?? option.option_image ?? null,
            }));
        }

        if (question?.question_type === 'true_false') {
            return createTrueFalseOptions(0, trueOptionLabel, falseOptionLabel);
        }

        return [createEmptyOption(), createEmptyOption()];
    }, [falseOptionLabel, question, trueOptionLabel]);

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema) as Resolver<QuestionFormValues>,
        defaultValues: {
            subject_id: question?.subject_id || '',
            chapter_id: question?.chapter_id || '',
            question_type: question?.question_type || 'mcq',
            question_text: question?.question_text || '',
            explanation: question?.explanation || undefined,
            difficulty: question?.difficulty || 'medium',
            marks: question?.marks ? Number(question.marks) : 1,
            negative_marks: question?.negative_marks ? Number(question.negative_marks) : 0,
            question_image: undefined,
            existing_question_image: question?.question_image_path ?? question?.question_image ?? null,
            is_active: question?.is_active ?? true,
            options: defaultOptions,
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        name: 'options',
        control: form.control,
    });

    const questionType = useWatch({ control: form.control, name: 'question_type' });
    const selectedSubjectId = useWatch({ control: form.control, name: 'subject_id' });
    const watchedOptions = useWatch({ control: form.control, name: 'options' }) ?? [];

    const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(question?.question_image ?? null);
    const [optionImagePreviews, setOptionImagePreviews] = useState<Record<string, string | null>>(() => {
        return defaultOptions.reduce<Record<string, string | null>>((accumulator, option, index) => {
            if (question?.options?.[index]?.option_image) {
                accumulator[`initial-${index}`] = question.options[index]?.option_image ?? null;
            }

            return accumulator;
        }, {});
    });
    const [materials, setMaterials] = useState<MaterialUploadItem[]>([]);
    const [submissionProgress, setSubmissionProgress] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const materialTimers = useRef<Record<string, number>>({});

    const singleSelectAnswers = QUESTION_TYPE_SINGLE_SELECT[questionType];

    const filteredChapters = useMemo(() => {
        if (!selectedSubjectId) {
            return chapters;
        }

        return chapters.filter((chapter) => chapter.subject_id === selectedSubjectId);
    }, [chapters, selectedSubjectId]);

    useEffect(() => {
        if (!selectedSubjectId) {
            return;
        }

        const currentChapterId = form.getValues('chapter_id');
        const chapterStillAvailable = filteredChapters.some((chapter) => chapter.id === currentChapterId);

        if (!chapterStillAvailable) {
            form.setValue('chapter_id', '');
        }
    }, [filteredChapters, form, selectedSubjectId]);

    useEffect(() => {
        if (questionType === 'true_false') {
            const correctIndex = Math.max(
                watchedOptions.findIndex((option) => option?.is_correct),
                0,
            );

            replace(createTrueFalseOptions(correctIndex === -1 ? 0 : correctIndex, trueOptionLabel, falseOptionLabel));
            return;
        }

        if (watchedOptions.length < 2) {
            replace([createEmptyOption(), createEmptyOption()]);
            return;
        }

        if (singleSelectAnswers) {
            const correctIndexes = watchedOptions.reduce<number[]>((accumulator, option, index) => {
                if (option?.is_correct) {
                    accumulator.push(index);
                }

                return accumulator;
            }, []);

            if (correctIndexes.length > 1) {
                watchedOptions.forEach((option, index) => {
                    form.setValue(`options.${index}.is_correct`, index === correctIndexes[0], {
                        shouldDirty: true,
                        shouldValidate: true,
                    });
                });
            }
        }
    }, [falseOptionLabel, form, questionType, replace, singleSelectAnswers, trueOptionLabel, watchedOptions]);

    useEffect(() => {
        return () => {
            Object.values(materialTimers.current).forEach((timer) => window.clearInterval(timer));
            materials.forEach((item) => {
                if (item.previewUrl) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, [materials]);

    const setQuestionImageFile = (file?: File) => {
        if (!file) {
            form.setValue('question_image', undefined);
            form.setValue('existing_question_image', null, { shouldDirty: true });
            setQuestionImagePreview(null);
            return;
        }

        form.setValue('question_image', file, { shouldDirty: true, shouldValidate: true });
        form.setValue('existing_question_image', null, { shouldDirty: true });
        setQuestionImagePreview(URL.createObjectURL(file));
    };

    const handleOptionImageChange = (index: number, file?: File) => {
        const fieldId = fields[index]?.id ?? `option-${index}`;

        if (!file) {
            form.setValue(`options.${index}.option_image`, undefined, { shouldDirty: true });
            form.setValue(`options.${index}.existing_option_image`, null, { shouldDirty: true });
            setOptionImagePreviews((current) => ({ ...current, [fieldId]: null }));
            return;
        }

        form.setValue(`options.${index}.option_image`, file, { shouldDirty: true, shouldValidate: true });
        form.setValue(`options.${index}.existing_option_image`, null, { shouldDirty: true });
        setOptionImagePreviews((current) => ({ ...current, [fieldId]: URL.createObjectURL(file) }));
    };

    const handleToggleCorrect = (index: number) => {
        if (singleSelectAnswers) {
            watchedOptions.forEach((_, optionIndex) => {
                form.setValue(`options.${optionIndex}.is_correct`, optionIndex === index, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            });

            return;
        }

        form.setValue(`options.${index}.is_correct`, !watchedOptions[index]?.is_correct, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const addMaterialFiles = (acceptedFiles: File[]) => {
        const nextItems: MaterialUploadItem[] = acceptedFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            title: file.name,
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
            progress: 8,
            mimeType: file.type || 'application/octet-stream',
        }));

        setMaterials((current) => [...current, ...nextItems]);

        nextItems.forEach((item) => {
            materialTimers.current[item.id] = window.setInterval(() => {
                setMaterials((current) =>
                    current.map((material) => {
                        if (material.id !== item.id) {
                            return material;
                        }

                        const nextProgress = material.progress >= 100
                            ? 100
                            : Math.min(material.progress + Math.round(Math.random() * 18), 100);

                        if (nextProgress >= 100 && materialTimers.current[item.id]) {
                            window.clearInterval(materialTimers.current[item.id]);
                            delete materialTimers.current[item.id];
                        }

                        return {
                            ...material,
                            progress: nextProgress,
                        };
                    }),
                );
            }, 160);
        });
    };

    const removeMaterialFile = (id: string) => {
        setMaterials((current) => {
            const item = current.find((material) => material.id === id);
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl);
            }

            if (materialTimers.current[id]) {
                window.clearInterval(materialTimers.current[id]);
                delete materialTimers.current[id];
            }

            return current.filter((material) => material.id !== id);
        });
    };

    const onSubmit = (data: QuestionFormValues) => {
        setIsSubmitting(true);
        setSubmissionProgress(0);
        const formData = new FormData();

        formData.append('subject_id', data.subject_id);
        formData.append('chapter_id', data.chapter_id);
        formData.append('question_type', data.question_type);
        formData.append('question_text', data.question_text);
        if (data.explanation) {
            formData.append('explanation', data.explanation);
        }
        formData.append('difficulty', data.difficulty);
        formData.append('marks', data.marks.toString());
        formData.append('negative_marks', data.negative_marks.toString());
        formData.append('is_active', data.is_active ? '1' : '0');

        if (data.existing_question_image) {
            formData.append('existing_question_image', data.existing_question_image);
        }

        if (data.question_image instanceof File) {
            formData.append('question_image', data.question_image);
        }

        data.options.forEach((option, index) => {
            if (option.id) {
                formData.append(`options[${index}][id]`, option.id);
            }

            formData.append(`options[${index}][option_text]`, option.option_text);
            formData.append(`options[${index}][is_correct]`, option.is_correct ? '1' : '0');

            if (option.existing_option_image) {
                formData.append(`options[${index}][existing_option_image]`, option.existing_option_image);
            }

            if (option.option_image instanceof File) {
                formData.append(`options[${index}][option_image]`, option.option_image);
            }
        });

        materials.forEach((material, index) => {
            formData.append(`materials[${index}][title]`, material.title);
            formData.append(`materials[${index}][file]`, material.file);
        });

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onProgress: (event?: { percentage?: number }) => {
                setSubmissionProgress(Math.round(event?.percentage ?? 0));
            },
            onFinish: () => {
                setIsSubmitting(false);
                setSubmissionProgress(null);
            },
        };

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(route('admin.questions.update', question.id), formData, options);
        } else {
            router.post(route('admin.questions.store'), formData, options);
        }
    };

    const activeDifficulty = DIFFICULTY_OPTIONS.find((option) => option.value === form.watch('difficulty'));

    const questionCoverPreview = questionImagePreview || null;

    const optionTitle = questionType === 'fill_blank'
        ? t('admin.questions.answer_variants', {}, 'Accepted answer variants')
        : t('admin.questions.answer_options', {}, 'Answer options');

    const optionHint = questionType === 'fill_blank'
        ? t('admin.questions.answer_variants_hint', {}, 'Use one or more acceptable responses for the blank field.')
        : t('admin.questions.answer_options_hint', {}, 'Add polished options and mark the correct answer set.');

    return (
        <AdminLayout header={<span>{isEditing ? t('admin.questions.edit', {}, 'Edit Question') : t('admin.questions.build', {}, 'Build Question')}</span>}>
            <Head title={isEditing ? t('admin.questions.edit', {}, 'Edit Question') : t('admin.questions.build', {}, 'Build Question')} />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                {t('admin.questions.bank_label', {}, 'Premium Question Bank')}
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                                {isEditing
                                    ? t('admin.questions.heading_edit', {}, 'Refine your question blueprint')
                                    : t('admin.questions.heading_create', {}, 'Craft a highly interactive question')}
                            </h1>
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin.questions.builder_description', {}, 'Create an interactive question with dynamic answers, media support, and polished authoring controls.')}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {activeDifficulty ? (
                                <Badge variant={activeDifficulty.tone} className="rounded-full px-3 py-1">
                                    {t(`admin.questions.difficulty.${activeDifficulty.value}`, {}, activeDifficulty.label)}
                                </Badge>
                            ) : null}
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                                {t(`admin.questions.types.${questionType}`, {}, questionType.replace('_', ' '))}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.academic_alignment', {}, 'Academic alignment')}</CardTitle>
                                    <CardDescription>{t('admin.questions.academic_alignment_hint', {}, 'Map this question to its subject and chapter before authoring the body.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="subject_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('admin.questions.subject', {}, 'Subject')}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder={t('admin.questions.select_subject', {}, 'Select subject')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subjects.map((subject) => (
                                                            <SelectItem key={subject.id} value={subject.id}>
                                                                {subject.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="chapter_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('admin.questions.chapter', {}, 'Chapter')}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder={t('admin.questions.select_chapter', {}, 'Select chapter')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredChapters.map((chapter) => (
                                                            <SelectItem key={chapter.id} value={chapter.id}>
                                                                {chapter.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.type_title', {}, 'Question type')}</CardTitle>
                                    <CardDescription>{t('admin.questions.type_hint', {}, 'Choose the interaction pattern that best fits the assessment objective.')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="question_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <QuestionTypeBadgePicker value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.body_title', {}, 'Question body')}</CardTitle>
                                    <CardDescription>{t('admin.questions.body_hint', {}, 'Use rich formatting to create polished premium questions.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="question_text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('admin.questions.question_body', {}, 'Question body')}</FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder={t('admin.questions.question_body_placeholder', {}, 'Write the question statement, add lists, and emphasize key instructions...')}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="explanation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('admin.questions.explanation', {}, 'Explanation')}</FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        value={field.value ?? ''}
                                                        onChange={field.onChange}
                                                        placeholder={t('admin.questions.explanation_placeholder', {}, 'Explain the rationale shown after the exam...')}
                                                        minHeightClassName="min-h-[180px]"
                                                    />
                                                </FormControl>
                                                <FormDescription>{t('admin.questions.explanation_helper', {}, 'Learners see this after reviewing the answer key.')}</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <CardTitle>{optionTitle}</CardTitle>
                                        <CardDescription>{optionHint}</CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="rounded-xl"
                                        onClick={() => append(createEmptyOption())}
                                        disabled={questionType === 'true_false'}
                                    >
                                        <Plus className="h-4 w-4" />
                                        {questionType === 'fill_blank'
                                            ? t('admin.questions.add_answer_variant', {}, 'Add accepted answer')
                                            : t('admin.questions.add_option', {}, 'Add option')}
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {fields.map((field, index) => {
                                            const currentOption = watchedOptions[index];
                                            const previewKey = field.id;
                                            const preview = optionImagePreviews[previewKey]
                                                ?? question?.options?.find((option) => option.id === currentOption?.id)?.option_image
                                                ?? null;

                                            return (
                                                <motion.div
                                                    key={field.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -18, scale: 0.98 }}
                                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                                    className={cn(
                                                        'rounded-3xl border p-4 shadow-sm transition-colors',
                                                        currentOption?.is_correct
                                                            ? 'border-primary/30 bg-primary/5'
                                                            : 'border-border/60 bg-background',
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                                                        <div className="flex items-start gap-3">
                                                            <div className="rounded-2xl bg-muted/70 p-2 text-muted-foreground">
                                                                <GripVertical className="h-4 w-4" />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleCorrect(index)}
                                                                className={cn(
                                                                    'mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all',
                                                                    currentOption?.is_correct
                                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary',
                                                                )}
                                                                aria-label={singleSelectAnswers
                                                                    ? t('admin.questions.mark_single_correct', {}, 'Mark as the correct answer')
                                                                    : t('admin.questions.toggle_correct', {}, 'Toggle correct answer')}
                                                            >
                                                                {currentOption?.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                                            </button>
                                                        </div>

                                                        <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
                                                            <FormField
                                                                control={form.control}
                                                                name={`options.${index}.option_text` as const}
                                                                render={({ field: optionField }) => (
                                                                    <FormItem>
                                                                        <FormLabel>
                                                                            {questionType === 'fill_blank'
                                                                                ? t('admin.questions.accepted_answer_label', {}, 'Accepted answer')
                                                                                : t('admin.questions.option_label', { index: index + 1 }, `Option ${index + 1}`)}
                                                                        </FormLabel>
                                                                        <FormControl>
                                                                            <Textarea
                                                                                {...optionField}
                                                                                placeholder={questionType === 'fill_blank'
                                                                                    ? t('admin.questions.accepted_answer_placeholder', {}, 'Type an acceptable blank response')
                                                                                    : t('admin.questions.option_placeholder', { index: index + 1 }, `Write option ${index + 1}`)}
                                                                                className="min-h-[120px] rounded-2xl"
                                                                                disabled={questionType === 'true_false'}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <div className="space-y-3">
                                                                <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/10">
                                                                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted/20">
                                                                        {preview ? (
                                                                            <img src={preview} alt={currentOption?.option_text || `Option ${index + 1}`} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                                                                <ImagePlus className="h-8 w-8" />
                                                                                <span className="px-4 text-xs leading-5">
                                                                                    {t('admin.questions.option_media_placeholder', {}, 'Optional supportive image')}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 border-t border-border/60 p-3">
                                                                        <label className="flex-1">
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                className="hidden"
                                                                                onChange={(event) => handleOptionImageChange(index, event.target.files?.[0])}
                                                                            />
                                                                            <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent">
                                                                                <ImagePlus className="h-4 w-4" />
                                                                                {t('admin.questions.add_image', {}, 'Add image')}
                                                                            </span>
                                                                        </label>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="rounded-xl text-muted-foreground hover:text-destructive"
                                                                            onClick={() => handleOptionImageChange(index)}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            <span className="sr-only">{t('common.remove', {}, 'Remove')}</span>
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    className="w-full rounded-xl text-muted-foreground hover:text-destructive"
                                                                    onClick={() => remove(index)}
                                                                    disabled={fields.length <= 2 || questionType === 'true_false'}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    {t('admin.questions.remove_option', {}, 'Remove option')}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    {typeof form.formState.errors.options?.message === 'string' ? (
                                        <p className="text-sm font-medium text-destructive">{form.formState.errors.options.message}</p>
                                    ) : null}
                                </CardContent>
                            </Card>

                            <MaterialDropzone
                                items={materials}
                                onFilesSelected={addMaterialFiles}
                                onRemove={removeMaterialFile}
                                disabled={isSubmitting}
                                overallProgress={submissionProgress}
                            />
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.meta_title', {}, 'Question settings')}</CardTitle>
                                    <CardDescription>{t('admin.questions.meta_hint', {}, 'Adjust difficulty, scoring, and publishing controls.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('admin.questions.difficulty_label', {}, 'Difficulty')}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="rounded-xl">
                                                            <SelectValue placeholder={t('admin.questions.select_difficulty', {}, 'Select difficulty')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                                                            <SelectItem key={difficulty.value} value={difficulty.value}>
                                                                {t(`admin.questions.difficulty.${difficulty.value}`, {}, difficulty.label)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="marks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('admin.questions.marks', {}, 'Marks')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.5" min={0} {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="negative_marks"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{t('admin.questions.negative_marks', {}, 'Negative marks')}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.5" min={0} {...field} className="rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="rounded-2xl border border-border/60 bg-muted/10 p-4">
                                                <div className="flex items-start gap-3">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} className="mt-1" />
                                                    </FormControl>
                                                    <div className="space-y-1">
                                                        <FormLabel className="text-sm">{t('admin.questions.publish_now', {}, 'Keep question active')}</FormLabel>
                                                        <FormDescription>{t('admin.questions.publish_helper', {}, 'Active questions are ready for exam builders and question banks.')}</FormDescription>
                                                    </div>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-border/60 shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.cover_title', {}, 'Question visual')}</CardTitle>
                                    <CardDescription>{t('admin.questions.cover_hint', {}, 'Optional hero image shown with the question stem.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="overflow-hidden rounded-3xl border border-dashed border-border bg-muted/10">
                                        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/20">
                                            {questionCoverPreview ? (
                                                <img src={questionCoverPreview} alt={t('admin.questions.cover_preview', {}, 'Question visual preview')} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 px-6 text-center text-muted-foreground">
                                                    <ImagePlus className="h-10 w-10" />
                                                    <p className="text-sm leading-6">{t('admin.questions.cover_empty', {}, 'Upload a supporting visual to make the question more engaging.')}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 border-t border-border/60 p-4">
                                            <label className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(event) => setQuestionImageFile(event.target.files?.[0])}
                                                />
                                                <span className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent">
                                                    <ImagePlus className="h-4 w-4" />
                                                    {t('admin.questions.upload_cover', {}, 'Upload image')}
                                                </span>
                                            </label>
                                            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive" onClick={() => setQuestionImageFile()}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">{t('common.remove', {}, 'Remove')}</span>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
                                <CardHeader>
                                    <CardTitle>{t('admin.questions.insights_title', {}, 'Builder insights')}</CardTitle>
                                    <CardDescription>{t('admin.questions.insights_hint', {}, 'Keep each question premium, clear, and exam-ready.')}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm text-muted-foreground">
                                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                            <Target className="h-4 w-4 text-primary" />
                                            {t('admin.questions.tip_alignment_title', {}, 'Strong alignment')}
                                        </div>
                                        <p className="leading-6">{t('admin.questions.tip_alignment_body', {}, 'Keep the question tightly aligned to a single chapter objective for easier analytics and exam composition.')}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                            <Layers3 className="h-4 w-4 text-primary" />
                                            {t('admin.questions.tip_options_title', {}, 'Polished options')}
                                        </div>
                                        <p className="leading-6">{t('admin.questions.tip_options_body', {}, 'Use short, balanced option lengths and attach visuals only when they truly support the answer choice.')}</p>
                                    </div>
                                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                                        <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            {t('admin.questions.tip_review_title', {}, 'Ready for review')}
                                        </div>
                                        <p className="leading-6">{t('admin.questions.tip_review_body', {}, 'Explanations and media are submitted with the builder UI, while advanced material persistence can be wired to the backend when needed.')}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-background p-4 shadow-sm">
                                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-2xl">
                                    <Save className="h-4 w-4" />
                                    {isSubmitting
                                        ? t('admin.questions.saving', {}, 'Saving question...')
                                        : isEditing
                                            ? t('admin.questions.save_changes', {}, 'Save changes')
                                            : t('admin.questions.save_question', {}, 'Save question')}
                                </Button>
                                <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={() => router.visit(route('admin.questions.index'))}>
                                    {t('common.cancel', {}, 'Cancel')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </AdminLayout>
    );
}
