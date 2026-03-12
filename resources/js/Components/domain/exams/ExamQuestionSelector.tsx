import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, CheckCircle2, Search, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { ScrollArea } from '@/Components/ui/ScrollArea';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { Chapter, ExamBuilderQuestion, Subject } from '@/types/models';

interface ExamQuestionSelectorProps {
    questions: ExamBuilderQuestion[];
    subjects: Pick<Subject, 'id' | 'name' | 'code'>[];
    chapters: Pick<Chapter, 'id' | 'name' | 'subject_id'>[];
    selectedQuestionIds: string[];
    search: string;
    selectedSubjectId: string;
    selectedChapterId: string;
    onSearchChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onChapterChange: (value: string) => void;
    onAddQuestion: (questionId: string) => void;
    onRemoveQuestion: (questionId: string) => void;
    onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
    onAddAllFiltered: () => void;
    onClearAll: () => void;
}

function stripHtml(value: string) {
    return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function getDifficultyVariant(difficulty: string): 'secondary' | 'outline' | 'destructive' {
    switch (difficulty) {
        case 'easy':
            return 'secondary';
        case 'hard':
            return 'destructive';
        default:
            return 'outline';
    }
}

export function ExamQuestionSelector({
    questions,
    subjects,
    chapters,
    selectedQuestionIds,
    search,
    selectedSubjectId,
    selectedChapterId,
    onSearchChange,
    onSubjectChange,
    onChapterChange,
    onAddQuestion,
    onRemoveQuestion,
    onMoveQuestion,
    onAddAllFiltered,
    onClearAll,
}: ExamQuestionSelectorProps) {
    const { t } = useTranslation();

    const selectedQuestions = useMemo(() => {
        const questionMap = new Map(questions.map((question) => [question.id, question]));

        return selectedQuestionIds
            .map((questionId) => questionMap.get(questionId))
            .filter((question): question is ExamBuilderQuestion => Boolean(question));
    }, [questions, selectedQuestionIds]);

    const availableQuestions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return questions.filter((question) => {
            if (selectedQuestionIds.includes(question.id)) {
                return false;
            }

            if (selectedSubjectId && question.subject?.id !== selectedSubjectId) {
                return false;
            }

            if (selectedChapterId && question.chapter?.id !== selectedChapterId) {
                return false;
            }

            if (!query) {
                return true;
            }

            const haystack = `${stripHtml(question.question_text)} ${question.subject?.name ?? ''} ${question.chapter?.name ?? ''}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [questions, search, selectedChapterId, selectedQuestionIds, selectedSubjectId]);

    const filteredChapters = useMemo(() => {
        if (!selectedSubjectId) {
            return chapters;
        }

        return chapters.filter((chapter) => chapter.subject_id === selectedSubjectId);
    }, [chapters, selectedSubjectId]);

    const selectedMarks = useMemo(() => {
        return selectedQuestions.reduce((sum, question) => sum + Number(question.marks ?? 0), 0);
    }, [selectedQuestions]);

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-start">
            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle>{t('admin.exams.questions.bank_title', {}, 'Question bank')}</CardTitle>
                    <CardDescription>{t('admin.exams.questions.bank_hint', {}, 'Filter by subject or chapter and send questions into the exam bucket.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder={t('admin.exams.questions.search', {}, 'Search questions, subjects, or chapters')}
                                className="rounded-xl pl-10"
                            />
                        </div>
                        <Select value={selectedSubjectId || '__all__'} onValueChange={(value) => onSubjectChange(value === '__all__' ? '' : value)}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={t('admin.exams.questions.subject_filter', {}, 'All subjects')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">{t('common.all', {}, 'All')}</SelectItem>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedChapterId || '__all__'} onValueChange={(value) => onChapterChange(value === '__all__' ? '' : value)}>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder={t('admin.exams.questions.chapter_filter', {}, 'All chapters')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">{t('common.all', {}, 'All')}</SelectItem>
                                {filteredChapters.map((chapter) => (
                                    <SelectItem key={chapter.id} value={chapter.id}>
                                        {chapter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <ScrollArea className="h-[520px] rounded-3xl border border-border/60 bg-muted/10 p-3">
                        <div className="space-y-3">
                            {availableQuestions.length > 0 ? availableQuestions.map((question) => (
                                <button
                                    key={question.id}
                                    type="button"
                                    onClick={() => onAddQuestion(question.id)}
                                    className="group w-full rounded-2xl border border-border/60 bg-background p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant={getDifficultyVariant(question.difficulty)} className="rounded-full px-2.5 py-0.5">
                                                    {t(`admin.questions.difficulty.${question.difficulty}`, {}, question.difficulty)}
                                                </Badge>
                                                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                                                    {question.subject?.code || question.subject?.name || t('admin.exams.questions.general_subject', {}, 'General')}
                                                </Badge>
                                                {question.chapter?.name ? (
                                                    <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                                                        {question.chapter.name}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <p className="line-clamp-3 text-sm font-medium leading-6 text-foreground">
                                                {stripHtml(question.question_text)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <Badge className="rounded-full px-3 py-1">{question.marks} {t('admin.exams.questions.marks_short', {}, 'marks')}</Badge>
                                            <div className="rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )) : (
                                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/80 px-6 text-center">
                                    <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-semibold text-foreground">{t('admin.exams.questions.empty_bank_title', {}, 'No matching questions')}</p>
                                    <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{t('admin.exams.questions.empty_bank_description', {}, 'Adjust the search or filters to reveal more questions from the bank.')}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center xl:min-h-[640px]">
                <div className="flex w-full flex-row justify-center gap-2 xl:w-auto xl:flex-col">
                    <Button type="button" className="rounded-xl" onClick={onAddAllFiltered} disabled={availableQuestions.length === 0}>
                        <ArrowRight className="h-4 w-4" />
                        {t('admin.exams.questions.add_all', {}, 'Add all')}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onClearAll} disabled={selectedQuestionIds.length === 0}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('admin.exams.questions.clear_all', {}, 'Clear')}
                    </Button>
                </div>
            </div>

            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>{t('admin.exams.questions.selected_title', {}, 'Selected questions')}</CardTitle>
                            <CardDescription>{t('admin.exams.questions.selected_hint', {}, 'Reorder the exam flow and review total marks in real time.')}</CardDescription>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            {selectedQuestionIds.length} {t('admin.exams.questions.selected_count', {}, 'selected')}
                            <span className="text-primary/60">•</span>
                            {selectedMarks} {t('admin.exams.questions.total_marks', {}, 'marks')}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[520px] rounded-3xl border border-border/60 bg-muted/10 p-3">
                        <div className="space-y-3">
                            {selectedQuestions.length > 0 ? selectedQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className={cn(
                                        'group rounded-2xl border border-border/60 bg-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/5',
                                        index === 0 && 'border-primary/20',
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                                                    {question.subject?.code || question.subject?.name || t('admin.exams.questions.general_subject', {}, 'General')}
                                                </Badge>
                                                {question.chapter?.name ? (
                                                    <Badge variant="outline" className="rounded-full px-2.5 py-0.5">
                                                        {question.chapter.name}
                                                    </Badge>
                                                ) : null}
                                                <Badge className="rounded-full px-2.5 py-0.5">{question.marks} {t('admin.exams.questions.marks_short', {}, 'marks')}</Badge>
                                            </div>
                                            <p className="line-clamp-3 text-sm font-medium leading-6 text-foreground">
                                                {stripHtml(question.question_text)}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-2">
                                            <Button type="button" variant="ghost" size="icon" className="rounded-xl" onClick={() => onMoveQuestion(question.id, 'up')} disabled={index === 0}>
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className="rounded-xl" onClick={() => onMoveQuestion(question.id, 'down')} disabled={index === selectedQuestions.length - 1}>
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive" onClick={() => onRemoveQuestion(question.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/80 px-6 text-center">
                                    <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-semibold text-foreground">{t('admin.exams.questions.empty_selected_title', {}, 'No questions assigned')}</p>
                                    <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{t('admin.exams.questions.empty_selected_description', {}, 'Move questions from the bank to build the exam paper.')}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
