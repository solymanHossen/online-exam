import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import {
    Bookmark,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDot,
    Clock3,
    Flag,
    LoaderCircle,
    Maximize2,
    PanelRightOpen,
    Save,
    SendHorizontal,
    ShieldAlert,
    Sparkles,
    WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent } from '@/Components/ui/Card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/Dialog';
import { ScrollArea } from '@/Components/ui/ScrollArea';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/ui/Sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { ExamAttemptDTO, ExamDTO, ExamOption, ExamQuestionNode } from '@/types/models';

interface ExamRoomProps {
    exam: ExamDTO;
    attempt: ExamAttemptDTO;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

type SubmitDialogState = {
    open: boolean;
    forced: boolean;
    reason?: string;
};

function sanitizeHtml(value: string) {
    return DOMPurify.sanitize(value);
}

export default function ExamRoom({ exam, attempt }: ExamRoomProps) {
    const { t } = useTranslation();
    const localKey = `exam_answers_${attempt.id}`;
    const reviewKey = `exam_review_${attempt.id}`;

    const calculateTimeLeft = useCallback(() => {
        const end = new Date(attempt.end_time).getTime();
        const now = Date.now();
        const diff = Math.floor((end - now) / 1000);

        return diff > 0 ? diff : 0;
    }, [attempt.end_time]);

    const getInitialAnswers = useCallback(() => {
        const serverAnswers: Record<string, string> = {};

        attempt.answers?.forEach((answer) => {
            if (answer.selected_option_id) {
                serverAnswers[answer.question_id] = answer.selected_option_id;
            }
        });

        if (typeof window === 'undefined') {
            return serverAnswers;
        }

        try {
            const localAnswers = localStorage.getItem(localKey);
            return localAnswers
                ? { ...serverAnswers, ...(JSON.parse(localAnswers) as Record<string, string>) }
                : serverAnswers;
        } catch {
            return serverAnswers;
        }
    }, [attempt.answers, localKey]);

    const getInitialReviewState = useCallback(() => {
        if (typeof window === 'undefined') {
            return [] as string[];
        }

        try {
            const stored = localStorage.getItem(reviewKey);
            return stored ? (JSON.parse(stored) as string[]) : [];
        } catch {
            return [] as string[];
        }
    }, [reviewKey]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>(getInitialAnswers);
    const [markedForReview, setMarkedForReview] = useState<string[]>(getInitialReviewState);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [warningCount, setWarningCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
    const [submitDialog, setSubmitDialog] = useState<SubmitDialogState>({ open: false, forced: false });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoSubmitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const forcedSubmitTriggeredRef = useRef(false);
    const pendingAnswersRef = useRef<Record<string, string>>({});

    const questions: ExamQuestionNode[] = useMemo(() => exam.questions ?? [], [exam.questions]);
    const currentQuestionDetail = useMemo(
        () => questions[currentQuestionIndex]?.question,
        [currentQuestionIndex, questions],
    );

    const persistLocalState = useCallback((nextAnswers: Record<string, string>, nextMarked: string[]) => {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.setItem(localKey, JSON.stringify(nextAnswers));
        localStorage.setItem(reviewKey, JSON.stringify(nextMarked));
    }, [localKey, reviewKey]);

    const saveAnswerInBackground = useCallback(async (questionId: string, optionId: string) => {
        if (isSubmitting) {
            return;
        }

        if (isOffline) {
            pendingAnswersRef.current[questionId] = optionId;
            setSaveStatus('offline');
            return;
        }

        setSaveStatus('saving');

        try {
            await axios.post(route('student.attempts.save-answer', attempt.id), {
                question_id: questionId,
                selected_option_id: optionId,
            });

            delete pendingAnswersRef.current[questionId];
            setLastSavedAt(new Date().toLocaleTimeString());
            setSaveStatus('saved');
        } catch {
            pendingAnswersRef.current[questionId] = optionId;
            setSaveStatus('error');
        }
    }, [attempt.id, isOffline, isSubmitting]);

    const submitAttempt = useCallback(() => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        if (autoSubmitTimeoutRef.current) {
            clearTimeout(autoSubmitTimeoutRef.current);
        }

        localStorage.removeItem(localKey);
        localStorage.removeItem(reviewKey);

        router.post(route('student.attempts.submit', attempt.id), {}, {
            onFinish: () => setIsSubmitting(false),
        });
    }, [attempt.id, isSubmitting, localKey, reviewKey]);

    useEffect(() => {
        const keepAliveInterval = setInterval(() => {
            axios.get('/sanctum/csrf-cookie').catch(() => {});
        }, 15 * 60 * 1000);

        return () => clearInterval(keepAliveInterval);
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);

            const pendingEntries = Object.entries(pendingAnswersRef.current);
            if (pendingEntries.length === 0) {
                setSaveStatus('saved');
                return;
            }

            pendingEntries.forEach(([questionId, optionId]) => {
                void saveAnswerInBackground(questionId, optionId);
            });
        };

        const handleOffline = () => {
            setIsOffline(true);
            setSaveStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [saveAnswerInBackground]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [calculateTimeLeft]);

    useEffect(() => {
        if (timeLeft === 0 && !isSubmitting && !forcedSubmitTriggeredRef.current) {
            forcedSubmitTriggeredRef.current = true;
            setSubmitDialog({
                open: true,
                forced: true,
                reason: t(
                    'student.exam_room.auto_submit_time_expired',
                    {},
                    'Time has expired. Your exam is being submitted automatically.',
                ),
            });
        }
    }, [isSubmitting, t, timeLeft]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting && timeLeft > 0) {
                setWarningCount((previous) => {
                    const next = previous + 1;

                    if (next >= 3) {
                        setSubmitDialog({
                            open: true,
                            forced: true,
                            reason: t(
                                'student.exam_room.auto_submit_security',
                                {},
                                'Anti-cheat enforcement triggered automatic submission.',
                            ),
                        });
                    } else {
                        setShowWarningModal(true);
                    }

                    return next;
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isSubmitting, t, timeLeft]);

    useEffect(() => {
        if (!submitDialog.open || !submitDialog.forced || isSubmitting) {
            return;
        }

        autoSubmitTimeoutRef.current = setTimeout(() => {
            submitAttempt();
        }, 1200);

        return () => {
            if (autoSubmitTimeoutRef.current) {
                clearTimeout(autoSubmitTimeoutRef.current);
            }
        };
    }, [isSubmitting, submitAttempt, submitDialog]);

    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (autoSubmitTimeoutRef.current) {
                clearTimeout(autoSubmitTimeoutRef.current);
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const requestFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen?.();
        } catch {
            // no-op
        }
    };

    const handleOptionSelect = (questionId: string, optionId: string) => {
        if (isSubmitting) {
            return;
        }

        const nextAnswers = { ...answers, [questionId]: optionId };
        setAnswers(nextAnswers);
        persistLocalState(nextAnswers, markedForReview);

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            void saveAnswerInBackground(questionId, optionId);
        }, 700);
    };

    const handleToggleReview = () => {
        if (!currentQuestionDetail) {
            return;
        }

        const questionId = currentQuestionDetail.id;
        const nextMarked = markedForReview.includes(questionId)
            ? markedForReview.filter((id) => id !== questionId)
            : [...markedForReview, questionId];

        setMarkedForReview(nextMarked);
        persistLocalState(answers, nextMarked);
    };

    const openSubmitDialog = () => {
        setSubmitDialog({
            open: true,
            forced: false,
            reason: t(
                'student.exam_room.submit_reason',
                {},
                'This action will finalize your attempt and submit all saved answers.',
            ),
        });
    };

    if (!currentQuestionDetail) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-500">
                {t('student.exam_room.loading', {}, 'Loading exam room…')}
            </div>
        );
    }

    const isTimerCritical = timeLeft < 300 && timeLeft > 0;
    const answeredCount = Object.keys(answers).length;
    const reviewCount = markedForReview.length;
    const unansweredCount = Math.max(questions.length - answeredCount, 0);
    const isCurrentMarked = markedForReview.includes(currentQuestionDetail.id);

    const saveStatusLabel = {
        idle: t('student.exam_room.save_ready', {}, 'Ready'),
        saving: t('student.exam_room.save_saving', {}, 'Saving answer…'),
        saved: lastSavedAt
            ? t('student.exam_room.save_saved_at', { time: lastSavedAt }, `Saved at ${lastSavedAt}`)
            : t('student.exam_room.save_saved', {}, 'All changes saved'),
        offline: t('student.exam_room.save_offline', {}, 'Offline: changes queued locally'),
        error: t('student.exam_room.save_error', {}, 'Save failed. Will retry.'),
    }[saveStatus];

    const getQuestionStatus = (questionId: string) => {
        if (markedForReview.includes(questionId)) {
            return 'review';
        }

        if (answers[questionId]) {
            return 'answered';
        }

        return 'unattempted';
    };

    const submitSummary = [
        {
            label: t('student.exam_room.summary_answered', {}, 'Answered'),
            value: answeredCount,
            tone: 'text-emerald-600',
        },
        {
            label: t('student.exam_room.summary_review', {}, 'Marked for review'),
            value: reviewCount,
            tone: 'text-amber-600',
        },
        {
            label: t('student.exam_room.summary_unanswered', {}, 'Unanswered'),
            value: unansweredCount,
            tone: 'text-slate-500',
        },
    ];

    const navigatorContent = (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {t('student.exam_room.navigator_title', {}, 'Question Navigator')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('student.exam_room.navigator_description', {}, 'Jump instantly to any question in the paper.')}
                    </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                    {answeredCount}/{questions.length}
                </Badge>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 xl:grid-cols-5">
                {questions.map((question, index) => {
                    const status = getQuestionStatus(question.question.id);
                    const isCurrent = currentQuestionIndex === index;

                    return (
                        <button
                            key={question.question.id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={cn(
                                'aspect-square rounded-2xl border text-sm font-semibold transition-all duration-200',
                                status === 'answered' && 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                                status === 'review' && 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100',
                                status === 'unattempted' && 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                                isCurrent && 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2',
                            )}
                            aria-label={t('student.exam_room.go_to_question', { number: index + 1 }, `Go to question ${index + 1}`)}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            <div className="rounded-3xl border border-border/60 bg-muted/10 p-4">
                <div className="space-y-3 text-sm">
                    {[
                        {
                            label: t('student.exam_room.legend_unattempted', {}, 'Unattempted'),
                            value: unansweredCount,
                            swatch: 'bg-slate-300',
                        },
                        {
                            label: t('student.exam_room.legend_answered', {}, 'Answered'),
                            value: answeredCount,
                            swatch: 'bg-emerald-500',
                        },
                        {
                            label: t('student.exam_room.legend_review', {}, 'Marked for Review'),
                            value: reviewCount,
                            swatch: 'bg-amber-500',
                        },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className={cn('h-3 w-3 rounded-full', item.swatch)} />
                                <span className="font-medium text-foreground">{item.label}</span>
                            </div>
                            <span className="text-muted-foreground">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_26%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] text-foreground select-none">
            <Head title={t('student.exam_room.head_title', { title: exam.title }, `Exam Room - ${exam.title}`)} />

            <Dialog open={showWarningModal} onOpenChange={(open) => open && setShowWarningModal(true)}>
                <DialogContent className="rounded-3xl sm:max-w-md [&>button.absolute]:hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 border-b pb-2 text-xl text-red-600">
                            <ShieldAlert className="h-6 w-6" />
                            {t('student.exam_room.warning_title', {}, 'Security Warning: Tab Switch Detected')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-base leading-relaxed text-slate-700">
                            {t(
                                'student.exam_room.warning_body',
                                {},
                                'You switched tabs or left the exam window. This is treated as a strict exam environment warning.',
                            )}
                            <br />
                            <br />
                            <span className="font-semibold text-red-600">
                                {t('student.exam_room.warning_count', { count: warningCount }, `Warning ${warningCount} of 3.`)}
                            </span>{' '}
                            {t(
                                'student.exam_room.warning_after',
                                {},
                                'After 3 warnings, your exam will be submitted automatically.',
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full rounded-2xl sm:w-auto"
                            onClick={() => setShowWarningModal(false)}
                        >
                            {t('student.exam_room.return_exam', {}, 'Return to Exam')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={submitDialog.open}
                onOpenChange={(open) => !submitDialog.forced && setSubmitDialog((current) => ({ ...current, open }))}
            >
                <DialogContent className="rounded-3xl sm:max-w-xl">
                    <DialogHeader>
                        <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            {submitDialog.forced
                                ? t('student.exam_room.auto_submit_badge', {}, 'Auto submit in progress')
                                : t('student.exam_room.submit_badge', {}, 'Ready to submit')}
                        </div>
                        <DialogTitle className="text-2xl">
                            {submitDialog.forced
                                ? t('student.exam_room.auto_submit_title', {}, 'Submitting your exam')
                                : t('student.exam_room.submit_title', {}, 'Submit exam attempt?')}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6">
                            {submitDialog.reason
                                ?? t(
                                    'student.exam_room.submit_description',
                                    {},
                                    'Review your current progress before sending the final attempt.',
                                )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {submitSummary.map((item) => (
                            <Card key={item.label} className="rounded-3xl border-border/60 shadow-sm">
                                <CardContent className="p-5">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                                    <p className={cn('mt-2 text-2xl font-semibold', item.tone)}>{item.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <DialogFooter className="gap-3">
                        {!submitDialog.forced ? (
                            <Button
                                variant="outline"
                                className="rounded-2xl"
                                onClick={() => setSubmitDialog({ open: false, forced: false })}
                            >
                                {t('student.exam_room.continue_exam', {}, 'Continue Exam')}
                            </Button>
                        ) : null}
                        <Button className="rounded-2xl" onClick={submitAttempt} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <SendHorizontal className="h-4 w-4" />
                            )}
                            {submitDialog.forced
                                ? t('student.exam_room.submitting_now', {}, 'Submitting now…')
                                : t('student.exam_room.confirm_submit', {}, 'Confirm Submit')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-col">
                <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {t('student.exam_room.banner', {}, 'Distraction-free live exam room')}
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{exam.title}</h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                        {t('student.exam_room.questions_count', { count: questions.length }, `${questions.length} questions`)}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {exam.negative_enabled
                                            ? t('student.exam_room.negative_on', {}, 'Negative marking enabled')
                                            : t('student.exam_room.negative_off', {}, 'No negative marking')}
                                    </span>
                                </div>
                                {isOffline ? (
                                    <div className="mt-2 flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm animate-pulse">
                                        <WifiOff size={14} />
                                        {t('student.exam_room.offline_mode', {}, 'Offline Mode - Answers saved locally')}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                                    {saveStatus === 'saving' ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <Save className="h-4 w-4 text-primary" />
                                    )}
                                    <span>{saveStatusLabel}</span>
                                </div>

                                <div
                                    className={cn(
                                        'inline-flex items-center gap-3 rounded-full border px-5 py-3 font-mono text-xl font-bold shadow-sm transition-all',
                                        isTimerCritical
                                            ? 'animate-pulse border-red-200 bg-red-50 text-red-600'
                                            : 'border-border/60 bg-white text-slate-800',
                                    )}
                                >
                                    <Clock3 className={cn('h-5 w-5', isTimerCritical ? 'text-red-500' : 'text-primary')} />
                                    {timeLeft <= 0 ? '00:00' : formatTime(timeLeft)}
                                </div>

                                <Button type="button" variant="outline" className="rounded-full" onClick={() => void requestFullscreen()}>
                                    <Maximize2 className="h-4 w-4" />
                                    {t('student.exam_room.fullscreen', {}, 'Fullscreen')}
                                </Button>

                                <div className="xl:hidden">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button type="button" variant="outline" className="rounded-full">
                                                <PanelRightOpen className="h-4 w-4" />
                                                {t('student.exam_room.navigator_button', {}, 'Navigator')}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-full sm:max-w-md">
                                            <SheetHeader className="mb-6 border-b border-border/60 pb-4 text-left">
                                                <SheetTitle>{t('student.exam_room.navigator_title', {}, 'Question Navigator')}</SheetTitle>
                                                <SheetDescription>
                                                    {t('student.exam_room.navigator_sheet', {}, 'Jump across questions without breaking focus.')}
                                                </SheetDescription>
                                            </SheetHeader>
                                            {navigatorContent}
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </div>

                        <div className="grid items-center gap-3 rounded-[28px] border border-white/60 bg-white/60 p-4 shadow-sm sm:grid-cols-3">
                            <div className="space-y-1 rounded-3xl border border-border/60 bg-white px-4 py-3 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('student.exam_room.progress_label', {}, 'Progress')}
                                </p>
                                <p className="text-lg font-semibold text-foreground">
                                    {t('student.exam_room.progress_value', { count: answeredCount }, `${answeredCount} answered`)}
                                </p>
                            </div>
                            <div className="space-y-1 rounded-3xl border border-border/60 bg-white px-4 py-3 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('student.exam_room.review_label', {}, 'Review queue')}
                                </p>
                                <p className="text-lg font-semibold text-amber-600">
                                    {t('student.exam_room.review_value', { count: reviewCount }, `${reviewCount} marked`)}
                                </p>
                            </div>
                            <div className="space-y-1 rounded-3xl border border-border/60 bg-white px-4 py-3 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                    {t('student.exam_room.remaining_label', {}, 'Remaining')}
                                </p>
                                <p className="text-lg font-semibold text-slate-700">
                                    {t('student.exam_room.remaining_value', { count: unansweredCount }, `${unansweredCount} unanswered`)}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto grid h-[calc(100vh-176px)] max-w-[1600px] flex-1 grid-cols-1 gap-6 overflow-hidden px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:px-8">
                    <section className="overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                        <div className="flex h-full flex-col">
                            <div className="border-b border-border/60 bg-slate-50/70 px-5 py-5 sm:px-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                                            {t('student.exam_room.question_label', { number: currentQuestionIndex + 1 }, `Question ${currentQuestionIndex + 1}`)}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {t('student.exam_room.question_description', {}, 'Read carefully and select the best answer.')}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="rounded-full px-3 py-1">
                                            +{currentQuestionDetail.marks}{' '}
                                            {t('student.exam_room.marks', {}, 'marks')}
                                        </Badge>
                                        {exam.negative_enabled ? (
                                            <Badge variant="outline" className="rounded-full border-red-200 px-3 py-1 text-red-600">
                                                -{currentQuestionDetail.negative_marks} {t('student.exam_room.negative_marks', {}, 'negative')}
                                            </Badge>
                                        ) : null}
                                        <Button
                                            type="button"
                                            variant={isCurrentMarked ? 'default' : 'outline'}
                                            className="rounded-full"
                                            onClick={handleToggleReview}
                                        >
                                            {isCurrentMarked ? <Flag className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                                            {isCurrentMarked
                                                ? t('student.exam_room.marked', {}, 'Marked for Review')
                                                : t('student.exam_room.mark', {}, 'Mark for Review')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-8 p-5 sm:p-8 lg:p-10">
                                    <div className="space-y-6">
                                        <div
                                            className="question-editor prose prose-slate max-w-none text-lg leading-9 text-slate-900 prose-headings:tracking-tight prose-p:leading-9"
                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentQuestionDetail.question_text) }}
                                        />

                                        {currentQuestionDetail.question_image ? (
                                            <div className="overflow-hidden rounded-[28px] border border-border/60 bg-slate-50 p-3 shadow-sm">
                                                <img
                                                    src={currentQuestionDetail.question_image}
                                                    alt={t('student.exam_room.question_image', {}, 'Question visual')}
                                                    className="max-h-[420px] w-full rounded-[20px] object-contain"
                                                    draggable="false"
                                                />
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="grid gap-4">
                                        {currentQuestionDetail.options.map((option: ExamOption, index: number) => {
                                            const isSelected = answers[currentQuestionDetail.id] === option.id;
                                            const optionLabel = String.fromCharCode(65 + index);

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => handleOptionSelect(currentQuestionDetail.id, option.id)}
                                                    disabled={isSubmitting}
                                                    className={cn(
                                                        'group relative flex w-full items-start gap-4 rounded-[28px] border-2 p-4 text-left transition-all duration-200 sm:p-5',
                                                        isSelected
                                                            ? 'border-primary bg-primary/[0.06] shadow-[0_20px_60px_-28px_rgba(79,70,229,0.6)]'
                                                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-primary/30 hover:bg-slate-50',
                                                    )}
                                                    aria-pressed={isSelected}
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-base font-semibold transition-all',
                                                            isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground'
                                                                : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-primary/20 group-hover:text-primary',
                                                        )}
                                                    >
                                                        {isSelected ? <CircleDot className="h-5 w-5" /> : optionLabel}
                                                    </div>

                                                    <div className="min-w-0 flex-1 space-y-4">
                                                        {option.option_image ? (
                                                            <div className="overflow-hidden rounded-2xl border border-border/60 bg-slate-50 p-2">
                                                                <img
                                                                    src={option.option_image}
                                                                    alt={t('student.exam_room.option_image', { label: optionLabel }, `Option ${optionLabel}`)}
                                                                    className="max-h-56 w-full rounded-xl object-contain"
                                                                    draggable="false"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        <div
                                                            className={cn(
                                                                'prose prose-slate max-w-none text-base leading-7 prose-p:my-0 sm:text-lg',
                                                                isSelected ? 'font-semibold text-slate-950' : 'text-slate-700',
                                                            )}
                                                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(option.option_text) }}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </ScrollArea>

                            <div className="border-t border-border/60 bg-slate-50/70 px-5 py-4 sm:px-8">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-2xl"
                                        onClick={() => setCurrentQuestionIndex((previous) => Math.max(0, previous - 1))}
                                        disabled={currentQuestionIndex === 0 || isSubmitting}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        {t('student.exam_room.previous', {}, 'Previous')}
                                    </Button>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <Button
                                                type="button"
                                                className="rounded-2xl"
                                                onClick={() => setCurrentQuestionIndex((previous) => Math.min(questions.length - 1, previous + 1))}
                                                disabled={isSubmitting}
                                            >
                                                {t('student.exam_room.next', {}, 'Next Question')}
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        ) : null}

                                        <Button
                                            type="button"
                                            variant={currentQuestionIndex < questions.length - 1 ? 'outline' : 'default'}
                                            className="rounded-2xl"
                                            onClick={openSubmitDialog}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4" />
                                            )}
                                            {t('student.exam_room.submit_exam', {}, 'Submit Exam')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="hidden overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl xl:block">
                        <ScrollArea className="h-full pr-2">{navigatorContent}</ScrollArea>
                    </aside>
                </div>
            </div>
        </div>
    );
}
