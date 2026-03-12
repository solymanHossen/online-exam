import { Link, useForm } from '@inertiajs/react';
import { FileStack, LoaderCircle, Save } from 'lucide-react';

import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import { Textarea } from '@/Components/ui/Textarea';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter, Subject } from '@/types/models';

export interface ChapterFormData {
    subject_id: string;
    name: string;
    order: string;
    description: string;
}

interface ChapterFormProps {
    chapter?: Chapter;
    subjects: Subject[];
    submitRoute: string;
    submitMethod: 'post' | 'put';
    title: string;
    description: string;
    submitLabel: string;
    cancelHref: string;
}

function getInitialData(chapter?: Chapter): ChapterFormData {
    return {
        subject_id: chapter?.subject_id ?? chapter?.subject?.id ?? '',
        name: chapter?.name ?? '',
        order: chapter?.order ? String(chapter.order) : '1',
        description: chapter?.description ?? '',
    };
}

export function ChapterForm({
    chapter,
    subjects,
    submitRoute,
    submitMethod,
    title,
    description,
    submitLabel,
    cancelHref,
}: ChapterFormProps) {
    const { t } = useTranslation();
    const form = useForm<ChapterFormData>(getInitialData(chapter));

    const validate = () => {
        let isValid = true;
        form.clearErrors();

        if (form.data.subject_id.trim().length === 0) {
            form.setError('subject_id', t('admin.chapters.validation.subject', {}, 'Select a subject.'));
            isValid = false;
        }

        if (form.data.name.trim().length < 2) {
            form.setError('name', t('admin.chapters.validation.name', {}, 'Chapter name must be at least 2 characters.'));
            isValid = false;
        }

        const orderValue = Number(form.data.order);
        if (Number.isNaN(orderValue) || orderValue < 1) {
            form.setError('order', t('admin.chapters.validation.order', {}, 'Order must be at least 1.'));
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        if (submitMethod === 'post') {
            form.post(submitRoute);
            return;
        }

        form.put(submitRoute);
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('admin.chapters.fields.subject', {}, 'Subject')}</Label>
                            <Select
                                value={form.data.subject_id}
                                onValueChange={(value) => form.setData('subject_id', value)}
                                disabled={form.processing}
                            >
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder={t('admin.chapters.placeholders.subject', {}, 'Choose a subject')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.subject_id ? <p className="text-sm text-destructive">{form.errors.subject_id}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chapter-name">{t('admin.chapters.fields.name', {}, 'Chapter name')}</Label>
                            <Input
                                id="chapter-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder={t('admin.chapters.placeholders.name', {}, 'e.g. Differential Equations')}
                                className="rounded-xl"
                            />
                            {form.errors.name ? <p className="text-sm text-destructive">{form.errors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="chapter-order">{t('admin.chapters.fields.order', {}, 'Display order')}</Label>
                            <Input
                                id="chapter-order"
                                type="number"
                                min={1}
                                value={form.data.order}
                                onChange={(event) => form.setData('order', event.target.value)}
                                placeholder={t('admin.chapters.placeholders.order', {}, '1')}
                                className="rounded-xl"
                            />
                            {form.errors.order ? <p className="text-sm text-destructive">{form.errors.order}</p> : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="chapter-description">{t('admin.chapters.fields.description', {}, 'Description')}</Label>
                            <Textarea
                                id="chapter-description"
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                placeholder={t('admin.chapters.placeholders.description', {}, 'Add a concise summary or syllabus scope for this chapter.')}
                                className="min-h-32 rounded-xl"
                            />
                            {form.errors.description ? <p className="text-sm text-destructive">{form.errors.description}</p> : null}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href={cancelHref}>{t('common.cancel', {}, 'Cancel')}</Link>
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={form.processing} className="rounded-xl">
                            {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <FileStack className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{t('admin.chapters.sidebar.title', {}, 'Hierarchy guidance')}</CardTitle>
                            <CardDescription>{t('admin.chapters.sidebar.description', {}, 'Order chapters thoughtfully to present a premium syllabus flow.')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 leading-6">
                        {t('admin.chapters.sidebar.tip_1', {}, 'Keep chapter names concise and use descriptions for deeper learning context.')}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 leading-6">
                        {t('admin.chapters.sidebar.tip_2', {}, 'Display order helps keep the nested subject tree predictable for instructors and students.')}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
